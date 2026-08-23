# Ulema — Panduan Tema Motion Non-Linear (untuk Claude Design)

Dokumen ini adalah **brief lengkap yang bisa berdiri sendiri**. Claude Design tidak punya akses ke
repo Ulema, jadi semua yang dibutuhkan ada di sini: kontrak data, batasan runtime, paradigma
navigasi yang boleh dipakai, dan format serah-terima yang membuat migrasi ke React jadi mekanis.

**Bedanya dengan `THEME_DESIGN_GUIDE.md`:** dokumen lama menjelaskan tema *single-scroll* standar.
Dokumen ini untuk tema yang sengaja **keluar dari pola scroll ke bawah** — deck, kanvas, peta,
timeline sinematik — dan yang motion-nya digarap serius (video generatif, motion graphic, shader).
Kontrak datanya sama persis; yang berbeda cuma paradigma dan ongkos migrasinya.

> **Cara pakai:** isi Bagian A, lalu kirim seluruh dokumen ini + Bagian A ke Claude Design.
> Yang diminta balik: **satu file HTML mandiri** sesuai Bagian 7.

---

## Bagian A — Brief (isi dulu sebelum dikirim)

```
Nama tema (kerja)   : ...
Kategori            : Motion  (pilihan lain: Special / Luxury / Adat)
Mood / vibe         : ...
Referensi visual    : ... (link/gambar, atau "bebas")
Paradigma navigasi  : ... (pilih dari Bagian 5, atau "usulkan yang paling pas")
Sumber motion       : ... (video generatif / vector-CSS / hybrid — lihat Bagian 6)
Pantangan           : ... (warna/gaya yang tidak diinginkan)
```

---

## Bagian 1 — Tema itu apa, secara teknis

Tema **bukan halaman web**. Tema adalah satu komponen React yang di-mount ke dalam sebuah kolom
sempit di tengah layar:

```
┌─ browser window (bisa 1920px) ──────────────────────────┐
│            ┌─ .inv-shell : 480px × tinggi layar ─┐      │
│  backdrop  │  ┌─ div scroller (overflow-y:auto) ─┐│     │
│  blur      │  │                                  ││     │
│            │  │      ← tema kamu di sini         ││     │
│            │  │                                  ││     │
│            │  └──────────────────────────────────┘│     │
│            └────────────────────────────────────-─┘     │
└─────────────────────────────────────────────────────────┘
```

Tiga konsekuensi yang **membunuh desain** kalau dilupakan:

1. **Yang menggulir adalah div di dalam, bukan window.** `window.scrollY`, `window.scrollTo`,
   dan `scroll` listener di `window` selalu tidak berefek. Untuk pindah section pakai
   `document.getElementById(id).scrollIntoView({ behavior:'smooth', block:'start' })` — ia
   menemukan scroller yang benar sendiri.
2. **`vh` / `vw` mengukur jendela, bukan kolom.** Di desktop `100vw` = 1920px sementara kolomnya
   480px. Shell menerbitkan dua custom property yang **wajib** dipakai sebagai gantinya:

   | Property | Isi |
   |----------|-----|
   | `--inv-w` | Lebar kolom — `100vw` di HP, `480px` di ≥768px |
   | `--inv-h` | Tinggi kolom — `100dvh` (aman terhadap address bar HP) |

   Aturannya keras: **jangan pernah menulis `vh` atau `vw`** kecuali di rumus penjangkaran
   Bagian 2. Ganti semua `100vh` → `var(--inv-h)`, `100vw` → `var(--inv-w)`.
3. **Breakpoint `@media (min-width: 768px)` membaca lebar jendela, bukan lebar kolom.** Di desktop
   media query itu *menyala* padahal ruang gambarnya tetap 480px — layout dua kolom akan pecah.
   Desain **mobile-first satu ukuran**: anggap kanvasnya selalu ~480px × tinggi layar. Kalau
   benar-benar butuh responsif internal, pakai container query, bukan media query.

---

## Bagian 2 — Lapisan yang harus diam (video, partikel, panggung)

