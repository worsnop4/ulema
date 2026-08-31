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

/**
 * Request a commission withdrawal.
 *
 * The RPC records the request without touching the balance — money moves only
 * when an admin settles it. What the RPC does enforce is the ceiling: the
 * amount must fit inside the balance *minus everything already in flight*,
 * checked under a row lock so two simultaneous requests cannot both pass.
 */
export async function requestWithdrawal({ amount, method, accountNumber, accountName }) {
  const { data, error } = await supabase.rpc('request_withdrawal', {
    p_amount: amount,
    p_method: method,
    p_account_number: accountNumber,
    p_account_name: accountName,
  })
  return { data, error }
}

/** Withdrawal history for the signed-in user, newest first. */
export async function fetchMyWithdrawals() {
  const { data, error } = await supabase
    .from('withdrawals')
    .select('id, amount, payment_method, account_number, account_name, status, created_at, processed_at, proof_path, admin_note')
    .order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

/** Every withdrawal, for the admin queue. Relies on the admin RLS policy. */
export async function fetchAllWithdrawals() {
  const { data, error } = await supabase
    .from('withdrawals')
    .select('id, user_id, amount, payment_method, account_number, account_name, status, created_at, processed_at, proof_path, admin_note, profiles:user_id (name, email)')
    .order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

const PROOF_BUCKET = 'withdrawal-proofs'

/**
 * Upload the transfer receipt for a withdrawal.
 *
 * Stored under the *recipient's* user id, not the admin's, because that is the
 * folder the vendor's read policy checks. A private bucket, deliberately: the
 * receipt carries an amount and an account number, and an unguessable filename
 * is not access control for a financial document.
 */
export async function uploadWithdrawalProof(blob, ownerUserId, withdrawalId) {
  const path = `${ownerUserId}/${withdrawalId}_${Date.now()}.jpg`
  const { error } = await supabase.storage
    .from(PROOF_BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false })
  if (error) throw new Error(`Gagal mengunggah bukti: ${error.message}`)
  return path
}

/**
 * A short-lived link to a proof image.
 *
 * The bucket is private, so there is no permanent URL to store — the link is
 * minted per view and expires. Returns null rather than throwing: a missing
 * receipt should leave the rest of the row readable.
 */
export async function signedProofUrl(path, seconds = 300) {
  if (!path) return null
  const { data, error } = await supabase.storage
    .from(PROOF_BUCKET).createSignedUrl(path, seconds)
  if (error) return null
  return data?.signedUrl || null
}

/**
 * Mark a withdrawal transferred. This is the step that moves the money.
 *
 * The deduction, the status, and the receipt land together inside the RPC,
 * under a lock on the withdrawal row — so two admins pressing the button at
 * once cannot debit the vendor twice for one transfer.
 */
export async function settleWithdrawal(id, proofPath, note) {
  const { data, error } = await supabase.rpc('settle_withdrawal', {
    p_id: id, p_proof_path: proofPath, p_note: note || null,
  })
  return { data, error }
}

/**
 * Turn a withdrawal down.
 *
 * Touches no balance at all — that is the point of deducting at settlement
 * rather than at request. There is no refund step here that could fail
 * silently and leave a vendor short.
 */
export async function rejectWithdrawal(id, note) {
  const { data, error } = await supabase.rpc('reject_withdrawal', {
    p_id: id, p_note: note || null,
  })
  return { data, error }
}

/**
 * Referral history for the signed-in user, newest first.
 *
 * Through an RPC because RLS on `profiles` lets someone read only their own
 * row — a client-side join to the buyer's profile always came back empty, and
 * the screen wrote "User Baru · N/A" for every referral, permanently. The
 * function exposes the buyer's first name and nothing else.
 */
export async function fetchMyReferralHistory() {
  const { data, error } = await supabase.rpc('get_referral_history')
  if (error) return []
  return data || []
}
