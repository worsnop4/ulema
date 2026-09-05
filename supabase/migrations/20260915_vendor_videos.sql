-- Cuplikan video di tengah galeri.
--
-- Kolom ini SENGAJA tidak ada di update_vendor_content, jadi vendor tidak bisa
-- mengisinya sendiri dari dashboard. Itu bukan kelalaian, itu justru inti
-- fiturnya: foto yang diunggah vendor kita kompres di browser, tapi untuk
-- video tidak ada padanannya -- transcoding di browser butuh ffmpeg.wasm,
-- berat dan lambat di HP. Video yang naik apa adanya dari galeri ponsel
-- berukuran 50-150MB per menit, dan bucket ini publik, jadi setiap pemutaran
-- menarik egress tanpa batas.
--
-- Jadi alurnya: vendor mengirim video mentahnya, kita yang memilih potongan
-- dan mengompresnya (720x1280, tanpa jalur audio, ~650KB per klip), lalu
-- hasilnya dipasang lewat migrasi seperti ini. Sama seperti video latar tema
-- undangan, yang lahir dari cara yang sama.
--
-- Bentuk: [{"src": "...mp4", "poster": "...jpg", "label": "..."}]
-- poster wajib -- tanpa itu ubinnya kosong sampai videonya selesai diunduh,
-- dan videonya sendiri baru diunduh saat masuk layar.
alter table public.vendors
  add column if not exists videos jsonb not null default '[]'::jsonb;

comment on column public.vendors.videos is
  'Cuplikan video pendek yang berputar diam di tengah galeri. Diisi admin dengan berkas yang sudah dikompres, bukan oleh vendor -- tidak ada jalur kompresi video di browser.';

update public.vendors set videos = '[
  {"src":    "https://kfxzzyqmvhnllfhahmdy.supabase.co/storage/v1/object/public/vendor-media/c48076bf-73fb-46f4-90b4-53dd050535d2/mila-video-1.mp4",
   "poster": "https://kfxzzyqmvhnllfhahmdy.supabase.co/storage/v1/object/public/vendor-media/c48076bf-73fb-46f4-90b4-53dd050535d2/mila-video-1-poster.jpg",
   "label":  "Riasan pengantin hijab"},
  {"src":    "https://kfxzzyqmvhnllfhahmdy.supabase.co/storage/v1/object/public/vendor-media/c48076bf-73fb-46f4-90b4-53dd050535d2/mila-video-2.mp4",
   "poster": "https://kfxzzyqmvhnllfhahmdy.supabase.co/storage/v1/object/public/vendor-media/c48076bf-73fb-46f4-90b4-53dd050535d2/mila-video-2-poster.jpg",
   "label":  "Riasan pengantin putih"},
  {"src":    "https://kfxzzyqmvhnllfhahmdy.supabase.co/storage/v1/object/public/vendor-media/c48076bf-73fb-46f4-90b4-53dd050535d2/mila-video-3.mp4",
   "poster": "https://kfxzzyqmvhnllfhahmdy.supabase.co/storage/v1/object/public/vendor-media/c48076bf-73fb-46f4-90b4-53dd050535d2/mila-video-3-poster.jpg",
   "label":  "Riasan pengantin marun"}
]'::jsonb
where slug = 'mila-putri-makeup';

-- Fungsi baca publik ikut diperbarui, kalau tidak kolomnya tersimpan tapi
-- tidak pernah sampai ke halaman.
drop function if exists public.get_vendor_by_slug(text);
create or replace function public.get_vendor_by_slug(p_slug text)
returns table (
  id uuid, slug text, name text, category text, city text, tagline text,
  description text, logo_url text, cover_url text, gallery jsonb,
  whatsapp text, instagram text, website text, email text,
  headline text, headline_accent text, about_title text, about_photo_url text,
  about_photos jsonb, hero_photos jsonb, stats jsonb, facts jsonb,
  packages jsonb, package_note text, package_footnote text, testimonials jsonb,
  before_after jsonb, service_types jsonb, videos jsonb, theme text,
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
         v.before_after, v.service_types, v.videos, v.theme,
         v.price_from, v.price_to, v.verified, p.referral_code
  from public.vendors v
  left join public.profiles p on p.id = v.user_id
  where v.slug = p_slug and v.visible = true;
$fn$;

revoke all on function public.get_vendor_by_slug(text) from public;
grant execute on function public.get_vendor_by_slug(text) to anon, authenticated;
