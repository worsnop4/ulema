-- Vendor mengisi kontennya sendiri: statistik profil dan testimoni.
--
-- Sengaja TIDAK lewat policy UPDATE. Peringatan di 20260830_vendor_foundation
-- masih berlaku: RLS di Postgres berlaku per baris, bukan per kolom, jadi satu
-- policy UPDATE yang mengizinkan vendor menyunting barisnya sendiri juga
-- mengizinkan dia menyetel verified, visible, slug, dan category lewat API --
-- tidak peduli form di dashboard hanya menampilkan dua kotak isian.
--
-- Fungsi ini gantinya. Kolom yang boleh berubah tertulis di dalam UPDATE-nya,
-- jadi sisanya bukan sekadar "tidak ditampilkan" melainkan tidak terjangkau.
-- Menambah kolom yang boleh disunting nanti berarti mengubah baris ini secara
-- sadar, bukan kelupaan menutup sesuatu.

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
    -- Baris tanpa angka atau tanpa keterangan dibuang, bukan ditolak: kotak
    -- kosong yang tertinggal di form adalah hal biasa, dan menolak seluruh
    -- simpanan karenanya cuma bikin frustrasi.
    select coalesce(jsonb_agg(
             jsonb_build_object(
               'value', left(btrim(e->>'value'), 16),
               'label', left(btrim(e->>'label'), 48)
             ) order by ord), '[]'::jsonb)
      into v_stats
      from jsonb_array_elements(p_stats) with ordinality as t(e, ord)
     where btrim(coalesce(e->>'value', '')) <> ''
       and btrim(coalesce(e->>'label', '')) <> '';

    -- Halaman publik menata statistik dalam satu baris berisi maksimal empat.
    -- Yang kelima jatuh ke baris kedua sendirian dan merusak tatanannya.
    if jsonb_array_length(v_stats) > 4 then
      raise exception 'Maksimal 4 statistik.';
    end if;
  end if;

  if p_testimonials is not null then
    if jsonb_typeof(p_testimonials) <> 'array' then
      raise exception 'Testimoni harus berupa daftar.';
    end if;
    select coalesce(jsonb_agg(
             jsonb_build_object(
               'quote',  left(btrim(e->>'quote'), 600),
               'author', left(btrim(e->>'author'), 80)
             ) order by ord), '[]'::jsonb)
      into v_testi
      from jsonb_array_elements(p_testimonials) with ordinality as t(e, ord)
     where btrim(coalesce(e->>'quote', '')) <> ''
       and btrim(coalesce(e->>'author', '')) <> '';

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
