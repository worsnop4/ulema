export const defaultInvitationData = {
  slug: '',
  // Id 7 (Autumn Florals), bukan 1. Id 1–6 adalah tema lama yang kini diseed
  // dengan visible = false: barisnya ada supaya undangan lama tetap tampil
  // benar, tapi tidak muncul di katalog. Undangan baru tidak boleh lahir di
  // tema yang tidak bisa ditemukan pemiliknya sendiri di katalog.
  //
  // Sebelum ini nilainya 1, dan selama tabel themes belum memuat id 1–6 itu
  // berarti SETIAP undangan baru lahir di id yang tidak dikenal database, lalu
  // jatuh ke `themes[0]` saat dirender. 7 adalah id visible termuda.
  themeId: 7,
  theme: 'classic',
  groom: {
    name: '',
    nickname: '',
    photo: null,
    instagram: '',
    father: '',
    mother: '',
  },
  bride: {
    name: '',
    nickname: '',
    photo: null,
    instagram: '',
    father: '',
    mother: '',
  },
  events: [],
  loveStory: [],
  quote: '',
  countdownEnabled: false,
  music: true,
  dresscode: { color: '', name: '', notes: '' },
  accounts: [],
  meta: {
    title: '',
    desc: '',
    photo: null,
    coverPhoto: null,
    coverVideo: null,
    footerPhoto: null,
    coverStyle: 'circle',
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
  { id: 10, name: 'Cinematic Luxury (Photo)', code: 'LUX-001', emoji: '🎞️', thumbnail: '/images/themes/darkluxury.png', layout: 'cinematic-luxury', colors: ['#0c0c0c', '#ddc497', '#ffffff'], desc: 'Tema cinematic mewah dengan background foto', category: 'Luxury', themeType: 'photo' },
  { id: 11, name: 'Cinematic Luxury (Video)', code: 'LUX-002', emoji: '🎥', thumbnail: '/images/themes/darkluxury.png', layout: 'cinematic-luxury', colors: ['#0c0c0c', '#ddc497', '#ffffff'], desc: 'Tema cinematic mewah dengan background video animasi', category: 'Luxury', themeType: 'video' },
  { id: 12, name: 'Minang Elegant', code: 'ADT-001', emoji: '👑', thumbnail: '/images/themes/adat.png', layout: 'minang-elegant', colors: ['#1a0f0a', '#c0872a', '#8b1a1a'], desc: 'Tema adat Minangkabau premium dengan nuansa gelap elegan', category: 'Adat' },
  { id: 13, name: 'Bordeaux Luxe', code: 'LUX-003', emoji: '🍷', thumbnail: '/images/themes/darkluxury.png', layout: 'bordeaux-luxe', colors: ['#4b0f28', '#c9a24b', '#faf3ea'], desc: 'Tema luxury wine-burgundy dengan aksen emas & video background sinematik', category: 'Luxury', themeType: 'photo' },
  { id: 14, name: 'Cinematic Shadow', code: 'LUX-004', emoji: '🌳', thumbnail: '/images/themes/darkluxury.png', layout: 'cinematic-shadow', colors: ['#1a1a1a', '#c9a96e', '#f5f0e8'], desc: 'Tema luxury dark elegant dengan video background, siluet shadow tree, dan tipografi serif besar', category: 'Luxury', themeType: 'video' },
  { id: 15, name: 'Botanical Ivory', code: 'SPL-004', emoji: '🌿', thumbnail: '/themes/Special/theme-10/bg2.jpg', layout: 'botanical-ivory', colors: ['#3d4a3a', '#c9a24b', '#faf7f2'], desc: 'Tema ivory-sage lembut dengan aksen emas, tipografi serif elegan, dan ornamen garis minimalis', category: 'Special' },
  { id: 16, name: 'Aurum Noir', code: 'LUX-005', emoji: '🖤', thumbnail: '', layout: 'aurum-noir', colors: ['#0a0807', '#d4a96a', '#f4ede2'], desc: 'Tema cinematic dark luxury hitam & emas: cover sinematik, Ken Burns, partikel emas, countdown flip, dan tipografi Cormorant elegan', category: 'Luxury', themeType: 'photo' },
  { id: 17, name: 'Morning Mist Luxe', code: 'LUX-006', emoji: '🌫️', thumbnail: '', layout: 'morning-mist-luxe', colors: ['#0e141b', '#c9d4dc', '#eef2f5'], desc: 'Tema luxury kabut pagi sinematik: gelap berkabut, aksen silver-champagne, panel kaca berembun, dan tipografi script Ephesis elegan', category: 'Luxury', themeType: 'photo' },
  { id: 18, name: 'Ashen Bloom', code: 'SPL-005', emoji: '🌸', thumbnail: '', layout: 'ashen-bloom', colors: ['#eceae6', '#b07a52', '#33312d'], desc: 'Tema Special ivory-ash lembut dengan floral watercolor terracotta, foto lengkung, tipografi Marcellus & Pinyon Script yang elegan', category: 'Special', themeType: 'photo' },
  { id: 19, name: 'Blanc Lumière', code: 'SPL-006', emoji: '🤍', thumbnail: '/themes/Special/theme-11/background.jpg', layout: 'blanc-lumiere', colors: ['#FEFDFB', '#A98A4E', '#3C3931'], desc: 'Tema Special putih ivory & champagne gold: floral watercolor, foto arch mempelai, petal berjatuhan, dan tipografi Pinyon Script & Cormorant yang elegan', category: 'Special', themeType: 'photo' },
  { id: 20, name: 'Opaline Pearl', code: 'SPL-007', emoji: '🤍', thumbnail: '/themes/Special/theme-12/cover-relief.jpg', layout: 'opaline-pearl', colors: ['#FCF9F7', '#C3A15D', '#2E2722'], desc: 'Tema Special pearl-ivory dengan shimmer opal, pintu ornamen 3D yang membuka saat undangan dibuka, filigree emas yang menggambar sendiri, dan tipografi Parisienne & Cormorant yang elegan', category: 'Special', themeType: 'photo' },
  { id: 21, name: 'Velour Olive', code: 'LUX-007', emoji: '🎭', thumbnail: '/themes/Luxury/theme-4/bg-hero-poster.jpg', layout: 'velour-olive', colors: ['#14150F', '#D9BC7A', '#F4EFE6'], desc: 'Tema Luxury "panggung pelaminan": latar video kain velvet olive yang diam saat konten di-scroll, cover tersibak dua kain velvet, navigasi scroll-snap fullscreen dengan rail titik, ornamen emas & kelopak berjatuhan', category: 'Luxury', themeType: 'photo' },
  { id: 22, name: 'Blush Pavilion', code: 'MOT-001', emoji: '🌸', thumbnail: '/themes/Motion/theme-4/thumb.jpg', layout: 'blush-pavilion', colors: ['#FBF6F2', '#A96A63', '#A9C4CB'], desc: 'Tema Motion taman pastel: paviliun mawar dengan air mancur, lampu kristal, dan tirai yang menggantung. Undangan dibuka pada aula gelap berlampu kristal, lalu seluruh layar mekar menjadi taman. Potret bundar seperti medali taman, dan galeri yang terjalin seperti susunan bata.', category: 'Motion', themeType: 'photo' },
  { id: 23, name: 'Gilded Palace', code: 'MOT-002', emoji: '🏛️', thumbnail: '/themes/Motion/theme-2/thumb.jpg', layout: 'gilded-palace', colors: ['#F7F1E6', '#A8823A', '#3A2E23'], desc: 'Tema Motion sinematik: tamu tiba di gerbang emas yang beku, dan begitu undangan dibuka kameranya berjalan sendiri menembus gerbang, halaman istana, dan lorong pualam sampai berhenti di tangga ballroom di bawah lampu kristal yang bernapas pelan selamanya. Marmer gading dengan tulisan gelap, satu-satunya tema terang di kategori ini.', category: 'Motion', themeType: 'photo' },
  { id: 24, name: 'Rose Sanctuary', code: 'MOT-003', emoji: '🌹', thumbnail: '/themes/Motion/theme-3/thumb.jpg', layout: 'rose-sanctuary', colors: ['#FAF5F0', '#8C3A3A', '#5E2422'], desc: 'Tema Motion cat air: masjid putih dengan air terjun, yang perlahan dikelilingi lengkung emas berukir dan pagar mawar merah tua yang mekar dari tepi layar saat undangan dibuka. Gading dengan tulisan merah anggur, dan kartu mempelai baru terbit setelah bunganya mekar penuh.', category: 'Motion', themeType: 'photo' },
  { id: 25, name: 'Memories', code: 'MOT-004', emoji: '💐', thumbnail: null, layout: 'memories', colors: ['#FBF7F4', '#9C6068', '#C6A374'], desc: 'Tema Motion yang tidak menggulir ke bawah sebagai satu halaman panjang: undangannya sembilan babak satu layar penuh yang dikunci scroll-snap, dengan bilah progres seperti Stories di atas dan pil navigasi di bawah, sehingga tamu bisa melompat ke babak mana pun. Latar blush pastel bergerak sendiri — cahaya yang hanyut, kabut mawar, dan kelopak berjatuhan — seluruhnya vektor, tanpa satu byte aset video.', category: 'Motion', themeType: 'photo' },
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
