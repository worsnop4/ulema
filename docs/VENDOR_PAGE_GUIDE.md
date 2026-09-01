# Ulema — Panduan Halaman Portofolio Vendor (untuk Claude Design)

Dokumen ini mandiri: bisa ditempel utuh ke sesi desain baru tanpa membawa konteks lain.

Yang sedang dibuat: **halaman portofolio publik untuk satu vendor pernikahan**, tayang di
`ulema.id/vendor/<slug>`. Sudah ada satu yang jalan — FM Project (fotografer), gelap dan
sinematik. Yang berikutnya **tidak harus mirip itu sama sekali**, dan sebaiknya memang tidak.

Halaman ini punya dua tugas sekaligus, dan keduanya harus terasa wajar berdampingan:

1. **Memamerkan karya vendor** sampai calon klien mau menghubungi mereka.
2. **Menyalurkan klien itu ke Ulema** lewat kode referal vendor. Vendor dapat komisi dari
   setiap undangan yang terjual pakai kodenya — tarifnya disetel per akun, dan vendor
   pertama mendapat 40%. Blok ini yang membiayai halamannya.

Yang **dikunci** dokumen ini: nama field data, daftar section, dan beberapa aturan perilaku.
Yang **bebas**: palet, tipografi, tata letak, motion, karakter — seluruh desainnya.

---

## Bagian A — Brief (isi dulu sebelum dikirim ke sesi desain)

| | |
|---|---|
| Nama vendor | |
| Kategori | Venue / Fotografer / Wedding Organizer / **MUA** / Katering / Dekorasi / Busana / Hiburan |
| Kota | |
| Tagline / headline yang diinginkan | |
| Karakter yang dituju | (3–5 kata, mis. "lembut, bersih, mewah tapi hangat") |
| Referensi yang disukai | |
| Jumlah foto galeri yang tersedia | (penting — lihat Bagian 4) |
| Rasio foto | potret / lanskap / campur |
| Sudah punya logo? | warnanya terang atau gelap? |
| Daftar harga | berkelompok atau satu daftar? berapa paket? |

---

## Bagian 1 — Catatan khusus untuk kategori MUA

Ini bukan basa-basi, ini yang paling gampang salah.

**Jangan menaruh filter warna, scrim berwarna, atau duotone di atas foto karya.** Halaman FM
Project memakai scrim gelap di atas fotonya dan itu cocok untuk fotografer sinematik. Untuk
MUA itu **merusak barang dagangannya**: yang dijual adalah warna kulit yang akurat, ketepatan
shading, dan warna riasan. Foto yang digelapkan atau dihangatkan sedikit saja membuat calon
klien tidak bisa menilai hasilnya — dan yang lebih buruk, dia bisa menyalahkan MUA-nya.

Turunannya:

- Gradasi di atas foto hanya boleh **netral** (hitam/putih transparan), tidak berwarna, dan
  hanya di area yang memang perlu supaya teks terbaca.
- Latar halaman boleh gelap atau terang — bebas. Tapi **bingkai foto harus netral**, jangan
  memberi border atau glow berwarna yang mengubah persepsi warna kulit di sebelahnya.
- Karya MUA dinilai dari **detail dekat**: mata, alis, kulit, bibir. Beri ruang untuk foto
  yang dilihat besar. Ubin mungil berukuran 100px tidak menunjukkan apa pun tentang riasan.
- Sebagian besar foto MUA adalah **potret vertikal wajah**. Rancang dengan rasio 3:4 atau 4:5
  sebagai bawaan, bukan lanskap.
- Sebelum/sesudah adalah format yang kuat untuk kategori ini. Kalau kamu mau memakainya, lihat
  Bagian 6 — datanya belum ada, jadi harus diusulkan eksplisit.

---

## Bagian 2 — Kontrak data (paling penting)

Semua isi halaman datang dari satu baris di tabel `vendors`. **Nama field di bawah ini
mengikat.** Kalau desain butuh sesuatu yang tidak ada di sini, tulis eksplisit di README —
jangan diasumsikan ada.

### Identitas

| Field | Tipe | Catatan |
|---|---|---|
| `name` | text | "Sari Makeup Artist" |
| `slug` | text | dipakai di URL, tidak tampil |
| `category` | text | "MUA" |
| `city` | text | "Bandung" |
| `tagline` | text | satu kalimat pendek |
| `headline` | text | judul besar di hero |
| `headline_accent` | text | potongan dari `headline` yang dicetak beda warna. **Harus persis sama** dengan salah satu bagian headline, kalau tidak diabaikan |
| `description` | text | paragraf untuk bagian "Tentang" |
| `about_title` | text | judul bagian Tentang |
| `logo_url` | text | URL absolut. Halaman FM gelap, jadi logonya versi terang. **Sesuaikan dengan latar desainmu** |
| `verified` | boolean | badge, opsional dipakai |

