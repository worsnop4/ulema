# Rencana — Portofolio Vendor & Komisi

Vendor pernikahan (venue, fotografer, WO, MUA, katering) punya halaman portofolio di Ulema,
dan mendapat komisi dari undangan yang terjual lewat mereka.

Dokumen ini rencana, bukan spesifikasi final. Bagian **Keputusan yang saya butuhkan** di bawah
harus dijawab sebelum baris kode pertama ditulis.

---

## 1. Temuan: mesin komisinya sudah ada, yang belum ada justru penghubungnya

Sebelum merancang apa pun saya periksa isi repo dan database. Hasilnya mengubah bentuk rencana ini
seluruhnya.

**Yang sudah jalan penuh hari ini:**

| Bagian | Status | Letak |
|--------|--------|-------|
| Kode referral per pengguna | ada | `profiles.referral_code` |
| Saldo komisi | ada | `profiles.wallet_balance` |
| Riwayat komisi | ada | tabel `referral_history` |
| Komisi terbayar otomatis saat pembayaran lunas | **ada** | `api/midtrans/notification.js` |
| Komisi terbayar lewat approval manual admin | ada | `AdminTransactions.jsx` |
| Diskon Rp10.000 untuk pembeli yang memakai kode | ada | `api/midtrans/create-transaction.js` |
| Validasi kode di server (tidak bisa dipalsukan klien) | ada | `create-transaction.js` |
| Tolak referral diri sendiri | ada | `.neq('id', user.id)` |
| Penarikan dana | ada | tabel `withdrawals` + alur WhatsApp |
| Tarif komisi 20%, minimum tarik Rp50.000 | ada | `constants.js` |

Artinya **"vendor dapat komisi dari penjualan undangan" bukan fitur baru.** Vendor pada dasarnya
pengguna yang punya kode referral. Yang benar-benar belum ada cuma dua: identitas vendor beserta
halaman portofolionya, dan — ini yang penting — jalur yang membuat komisinya benar-benar sampai.

---

## 2. Yang menghalangi: atribusinya putus

`ReferralPage.jsx` menyuruh pengguna membagikan `https://ulema.id/r/KODE`.

**Rute itu tidak ada.** Tidak di `App.jsx`, tidak di `middleware.js`, tidak di `vercel.json`.
Yang terjadi saat tautan itu dibuka: rewrite Vercel melempar ke `index.html`, React Router tidak
menemukan `/r/...`, lalu `<Route path="*">` mengalihkan ke `/dashboard`, yang karena belum login
mengalihkan lagi ke halaman masuk. Kodenya hilang di langkah pertama dan tidak pernah sampai ke
mana pun.

Satu-satunya cara sebuah kode referral benar-benar terpakai hari ini adalah **pembeli mengetiknya
sendiri** di kolom voucher saat checkout (`TransactionPage.jsx`). `LoginPage.jsx` pun tidak membaca
parameter `?ref=`.

Untuk pengguna biasa yang mengajak temannya, ini merepotkan tapi masih mungkin — ia bisa bilang
"pakai kodeku ya". Untuk vendor, ini mematikan: seluruh nilai halaman portofolio adalah tamu
mengklik dari sana lalu membeli. Kalau atribusinya bergantung pada calon pembeli mengingat dan
mengetik ulang sebuah kode beberapa hari kemudian, komisinya tidak akan pernah terjadi, dan vendor
akan menyimpulkan Ulema tidak membayar.

**Karena itu Fase 0 di bawah bukan opsional dan bukan bisa ditunda.** Membangun direktori vendor di
atas atribusi yang putus berarti membangun etalase yang tidak pernah mencatat penjualan.

---

## 3. Dua hal yang harus diperiksa sebelum uang vendor sungguhan masuk

Keduanya sudah ada sekarang dan bisa ditoleransi selama komisi hanya antar teman. Begitu penerimanya
badan usaha yang menagih, keduanya jadi masalah serius.

**a. Saldo dikosongkan dari sisi klien.** `ReferralPage.handleWithdraw` menyisipkan baris ke
`withdrawals` lalu menjalankan `update profiles set wallet_balance = 0` **dari browser**. Kalau
policy RLS untuk `profiles` mengizinkan pemilik memperbarui barisnya sendiri tanpa membatasi kolom,
maka pengguna juga bisa menulis `wallet_balance` ke angka berapa pun lalu menariknya. Ini perlu
diverifikasi dengan akun uji yang benar-benar login — saya tidak bisa membacanya dengan kunci anon.
Kalau benar terbuka, perbaikannya: cabut hak tulis kolom itu dari pengguna dan pindahkan seluruh
transisi saldo ke RPC `security definer`, seperti yang sudah dilakukan pada ucapan tamu.

**b. `withdrawals` belum punya policy admin** (sudah tercatat di CLAUDE.md sebagai butir terbuka
nomor 5). Hari ini aman karena klien hanya menyisipkan, tapi layar persetujuan admin tidak akan
membaca apa pun. Vendor yang menagih pembayaran membuat layar itu wajib ada.

---

