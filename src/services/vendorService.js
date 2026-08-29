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
