-- Empat kategori paket baru dari dua daftar harga 2026: "All Package"
-- (wedding organizer penuh), "Makeup & Busana", "Wedding Intimate", dan
-- "Makeup" saja.
--
-- Batas rincian per paket dinaikkan 28 -> 48. Ini dipaksa datanya, bukan
-- selera: paket Rp 32.500.000 punya 43 baris (4 judul bagian + 39 rincian),
-- dan pada batas lama penyimpanan vendor akan ditolak mentah-mentah. Ini
-- kenaikan kedua -- 15 -> 28 waktu vendor kedua masuk, sekarang 28 -> 48.
-- Batas yang ditebak dari satu contoh memang selalu meleset.
--
-- Dua hal yang saya ubah dari PDF-nya, dan keduanya perlu kamu periksa:
--
-- 1. Di paket Rp 19.000.000, blok berisi kendang, orgen, artis, MC, dan sound
--    ikut berjudul "Dokumentasi" -- sama dengan blok foto/video di atasnya.
--    Itu salah ketik: di paket Rp 25.500.000 blok yang sama persis berjudul
--    "Hiburan". Dipakai "Hiburan".
--
-- 2. Tingkatan Silver dan Gold masing-masing punya DUA harga di PDF, dengan
--    isi yang nyaris sama. Supaya dua kartu berjudul sama tidak terbaca
--    sebagai salah tempel, bedanya ditulis sebagai badge: "melati imitasi"
--    lawan "melati asli" untuk Silver, dan "akad & resepsi" untuk Gold yang
--    Rp 4.000.000. Isinya sendiri tidak diubah sama sekali.
--
-- Urutan tabnya sengaja dari yang paling ringan ke paling besar, dan tab
-- pertama itulah yang pertama dilihat pengunjung. "Additional" tetap paling
-- akhir karena ia bukan pilihan utama, melainkan pelengkap.

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

          if jsonb_array_length(v_feats) > 48 then
            raise exception 'Maksimal 48 rincian untuk paket "%".', i->>'name';
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

