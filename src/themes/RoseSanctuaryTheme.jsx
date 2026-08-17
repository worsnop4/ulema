import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { THEMES } from '../config/constants'

// ═══════════════════════════════════════════════════════════════════
//  ROSE SANCTUARY — kategori Motion (MOT-003)
//
//  Sebuah masjid putih dengan air terjun, dilukis cat air, perlahan
//  dikelilingi lengkung emas berukir dan pagar mawar merah tua yang mekar
//  dari tepi layar. Undangan dibuka pada masjid yang masih polos; bunganya
//  tumbuh sendiri sesudahnya.
//
//  Tiga babak, semuanya 810x1440:
//    poster.jpg  latar sebelum undangan dibuka — karya tersendiri, bukan
//                frame dari videonya (terukur 15,2 dB dari frame pertama
//                intro), jadi pembukaannya dissolve panjang yang disengaja
//    intro.mp4   8,5 dtk mekar, diputar sekali saat dibuka
//    loop.mp4    4,0 dtk, berputar terus sesudahnya
//
//  LOOP-NYA PING-PONG, dan itu keharusan, bukan gaya. Rekaman ini tidak
//  pernah berhenti bergerak: dua frame berjarak setengah detik saja hanya
//  mirip 18,2 dB, jadi memotong jendela mana pun lalu menyambungnya akan
//  menyentak. Ping-pong (mundur 8,5→6,5 lalu maju 6,5→8,5) adalah satu-
//  satunya konstruksi yang memberi sambungan tepat-frame di kedua ujungnya:
//  ia bermula dan berakhir di frame yang sama persis dengan ujung intro.
//  Hasil ukurannya 29,3 dB di sambungan intro dan 29,6 dB di titik putaran —
//  sementara dua frame BERSEBELAHAN di rekaman ini sendiri hanya 29,8 dB.
//  Artinya tidak ada satu pun sambungan yang lebih kasar daripada laju
//  gerak alami rekamannya, dan tak satu pun bisa terlihat.
//
//  Kenapa loop-nya berhenti di detik 8,5 dan bukan sampai akhir: mulai
//  sekitar detik 9 video ini memunculkan tulisannya sendiri — kata "The"
//  lalu aksara lain — yang pada detik 16 sudah terbaca jelas. Dijadikan
//  latar permanen, tulisan setengah jadi itu akan menempel selamanya di
//  belakang kartu "The Wedding Of" milik undangan ini.
//
//  Satu video saja yang pernah berjalan, mengikuti Gilded Palace: video
//  ber-opacity 0 tetap men-decode tiap frame, jadi loop dipasang tanpa
//  autoPlay dan elemen intro dilepas begitu gilirannya lewat.
// ═══════════════════════════════════════════════════════════════════

const A = {
  poster: '/themes/Motion/theme-3/poster.jpg',
  intro:  '/themes/Motion/theme-3/intro.mp4',
  loop:   '/themes/Motion/theme-3/loop.mp4',
}

// Detik ke berapa kartu "The Wedding Of" terbit. Pada detik 6 mawarnya sudah
// mekar penuh dan lengkung emasnya lengkap, jadi kartunya datang ke komposisi
// yang sudah jadi, bukan ke tengah mekar.
const HERO_AT = 6

// ─── PALET ───────────────────────────────────────────────────────
// Diambil dari rekamannya sendiri lewat palettegen, bukan dari selera:
// mawarnya #9F4647 / #803E39 / #652924, ukiran emasnya #B7937C, dan
// gadingnya #F3EFE8. Pita tempat teks berdiri punya luminansi median
// 202–236, jadi tema ini bertulisan gelap di atas terang — sama seperti
// Gilded Palace, dan sama-sama karena asetnya yang menentukan.
//
// Kontras terukur (di atas kartu / di atas video-median / video-tergelap):
//   ink       12,59 / 9,57 / 4,16   → aman di mana pun
//   roseDeep  11,07 / 8,41 / 3,66   → judul
//   rose       6,97 / 5,30 / 2,30   → aksen, aman di atas kartu
//   goldDeep   5,45 / 4,14 / 1,80   → label kecil, hanya di atas kartu
//   gold       2,93 / 2,23 / 1,03   → ornamen saja, tidak pernah teks kecil
const c = {
  paper:    '#FAF5F0',
  blush:    '#EDDCD2',
  rose:     '#8C3A3A',
  roseDeep: '#5E2422',
  roseSoft: '#B9635F',
  gold:     '#A98C63',
  goldDeep: '#7A6039',
  ink:      '#3A2A26',
  muted:    '#6B554E',
  faint:    'rgba(58,42,38,.55)',
}

const F = {
  display: "'Gilda Display', serif",
  script:  "'Allura', cursive",
  sans:    "'Karla', sans-serif",
}

// ─── DATE HELPERS ────────────────────────────────────────────────
const ID_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const ID_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const fmtDate = (s) => {
  if (!s) return ''
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return `${ID_DAYS[d.getDay()]}, ${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
const pad2 = (n) => String(n ?? 0).padStart(2, '0')

// AcaraForm membiarkan pasangan menambah sesi sebanyak yang mereka mau, dan
// kolom namanya boleh dikosongkan. Dua yang pertama punya nama baku; sesudah
// itu dinomori supaya sesi tanpa nama tetap bisa dibedakan.
const eventTitle = (ev, i) => ev?.name || ['Akad Nikah', 'Resepsi'][i] || `Acara ${i + 1}`

// ═══════════════════════════════════════════════════════════════════
//  PANGGUNG — latar masjid
// ═══════════════════════════════════════════════════════════════════

// Fixed dan dijangkarkan ke kolom undangan, bukan sticky. Sticky di dalam
// scroller ini sudah gagal dua kali dengan cara yang sama (kelopak Opaline,
// latar Gilded Palace): ia bertahan beberapa bagian lalu lepas di tengah
// jalan. Fixed tidak punya kotak pembatas yang bisa kehabisan tinggi.
const Panggung = ({ phase, introRef, loopRef, introMounted, still }) => (
  <div className="fixed pointer-events-none" style={{
    top: 0, left: '50%', transform: 'translateX(-50%)',
    width: 'var(--inv-w)', height: 'var(--inv-h)', zIndex: 0,
  }}>
    <div className="absolute inset-0 overflow-hidden" style={{ background: c.blush }}>

      {/* Poster ini karya tersendiri, bukan frame dari videonya: komposisi
          masjid yang lebih dekat dan lebih tajam, terukur 15,2 dB dari frame
          pertama intro — dua gambar yang benar-benar berbeda. Maka
          pembukaannya sengaja dijadikan dissolve panjang (lihat transisi
          opacity di bawah), bukan pergantian tak terlihat seperti di Gilded
          Palace. Arahnya kebetulan menolong: poster dekat larut ke video yang
          lebih lebar, jadi terbaca sebagai kamera yang menarik mundur. */}
      <img src={A.poster} alt="" className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'cover' }} />

      {!still && (
        <>
          {/* Tanpa autoPlay: yang mahal itu decode, bukan mount. Unduhannya
              pun baru dimulai setelah intro berjalan — membuka halaman
              seharusnya cuma menarik poster 100KB, bukan 6MB video. */}
          {/* Sengaja tanpa atribut poster. Atribut itu memasang gambar diam di
              dalam elemen video sampai frame pertamanya ter-decode, dan karena
              poster di sini bukan frame pertama video, hasilnya justru dua
              pergantian beruntun: poster → poster lagi → frame video.
              Gambar diamnya sudah dipegang <img> di belakang keduanya. */}
          <video ref={loopRef} muted loop playsInline
            preload={phase === 'poster' ? 'none' : 'auto'}
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: 'cover', opacity: phase === 'loop' ? 1 : 0, transition: 'opacity .5s ease' }}>
            <source src={A.loop} type="video/mp4" />
          </video>

          {/* 1,2 detik, jauh lebih panjang daripada pergantian intro→loop di
              bawahnya. Intro dan loop bertemu di frame yang sama sehingga
              boleh ditukar cepat; poster dan intro adalah dua gambar berbeda,
              dan dissolve yang tanggung di situ terbaca sebagai kedip. */}
          {introMounted && (
            <video ref={introRef} muted playsInline preload="auto"
              className="absolute inset-0 w-full h-full"
              style={{ objectFit: 'cover', opacity: phase === 'intro' ? 1 : 0, transition: 'opacity 1.2s ease' }}>
              <source src={A.intro} type="video/mp4" />
            </video>
          )}
        </>
      )}

      {/* Vignette hangat. Rekamannya sudah membingkai dirinya sendiri dengan
          mawar di keempat tepi, jadi ini hanya menegaskan tepi itu sedikit
          supaya kartu terbaca sebagai benda yang berdiri di depannya. */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(180deg, rgba(58,42,38,.20) 0%, rgba(58,42,38,0) 24%, rgba(58,42,38,0) 74%, rgba(58,42,38,.24) 100%)`,
      }} />
    </div>
  </div>
)

