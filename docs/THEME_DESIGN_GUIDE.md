# Ulema — Panduan Desain Tema (Handoff untuk Claude Design)

Dokumen ini menjelaskan **standar variabel & struktur** tema undangan Ulema. Tujuannya:
saat kamu (Claude Design) membuat prototipe desain HTML tema baru, desain itu **langsung
nyambung** ke data asli aplikasi — tidak perlu menebak nama field, dan tidak ada bagian
yang di-hardcode.

> **Alur kerja:** kamu membuat **prototipe desain HTML** (seperti file "Aurum Noir Wedding.dc.html").
> Prototipe itu BUKAN kode produksi. Nanti developer (Claude Code) yang menerjemahkannya menjadi
> komponen React bespoke di `src/themes/NamaTema.jsx`, mengikuti pola tema yang sudah ada
> (`BordeauxLuxeTheme.jsx`, `AurumNoirTheme.jsx`).

---

## 1. Bentuk umum tema

- **Undangan single-scroll, mobile-first**, lebar konten ~**480px** (dibungkus frame HP di desktop).
- Ada **Cover** (layar sampul fullscreen) → tamu klik "Buka Undangan" → cover transisi keluar →
  konten undangan tampil (Hero, Couple, Acara, dst).
- **Semua teks, foto, tanggal, nama diisi dari data undangan user.** Desain hanya menyediakan
  "slot"/tempat untuk tiap variabel. **Jangan hardcode** nama/tanggal/foto asli — pakai placeholder.
- Setiap section **hilang otomatis** kalau datanya kosong (mis. Love Story tak ditampilkan bila
  user belum mengisi cerita). Rancang tiap section agar berdiri sendiri.

---

## 2. Urutan section standar

| # | Section | Sumber data utama |
|---|---------|-------------------|
| 0 | **Cover / Sampul** (overlay fullscreen) | `meta.coverPhoto`, nama, tanggal, `guestName` |
| 1 | **Hero / Slide Awal** | `meta.photo`, nama, tanggal, countdown |
| 2 | **Quote / Ayat** | `quote` |
| 3 | **Couple / Mempelai** | `groom`, `bride` |
| 4 | **Acara** (tab akad/resepsi) | `events[]` |
| 5 | **Love Story / Perjalanan Cinta** (opsional) | `loveStory[]` (termasuk foto per momen) |
| 6 | **Dresscode** (opsional) | `dresscode` |
| 7 | **Gallery / Galeri** (opsional) | `gallery[]` |
| 8 | **Live Streaming** (opsional) | `livestreamPlatforms[]` |
| 9 | **RSVP & Ucapan** | form + `rsvps[]` |
| 10 | **Gift / Hadiah** (opsional) | `accounts[]` |
| 11 | **Turut Mengundang** (opsional) | `families[]` |
| 12 | **Footer / Penutup** | `meta.footerPhoto`, nama, tanggal |

Elemen tetap (muncul setelah cover dibuka): **tombol musik** & **bottom-nav** (Home · Couple · Acara · Galeri · RSVP · Hadiah).

---

## 3. Kontrak data — nama variabel per section (PALING PENTING)

Objek data undangan bernama `data`. Selalu gunakan optional chaining (`data?.groom?.name`) karena
field sering kosong.

### Mempelai — `data.groom` & `data.bride` (objek `Person`)
| Field | Isi |
|-------|-----|
| `name` | Nama lengkap (cth: "Doni Firmansyah, S.T.") |
| `nickname` | Nama panggilan (cth: "Doni") — dipakai di judul besar |
| `photo` | URL foto |
| `father` | Nama ayah |
| `mother` | Nama ibu |
| `instagram` | Username IG **tanpa** `@` (cth: "donifirmansyah") |

### Acara — `data.events` (array)
Urutan: `events[0]` = akad, `events[1]` = resepsi (bisa lebih).
| Field | Isi |
|-------|-----|
| `name` | Nama acara (cth: "Akad Nikah", "Resepsi") |
| `date` | Tanggal `YYYY-MM-DD` (untuk angka tanggal & countdown) |
| `dateLabel` | Tanggal terformat Indonesia (cth: "Kamis, 26 November 2026") |
| `start` | Jam mulai `HH:MM` |
| `end` | Jam selesai `HH:MM` |
| `tz` | Zona waktu (cth: "WIB") |
| `venue` | Nama tempat |
| `address` | Alamat lengkap |
| `maps` | URL Google Maps (tombol "Petunjuk Arah") |

