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

const DURATION_MONTHS = 12

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
    const { data: tx } = await supabase.from('transactions').select('*').eq('id', order_id).maybeSingle()
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
