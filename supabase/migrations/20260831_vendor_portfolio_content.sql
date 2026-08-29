-- Konten portofolio vendor.
--
-- Desain handoff butuh lebih dari sekadar nama dan galeri: strip statistik,
-- kartu fakta, paket harga, dan testimoni. Semuanya masuk sebagai kolom
-- opsional di tabel vendors, bukan di-hardcode ke halaman, supaya vendor
-- kedua tidak perlu halaman baru.
--
-- Semua boleh kosong. Bagian yang datanya kosong tidak dirender sama sekali,
-- jadi vendor yang hanya punya foto tetap mendapat halaman yang utuh.

alter table public.vendors add column if not exists email            text;
alter table public.vendors add column if not exists headline         text;
alter table public.vendors add column if not exists headline_accent  text;
alter table public.vendors add column if not exists about_title      text;
alter table public.vendors add column if not exists about_photo_url  text;
alter table public.vendors add column if not exists hero_photos      jsonb not null default '[]'::jsonb;
alter table public.vendors add column if not exists stats            jsonb not null default '[]'::jsonb;
alter table public.vendors add column if not exists facts            jsonb not null default '[]'::jsonb;
alter table public.vendors add column if not exists packages         jsonb not null default '[]'::jsonb;
alter table public.vendors add column if not exists package_note     text;
alter table public.vendors add column if not exists package_footnote text;
alter table public.vendors add column if not exists testimonials     jsonb not null default '[]'::jsonb;

comment on column public.vendors.headline_accent is
  'Potongan dari headline yang dicetak warna emas. Harus persis sama dengan salah satu bagian headline, kalau tidak ia diabaikan.';
comment on column public.vendors.hero_photos is
  'Tiga foto sampul: ["url1","url2","url3"]. Kosong -> pakai tiga foto pertama dari gallery.';
comment on column public.vendors.stats is
  '[{"value":"240+","label":"Pernikahan terdokumentasi"}]';
comment on column public.vendors.facts is
  '[{"label":"Basis","value":"Banjar, Jawa Barat"}]';
comment on column public.vendors.packages is
  'Datar: [{"name":...,"price":...,"note":...,"highlight":true,"features":[...]}]. Atau berkelompok kalau daftar harganya memang terbagi: [{"group":"Prewedding","note":"...","items":[{...}]}].';
comment on column public.vendors.testimonials is
  '[{"quote":"...","author":"Anindya & Reza - Jakarta, 2025"}]';
comment on column public.vendors.gallery is
  'Boleh string URL, atau {"url":...}, atau {"thumb":...,"full":...,"caption":...} untuk galeri dua ukuran.';

-- Fungsi baca publik ikut diperbarui. Ia tetap satu-satunya jalur ke
-- referral_code, dan tetap hanya melayani vendor yang sudah visible.
drop function if exists public.get_vendor_by_slug(text);
create or replace function public.get_vendor_by_slug(p_slug text)
returns table (
  id uuid, slug text, name text, category text, city text, tagline text,
  description text, logo_url text, cover_url text, gallery jsonb,
  whatsapp text, instagram text, website text, email text,
  headline text, headline_accent text, about_title text, about_photo_url text,
  hero_photos jsonb, stats jsonb, facts jsonb,
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
         v.hero_photos, v.stats, v.facts,
         v.packages, v.package_note, v.package_footnote, v.testimonials,
         v.price_from, v.price_to, v.verified, p.referral_code
  from vendors v
  join profiles p on p.id = v.user_id
  where lower(v.slug) = lower(p_slug) and v.visible = true;
$$;
grant execute on function public.get_vendor_by_slug(text) to anon, authenticated;