`position: sticky` di dalam scroller itu **sudah gagal dua kali** dengan gejala yang sama: lapisan
bertahan beberapa section lalu ikut tergulir pergi. Jangan pakai. Pola yang benar:

```css
.stage {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);   /* trio ini menjangkarkan ke KOLOM,   */
  width: var(--inv-w);            /* bukan ke jendela                   */
  height: var(--inv-h);
  z-index: 0;
  pointer-events: none;
}
```

Untuk tombol melayang (musik, nav, tombol lewati) yang menempel ke tepi kolom:

```css
right: max(16px, calc(50vw - var(--inv-w) / 2 + 16px));
```

Ini satu-satunya tempat `vw` boleh muncul. Bentuk lain yang pernah salah dan harus dihindari:
`right: 16px` polos (nempel ke tepi jendela, jauh dari kolom) dan
`calc(var(--inv-w) / 2 - 218px)` (angka ajaib yang cuma benar di satu lebar).

Konten di atas panggung harus punya `z-index: 1` ke atas dan latar transparan.

---

## Bagian 3 — Kontrak data (paling penting)

Objek data bernama `data`. **Selalu** pakai optional chaining — hampir semua field bisa kosong,
dan sebagian besar undangan memang setengah terisi saat dipratinjau.

**Empat ronde bug di proyek ini semuanya bersumber dari salah nama field.** Tabel di bawah sudah
diverifikasi terhadap form editor dan baris asli di database. Jangan mengarang field baru; kalau
butuh data yang belum ada, **tulis catatan** — jangan diam-diam diasumsikan ada.

### Mempelai — `data.groom`, `data.bride`
| Field | Isi |
|-------|-----|
| `name` | Nama lengkap ("Doni Firmansyah, S.T.") |
| `nickname` | Nama panggilan ("Doni") — dipakai untuk judul besar |
| `photo` | URL foto |
| `father` / `mother` | Nama orang tua |
| `instagram` | Username **tanpa** `@` |

### Acara — `data.events` (array, bisa lebih dari dua)
| Field | Isi |
|-------|-----|
| `name` | "Akad Nikah" / "Resepsi" |
| `date` | `YYYY-MM-DD` |
| `dateLabel` | Tanggal terformat ("Kamis, 26 November 2026") |
| `start` / `end` | Jam `HH:MM` |
| `tz` | "WIB" |
| `venue` | Nama gedung |
| `address` | Alamat lengkap |
| `maps` | URL Google Maps |

> ⚠️ Bukan `title/time/location/mapUrl`. Dan **jangan hardcode dua acara** — `events` pernah
> berisi tiga. Selalu `map()` atas seluruh array.

### Love Story — `data.loveStory` (array, opsional)
`year` (tampilkan apa adanya, bukan diformat tanggal) · `title` · **`desc`** (bukan `story`) · `photo` (opsional)

### Galeri — `data.gallery` (array, opsional)
Tiap item `{ id, src }`. Jumlahnya **tidak terbatas** — bisa 3, bisa 30.

### Hadiah — `data.accounts` (array, opsional) + `data.giftAddress` (**objek**, opsional)
`accounts[]`: `type` ("bank"/"ewallet") · `bank` · **`holder`** (bukan `name`) · **`number`** (bukan `no`).
Sediakan tombol **Salin** untuk nomornya.

`giftAddress` **bukan string** — ia objek `{ enabled, recipient, phone, address }` dengan sakelarnya
sendiri. Tampilkan hanya bila `giftAddress.enabled === true` **dan** salah satu dari
`address`/`recipient`/`phone` terisi: objek kosong tetap truthy, jadi `{giftAddress && …}` akan
lolos untuk pasangan yang justru mematikannya. `address` bisa berisi baris baru — render dengan
`white-space: pre-line`. Section tetap tampil kalau hanya alamat ini yang diisi tanpa satu pun
rekening.

### RSVP & Ucapan — `data.rsvps` (array) + form kirim
`name` · **`wish`** · `rsvp` ("hadir"/"tidak_hadir") · `time` ("Baru saja").
Form butuh: input nama, pilihan Hadir/Berhalangan, textarea, tombol kirim.

