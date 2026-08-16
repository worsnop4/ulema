-- Rose Sanctuary — tema ketiga di kategori Motion.
--
-- Diseed di akhir pembuatan, bukan bersamaan bagian pertamanya: katalog
-- membaca langsung dari tabel ini, jadi tema setengah jadi di sini langsung
-- bisa dipilih pelanggan yang membayar.
--
-- `do update`, bukan `do nothing`, mengikuti 20260808: insert `do nothing`
-- diam-diam tidak melakukan apa pun kalau id-nya sudah terpakai, dan temanya
-- lalu tidak pernah muncul. Aman dijalankan ulang.
--
-- Id 24 adalah id bebas berikutnya (tabel ini sekarang berisi 7–23). Ia harus
-- sama dengan DEFAULT_THEMES di src/data/defaultData.js, dan `layout` harus
-- sama dengan THEMES.ROSE_SANCTUARY di src/config/constants.js — kolom itulah
-- yang dipetakan ke komponen di THEME_COMPONENTS. Bila salah satunya
-- tertinggal, tema dengan layout tak dikenal jatuh ke tema bawaan tanpa pesan
-- apa pun.
--
-- theme_type 'photo' meskipun latarnya video. Kolom ini tidak menjawab
-- "apakah tema ini memakai video" melainkan "apakah pasangan yang harus
-- menyetor videonya": FotoVideoForm.jsx menukar kotak unggah cover dari foto
-- menjadi video ketika nilainya 'video'. Video Rose Sanctuary ikut dengan
-- temanya, dan pasangannya tetap mengunggah foto cover untuk bingkai berkubah
-- di halaman pembuka.
insert into themes (id, name, code, emoji, thumbnail, layout, colors, description, category, theme_type, visible) values
  (24, 'Rose Sanctuary', 'MOT-003', '🌹', '/themes/Motion/theme-3/thumb.jpg', 'rose-sanctuary',
   '["#FAF5F0","#8C3A3A","#5E2422"]',
   'Tema Motion cat air: masjid putih dengan air terjun, yang perlahan dikelilingi lengkung emas berukir dan pagar mawar merah tua yang mekar dari tepi layar saat undangan dibuka. Gading dengan tulisan merah anggur, dan kartu mempelai baru terbit setelah bunganya mekar penuh.',
   'Motion', 'photo', true)
on conflict (id) do update set
  name = excluded.name,
  code = excluded.code,
  emoji = excluded.emoji,
  thumbnail = excluded.thumbnail,
  layout = excluded.layout,
  colors = excluded.colors,
  description = excluded.description,
  category = excluded.category,
  theme_type = excluded.theme_type,
  visible = excluded.visible;
