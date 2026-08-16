-- Istana Kencana → Gilded Palace.
--
-- Migrasi terpisah, bukan menyunting 20260816_add_istana_kencana_theme.sql,
-- mengikuti pola 20260808_fix_velour_olive_theme.sql: berkas yang sudah
-- pernah dijalankan tidak akan dijalankan ulang, jadi menyuntingnya di
-- tempat tidak mengubah apa pun di basis data yang sudah hidup. Urutannya
-- tetap benar untuk basis data baru: baris 23 dibuat lebih dulu, lalu
-- diganti namanya di sini.
--
-- `layout` ikut berubah karena kolom itulah yang dipetakan ke komponen di
-- THEME_COMPONENTS (src/pages/InvitationTemplate.jsx). Nilainya harus sama
-- persis dengan THEMES.GILDED_PALACE di src/config/constants.js dan dengan
-- DEFAULT_THEMES di src/data/defaultData.js — bila salah satunya tertinggal,
-- tema dengan layout tak dikenal jatuh ke tema bawaan tanpa pesan apa pun.
--
-- Undangan tidak menyimpan layout, hanya theme_id, jadi tidak ada baris
-- undangan yang perlu ikut disentuh.
update themes set
  name = 'Gilded Palace',
  layout = 'gilded-palace'
where id = 23;