### Live Streaming — `data.livestreamPlatforms` (opsional)
Tampil **hanya jika** `data.livestreamEnabled === true`. Tiap item `type` · `url`.

### Turut Mengundang — `data.families` (opsional)
Tampil **hanya jika** `data.turutMengundangEnabled === true`. Tiap item `side` · `members` (string[]).

### Dresscode — `data.dresscode` (opsional)
`name` · `color` (hex, untuk swatch) · `notes`

### Meta & lain-lain
| Field | Isi |
|-------|-----|
| `data.quote` | Kutipan/ayat — string tunggal, tanpa field atribusi |
| `data.meta.coverPhoto` | Foto layar sampul |
| `data.meta.photo` | Foto hero / slide awal |
| `data.meta.footerPhoto` | Foto penutup |
| `data.countdownEnabled` | Boolean |
| `data.music` | Boolean (`!== false` artinya aktif) |
| `guestName` | Nama tamu dari parameter link, untuk "Kepada Yth." |

### Props runtime (React menyediakan, HTML tinggal siapkan UI-nya)
| Prop | Guna |
|------|------|
| `data` | Seluruh data di atas |
| `countdown` | `{ d, h, m, s }` — sudah dihitung, tinggal ditampilkan |
| `opened` / `setOpened` | Status cover sudah dibuka |
| `animateClose` / `setAnimateClose` | Pemicu animasi cover keluar |
| `musicPlaying` / `setMusicPlaying` | Kontrol musik |
| `wishes` | Array ucapan untuk ditampilkan |
| `onSubmitWish` | `onSubmitWish({ name, message, attendance })` |
| `guestName` | Nama tamu |

---

## Bagian 4 — Konten wajib, dan urutan yang tidak boleh diganggu

Wajib ada (di mana pun letaknya): **Cover · Hero · Quote · Mempelai · Acara · RSVP+Ucapan · Penutup**.
Opsional (muncul hanya bila terisi): Love Story · Galeri · Dresscode · Live Streaming · Gift ·
Turut Mengundang.

Urutan section bebas diatur ulang **kecuali satu aturan**, hasil audit seluruh tema:

> **Semua informasi untuk tamu (dresscode, live streaming, gift, turut mengundang) harus datang
> SEBELUM RSVP. RSVP adalah hal terakhir yang tamu lakukan, tepat sebelum penutup.**

Alasannya perilaku, bukan estetika: tamu yang sudah mengirim ucapan menganggap undangannya selesai
dan berhenti di situ — informasi apa pun setelah RSVP tidak terbaca. Empat tema pernah melanggar
ini dan semuanya sudah diperbaiki.

**ID section standar** (ganti `xx` dengan inisial tema, mis. `nv` untuk "Nova"):

```
xx-home · xx-quote · xx-mempelai · xx-acara · xx-story
xx-galeri · xx-info · xx-rsvp · xx-penutup
```

Navigasi minimal harus bisa menjangkau: **Home · Mempelai · Acara · Galeri · RSVP**.

**Setiap section hilang total saat datanya kosong** — bukan tampil dengan tulisan "belum diisi".
Rancang tiap chapter supaya berdiri sendiri, karena banyak kombinasi yang akan benar-benar terjadi:
tanpa galeri, tanpa love story, tanpa foto mempelai, tiga acara, nol ucapan.

---

## Bagian 5 — Paradigma navigasi non-linear

Ini inti dokumennya. Semua opsi di bawah **bisa** dibangun, tapi ongkos dan risikonya beda jauh.

### 5.1 Aturan yang berlaku untuk semua paradigma non-scroll

**Masalah #1 yang membunuh prototipe non-scroll yang indah: konten yang tumbuh.**

Layar berukuran tetap mengasumsikan isinya muat. Di undangan asli, empat hal **tidak punya batas
atas**: daftar ucapan (bisa 80), galeri (bisa 30 foto), turut mengundang (bisa 40 nama), dan
jumlah acara. Ditambah nama panjang bergelar ("Muhammad Rizky Ramadhan, S.Kom., M.M.") yang
merusak layout yang dihitung untuk "Doni".

