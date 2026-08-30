/**
 * Where `/dashboard` sends each kind of account.
 *
 * Lives outside App.jsx so the rule is one readable list instead of a nested
 * ternary inside JSX, and so it can be tested without mounting a router.
 *
 * Order matters: admin wins over vendor, vendor wins over the default. A
 * vendor landing on the invitation editor is what made the correct sidebar
 * feel broken — vendor menu on the left, invitation editor in the middle.
 */
export function dashboardHome(user) {
  if (user?.role === 'admin') return '/dashboard/admin'
  if (user?.vendor) return '/dashboard/vendor'
  // Build-first: everyone else lands on the editor. Payment gates publishing
  // and sharing, not access to the editor itself.
  return '/dashboard/invitation/edit'
}
