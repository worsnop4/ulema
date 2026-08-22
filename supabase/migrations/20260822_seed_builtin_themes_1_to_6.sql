-- Seed enam tema bawaan (id 1–6) yang selama ini hanya ada di kode.
--
-- Sejak tabel `themes` jadi otoritatif, getThemes() mengembalikan barisnya apa
-- adanya TANPA menggabungkan DEFAULT_THEMES (src/hooks/useSharedInvitation.js).
-- Akibatnya id 1–6 lenyap dari daftar, dan InvitationTemplate jatuh ke
-- `themes[0]` — baris pertama menurut id, yaitu id 7 Autumn Florals. Undangan
-- yang memilih "Classic Elegance" karena itu bisa tampil sebagai Autumn
-- Florals lengkap dengan paletnya.
--
-- Delapan belas undangan duduk di id yang tidak dikenal tabel ini, tapi tidak
-- satu pun sudah terisi sungguhan (nol punya nama mempelai sekaligus acara) —
-- semuanya draf kosong dari akun yang mendaftar lalu berhenti. Jadi ini ranjau,
-- bukan kerusakan yang sedang berjalan. Yang membuatnya terus terpasang:
-- defaultInvitationData.themeId dulu bernilai 1, sehingga SETIAP undangan baru
-- lahir di id yang tidak dikenal database. Itu diubah ke 7 di commit yang sama.
--
-- visible = false dengan sengaja. Keenamnya tema lama bergambar generik
-- (/images/themes/*.png) dan tidak dijual lagi; LandingCatalog menyaring
-- berdasarkan kolom ini, jadi mereka tidak akan muncul di katalog. Tapi
-- barisnya tetap ada sehingga undangan lama yang memakainya tetap tampil
-- dengan tema yang benar — itulah seluruh maksud seed ini.
--
-- Nilainya disalin persis dari DEFAULT_THEMES di src/data/defaultData.js.
-- Keenamnya memang tidak punya `code` di sana, jadi kolomnya dibiarkan null
-- alih-alih dikarang — kode apa pun yang saya buat di sini akan jadi kebenaran
-- kedua yang tidak cocok dengan berkasnya.
insert into themes (id, name, code, emoji, thumbnail, layout, colors, description, category, theme_type, visible) values
  (1, 'Classic Elegance', null, '🌿', '/images/themes/watercolor.png', 'watercolor-floral',
   '["#134e4a","#d4a96a","#faf7f2"]', 'Tema teal elegan dengan sentuhan emas', 'Special', null, false),
  (2, 'Rose Garden', null, '🌹', '/images/themes/watercolor.png', 'watercolor-floral',
   '["#881337","#fda4af","#fff1f2"]', 'Tema mawar merah muda yang romantis', 'Special', null, false),
  (3, 'Midnight Gold', null, '✨', '/images/themes/darkluxury.png', 'dark-luxury',
   '["#1c1917","#d4a96a","#faf7f2"]', 'Tema gelap mewah dengan aksen emas', 'Luxury', null, false),
  (4, 'Ivory Dream', null, '🕊️', '/images/themes/minimalist.png', 'modern-minimalist',
   '["#4b5563","#d4b896","#fdfaf6"]', 'Tema bersih minimalis dengan krem hangat', 'Special', null, false),
  (5, 'Lavender Bliss', null, '💜', '/images/themes/playful.png', 'playful-illustrative',
   '["#4c1d95","#c4b5fd","#f5f3ff"]', 'Tema ungu lembut yang menawan', 'Motion', null, false),
  (6, 'Tropical Breeze', null, '🌺', '/images/themes/adat.png', 'traditional-adat',
   '["#064e3b","#6ee7b7","#f0fdf4"]', 'Tema hijau tropis segar', 'Adat', null, false)
on conflict (id) do update set
  name = excluded.name, emoji = excluded.emoji, thumbnail = excluded.thumbnail,
  layout = excluded.layout, colors = excluded.colors, description = excluded.description,
  category = excluded.category, visible = excluded.visible;