> ⚠️ Perhatikan: bukan `title/time/location/mapUrl`. Gunakan `name/start/end/venue/maps`.

### Love Story — `data.loveStory` (array)
| Field | Isi |
|-------|-----|
| `year` | Tahun (cth: "2019") — tampilkan apa adanya, **bukan** diformat tanggal |
| `title` | Judul momen (cth: "Pertama Bertemu") |
| `desc` | Isi cerita (field bernama `desc`, **bukan** `story`) |
| `photo` | URL foto momen (opsional) |

### Dresscode — `data.dresscode` (objek, opsional)
| Field | Isi |
|-------|-----|
| `name` | Nama warna/tema busana (cth: "Sage Green") |
| `color` | Warna hex (cth: "#87ae8a") — untuk swatch |
| `notes` | Catatan tambahan |

### Quote — `data.quote`
String tunggal (ayat/kutipan). **Tidak ada** field sumber/atribusi terpisah.

### Galeri — `data.gallery` (array)
Tiap item objek `{ id, src }`. Ambil `src` untuk `<img>`.

### Hadiah / Rekening — `data.accounts` (array)
| Field | Isi |
|-------|-----|
| `type` | "bank" atau "ewallet" |
| `bank` | Nama bank / e-wallet (cth: "BCA") |
| `holder` | Nama pemilik rekening |
| `number` | Nomor rekening / nomor HP |

> Sediakan tombol **Salin** untuk nomor rekening.

### RSVP & Ucapan — `data.rsvps` (array, read) + form (submit)
Menampilkan ucapan tamu, tiap item:
| Field | Isi |
|-------|-----|
| `name` | Nama tamu |
| `wish` | Isi ucapan (field bernama `wish`) |
| `rsvp` | Status kehadiran: "hadir" / "tidak_hadir" |
| `time` | Label waktu (cth: "Baru saja") |

Form kirim ucapan: sediakan input **Nama**, pilihan **Hadir/Berhalangan**, **textarea ucapan**,
dan tombol kirim. (Runtime menyediakan fungsi submit — lihat bagian 5.)

### Live Streaming — `data.livestreamPlatforms` (array, opsional)
Tampilkan section ini **hanya jika** `data.livestreamEnabled === true`. Tiap item:
| Field | Isi |
|-------|-----|
| `type` | Nama platform (cth: "YouTube Live", "Instagram Live") |
| `url` | Tautan siaran langsung |

Sediakan tombol "Saksikan / Tonton Live" yang membuka `url`. Untuk yang berhalangan hadir.

### Turut Mengundang — `data.families` (array, opsional)
Tampilkan section ini **hanya jika** `data.turutMengundangEnabled === true` dan ada anggota terisi.
Tiap item:
| Field | Isi |
|-------|-----|
| `side` | Nama pihak keluarga (cth: "Keluarga Pria") |
| `members` | Array nama anggota keluarga (string[]) — abaikan yang kosong |

### Meta & foto — `data.meta`
| Field | Isi |
|-------|-----|
| `coverPhoto` | Foto **Cover** (layar sampul sebelum dibuka) |
| `coverStyle` | Gaya cover: "circle" atau "fade" |
| `photo` | Foto **Slide Awal / Hero** |
| `footerPhoto` | Foto **Penutup** (footer) |
| `title`, `desc` | Judul/deskripsi (meta tag) |

### Lain-lain
| Field | Isi |
|-------|-----|
| `data.quote` | Kutipan/ayat |
| `data.countdownEnabled` | Boolean — tampilkan countdown atau tidak |
| `data.music` | Boolean — musik aktif atau tidak |
| `guestName` | Nama tamu untuk kartu "Kepada Yth." di cover (dari parameter link) |

---

## 4. Slot foto (menu "Kelola Foto" di editor)

Ini pemetaan slot foto yang diisi user → field data. **Pakai sumber yang tepat** untuk tiap bagian:

| Slot editor | Field | Dipakai di |
|-------------|-------|-----------|
| Cover (Depan) | `meta.coverPhoto` | Layar sampul (sebelum dibuka) |
| Foto Slide Awal | `meta.photo` | Background Hero (slide pertama) |
| Foto Mempelai | `groom.photo` / `bride.photo` | Section Couple |
| Foto Galeri | `gallery[].src` | Section Gallery |
| Foto Penutup | `meta.footerPhoto` | Footer |