Karena itu **setiap chapter wajib menyatakan perilaku luapannya**, pilih salah satu:
- **(a) tinggi tetap + area gulir internal** — chapter setinggi `var(--inv-h)`, isinya di dalam
  div `overflow-y: auto` sendiri; atau
- **(b) chapter yang boleh tumbuh** — tingginya `min-height: var(--inv-h)` dan ia menggulir normal.

Chapter RSVP/ucapan dan galeri **hampir selalu harus (b) atau (a) dengan gulir internal**. Deck
murni tanpa gulir untuk kedua chapter itu adalah kesalahan desain, bukan pilihan gaya.

**Kalau butuh scroll-snap atau perilaku gulir khusus:** jangan mengandalkan penataan div scroller
milik shell — tema tidak memilikinya. Buat scroller sendiri di dalam tema:

```css
.deck { height: var(--inv-h); overflow-y: auto; scroll-snap-type: y mandatory; }
.deck > section { height: var(--inv-h); scroll-snap-align: start; }
```

Karena tinggi tema jadi persis satu layar, scroller milik shell tidak pernah aktif dan tidak
bertengkar dengan milik tema.

**Selalu sediakan jalan keluar.** Apa pun paradigmanya, tamu harus bisa: melompat ke chapter mana
pun, kembali, dan mengakses tombol musik. Tamu yang datang untuk mengecek alamat gedung tidak boleh
dipaksa menonton sembilan chapter.

### 5.2 Opsi, dari yang paling aman

| # | Paradigma | Rasa | Ongkos port | Risiko |
|---|-----------|------|-------------|--------|
| 1 | **Story deck** — chapter penuh layar, maju dengan swipe/tap, progress bar di atas seperti IG Stories | Sangat berbeda, familiar, satu tangan | Rendah — cuma state + transform | Chapter RSVP & galeri butuh gulir internal |
| 2 | **Scroll-snap chapters** — masih menggulir, tapi mengunci satu layar penuh per chapter | Beda tanpa mengagetkan | Sangat rendah — CSS murni | Paling "aman", tapi paling dekat ke scroll biasa |
| 3 | **Peta / konstelasi** — satu kanvas besar, tiap chapter satu tempat; navigasi = kamera bergeser | Paling berkesan, paling "wah" | Sedang | Kamera hanya boleh `translate`; teks kecil saat zoom-out |
| 4 | **Timeline sinematik** — video jadi tulang punggung, kartu konten muncul di detik tertentu | Paling sinematik | Sedang — sudah terbukti di Gilded Palace | Wajib ada tombol "Lewati"; jangan sandera tamu |
| 5 | **Metafora fisik** — amplop dibuka, surat dilipat, kartu ditarik dari saku | Berkesan & bertema | Sedang-tinggi | Transform 3D rentan di Android lawas |
| 6 | **Buku / page-flip** | Klasik | Tinggi | Perf buruk + konten panjang tidak muat halaman |

> **Catatan lapangan (2026-08-23).** Memories dibangun dengan nomor 1 dan **dibatalkan setelah
> dilihat di HP**. Deck satu-babak-satu-layar membuat tamu hanya pernah melihat satu hal pada satu
> waktu: hitung mundur, doa, dan mempelai tidak pernah bisa muncul bersama dalam satu bingkai
> seperti di tema lain, dan undangan terasa ditelusuri satu per satu alih-alih dibaca. Velour Olive
> punya gejala yang sama dan ikut diubah. Keduanya sekarang mengalir menyambung, dan yang
> dipertahankan dari bentuk deck justru bagian terbaiknya: bilah progres yang bisa ditekan dan pil
> navigasi. **Sebelum memilih paradigma non-scroll, tanyakan dulu apakah tamu perlu melihat dua
> bagian sekaligus** — untuk undangan, jawabannya ternyata ya.

