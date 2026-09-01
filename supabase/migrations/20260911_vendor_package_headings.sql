-- Tiga hal untuk vendor kedua: baris rincian yang bisa jadi judul bagian,
-- batas yang dinaikkan, dan dua kolom baru (sebelum/sesudah, jenis layanan).
--
-- Ketiganya datang dari satu sumber yang sama: daftar harga vendor kedua tidak
-- muat. Daftar "Additional"-nya berisi 13 baris sementara batas kita 12, paket
-- termahalnya 21 rincian sementara batas kita 15, dan tiap paket terbagi tiga
-- bagian ("Makeup busana", "DEKORASI", "BONUS") yang tidak punya tempat di
-- daftar teks datar. Angka batas yang lama ditaksir dari satu contoh; ini
-- contoh keduanya.
--
-- Baris rincian sekarang menerima dua bentuk: teks polos untuk rincian biasa,
-- atau {"text":"DEKORASI","heading":true} untuk baris judul. Yang polos tetap
-- ditulis polos supaya daftar yang sudah tersimpan tidak berubah bentuk hanya
-- karena fitur ini ditambahkan.
--
-- Dua kolom baru diusulkan handoff desain vendor kedua dan diterima:
--
--   before_after   [{"before":url,"after":url,"label":"...","note":"..."}]
--                  Sebelum/sesudah riasan. Untuk MUA ini format yang paling
--                  kuat, dan galeri datar tidak bisa mewakilinya karena
--                  pasangannya yang bermakna, bukan fotonya satu per satu.
--   service_types  ["Bridal akad","Prewedding",...] -- label layanan singkat.
alter table public.vendors add column if not exists before_after  jsonb not null default '[]'::jsonb;
alter table public.vendors add column if not exists service_types jsonb not null default '[]'::jsonb;

comment on column public.vendors.before_after is
  'Pasangan foto sebelum/sesudah riasan: [{"before":"https://...","after":"https://...","label":"Akad - Anindya"}]. Memakai foto ukuran penuh, bukan thumb.';
comment on column public.vendors.service_types is
  'Label layanan singkat untuk chip di hero: ["Bridal akad","Prewedding"].';

drop function if exists public.update_vendor_content(jsonb, jsonb, jsonb, text, text, text, jsonb, text, text);

