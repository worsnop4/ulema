# Panduan Pengunggahan Aset Tema Statis (Developer-Only)

Folder ini digunakan untuk menyimpan aset gambar latar belakang (`bg.png`) dan ornamen sudut/dekorasi (`ornament.png`) masing-masing tema secara terpisah berdasarkan kategori paket.

## Struktur Folder Tema

```
themes/
├── Special/
│   ├── theme-1/ (Classic Elegance)
│   │   ├── bg.png
│   │   └── ornament.png
│   ├── theme-2/ (Rose Garden)
│   │   ├── bg.png
│   │   └── ornament.png
│   └── theme-4/ (Ivory Dream)
│       ├── bg.png
│       └── ornament.png
├── Adat/
│   └── theme-6/ (Tropical Breeze)
│       ├── bg.png
│       └── ornament.png
├── Motion/
│   └── theme-5/ (Lavender Bliss)
│       ├── bg.png
│       └── ornament.png
└── Luxury/
    └── theme-3/ (Midnight Gold)
        ├── bg.png
        └── ornament.png
```

## Ketentuan File Aset:
1. **Latar Belakang (`bg.png`):** Disarankan menggunakan format PNG dengan resolusi tinggi (misal: 1080x1920 piksel) agar tampilan latar belakang di mobile phone terlihat tajam dan tidak pecah.
2. **Ornamen (`ornament.png`):** Wajib menggunakan format PNG transparan agar menyatu dengan latar belakang tema dan tidak menyisakan kotak berwarna putih di sekitarnya.

*Catatan: Jika file `bg.png` atau `ornament.png` belum diunggah, sistem akan otomatis melakukan fallback (cadangan) ke file default bawaan (`/watercolor_bg.png` dan `/watercolor_leaves.png`).*