// ═══════════════════════════════════════════════════════════════════
//  PRIMITIF
// ═══════════════════════════════════════════════════════════════════

// Kubah bawang dengan puncak dan bulan sabit — bentuk masjid di rekamannya,
// dipakai berulang sebagai ornamen judul. Sengaja bukan lengkung Romawi
// bundar milik Gilded Palace: dua tema Motion ini tidak boleh terbaca
// sebagai satu tema yang diwarnai ulang.
const Dome = ({ w = 42, style = {} }) => (
  <svg viewBox="0 0 42 34" width={w} height={w * 34 / 42} fill="none" style={style}>
    <path d="M21 33 C7 33 4 26 4 21 C4 14 12 11 21 3 C30 11 38 14 38 21 C38 26 35 33 21 33 Z"
      stroke={c.gold} strokeWidth="1" strokeLinejoin="round" />
    <path d="M21 3 L21 0" stroke={c.gold} strokeWidth="1" strokeLinecap="round" />
    <circle cx="21" cy="21" r="3" stroke={c.gold} strokeWidth="1" />
  </svg>
)

const Kicker = ({ children, style = {} }) => (
  <p className="uppercase" style={{ margin: 0, fontFamily: F.sans, fontSize: 10, fontWeight: 600, letterSpacing: '.36em', color: c.goldDeep, ...style }}>{children}</p>
)

const Title = ({ children, style = {} }) => (
  <h2 style={{ margin: '10px 0 0', fontFamily: F.display, fontWeight: 400, fontSize: 30, lineHeight: 1.22, color: c.roseDeep, textWrap: 'balance', ...style }}>{children}</h2>
)

