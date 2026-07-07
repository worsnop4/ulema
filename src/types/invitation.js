/**
 * @typedef {Object} Person
 * @property {string} name - Nama lengkap
 * @property {string} nickname - Nama panggilan
 * @property {string|null} photo - URL foto
 * @property {string} instagram - Akun instagram
 * @property {string} father - Nama ayah
 * @property {string} mother - Nama ibu
 */

/**
 * @typedef {Object} Event
 * @property {string} id - ID Event
 * @property {string} title - Nama acara (cth: Akad Nikah)
 * @property {string} date - Tanggal acara (YYYY-MM-DD)
 * @property {string} time - Waktu acara (HH:MM)
 * @property {string} location - Lokasi acara
 * @property {string} address - Alamat lengkap
 * @property {string} mapUrl - URL Google Maps
 */

/**
 * @typedef {Object} LoveStory
 * @property {string} id - ID Cerita
 * @property {string} year - Tahun
 * @property {string} title - Judul cerita
 * @property {string} story - Isi cerita
 * @property {string|null} photo - URL foto cerita
 */

/**
 * @typedef {Object} Dresscode
 * @property {string} color - Warna (hex)
 * @property {string} name - Nama dresscode
 * @property {string} notes - Catatan tambahan
 */

/**
 * @typedef {Object} Account
 * @property {string} id - ID Akun
 * @property {string} bank - Nama bank
 * @property {string} no - Nomor rekening
 * @property {string} name - Nama pemilik
 */

/**
 * @typedef {Object} Meta
 * @property {string} title - Judul halaman
 * @property {string} desc - Deskripsi
 * @property {string|null} photo - URL foto utama
 * @property {string|null} coverPhoto - URL foto sampul
 * @property {string|null} coverVideo - URL video sampul
 * @property {string|null} footerPhoto - URL foto penutup
 * @property {string} coverStyle - Gaya cover (cth: circle, full)
 * @property {string|null} ogImage - URL foto untuk Open Graph meta tag (preview link WhatsApp/media sosial), dipakai oleh middleware.js
 */

/**
 * @typedef {Object} Rsvp
 * @property {string} id - ID RSVP
 * @property {string} name - Nama tamu
 * @property {string} rsvp - Status (hadir, tidak hadir)
 * @property {string} wish - Ucapan
 * @property {string} time - Waktu dikirim
 */

/**
 * @typedef {Object} CustomColors
 * @property {string} primary - Warna primer
 * @property {string} accent - Warna aksen
 * @property {string} bg - Warna latar
 */

/**
 * @typedef {Object} InvitationData
 * @property {string} slug - Slug undangan
 * @property {number} themeId - ID Tema
 * @property {string} theme - Nama Tema
 * @property {Person} groom - Data mempelai pria
 * @property {Person} bride - Data mempelai wanita
 * @property {Event[]} events - Daftar acara
 * @property {LoveStory[]} loveStory - Kisah cinta
 * @property {string} quote - Kutipan
 * @property {boolean} countdownEnabled - Status hitung mundur
 * @property {boolean} music - Status musik
 * @property {Dresscode} dresscode - Info dresscode
 * @property {Account[]} accounts - Rekening hadiah
 * @property {Meta} meta - Metadata undangan
 * @property {Rsvp[]} rsvps - Daftar RSVP dan ucapan
 * @property {Object[]} guests - Daftar tamu
 * @property {string} blastMessageTemplate - Template pesan WhatsApp
 * @property {CustomColors|null} customColors - Warna kustom
 */

/**
 * @typedef {Object} InvitationRecord
 * @property {string} id - ID record di database (UUID)
 * @property {string} user_id - ID pengguna pembuat
 * @property {number} theme_id - ID tema
 * @property {string} groom_name - Nama panggilan pria (cache)
 * @property {string} bride_name - Nama panggilan wanita (cache)
 * @property {string} slug - Slug undangan (unik)
 * @property {InvitationData} data - Data lengkap undangan (JSONB)
 * @property {string} created_at - Timestamp pembuatan
 * @property {string} updated_at - Timestamp update terakhir
 */

/**
 * @typedef {Object} ProfileRecord
 * @property {string} id - ID pengguna (UUID dari Auth)
 * @property {string} email - Email pengguna
 * @property {string} name - Nama lengkap pengguna
 * @property {string} role - Peran ('admin', 'user')
 * @property {string} package_type - Paket pengguna ('free', 'premium', dll)
 * @property {string} package_expiry - Waktu kedaluwarsa paket
 * @property {string} created_at - Timestamp pendaftaran
 * @property {string} updated_at - Timestamp profil diupdate
 */
