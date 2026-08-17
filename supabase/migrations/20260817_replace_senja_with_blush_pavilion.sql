-- Senja Diorama → Blush Pavilion.
--
-- Penggantian total, bukan tema baru: slot id 22 dan kode MOT-001 dipakai
-- ulang. Senja dibangun dari bentuk SVG tanpa satu pun aset, dan justru itu
-- yang membuatnya tidak pernah terasa masuk kategori Motion.
--
-- Aman karena tidak ada yang memakainya. Diperiksa sebelum penggantian ini
-- dibuat: nol undangan dengan themeId 22 dari 52 baris yang ada. Kalau kelak
-- ada tema lain yang mau diganti begini, periksa dulu dengan cara yang sama —
-- undangan menyimpan theme_id, dan mengganti isi sebuah id akan mengubah
-- tampilan undangan yang sudah terbit tanpa pemiliknya tahu.
--
-- `layout` wajib sama persis dengan THEMES.BLUSH_PAVILION di
-- src/config/constants.js: kolom itulah yang dipetakan ke komponen di
-- THEME_COMPONENTS. Bila salah satunya tertinggal, tema dengan layout tak
-- dikenal jatuh ke tema bawaan tanpa pesan apa pun.
--
-- theme_type tetap 'photo' meski latarnya video: kolom itu menjawab "apakah
-- pasangan yang harus menyetor videonya", dan FotoVideoForm.jsx menukar kotak
-- unggah cover dari foto menjadi video ketika nilainya 'video'. Video tema ini
-- ikut dengan temanya; pasangannya tetap mengunggah foto cover.
update themes set
  name = 'Blush Pavilion',
  emoji = '🌸',
  thumbnail = '/themes/Motion/theme-4/thumb.jpg',
  layout = 'blush-pavilion',
  colors = '["#FBF6F2","#A96A63","#A9C4CB"]',
  description = 'Tema Motion taman pastel: paviliun mawar dengan air mancur, lampu kristal, dan tirai yang menggantung. Undangan dibuka pada aula gelap berlampu kristal, lalu seluruh layar mekar menjadi taman. Potret bundar seperti medali taman, dan galeri yang terjalin seperti susunan bata.',
  category = 'Motion',
  theme_type = 'photo',
  visible = true
where id = 22;