### Kontak

| Field | Tipe | Catatan |
|---|---|---|
| `whatsapp` | text | nomor, dipakai membangun tautan `wa.me` |
| `instagram` | text | username tanpa `@` |
| `email` | text | sering kosong |
| `website` | text | sering kosong |

### Foto

| Field | Tipe | Bentuk |
|---|---|---|
| `gallery` | jsonb | `[{"full":"...","thumb":"...","caption":"..."}]`. `thumb` untuk ubin, `full` untuk lightbox. Boleh juga string URL polos (bentuk lama) |
| `hero_photos` | jsonb | `["url"]` — **elemen pertama saja yang dipakai**, sebagai foto besar di hero |
| `about_photos` | jsonb | `["url"]` — elemen pertama, untuk bagian Tentang |
| `cover_url` | text | **tidak tampil di halaman**. Ini gambar pratinjau saat tautan dibagikan di WhatsApp |

### Angka & fakta

| Field | Tipe | Bentuk |
|---|---|---|
| `stats` | jsonb | `[{"value":"240+","label":"Pengantin dirias"}]` — **maksimal 4** |
| `facts` | jsonb | `[{"label":"Basis","value":"Bandung"}]` — dipakai di bagian Tentang, tata 2 kolom |
| `price_from` / `price_to` | integer | rupiah, untuk rentang harga ringkas |

### Daftar harga

`packages` — jsonb, dua bentuk yang keduanya sah:

```json
[{"group":"Bridal","note":"Luar kota kena transport","items":[
  {"name":"Akad","price":"Rp 1.500.000","note":"paling dipilih","highlight":true,
   "features":["Makeup + hijab do","Softlens","Touch up 2 jam"]}
]}]
```

atau datar, tanpa kelompok:

```json
[{"name":"Bridal","price":"Rp 1.500.000","features":["..."]}]
```

Batas: **8 kelompok**, **12 paket per kelompok**, **15 rincian per paket**.
Pendamping: `package_note` (catatan di atas daftar) dan `package_footnote` (catatan kaki).

### Testimoni — baca ini baik-baik

`testimonials` — jsonb. **Bukan kutipan yang diketik.** Isinya tangkapan layar percakapan
WhatsApp atau DM dari klien:

```json
[{"image":"...","thumb":"...","event":"Wedding Anindya & Reza","date":"2025-01-12"}]
```

Alasannya: testimoni yang diketik ulang oleh pemilik halaman selalu terbaca seperti ditulis
oleh pemilik halaman — karena memang begitu, dan pembaca tahu itu. Tangkapan layar tidak
semudah itu dikarang.

Konsekuensi desainnya: kamu menata **gambar tegak berukuran seragam**, bukan blok teks.
Maksimal 24. FM Project menatanya sebagai "dinding bukti" — ubin kecil banyak sekaligus,
karena jumlahnya sendiri yang jadi argumen. Kamu boleh menatanya lain, tapi jangan menatanya
sebagai kartu kutipan besar satu per satu: itu membuang kekuatan formatnya.

`date` selalu `YYYY-MM-DD`, ditampilkan sebagai "12 Januari 2025".

### Referal

| Field | Tipe | Catatan |
|---|---|---|
| `referral_code` | text | mis. "SARIMUA". **Wajib tampil** — lihat Bagian 4 |

---

## Bagian 3 — Section dan ID-nya

Urutan boleh kamu ubah kalau desainnya menuntut, tapi **semua harus ada**, dan ID-nya jangan
diganti — navigasi dan pelacakan mengandalkannya.

| ID | Section | Muncul kalau |
|---|---|---|
| — | Header sticky: logo/nama + nav | selalu |
| `#top` | Hero: headline, tagline, foto, tombol | selalu |
| — | Statistik | `stats` terisi |
| `#galeri` | Galeri foto | `gallery` terisi |
| `#tentang` | Tentang: deskripsi + fakta + foto | `description` atau `facts` terisi |
| `#paket` | Daftar harga | `packages` terisi |
| `#testimoni` | Dinding testimoni | `testimonials` terisi |
| `#kontak` | WhatsApp, Instagram, kota | selalu |
| — | **Blok undangan digital Ulema** | selalu — lihat Bagian 4 |

