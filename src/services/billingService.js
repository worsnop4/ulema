import { supabase } from '../lib/supabase'

// Pricing & vouchers now live in Supabase (source of truth) so the payment
// server can trust them. These helpers wrap the DB access; components fall back
// to defaults if the tables aren't reachable (e.g. before the migration runs).

const DEFAULT_PRICING = { Special: 99000, Adat: 110000, Motion: 140000, Luxury: 175000 }

/** Read the {category: price} map from the DB (public-readable). */
export async function fetchPricing() {
  const { data, error } = await supabase.from('pricing').select('category, price')
  if (error || !data?.length) return { ...DEFAULT_PRICING }
  const out = { ...DEFAULT_PRICING }
  data.forEach(r => { out[r.category] = r.price })
  return out
}

/** Upsert the {category: price} map (admin only, enforced by RLS). */
export async function savePricingDB(pricing) {
  const rows = Object.entries(pricing).map(([category, price]) => ({ category, price: Number(price) }))
  const { error } = await supabase.from('pricing').upsert(rows, { onConflict: 'category' })
  return { error }
}

/** Full voucher list — admin only (RLS). Mapped to the app's camelCase shape. */
export async function fetchVouchers() {
  const { data, error } = await supabase.from('vouchers').select('*').order('created_at', { ascending: true })
  if (error) return []
  return (data || []).map(v => ({ id: v.id, code: v.code, type: v.type, discount: v.discount, maxUse: v.max_use, used: v.used }))
}

export async function createVoucherDB(v) {
  const { error } = await supabase.from('vouchers').insert({ code: v.code, type: v.type, discount: v.discount, max_use: v.maxUse })
  return { error }
}

export async function deleteVoucherDB(id) {
  const { error } = await supabase.from('vouchers').delete().eq('id', id)
  return { error }
}

/** Validate a single voucher code without exposing the whole table. */
export async function validateVoucher(code) {
  const { data, error } = await supabase.rpc('validate_voucher', { p_code: code })
  if (error || !data?.length) return null
  const v = data[0]
  return { code: v.code, type: v.type, discount: v.discount }
}

/** Resolve a referral code to its owner's user id (excludes the caller). */
export async function findReferrer(code) {
  const { data, error } = await supabase.rpc('find_referrer_by_code', { p_code: code })
  if (error || !data) return null
  return data
}
