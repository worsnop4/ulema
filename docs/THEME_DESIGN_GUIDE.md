# Ulema — Panduan Desain Tema

Dokumen ini menjelaskan **standar variabel & struktur** tema undangan Ulema. Tujuannya: tema baru
apa pun **langsung nyambung** ke data asli aplikasi — tidak perlu menebak nama field, dan tidak ada
bagian yang di-hardcode. Ini berlaku terlepas dari siapa yang mendesain.

> **Dua alur kerja yang didukung:**
> 1. **Handoff eksternal** — kamu (atau desainer lain / Claude Design) membuat prototipe desain HTML
>    lebih dulu (seperti file "Aurum Noir Wedding.dc.html" / "Opaline Pearl"), lalu developer
>    (Claude Code) menerjemahkannya jadi komponen React di `src/themes/NamaTema.jsx`. Lihat §8.
> 2. **Desain langsung oleh Claude Code** — tanpa prototipe HTML terpisah; Claude Code merancang
>    *dan* membangun temanya sekaligus di React, berbekal brief singkat dari kamu. Lihat §9.
>
> Section 1–7 di bawah (kontrak data, konvensi teknis) **berlaku sama** untuk kedua alur — itu yang
> menjaga tema tetap "nyambung" ke aplikasi. Yang beda cuma proses & seberapa besar kebebasan visual.
>
> **Mode 3 — tema Motion non-linear:** kalau temanya sengaja keluar dari pola scroll ke bawah
> (deck, peta, timeline sinematik) dan motion-nya digarap serius, pakai
> [`THEME_GUIDE_MOTION.md`](./THEME_GUIDE_MOTION.md). Dokumen itu berdiri sendiri (bisa langsung
> di-paste ke Claude Design) dan menambahkan yang tidak ada di sini: paradigma navigasi beserta
> ongkos migrasinya, aturan konten yang tumbuh tanpa batas, pipeline aset video, dan konvensi
> `data-bind` yang membuat porting jadi mekanis.

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

## 2. Konten wajib & opsional

Ini bukan urutan yang harus diikuti kaku — lihat §9 soal kebebasan urutan/struktur di mode desain
langsung. Tabel ini daftar **konten yang harus ADA** (di mana pun posisinya) vs yang **opsional**
(muncul hanya kalau datanya terisi).

| Section | Wajib? | Sumber data utama |
|---------|--------|-------------------|
| **Cover / Sampul** (overlay fullscreen, tombol "Buka Undangan") | ✅ Wajib | `meta.coverPhoto`, nama, tanggal, `guestName` |
| **Hero / Slide Awal** | ✅ Wajib | `meta.photo`, nama, tanggal, countdown |
| **Quote / Doa / Ayat** | ✅ Wajib | `quote` |
| **Couple / Data Mempelai** | ✅ Wajib | `groom`, `bride` |
| **Acara** (akad/resepsi) | ✅ Wajib | `events[]` |
| **RSVP & Ucapan** (form kirim + daftar ucapan) | ✅ Wajib | form + `rsvps[]` |
| **Footer / Penutup** | ✅ Wajib | `meta.footerPhoto`, nama, tanggal |
| Love Story / Perjalanan Cinta | Opsional (tampil jika ada isi) | `loveStory[]` |
| Dresscode | Opsional | `dresscode` |
| Gallery / Galeri | Opsional | `gallery[]` |
| Live Streaming | Opsional (`livestreamEnabled === true`) | `livestreamPlatforms[]` |
| Gift / Hadiah | Opsional | `accounts[]` |
| Turut Mengundang | Opsional (`turutMengundangEnabled === true`) | `families[]` |

Elemen tetap (harus selalu bisa diakses tamu setelah cover dibuka): **tombol musik** & **navigasi**
antar-section. Bentuk navigasinya bebas (bottom-nav pill klasik, dot-nav, side menu, swipe/scroll-snap,
dll) — yang penting tamu tidak "kejebak" di satu section tanpa jalan ke section lain.

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

