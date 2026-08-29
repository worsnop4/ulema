-- Seed vendor pertama: FM Project (fotografer, Banjar Jawa Barat).
--
-- Dijalankan SETELAH akun auth untuk muhammmadfazri@gmail.com dibuat.
--
-- visible = false. Halamannya belum tayang sampai kamu memeriksa isinya dan
-- menyalakannya sendiri di langkah terakhir di bawah.

-- 1. Jadikan akunnya vendor: kode referral tetap, komisi 40%.
update public.profiles
   set referral_code = 'FMPROJECT',
       commission_rate = 0.400,
       name = coalesce(nullif(name, ''), 'FM Project')
 where lower(email) = 'muhammmadfazri@gmail.com';

-- 2. Baris vendornya.
insert into public.vendors (
  user_id, slug, name, category, city,
  headline, headline_accent, tagline,
  about_title, description,
  logo_url, cover_url, about_photo_url, hero_photos, gallery, facts,
  whatsapp, instagram, verified, visible
)
select
  p.id,
  'fm-project',
  'FM Project',
  'Fotografer',
  'Banjar, Jawa Barat',
  E'Merekam hari\nyang tidak\nterulang',
  'terulang',
  'Dokumentasi pernikahan dengan pendekatan tenang dan terstruktur. Melayani seluruh Indonesia, tersedia untuk perjalanan ke luar kota.',
  'FM Project adalah studio dokumentasi pernikahan',
  E'Kami bekerja dalam tim kecil agar kehadiran kamera tetap terasa wajar sepanjang acara. Pendekatan kami dokumenter: mengikuti alur rangkaian, membaca cahaya yang tersedia, dan mengambil keputusan cepat tanpa mengarahkan berlebihan.\nSetiap proyek dimulai dengan pertemuan perencanaan untuk membahas rundown, titik lokasi, dan daftar momen yang wajib terekam. Hasil akhir dikurasi manual, diretouch satu per satu, dan diserahkan dalam galeri digital beserta arsip resolusi penuh.',
  null,
  '/vendors/fm-project/full/fm-01.jpg',
  '/vendors/fm-project/full/fm-19.jpg',
  '["/vendors/fm-project/full/fm-01.jpg", "/vendors/fm-project/full/fm-04.jpg", "/vendors/fm-project/full/fm-09.jpg"]'::jsonb,
  '[{"thumb": "/vendors/fm-project/thumb/fm-02.jpg", "full": "/vendors/fm-project/full/fm-02.jpg", "caption": "Akad"}, {"thumb": "/vendors/fm-project/thumb/fm-03.jpg", "full": "/vendors/fm-project/full/fm-03.jpg", "caption": "Akad"}, {"thumb": "/vendors/fm-project/thumb/fm-05.jpg", "full": "/vendors/fm-project/full/fm-05.jpg", "caption": "Resepsi"}, {"thumb": "/vendors/fm-project/thumb/fm-06.jpg", "full": "/vendors/fm-project/full/fm-06.jpg", "caption": "Resepsi"}, {"thumb": "/vendors/fm-project/thumb/fm-07.jpg", "full": "/vendors/fm-project/full/fm-07.jpg", "caption": "Prewedding"}, {"thumb": "/vendors/fm-project/thumb/fm-08.jpg", "full": "/vendors/fm-project/full/fm-08.jpg", "caption": "Prewedding"}, {"thumb": "/vendors/fm-project/thumb/fm-10.jpg", "full": "/vendors/fm-project/full/fm-10.jpg", "caption": "Resepsi"}, {"thumb": "/vendors/fm-project/thumb/fm-11.jpg", "full": "/vendors/fm-project/full/fm-11.jpg", "caption": "Resepsi"}, {"thumb": "/vendors/fm-project/thumb/fm-12.jpg", "full": "/vendors/fm-project/full/fm-12.jpg", "caption": "Detail busana"}, {"thumb": "/vendors/fm-project/thumb/fm-13.jpg", "full": "/vendors/fm-project/full/fm-13.jpg", "caption": "Potret pengantin"}, {"thumb": "/vendors/fm-project/thumb/fm-14.jpg", "full": "/vendors/fm-project/full/fm-14.jpg", "caption": "Momen keluarga"}, {"thumb": "/vendors/fm-project/thumb/fm-15.jpg", "full": "/vendors/fm-project/full/fm-15.jpg", "caption": "Prosesi adat"}, {"thumb": "/vendors/fm-project/thumb/fm-16.jpg", "full": "/vendors/fm-project/full/fm-16.jpg", "caption": "Prewedding"}, {"thumb": "/vendors/fm-project/thumb/fm-17.jpg", "full": "/vendors/fm-project/full/fm-17.jpg", "caption": "Prewedding"}, {"thumb": "/vendors/fm-project/thumb/fm-18.jpg", "full": "/vendors/fm-project/full/fm-18.jpg", "caption": "Akad"}, {"thumb": "/vendors/fm-project/thumb/fm-19.jpg", "full": "/vendors/fm-project/full/fm-19.jpg", "caption": "Potret"}, {"thumb": "/vendors/fm-project/thumb/fm-20.jpg", "full": "/vendors/fm-project/full/fm-20.jpg", "caption": "Resepsi"}, {"thumb": "/vendors/fm-project/thumb/fm-01.jpg", "full": "/vendors/fm-project/full/fm-01.jpg", "caption": "Akad"}, {"thumb": "/vendors/fm-project/thumb/fm-04.jpg", "full": "/vendors/fm-project/full/fm-04.jpg", "caption": "Resepsi"}, {"thumb": "/vendors/fm-project/thumb/fm-09.jpg", "full": "/vendors/fm-project/full/fm-09.jpg", "caption": "Prewedding"}]'::jsonb,
  '[{"label": "Basis", "value": "Banjar, Jawa Barat"}, {"label": "Layanan", "value": "Akad, resepsi, prewedding"}, {"label": "Instagram", "value": "@fm_project29"}]'::jsonb,
  '087836559589',
  'fm_project29',
  true,
  false
