-- Foto pratinjau tautan ikut bisa dipilih vendor.
--
-- Ada tiga peran foto yang berbeda, dan sebelumnya hanya dua yang bisa diatur:
--
--   hero_photos[0]  foto besar di bagian paling atas halaman
--   about_photos[0] foto yang menemani bagian "Tentang"
--   cover_url       TIDAK tampil di halaman sama sekali -- ini gambar yang
--                   muncul saat tautan portofolio dibagikan di WhatsApp
--
-- Yang ketiga justru paling sering dilihat calon klien: ia muncul di layar
-- chat sebelum siapa pun membuka halamannya. Selama ini isinya dari seed dan
-- vendor tidak punya cara mengubahnya.
drop function if exists public.update_vendor_content(jsonb, jsonb, jsonb, text, text);

create or replace function public.update_vendor_content(
  p_stats        jsonb default null,
  p_testimonials jsonb default null,
  p_gallery      jsonb default null,
  p_hero_photo   text  default null,
  p_about_photo  text  default null,
  p_cover_photo  text  default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id      uuid;
  v_stats   jsonb;
  v_testi   jsonb;
  v_gallery jsonb;
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
                             else cover_url end
   where id = v_id;
end;
$$;

comment on function public.update_vendor_content(jsonb, jsonb, jsonb, text, text, text) is
  'Vendor menyunting statistik, testimoni, galeri, serta foto header, Tentang, dan pratinjau tautan. Satu-satunya jalur tulis vendor ke tabel vendors; verified/visible/slug/category/commission_rate tidak terjangkau dari sini.';

revoke all on function public.update_vendor_content(jsonb, jsonb, jsonb, text, text, text) from public, anon;
grant execute on function public.update_vendor_content(jsonb, jsonb, jsonb, text, text, text) to authenticated;