## 4. Fase

### Fase 0 — Sambungkan atribusinya *(prasyarat, ~1 hari)*

1. Rute `/r/:code` — menyimpan kode lalu mengalihkan ke katalog atau ke halaman vendor.
2. Simpan di `localStorage` **dan** cookie 30 hari. Cookie supaya `middleware.js` bisa membacanya;
   localStorage supaya tetap ada meski cookie pihak ketiga diblokir.
3. `LoginPage` membaca `?ref=` dan menempelkan kode ke profil pembeli saat mendaftar.
4. `TransactionPage` mengisi kolom voucher otomatis dari kode tersimpan, dan menampilkannya sebagai
   "Kamu datang dari **Nama Vendor**" — bukan kolom kosong yang harus diingat sendiri.
5. Aturan atribusi ditetapkan sekali dan ditulis di kode: **last-touch, 30 hari**, kode terakhir
   yang diklik menang, dan voucher yang diketik manual mengalahkan kode tersimpan.

Fase ini sekaligus memperbaiki referral untuk semua pengguna yang sudah ada, bukan cuma vendor.

### Fase 1 — Identitas vendor *(~2 hari)*

Tabel `vendors`, satu baris per vendor, terhubung ke `profiles.id` (vendor tetap pengguna biasa,
jadi ia mewarisi kode referral, dompet, dan penarikan dana yang sudah jalan).

```
id, user_id -> profiles.id, slug (unik), name, category, city,
tagline, description, logo_url, cover_url, gallery (jsonb),
whatsapp, instagram, website, price_from, price_to,
verified (bool), visible (bool), created_at
```

Kategori: Venue · Fotografer · Wedding Organizer · MUA · Katering · Dekorasi · Busana · Hiburan.

RLS: publik hanya membaca yang `visible = true`; vendor menulis barisnya sendiri; admin penuh.
Foto memakai Supabase Storage dan `PhotoUploadBox` yang sudah ada (crop, kompres, unggah) —
tidak perlu membangun apa pun yang baru.

### Fase 2 — Halaman publik *(~3 hari)*

- `/vendor` — direktori, saring per kategori dan kota, kartu memakai pola `LandingCatalog`.
- `/vendor/:slug` — portofolio: sampul, galeri, deskripsi, jangkauan harga, tombol WhatsApp,
  dan **satu ajakan ke katalog undangan yang membawa kode vendor**. Ini yang menghasilkan uangnya.
- Pratinjau tautan (OG) lewat `middleware.js`, memakai persis trik yang sudah dipakai undangan —
  tanpa ini, portofolio yang dibagikan di WhatsApp tampil tanpa gambar.

### Fase 3 — Dasbor vendor *(~2 hari)*

Menu baru di dasbor untuk pengguna yang punya baris vendor: sunting portofolio, dan statistik yang
jujur — berapa klik, berapa yang mendaftar, berapa yang membeli, berapa komisinya. Saldo dan
penarikan dana memakai `ReferralPage` yang sudah ada, tidak dibuat ulang.

### Fase 4 — Moderasi admin *(~1 hari)*

Panel untuk menyetujui, memverifikasi, dan menyembunyikan vendor, plus layar persetujuan penarikan
dana yang tertunda dari butir 3b.

---

## 5. Keputusan yang saya butuhkan

Semuanya mengubah bentuk yang dibangun, jadi jangan dijawab belakangan.

1. **Tarif komisi vendor.** Sekarang 20%. Untuk undangan Rp175.000 itu **Rp35.000** per penjualan.
   Cukup untuk teman yang mengajak teman; kecil untuk venue yang menaruh Ulema di paketnya. Perlu
   tarif berbeda untuk vendor, atau berjenjang menurut volume?
2. **Vendor bayar untuk terdaftar, atau gratis?** Gratis mengisi direktori lebih cepat tapi
   mengundang portofolio kosong. Berbayar memberi pendapatan langsung tapi katalog akan sepi di awal.
3. **Terbuka atau kurasi?** Siapa saja bisa mendaftar dan langsung tampil, atau admin menyetujui
   dulu? Ini menentukan Fase 4 wajib di awal atau bisa menyusul.
4. **Vendor wajib pernah membeli undangan?** Kalau tidak, muncul akun yang hanya menumpang etalase.
5. **Jendela atribusi.** Saya usulkan last-touch 30 hari. Kalau vendor mengharapkan "tamu saya
   selamanya", itu percakapan yang harus terjadi sekarang, bukan setelah ada yang protes.

---

## 6. Yang saya sarankan

Kerjakan **Fase 0 lebih dulu dan terpisah**, lalu berhenti sejenak. Ia memperbaiki bug nyata yang
merugikan setiap pengguna yang pernah membagikan tautan referralnya, nilainya berdiri sendiri tanpa
vendor sama sekali, dan setelah itu jalur uangnya bisa diuji dengan satu transaksi sungguhan.

Membangun direktori vendor lebih dulu berarti mengetahui apakah atribusinya bekerja hanya setelah
vendor pertama menagih komisi yang tidak pernah tercatat.
