-- Vendor kedua: Mila Putri MakeUP (MUA + wedding organizer, Banjar).
--
-- Yang diisi di sini HANYA yang faktual dari daftar harga PDF-nya: nama,
-- kategori, nomor WhatsApp, logo, dan kelima paket beserta rinciannya.
--
-- Yang sengaja DIKOSONGKAN: headline, tagline, deskripsi, statistik, dan
-- testimoni. Prototipe desainnya memuat kalimat seperti "Di depan cermin,
-- sejak 2016" dan "240+ pengantin dirias" -- itu karangan sesi desain, bukan
-- fakta yang pernah disebut siapa pun. Menerbitkannya berarti mengklaim
-- pengalaman dan jumlah klien atas nama Mila kepada calon pembeli yang
-- memakainya untuk mengambil keputusan. Mila yang mengisinya lewat dashboard.
--
-- Baris ini butuh akunnya lebih dulu: vendors.user_id NOT NULL dan menunjuk
-- ke profiles. Itu bukan kebetulan -- seluruh model vendor (dompet, komisi,
-- jalur tulis update_vendor_content) bergantung padanya.

do $mila$
declare
  v_email text := 'GANTI_DENGAN_EMAIL_MILA@contoh.com';   -- <<< ISI DULU
  v_uid   uuid;
