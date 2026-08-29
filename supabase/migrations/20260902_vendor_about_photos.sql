-- Blok Tentang kini memakai pita foto seperti hero, jadi ia butuh tiga foto,
-- bukan satu. Kolom lama about_photo_url dibiarkan: ia masih dipakai sebagai
-- cadangan kalau about_photos belum diisi, jadi vendor lama tidak berubah.

alter table public.vendors
  add column if not exists about_photos jsonb not null default '[]'::jsonb;

comment on column public.vendors.about_photos is
  'Tiga foto untuk blok Tentang: ["url1","url2","url3"]. Kosong -> pakai about_photo_url lalu ekor gallery.';

drop function if exists public.get_vendor_by_slug(text);
create or replace function public.get_vendor_by_slug(p_slug text)
returns table (
  id uuid, slug text, name text, category text, city text, tagline text,
  description text, logo_url text, cover_url text, gallery jsonb,
  whatsapp text, instagram text, website text, email text,
  headline text, headline_accent text, about_title text, about_photo_url text,
  about_photos jsonb, hero_photos jsonb, stats jsonb, facts jsonb,
  packages jsonb, package_note text, package_footnote text, testimonials jsonb,
  price_from integer, price_to integer, verified boolean, referral_code text
)
language sql
security definer
set search_path = public
as $$
  select v.id, v.slug, v.name, v.category, v.city, v.tagline,
         v.description, v.logo_url, v.cover_url, v.gallery,
         v.whatsapp, v.instagram, v.website, v.email,
         v.headline, v.headline_accent, v.about_title, v.about_photo_url,
         v.about_photos, v.hero_photos, v.stats, v.facts,
         v.packages, v.package_note, v.package_footnote, v.testimonials,
         v.price_from, v.price_to, v.verified, p.referral_code
  from vendors v
  join profiles p on p.id = v.user_id
  where lower(v.slug) = lower(p_slug) and v.visible = true;
$$;
grant execute on function public.get_vendor_by_slug(text) to anon, authenticated;

-- Tiga foto untuk blok Tentang FM Project, dipilih berbeda dari hero
-- (hero memakai fm-01, fm-04, fm-09).
update public.vendors set about_photos = jsonb_build_array(
  '/vendors/fm-project/full/fm-19.jpg',
  '/vendors/fm-project/full/fm-13.jpg',
  '/vendors/fm-project/full/fm-16.jpg'
) where slug = 'fm-project';
