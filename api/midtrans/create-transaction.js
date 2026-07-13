// Vercel serverless function: create a Midtrans Snap transaction.
//
// Flow: the authenticated client POSTs { packageName, voucherCode?, accessToken }.
// We verify the Supabase session server-side, read the PRICE from the DB
// (pricing table — never trust an amount sent by the client), validate an
// optional voucher/referral code server-side and compute the discount, then
// create a pending `transactions` row (its uuid is the Midtrans order_id) and
// ask Midtrans for a Snap token. The Server Key stays server-side only.
//
// Environment is controlled by MIDTRANS_IS_PRODUCTION ("true" = production).

import { createClient } from '@supabase/supabase-js'

// Mirror of src/config/constants.js (functions can't import from src on Vercel).
const REFERRAL_DISCOUNT_AMOUNT = 10000 // Rp discount for the buyer
// Fallback prices if the `pricing` table isn't present yet (pre-migration),
// so deploying this never breaks checkout before the DB migration is run.
const DEFAULT_PRICES = { Special: 99000, Adat: 110000, Motion: 140000, Luxury: 175000 }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serverKey || !supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'Server belum dikonfigurasi (env var).' })
    }

    const { packageName, voucherCode, accessToken } = req.body || {}
    if (!packageName) return res.status(400).json({ error: 'Paket tidak valid.' })
    if (!accessToken) return res.status(401).json({ error: 'Tidak terautentikasi.' })

    const supabase = createClient(supabaseUrl, serviceKey)

    // Verify the caller's Supabase session and derive the user from the JWT.
    const { data: userData, error: userErr } = await supabase.auth.getUser(accessToken)
    if (userErr || !userData?.user) {
      return res.status(401).json({ error: 'Sesi tidak valid.' })
    }
    const user = userData.user

    // Authoritative price from the DB (falls back to defaults pre-migration).
    const { data: priceRow } = await supabase.from('pricing').select('price').eq('category', packageName).maybeSingle()
    const basePrice = priceRow?.price ?? DEFAULT_PRICES[packageName]
    if (basePrice == null) return res.status(400).json({ error: 'Paket tidak dikenal.' })

    // Validate an optional voucher / referral code — server-side is authoritative.
    let discount = 0
    let appliedVoucher = null
    let referrerId = null
    const rawCode = (voucherCode || '').trim().toUpperCase()
    if (rawCode) {
      const { data: vRows } = await supabase.from('vouchers').select('*').eq('code', rawCode).limit(1)
      const v = vRows?.[0]
      if (v && v.used < v.max_use) {
        discount = v.type === 'percent' ? Math.round((basePrice * v.discount) / 100) : v.discount
        appliedVoucher = v.code
      } else {
        // Not a voucher — try a referral code (excluding the buyer's own).
        const { data: refUser } = await supabase
          .from('profiles').select('id').eq('referral_code', rawCode).neq('id', user.id).maybeSingle()
        if (refUser) {
          discount = REFERRAL_DISCOUNT_AMOUNT
          referrerId = refUser.id
        } else {
          return res.status(400).json({ error: 'Kode promo/referral tidak valid atau kuota habis.' })
        }
      }
    }

    const amount = Math.max(0, basePrice - discount)

    // Create a pending transaction. Its uuid becomes the Midtrans order_id.
    const { data: tx, error: txErr } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        package_name: packageName,
        amount,
        status: 'pending',
        voucher_code: appliedVoucher,
        discount_amount: discount,
        referrer_id: referrerId,
      })
      .select()
      .single()
    if (txErr || !tx) {
      return res.status(500).json({ error: 'Gagal membuat transaksi.' })
    }

    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
    const base = isProduction ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com'
    const authHeader = Buffer.from(serverKey + ':').toString('base64')
    const origin = req.headers.origin || `https://${req.headers.host || 'www.ulema.id'}`

    const snapResp = await fetch(`${base}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        // One item at the final (discounted) price so it matches gross_amount.
        transaction_details: { order_id: tx.id, gross_amount: amount },
        item_details: [{ id: packageName, price: amount, quantity: 1, name: `Undangan Ulema - ${packageName}` }],
        customer_details: {
          first_name: user.user_metadata?.name || 'Pelanggan Ulema',
          email: user.email,
        },
        callbacks: { finish: `${origin}/dashboard/transactions` },
      }),
    })

    const snap = await snapResp.json()
    if (!snapResp.ok) {
      await supabase.from('transactions').update({ status: 'rejected', rejection_reason: 'Gagal membuat sesi pembayaran' }).eq('id', tx.id)
      return res.status(snapResp.status).json({ error: snap?.error_messages || 'Gagal membuat pembayaran.' })
    }

    return res.status(200).json({ token: snap.token, orderId: tx.id, amount })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Kesalahan server.' })
  }
}
