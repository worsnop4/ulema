// Shared Resend email helper for Vercel serverless functions.
//
// Sending is always best-effort: callers must never let an email failure
// block the underlying business action (signup, payment). `sendEmail`
// swallows and logs errors instead of throwing.
//
// Sender domain (ulema.id) is verified in Resend; halo@ulema.id is the
// chosen sender identity across all transactional email.

const SENDER = 'Ulema <halo@ulema.id>'

export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[email] RESEND_API_KEY is not configured — skipping send.')
    return { ok: false, error: 'RESEND_API_KEY missing' }
  }
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: SENDER, to, subject, html }),
    })
    if (!resp.ok) {
      const err = await resp.text()
      console.error('[email] Resend API error:', resp.status, err)
      return { ok: false, error: err }
    }
    return { ok: true }
  } catch (e) {
    console.error('[email] send failed:', e)
    return { ok: false, error: e.message }
  }
}

// Brand shell — wraps a template's inner HTML in Ulema's transactional email
// chrome (wordmark header, card, footer). Keeps brand styling in one place
// so every email stays visually consistent with the product.
export function emailShell({ preheader = '', bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ulema</title>
</head>
<body style="margin:0; padding:0; background:#FFFBF0; font-family:Arial, Helvetica, sans-serif;">
  <span style="display:none; font-size:1px; color:#FFFBF0; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFBF0; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="padding:0 8px 24px; text-align:center;">
              <span style="font-family:Georgia,'Times New Roman',serif; font-size:22px; font-weight:700; color:#1C232E; letter-spacing:0.02em;">Ulema</span>
              <div style="margin-top:4px; font-size:10px; letter-spacing:0.24em; text-transform:uppercase; color:#b9a584; font-weight:600;">Undangan Digital</div>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff; border:1px solid #F5E6DA; border-radius:16px; padding:36px 32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 8px 0; text-align:center;">
              <p style="margin:0 0 4px; font-size:12px; color:#94a3b8; font-family:Arial, sans-serif;">Butuh bantuan? Balas email ini atau hubungi kami di <a href="mailto:halo@ulema.id" style="color:#b9a584; text-decoration:none;">halo@ulema.id</a></p>
              <p style="margin:0; font-size:11px; color:#cbd5e1; font-family:Arial, sans-serif;">Ulema — <a href="https://ulema.id" style="color:#cbd5e1;">ulema.id</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// Shared fragments so each email template stays short and consistent with
// the shell's brand tokens (brand-600 navy, gold-dark accent, Georgia serif).
export function emailButton(label, href) {
  return `<a href="${href}" style="display:inline-block; background:#1C232E; color:#ffffff; font-family:Arial, sans-serif; font-size:14px; font-weight:600; text-decoration:none; padding:14px 28px; border-radius:10px;">${label}</a>`
}

export function emailHeading(text) {
  return `<h1 style="margin:0 0 16px; font-family:Georgia,'Times New Roman',serif; font-size:22px; font-weight:700; color:#1C232E;">${text}</h1>`
}
