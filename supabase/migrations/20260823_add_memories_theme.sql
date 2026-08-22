-- Memories — tema keempat di kategori Motion, dan tema pertama yang tidak
-- menggulir ke bawah sebagai satu halaman panjang.
--
-- Id 25 adalah id bebas berikutnya (tabel ini sekarang berisi 1–24). Ia harus
-- sama dengan DEFAULT_THEMES di src/data/defaultData.js, dan `layout` harus
-- sama persis dengan THEMES.MEMORIES di src/config/constants.js — kolom itulah
-- yang dipetakan ke komponen di THEME_COMPONENTS. Bila salah satunya
-- tertinggal, tema dengan layout tak dikenal jatuh ke tema bawaan tanpa pesan
-- apa pun.
--
-- `do update`, bukan `do nothing`, mengikuti 20260808: insert `do nothing`
-- diam-diam tidak melakukan apa pun kalau id-nya sudah terpakai, dan temanya
-- lalu tidak pernah muncul. Aman dijalankan ulang.
--
-- thumbnail sengaja null. Katalog sudah menangani ini (LandingCatalog menukar
-- gambar dengan gradasi warna tema + emoji), dan menunjuk ke berkas yang
-- belum ada justru memberi kartu yang rusak. Diisi begitu ada tangkapan
-- layarnya.
--
-- theme_type 'photo'. Kolom ini tidak menjawab "apakah tema ini memakai
-- video" melainkan "apakah pasangan yang harus menyetor videonya":
-- FotoVideoForm.jsx menukar kotak unggah cover dari foto menjadi video ketika
-- nilainya 'video'. Latar Memories seluruhnya vektor dan ikut dengan temanya;
-- pasangannya tetap mengunggah foto cover.
insert into themes (id, name, code, emoji, thumbnail, layout, colors, description, category, theme_type, visible) values
  (25, 'Memories', 'MOT-004', '💐', null, 'memories',
   '["#FBF7F4","#9C6068","#C6A374"]',
   'Tema Motion yang tidak menggulir ke bawah sebagai satu halaman panjang: undangannya sembilan babak satu layar penuh yang dikunci scroll-snap, dengan bilah progres seperti Stories di atas dan pil navigasi di bawah, sehingga tamu bisa melompat ke babak mana pun. Latar blush pastel bergerak sendiri — cahaya yang hanyut, kabut mawar, dan kelopak berjatuhan — seluruhnya vektor, tanpa satu byte aset video.',
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