// Garis rambut dengan simpul mawar di tengahnya.
const Rule = ({ width = 76, style = {} }) => (
  <div className="flex items-center justify-center" style={{ width, gap: 7, ...style }}>
    <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${c.gold})` }} />
    <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.roseSoft }} />
    <span style={{ flex: 1, height: 1, background: `linear-gradient(270deg, transparent, ${c.gold})` }} />
  </div>
)

const Section = ({ id, children, style = {} }) => (
  <section id={id} className="relative" style={{ zIndex: 1, padding: '84px 24px', ...style }}>
    {children}
  </section>
)

const Reveal = ({ children, delay = 0, y = 20, className = '', style = {} }) => (
  <motion.div className={className} style={style}
    initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.8, delay, ease: [0.2, 0.7, 0.2, 1] }}>
    {children}
  </motion.div>
)

// Kartu kertas. Alpha 0,9 menjaga angka kontras di kepala berkas ini tetap
// berlaku; di bawah itu warna mawar mulai naik menembus kartu.
const cardStyle = {
  borderRadius: 18, padding: 22,
  background: 'rgba(250,245,240,.90)',
  border: `1px solid rgba(169,140,99,.36)`,
  backdropFilter: 'blur(9px) saturate(1.08)',
  WebkitBackdropFilter: 'blur(9px) saturate(1.08)',
  boxShadow: '0 16px 40px rgba(94,36,34,.16)',
}

// Kabut kertas di belakang kepala bagian, yang berdiri langsung di atas
// video. Alpha 0,88 menaikkan label kecil dari 1,80:1 (tak terbaca di frame
// tergelap) ke 4,88:1. Radial supaya tepinya larut, bukan jadi kartu lagi.
const haloStyle = {
  padding: '16px 22px 20px',
  background: 'radial-gradient(ellipse at center, rgba(250,245,240,.88) 0%, rgba(250,245,240,.8) 54%, rgba(250,245,240,0) 80%)',
}

// Bingkai foto berkubah, mengulang siluet masjid di latarnya. Fotonya
// dipasang lebih besar dari bingkai dan hanya digeser, tidak pernah
// di-scale: men-scale raster membuat wajah lembek.
const DomePhoto = ({ src, alt = '', w = 176, ratio = '3 / 4', pan = true, style = {} }) => (
  <div className="relative overflow-hidden" style={{
    width: w, aspectRatio: ratio,
    borderRadius: '50% 50% 14px 14px / 32% 32% 4% 4%',
    border: `1px solid rgba(169,140,99,.6)`,
    boxShadow: '0 18px 42px rgba(94,36,34,.24), inset 0 0 0 4px rgba(250,245,240,.6)',
    background: c.blush, ...style,
  }}>
    {src
      ? <img src={src} alt={alt} className="absolute object-cover rs-pan"
          style={{ width: '112%', height: '112%', left: '-6%', top: '-6%', maxWidth: 'none', animation: pan ? 'rs-pan 24s ease-in-out infinite alternate' : 'none' }} />
      : <span className="absolute inset-0 flex items-center justify-center" style={{ fontFamily: F.sans, fontSize: 11, color: c.faint }}>Foto</span>}
  </div>
)

const SectionHead = ({ kicker, title, children }) => (
  <Reveal className="flex flex-col items-center text-center" style={{ marginBottom: 26, ...haloStyle }}>
    <Dome style={{ marginBottom: 12 }} />
    {kicker && <Kicker>{kicker}</Kicker>}
    <Title>{title}</Title>
    <Rule style={{ marginTop: 14 }} />
    {children}
  </Reveal>
)

// ─── 1. COVER ────────────────────────────────────────────────────
// Fixed dan dijangkarkan ke kolom, bukan absolute inset-0: begitu tombol
// ditekan isi undangan ikut ter-mount dan tinggi akar melonjak ke ribuan
// piksel; cover absolute akan ikut memanjang dan isinya yang ter-center
// melompat jauh ke bawah layar persis saat transisinya berjalan.
const Cover = ({ data, groomNick, brideNick, heroDate, guestName, handleOpen, animateClose }) => {
  const coverPhoto = data?.meta?.coverPhoto || data?.meta?.photo || data?.bride?.photo || data?.groom?.photo || null
  return (
    <div className="fixed" style={{
      top: 0, left: '50%', transform: 'translateX(-50%)',
      width: 'var(--inv-w)', height: 'var(--inv-h)', zIndex: 80,
      pointerEvents: animateClose ? 'none' : 'auto',
    }}>
      <motion.div className="relative w-full h-full flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ padding: '48px 28px' }}
        animate={animateClose ? { opacity: 0, scale: 1.04 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 1.05, ease: [0.65, 0, 0.35, 1] }}>

        <img src={A.poster} alt="" className="absolute inset-0 w-full h-full" style={{ objectFit: 'cover' }} />
        <div className="absolute inset-0" style={{
          background: `linear-gradient(180deg, rgba(58,42,38,.22) 0%, rgba(58,42,38,.06) 36%, rgba(58,42,38,.26) 100%)`,
        }} />

        {/* Satu kartu digantung di depan masjid, bukan tulisan yang
            ditaburkan langsung di atasnya. Pusat rekaman ini terang
            (luminansi median 202–236), jadi tulisan terang di atasnya tidak
            akan terbaca, sementara menggelapkan latarnya berarti memadamkan
            gambar yang justru dibeli tamu. Kartu menyelesaikan keduanya. */}
        <motion.div className="relative flex flex-col items-center"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.9 }}>

          <DomePhoto src={coverPhoto} w={168} ratio="3 / 4" style={{ marginBottom: -30, zIndex: 1 }} />

          <div style={{ ...cardStyle, padding: '44px 26px 24px', width: 'min(328px, 100%)' }}>
            <div className="flex flex-col items-center text-center">
              <Kicker style={{ fontSize: 9, letterSpacing: '.32em' }}>The Wedding Of</Kicker>

              <h1 style={{ margin: '10px 0 0', fontFamily: F.script, fontSize: 46, lineHeight: 1.1, color: c.roseDeep }}>
                {groomNick} &amp; {brideNick}
              </h1>
              <Rule style={{ margin: '12px 0' }} />
              <p style={{ margin: 0, fontFamily: F.display, fontSize: 13.5, letterSpacing: '.16em', color: c.goldDeep }}>
                {heroDate}
              </p>

              <div style={{
                marginTop: 18, padding: '13px 22px', borderRadius: 13, alignSelf: 'stretch',
                background: 'rgba(237,220,210,.66)', border: `1px solid rgba(169,140,99,.3)`,
              }}>
                <Kicker style={{ fontSize: 8.5, letterSpacing: '.28em', color: c.faint }}>Kepada Yth.</Kicker>
                <p style={{ margin: '6px 0 0', fontFamily: F.display, fontSize: 18, color: c.ink }}>{guestName}</p>
              </div>

              <motion.button onClick={handleOpen} whileTap={{ scale: 0.96 }}
                style={{
                  marginTop: 18, alignSelf: 'stretch', padding: '14px 32px', borderRadius: 999,
                  border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${c.roseDeep}, ${c.rose} 55%, ${c.roseSoft})`,
                  color: c.paper,
                  fontFamily: F.sans, fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase',
                  boxShadow: '0 12px 28px rgba(94,36,34,.34)',
                }}>
                Buka Undangan
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─── 2. HERO ─────────────────────────────────────────────────────
// Muncul di detik ke-6 video, bukan begitu undangan dibuka. Enam detik
// pertama adalah mekarnya mawar dan tumbuhnya lengkung emas; menaruh kartu
// di atasnya sejak awal berarti menutupi satu-satunya bagian yang bergerak.
//
// `ready` datang dari waktu putar video yang sebenarnya, bukan dari
// setTimeout: kalau videonya tersendat karena jaringan, penghitung waktu
// akan menampilkan kartu di atas komposisi yang belum jadi.
const Hero = ({ data, groomNick, brideNick, heroDate, countdown, countdownEnabled, ready }) => {
  const parts = [['Hari', countdown?.d], ['Jam', countdown?.h], ['Menit', countdown?.m], ['Detik', countdown?.s]]
  const heroPhoto = data?.meta?.photo || data?.meta?.coverPhoto || data?.groom?.photo || data?.bride?.photo || null
  return (
    <section id="rs-home" className="relative flex flex-col items-center justify-end text-center"
      style={{ zIndex: 1, minHeight: 'var(--inv-h)', boxSizing: 'border-box', padding: '88px 24px 102px' }}>
      <motion.div className="flex flex-col items-center"
        initial={{ opacity: 0, y: 18 }}
        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
        style={{ pointerEvents: ready ? 'auto' : 'none' }}>

        {heroPhoto && <DomePhoto src={heroPhoto} w={152} ratio="3 / 4" style={{ marginBottom: -28, zIndex: 1 }} />}

        <div style={{ ...cardStyle, padding: heroPhoto ? '40px 22px 22px' : '24px 22px 22px', width: 'min(336px, 100%)' }}>
          <div className="flex flex-col items-center">
            <Dome style={{ marginBottom: 10 }} />
            <Kicker>The Wedding Of</Kicker>
            <h1 style={{ margin: '10px 0 0', fontFamily: F.script, fontSize: 50, lineHeight: 1.1, color: c.roseDeep }}>
              {groomNick} &amp; {brideNick}
            </h1>
            <Rule style={{ margin: '12px 0' }} />
            <p style={{ margin: 0, fontFamily: F.display, fontSize: 14, letterSpacing: '.15em', color: c.goldDeep }}>{heroDate}</p>
          </div>

          {countdownEnabled && (
            <div className="grid grid-cols-4" style={{ gap: 7, marginTop: 18 }}>
              {parts.map(([label, val]) => (
                <div key={label} style={{
                  borderRadius: 12, padding: '11px 3px 8px',
                  background: 'rgba(237,220,210,.66)', border: `1px solid rgba(169,140,99,.28)`,
                }}>
                  <div style={{ fontFamily: F.display, fontSize: 23, lineHeight: 1, color: c.roseDeep, fontVariantNumeric: 'tabular-nums' }}>{pad2(val)}</div>
                  <div className="uppercase" style={{ marginTop: 5, fontFamily: F.sans, fontSize: 8, fontWeight: 600, letterSpacing: '.16em', color: c.goldDeep }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  )
}

// ─── 3. QUOTE / DOA ──────────────────────────────────────────────
const Quote = ({ data }) => {
  const quote = data?.quote
  if (!quote) return null
  return (
    <Section id="rs-quote">
      <Reveal className="flex flex-col items-center text-center" style={cardStyle}>
        <Dome w={34} style={{ marginBottom: 14 }} />
        <p style={{
          margin: 0, fontFamily: F.display, fontSize: 17.5, lineHeight: 1.95,
          color: c.ink, textWrap: 'pretty', maxWidth: 320,
        }}>{quote}</p>
        <Rule width={52} style={{ marginTop: 16 }} />
      </Reveal>
    </Section>
  )
}

// ─── 4. MEMPELAI ─────────────────────────────────────────────────
// Potret berdiri di samping namanya, dan sisinya bertukar antara mempelai
// pria dan wanita — bukan dua kartu tengah bertumpuk yang identik. Bujur
// telur penuh dipakai di sini, berbeda dari kubah di sampul dan hero, supaya
// bagian ini punya bentuknya sendiri.
//
// Foto 118px membuat kolom teks tetap sekitar 200px di layar 390px: cukup
// untuk nama lengkap dan nama kedua orang tua tanpa terpecah jadi satu kata
// per baris.
const PersonCard = ({ person, delay, flip }) => (
  <Reveal delay={delay} style={{ ...cardStyle, padding: 16 }}>
    <div className="flex items-center" style={{ gap: 15, flexDirection: flip ? 'row-reverse' : 'row' }}>
      <div className="relative flex-shrink-0 overflow-hidden" style={{
        width: 118, aspectRatio: '3 / 4', borderRadius: '50%',
        border: `1px solid rgba(169,140,99,.6)`,
        boxShadow: '0 12px 26px rgba(94,36,34,.2), inset 0 0 0 4px rgba(250,245,240,.65)',
        background: c.blush,
      }}>
        {person?.photo
          ? <img src={person.photo} alt={person?.nickname || ''} className="absolute object-cover"
              style={{ width: '112%', height: '112%', left: '-6%', top: '-6%', maxWidth: 'none' }} />
          : <span className="absolute inset-0 flex items-center justify-center" style={{ fontFamily: F.sans, fontSize: 11, color: c.faint }}>Foto</span>}
      </div>

      <div style={{ minWidth: 0, flex: 1, textAlign: flip ? 'right' : 'left' }}>
        <h3 style={{ margin: 0, fontFamily: F.script, fontSize: 36, lineHeight: 1.05, color: c.rose }}>
          {person?.nickname || '—'}
        </h3>
        <p style={{ margin: '3px 0 0', fontFamily: F.display, fontSize: 15.5, lineHeight: 1.3, color: c.ink }}>
          {person?.name || person?.nickname || '—'}
        </p>
        <span style={{
          display: 'block', width: 34, height: 1, margin: '10px 0',
          marginLeft: flip ? 'auto' : 0,
          background: c.gold,
        }} />
        <p style={{ margin: 0, fontFamily: F.sans, fontSize: 12, lineHeight: 1.7, color: c.muted }}>
          Putra/Putri dari<br />
          {person?.father || '—'} &amp; {person?.mother || '—'}
        </p>

        {person?.instagram && (
          <a href={`https://instagram.com/${person.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
            style={{ display: 'inline-block', marginTop: 9, fontFamily: F.sans, fontSize: 11.5, fontWeight: 600, color: c.rose }}>
            @{person.instagram.replace('@', '')}
          </a>
        )}
      </div>
    </div>
  </Reveal>
)

const Mempelai = ({ data }) => (
  <Section id="rs-mempelai">
    <SectionHead kicker="Assalamualaikum Wr. Wb." title="Mempelai">
      <p style={{ margin: '14px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.85, color: c.muted, maxWidth: 300 }}>
        Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.
      </p>
    </SectionHead>

    <div className="flex flex-col" style={{ gap: 14 }}>
      <PersonCard person={data?.groom} delay={0} flip={false} />
      {/* Medali di antara dua potret, digeser ke sisi yang berlawanan dengan
          foto di atasnya supaya alur zigzagnya tersambung. Ia memang butuh
          keping kertasnya sendiri: satu huruf sebesar ini di atas video
          terang tidak punya apa pun untuk dibaca sebagai latar. */}
      <span className="flex items-center justify-center self-center" style={{
        width: 46, height: 46, borderRadius: '50%',
        background: 'rgba(250,245,240,.9)', border: `1px solid rgba(169,140,99,.48)`,
        boxShadow: '0 8px 22px rgba(94,36,34,.2)',
        fontFamily: F.script, fontSize: 32, lineHeight: 1, color: c.rose, paddingBottom: 8,
      }}>&amp;</span>
      <PersonCard person={data?.bride} delay={0.08} flip />
    </div>
  </Section>
)

// ─── 5. ACARA ────────────────────────────────────────────────────
// Nama field mengikuti modul editor, bukan src/types/invitation.js:
// name / date / dateLabel / start / end / tz / venue / address / maps.
// Bukan title / time / location / mapUrl — nama-nama itu tidak pernah ada
// di data tersimpan dan sudah empat kali jadi sumber bug di repo ini.
//
// Seluruh data.events di-map. Empat tema lama memasangkan mati events[0]
// dan events[1] lalu diam-diam membuang sesi ketiga; itu baru selesai
// diperbaiki, dan tema baru tidak boleh mengulanginya.
// Tanggal dipecah jadi bagian-bagiannya untuk potongan tiket. Hanya kalau
// `date` benar-benar terurai; `dateLabel` teks bebas dan tidak boleh
// dilewatkan ke new Date() — "Awal 2024" akan berubah jadi 1 Januari 2024.
const fmtParts = (s) => {
  if (!s) return null
  const d = new Date(s)
  if (isNaN(d.getTime())) return null
  return { day: pad2(d.getDate()), mon: ID_MONTHS[d.getMonth()].slice(0, 3), yr: d.getFullYear(), dayName: ID_DAYS[d.getDay()] }
}

// Berbentuk tiket, bukan kartu tengah bertumpuk: potongan tanggal di kiri,
// keterangan di kanan, dipisah garis putus-putus seperti sobekan karcis.
// Angka tanggalnya jadi jangkar mata, sehingga daftar beberapa sesi bisa
// dipindai sekali lihat alih-alih dibaca satu per satu dari atas.
const EventCard = ({ ev, i, delay }) => {
  if (!ev) return null
  const parts = fmtParts(ev.date)
  const dateLabel = ev.dateLabel || fmtDate(ev.date)
  const hours = [ev.start, ev.end].filter(Boolean).join(' – ')
  return (
    <Reveal delay={delay} style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
      <div className="flex items-stretch">
        {/* Potongan tiket. Hanya muncul kalau tanggalnya terurai; kalau
            pasangan hanya mengetik label bebas, seluruh ruang diberikan ke
            kolom kanan alih-alih menampilkan stub kosong. */}
        {parts && (
          <div className="flex-shrink-0 flex flex-col items-center justify-center text-center"
            style={{
              width: 92, padding: '18px 8px',
              background: 'rgba(237,220,210,.72)',
              borderRight: `1px dashed rgba(140,58,58,.42)`,
            }}>
            <span className="uppercase" style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 700, letterSpacing: '.18em', color: c.goldDeep }}>{parts.dayName}</span>
            <span style={{ fontFamily: F.display, fontSize: 40, lineHeight: 1.05, color: c.roseDeep, fontVariantNumeric: 'tabular-nums' }}>{parts.day}</span>
            <span className="uppercase" style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 700, letterSpacing: '.14em', color: c.rose }}>{parts.mon}</span>
            <span style={{ fontFamily: F.sans, fontSize: 10.5, color: c.muted, fontVariantNumeric: 'tabular-nums' }}>{parts.yr}</span>
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0, padding: '16px 16px 18px' }}>
          <Kicker style={{ fontSize: 9.5, letterSpacing: '.24em' }}>{eventTitle(ev, i)}</Kicker>

          {!parts && dateLabel && (
            <p style={{ margin: '8px 0 0', fontFamily: F.display, fontSize: 17, color: c.roseDeep }}>{dateLabel}</p>
          )}
          {hours && (
            <p style={{ margin: '8px 0 0', fontFamily: F.display, fontSize: 16.5, letterSpacing: '.04em', color: c.goldDeep, fontVariantNumeric: 'tabular-nums' }}>
              {hours}{ev.tz ? ` ${ev.tz}` : ''}
            </p>
          )}

          {ev.venue && (
            <p style={{ margin: '10px 0 0', fontFamily: F.sans, fontSize: 14, fontWeight: 700, lineHeight: 1.35, color: c.ink }}>{ev.venue}</p>
          )}
          {ev.address && (
            <p style={{ margin: '5px 0 0', fontFamily: F.sans, fontSize: 12, lineHeight: 1.65, color: c.muted }}>{ev.address}</p>
          )}

          {ev.maps && (
            <a href={ev.maps} target="_blank" rel="noreferrer" className="inline-block"
              style={{
                marginTop: 14, padding: '9px 18px', borderRadius: 999,
                border: `1px solid ${c.rose}`, color: c.rose,
                fontFamily: F.sans, fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase',
              }}>
              Petunjuk Arah
            </a>
          )}
        </div>
      </div>
    </Reveal>
  )
}

const Acara = ({ data }) => {
  const events = data?.events || []
  if (!events.length) return null
  return (
    <Section id="rs-acara">
      <SectionHead kicker="Save The Date" title="Rangkaian Acara" />
      <div className="flex flex-col" style={{ gap: 15 }}>
        {events.map((ev, i) => <EventCard key={ev?.id || i} ev={ev} i={i} delay={i * 0.07} />)}
      </div>
    </Section>
  )
}

// ─── 6. LOVE STORY (opsional) ────────────────────────────────────
// `year` teks bebas dan ditampilkan apa adanya: melewatkannya ke new Date()
// akan mengubah "2019" jadi 1 Januari 2019 dan menelan "Awal 2024" bulat-
// bulat. Deskripsinya ada di `desc`, bukan `story`.
const LoveStory = ({ data }) => {
  const stories = data?.loveStory || []
  if (!stories.length) return null
  return (
    <Section id="rs-story">
      <SectionHead kicker="Perjalanan Kami" title="Love Story" />

      {/* Kartu pos, bukan rel bertulang tengah. Fotonya berdiri di samping
          teks dan berpindah sisi tiap babak, jadi matanya bergerak zigzag
          menyusuri halaman alih-alih turun lurus menyusuri satu garis.
          Susunannya tetap satu kolom supaya tetap terbaca di lebar 390px —
          zigzag sungguhan dengan dua kolom akan meremas keduanya. */}
      <div className="flex flex-col" style={{ gap: 14 }}>
        {stories.map((s, i) => {
          const flip = i % 2 === 1
          return (
            <Reveal key={s.id || i} delay={i * 0.06} style={{ ...cardStyle, padding: 14 }}>
              <div className="flex items-start" style={{ gap: 13, flexDirection: flip ? 'row-reverse' : 'row' }}>
                {/* Paspartu putih dibuat dengan border, bukan outline: outline
                    tidak ikut lengkung sudut, dan aturan penggambarannya di
                    atas konten kurang seragam antar-browser. */}
                {s.photo && (
                  <div className="flex-shrink-0 overflow-hidden" style={{
                    width: 104, aspectRatio: '3 / 4', borderRadius: 3,
                    boxSizing: 'border-box', border: `5px solid ${c.paper}`,
                    background: c.blush,
                    boxShadow: '0 6px 16px rgba(94,36,34,.2)',
                    transform: `rotate(${flip ? 1.3 : -1.3}deg)`,
                  }}>
                    <img src={s.photo} alt="" className="w-full h-full object-cover" style={{ objectPosition: 'center 35%' }} />
                  </div>
                )}
                <div style={{ minWidth: 0, flex: 1, textAlign: flip ? 'right' : 'left' }}>
                  {/* Tahun sebagai angka besar bertulisan tangan, bukan label
                      huruf kapital kecil — inilah penanda babaknya di sini,
                      menggantikan titik di rel. */}
                  {s.year && (
                    <p style={{ margin: 0, fontFamily: F.script, fontSize: 30, lineHeight: 1, color: c.roseSoft }}>{s.year}</p>
                  )}
                  {s.title && <p style={{ margin: '6px 0 0', fontFamily: F.display, fontSize: 16.5, lineHeight: 1.3, color: c.roseDeep }}>{s.title}</p>}
                  {s.desc && <p style={{ margin: '7px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.75, color: c.muted }}>{s.desc}</p>}
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}

// ─── 7. GALERI (opsional) — album tempelan ───────────────────────
// Sengaja bukan grid rapi berbingkai kubah seperti tema Motion sebelumnya.
// Foto di sini ditempel seperti di album kertas: tinggi berbeda-beda dalam
// dua kolom masonry, tiap lembar diberi paspartu putih dan dimiringkan
// sedikit ke arah berlawanan.
//
// columnCount, bukan grid. Grid memaksa tiap baris setinggi barisnya yang
// tertinggi, dan itu justru yang membuat galeri terasa seperti tabel.
// Multi-kolom membiarkan tiap lembar setinggi dirinya sendiri lalu
// menumpuknya rapat — persis kesan album yang dicari.
//
// Kemiringannya dari indeks, bukan Math.random(): react-hooks/purity
// melarang panggilan tak-murni saat render, dan nilai acak akan berubah
// setiap kali komponen ini digambar ulang.
const TILT = [-1.4, 1, -0.7, 1.5, -1.1, 0.8]
const RATIO = ['3 / 4', '4 / 5', '1 / 1', '3 / 4', '4 / 5', '4 / 3']

const Galeri = ({ data }) => {
  const photos = (data?.gallery || []).map(g => (typeof g === 'string' ? g : g?.src)).filter(Boolean)
  if (!photos.length) return null
  return (
    <Section id="rs-galeri">
      <SectionHead kicker="Momen" title="Galeri" />
      {/* Satu Reveal untuk seluruh album, bukan per lembar: animasi transform
          pada anak multi-kolom bisa membuatnya melompat kolom saat berjalan. */}
      <Reveal>
        {/* Satu foto tidak boleh dipaksa ke dua kolom: ia akan berdiri
            setengah lebar dengan separuh halaman kosong di sebelahnya. */}
        <div style={{ columnCount: photos.length > 1 ? 2 : 1, columnGap: 11 }}>
          {photos.map((src, i) => (
            <div key={src} style={{ breakInside: 'avoid', marginBottom: 11 }}>
              <div style={{
                padding: 7, paddingBottom: 16, borderRadius: 3,
                background: c.paper,
                boxShadow: '0 8px 20px rgba(94,36,34,.18)',
                transform: `rotate(${TILT[i % TILT.length]}deg)`,
              }}>
                <div className="overflow-hidden" style={{ aspectRatio: RATIO[i % RATIO.length], background: c.blush }}>
                  <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  )
}

// ─── 8. INFORMASI (dresscode / live / hadiah / turut mengundang) ──
const InfoCard = ({ label, children, delay }) => (
  <Reveal delay={delay} style={cardStyle}>
    <Kicker style={{ fontSize: 9.5, letterSpacing: '.26em' }}>{label}</Kicker>
    <Rule width={38} style={{ margin: '10px 0 14px' }} />
    <div>{children}</div>
  </Reveal>
)

// Satu warna, karena editor menyimpan satu warna.
const Dresscode = ({ dresscode }) => (
  <div className="flex items-center" style={{ gap: 14 }}>
    {dresscode.color && (
      <span className="flex-shrink-0" style={{
        width: 42, height: 42, borderRadius: '50%',
        background: dresscode.color,
        border: `1px solid rgba(169,140,99,.55)`,
        boxShadow: '0 0 0 4px rgba(250,245,240,.65), 0 6px 14px rgba(94,36,34,.18)',
      }} />
    )}
    <div style={{ minWidth: 0 }}>
      {dresscode.name && <p style={{ margin: 0, fontFamily: F.display, fontSize: 17, color: c.roseDeep }}>{dresscode.name}</p>}
      {dresscode.notes && <p style={{ margin: '4px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.7, color: c.muted }}>{dresscode.notes}</p>}
    </div>
  </div>
)

const giftBox = {
  padding: '14px 16px', borderRadius: 14,
  background: 'rgba(237,220,210,.6)', border: `1px solid rgba(169,140,99,.32)`,
}

const copyBtn = {
  marginTop: 12, padding: '8px 18px', borderRadius: 999, cursor: 'pointer',
  background: 'transparent', border: `1px solid ${c.rose}`, color: c.rose,
  fontFamily: F.sans, fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase',
}

const Gift = ({ accounts, giftAddr, copiedKey, copy }) => (
  <div className="flex flex-col" style={{ gap: 12 }}>
    <p style={{ margin: 0, fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.7, color: c.muted }}>
      Doa restu Anda adalah hadiah terindah. Bila berkenan memberi tanda kasih, berikut informasinya.
    </p>

    {accounts.map((acc, i) => (
      <div key={acc.id || i} style={giftBox}>
        {/* `bank` juga menyimpan nama e-wallet ketika type-nya 'ewallet' —
            satu field untuk keduanya, jadi jangan pernah melabelinya "Bank"
            tanpa syarat. Nomornya di `number`, pemiliknya di `holder`. */}
        <p style={{ margin: 0, fontFamily: F.sans, fontSize: 10.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: c.goldDeep }}>
          {acc.bank || (acc.type === 'ewallet' ? 'E-Wallet' : 'Bank')}
        </p>
        <p style={{ margin: '8px 0 0', fontFamily: F.display, fontSize: 19, letterSpacing: '.05em', color: c.ink, fontVariantNumeric: 'tabular-nums' }}>{acc.number || '—'}</p>
        {acc.holder && <p style={{ margin: '4px 0 0', fontFamily: F.sans, fontSize: 12.5, color: c.muted }}>a.n. {acc.holder}</p>}
        {acc.number && (
          <button onClick={() => copy(acc.number, acc.id || i)} style={copyBtn}>
            {copiedKey === (acc.id || i) ? 'Tersalin' : 'Salin'}
          </button>
        )}
      </div>
    ))}

    {/* Alamat pengiriman kado. Toggle-nya berdiri sendiri di editor, terpisah
        dari daftar rekening, jadi bagian Hadiah harus muncul bila salah
        satunya terisi — bukan hanya bila ada rekening. */}
    {giftAddr && (
      <div style={giftBox}>
        <p style={{ margin: 0, fontFamily: F.sans, fontSize: 10.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: c.goldDeep }}>Kirim Kado</p>
        {giftAddr.recipient && <p style={{ margin: '8px 0 0', fontFamily: F.display, fontSize: 17, color: c.ink }}>{giftAddr.recipient}</p>}
        {giftAddr.phone && <p style={{ margin: '4px 0 0', fontFamily: F.sans, fontSize: 12.5, color: c.muted }}>{giftAddr.phone}</p>}
        {giftAddr.address && <p style={{ margin: '10px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.75, color: c.muted, whiteSpace: 'pre-line' }}>{giftAddr.address}</p>}
        {giftAddr.address && (
          <button onClick={() => copy(giftAddr.address, 'rs-gift-address')} style={copyBtn}>
            {copiedKey === 'rs-gift-address' ? 'Tersalin' : 'Salin Alamat'}
          </button>
        )}
      </div>
    )}
  </div>
)

const Informasi = ({ data }) => {
  const { copiedKey, copy } = useCopyToClipboard()
  const dresscode = data?.dresscode || {}
  const hasDresscode = Boolean(dresscode.name || dresscode.color || dresscode.notes)
  const live = Boolean(data?.livestreamEnabled) && (data?.livestreamPlatforms || []).filter(p => p?.url)
  const hasLive = Boolean(live && live.length)
  const accounts = data?.accounts || []
  const ga = data?.giftAddress
  const giftAddr = ga?.enabled && (ga.address || ga.recipient || ga.phone) ? ga : null
  const families = (data?.families || [])
    .map(f => ({ ...f, members: (f.members || []).filter(m => m && m.trim()) }))
    .filter(f => f.members.length)
  const hasFamilies = Boolean(data?.turutMengundangEnabled) && families.length > 0

  if (!hasDresscode && !hasLive && !accounts.length && !giftAddr && !hasFamilies) return null

  return (
    <Section id="rs-info">
      <SectionHead kicker="Untuk Tamu" title="Informasi" />

      <div className="flex flex-col" style={{ gap: 14 }}>
        {hasDresscode && (
          <InfoCard label="Dresscode" delay={0}><Dresscode dresscode={dresscode} /></InfoCard>
        )}

        {hasLive && (
          <InfoCard label="Live Streaming" delay={0.05}>
            <div className="flex flex-col" style={{ gap: 10 }}>
              {live.map((p, i) => (
                <a key={i} href={p.url} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between" style={{ ...giftBox, padding: '12px 16px' }}>
                  <span style={{ fontFamily: F.sans, fontSize: 13, color: c.ink }}>{p.type || 'Siaran Langsung'}</span>
                  <span style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: c.rose }}>Tonton</span>
                </a>
              ))}
            </div>
          </InfoCard>
        )}

        {(accounts.length > 0 || giftAddr) && (
          <InfoCard label="Hadiah" delay={0.1}>
            <Gift accounts={accounts} giftAddr={giftAddr} copiedKey={copiedKey} copy={copy} />
          </InfoCard>
        )}

        {hasFamilies && (
          <InfoCard label="Turut Mengundang" delay={0.15}>
            <div className="flex flex-col" style={{ gap: 14 }}>
              {families.map((fam, i) => (
                <div key={i}>
                  {fam.side && <p style={{ margin: 0, fontFamily: F.display, fontSize: 15, color: c.rose }}>{fam.side}</p>}
                  {fam.members.map((m, j) => (
                    <p key={j} style={{ margin: '4px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.8, color: c.muted }}>{m}</p>
                  ))}
                </div>
              ))}
            </div>
          </InfoCard>
        )}
      </div>
    </Section>
  )
}

// ─── 9. RSVP & UCAPAN ────────────────────────────────────────────
// Bentuk ucapan tersimpan, dicocokkan dengan baris sungguhan:
// { name, wish, rsvp, guests, time }. `rsvp` bernilai 'hadir' atau
// 'tidak_hadir' — perhatikan garis bawahnya.
const fieldStyle = {
  width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12,
  background: 'rgba(255,253,251,.8)', border: `1px solid rgba(169,140,99,.36)`,
  color: c.ink, fontFamily: F.sans, fontSize: 13.5, outline: 'none',
}

const RsvpUcapan = ({ wishes, onSubmitWish }) => {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [attendance, setAttendance] = useState('hadir')
  const [guests, setGuests] = useState(1)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const list = wishes || []
  const canSend = name.trim() && message.trim() && !busy

  const submit = async (e) => {
    e.preventDefault()
    if (!canSend) return
    setBusy(true)
    try {
      if (onSubmitWish) await onSubmitWish({ name, message, attendance, guests })
      setName(''); setMessage(''); setAttendance('hadir'); setGuests(1)
      setSent(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section id="rs-rsvp">
      <SectionHead kicker="Konfirmasi Kehadiran" title="RSVP & Ucapan" />

      <Reveal style={cardStyle}>
        <form onSubmit={submit} className="flex flex-col" style={{ gap: 11 }}>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Nama Anda" style={fieldStyle} />

          <div className="flex" style={{ gap: 8 }}>
            {[['hadir', 'Hadir'], ['tidak_hadir', 'Berhalangan']].map(([val, label]) => {
              const on = attendance === val
              return (
                <button key={val} type="button" onClick={() => setAttendance(val)}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 999, cursor: 'pointer',
                    fontFamily: F.sans, fontSize: 12, fontWeight: 700, letterSpacing: '.05em',
                    background: on ? `linear-gradient(135deg, ${c.roseDeep}, ${c.rose} 55%, ${c.roseSoft})` : 'transparent',
                    color: on ? c.paper : c.muted,
                    border: `1px solid ${on ? 'transparent' : 'rgba(169,140,99,.42)'}`,
                  }}>
                  {label}
                </button>
              )
            })}
          </div>

          {attendance === 'hadir' && (
            <select value={guests} onChange={e => setGuests(Number(e.target.value))}
              style={{ ...fieldStyle, appearance: 'none' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n} orang{n === 5 ? ' atau lebih' : ''}</option>
              ))}
            </select>
          )}

          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
            placeholder="Tulis doa & ucapan…" style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.7 }} />

          <button type="submit" disabled={!canSend}
            style={{
              padding: '13px 0', borderRadius: 999, border: 'none',
              cursor: canSend ? 'pointer' : 'not-allowed', opacity: canSend ? 1 : 0.45,
              background: `linear-gradient(135deg, ${c.roseDeep}, ${c.rose} 55%, ${c.roseSoft})`,
              color: c.paper,
              fontFamily: F.sans, fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase',
            }}>
            {busy ? 'Mengirim…' : 'Kirim Ucapan'}
          </button>

          {sent && (
            <p style={{ margin: 0, textAlign: 'center', fontFamily: F.sans, fontSize: 12, color: c.rose }}>
              Terima kasih atas doa dan ucapannya.
            </p>
          )}
        </form>
      </Reveal>

      {list.length > 0 && (
        <div className="flex flex-col" style={{ gap: 11, marginTop: 18, maxHeight: 360, overflowY: 'auto', paddingRight: 2 }}>
          {list.map((w, i) => (
            <div key={w.id || i} style={{ ...cardStyle, padding: 16 }}>
              <div className="flex items-center justify-between" style={{ gap: 10 }}>
                <p style={{ margin: 0, fontFamily: F.display, fontSize: 15, color: c.roseDeep }}>{w.name}</p>
                <span style={{
                  flexShrink: 0, padding: '4px 11px', borderRadius: 999,
                  fontFamily: F.sans, fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                  background: w.rsvp === 'hadir' ? 'rgba(140,58,58,.14)' : 'rgba(58,42,38,.08)',
                  color: w.rsvp === 'hadir' ? c.rose : c.faint,
                }}>
                  {w.rsvp === 'hadir' ? 'Hadir' : 'Berhalangan'}
                </span>
              </div>
              {w.wish && <p style={{ margin: '8px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.75, color: c.muted }}>{w.wish}</p>}
              {w.time && <p style={{ margin: '8px 0 0', fontFamily: F.sans, fontSize: 10.5, color: c.faint }}>{w.time}</p>}
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

// ─── 10. PENUTUP ─────────────────────────────────────────────────
const Penutup = ({ data, groomNick, brideNick, heroDate }) => {
  const photo = data?.meta?.footerPhoto || data?.meta?.photo || null
  return (
    <section id="rs-penutup" className="relative flex flex-col items-center justify-center text-center"
      style={{ zIndex: 1, minHeight: 'var(--inv-h)', boxSizing: 'border-box', padding: '88px 24px 148px' }}>
      <Reveal className="flex flex-col items-center" style={{ ...cardStyle, padding: '28px 22px 24px', width: 'min(342px, 100%)' }}>
        {photo && <DomePhoto src={photo} w={146} ratio="3 / 4" style={{ marginBottom: 18 }} />}
        <p style={{ margin: 0, fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.9, color: c.muted, maxWidth: 300 }}>
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir
          untuk memberikan doa restu.
        </p>
        <Rule width={58} style={{ margin: '20px 0' }} />
        <Kicker>Wassalamualaikum Wr. Wb.</Kicker>
        <h2 style={{ margin: '14px 0 0', fontFamily: F.script, fontSize: 44, lineHeight: 1.1, color: c.roseDeep }}>
          {groomNick} &amp; {brideNick}
        </h2>
        <p style={{ margin: '10px 0 0', fontFamily: F.display, fontSize: 13.5, letterSpacing: '.14em', color: c.goldDeep }}>{heroDate}</p>
      </Reveal>
    </section>
  )
}

// ─── NAV & MUSIK ─────────────────────────────────────────────────
// Fixed murni, tanpa `md:absolute`. Tema-tema lama memakai `fixed
// md:absolute`, dan di layar >= 768px varian absolute yang menang: navigasi
// lalu berlabuh di dasar dokumen, bukan di layar.
const NAV = [['Home', 'rs-home'], ['Mempelai', 'rs-mempelai'], ['Acara', 'rs-acara'], ['Galeri', 'rs-galeri'], ['RSVP', 'rs-rsvp']]

const scrollToId = (id) => {
  // Yang menggulir itu div bagian dalam InvitationLayout, bukan jendela.
  // window.scrollTo di sini selalu tidak berefek.
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const BottomNav = ({ visible }) => (
  <nav className="fixed flex" style={{
    bottom: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
    width: 'min(420px, calc(var(--inv-w) - 28px))', gap: 2, padding: '7px 9px', borderRadius: 999,
    background: 'rgba(250,245,240,.88)', border: `1px solid rgba(169,140,99,.44)`,
    backdropFilter: 'blur(18px) saturate(1.3)', WebkitBackdropFilter: 'blur(18px) saturate(1.3)',
    boxShadow: '0 14px 34px rgba(94,36,34,.24)',
    opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none', transition: 'opacity .7s ease .3s',
  }}>
    {NAV.map(([label, id]) => (
      <button key={id} className="rs-nav-btn" onClick={() => scrollToId(id)}
        style={{
          flex: 1, padding: '8px 2px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: 'transparent', color: c.rose,
          fontFamily: F.sans, fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase',
        }}>
        {label}
      </button>
    ))}
  </nav>
)

const MusicButton = ({ musicPlaying, setMusicPlaying, visible }) => (
  <button onClick={() => setMusicPlaying(!musicPlaying)} title="Musik"
    className="fixed flex items-end justify-center"
    style={{
      bottom: 84, right: 'max(16px, calc(50vw - var(--inv-w) / 2 + 16px))', zIndex: 60,
      width: 46, height: 46, borderRadius: '50%', cursor: 'pointer', gap: 3, paddingBottom: 15,
      background: 'rgba(250,245,240,.88)', border: `1px solid rgba(169,140,99,.46)`,
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '0 10px 24px rgba(94,36,34,.22)',
      opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none', transition: 'opacity .7s ease .3s',
    }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        display: 'block', width: 3, height: 14, borderRadius: 2, background: c.rose,
        transformOrigin: 'bottom',
        transform: musicPlaying ? undefined : 'scaleY(.35)',
        animation: musicPlaying ? `rs-eq ${0.62 + i * 0.15}s ease-in-out infinite` : 'none',
      }} />
    ))}
  </button>
)

// ═══════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════
export default function RoseSanctuaryTheme({
  data, countdown, opened, setOpened,
  animateClose, setAnimateClose,
  musicPlaying, setMusicPlaying, audioRef,
  wishes, onSubmitWish, guestName,
}) {
  const introRef = useRef(null)
  const loopRef = useRef(null)

  // 'poster' → 'intro' → 'loop'. Satu arah, tidak pernah kembali.
  const [phase, setPhase] = useState('poster')
  const [introMounted, setIntroMounted] = useState(true)
  const [heroReady, setHeroReady] = useState(false)

  // Terpisah dari `opened` dengan sengaja: isi undangan ter-mount seketika,
  // tapi cover harus tetap terpasang sepanjang fade-nya sendiri.
  const [coverGone, setCoverGone] = useState(false)

  // Dibaca sekali lewat lazy initializer, bukan saat render: membaca
  // matchMedia di badan komponen adalah pembacaan tak-murni yang dilarang
  // react-hooks/purity.
  const [reduceMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )

  const groomNick = data?.groom?.nickname || 'Mempelai Pria'
  const brideNick = data?.bride?.nickname || 'Mempelai Wanita'
  const heroDate = data?.events?.[0]?.dateLabel || fmtDate(data?.events?.[0]?.date)
  const guest = guestName || 'Bapak/Ibu/Saudara/i'
  const musicEnabled = data?.music !== false

  // Sambungan intro → loop, dan pemicu munculnya kartu Hero.
  useEffect(() => {
    const v = introRef.current
    if (!v) return
    const onTime = () => { if (v.currentTime >= HERO_AT) setHeroReady(true) }
    const onEnd = () => {
      // Juga di sini, bukan hanya di timeupdate: bila tamu menyeret videonya
      // melewati detik 6, atau timeupdate dilewati saat tab di latar
      // belakang, kartunya tetap harus terbit.
      setHeroReady(true)
      const l = loopRef.current
      if (l) { l.currentTime = 0; l.play().catch(() => {}) }
      setPhase('loop')
      setTimeout(() => setIntroMounted(false), 800)
    }
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', onEnd)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('ended', onEnd)
    }
  }, [introMounted])

  const handleOpen = () => {
    if (animateClose) return
    setAnimateClose(true)
    // Isi undangan dipasang seketika, di bawah cover yang masih pekat.
    // Membayar ongkos layout selagi belum ada yang bergerak itu tak terlihat;
    // membayarnya di ujung transisi menjatuhkan frame persis di puncaknya.
    setOpened(true)
    if (audioRef?.current) setMusicPlaying(true)

    if (reduceMotion) {
      // Tanpa video: tidak ada yang perlu ditunggu.
      setHeroReady(true)
    } else {
      const v = introRef.current
      if (v) {
        v.currentTime = 0
        // Muted + playsInline, dan dipicu oleh ketukan tamu — dua alasan
        // terpisah kenapa autoplay policy tidak akan menolaknya. Kalau tetap
        // gagal, latar diam di frame beku, bukan jadi kosong.
        v.play().then(() => setPhase('intro')).catch(() => {
          setPhase('poster')
          setHeroReady(true)
        })
        // Jaring pengaman: video yang mogok tidak boleh meninggalkan undangan
        // kosong selamanya. Ambangnya jauh di atas 6 detik supaya jalur
        // normal selalu menang lebih dulu.
        setTimeout(() => setHeroReady(true), 14000)
      } else {
        setHeroReady(true)
      }
    }
    setTimeout(() => setCoverGone(true), 1150)
  }

  return (
    <InvitationLayout layout={THEMES.ROSE_SANCTUARY} data={data}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gilda+Display&family=Karla:wght@400;500;600;700&family=Allura&display=swap');

        /* Geser saja, jangan pernah scale: men-scale raster melembekkan foto. */
        @keyframes rs-pan {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-3%, -2.5%, 0); }
        }
        @keyframes rs-eq { 0%, 100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }

        .rs-nav-btn:focus-visible {
          outline: 2px solid ${c.rose};
          outline-offset: 2px;
        }

        /* Tamu yang meminta gerak dikurangi tetap mendapat masjidnya sebagai
           gambar diam: videonya tidak pernah dipasang sama sekali (lihat prop
           still di Panggung), dan geseran foto di bawah ini ikut berhenti.
           !important karena animasinya dipasang lewat style inline, dan
           tanpa itu aturan ini akan kalah tanpa suara. */
        @media (prefers-reduced-motion: reduce) {
          .rs-pan { animation: none !important; }
        }
      `}</style>

      <div id="top" className="w-full relative flex flex-col"
        style={{ fontFamily: F.sans, color: c.ink, background: c.blush, minHeight: 'var(--inv-h)' }}>

        {musicEnabled && (
          <audio ref={audioRef} src={data?.musicUrl || MUSIC_URLS[data?.musicId || 1] || MUSIC_URLS[1]} loop />
        )}

        <Panggung phase={phase} introRef={introRef} loopRef={loopRef}
          introMounted={introMounted} still={reduceMotion} />

        {opened && (
          <div className="relative flex flex-col w-full" style={{ zIndex: 1 }}>
            <Hero data={data} groomNick={groomNick} brideNick={brideNick} heroDate={heroDate}
              countdown={countdown} countdownEnabled={data?.countdownEnabled ?? true}
              ready={heroReady} />

            <Quote data={data} />
            <Mempelai data={data} />
            <Acara data={data} />
            <LoveStory data={data} />
            <Galeri data={data} />
            <Informasi data={data} />
            <RsvpUcapan wishes={wishes} onSubmitWish={onSubmitWish} />
            <Penutup data={data} groomNick={groomNick} brideNick={brideNick} heroDate={heroDate} />
          </div>
        )}

        <BottomNav visible={opened} />
        {musicEnabled && <MusicButton musicPlaying={musicPlaying} setMusicPlaying={setMusicPlaying} visible={opened} />}

        {!coverGone && (
          <Cover data={data} groomNick={groomNick} brideNick={brideNick} heroDate={heroDate}
            guestName={guest} handleOpen={handleOpen} animateClose={animateClose} />
        )}
      </div>
    </InvitationLayout>
  )
}