**Rekomendasi saya: nomor 1, di-hybrid dengan 4.** Story deck sebagai kerangka — tiap chapter
punya lapisan motion sendiri, transisinya bisa digarap serius — dengan chapter pembuka memakai
timeline sinematik (poster → intro → loop) seperti Gilded Palace yang sudah terbukti. Chapter RSVP
dan galeri dibuat mode (b) yang boleh tumbuh. Ini yang memberi perbedaan paling terasa dengan
risiko migrasi paling kecil, dan cocok betul dengan motion graphic karena tiap chapter jadi
"panggung" tersendiri.

Nomor 3 pilihan terkuat kalau mau benar-benar berani — tapi minta prototipenya diuji dulu dengan
30 foto galeri dan 40 ucapan sebelum diputuskan.

---

## Bagian 6 — Motion: video generatif vs alternatifnya

### 6.1 Yang sudah terbukti bekerja di Ulema

Pola aset tema Motion: **poster (JPG) → intro (MP4, sekali jalan) → loop (MP4, mulus selamanya)**.
Poster tampil seketika, intro mulai saat undangan dibuka, loop mengambil alih di ujung intro dan
berjalan di belakang seluruh undangan.

Pelajaran mahal yang jangan diulang:
- **Pilih resolusi dengan mengukur VMAF pada ukuran tampil, bukan dengan menebak CRF.** Potongan
  pertama Gilded Palace skor 66,9 (jelas rusak) dan harus diulang di 810p → 92,4. Pada bitrate
  seukuran undangan, **810p mengalahkan 1080p pada ukuran file yang sama**.
- **Intro dan loop wajib satu resolusi**, kalau tidak peralihannya terbaca seperti fokus meloncat.
- **Loop dibuat dengan melarutkan ekornya ke salinan kepala yang DIBALIK**, supaya larutannya
  mendarat tepat di frame 0.
- **Verifikasi ketiga sambungan dengan PSNR** terhadap baseline frame-bersebelahan footage itu
  sendiri, bukan ambang tetap.
- `preload="none"` untuk loop sampai intro berjalan.

### 6.2 Batasan Kling AI yang harus dipikirkan sejak tahap desain

- **Tidak ada alpha channel.** Kling mengeluarkan video persegi panjang penuh. Motion graphic yang
  "melayang di atas konten" tidak bisa langsung — harus dikomposit dengan blend mode
  (`screen`/`lighten` di atas latar gelap, `multiply` di atas latar terang) dan direncanakan sejak
  awal: elemen terang di latar hitam pekat untuk `screen`, gelap di latar putih untuk `multiply`.
- **Klip pendek (5–10 detik) dan tidak mulus.** Loop dibangun manual dengan teknik 6.1.
- **Rasio 9:16 wajib.** Video landscape yang di-crop kehilangan komposisinya.
- **Jangan pernah menghasilkan wajah manusia, tangan, atau teks.** Tamu langsung mengenali wajah AI,
  dan tulisan hasil generate selalu cacat. Semua teks datang dari data undangan.
- **Image-to-video lebih terkontrol daripada text-to-video.** Buat still-nya dulu (palet & komposisi
  bisa diatur), baru dianimasikan. Semua tema Motion kita lahir begitu.
- **Anggaran berat.** Tema Motion sekarang mengirim 6–8,3 MB per tema (intro theme-2 sendiri 6 MB).
  Itu di batas atas untuk data seluler Indonesia. **Target tema baru: intro ≤ 2,5 MB, loop ≤ 1,5 MB,
  poster ≤ 220 KB.** Kalau desainnya butuh lebih dari satu klip, anggaran ini dibagi, bukan dikali.

> **Catatan status:** MCP Kling **belum terotorisasi** di sesi ini, jadi saya belum bisa
> menjalankan generate-nya. Otorisasi lewat pengaturan connector claude.ai dulu. MCP **Higgsfield
> sudah tersambung** dan bisa image/video generation, upscale, remove-background, dan reframe —
> itu bisa dipakai sekarang juga sebagai jalur alternatif.

### 6.3 Saran lain — dan kenapa video saja bukan jawaban terbaik