begin
  select id into v_uid from public.profiles where lower(email) = lower(v_email);
  if v_uid is null then
    raise exception 'Akun % belum ada. Buat dulu di Supabase Auth, lalu jalankan ulang migrasi ini.', v_email;
  end if;

  -- Kode referal dan tarif komisi menempel di profiles, bukan vendors.
  -- 40% menyamai vendor pertama; ubah angkanya di sini kalau kesepakatannya
  -- berbeda -- ia disetel per akun, bukan global.
  update public.profiles
     set referral_code   = 'MILAPUTRI',
         commission_rate = 0.400
   where id = v_uid;

  insert into public.vendors (
    user_id, slug, name, category, city, whatsapp, logo_url,
    packages, package_footnote, price_from, price_to, visible
  ) values (
    v_uid,
    'mila-putri-makeup',
    'Mila Putri MakeUP',
    'MUA',
    'Banjar',
    '6287819775477',
    'https://ulema.id/Vendor/mila-putri-logo.png',
    '[
  {
    "group": "Wedding Package",
    "note": "Semua paket belum termasuk panggung pelaminan",
    "items": [
      {
        "name": "Paket 6.5",
        "price": "Rp 6.500.000",
        "features": [
          {
            "text": "Makeup busana",
            "heading": true
          },
          "Makeup busana akad & resepsi",
          "Hijab do & Siger sunda",
          "Makeup busana ortu & besan",
          "Makeup busana pager ayu 2 orang",
          "Pager bagus 1 orang",
          {
            "text": "Dekorasi",
            "heading": true
          },
          "Gapura pintu masuk",
          "Pelaminan 4 meter",
          "Background depan rumah",
          {
            "text": "Bonus",
            "heading": true
          },
          "Soflens normal",
          "Fake henna by Mila",
          "Fake kuku by Mila",
          "Fake melati sultan (seperti asli)",
          "Pemandu adat",
          "Photo 2 rol"
        ]
      },
      {
        "name": "Paket 7.5",
        "price": "Rp 7.500.000",
        "features": [
          {
            "text": "Makeup busana",
            "heading": true
          },
          "Makeup busana akad & resepsi",
          "Hijab do & Siger sunda",
          "Makeup busana ortu & besan",
          "Makeup busana pager ayu 4 orang",
          "Busana pager bagus 1 orang",
          {
            "text": "Dekorasi",
            "heading": true
          },
          "Gapura pintu masuk",
          "Kotak amplop",
          "Pelaminan 6 meter",
          "Background depan rumah",
          {
            "text": "Bonus",
            "heading": true
          },
          "Soflens normal",
          "Fake henna by Mila",
          "Fake kuku by Mila",
          "Melati segar asli",
          "Pemandu adat",
          "Photo 2 rol"
        ]
      },
      {
        "name": "Paket 8.5",
        "price": "Rp 8.500.000",
        "features": [
          {
            "text": "Makeup busana",
            "heading": true
          },
          "Makeup busana akad & resepsi",
          "Hijab do & Siger sunda",
          "Makeup busana ortu & besan",
          "Makeup busana pager ayu 4 orang",
          "Pager bagus 1 orang",
          {
            "text": "Dekorasi",
            "heading": true
          },
          "Gapura pintu masuk",
          "Kotak amplop",
          "Pelaminan 6 meter",
          "Welcome gate kaca mirror",
          "Background depan rumah",
          "Meja akad",
          {
            "text": "Bonus",
            "heading": true
          },
          "Soflens normal",
          "Henna lukis by Wayang Henna",
          "Fake kuku by Wayang Henna",
          "Melati segar asli",
          "Pemandu adat",
          "Photo 2 rol"
        ]
      },
      {
        "name": "Paket 10",
        "price": "Rp 10.000.000",
        "features": [
          {
            "text": "Makeup busana",
            "heading": true
          },
          "Makeup busana akad & resepsi",
          "Hijab do / hair do & Siger sunda",
          "Makeup busana ortu & besan",
          "Makeup busana pager ayu 4 orang",
          "Busana pager bagus 1 orang",
          {
            "text": "Dekorasi",
            "heading": true
          },
          "Gapura pintu masuk",
          "Kotak amplop",
          "Pelaminan 6 meter",
          "Gallery photo 2-3 meter",
          "Welcome gate kaca mirror",
          "Background depan rumah",
          "Meja akad",
          {
            "text": "Bonus",
            "heading": true
          },
          "Soflens normal / minus",
          "Makeup keluarga 1 orang",
          "Henna lukis by Wayang Henna",
          "Fake kuku by Wayang Henna",
          "Melati segar asli",
          "MC akad & pemandu adat",
          "Photo 2 rol",
          "Video teaser"
        ]
      },
      {
        "name": "Paket 12.5",
        "price": "Rp 12.500.000",
        "note": "paling lengkap",
        "highlight": true,
        "features": [
          {
            "text": "Makeup busana",
            "heading": true
          },
          "Makeup busana akad & 2 resepsi",
          "Hijab do / hair do & Siger sunda",
          "Makeup busana ortu & besan",
          "Makeup busana pager ayu 4 orang",
          "Busana pager bagus 2 orang",
          {
            "text": "Dekorasi",
            "heading": true
          },
          "Gapura pintu masuk",
          "Kotak amplop",
          "Pelaminan 6 meter",
          "Gallery photo 3-4 meter",
          "Welcome gate kaca mirror",
          "Background depan rumah",
          "Meja akad",
          {
            "text": "Bonus",
            "heading": true
          },
          "Soflens normal / minus",
          "Makeup keluarga 2 orang",
          "Henna lukis by Wayang Henna",
          "Fake kuku by Wayang Henna",
          "Melati segar asli",
          "MC akad & pemandu adat",
          "Siraman",
          "Photo 100 pcs",
          "Video teaser (hari H)"
        ]
      }
    ]
  },
  {
    "group": "Additional",
    "note": "Bisa ditambahkan ke paket mana pun",
    "items": [
      {
        "name": "Busana pengantin",
        "price": "Rp 1.000.000",
        "features": []
      },
      {
        "name": "Makeup keluarga",
        "price": "Rp 100.000",
        "features": []
      },
      {
        "name": "Siraman",
        "price": "Rp 1.500.000",
        "features": []
      },
      {
        "name": "MC akad",
        "price": "Rp 1.000.000",
        "features": []
      },
      {
        "name": "MC akad + resepsi (property)",
        "price": "Rp 2.000.000",
        "features": []
      },
      {
        "name": "Bunga hidup",
        "price": "Rp 1.200.000",
        "features": []
      },
      {
        "name": "Meja akad",
        "price": "Rp 500.000",
        "features": []
      },
      {
        "name": "Lorong",
        "price": "Rp 1.000.000",
        "features": []
      },
      {
        "name": "Gazebo akad kaca",
        "price": "Rp 2.500.000",
        "features": []
      },
      {
        "name": "Gallery photo",
        "price": "Rp 1.000.000",
        "features": []
      },
      {
        "name": "Blower",
        "price": "Rp 400.000",
        "features": []
      },
      {
        "name": "Air cooler",
        "price": "Rp 350.000",
        "features": []
      },
      {
        "name": "Panggung pelaminan 6x3",
        "price": "Rp 600.000",
        "features": []
      }
    ]
  }
]'::jsonb,
    'Harga daftar 2026. Semua paket belum termasuk panggung pelaminan. Ketersediaan tanggal ditanyakan lewat WhatsApp.',
    6500000,
    12500000,
    false   -- dinyalakan setelah foto dan teksnya terisi
  )
  on conflict (slug) do update set
    whatsapp         = excluded.whatsapp,
    logo_url         = excluded.logo_url,
    packages         = excluded.packages,
    package_footnote = excluded.package_footnote,
    price_from       = excluded.price_from,
    price_to         = excluded.price_to;
end
$mila$;