---

## 5. Yang disediakan "runtime" untuk tema (props komponen)

Saat di-port ke React, komponen tema menerima props berikut. Desain HTML tidak perlu
mengimplementasikan logikanya, tapi **rancang UI yang mengakomodasinya**:

| Prop | Guna |
|------|------|
| `data` | Seluruh data undangan (semua field di atas) |
| `countdown` | Objek `{ d, h, m, s }` — hari/jam/menit/detik, sudah dihitung |
| `opened` / `setOpened` | Status cover sudah dibuka atau belum |
| `animateClose` / `setAnimateClose` | Pemicu animasi cover keluar saat "Buka Undangan" diklik |
| `musicPlaying` / `setMusicPlaying` | Status & kontrol musik (untuk tombol musik) |
| `audioRef` | Ref elemen `<audio>` |
| `wishes` | Array ucapan untuk ditampilkan (= `data.rsvps`) |
| `onSubmitWish` | Fungsi kirim ucapan: `onSubmitWish({ name, message, attendance })` |
| `guestName` | Nama tamu (untuk kartu "Kepada Yth.") |

---

## 6. Konvensi motion & kualitas (WAJIB diikuti)

Aturan ini lahir dari bug nyata — mohon patuhi supaya hasil tajam & halus:

1. **JANGAN animasikan `transform: scale()` pada foto** (Ken Burns zoom). Menskala raster =
   **foto jadi buram**, seberapapun resolusinya. Untuk efek sinematik, render gambar sedikit
   lebih besar dari frame (mis. 108–116%) lalu animasikan **`translate` saja (pan/geser)**.
   Ini menjaga foto tetap tajam.
2. **Partikel/bubble**: posisi acak harus di-*seed sekali* (deterministik), bukan diacak tiap
   render. (Di React nanti pakai lazy state; di prototipe cukup pastikan idenya begitu.)
3. **Sudut container jangan terlalu kotak/tajam.** Gunakan sudut membulat halus (kartu ~18–22px,
   input ~12px, tombol pill). Kesan lebih elegan.
4. **Mobile-first**, lebar konten ~480px, satu kolom, banyak ruang napas (padding section ~88–96px).
5. **Font** via Google Fonts `@import` (mis. serif display + script + sans UI). Sebutkan nama font
   & ukuran final di desain.
6. **Cover transition**: saat "Buka Undangan" diklik, cover fade + (opsional) sedikit membesar lalu
   hilang, konten muncul. Musik mulai saat dibuka.
7. **Foto full-screen**: rancang dengan gradient scrim gelap di bawah agar teks terbaca di atas foto.
8. **Elemen tetap**: tombol musik (equalizer) + bottom-nav pill (smooth-scroll antar section).

---

## 7. Aturan "boleh / tidak boleh"

- ✅ **Boleh**: menentukan warna, tipografi, spacing, animasi, layout tiap section secara bebas.
- ✅ **Boleh**: menandai bagian mana yang menampilkan variabel mana (beri komentar/placeholder jelas).
- ❌ **Jangan**: hardcode nama pasangan / tanggal / foto sungguhan sebagai konten final — pakai contoh
  placeholder dan pastikan tiap teks jelas berasal dari variabel mana.
- ❌ **Jangan**: mengarang field baru yang tak ada di dokumen ini. Kalau butuh data yang belum ada
  (mis. "turut mengundang", "live streaming"), tulis catatan — nanti developer cek ketersediaannya.

---

## 8. Yang perlu kamu serahkan (deliverable)

1. **Prototipe HTML** desain lengkap (semua section, bisa dibuka di browser) — seperti format
   "Aurum Noir Wedding.dc.html".
2. **README singkat** berisi: nama tema, kategori (Special / Luxury / Motion / Adat), palet warna
   (design tokens), daftar font, dan catatan animasi/timing.
3. Sebutkan **section mana yang opsional** (muncul hanya jika ada datanya).

Referensi tema yang sudah jadi di codebase (pola yang diikuti): `AurumNoirTheme.jsx` (dark luxury),
`BordeauxLuxeTheme.jsx` (wine luxury), `BotanicalIvoryTheme.jsx` (ivory/sage).
