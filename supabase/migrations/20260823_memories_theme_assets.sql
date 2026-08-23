-- Memories: aset panggungnya sudah ada, jadi thumbnail-nya tidak lagi null.
--
-- 20260823_add_memories_theme.sql sengaja menyeed null: temanya dikirim
-- sebelum asetnya jadi, dan menunjuk ke berkas yang belum ada memberi kartu
-- katalog yang rusak — katalog menukar null dengan gradasi warna tema + emoji,
-- yang setidaknya utuh. Sekarang gambarnya ada.
--
-- Gambar yang dipakai adalah still bersih dari pasangan, bukan frame video.
-- Frame video mengandung watermark generatornya di kanan bawah (di tema, 64
-- baris terbawah dipotong justru karena itu), sementara still-nya tidak.
update themes set
  thumbnail = '/themes/Motion/theme-5/thumb.jpg'
where id = 25;