Tiap section yang isinya kosong **hilang sepenuhnya**, bukan tampil kosong. Rancang supaya
halaman tetap utuh kalau statistik, testimoni, dan paket sama-sama belum diisi — vendor baru
selalu mulai dari keadaan itu.

---

## Bagian 4 — Aturan yang tidak bisa ditawar

**1. Blok undangan digital Ulema wajib ada, dan tidak boleh terasa seperti iklan tempelan.**
Ini yang membiayai halaman vendor. Isinya: ajakan singkat, `referral_code` yang bisa disalin
satu ketuk, keterangan diskon Rp 10.000 untuk pembeli, dan tombol ke katalog Ulema. Tempatkan
di bawah, setelah kontak — bukan di hero. Orang datang untuk melihat karya vendor, bukan
untuk kita.

**2. Tombol "Ambil paket" membuka formulir dulu, baru ke WhatsApp.** Tiga isian: nama, alamat
acara, tanggal acara (pemilih tanggal, bukan teks bebas). Rancang dialognya. Tombol WhatsApp
di tempat lain tetap langsung.

**3. Foto galeri bisa diperbesar (lightbox).** Untuk MUA ini bukan pelengkap — detail riasan
tidak terlihat di ubin kecil.

**4. Jumlah foto galeri tidak tetap.** Vendor mengurusnya sendiri, antara 1 sampai 24. Tata
letak yang hanya benar pada jumlah tertentu akan pecah. FM Project memakai mosaik hanya kalau
foto ≥ 12, dan kisi biasa kalau kurang — kamu boleh cara lain, tapi **sebutkan perilakunya
pada 1, 6, 12, dan 24 foto**.

**5. Mobile bukan butir terbuka.** Handoff FM Project hanya mendesain desktop dan menandai
mobile "menyusul"; itu menghasilkan foto yang menumpuk aneh dan teks yang tabrakan, dan harus
dikerjakan ulang. Kirim keduanya.

**6. Empat interaksi dilacak** — halaman membuka, klik WhatsApp, salin kode, klik katalog.
Pastikan keempatnya adalah elemen yang jelas dan bisa dipasangi handler, bukan area samar.

**7. Batas yang sudah dipagari di server:** 4 statistik, 24 foto, 24 testimoni, 8 kelompok
paket × 12 paket × 15 rincian. Desain yang mengandalkan angka di luar itu tidak akan terisi.

---

## Bagian 5 — Yang bebas, dan yang kami harap kamu ambil risikonya

Palet, tipografi, tata letak, ritme, motion, dan karakter halaman **sepenuhnya milikmu**.

Halaman FM Project gelap (`#0D0B0A`), emas tembaga, tipografi Archivo + Karla, foto besar
di pita. Itu jawaban untuk fotografer sinematik. **Untuk MUA jangan diulang** — kalau dua
vendor berbeda kategori tampil serupa, keduanya jadi terasa seperti template, dan itu
justru merusak nilai halaman ini bagi vendornya.

Hindari juga yang sudah jadi bawaan-otomatis: krem hangat `#F4F1EA` dengan serif display
dan aksen terakota, atau hitam pekat dengan satu warna neon. Keduanya sekarang terbaca
sebagai "desain yang tidak dipilih".

Ambil satu risiko estetis yang benar-benar milik kategori ini. Riasan pengantin punya dunia
sendiri — pigmen, kuas, cahaya jendela, kaca rias, tekstur kulit, momen sebelum keluar
kamar. Itu bahan yang jauh lebih menarik daripada palet mewah generik.

---

## Bagian 6 — Kalau desainmu butuh data yang belum ada

Beberapa ide bagus untuk MUA butuh field yang belum kami punya. Boleh diusulkan, tapi
**tulis eksplisit di README** dengan bentuk datanya, jangan diam-diam dipakai. Contoh yang
sudah kami duga akan muncul:

- **Sebelum/sesudah** — butuh pasangan foto, bukan galeri datar.
- **Jenis riasan per foto** (akad / resepsi / prewedding / wisuda) — butuh label per foto.
  `caption` di galeri bisa dipakai, tapi ia teks bebas, bukan kategori.
- **Jadwal ketersediaan** — belum ada sama sekali.

Kalau desainnya bagus, kami tambahkan kolomnya. Yang tidak boleh: memakai `caption` atau
`facts` untuk sesuatu yang bukan itu, lalu membiarkan kami menemukannya saat porting.

---

