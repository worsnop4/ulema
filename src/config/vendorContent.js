// Bentuk dan batas konten vendor, di satu tempat.
//
// Angka-angka di sini menyalin batas di update_vendor_content (migrasi
// 20260903). Yang di SQL adalah yang menentukan; yang di sini supaya vendor
// tahu sebelum menekan simpan, bukan sesudah ditolak. Kalau salah satu
// berubah, keduanya harus berubah.

export const MAX_STATS = 4     // halaman publik menata statistik maksimal 4 kolom
export const MAX_TESTI = 24

// Bukan soal penyimpanan: satu halaman galeri dengan puluhan ubin sudah berat
// di jaringan seluler, dan portofolio yang bagus memang dikurasi. Mosaiknya
// sendiri menyala pada 12 foto ke atas.
export const MAX_PHOTOS = 24
export const MOSAIC_FROM = 12

/**
 * Langkah lompatan untuk mengisi ubin mosaik: terbesar <= 7 yang koprima
 * dengan jumlah foto.
 *
 * Ubin diisi photos[(k * step) % n] supaya ubin bersebelahan tidak
 * menampilkan foto berurutan. Kalau langkahnya berbagi faktor dengan n, ia
 * hanya berputar di sebagian kecil arsip -- dengan 14 foto, langkah 7 cuma
 * menampilkan 2 foto yang diulang 18 kali. Dulu tidak terlihat karena jumlah
 * fotonya tetap 20; begitu vendor bisa menambah dan mengurangi sendiri,
 * angka seperti 14, 21, dan 28 jadi mungkin.
 */
const gcd = (a, b) => (b ? gcd(b, a % b) : a)
export function mosaicStep(n, preferred = 7) {
  if (n < 3) return 1
  let step = Math.min(preferred, n - 1)
  while (step > 1 && gcd(step, n) !== 1) step--
  return step
}
export const LEN = { value: 16, label: 48, event: 80, caption: 120 }

export const STAT_FIELDS = ['value', 'label']

// Testimoni adalah tangkapan layar percakapan klien, bukan kutipan yang
// diketik ulang: yang ditulis vendor hanya acara dan tanggalnya. Ketiganya
// wajib -- tanpa gambarnya testimoni ini kehilangan seluruh alasannya ada,
// dan tanpa acara/tanggal pembaca tidak tahu itu pekerjaan yang mana.
export const TESTI_FIELDS = ['image', 'event', 'date']

// Ukuran kecil untuk ubin di dinding testimoni. Tidak wajib -- baris lama
// yang belum punya thumb tetap sah dan jatuh kembali ke gambar penuh.
// Tanpa ini dinding berisi 24 ubin kecil tetap mengunduh 24 gambar 900px.
export const TESTI_OPTIONAL = ['thumb']

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

/**
 * "2025-01-12" -> "12 Januari 2025".
 *
 * Dipotong sendiri, bukan lewat `new Date(...)`: string tanggal polos dibaca
 * sebagai UTC, jadi di zona waktu Indonesia tanggalnya bisa mundur sehari.
 * Yang bukan YYYY-MM-DD dikembalikan apa adanya ketimbang jadi "Invalid Date".
 */
export function formatEventDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim())
  if (!m) return String(iso || '')
  const bulan = BULAN[Number(m[2]) - 1]
  if (!bulan) return iso
  return `${Number(m[3])} ${bulan} ${m[1]}`
}

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
export function bare(rows, fields, optional = []) {
  return (Array.isArray(rows) ? rows : [])
    .map(r => {
      const out = Object.fromEntries(fields.map(f => [f, String(r?.[f] ?? '').trim()]))
      // Bidang tak wajib hanya ikut kalau memang terisi, supaya baris tidak
      // membawa kunci kosong yang tak berarti apa-apa ke database.
      optional.forEach(f => {
        const v = String(r?.[f] ?? '').trim()
        if (v) out[f] = v
      })
      return out
    })
    .filter(r => fields.every(f => r[f] !== ''))
}

/**
 * Baris galeri dari server -> baris untuk form.
 *
 * Kolomnya menerima string URL polos (bentuk lama, dan itulah isi FM Project
 * sekarang) maupun objek dua ukuran. Keduanya dinormalkan ke satu bentuk di
 * sini supaya form hanya mengenal satu.
 */
export function keyedPhotos(gallery) {
  return (Array.isArray(gallery) ? gallery : []).map(g => {
    if (typeof g === 'string' && g) return { _k: newKey(), full: g, thumb: g, caption: '' }
    if (!g || typeof g !== 'object') return null
    const full = g.full || g.url || g.thumb
    if (!full) return null
    return {
      _k: newKey(),
      full,
      thumb: g.thumb || g.url || full,
      caption: typeof g.caption === 'string' ? g.caption : '',
    }
  }).filter(Boolean)
}

/** Baris form -> yang dikirim ke server. */
export function barePhotos(rows) {
  return (Array.isArray(rows) ? rows : [])
    .filter(r => r?.full)
    .map(r => ({
      full: r.full,
      thumb: r.thumb || r.full,
      caption: String(r.caption || '').trim().slice(0, LEN.caption),
    }))
}
