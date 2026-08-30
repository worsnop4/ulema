import { supabase } from '../lib/supabase'

/**
 * Public vendor portfolio, by slug.
 *
 * Goes through an RPC rather than selecting the table directly because the
 * page needs the vendor's referral_code, which lives on `profiles` — a table
 * with no public read policy. The function exposes that one column, and only
 * for vendors already marked visible.
 */
export async function fetchVendorBySlug(slug) {
  const { data, error } = await supabase.rpc('get_vendor_by_slug', { p_slug: slug })
  if (error || !data?.length) return null
  return data[0]
}

/**
 * Record a visit or a click.
 *
 * Deliberately fire-and-forget: a failed insert must never block or break the
 * page a vendor is showing to a client. These counts are also spoofable from
 * the browser, which is fine — they touch no money. Commission only ever comes
 * from a settled transaction.
 */
export function logVendorEvent(vendorId, kind) {
  if (!vendorId) return
  supabase.from('vendor_events').insert({ vendor_id: vendorId, kind }).then(
    () => {},
    () => {}
  )
}

/**
 * Raw events for a vendor, newest first.
 *
 * Aggregated in the browser rather than in SQL: at present volumes that is a
 * few dozen rows, and an RPC would be a second thing to keep in step with the
 * event kinds. The window and the row cap are the guard — when a vendor's
 * traffic outgrows them, this becomes a `group by` RPC, not a bigger limit.
 *
 * RLS restricts the rows to the signed-in vendor's own, so no filter here can
 * be the thing that keeps one vendor's numbers out of another's dashboard.
 */
export async function fetchVendorEvents(vendorId, days = 90) {
  if (!vendorId) return []
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const { data, error } = await supabase
    .from('vendor_events')
    .select('kind, created_at')
    .eq('vendor_id', vendorId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(5000)
  if (error) return []
  return data || []
}

/**
 * The signed-in vendor's own editable content.
 *
 * A plain select, not `get_vendor_by_slug`: that RPC only serves vendors
 * already marked visible, so a vendor still waiting to be published could not
 * load their own form. The "Vendor reads own row" policy is what scopes this.
 */
export async function fetchMyVendorContent(vendorId) {
  if (!vendorId) return null
  const { data, error } = await supabase
    .from('vendors')
    .select('id, slug, name, visible, stats, testimonials')
    .eq('id', vendorId)
    .maybeSingle()
  if (error) return null
  return data
}

/**
 * Save statistics and testimonials.
 *
 * Goes through an RPC because RLS is row-level, not column-level: a policy
 * letting a vendor update their own row would also let them set `verified`
 * straight from the API. The function names the two columns it touches, so
 * the rest is unreachable rather than merely unshown.
 *
 * Pass only the part being saved — the function leaves a null argument alone,
 * so one form cannot blank out the other's data.
 */
export async function updateVendorContent({ stats, testimonials }) {
  const { error } = await supabase.rpc('update_vendor_content', {
    p_stats: stats ?? null,
    p_testimonials: testimonials ?? null,
  })
  if (error) throw new Error(error.message)
}