## Bagian 7 — Aset dan ukurannya

Foto diunggah vendor lewat dashboard dan dikompresi otomatis di browser. Ukuran jadinya:

| Aset | Ukuran | Perkiraan berkas |
|---|---|---|
| Foto galeri — penuh (lightbox) | lebar 1400px, JPEG q0.72 | ~200 KB |
| Foto galeri — ubin | lebar 600px, JPEG q0.68 | ~55 KB |
| Tangkapan layar testimoni — penuh | lebar 900px, JPEG q0.85 | ~150 KB |
| Tangkapan layar testimoni — ubin | lebar 480px, JPEG q0.72 | ~50 KB |
| Logo | PNG transparan, tinggi ~280px | < 50 KB |

Artinya: **jangan merancang ubin galeri yang tampil lebih lebar dari 600px** tanpa memberi
tahu — ia akan tampil buram. Kalau desainmu butuh foto besar di suatu tempat, sebutkan, dan
kami naikkan ukuran unggahannya.

Untuk placeholder, pakai gambar netral yang jelas placeholder. Jangan foto orang asli dari
internet — halaman ini akan dilihat klien vendor.

---

## Bagian 8 — Deliverable

**Satu file HTML mandiri** yang bisa dibuka langsung di browser, plus blok README di dalamnya.
Tujuh syarat berikut yang menentukan porting-nya sehari atau seminggu.

**1. Satu objek `vendor` tiruan di paling atas `<script>`,** persis mengikuti nama field
Bagian 2. Isinya placeholder, bukan nama orang sungguhan.

**2. Tiga skenario dalam objek yang sama,** bisa ditukar lewat satu variabel:
- `FULL` — 24 foto, 4 statistik, 6 kelompok paket, 12 testimoni, deskripsi panjang.
- `MINIMAL` — hanya nama, kota, WhatsApp, 3 foto. Tanpa statistik, paket, testimoni.
- `EMPTY` — vendor baru: nama dan 1 foto saja.

Desain yang hanya bagus di `FULL` akan gagal di produksi. Vendor baru **selalu** mulai dari
`EMPTY`, dan halaman itulah yang pertama mereka lihat.

**3. Tandai setiap teks dan gambar dinamis dengan `data-bind`:**

```html
<h1 data-bind="headline">Riasan yang tetap kamu</h1>
<img data-bind="gallery[].thumb" src="placeholder.jpg">
<p  data-bind="packages[].items[].price">Rp 1.500.000</p>
```

Ini konvensi terpenting di dokumen ini. Dengan `data-bind`, porting jadi penggantian mekanis
alih-alih membaca ulang desain baris per baris.

**4. Pakai ID section dari Bagian 3** (`#top`, `#galeri`, `#tentang`, `#paket`, `#testimoni`,
`#kontak`).

**5. Semua design token di satu blok `:root`** — 4–6 warna bernama, skala tipografi, radius,
durasi & easing. Satu sumber, bukan nilai bertebaran di seluruh file.

**6. Font lewat Google Fonts `@import`,** dan sebutkan nama serta ukuran finalnya di README.
Kalau font itu berbayar atau tidak ada di Google Fonts, sebutkan penggantinya sekalian.

**7. README di dalam file berisi:**
- Alasan palet dan tipografinya — kenapa **ini** untuk MUA, bukan untuk vendor mana pun.
- Perilaku galeri pada 1, 6, 12, dan 24 foto.
- Tabel motion: tiap animasi — pemicu, durasi, easing, dan apa yang terjadi saat
  `prefers-reduced-motion`.
- Daftar section yang opsional dan bagaimana halaman menutup celahnya saat kosong.
- Data yang kamu butuhkan tapi tidak ada di Bagian 2 (Bagian 6).

**Kirim desktop dan mobile.** Boleh dalam satu file responsif — itu justru lebih disukai.

---

## Lampiran — kenapa dokumen ini sekaku ini soal data, tapi selonggar itu soal desain

Halaman vendor tinggal di aplikasi yang sama dengan undangan, dan mengambil datanya dari satu
baris database yang vendor sunting sendiri lewat dashboard. Kalau nama field bergeser, yang
rusak bukan tampilan — yang rusak adalah kemampuan vendor mengurus halamannya sendiri, dan
itu baru ketahuan berminggu-minggu kemudian.

Sebaliknya, tidak ada satu pun alasan teknis untuk membuat MUA tampil seperti fotografer.
Yang kami jual ke vendor adalah halaman yang terasa milik mereka. Bagian itu memang milikmu.
