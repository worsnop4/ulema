-- Testimoni ditata sebagai dinding bukti, bukan carousel.
--
-- Tangkapan layar bekerja lewat jumlahnya: melihat dua puluh percakapan
-- sekaligus meyakinkan dengan cara yang tidak bisa ditiru satu kartu besar.
-- Carousel justru menyembunyikan berapa banyak yang ada. Dua akibatnya:
--
--   1. Batasnya naik dari 12 ke 24. Dinding memang untuk diisi.
--   2. Tiap tangkapan layar disimpan dua ukuran. Ubin di dinding paling lebar
--      260px, tapi tanpa ukuran kecil browser tetap mengunduh 24 gambar 900px
--      -- sekitar 6MB hanya untuk bagian testimoni.
--
-- 'thumb' sengaja tidak wajib: baris yang terlanjur tersimpan sebelum ini
-- tetap sah dan jatuh kembali ke gambar penuh di halaman.

comment on column public.vendors.testimonials is
  'Tangkapan layar percakapan klien: [{"image":"https://...","thumb":"https://...","event":"Wedding Anindya & Reza","date":"2025-01-12"}]. thumb opsional (ubin dinding); tanpa itu halaman memakai image. Tanggal YYYY-MM-DD.';

create or replace function public.update_vendor_content(
  p_stats        jsonb default null,
  p_testimonials jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id    uuid;
  v_stats jsonb;
  v_testi jsonb;
begin
  if auth.uid() is null then
    raise exception 'Harus masuk untuk mengubah konten.';
  end if;

  select id into v_id from public.vendors where user_id = auth.uid();
  if v_id is null then
    raise exception 'Akun ini tidak terhubung ke vendor mana pun.';
  end if;

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
    -- Baris tanpa tangkapan layar dibuang di sini, bukan sekadar disembunyikan
    -- di form: tanpa gambarnya, testimoni ini kehilangan seluruh alasannya ada.
    -- Alamat gambar wajib http(s) supaya kolomnya tidak bisa diisi skema lain;
    -- thumb yang tidak memenuhi itu dibuang jadi null, bukan membatalkan
    -- barisnya -- halaman sudah tahu cara jatuh kembali ke gambar penuh.
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

  update public.vendors
     set stats        = coalesce(v_stats, stats),
         testimonials = coalesce(v_testi, testimonials)
   where id = v_id;
end;
$$;

revoke all on function public.update_vendor_content(jsonb, jsonb) from public, anon;
grant execute on function public.update_vendor_content(jsonb, jsonb) to authenticated;
