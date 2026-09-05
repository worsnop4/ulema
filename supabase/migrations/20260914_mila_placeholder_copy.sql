-- Teks sementara untuk halaman Mila Putri MakeUP.
--
-- INI TEKS CONTOH, BUKAN KATA-KATA VENDORNYA. Diminta supaya halamannya tidak
-- terlihat setengah jadi selagi menunggu naskah asli dari Mila. Ganti seluruh
-- lima kolom di bawah begitu naskahnya datang.
--
-- Aturan yang dipakai saat menulisnya: tidak ada satu pun klaim yang tidak
-- bisa dibuktikan. Tidak ada tahun mulai, tidak ada jumlah pengantin, tidak
-- ada sertifikasi. Prototipe desainnya memuat "Di depan cermin, sejak 2016"
-- dan "240+ pengantin dirias" -- itu karangan sesi desain, dan menerbitkannya
-- berarti mengklaim pengalaman atas nama Mila kepada calon pembeli yang
-- memakainya untuk memutuskan. Yang tertulis di sini hanya cara kerja, yang
-- benar bagi perias mana pun dan tidak mengarang apa-apa tentang Mila.
--
-- facts diambil dari kolom yang sudah terisi: city, dan service_types.
update public.vendors set
  headline        = 'Riasan yang tetap terasa kamu',
  -- Harus PERSIS ada di dalam headline. Kalau tidak cocok, aksennya diabaikan
  -- dan judulnya tampil polos -- itu disengaja, lebih baik daripada memotong
  -- kalimat vendor di tempat yang salah.
  headline_accent = 'tetap terasa kamu',
  tagline         = 'Perias pengantin di Banjar dan sekitarnya, untuk akad, resepsi, wisuda, dan lamaran.',
  about_title     = 'Tentang Mila Putri',
  description     = 'Setiap wajah punya bentuk dan warna kulitnya sendiri. Karena itu riasan di sini tidak dimulai dari satu tampilan yang sudah jadi, tapi dari mengenali kulit dan bentuk wajah pengantinnya dulu -- baru dipilih produk dan tekniknya.' || chr(10) || chr(10) ||
                    'Hasilnya disiapkan untuk bertahan seharian, dari pagi akad sampai lampu resepsi terakhir dimatikan, tanpa membuat wajahnya terlihat seperti orang lain di foto.',
  facts           = '[{"label":"Basis","value":"Banjar, Jawa Barat"},
                      {"label":"Layanan","value":"Akad, resepsi, wisuda, lamaran"}]'::jsonb
where slug = 'mila-putri-makeup';