## 8. Mode 1 — Handoff eksternal: yang perlu diserahkan (deliverable)

1. **Prototipe HTML** desain lengkap (semua section, bisa dibuka di browser) — seperti format
   "Aurum Noir Wedding.dc.html".
2. **README singkat** berisi: nama tema, kategori (Special / Luxury / Motion / Adat), palet warna
   (design tokens), daftar font, dan catatan animasi/timing.
3. Sebutkan **section mana yang opsional** (muncul hanya jika ada datanya).

Referensi tema yang sudah jadi di codebase (pola yang diikuti): `AurumNoirTheme.jsx` (dark luxury),
`BordeauxLuxeTheme.jsx` (wine luxury), `BotanicalIvoryTheme.jsx` (ivory/sage).

---

## 9. Mode 2 — Desain langsung oleh Claude Code (bebas berekspresi)

Di mode ini **tidak ada prototipe HTML terpisah**. Claude Code merancang konsep *dan* langsung
membangunnya jadi komponen React bespoke. Kebebasannya lebih luas dari mode 1 — bukan cuma warna
& tipografi, tapi juga **struktur & urutan**. Batasnya cuma §1–§7 di atas (kontrak data, elemen
wajib ada, dan konvensi motion/kualitas) — itu yang menjaga tema tetap berfungsi dan konsisten
dengan sistem, bukan pembatas kreatif.

**Yang boleh dieksplorasi bebas (tidak wajib meniru tema-tema sebelumnya):**
- **Urutan & pengelompokan section** — tidak harus linear top-to-bottom seperti tabel §2. Boleh
  gabung beberapa section jadi satu "chapter", boleh taruh Love Story sebelum Couple, boleh bikin
  navigasi non-linear (scroll-snap per bagian, tab, dsb) — asal semua konten **wajib** (§2) tetap
  ada dan bisa dijangkau tamu.
- **Paradigma interaksi/navigasi** — bottom-nav pill itu kebiasaan lama, bukan aturan. Boleh diganti
  bentuk lain selama tetap jelas & mudah dipakai satu tangan di HP.
- **Bahasa visual & motion** — pilih sendiri gaya (maksimalis/minimalis, playful/formal, dsb),
  termasuk teknik ornamen/animasi baru selama tetap sat set di HP (hindari animasi berat yang bikin
  scroll patah-patah) dan menghormati konvensi wajib di §6 (jangan `scale()` di foto, partikel harus
  seeded, dsb).
- **Aset**: kalau butuh foto/tekstur/video loop dekoratif yang belum ada, bisa dibuatkan lewat MCP
  Kling AI (bahas dulu briefnya sebelum generate — tiap job berbayar) atau vector/SVG buatan tangan
  (untuk ornamen presisi seperti garis emas/filigree, vector tetap lebih pas — lihat §6).

**Alur kerja yang dipakai:**
1. **Brief singkat dari kamu** — mood/vibe yang diinginkan, ada referensi visual atau tidak, dan
   kategori (Special / Luxury / Motion / Adat).
2. **Claude Code mengajukan design plan singkat** sebelum ngoding: nama tema, palet warna (4–6 hex
   bernama), pasangan font (display + body, + script kalau perlu), dan konsep layout/struktur
   1–2 kalimat (termasuk kalau urutannya beda dari standar). Kamu approve/koreksi dulu sebelum lanjut.
3. **Build part-by-part** (tetap ikuti kebiasaan: jangan sekaligus semua section) langsung ke
   `src/themes/NamaTema.jsx`, sambil didaftarkan ke titik-titik registrasi standar: `constants.js`
   (`THEMES` + `THEME_CATEGORY_MAP`), `defaultData.js` (`DEFAULT_THEMES`), `InvitationTemplate.jsx`
   (lazy import + `THEME_COMPONENTS`), dan migration seed `themes` table.
4. Verifikasi tiap bagian dengan `npm run build` + `eslint`, commit + push — sama seperti alur tema
   lainnya (tidak ada langkah tambahan khusus mode ini).
