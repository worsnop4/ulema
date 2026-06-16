export const defaultInvitationData = {
  slug: 'doni-rizka',
  themeId: 1,
  theme: 'classic',
  groom: {
    name: 'Doni Firmansyah, S.T.',
    nickname: 'Doni',
    photo: null,
    instagram: 'donifirmansyah',
    father: 'Bpk. Ahmad Santoso',
    mother: 'Ibu Sri Rahayu',
  },
  bride: {
    name: 'Rizka Amelia, S.Pd.',
    nickname: 'Rizka',
    photo: null,
    instagram: 'rizkaamelia',
    father: 'Bpk. Hendra Wijaya',
    mother: 'Ibu Dewi Kusuma',
  },
  events: [
    {
      id: 1,
      name: 'Akad Nikah',
      date: '',
      dateLabel: '',
      start: '08:00',
      end: '10:00',
      tz: 'WIB',
      venue: 'Masjid Al-Ikhlas',
      address: 'Jl. Raya Kebon Jeruk No. 15, Jakarta Barat',
      maps: 'https://maps.google.com',
      emoji: '🕌',
    },
    {
      id: 2,
      name: 'Resepsi',
      date: '',
      dateLabel: '',
      start: '11:00',
      end: '14:00',
      tz: 'WIB',
      venue: 'Gedung Serbaguna Indah',
      address: 'Jl. Sudirman Kav. 52–53, Jakarta Pusat',
      maps: 'https://maps.google.com',
      emoji: '🏛️',
    },
  ],
  loveStory: [
    { id: 1, year: '2018', emoji: '👀', title: 'Pertama Bertemu', desc: 'Kami pertama kali bertemu di kampus saat acara ospek fakultas.' },
    { id: 2, year: '2019', emoji: '❤️', title: 'Mulai Pacaran', desc: 'Setelah setahun berteman, akhirnya kami resmi berpacaran.' },
    { id: 3, year: '2024', emoji: '💍', title: 'Lamaran', desc: 'Momen paling indah ketika ia melamarku di tepi pantai.' },
    { id: 4, year: '2025', emoji: '💒', title: 'Pernikahan', desc: 'Dan kini, kami siap melangkah ke babak baru bersama selamanya.' },
  ],
  quote: '"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya…" — QS. Ar-Rum: 21',
  countdownEnabled: true,
  music: true,
  dresscode: { color: '#87ae8a', name: 'Sage Green', notes: 'Mohon menggunakan pakaian formal bernuansa pastel sage green.' },
  accounts: [
    { id: 1, type: 'bank', bank: 'BCA', holder: 'Doni Firmansyah', number: '1234567890' },
    { id: 2, type: 'ewallet', bank: 'GoPay', holder: 'Doni Firmansyah', number: '081234567890' },
  ],
  meta: {
    title: 'Undangan Pernikahan Doni & Rizka',
    desc: 'Kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia pernikahan kami.',
    photo: null,
    coverPhoto: null,
    footerPhoto: null,
    coverStyle: 'circle', // 'circle' or 'fade'
  },
  rsvps: [],
  guests: [],
  blastMessageTemplate: 'Halo *{nama}*,\n\nKami mengundang Anda untuk menghadiri acara pernikahan kami.\nDetail informasi dan konfirmasi kehadiran (RSVP) dapat diakses melalui link undangan berikut:\n\n{link}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.\n\nTerima kasih!',
  customColors: null,
}