-- Kelompok lama ("Wedding Package" dan "Additional") dipertahankan apa adanya,
-- diambil dari baris yang sekarang -- bukan ditulis ulang di sini, supaya
-- tidak ada kesempatan salah salin.
update public.vendors set packages =
    '[
  {
    "group": "Makeup",
    "note": "Riasan saja, tanpa busana",
    "items": [
      {
        "name": "Makeup akad",
        "price": "Rp 1.000.000",
        "features": []
      },
      {
        "name": "Makeup akad & resepsi",
        "price": "Rp 1.500.000",
        "features": []
      },
      {
        "name": "Makeup siraman",
        "price": "Rp 500.000",
        "features": []
      },
      {
        "name": "Makeup engagement",
        "price": "Rp 400.000",
        "features": []
      },
      {
        "name": "Wisuda, party, ibu hajat",
        "price": "Rp 300.000",
        "features": []
      }
    ]
  }
]'::jsonb
  || '[
  {
    "group": "Makeup & Busana",
    "note": "Riasan lengkap dengan busananya",
    "items": [
      {
        "name": "Silver",
        "price": "Rp 2.000.000",
        "note": "melati imitasi",
        "features": [
          "Makeup akad CPW",
          "Kebaya akad CPW",
          "Beskap/jas CPP",
          "Hijab do",
          "Melati sultan imitasi",
          "Siger sunda/syar’i"
        ]
      },
      {
        "name": "Silver",
        "price": "Rp 2.500.000",
        "note": "melati asli",
        "features": [
          "Makeup akad CPW",
          "Kebaya akad CPW",
          "Beskap/jas CPP",
          "Hijab do",
          "Melati asli",
          "Siger sunda/syar’i"
        ]
      },
      {
        "name": "Gold",
        "price": "Rp 3.000.000",
        "note": "melati imitasi",
        "features": [
          "Makeup akad CPW",
          "Kebaya akad CPW",
          "Makeup & beskap ibu bapak",
          "Makeup beskap besan",
          "Beskap/jas CPP",
          "Hijab do",
          "Melati sultan imitasi",
          "Siger sunda/syar’i"
        ]
      },
      {
        "name": "Gold",
        "price": "Rp 4.000.000",
        "note": "akad & resepsi",
        "features": [
          "Makeup akad & resepsi CPW",
          "Kebaya akad CPW",
          "Kebaya resepsi CPW",
          "Makeup & beskap ibu bapak",
          "Makeup beskap besan",
          "Beskap/jas CPP",
          "Hijab do",
          "Melati asli",
          "Siger sunda/syar’i"
        ]
      },
      {
        "name": "Platinum",
        "price": "Rp 5.000.000",
        "highlight": true,
        "features": [
          "Makeup akad & resepsi CPW",
          "Kebaya akad CPW",
          "Kebaya resepsi CPW",
          "Makeup & beskap ibu bapak",
          "Makeup beskap besan",
          "Beskap/jas CPP",
          "Hijab do",
          "Melati asli",
          "Siger sunda/syar’i",
          "2 makeup & busana pager ayu",
          "1 busana pager bagus"
        ]
      }
    ]
  }
]'::jsonb
  || '[
  {
    "group": "Wedding Intimate",
    "note": "Acara kecil di rumah",
    "items": [
      {
        "name": "Silver",
        "price": "Rp 3.500.000",
        "features": [
          {
            "text": "Makeup & busana",
            "heading": true
          },
          "Makeup akad CPW",
          "Kebaya akad CPW",
          "Beskap/jas CPP",
          "Hijab do",
          "Melati sultan imitasi",
          "Siger sunda/syar’i",
          {
            "text": "Dekorasi",
            "heading": true
          },
          "Pelaminan 3 meter",
          "Kursi pengantin"
        ]
      },
      {
        "name": "Gold",
        "price": "Rp 4.000.000",
        "features": [
          {
            "text": "Makeup & busana",
            "heading": true
          },
          "Makeup akad CPW",
          "Kebaya akad CPW",
          "Makeup & beskap ibu bapak",
          "Makeup beskap besan",
          "Beskap/jas CPP",
          "Hijab do",
          "Melati sultan imitasi",
          "Siger sunda/syar’i",
          {
            "text": "Dekorasi",
            "heading": true
          },
          "Pelaminan 3 meter",
          "Kursi pengantin",
          "Gapura pintu masuk"
        ]
      },
      {
        "name": "Platinum",
        "price": "Rp 5.000.000",
        "highlight": true,
        "features": [
          {
            "text": "Makeup & busana",
            "heading": true
          },
          "Makeup akad CPW",
          "Kebaya akad CPW",
          "Makeup & beskap ibu bapak",
          "Makeup beskap besan",
          "Beskap/jas CPP",
          "Hijab do",
          "Melati asli",
          "Siger sunda/syar’i",
          "2 makeup & busana pager ayu",
          {
            "text": "Dekorasi",
            "heading": true
          },
          "Pelaminan 4 meter",
          "Kursi pengantin",
          "4 kursi tifany",
          "Gapura pintu masuk",
          {
            "text": "Dokumentasi",
            "heading": true
          },
          "Photo 1 rol (40 pcs)"
        ]
      }
    ]
  }
]'::jsonb
  || coalesce((select jsonb_agg(x) from jsonb_array_elements(packages) x
                where x->>'group' = 'Wedding Package'), '[]'::jsonb)
  || '[
  {
    "group": "All Package",
    "note": "Termasuk tenda, hiburan, dan perlengkapan hajatan",
    "items": [
      {
        "name": "Paket 16",
        "price": "Rp 16.000.000",
        "features": [
          {
            "text": "Makeup & busana",
            "heading": true
          },
          "Makeup akad & resepsi",
          "Busana akad",
          "Busana resepsi",
          "Beskap bapak & ibu",
          "4 pager ayu",
          "1 pager bagus",
          "Melati segar",
          "Siger / aksesoris",
          {
            "text": "Dokumentasi",
            "heading": true
          },
          "Photo album magnetic 80pcs",
          "Video liputan + teaser",
          {
            "text": "Dekorasi",
            "heading": true
          },
          "Dekorasi 6 meter",
          "Kursi pengantin",
          "Kursi orang tua",
          "Gapura pintu masuk",
          "Background depan rumah",
          "Tenda medium max 100 meter",
          "Panggung pelaminan 6x3",
          "Meja 5",
          "Kursi + bungkus max 100",
          "Alat parasman biasa",
          "Piring lidi max 100",
          {
            "text": "Ekstra bonus",
            "heading": true
          },
          "Henna white atau maroon",
          "Fake nail",
          "MC akad resepsi + adat",
          "Property",
          "Sound sistem (tanpa desel)"
        ]
      },
      {
        "name": "Paket 19",
        "price": "Rp 19.000.000",
        "features": [
          {
            "text": "Makeup & busana",
            "heading": true
          },
          "Makeup akad & resepsi",
          "Busana akad",
          "Busana resepsi",
          "Beskap bapak & ibu",
          "4 pager ayu",
          "1 pager bagus",
          "Melati segar",
          "Siger / aksesoris",
          {
            "text": "Dokumentasi",
            "heading": true
          },
          "Photo album magnetic 80pcs",
          "Video liputan + teaser",
          {
            "text": "Hiburan",
            "heading": true
          },
          "Kendang",
          "Orgen",
          "2 artis",
          "1 MC",
          "Sound system + desel (hari H)",
          {
            "text": "Dekorasi",
            "heading": true
          },
          "Dekorasi 6 meter",
          "Kursi pengantin",
          "Kursi orang tua",
          "Gapura pintu masuk",
          "Background depan rumah",
          "Tenda medium max 100 meter",
          "Panggung pelaminan 6x3",
          "Meja 5",
          "Kursi + bungkus max 100",
          "Alat parasman biasa",
          "Piring lidi max 100",
          {
            "text": "Ekstra bonus",
            "heading": true
          },
          "Henna white atau maroon",
          "Fake nail",
          "MC akad resepsi + adat",
          "Property"
        ]
      },
      {
        "name": "Paket 21.5",
        "price": "Rp 21.500.000",
        "features": [
          {
            "text": "Makeup & busana",
            "heading": true
          },
          "Makeup akad & resepsi",
          "Busana akad",
          "Busana resepsi",
          "Beskap bapak & ibu",
          "4 pager ayu",
          "2 pager bagus",
          "Melati segar",
          "Siger / aksesoris",
          {
            "text": "Dokumentasi",
            "heading": true
          },
          "Photo album magnetic 120pcs",
          "Video liputan",
          {
            "text": "Dekorasi",
            "heading": true
          },
          "Dekorasi 6 meter",
          "Gallery photo",
          "Meja akad",
          "Kursi pengantin",
          "Kursi orang tua",
          "Gapura pintu masuk",
          "Background depan rumah",
          "Tenda semi VIP max 100 meter",
          "Panggung pelaminan",
          "Panggung hiburan",
          "Meja 6",
          "Kursi + bungkus max 100",
          "Alat parasman biasa",
          "Piring beling max 100",
          {
            "text": "Ekstra bonus",
            "heading": true
          },
          "Henna white atau maroon",
          "Fake nail",
          "2 makeup",
          "Siraman",
          "Pemandu siraman",
          "MC akad resepsi + adat",
          "Property"
        ]
      },
      {
        "name": "Paket 25.5",
        "price": "Rp 25.500.000",
        "features": [
          {
            "text": "Makeup & busana",
            "heading": true
          },
          "Makeup akad & resepsi",
          "Busana akad",
          "Busana resepsi",
          "Beskap bapak & ibu",
          "4 pager ayu",
          "2 pager bagus",
          "Melati segar",
          "Siger / aksesoris",
          {
            "text": "Dokumentasi",
            "heading": true
          },
          "Photo album magnetic 120pcs",
          "Video liputan",
          {
            "text": "Hiburan",
            "heading": true
          },
          "Orgen",
          "Kendang",
          "Melodi",
          "Suling",
          "1 MC",
          "3 artis",
          "Sound system + desel",
          {
            "text": "Dekorasi",
            "heading": true
          },
          "Dekorasi 6 meter",
          "Gallery photo",
          "Meja akad",
          "Kursi pengantin",
          "Kursi orang tua",
          "Gapura pintu masuk",
          "Background depan rumah",
          "Tenda semi VIP max 100 meter",
          "Panggung pelaminan",
          "Panggung hiburan",
          "Meja 6",
          "Kursi + bungkus max 100",
          "Alat parasman biasa",
          "Piring beling max 100",
          {
            "text": "Ekstra bonus",
            "heading": true
          },
          "Henna white atau maroon",
          "Fake nail",
          "2 makeup",
          "Siraman",
          "Pemandu siraman",
          "MC akad resepsi + adat",
          "Property"
        ]
      },
      {
        "name": "Paket 32.5",
        "price": "Rp 32.500.000",
        "note": "paling lengkap",
        "highlight": true,
        "features": [
          {
            "text": "Makeup & busana",
            "heading": true
          },
          "Makeup akad & resepsi",
          "Busana akad",
          "2 busana resepsi",
          "Beskap bapak & ibu",
          "6 pager ayu",
          "2 pager bagus",
          "Melati segar",
          "Siger / aksesoris",
          {
            "text": "Dokumentasi",
            "heading": true
          },
          "Photo album magazine 10sit",
          "Video liputan + teaser",
          {
            "text": "Dekorasi",
            "heading": true
          },
          "Dekorasi 6-8 meter",
          "Mix bunga hidup",
          "Gallery photo",
          "Lorong",
          "Meja akad + lantai kaca",
          "Kursi pengantin",
          "Kursi orang tua",
          "Gapura pintu masuk",
          "Background depan rumah",
          "Tenda semi VIP 120 meter",
          "Panggung pelaminan",
          "Panggung hiburan",
          "Meja 5",
          "Meja bulat 3",
          "Kursi + bungkus max 150",
          "Alat parasman rolltop",
          "Piring beling max 200",
          {
            "text": "Ekstra bonus",
            "heading": true
          },
          "Henna white atau maroon",
          "Fake nail",
          "4 makeup",
          "Siraman",
          "Upacara adat lengser",
          "Pemandu adat sunda",
          "Pemandu siraman",
          "MC akad resepsi",
          "WO max 4 orang",
          "Property",
          "Hiburan dangdut/pop",
          "Sound system"
        ]
      }
    ]
  }
]'::jsonb
  || coalesce((select jsonb_agg(x) from jsonb_array_elements(packages) x
                where x->>'group' = 'Additional'), '[]'::jsonb),
  -- Kisaran harganya melebar: makeup wisuda Rp 300.000 di ujung bawah,
  -- paket hajatan penuh Rp 32.500.000 di ujung atas.
  price_from = 300000,
  price_to   = 32500000
where slug = 'mila-putri-makeup';
