# Keputusan: tiap vendor punya desain sendiri

Dicatat 1 September 2026, setelah vendor pertama (FM Project) tayang dan sebelum vendor kedua
(MUA) didesain.

## Keputusannya

**Setiap vendor yang bergabung mendapat desain halaman sendiri, bukan memilih dari katalog.**

Kolom `theme` di tabel `vendors` berfungsi sebagai **buku alamat, bukan menu**: ia menunjuk ke
komponen milik vendor itu. Diisi admin sekali saat vendor bergabung, dan **tidak muncul di
dashboard vendor** — desainnya dibuat untuk mereka, jadi tidak masuk akal Fazri bisa memilih
desain milik MUA.

Polanya menyalin tema undangan bespoke yang sudah jalan: `themeId` cuma kunci, tiap tema adalah
komponennya sendiri di `THEME_COMPONENTS` (`src/pages/InvitationTemplate.jsx`).

## Kenapa bukan template bersama

Keautentikan adalah nilai jualnya. Vendor tidak mau halamannya terasa seperti template — itu
yang membedakannya dari Linktree, dan itu yang membuat mereka mau menyebarkan tautannya.

Kategorinya juga menuntut hal yang berbeda. Halaman fotografer sinematik memakai scrim gelap di
atas foto; untuk MUA scrim itu merusak barang dagangannya, karena yang dijual justru ketepatan
warna kulit dan riasan. Dua kebutuhan itu tidak bisa didamaikan oleh satu palet yang bisa
disetel.

## Risiko yang diterima, dan cara menahannya

**Perilaku bersama akan tersalin sebanyak jumlah vendor.**

Halaman vendor bukan cuma tampilan. Di dalamnya sudah ada lightbox, karosel paket, mosaik galeri
dengan aturan langkah koprima, formulir data acara sebelum WhatsApp, blok referal, dan empat
pelacakan event. Kalau vendor ketujuh ada dan kita menemukan bug di formulir data acara, ia harus
diperbaiki tujuh kali — dan satu pasti terlewat.

Ini bukan hipotetis. Bug langkah mosaik (langkah 7 yang tidak koprima dengan 14 foto sehingga
mosaik hanya menampilkan 2 foto) persis jenis itu, dan waktu itu salinannya baru satu.

Penahannya: **pisahkan mesin dari kulitnya**, dua tingkat seperti tema undangan.

| Bersama, sekali saja | Milik tiap vendor |
|---|---|
| Ambil data, pelacakan event | Palet, tipografi |
| Lightbox, formulir WA, blok referal | Tata letak, ritme, motion |
| Normalisasi paket, aturan mosaik galeri | Ornamen, karakter |

## Urutan pengerjaan — ini bagian yang paling mudah salah

1. **Halaman MUA dibuat sebagai komponen kedua yang berdiri sendiri.** Biarkan ada duplikasi.
2. **Setelah itu baru tarik keluar yang benar-benar sama.**
3. Vendor ketiga dan seterusnya tinggal menulis kulitnya.

Alasannya: abstraksi dari satu contoh hampir selalu memotong di tempat yang salah. Dengan dua
contoh nyata di depan mata, sambungannya kelihatan sendiri — mana yang kebetulan mirip, mana
yang memang bersama.

Mengabstraksi di vendor kelima sudah terlambat: lima salinan yang sudah saling menyimpang jauh
lebih mahal didamaikan daripada dua.

**Syaratnya: penarikan mesin dikerjakan setelah halaman MUA jadi, sebelum vendor ketiga masuk.**

## Catatan teknis untuk saat mengerjakannya

- `theme` yang tidak dikenal **tidak boleh membuat halaman gagal**. Jatuhkan ke komponen dasar.
  Tema undangan pernah kena ini: fallback-nya `themes[0]` — "baris pertama menurut id" — sehingga
  undangan bisa tampil dengan tema, palet, dan tata letak yang sama sekali berbeda tanpa error di
  mana pun.
- Kolomnya butuh nilai bawaan supaya vendor lama tetap tayang saat kolomnya ditambahkan.
- Panduan untuk sesi desainnya ada di `docs/VENDOR_PAGE_GUIDE.md` — mandiri, bisa ditempel utuh.

## Yang sengaja ditunda

Bespoke per vendor tidak menskala sebagai **bisnis**, bukan cuma sebagai kode: tiap vendor
memakan satu sesi desain plus porting. Untuk lima sampai sepuluh vendor pertama itu justru
investasi yang benar — mereka etalase, dan halamannya yang menjual Ulema ke vendor berikutnya.

Di suatu titik akan perlu bertingkat: vendor unggulan dapat bespoke, vendor biasa memilih dari
tiga-empat template bagus. Keputusan itu butuh data yang belum ada. **Jangan diputuskan
sekarang.**
