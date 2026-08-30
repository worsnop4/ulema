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
