// Bentuk dan batas konten vendor, di satu tempat.
//
// Angka-angka di sini menyalin batas di update_vendor_content (migrasi
// 20260903). Yang di SQL adalah yang menentukan; yang di sini supaya vendor
// tahu sebelum menekan simpan, bukan sesudah ditolak. Kalau salah satu
// berubah, keduanya harus berubah.

export const MAX_STATS = 4     // halaman publik menata statistik maksimal 4 kolom
export const MAX_TESTI = 12
export const LEN = { value: 16, label: 48, quote: 600, author: 80 }

export const STAT_FIELDS = ['value', 'label']
export const TESTI_FIELDS = ['quote', 'author']

let seq = 0
export const newKey = () => `r${seq++}`

/**
 * Baris dari server -> baris untuk form.
 *
 * Tiap baris diberi kunci sendiri, bukan indeks array: menghapus baris tengah
 * dengan kunci indeks membuat React memakai ulang kotak isian yang salah, dan
 * teks terlihat melompat ke baris lain.
 *
 * Kolomnya jsonb, jadi isinya belum tentu berbentuk yang kita harapkan --
 * baris lama, isian manual lewat SQL, atau null. Apa pun yang bukan teks
 * menjadi string kosong ketimbang membuat kotak isian jadi tak terkendali.
 */
export function keyed(rows, fields) {
  return (Array.isArray(rows) ? rows : []).map(r => {
    const out = { _k: newKey() }
    fields.forEach(f => { out[f] = typeof r?.[f] === 'string' ? r[f] : '' })
    return out
  })
}

/**
 * Baris form -> yang dikirim ke server.
 *
 * Baris yang salah satu kotaknya masih kosong dibuang, tidak dikirim setengah
 * jadi: statistik tanpa keterangan atau testimoni tanpa nama akan tampil
 * pincang di halaman publik. Baris kosong yang tertinggal di form juga hal
 * biasa -- menolak seluruh simpanan karenanya cuma bikin frustrasi.
 */
export function bare(rows, fields) {
  return (Array.isArray(rows) ? rows : [])
    .map(r => Object.fromEntries(fields.map(f => [f, String(r?.[f] ?? '').trim()])))
    .filter(r => fields.every(f => r[f] !== ''))
}
