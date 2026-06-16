# Panduan Pengunggahan Aset Avatar Mempelai

Folder ini digunakan untuk menyimpan berkas gambar avatar statis (PNG/JPG) yang siap diunduh oleh pengguna di dashboard mereka.

## Struktur Direktori Avatar

Aset gambar diletakkan di dalam subfolder berdasarkan kategori masing-masing:

```
public/avatars/
├── Hijab/        <-- Berisi gambar avatar mempelai wanita berhijab
├── Tanpa Hijab/  <-- Berisi gambar avatar mempelai wanita tanpa hijab
├── Pria/         <-- Berisi gambar avatar mempelai pria (jas, beskap, dll)
├── Adat/         <-- Berisi gambar avatar mempelai adat/tradisional
├── Pasangan/     <-- Berisi gambar ilustrasi pasangan/cincin/dekorasi
└── placeholder.svg (Siluet profil bawaan sistem)
```

## Cara Kerja Sistem:
1. Pengguna/Admin dapat meregistrasikan nama berkas baru (contoh: `hijab-pink.png`) dan Kategori (contoh: `Hijab`) melalui panel Kelola Ilustrasi di Admin Dashboard.
2. Tempatkan berkas gambar fisik dengan nama file yang persis sama di dalam folder kategorinya (contoh: `/public/avatars/Hijab/hijab-pink.png`).
3. Sistem akan secara otomatis memuat gambar tersebut di dashboard pengguna dan menyediakan tombol unduh berkas statis. Jika berkas fisik belum diunggah, sistem akan memuat siluet `placeholder.svg` sebagai cadangan.
