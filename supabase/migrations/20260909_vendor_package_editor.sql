-- Vendor mengurus daftar harganya sendiri.
--
-- Bagian terakhir yang masih harus lewat SQL. Bentuknya tiga tingkat --
-- kelompok, paket, lalu rincian tiap paket -- dan itulah alasannya dikerjakan
-- paling belakang, bukan karena tidak penting. Justru sebaliknya: ini satu-
-- satunya konten vendor yang mengikat secara komersial.
--
-- Kolomnya menerima dua bentuk. Datar [{name, price, features}] untuk vendor
-- dengan satu daftar harga, dan berkelompok [{group, note, items:[...]}] untuk
-- yang daftarnya memang terbagi -- FM Project punya enam kelompok, dan
-- meratakannya akan menghilangkan informasi yang nyata. Yang ditulis dari sini
-- selalu berkelompok; halaman sudah tahu cara membaca keduanya.
--
-- p_pkg_note dan p_pkg_footnote sengaja membedakan NULL dari string kosong:
-- NULL berarti "jangan sentuh", kosong berarti "hapus". Tanpa pembedaan itu
-- vendor tidak punya cara menghapus catatan harga yang sudah tidak berlaku.
drop function if exists public.update_vendor_content(jsonb, jsonb, jsonb, text, text, text);

create or replace function public.update_vendor_content(
  p_stats        jsonb default null,
  p_testimonials jsonb default null,
  p_gallery      jsonb default null,
  p_hero_photo   text  default null,
  p_about_photo  text  default null,
  p_cover_photo  text  default null,
  p_packages     jsonb default null,
  p_pkg_note     text  default null,
  p_pkg_footnote text  default null
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
  g          jsonb;
  i          jsonb;
  f          jsonb;
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
              -- #>> '{}' mengambil teks apa adanya, jadi angka atau boolean
              -- yang nyasar ke daftar fitur tidak membatalkan seluruh simpanan.
              if btrim(coalesce(f #>> '{}', '')) <> '' then
                v_feats := v_feats || to_jsonb(left(btrim(f #>> '{}'), 120));
              end if;
            end loop;
          end if;

          if jsonb_array_length(v_feats) > 15 then
            raise exception 'Maksimal 15 rincian untuk paket "%".', i->>'name';
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

      if jsonb_array_length(v_items) > 12 then
        raise exception 'Maksimal 12 paket per kelompok.';
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
                                 else nullif(left(btrim(p_pkg_footnote), 300), '') end
   where id = v_id;
end;
$$;

comment on function public.update_vendor_content(jsonb, jsonb, jsonb, text, text, text, jsonb, text, text) is
  'Vendor menyunting statistik, testimoni, galeri, foto header/Tentang/pratinjau tautan, serta daftar harga. Satu-satunya jalur tulis vendor ke tabel vendors; verified/visible/slug/category/commission_rate tidak terjangkau dari sini.';

revoke all on function public.update_vendor_content(jsonb, jsonb, jsonb, text, text, text, jsonb, text, text) from public, anon;
grant execute on function public.update_vendor_content(jsonb, jsonb, jsonb, text, text, text, jsonb, text, text) to authenticated;