Kamu bertanya apa ada saran lain. Ada, dan menurut saya justru lebih kuat kalau digabung:

**1. Vector/CSS/SVG motion untuk semua yang di depan.** Ornamen emas yang menggambar sendiri,
garis yang tumbuh, kelopak jatuh, shimmer — semua ini **lebih tajam** daripada video (vektor, bukan
raster), **nyaris nol berat**, punya alpha asli, dan bisa diberi warna dari palet tema. Video
raster akan selalu kalah tajam di layar HP ber-DPI tinggi. Aturan pembagiannya sederhana:
**video untuk atmosfer di belakang, vektor untuk detail di depan.**

**2. Rive** — ini rekomendasi terkuat saya untuk "motion graphic" yang sesungguhnya. Animasi vektor
dengan *state machine* yang bisa **merespons tap dan progres tamu**: amplop yang benar-benar
membuka saat disentuh, karakter yang bereaksi saat RSVP terkirim. File-nya ~50–200 KB melawan 2 MB
video, tajam di segala ukuran, dan punya alpha. Ongkosnya: **satu dependensi baru**
(`@rive-app/react-canvas`) dan file `.riv` harus dibuat di editor Rive — bukan sesuatu yang bisa
di-generate. Kalau mau ambil jalur ini, putuskan **sebelum** desain dimulai.

**3. Lottie** — sepupu Rive yang lebih ringan urusannya (JSON dari After Effects), tapi tanpa
interaktivitas. Bagus untuk motion graphic linear di dalam chapter.

**4. Shader WebGL untuk latar** — kain sutra, tinta menyebar, aurora yang tidak pernah berulang,
~5 KB dan tak terbatas. Trade-off jujurnya: baterai dan performa di Android kelas bawah, dan tema
undangan dibuka justru di HP seperti itu.

**5. Yang paling saya sarankan: hybrid.** Satu klip sinematik hasil generate sebagai panggung
(poster → intro → loop, sesuai 6.1) + seluruh motion di depannya vektor/CSS. Kombinasi ini yang
memberi kesan "video" tanpa membayar 8 MB dan tanpa kehilangan ketajaman teks-di-atas-motion.

**Aturan motion yang tidak bisa ditawar:**
- **Jangan animasikan `transform: scale()` pada foto raster.** Ken Burns zoom = foto buram, berapa
  pun resolusinya. Render gambar 108–116% dari frame lalu animasikan **`translate` saja**.
  (Boleh `scale()` pada vektor/SVG/kanvas — ini murni soal raster.)
- **Posisi acak partikel harus di-seed sekali**, tidak diacak tiap frame render.
- **Hormati `prefers-reduced-motion`** — sediakan jalur diam untuk setiap animasi besar.
- **Sudut membulat halus**: kartu 18–22px, input 12px, tombol pill.
- Padding section lega, ~86–96px vertikal.

---

## Bagian 7 — Deliverable: bentuk serah-terima yang membuat migrasi mekanis

Yang diminta: **satu file HTML mandiri** yang bisa dibuka di browser, plus blok README di
dalamnya. Delapan syarat berikut yang menentukan migrasinya sehari atau seminggu.

**1. Satu objek `data` tiruan di paling atas `<script>`,** persis mengikuti nama field Bagian 3.
Ini yang saya diff terhadap data asli. Isinya placeholder ("Nama Mempelai Pria"), bukan nama nyata.

**2. Sediakan tiga skenario data di objek yang sama** dan bisa ditukar lewat satu variabel:
`FULL` (semua terisi, 3 acara, 12 foto, 25 ucapan, nama bergelar panjang), `MINIMAL` (hanya field
wajib, tanpa galeri/love story/gift), `EMPTY` (baru dibuat, hampir semuanya kosong). Desain yang
hanya cantik di `FULL` akan gagal di produksi — mayoritas undangan tidak lengkap.

**3. Tandai setiap teks/gambar dinamis dengan `data-bind`:**

