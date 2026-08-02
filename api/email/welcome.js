// Vercel serverless function: welcome email after signup.
//
// Called by the client right after `supabase.auth.signUp()` succeeds. Only
// sends if a matching `profiles` row was created very recently — this is a
// cheap guard against the endpoint being used as an open mail relay (an
// attacker who knows a real userId+email pair could otherwise trigger
// repeated sends), without requiring a session token (signUp doesn't return
// one when email confirmation is enabled).

import { createClient } from '@supabase/supabase-js'
import { sendEmail, emailShell, emailButton, emailHeading } from '../_lib/resend.js'

const RECENT_WINDOW_MS = 15 * 60 * 1000

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'Server belum dikonfigurasi.' })
    }

    const { userId, email } = req.body || {}
    if (!userId || !email) return res.status(400).json({ error: 'Data tidak lengkap.' })

    const supabase = createClient(supabaseUrl, serviceKey)
    const { data: profile } = await supabase.from('profiles').select('id, name, email, created_at').eq('id', userId).maybeSingle()

    const recentlyCreated = profile?.created_at && (Date.now() - new Date(profile.created_at).getTime()) < RECENT_WINDOW_MS
    if (!profile || profile.email?.toLowerCase() !== String(email).toLowerCase() || !recentlyCreated) {
      return res.status(200).json({ ok: true, sent: false })
    }

    const html = emailShell({
      preheader: 'Selamat datang di Ulema — mulai siapkan undangan digitalmu.',
      bodyHtml: `
        ${emailHeading(`Halo, ${profile.name || 'Sahabat Ulema'}! 👋`)}
        <p style="margin:0 0 16px; font-family:Arial, sans-serif; font-size:14px; line-height:1.7; color:#334155;">Terima kasih sudah mendaftar di <strong>Ulema</strong>. Akunmu sudah siap — sekarang kamu bisa mulai menyusun undangan pernikahan digitalmu: pilih tema, isi detail acara, dan bagikan ke tamu.</p>
        <div style="margin:28px 0;">${emailButton('Buka Dashboard', 'https://ulema.id/dashboard')}</div>
        <p style="margin:0; font-family:Arial, sans-serif; font-size:13px; line-height:1.7; color:#94a3b8;">Kalau ada pertanyaan, cukup balas email ini — kami siap bantu.</p>
      `,
    })

    const result = await sendEmail({ to: profile.email, subject: 'Selamat datang di Ulema 🤍', html })
    return res.status(200).json({ ok: true, sent: result.ok })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Kesalahan server.' })
  }
}
