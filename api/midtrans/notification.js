// Vercel serverless function: Midtrans payment notification (webhook).
//
// Midtrans calls this after a payment changes state. We VERIFY the signature
// (sha512 of order_id + status_code + gross_amount + ServerKey) so only genuine
// Midtrans callbacks are honoured, then on success we mark the transaction
// approved and activate the user's package (+12 months) using the Supabase
// service role. Configure this URL in Midtrans Dashboard → Settings →
// Configuration → Payment Notification URL: https://<domain>/api/midtrans/notification
//
// NOTE: activation writes package_type/package_expiry on profiles, which the
// guard_profile_privileges trigger allows from a server/service context
// (auth.uid() is null) — see supabase/migrations/20260713_*.sql.

import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, emailShell, emailButton, emailHeading } from '../_lib/resend.js'

const DURATION_MONTHS = 12
const REFERRAL_COMMISSION_RATE = 0.20 // mirror of src/config/constants.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serverKey || !supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'Server belum dikonfigurasi.' })
    }

    const body = req.body || {}
    const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body
    if (!order_id || !signature_key) {
      return res.status(400).json({ error: 'Payload tidak lengkap.' })
    }

    // Verify signature — reject anything not genuinely from Midtrans.
    const expected = crypto
      .createHash('sha512')
      .update(order_id + status_code + gross_amount + serverKey)
      .digest('hex')
    if (expected !== signature_key) {
      return res.status(403).json({ error: 'Signature tidak valid.' })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // order_id is the transactions row uuid.
    const { data: tx } = await supabase.from('transactions').select('*, profiles(email, name)').eq('id', order_id).maybeSingle()
    if (!tx) {
      // Unknown order — ack so Midtrans stops retrying.
      return res.status(200).json({ ok: true, note: 'unknown order' })
    }

    const success = (transaction_status === 'capture' && fraud_status === 'accept') || transaction_status === 'settlement'
    const failed = ['deny', 'cancel', 'expire', 'failure'].includes(transaction_status)

    if (success && tx.status !== 'approved') {
      await supabase.from('transactions').update({ status: 'approved' }).eq('id', tx.id)

      const expiry = new Date()
      expiry.setMonth(expiry.getMonth() + DURATION_MONTHS)
      await supabase
        .from('profiles')
        .update({ package_type: tx.package_name, package_expiry: expiry.toISOString() })
        .eq('id', tx.user_id)

      // Count voucher usage (atomic, so concurrent settlements can't over-count).
      if (tx.voucher_code) {
        await supabase.rpc('increment_voucher_usage', { p_code: tx.voucher_code })
      }

      // Pay the referrer their commission (mirrors the manual-approval path).
      if (tx.referrer_id) {
        const commission = Math.round((tx.amount || 0) * REFERRAL_COMMISSION_RATE)
        await supabase.from('referral_history').insert({
          referrer_id: tx.referrer_id,
          referred_user_id: tx.user_id,
          transaction_id: tx.id,
          commission_amount: commission,
          status: 'available',
        })
        await supabase.rpc('increment_wallet_balance', {
          user_id_input: tx.referrer_id,
          amount_input: commission,
        })
      }

      // Payment confirmation + invoice email — best-effort, never blocks the webhook ack.
      try {
        const buyerEmail = tx.profiles?.email
        if (buyerEmail) {
          const fmtRp = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`
          const expiryLabel = expiry.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
          const html = emailShell({
            preheader: `Pembayaran berhasil — undangan Ulema kategori ${tx.package_name} aktif.`,
            bodyHtml: `
              ${emailHeading('Pembayaran Berhasil 🎉')}
              <p style="margin:0 0 20px; font-family:Arial, sans-serif; font-size:14px; line-height:1.7; color:#334155;">Halo ${tx.profiles?.name || 'Sahabat Ulema'}, terima kasih! Pembayaranmu sudah kami terima dan undanganmu <strong>aktif otomatis</strong> hingga ${expiryLabel}.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial, sans-serif; font-size:13px; color:#334155; border-collapse:collapse;">
                <tr><td style="padding:8px 0; color:#94a3b8;">No. Order</td><td style="padding:8px 0; text-align:right;">${tx.id}</td></tr>
                <tr><td style="padding:8px 0; color:#94a3b8;">Kategori Paket</td><td style="padding:8px 0; text-align:right;">${tx.package_name}</td></tr>
                ${tx.discount_amount > 0 ? `<tr><td style="padding:8px 0; color:#94a3b8;">Diskon${tx.voucher_code ? ` (${tx.voucher_code})` : ''}</td><td style="padding:8px 0; text-align:right; color:#0d9488;">- ${fmtRp(tx.discount_amount)}</td></tr>` : ''}
                <tr><td style="padding:12px 0 0; border-top:1px solid #F5E6DA; font-weight:700; color:#1C232E;">Total Dibayar</td><td style="padding:12px 0 0; border-top:1px solid #F5E6DA; text-align:right; font-weight:700; color:#1C232E;">${fmtRp(tx.amount)}</td></tr>
                <tr><td style="padding:8px 0; color:#94a3b8;">Berlaku Hingga</td><td style="padding:8px 0; text-align:right;">${expiryLabel}</td></tr>
              </table>
              <div style="margin:28px 0 0;">${emailButton('Buka Dashboard', 'https://ulema.id/dashboard')}</div>
            `,
          })
          await sendEmail({ to: buyerEmail, subject: `Invoice Ulema — Pembayaran ${fmtRp(tx.amount)} Berhasil`, html })
        }
      } catch (emailErr) {
        console.error('[email] gagal mengirim konfirmasi pembayaran:', emailErr)
      }
    } else if (failed && tx.status === 'pending') {
      await supabase
        .from('transactions')
        .update({ status: 'rejected', rejection_reason: `Pembayaran ${transaction_status}` })
        .eq('id', tx.id)
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Kesalahan server.' })
  }
}
