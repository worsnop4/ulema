// Kode referal yang dibawa lewat tautan /r/:kode.
//
// Kenapa disimpan, bukan langsung dipakai: orang yang mengklik tautan vendor
// belum tentu membeli undangan hari itu. Urutan wajarnya justru terpisah jauh
// -- venue dan fotografer dipesan sekitar setahun sebelum hari-H, undangan
// baru satu-dua bulan sebelumnya. Kode yang hanya hidup selama satu kunjungan
// akan hilang jauh sebelum orangnya sampai ke pembayaran.
//
// Ini pelengkap, bukan pengganti mengetik kode. Ingatan browser hilang kalau
// mereka berganti perangkat, membersihkan data, atau memakai mode penyamaran
// -- dan itu tidak apa-apa, karena kodenya tetap bisa diketik manual. Yang
// dihindari cuma satu: memaksa orang mengingat kode selama berbulan-bulan.

const KEY = 'ulema.referral'
const MAX_AGE_DAYS = 180

/** Kode hanya huruf, angka, dan strip. Menyaring di sini supaya apa pun yang
 *  nyasar di URL tidak ikut tersimpan lalu dikirim ke server belakangan. */
const clean = (code) => String(code || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 32)

export function rememberReferral(code) {
  const value = clean(code)
  if (!value) return null
  try {
    localStorage.setItem(KEY, JSON.stringify({ code: value, at: Date.now() }))
  } catch {
    // Mode penyamaran atau penyimpanan penuh. Bukan alasan untuk gagal --
    // kodenya masih bisa diketik manual di halaman pembayaran.
  }
  return value
}

export function readReferral() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const { code, at } = JSON.parse(raw)
    if (!code || !at) return null
    if (Date.now() - at > MAX_AGE_DAYS * 86400000) { clearReferral(); return null }
    return clean(code) || null
  } catch {
    return null
  }
}

export function clearReferral() {
  try { localStorage.removeItem(KEY) } catch { /* diabaikan */ }
}