```html
<h1 data-bind="groom.nickname">Doni</h1>
<img data-bind="meta.photo" src="placeholder.jpg">
<p  data-bind="events[].venue">Gedung Serbaguna</p>
```

Ini konvensi terpenting di dokumen ini — dengan `data-bind`, porting jadi penggantian mekanis,
bukan pembacaan ulang desain baris per baris.

**4. Section pakai ID standar** Bagian 4 (`xx-home`, `xx-mempelai`, dst).

**5. Semua design token di satu blok `:root`** — warna (4–6 hex bernama), skala tipografi, radius,
durasi & easing motion. Satu sumber, bukan nilai bertebaran.

**6. Font lewat Google Fonts `@import`,** sebutkan nama & ukuran finalnya di README.

**7. Tabel timeline motion** di README: tiap animasi — pemicu, durasi, easing, dan apa yang terjadi
saat `prefers-reduced-motion`. Untuk paradigma non-linear, sertakan **diagram state**: chapter apa
saja, cara pindah antar chapter, dan bagaimana tamu kembali.

**8. Daftar aset yang dibutuhkan** — untuk tiap aset: ukuran, rasio, format, perilaku loop, dan
**prompt yang disarankan**. Kalau aset belum ada, pakai placeholder yang jelas, jangan gambar acak
dari internet.

**Tandai eksplisit mana section yang opsional**, dan catat kalau ada data yang kamu butuhkan tapi
tidak ada di Bagian 3 — jangan diasumsikan ada.

---

## Bagian 8 — Checklist sebelum kirim balik

- [ ] Tidak ada satu pun `vh` / `vw` (kecuali rumus penjangkaran Bagian 2)
- [ ] Tidak ada `position: sticky` untuk lapisan penuh-tinggi
- [ ] Tidak ada `window.scrollTo` / listener scroll di `window`
- [ ] Tidak ada `@media (min-width: …)` yang mengubah layout
- [ ] Tidak ada `transform: scale()` pada foto raster
- [ ] Tiap chapter menyatakan perilaku luapannya — (a) atau (b) di Bagian 5.1
- [ ] Diuji dengan skenario `FULL`, `MINIMAL`, dan `EMPTY`
- [ ] Info tamu (dresscode/live/gift/turut) berada **sebelum** RSVP
- [ ] Tombol musik & navigasi terjangkau dari chapter mana pun
- [ ] Tiap section opsional benar-benar hilang saat datanya kosong
- [ ] Tidak ada nama/tanggal/foto asli yang di-hardcode
- [ ] Semua teks dinamis punya `data-bind`
- [ ] Ada jalur `prefers-reduced-motion`
- [ ] Tidak butuh library JS eksternal selain yang disepakati di Bagian 6.3

---

## Bagian 9 — Yang terjadi di sisi Claude Code saat migrasi

Sebagai gambaran ongkos, bukan tugas kamu. Prototipe diterjemahkan ke
`src/themes/NamaTemaTheme.jsx`, lalu didaftarkan di empat titik yang harus sinkron:
`constants.js` (`THEMES` + `THEME_CATEGORY_MAP`), `defaultData.js` (`DEFAULT_THEMES`),
`InvitationTemplate.jsx` (lazy import + `THEME_COMPONENTS`), dan satu migration seed tabel `themes`.

Kolom `layout` di database **wajib sama persis** dengan nilai `THEMES.*` — kalau meleset, tema jatuh
ke tema bawaan tanpa pesan error apa pun. `theme_type` tetap `'photo'` walau latarnya video: kolom
itu menjawab "apakah pasangan yang harus menyetor videonya", dan video tema ikut dengan temanya.

Verifikasi: `npm run build` + `eslint` (tanpa dev server), lalu commit & push ke `main`.
Dua aturan lint yang paling sering menggigit di tema bermotion: `react-hooks/purity` melarang
`Math.random()` / `Date.now()` / `matchMedia` saat render — pakai lazy initializer
`useState(() => …)`; dan `react-hooks/immutability` mempersoalkan mutasi seperti
`video.currentTime = 0` tergantung cara ref-nya dialiaskan.