export const DEFAULT_THEMES = [
  { id: 1, name: 'Classic Elegance', emoji: '🌿', thumbnail: '/images/themes/watercolor.png', layout: 'watercolor-floral', colors: ['#134e4a', '#d4a96a', '#faf7f2'], desc: 'Tema teal elegan dengan sentuhan emas', category: 'Special' },
  { id: 2, name: 'Rose Garden', emoji: '🌹', thumbnail: '/images/themes/watercolor.png', layout: 'watercolor-floral', colors: ['#881337', '#fda4af', '#fff1f2'], desc: 'Tema mawar merah muda yang romantis', category: 'Special' },
  { id: 3, name: 'Midnight Gold', emoji: '✨', thumbnail: '/images/themes/darkluxury.png', layout: 'dark-luxury', colors: ['#1c1917', '#d4a96a', '#faf7f2'], desc: 'Tema gelap mewah dengan aksen emas', category: 'Luxury' },
  { id: 4, name: 'Ivory Dream', emoji: '🕊️', thumbnail: '/images/themes/minimalist.png', layout: 'modern-minimalist', colors: ['#4b5563', '#d4b896', '#fdfaf6'], desc: 'Tema bersih minimalis dengan krem hangat', category: 'Special' },
  { id: 5, name: 'Lavender Bliss', emoji: '💜', thumbnail: '/images/themes/playful.png', layout: 'playful-illustrative', colors: ['#4c1d95', '#c4b5fd', '#f5f3ff'], desc: 'Tema ungu lembut yang menawan', category: 'Motion' },
  { id: 6, name: 'Tropical Breeze', emoji: '🌺', thumbnail: '/images/themes/adat.png', layout: 'traditional-adat', colors: ['#064e3b', '#6ee7b7', '#f0fdf4'], desc: 'Tema hijau tropis segar', category: 'Adat' },
  { id: 7, name: 'Autumn Florals', code: 'SPL-001', emoji: '🍃', thumbnail: '/images/themes/autumn.png', layout: 'special-001', colors: ['#6b705c', '#d4a373', '#fefae0'], desc: 'Tema estetik elegan dengan ornamen daun lembut', category: 'Special' },
  { id: 8, name: 'Aestetic Grey', code: 'SPL-002', emoji: '🩶', thumbnail: '/images/themes/autumn.png', layout: 'special-002', colors: ['#4b5563', '#9ca3af', '#f3f4f6'], desc: 'Tema estetik abu-abu minimalis elegan', category: 'Special' },
  { id: 9, name: 'Elegant Person', code: 'SPL-003', emoji: '🌸', thumbnail: '/images/themes/autumn.png', layout: 'special-003', colors: ['#6b705c', '#d4a373', '#fefae0'], desc: 'Tema elegan dengan bingkai foto khusus', category: 'Special' },
]

export const DEFAULT_ILLUSTRATIONS = [
  // Category: Hijab
  { id: 1, name: 'Anggun Hijab Pink', filename: 'hijab-pink.png', category: 'Hijab', tags: ['Hijab', 'Pink', 'Anggun'], locked: false },
  { id: 2, name: 'Emas Hijab Mewah', filename: 'hijab-gold.png', category: 'Hijab', tags: ['Hijab', 'Gold', 'Mewah'], locked: true },
  { id: 3, name: 'Hijab Pastel Modern', filename: 'hijab-pastel.png', category: 'Hijab', tags: ['Hijab', 'Pastel', 'Modern'], locked: false },
  
  // Category: Tanpa Hijab
  { id: 4, name: 'Gaun Putih Klasik', filename: 'bride-classic.png', category: 'Tanpa Hijab', tags: ['Gaun', 'Putih', 'Klasik'], locked: false },
  { id: 5, name: 'Gaun Rose Gold', filename: 'bride-rose-gold.png', category: 'Tanpa Hijab', tags: ['Gaun', 'Rose Gold', 'Mewah'], locked: true },
  
  // Category: Pria
  { id: 6, name: 'Jas Hitam Modern', filename: 'groom-black-suit.png', category: 'Pria', tags: ['Jas', 'Hitam', 'Modern'], locked: false },
  { id: 7, name: 'Tuksedo Biru Navy', filename: 'groom-navy-tux.png', category: 'Pria', tags: ['Jas', 'Navy', 'Elegan'], locked: true },
  
  // Category: Adat
  { id: 8, name: 'Kebaya Sunda Hijab', filename: 'sunda-hijab.png', category: 'Adat', tags: ['Adat', 'Sunda', 'Hijab'], locked: false },
  { id: 9, name: 'Beskap Jawa Solo', filename: 'jawa-solo.png', category: 'Adat', tags: ['Adat', 'Jawa', 'Solo'], locked: false },
  { id: 10, name: 'Batik Modern Pria', filename: 'batik-pria.png', category: 'Adat', tags: ['Adat', 'Batik', 'Modern'], locked: true },

  // Category: Pasangan
  { id: 11, name: 'Pelukan Hangat Kartun', filename: 'couple-cartoon.png', category: 'Pasangan', tags: ['Pasangan', 'Kartun', 'Cute'], locked: false },
  { id: 12, name: 'Genggaman Cincin', filename: 'couple-rings.png', category: 'Pasangan', tags: ['Pasangan', 'Cincin', 'Emas'], locked: true },
  { id: 13, name: 'Burung Merpati (Animasi)', filename: 'Bird.gif', category: 'Pasangan', tags: ['Pasangan', 'Burung', 'Animasi', 'GIF'], locked: false },
]
