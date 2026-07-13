// Vercel serverless function: create a Midtrans Snap transaction.
//
// Flow: the authenticated client POSTs { packageName, accessToken }. We verify
// the Supabase session server-side, compute the price from a SERVER-SIDE map
// (never trust an amount sent by the client), create a pending `transactions`
// row (its uuid is the Midtrans order_id), then ask Midtrans for a Snap token
// and return it. The Server Key stays server-side only.
//
// Environment is controlled by MIDTRANS_IS_PRODUCTION ("true" = production).
// Default is sandbox. (Key prefixes are NOT reliable — some Midtrans accounts
// use the same "Mid-server-" format for both sandbox and production.)

import { createClient } from '@supabase/supabase-js'

// Server-authoritative prices (mirror the app's default pricing). Keeping the
// price here — not trusting the client — prevents underpayment. If admin
// pricing needs to flow through, move pricing to a DB table later.
const PRICES = { Special: 99000, Adat: 110000, Motion: 140000, Luxury: 175000 }

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

    const { packageName, accessToken } = req.body || {}
    if (!packageName || !PRICES[packageName]) {
      return res.status(400).json({ error: 'Paket tidak valid.' })
    }
    if (!accessToken) {
      return res.status(401).json({ error: 'Tidak terautentikasi.' })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // Verify the caller's Supabase session and derive the user from the JWT.
    const { data: userData, error: userErr } = await supabase.auth.getUser(accessToken)
    if (userErr || !userData?.user) {
      return res.status(401).json({ error: 'Sesi tidak valid.' })
    }
    const user = userData.user
    const amount = PRICES[packageName]

    // Create a pending transaction. Its uuid becomes the Midtrans order_id, so
    // the webhook can map the callback back to this user + package.
    const { data: tx, error: txErr } = await supabase
      .from('transactions')
      .insert({ user_id: user.id, package_name: packageName, amount, status: 'pending' })
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
      // Roll the pending row back to rejected so it doesn't linger as "pending".
      await supabase.from('transactions').update({ status: 'rejected', rejection_reason: 'Gagal membuat sesi pembayaran' }).eq('id', tx.id)
      return res.status(snapResp.status).json({ error: snap?.error_messages || 'Gagal membuat pembayaran.' })
    }

    return res.status(200).json({ token: snap.token, orderId: tx.id })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Kesalahan server.' })
  }
}
