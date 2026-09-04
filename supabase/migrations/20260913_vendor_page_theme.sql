-- Kolom penunjuk halaman: tiap vendor punya komponennya sendiri.
--
-- Keputusannya ada di docs/ARSITEKTUR_HALAMAN_VENDOR.md. Ringkasnya: kolom ini
-- BUKAN menu yang bisa dipilih vendor, melainkan buku alamat yang diisi admin
-- sekali saat vendor bergabung. Karena itu ia tidak ada di update_vendor_content
-- -- kalau ikut dibuka di sana, vendor bisa memakai desain milik vendor lain
-- lewat API, dan itu persis yang dijual halaman ini: bukan template.
--
-- Nilai bawaannya sengaja 'fm-project', bukan null. Vendor yang sudah ada
-- harus tetap tayang persis seperti sebelumnya begitu kolom ini ditambahkan.
alter table public.vendors
  add column if not exists theme text not null default 'fm-project';

comment on column public.vendors.theme is
  'Komponen halaman publik milik vendor ini. Diisi admin, bukan vendor. Nilai tak dikenal jatuh ke desain dasar di sisi klien, tidak boleh membuat halaman gagal.';

update public.vendors set theme = 'mila-putri' where slug = 'mila-putri-makeup';

-- Fungsi baca publik ikut diperbarui. Tanpa ini kolomnya tersimpan tapi tidak
-- pernah sampai ke halaman, dan setiap vendor akan tampil sebagai FM Project.
drop function if exists public.get_vendor_by_slug(text);
create or replace function public.get_vendor_by_slug(p_slug text)
returns table (
  id uuid, slug text, name text, category text, city text, tagline text,
  description text, logo_url text, cover_url text, gallery jsonb,
  whatsapp text, instagram text, website text, email text,
  headline text, headline_accent text, about_title text, about_photo_url text,
  about_photos jsonb, hero_photos jsonb, stats jsonb, facts jsonb,
  packages jsonb, package_note text, package_footnote text, testimonials jsonb,
  before_after jsonb, service_types jsonb, theme text,
  price_from integer, price_to integer, verified boolean, referral_code text
)
language sql
security definer
set search_path = public
as $fn$
  select v.id, v.slug, v.name, v.category, v.city, v.tagline,
         v.description, v.logo_url, v.cover_url, v.gallery,
         v.whatsapp, v.instagram, v.website, v.email,
         v.headline, v.headline_accent, v.about_title, v.about_photo_url,
         v.about_photos, v.hero_photos, v.stats, v.facts,
         v.packages, v.package_note, v.package_footnote, v.testimonials,
         v.before_after, v.service_types, v.theme,
         v.price_from, v.price_to, v.verified, p.referral_code
  from public.vendors v
  left join public.profiles p on p.id = v.user_id
  where v.slug = p_slug and v.visible = true;
$fn$;

revoke all on function public.get_vendor_by_slug(text) from public;
grant execute on function public.get_vendor_by_slug(text) to anon, authenticated;