from public.profiles p
where lower(p.email) = 'muhammmadfazri@gmail.com'
on conflict (user_id) do update set
  slug = excluded.slug, name = excluded.name, category = excluded.category,
  city = excluded.city, headline = excluded.headline,
  headline_accent = excluded.headline_accent, tagline = excluded.tagline,
  about_title = excluded.about_title, description = excluded.description,
  cover_url = excluded.cover_url, about_photo_url = excluded.about_photo_url,
  hero_photos = excluded.hero_photos, gallery = excluded.gallery,
  facts = excluded.facts, whatsapp = excluded.whatsapp,
  instagram = excluded.instagram;

-- 3. Yang SENGAJA saya kosongkan, dan kenapa.
--
-- stats, packages, dan testimonials tidak diisi. Ketiganya bukan gaya bahasa,
-- melainkan klaim: jumlah pernikahan yang pernah digarap, harga yang mengikat
-- secara komersial, dan ulasan atas nama orang sungguhan. Handoff-nya memuat
-- contoh untuk ketiganya dan menandainya sebagai placeholder. Menyalakannya
-- ke halaman publik berarti menerbitkan angka dan ulasan karangan atas nama
-- FM Project kepada calon klien yang memakainya untuk mengambil keputusan.
--
-- Isi dengan data asli dari vendornya, lalu jalankan:
--
--   update public.vendors set
--     stats = '[{"value":"240+","label":"Pernikahan terdokumentasi"},
--               {"value":"8 tahun","label":"Pengalaman"}]'::jsonb,
--     packages = '[{"name":"Intimate","price":"Rp 8.500.000",
--                   "features":["Peliputan 6 jam, 2 fotografer"]},
--                  {"name":"Signature","note":"paling dipilih","highlight":true,
--                   "price":"Rp 15.000.000","features":["..."]}]'::jsonb,
--     package_note = 'Harga berlaku untuk area ...',
--     package_footnote = 'Booking diamankan dengan deposit 30%.',
--     testimonials = '[{"quote":"...","author":"Nama - Kota, 2025"}]'::jsonb,
--     email = 'studio@...'
--   where slug = 'fm-project';
--
-- 4. Setelah isinya kamu periksa, baru tayangkan:
--
--   update public.vendors set visible = true where slug = 'fm-project';