create or replace function public.update_vendor_content(
  p_stats        jsonb default null,
  p_testimonials jsonb default null,
  p_gallery      jsonb default null,
  p_hero_photo   text  default null,
  p_about_photo  text  default null,
  p_cover_photo  text  default null,
  p_packages     jsonb default null,
  p_pkg_note     text  default null,
  p_pkg_footnote text  default null,
  p_before_after jsonb default null,
  p_services     jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id       uuid;
  v_stats    jsonb;
  v_testi    jsonb;
  v_gallery  jsonb;
  v_packages jsonb;
  v_items    jsonb;
  v_feats    jsonb;
  v_ba       jsonb;
  v_services jsonb;
  g          jsonb;
  i          jsonb;
  f          jsonb;
  v_txt      text;
  v_head     boolean;
begin
  if auth.uid() is null then
    raise exception 'Harus masuk untuk mengubah konten.';
  end if;

  select id into v_id from public.vendors where user_id = auth.uid();
  if v_id is null then
    raise exception 'Akun ini tidak terhubung ke vendor mana pun.';
  end if;

  -- NULL berarti "jangan sentuh kolom ini", supaya form yang hanya mengurus
  -- satu bagian tidak diam-diam mengosongkan bagian lain.

  if p_stats is not null then
    if jsonb_typeof(p_stats) <> 'array' then
      raise exception 'Statistik harus berupa daftar.';
    end if;
    select coalesce(jsonb_agg(
             jsonb_build_object(
               'value', left(btrim(e->>'value'), 16),
               'label', left(btrim(e->>'label'), 48)
             ) order by ord), '[]'::jsonb)
      into v_stats
      from jsonb_array_elements(p_stats) with ordinality as t(e, ord)
     where btrim(coalesce(e->>'value', '')) <> ''
       and btrim(coalesce(e->>'label', '')) <> '';

    if jsonb_array_length(v_stats) > 4 then
      raise exception 'Maksimal 4 statistik.';
    end if;
  end if;

  if p_testimonials is not null then
    if jsonb_typeof(p_testimonials) <> 'array' then
      raise exception 'Testimoni harus berupa daftar.';
    end if;
    select coalesce(jsonb_agg(
             jsonb_strip_nulls(jsonb_build_object(
               'image', btrim(e->>'image'),
               'thumb', case when btrim(coalesce(e->>'thumb', '')) ~ '^https?://'
                             then btrim(e->>'thumb') end,
               'event', left(btrim(e->>'event'), 80),
               'date',  btrim(e->>'date')
             )) order by ord), '[]'::jsonb)
      into v_testi
      from jsonb_array_elements(p_testimonials) with ordinality as t(e, ord)
     where btrim(coalesce(e->>'image', '')) ~ '^https?://'
       and btrim(coalesce(e->>'event', '')) <> ''
       and btrim(coalesce(e->>'date',  '')) ~ '^\d{4}-\d{2}-\d{2}$';

    if jsonb_array_length(v_testi) > 24 then
      raise exception 'Maksimal 24 testimoni.';
    end if;
  end if;

  if p_gallery is not null then
    if jsonb_typeof(p_gallery) <> 'array' then
      raise exception 'Galeri harus berupa daftar.';
    end if;
    select coalesce(jsonb_agg(
             jsonb_strip_nulls(jsonb_build_object(
               'full',    btrim(e->>'full'),
               'thumb',   coalesce(nullif(btrim(coalesce(e->>'thumb', '')), ''), btrim(e->>'full')),
               'caption', nullif(left(btrim(coalesce(e->>'caption', '')), 120), '')
             )) order by ord), '[]'::jsonb)
      into v_gallery
      from jsonb_array_elements(p_gallery) with ordinality as t(e, ord)
     where btrim(coalesce(e->>'full', '')) ~ '^(https?://|/)';

    if jsonb_array_length(v_gallery) > 24 then
      raise exception 'Maksimal 24 foto galeri.';
    end if;
    if jsonb_array_length(v_gallery) = 0 then
      raise exception 'Galeri tidak boleh kosong -- halaman portofolio tanpa foto tidak ada gunanya.';
    end if;
  end if;

  if p_packages is not null then
    if jsonb_typeof(p_packages) <> 'array' then
      raise exception 'Daftar paket harus berupa daftar.';
    end if;

    -- Ditulis sebagai perulangan, bukan satu kueri bersarang dengan lateral
    -- join. Bentuknya tiga tingkat (grup -> paket -> fitur) dan versi kueri
    -- tunggalnya sangat sulit dibaca ulang -- untuk sesuatu yang menyimpan
    -- harga yang mengikat secara komersial, bisa dibaca ulang lebih berharga
    -- daripada beberapa milidetik.
    v_packages := '[]'::jsonb;

    for g in select * from jsonb_array_elements(p_packages) loop
      v_items := '[]'::jsonb;

      if jsonb_typeof(g->'items') = 'array' then
        for i in select * from jsonb_array_elements(g->'items') loop
          -- Paket tanpa nama dibuang: kartu tanpa nama tidak bisa dipilih
          -- pembaca, dan di karosel ia jadi slide kosong.
          continue when btrim(coalesce(i->>'name', '')) = '';

          v_feats := '[]'::jsonb;
          if jsonb_typeof(i->'features') = 'array' then
            for f in select * from jsonb_array_elements(i->'features') loop
              -- Dua bentuk: teks polos, atau {"text":...,"heading":true} untuk
              -- baris judul bagian. #>> '{}' mengambil teks apa adanya, jadi
              -- angka atau boolean yang nyasar tidak membatalkan simpanan.
              if jsonb_typeof(f) = 'object' then
                v_txt  := btrim(coalesce(f->>'text', ''));
                v_head := coalesce(f->>'heading', '') in ('true', 't', '1');
              else
                v_txt  := btrim(coalesce(f #>> '{}', ''));
                v_head := false;
              end if;
              continue when v_txt = '';
              if v_head then
                v_feats := v_feats || jsonb_build_array(
                  jsonb_build_object('text', left(v_txt, 120), 'heading', true));
              else
                -- Tetap teks polos, bukan objek berisi heading:false, supaya
                -- daftar lama tidak berubah bentuk tanpa sebab.
                v_feats := v_feats || to_jsonb(left(v_txt, 120));
              end if;
            end loop;
          end if;

          if jsonb_array_length(v_feats) > 28 then
            raise exception 'Maksimal 28 rincian untuk paket "%".', i->>'name';
          end if;

          v_items := v_items || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
            'name',      left(btrim(i->>'name'), 60),
            'price',     nullif(left(btrim(coalesce(i->>'price', '')), 40), ''),
            'note',      nullif(left(btrim(coalesce(i->>'note',  '')), 120), ''),
            -- Bukan cast langsung ke boolean: nilai yang bukan boolean akan
            -- membatalkan seluruh penyimpanan alih-alih diabaikan.
            'highlight', case when coalesce(i->>'highlight', '') in ('true', 't', '1')
                              then true end,
            'features',  v_feats
          )));
        end loop;
      end if;

      if jsonb_array_length(v_items) > 16 then
        raise exception 'Maksimal 16 paket per kelompok.';
      end if;

      -- Kelompok yang jadi kosong ikut hilang: tab tanpa isi cuma jalan buntu.
      continue when jsonb_array_length(v_items) = 0;

      v_packages := v_packages || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
        'group', nullif(left(btrim(coalesce(g->>'group', '')), 40), ''),
        'note',  nullif(left(btrim(coalesce(g->>'note',  '')), 160), ''),
        'items', v_items
      )));
    end loop;

    if jsonb_array_length(v_packages) > 8 then
      raise exception 'Maksimal 8 kelompok paket.';
    end if;
  end if;

  if p_before_after is not null then
    if jsonb_typeof(p_before_after) <> 'array' then
      raise exception 'Sebelum/sesudah harus berupa daftar.';
    end if;
    -- Keduanya wajib: pasangan yang cuma punya satu sisi bukan sebelum/sesudah,
    -- dan di halaman ia jadi penggeser yang tidak menggeser apa-apa.
    select coalesce(jsonb_agg(
             jsonb_strip_nulls(jsonb_build_object(
               'before', btrim(e->>'before'),
               'after',  btrim(e->>'after'),
               'label',  nullif(left(btrim(coalesce(e->>'label', '')), 80), ''),
               'note',   nullif(left(btrim(coalesce(e->>'note',  '')), 120), '')
             )) order by ord), '[]'::jsonb)
      into v_ba
      from jsonb_array_elements(p_before_after) with ordinality as t(e, ord)
     where btrim(coalesce(e->>'before', '')) ~ '^(https?://|/)'
       and btrim(coalesce(e->>'after',  '')) ~ '^(https?://|/)';

    if jsonb_array_length(v_ba) > 6 then
      raise exception 'Maksimal 6 pasang sebelum/sesudah.';
    end if;
  end if;

  if p_services is not null then
    if jsonb_typeof(p_services) <> 'array' then
      raise exception 'Jenis layanan harus berupa daftar.';
    end if;
    select coalesce(jsonb_agg(to_jsonb(left(btrim(e #>> '{}'), 40)) order by ord), '[]'::jsonb)
      into v_services
      from jsonb_array_elements(p_services) with ordinality as t(e, ord)
     where btrim(coalesce(e #>> '{}', '')) <> '';

    if jsonb_array_length(v_services) > 10 then
      raise exception 'Maksimal 10 jenis layanan.';
    end if;
  end if;

  update public.vendors
     set stats        = coalesce(v_stats, stats),
         testimonials = coalesce(v_testi, testimonials),
         gallery      = coalesce(v_gallery, gallery),
         hero_photos  = case when btrim(coalesce(p_hero_photo, '')) ~ '^(https?://|/)'
                             then jsonb_build_array(btrim(p_hero_photo))
                             else hero_photos end,
         about_photos = case when btrim(coalesce(p_about_photo, '')) ~ '^(https?://|/)'
                             then jsonb_build_array(btrim(p_about_photo))
                             else about_photos end,
         -- Pratinjau tautan dibaca oleh perayap WhatsApp lewat middleware, dan
         -- perayap itu tidak ikut sesi siapa pun. Alamatnya harus absolut --
         -- lintasan berawalan "/" akan tampil rusak di layar chat.
         cover_url    = case when btrim(coalesce(p_cover_photo, '')) ~ '^https?://'
                             then btrim(p_cover_photo)
                             else cover_url end,
         packages     = coalesce(v_packages, packages),
         -- Kosong berarti "hapus catatannya", bukan "jangan sentuh" -- itulah
         -- bedanya dengan NULL, dan vendor harus bisa menghapus catatan yang
         -- sudah tidak berlaku.
         package_note     = case when p_pkg_note is null then package_note
                                 else nullif(left(btrim(p_pkg_note), 300), '') end,
         package_footnote = case when p_pkg_footnote is null then package_footnote
                                 else nullif(left(btrim(p_pkg_footnote), 300), '') end,
         before_after     = coalesce(v_ba, before_after),
         service_types    = coalesce(v_services, service_types)
   where id = v_id;
end;
$$;

comment on function public.update_vendor_content(jsonb, jsonb, jsonb, text, text, text, jsonb, text, text, jsonb, jsonb) is
  'Vendor menyunting statistik, testimoni, galeri, foto header/Tentang/pratinjau tautan, daftar harga, sebelum/sesudah, dan jenis layanan. Satu-satunya jalur tulis vendor ke tabel vendors; verified/visible/slug/category/commission_rate tidak terjangkau dari sini.';

revoke all on function public.update_vendor_content(jsonb, jsonb, jsonb, text, text, text, jsonb, text, text, jsonb, jsonb) from public, anon;
grant execute on function public.update_vendor_content(jsonb, jsonb, jsonb, text, text, text, jsonb, text, text, jsonb, jsonb) to authenticated;

-- Fungsi baca publik ikut diperbarui, kalau tidak dua kolom baru itu tersimpan
-- tapi tidak pernah sampai ke halaman.
drop function if exists public.get_vendor_by_slug(text);
create or replace function public.get_vendor_by_slug(p_slug text)
returns table (
  id uuid, slug text, name text, category text, city text, tagline text,
  description text, logo_url text, cover_url text, gallery jsonb,
  whatsapp text, instagram text, website text, email text,
  headline text, headline_accent text, about_title text, about_photo_url text,
  about_photos jsonb, hero_photos jsonb, stats jsonb, facts jsonb,
  packages jsonb, package_note text, package_footnote text, testimonials jsonb,
  before_after jsonb, service_types jsonb,
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
         v.before_after, v.service_types,
         v.price_from, v.price_to, v.verified, p.referral_code
  from public.vendors v
  left join public.profiles p on p.id = v.user_id
  where v.slug = p_slug and v.visible = true;
$fn$;

revoke all on function public.get_vendor_by_slug(text) from public;
grant execute on function public.get_vendor_by_slug(text) to anon, authenticated;
