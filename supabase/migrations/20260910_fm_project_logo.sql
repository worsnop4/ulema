-- Logo FM Project.
--
-- Berkasnya dipotong dari master 3464x3464 yang 73% isinya ruang kosong --
-- isi sebenarnya cuma 3328x968, rasio 3,44:1. Yang dipasang 900x277 dan 100KB,
-- dari 619KB. Masternya disimpan di design-assets/ yang diabaikan git.
--
-- Alamatnya absolut, bukan lintasan berawalan "/": kolom ini dibaca perayap
-- WhatsApp lewat middleware sebagai og:image, dan perayap itu tidak punya
-- konteks domain untuk melengkapinya sendiri.
--
-- Catatan jujur soal manfaatnya hari ini: middleware memilih
-- `cover_url || logo_url`, dan cover_url FM Project sudah terisi -- jadi baris
-- ini belum mengubah apa pun yang terlihat. Ia baru bekerja kalau cover_url
-- dikosongkan, atau kalau logonya nanti dipasang di halaman portofolio.
update public.vendors
   set logo_url = 'https://ulema.id/Vendor/fm-project-logo.png'
 where slug = 'fm-project';
