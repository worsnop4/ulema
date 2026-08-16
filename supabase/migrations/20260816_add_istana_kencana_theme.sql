-- Istana Kencana — tema kedua di kategori Motion.
--
-- Diseed baru sekarang, di akhir pembuatan, bukan bersamaan bagian
-- pertamanya. Katalog membaca langsung dari tabel ini, jadi tema setengah
-- jadi di sini langsung bisa dipilih pelanggan yang membayar.
--
-- `do update`, bukan `do nothing`, mengikuti 20260808: insert `do nothing`
-- diam-diam tidak melakukan apa pun kalau id-nya sudah terpakai, dan
-- temanya lalu tidak pernah muncul — itu sudah pernah memakan satu ronde
-- penelusuran. Aman dijalankan ulang.
--
-- Id 23 adalah id bebas berikutnya (tabel ini sekarang berisi 7–22). Ia
-- harus sama dengan DEFAULT_THEMES di src/data/defaultData.js; ketidak-
-- cocokan antara keduanya persis yang melahirkan baris Opaline Pearl ganda
-- pada 2026-08-10.
--
-- theme_type 'photo', meskipun latarnya video. Kolom ini tidak menjawab
-- "apakah tema ini memakai video" melainkan "apakah pasangan yang harus
-- menyetor videonya": FotoVideoForm.jsx menukar kotak unggah cover dari foto
-- menjadi video ketika nilainya 'video'. Video Istana Kencana ikut dengan
-- temanya, dan pasangannya tetap mengunggah foto cover untuk bingkai
-- lengkung di halaman pembuka — jadi 'photo' yang benar.
insert into themes (id, name, code, emoji, thumbnail, layout, colors, description, category, theme_type, visible) values
  (23, 'Istana Kencana', 'MOT-002', '🏛️', '/themes/Motion/theme-2/thumb.jpg', 'istana-kencana',
   '["#F7F1E6","#A8823A","#3A2E23"]',
   'Tema Motion sinematik: tamu tiba di gerbang emas yang beku, dan begitu undangan dibuka kameranya berjalan sendiri menembus gerbang, halaman istana, dan lorong pualam sampai berhenti di tangga ballroom di bawah lampu kristal yang bernapas pelan selamanya. Marmer gading dengan tulisan gelap, satu-satunya tema terang di kategori ini.',
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
