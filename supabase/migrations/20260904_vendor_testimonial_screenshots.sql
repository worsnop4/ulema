-- Testimoni berubah dari kutipan yang diketik menjadi tangkapan layar.
--
-- Alasannya bukan teknis. Testimoni yang diketik ulang oleh pemilik halaman
-- selalu terbaca seperti ditulis oleh pemilik halaman -- karena memang begitu
-- adanya, dan pembaca tahu itu. Tangkapan layar percakapan WhatsApp atau DM
-- tidak bisa dikarang semudah itu, jadi bobotnya berbeda.
--
-- Bentuk baru: {"image": url, "event": "Wedding Anindya & Reza", "date": "2025-01-12"}
-- Vendor hanya mengetik acara dan tanggalnya; isinya datang dari kliennya.

-- ── 1. Tempat menyimpan tangkapan layar ────────────────────────────────────
-- Bucket sendiri, terpisah dari invitation-media. Aturannya memang beda:
-- galeri vendor terbuka selamanya, sedangkan foto undangan idealnya ikut masa
-- aktif paket. Kalau tercampur, keduanya jadi susah diatur belakangan.
insert into storage.buckets (id, name, public)
values ('vendor-media', 'vendor-media', true)
on conflict (id) do nothing;

drop policy if exists "Public reads vendor media" on storage.objects;
create policy "Public reads vendor media" on storage.objects
  for select using (bucket_id = 'vendor-media');

-- Berkas disimpan di folder bernama user_id pemiliknya. Tanpa ini, satu vendor
-- bisa menimpa atau menghapus tangkapan layar vendor lain hanya dengan menebak
-- nama berkasnya.
drop policy if exists "Vendor uploads own media" on storage.objects;
create policy "Vendor uploads own media" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'vendor-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Vendor replaces own media" on storage.objects;
create policy "Vendor replaces own media" on storage.objects
  for update to authenticated using (
    bucket_id = 'vendor-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Vendor deletes own media" on storage.objects;
create policy "Vendor deletes own media" on storage.objects
  for delete to authenticated using (
    bucket_id = 'vendor-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 2. Bentuk kolom ────────────────────────────────────────────────────────
comment on column public.vendors.testimonials is
  'Tangkapan layar percakapan klien: [{"image":"https://...","event":"Wedding Anindya & Reza","date":"2025-01-12"}]. Tanggal dalam YYYY-MM-DD supaya tampilannya seragam di halaman.';

-- Satu baris uji coba bentuk lama tertinggal di FM Project. Ia tidak punya
-- tangkapan layar, jadi tidak bisa dipindahkan ke bentuk baru -- dan
-- membiarkannya berarti satu kartu kosong di halaman publik. Dihapus di sini
-- supaya jelas tercatat, bukan hilang diam-diam saat penyimpanan berikutnya.
update public.vendors
   set testimonials = '[]'::jsonb
 where slug = 'fm-project'
   and not exists (
     select 1 from jsonb_array_elements(testimonials) e where e ? 'image'
   );

-- ── 3. Fungsi tulis ────────────────────────────────────────────────────────
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
    -- Baris tanpa tangkapan layar dibuang di sini, bukan sekadar disembunyikan
    -- di form: tanpa gambarnya, testimoni ini kehilangan seluruh alasannya ada.
    -- Alamat gambar wajib http(s) supaya kolomnya tidak bisa diisi skema lain.
    select coalesce(jsonb_agg(
             jsonb_build_object(
               'image', btrim(e->>'image'),
               'event', left(btrim(e->>'event'), 80),
               'date',  btrim(e->>'date')
             ) order by ord), '[]'::jsonb)
      into v_testi
      from jsonb_array_elements(p_testimonials) with ordinality as t(e, ord)
     where btrim(coalesce(e->>'image', '')) ~ '^https?://'
       and btrim(coalesce(e->>'event', '')) <> ''
       and btrim(coalesce(e->>'date',  '')) ~ '^\d{4}-\d{2}-\d{2}$';

    if jsonb_array_length(v_testi) > 12 then
      raise exception 'Maksimal 12 testimoni.';
    end if;
  end if;

  update public.vendors
     set stats        = coalesce(v_stats, stats),
         testimonials = coalesce(v_testi, testimonials)
   where id = v_id;
end;
$$;

comment on function public.update_vendor_content(jsonb, jsonb) is
  'Vendor menyunting statistik profil dan testimoni di barisnya sendiri. Satu-satunya jalur tulis vendor ke tabel vendors; verified/visible/slug/category/commission_rate tidak terjangkau dari sini.';

revoke all on function public.update_vendor_content(jsonb, jsonb) from public, anon;
grant execute on function public.update_vendor_content(jsonb, jsonb) to authenticated;
