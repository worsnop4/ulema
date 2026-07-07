// Vercel Edge Middleware — serves real Open Graph meta tags to link-preview
// bots (WhatsApp, Facebook, Twitter, etc.) for /invite/:slug pages.
//
// Why this exists: this app is a client-rendered SPA (single static
// index.html for every route). Link-preview crawlers read only the raw HTML
// response and do not execute JavaScript, so they always saw the generic
// Ulema title/description regardless of which couple's invitation was
// shared. This middleware runs on Vercel's edge, before the SPA rewrite in
// vercel.json, and only intercepts requests whose User-Agent matches a known
// bot — real visitors are untouched and continue straight to the SPA.

export const config = {
  matcher: '/invite/:slug*',
}

const BOT_USER_AGENT_PATTERNS = [
  /facebookexternalhit/i,
  /Facebot/i,
  /Twitterbot/i,
  /WhatsApp/i,
  /LinkedInBot/i,
  /TelegramBot/i,
  /Slackbot/i,
  /Discordbot/i,
  /SkypeUriPreview/i,
  /Googlebot/i,
  /bingbot/i,
  /Pinterest/i,
  /redditbot/i,
  /Applebot/i,
  /vkShare/i,
  /line-poker/i, // LINE app link preview crawler
]

function isBot(userAgent) {
  if (!userAgent) return false
  return BOT_USER_AGENT_PATTERNS.some((pattern) => pattern.test(userAgent))
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

async function fetchInvitationData(slug) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey || !slug) return null

  try {
    const endpoint = `${supabaseUrl}/rest/v1/invitations?select=data&data->>slug=eq.${encodeURIComponent(slug)}&limit=1`
    const res = await fetch(endpoint, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    })
    if (!res.ok) return null
    const rows = await res.json()
    return rows?.[0]?.data || null
  } catch {
    // Network/parse failure — fall back to defaults rather than breaking the bot response.
    return null
  }
}

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || ''
  if (!isBot(userAgent)) {
    return // real visitor — let the normal SPA rewrite handle it
  }

  const url = new URL(request.url)
  const match = url.pathname.match(/^\/invite\/([^/]+)/)
  const slug = match ? decodeURIComponent(match[1]) : null

  const pageUrl = `${url.origin}${url.pathname}`
  const defaultImage = `${url.origin}/hero/hero1.jpg`

  let title = 'Undangan Pernikahan Digital'
  let description = 'Anda diundang! Buka tautan ini untuk melihat detail acara.'
  let image = defaultImage

  const data = slug && slug !== 'demo' ? await fetchInvitationData(slug) : null
  if (data) {
    const bride = data.bride?.nickname || ''
    const groom = data.groom?.nickname || ''
    const names = bride && groom ? `${bride} & ${groom}` : ''
    title = data.meta?.title || names || title
    description = data.meta?.desc || description
    image = data.meta?.ogImage || data.meta?.coverPhoto || data.meta?.photo
      || data.bride?.photo || data.groom?.photo || defaultImage
  }

  const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<meta property="og:type" content="website" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:url" content="${escapeHtml(pageUrl)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />
</head>
<body></body>
</html>`

  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
