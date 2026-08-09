/**
 * Where are we, from the URL alone: a public /invite/:slug page, and is that
 * slug the shared demo preview?
 *
 * Kept in one place because several call sites need the same answer and must
 * not drift apart — useSharedInvitation decides what to fetch and whether a
 * save is allowed, useWishSubmit decides whether a guest wish is persisted.
 * (`middleware.js` resolves demo slugs too, but runs on the edge with no
 * access to this bundle; keep it in step by hand.)
 *
 * Note `/invite/demo?theme=N` does NOT use the literal slug "demo" — it
 * resolves to `demo-theme-${N}`. This helper reports the raw path segment;
 * resolution stays in useInvitationData.
 */
export function getInviteRoute(pathname = window.location.pathname) {
  const parts = pathname.split('/')
  const idx = parts.indexOf('invite')
  const slug = idx !== -1 ? parts[idx + 1] || null : null
  return {
    isPublicInvite: Boolean(slug),
    publicSlug: slug,
    isDemo: slug === 'demo',
  }
}
