import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { THEMES } from '../config/constants'

// ═══════════════════════════════════════════════════════════════════
//  GILDED PALACE — kategori Motion (MOT-002)
//
//  Tamu tiba di gerbang emas yang masih tertutup. Begitu undangan dibuka,
//  kamera bergerak sendiri: gerbang → halaman istana → lorong pualam →
//  tangga ballroom di bawah lampu kristal, lalu berhenti di sana dan
//  bernapas pelan selamanya.
//
//  Tiga babak, satu aset gambar dan dua potong video:
//    poster.jpg  frame beku detik pertama, latar sebelum undangan dibuka
//    intro.mp4   17,5 dtk perjalanan, diputar sekali saat dibuka
//    loop.mp4     7,5 dtk ballroom, berputar terus sesudahnya
//
//  Ketiga sambungannya diukur, bukan dikira-kira: poster→intro 33,4 dB,
//  intro→loop 33,4 dB, ujung loop→awal loop 32,2 dB. Selisih sekecil itu
//  hanya derau kompresi, jadi peralihannya boleh ditukar keras tanpa
//  crossfade panjang yang justru akan terbaca sebagai kedip.
//
//  Pelajaran Velour Olive dipakai di sini (§ VideoBackdrop): video ber-opacity
//  0 tetap men-decode tiap frame. Maka hanya satu video yang pernah berjalan,
//  dan begitu intro selesai elemennya dilepas sama sekali — sisa sesi cuma
//  memutar loop 524KB.
// ═══════════════════════════════════════════════════════════════════

const A = {
  poster: '/themes/Motion/theme-2/poster.jpg',
  intro:  '/themes/Motion/theme-2/intro.mp4',
  loop:   '/themes/Motion/theme-2/loop.mp4',
}

// Detik ke berapa kartu "The Wedding Of" terbit. Intro-nya 17,5 detik, dan
// pada detik 15 kameranya sudah berhenti di tangga ballroom — kartunya
// muncul di atas gambar yang sudah tenang, bukan di tengah perjalanan.
const HERO_AT = 15

// ─── PALET ───────────────────────────────────────────────────────
// Diambil dari videonya sendiri, bukan dari selera: warna rata-rata tiap
// babak jatuh di #E2D2B9 – #EBDAC4, dan pita tempat teks akan berdiri
// punya luminansi median 212–221. Aulanya terang, jadi tema ini memakai
// tulisan gelap di atas terang — satu-satunya tema bespoke di repo ini
// yang begitu, dan itu keputusan aset, bukan gaya.
//
// Rasio kontras yang sudah diukur (di atas marmer / di atas video terburuk):
//   ink      11,71 / 4,45   → aman di mana pun
//   inkSoft   7,41 / 2,82   → hanya di atas kartu
//   giltDeep  5,37 / 2,04   → hanya di atas kartu
//   gilt      3,16 / 1,20   → hanya ukuran besar, dan hanya di atas kartu
// Aturan yang lahir dari angka itu: teks kecil tidak pernah berdiri
// langsung di atas video.
const c = {
  marble:    '#F7F1E6',
  champagne: '#E7D6B4',
  gilt:      '#A8823A',
  giltDeep:  '#7C5E22',
  giltLight: '#D9BE84',
  ink:       '#3A2E23',
  inkSoft:   '#5C4B39',
  muted:     'rgba(58,46,35,.72)',
  faint:     'rgba(58,46,35,.52)',
}

const F = {
  display: "'Bodoni Moda', serif",
  script:  "'Great Vibes', cursive",
  sans:    "'Manrope', sans-serif",
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

// ═══════════════════════════════════════════════════════════════════
//  PANGGUNG — latar istana
// ═══════════════════════════════════════════════════════════════════

// Fixed dan dijangkarkan ke kolom, bukan sticky.
//
// Versi pertama memakai `sticky top-0` setinggi 0 di dalam scroller, dan
// latarnya berhenti di halaman Mempelai: sesudah itu undangan berjalan di
// atas krem polos. Sticky di dalam scroller ini sudah gagal dua kali —
// kelopak Opaline juga berhenti di tengah jalan dengan cara yang sama, dan
// yang menyelesaikannya waktu itu persis pola di bawah ini. Fixed tidak
// punya kotak pembatas yang bisa kehabisan tinggi, jadi seluruh kelas bug
// itu hilang, bukan digeser.
//
// left:50% + translateX(-50%) + width:--inv-w yang menjangkarkannya ke kolom
// undangan, bukan ke jendela: di desktop kolomnya hanya 480px di tengah layar
// lebar, dan tanpa penjangkaran ini videonya akan melebar ke seluruh monitor.
const Panggung = ({ phase, introRef, loopRef, introMounted, still }) => (
  <div className="fixed pointer-events-none" style={{
    top: 0, left: '50%', transform: 'translateX(-50%)',
    width: 'var(--inv-w)', height: 'var(--inv-h)', zIndex: 0,
  }}>
    <div className="absolute inset-0 overflow-hidden" style={{ background: c.champagne }}>

      {/* Frame beku detik pertama. Identik dengan frame pertama intro.mp4
          (terukur 30,7 dB — selisihnya cuma kompresi JPEG), jadi saat video
          mulai berjalan tidak ada satu pun piksel yang melompat. */}
      <img src={A.poster} alt="" className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'cover' }} />

      {!still && (
        <>
          {/* Loop dipasang sejak awal supaya sudah ter-buffer saat gilirannya
              tiba, tapi tanpa autoPlay: yang mahal itu decode, bukan mount. */}
          <video ref={loopRef} muted loop playsInline preload="auto" poster={A.poster}
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: 'cover', opacity: phase === 'loop' ? 1 : 0, transition: 'opacity .7s ease' }}>
            <source src={A.loop} type="video/mp4" />
          </video>

          {introMounted && (
            <video ref={introRef} muted playsInline preload="auto" poster={A.poster}
              className="absolute inset-0 w-full h-full"
              style={{ objectFit: 'cover', opacity: phase === 'intro' ? 1 : 0, transition: 'opacity .7s ease' }}>
              <source src={A.intro} type="video/mp4" />
            </video>
          )}
        </>
      )}

      {/* Vignette hangat: menggelapkan tepi secukupnya supaya kartu marmer
          terbaca sebagai benda yang berdiri di depan aula, bukan tambalan
          pucat di atas latar yang sama pucatnya. */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(180deg, rgba(58,46,35,.26) 0%, rgba(58,46,35,0) 20%, rgba(58,46,35,0) 70%, rgba(58,46,35,.30) 100%)`,
      }} />
      <div className="absolute inset-0" style={{
        background: `radial-gradient(120% 78% at 50% 42%, transparent 46%, rgba(58,46,35,.22) 100%)`,
      }} />
    </div>
  </div>
)

// ═══════════════════════════════════════════════════════════════════
//  PRIMITIF
// ═══════════════════════════════════════════════════════════════════

// Lengkung pintu istana, motif yang diulang di seluruh tema: di atas judul
// bagian, dan sebagai bentuk setiap bingkai foto.
const Arch = ({ w = 46, style = {} }) => (
  <svg viewBox="0 0 46 26" width={w} height={w * 26 / 46} fill="none" style={style}>
    <path d="M3 25 L3 16 C3 5.5 11.9 1 23 1 C34.1 1 43 5.5 43 16 L43 25"
      stroke={c.gilt} strokeWidth="1" strokeLinecap="round" />
    <path d="M23 4.6 L25.6 8.2 L23 11.8 L20.4 8.2 Z" fill={c.gilt} />
  </svg>
)

const Kicker = ({ children, style = {} }) => (
  <p className="uppercase" style={{ margin: 0, fontFamily: F.sans, fontSize: 10, fontWeight: 500, letterSpacing: '.4em', color: c.giltDeep, ...style }}>{children}</p>
)

const Title = ({ children, style = {} }) => (
  <h2 style={{ margin: '10px 0 0', fontFamily: F.display, fontWeight: 400, fontSize: 31, lineHeight: 1.2, color: c.ink, textWrap: 'balance', ...style }}>{children}</h2>
)

// Garis rambut emas dengan kilau yang lewat perlahan — satu-satunya gerak
// yang ditambahkan tema ini di luar video, memantulkan lampu kristal aula.
const Rule = ({ width = 62, style = {} }) => (
  <div className="gp-rule" style={{ width, ...style }} />
)

const Section = ({ id, children, style = {} }) => (
  <section id={id} className="relative" style={{ zIndex: 1, padding: '86px 26px', ...style }}>
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

// Kartu marmer. Alpha 0,88 dipilih supaya angka kontras di kepala berkas
// ini tetap berlaku: di bawah itu warna aula mulai naik menembus kartu dan
// teks sekunder jatuh di bawah 4,5:1.
const cardStyle = {
  borderRadius: 20, padding: 22,
  background: 'rgba(247,241,230,.88)',
  border: `1px solid rgba(168,130,58,.34)`,
  backdropFilter: 'blur(10px) saturate(1.1)',
  WebkitBackdropFilter: 'blur(10px) saturate(1.1)',
  boxShadow: '0 18px 44px rgba(58,46,35,.20)',
}

// Bingkai foto melengkung, bentuk pintu istana yang sama. Fotonya dipasang
// lebih besar dari bingkainya dan hanya digeser, tidak pernah di-scale:
// men-scale raster membuat wajah lembek.
const ArchPhoto = ({ src, alt = '', w = 186, ratio = '3 / 4', pan = true, radius, style = {} }) => (
  <div className="relative overflow-hidden" style={{
    width: w, aspectRatio: ratio,
    borderRadius: radius || `${Math.round(w / 2)}px ${Math.round(w / 2)}px 16px 16px`,
    border: `1px solid rgba(168,130,58,.55)`,
    boxShadow: '0 20px 46px rgba(58,46,35,.28), inset 0 0 0 5px rgba(247,241,230,.55)',
    background: c.champagne, ...style,
  }}>
    {src
      ? <img src={src} alt={alt} className="absolute object-cover"
          style={{ width: '112%', height: '112%', left: '-6%', top: '-6%', maxWidth: 'none', animation: pan ? 'gp-pan 24s ease-in-out infinite alternate' : 'none' }} />
      : <span className="absolute inset-0 flex items-center justify-center" style={{ fontFamily: F.sans, fontSize: 11, color: c.faint }}>Foto</span>}
  </div>
)

// Kepala bagian berdiri langsung di atas video, tidak di atas kartu. Kabut
// marmer inilah yang menjadikannya terbaca: alpha 0,88 menaikkan kicker
// dari 2,04:1 (tak terbaca di frame tergelap intro) ke 4,85:1. Bentuknya
// radial supaya tepinya larut — informasi kontrasnya sama dengan kartu,
// tanpa ikut membawa bingkai kartu ke setiap judul.
const haloStyle = {
  padding: '18px 22px 22px',
  background: 'radial-gradient(ellipse at center, rgba(247,241,230,.88) 0%, rgba(247,241,230,.82) 52%, rgba(247,241,230,0) 80%)',
}

const SectionHead = ({ kicker, title, children }) => (
  <Reveal className="flex flex-col items-center text-center" style={{ marginBottom: 26, ...haloStyle }}>
    <Arch style={{ marginBottom: 14 }} />
    {kicker && <Kicker>{kicker}</Kicker>}
    <Title>{title}</Title>
    <Rule style={{ marginTop: 16 }} />
    {children}
  </Reveal>
)

// ─── 1. COVER ────────────────────────────────────────────────────
// Fixed dan dijangkarkan ke kolom, bukan absolute inset-0. Begitu tombol
// ditekan isi undangan ikut ter-mount dan tinggi akar melonjak ke ribuan
// piksel; sebuah cover absolute akan ikut memanjang dan isinya yang
// ter-center melompat jauh ke bawah layar persis saat transisi berjalan.
const Cover = ({ data, groomNick, brideNick, heroDate, guestName, handleOpen, animateClose }) => {
  const coverPhoto = data?.meta?.coverPhoto || data?.meta?.photo || data?.bride?.photo || data?.groom?.photo || null
  return (
    <div className="fixed" style={{
      top: 0, left: '50%', transform: 'translateX(-50%)',
      width: 'var(--inv-w)', height: 'var(--inv-h)', zIndex: 80,
      pointerEvents: animateClose ? 'none' : 'auto',
    }}>
      <motion.div className="relative w-full h-full flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ padding: '48px 30px' }}
        animate={animateClose ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 1.05, ease: [0.65, 0, 0.35, 1] }}>

        {/* Gerbang yang masih tertutup, frame beku yang sama persis dengan
            frame pertama video — begitu cover memudar, gambarnya tidak
            berganti, ia hanya mulai bergerak. */}
        <img src={A.poster} alt="" className="absolute inset-0 w-full h-full" style={{ objectFit: 'cover' }} />
        <div className="absolute inset-0" style={{
          background: `linear-gradient(180deg, rgba(58,46,35,.22) 0%, rgba(58,46,35,.06) 34%, rgba(58,46,35,.26) 100%)`,
        }} />

        {/* Satu kartu marmer digantung di gerbang, bukan tulisan yang
            ditaburkan langsung di atasnya. Gerbang emas ini terang (luminansi
            ~212), jadi tulisan berwarna marmer di atasnya hanya mencapai
            2,25:1 walau diberi scrim gelap — praktis tak terbaca. Menaikkan
            scrim sampai teks terang menang berarti memadamkan gerbangnya
            sendiri, padahal justru gambar itulah yang dibeli tamu. Kartu ini
            menyelesaikan keduanya sekaligus: gerbangnya tetap cemerlang, dan
            tulisan gelap di atas marmer terbaca 11,71:1. */}
        <motion.div className="relative flex flex-col items-center"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.9 }}>

          <ArchPhoto src={coverPhoto} w={172} ratio="3 / 4" style={{ marginBottom: -34, zIndex: 1 }} />

          <div style={{ ...cardStyle, padding: '48px 26px 24px', width: 'min(332px, 100%)' }}>
            <div className="flex flex-col items-center text-center">
              <Kicker style={{ fontSize: 9, letterSpacing: '.34em' }}>The Wedding Of</Kicker>

              <h1 style={{ margin: '8px 0 0', fontFamily: F.script, fontSize: 46, lineHeight: 1, color: c.ink }}>
                {groomNick} &amp; {brideNick}
              </h1>
              <Rule width={70} style={{ margin: '14px 0' }} />
              <p style={{ margin: 0, fontFamily: F.display, fontSize: 13.5, letterSpacing: '.2em', color: c.giltDeep }}>
                {heroDate}
              </p>

              <div style={{
                marginTop: 20, padding: '13px 22px', borderRadius: 14, alignSelf: 'stretch',
                background: 'rgba(231,214,180,.5)', border: `1px solid rgba(168,130,58,.3)`,
              }}>
                <Kicker style={{ fontSize: 8.5, letterSpacing: '.3em', color: c.faint }}>Kepada Yth.</Kicker>
                <p style={{ margin: '6px 0 0', fontFamily: F.display, fontSize: 18, color: c.ink }}>{guestName}</p>
              </div>

              <motion.button onClick={handleOpen} whileTap={{ scale: 0.96 }}
                style={{
                  marginTop: 18, alignSelf: 'stretch', padding: '14px 34px', borderRadius: 999,
                  border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${c.giltDeep}, ${c.gilt} 46%, ${c.giltLight})`,
                  color: '#2E2418',
                  fontFamily: F.sans, fontSize: 11, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase',
                  boxShadow: '0 14px 32px rgba(58,46,35,.34)',
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
// Muncul di detik ke-15 video, bukan begitu undangan dibuka. Empat belas
// detik pertama adalah perjalanan kameranya sendiri — menaruh kartu di atasnya
// sejak awal berarti menutupi satu-satunya bagian yang bergerak. Pada detik
// 15 kameranya sudah sampai di tangga ballroom dan diam, dan di situlah
// kartunya punya tempat untuk berdiri.
//
// `ready` datang dari waktu putar video yang sebenarnya (lihat HERO_AT di
// bawah), bukan dari setTimeout: kalau videonya tersendat karena jaringan,
// penghitung waktu akan menampilkan kartu di atas lorong yang masih bergerak.
const Hero = ({ data, groomNick, brideNick, heroDate, countdown, countdownEnabled, ready }) => {
  const parts = [['Hari', countdown?.d], ['Jam', countdown?.h], ['Menit', countdown?.m], ['Detik', countdown?.s]]
  const heroPhoto = data?.meta?.photo || data?.meta?.coverPhoto || data?.groom?.photo || data?.bride?.photo || null
  return (
    <section id="gp-home" className="relative flex flex-col items-center justify-end text-center"
      style={{ zIndex: 1, minHeight: 'var(--inv-h)', boxSizing: 'border-box', padding: '90px 26px 104px' }}>
      <motion.div className="flex flex-col items-center"
        initial={{ opacity: 0, y: 18 }}
        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
        style={{ pointerEvents: ready ? 'auto' : 'none' }}>

        {heroPhoto && <ArchPhoto src={heroPhoto} w={158} ratio="3 / 4" style={{ marginBottom: -32, zIndex: 1 }} />}

        <div style={{ ...cardStyle, padding: heroPhoto ? '44px 24px 22px' : '26px 24px 22px', width: 'min(340px, 100%)' }}>
          <div className="flex flex-col items-center">
            <Arch style={{ marginBottom: 12 }} />
            <Kicker>The Wedding Of</Kicker>
            <h1 style={{ margin: '10px 0 0', fontFamily: F.script, fontSize: 50, lineHeight: 1, color: c.ink }}>
              {groomNick} &amp; {brideNick}
            </h1>
            <Rule width={70} style={{ margin: '14px 0' }} />
            <p style={{ margin: 0, fontFamily: F.display, fontSize: 14.5, letterSpacing: '.18em', color: c.giltDeep }}>{heroDate}</p>
          </div>

          {countdownEnabled && (
            <div className="grid grid-cols-4" style={{ gap: 7, marginTop: 20 }}>
              {parts.map(([label, val]) => (
                <div key={label} style={{
                  borderRadius: 13, padding: '12px 3px 9px',
                  background: 'rgba(231,214,180,.52)', border: `1px solid rgba(168,130,58,.28)`,
                }}>
                  <div style={{ fontFamily: F.display, fontWeight: 500, fontSize: 24, lineHeight: 1, color: c.ink, fontVariantNumeric: 'tabular-nums' }}>{pad2(val)}</div>
                  <div className="uppercase" style={{ marginTop: 5, fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: '.18em', color: c.giltDeep }}>{label}</div>
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
    <Section id="gp-quote">
      <Reveal className="flex flex-col items-center text-center" style={cardStyle}>
        <Arch w={38} style={{ marginBottom: 16 }} />
        <p style={{
          margin: 0, fontFamily: F.display, fontStyle: 'italic', fontWeight: 400,
          fontSize: 18, lineHeight: 1.9, color: c.ink, textWrap: 'pretty', maxWidth: 330,
        }}>{quote}</p>
        <Rule width={44} style={{ marginTop: 18 }} />
      </Reveal>
    </Section>
  )
}

// ─── 4. MEMPELAI ─────────────────────────────────────────────────
const PersonCard = ({ person, delay }) => (
  <Reveal delay={delay} className="flex flex-col items-center text-center" style={cardStyle}>
    <ArchPhoto src={person?.photo} alt={person?.nickname || ''} w={160} ratio="3 / 4" pan={false} />

    <h3 style={{ margin: '16px 0 0', fontFamily: F.script, fontSize: 36, lineHeight: 1, color: c.giltDeep }}>
      {person?.nickname || '—'}
    </h3>
    <p style={{ margin: '4px 0 0', fontFamily: F.display, fontSize: 16.5, color: c.ink }}>
      {person?.name || person?.nickname || '—'}
    </p>
    <Rule width={40} style={{ margin: '12px 0' }} />
    <p style={{ margin: 0, fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.75, color: c.muted }}>
      Putra/Putri dari<br />
      {person?.father || '—'} &amp; {person?.mother || '—'}
    </p>

    {person?.instagram && (
      <a href={`https://instagram.com/${person.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
        style={{ marginTop: 12, fontFamily: F.sans, fontSize: 11.5, fontWeight: 500, color: c.giltDeep }}>
        @{person.instagram.replace('@', '')}
      </a>
    )}
  </Reveal>
)

const Mempelai = ({ data }) => (
  <Section id="gp-mempelai">
    <SectionHead kicker="Assalamualaikum Wr. Wb." title="Mempelai">
      <p style={{ margin: '14px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.85, color: c.muted, maxWidth: 300 }}>
        Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.
      </p>
    </SectionHead>

    <div className="flex flex-col items-center" style={{ gap: 16 }}>
      <PersonCard person={data?.groom} delay={0} />
      {/* Medali di antara dua potret. Ia memang perlu keping marmernya
          sendiri: satu huruf sebesar ini di atas video terang tidak punya
          apa pun untuk dibaca sebagai latar. */}
      <span className="flex items-center justify-center" style={{
        width: 52, height: 52, borderRadius: '50%',
        background: 'rgba(247,241,230,.88)', border: `1px solid rgba(168,130,58,.45)`,
        boxShadow: '0 10px 24px rgba(58,46,35,.24)',
        fontFamily: F.script, fontSize: 33, lineHeight: 1, color: c.giltDeep, paddingBottom: 6,
      }}>&amp;</span>
      <PersonCard person={data?.bride} delay={0.08} />
    </div>
  </Section>
)

// ─── 5. ACARA ────────────────────────────────────────────────────
// Nama field mengikuti modul editor, bukan src/types/invitation.js:
// name / date / dateLabel / start / end / tz / venue / address / maps.
// Bukan title / time / location / mapUrl — nama-nama itu tidak pernah ada
// di data tersimpan, dan sudah empat kali jadi sumber bug di repo ini.
//
// Seluruh data.events di-map, tidak dipasangkan mati ke akad/resepsi.
// Empat tema lama menghardcode events[0] dan events[1] lalu diam-diam
// membuang sesi ketiga; itu tercatat sebagai task terbuka nomor 1.
const EventCard = ({ ev, delay }) => {
  if (!ev) return null
  const dateLabel = ev.dateLabel || fmtDate(ev.date)
  const hours = [ev.start, ev.end].filter(Boolean).join(' – ')
  return (
    <Reveal delay={delay} className="text-center" style={cardStyle}>
      {ev.name && <Kicker>{ev.name}</Kicker>}
      {dateLabel && (
        <p style={{ margin: '12px 0 0', fontFamily: F.display, fontSize: 20, color: c.ink }}>{dateLabel}</p>
      )}
      {hours && (
        <p style={{ margin: '7px 0 0', fontFamily: F.display, fontSize: 17, letterSpacing: '.05em', color: c.giltDeep, fontVariantNumeric: 'tabular-nums' }}>
          {hours}{ev.tz ? ` ${ev.tz}` : ''}
        </p>
      )}

      <Rule width="70%" style={{ margin: '18px auto' }} />

      {ev.venue && (
        <p style={{ margin: 0, fontFamily: F.sans, fontSize: 14.5, fontWeight: 600, color: c.ink }}>{ev.venue}</p>
      )}
      {ev.address && (
        <p style={{ margin: '6px auto 0', maxWidth: 250, fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.7, color: c.muted }}>{ev.address}</p>
      )}

      {ev.maps && (
        <a href={ev.maps} target="_blank" rel="noreferrer" className="inline-block"
          style={{
            marginTop: 18, padding: '10px 24px', borderRadius: 999,
            border: `1px solid ${c.gilt}`, color: c.giltDeep,
            fontFamily: F.sans, fontSize: 10.5, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase',
          }}>
          Petunjuk Arah
        </a>
      )}
    </Reveal>
  )
}

const Acara = ({ data }) => {
  const events = data?.events || []
  if (!events.length) return null
  return (
    <Section id="gp-acara">
      <SectionHead kicker="Save The Date" title="Rangkaian Acara" />
      <div className="flex flex-col" style={{ gap: 15 }}>
        {events.map((ev, i) => <EventCard key={ev?.id || i} ev={ev} delay={i * 0.07} />)}
      </div>
    </Section>
  )
}

// ─── 6. LOVE STORY (opsional) ────────────────────────────────────
// `year` teks bebas dan ditampilkan apa adanya. Melewatkannya ke new Date()
// akan mengubah "2019" jadi 1 Januari 2019 dan menelan "Awal 2024" bulat-bulat.
// Deskripsinya ada di `desc`, bukan `story` — Botanical Ivory sempat memakai
// nama yang salah dan teksnya hilang tanpa jejak.
const LoveStory = ({ data }) => {
  const stories = data?.loveStory || []
  if (!stories.length) return null
  return (
    <Section id="gp-story">
      <SectionHead kicker="Perjalanan Kami" title="Love Story" />

      <div className="relative">
        <div className="absolute" style={{
          left: 20, top: 12, bottom: 12, width: 1,
          background: `linear-gradient(180deg, transparent, ${c.gilt}, transparent)`,
        }} />
        <div className="flex flex-col" style={{ gap: 15 }}>
          {stories.map((s, i) => (
            <Reveal key={s.id || i} delay={i * 0.06} className="relative flex" style={{ gap: 15 }}>
              <div className="flex-shrink-0 flex items-start justify-center" style={{ width: 41, paddingTop: 24 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: c.gilt, boxShadow: `0 0 0 3px rgba(247,241,230,.7)` }} />
              </div>
              <div className="flex-1" style={{ ...cardStyle, padding: 18, minWidth: 0 }}>
                {s.year && <Kicker style={{ fontSize: 10.5, letterSpacing: '.22em' }}>{s.year}</Kicker>}
                {s.title && <p style={{ margin: '8px 0 0', fontFamily: F.display, fontSize: 17, color: c.ink }}>{s.title}</p>}
                {s.desc && <p style={{ margin: '7px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.75, color: c.muted }}>{s.desc}</p>}
                {s.photo && (
                  <div className="overflow-hidden" style={{ marginTop: 12, borderRadius: 13, aspectRatio: '4 / 3', border: `1px solid rgba(168,130,58,.3)` }}>
                    <img src={s.photo} alt="" className="w-full h-full object-cover" style={{ objectPosition: 'center 35%' }} />
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ─── 7. GALERI (opsional) ────────────────────────────────────────
const Galeri = ({ data }) => {
  const photos = (data?.gallery || []).map(g => (typeof g === 'string' ? g : g?.src)).filter(Boolean)
  if (!photos.length) return null
  return (
    <Section id="gp-galeri">
      <SectionHead kicker="Momen" title="Galeri" />
      {/* Ukuran intrinsik: mengukur kolom ini, bukan jendela browser, jadi
          grid-nya benar di dalam shell 480px maupun di ponsel. Lantai
          min(...,100%) itu yang mencegah layar sempit meluber. */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(130px, 100%), 1fr))', gap: 9 }}>
        {photos.map((src, i) => (
          <Reveal key={src} delay={(i % 4) * 0.05}>
            <div className="overflow-hidden" style={{
              aspectRatio: '3 / 4', borderRadius: '64px 64px 12px 12px',
              border: `1px solid rgba(168,130,58,.4)`,
              boxShadow: '0 12px 28px rgba(58,46,35,.2), inset 0 0 0 3px rgba(247,241,230,.5)',
            }}>
              <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

// ─── 8. INFORMASI (dresscode / live / hadiah / turut mengundang) ──
const InfoCard = ({ label, children, delay }) => (
  <Reveal delay={delay} style={cardStyle}>
    <Kicker style={{ fontSize: 9.5, letterSpacing: '.28em' }}>{label}</Kicker>
    <Rule width={34} style={{ margin: '10px 0 14px' }} />
    <div>{children}</div>
  </Reveal>
)

// Satu warna, karena editor menyimpan satu warna. Versi awal Opaline
// menggambar tiga bulatan dan mengarang dua di antaranya dari warna yang
// sama — tamu lalu datang memakai warna yang tidak pernah dipilih siapa pun.
const Dresscode = ({ dresscode }) => (
  <div className="flex items-center" style={{ gap: 14 }}>
    {dresscode.color && (
      <span className="flex-shrink-0" style={{
        width: 42, height: 42, borderRadius: '50%',
        background: dresscode.color,
        border: `1px solid rgba(168,130,58,.5)`,
        boxShadow: `0 0 0 4px rgba(247,241,230,.6), 0 6px 16px rgba(58,46,35,.22)`,
      }} />
    )}
    <div style={{ minWidth: 0 }}>
      {dresscode.name && <p style={{ margin: 0, fontFamily: F.display, fontSize: 17, color: c.ink }}>{dresscode.name}</p>}
      {dresscode.notes && <p style={{ margin: '4px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.7, color: c.muted }}>{dresscode.notes}</p>}
    </div>
  </div>
)

const giftBox = {
  padding: '14px 16px', borderRadius: 15,
  background: 'rgba(231,214,180,.46)', border: `1px solid rgba(168,130,58,.3)`,
}

const copyBtn = {
  marginTop: 12, padding: '8px 18px', borderRadius: 999, cursor: 'pointer',
  background: 'transparent', border: `1px solid ${c.gilt}`, color: c.giltDeep,
  fontFamily: F.sans, fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase',
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
            tanpa syarat. Nomor ada di `number` dan pemilik di `holder`;
            Cinematic Luxury sempat membaca `no` dan `name`, dan selama itu
            kartunya tampil kosong. */}
        <p style={{ margin: 0, fontFamily: F.sans, fontSize: 10.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: c.giltDeep }}>
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
        <p style={{ margin: 0, fontFamily: F.sans, fontSize: 10.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: c.giltDeep }}>Kirim Kado</p>
        {giftAddr.recipient && <p style={{ margin: '8px 0 0', fontFamily: F.display, fontSize: 17, color: c.ink }}>{giftAddr.recipient}</p>}
        {giftAddr.phone && <p style={{ margin: '4px 0 0', fontFamily: F.sans, fontSize: 12.5, color: c.muted }}>{giftAddr.phone}</p>}
        {giftAddr.address && <p style={{ margin: '10px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.75, color: c.muted, whiteSpace: 'pre-line' }}>{giftAddr.address}</p>}
        {giftAddr.address && (
          <button onClick={() => copy(giftAddr.address, 'gp-gift-address')} style={copyBtn}>
            {copiedKey === 'gp-gift-address' ? 'Tersalin' : 'Salin Alamat'}
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
    <Section id="gp-info">
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
                  className="flex items-center justify-between"
                  style={{ ...giftBox, padding: '12px 16px' }}>
                  <span style={{ fontFamily: F.sans, fontSize: 13, color: c.ink }}>{p.type || 'Siaran Langsung'}</span>
                  <span style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: c.giltDeep }}>Tonton</span>
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
                  {fam.side && <p style={{ margin: 0, fontFamily: F.display, fontSize: 15, color: c.giltDeep }}>{fam.side}</p>}
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
  width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 13,
  background: 'rgba(255,253,248,.78)', border: `1px solid rgba(168,130,58,.34)`,
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
    <Section id="gp-rsvp">
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
                    fontFamily: F.sans, fontSize: 12, fontWeight: 600, letterSpacing: '.06em',
                    background: on ? `linear-gradient(135deg, ${c.giltDeep}, ${c.gilt} 50%, ${c.giltLight})` : 'transparent',
                    color: on ? '#2E2418' : c.muted,
                    border: `1px solid ${on ? 'transparent' : 'rgba(168,130,58,.4)'}`,
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
              background: `linear-gradient(135deg, ${c.giltDeep}, ${c.gilt} 46%, ${c.giltLight})`,
              color: '#2E2418',
              fontFamily: F.sans, fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase',
            }}>
            {busy ? 'Mengirim…' : 'Kirim Ucapan'}
          </button>

          {sent && (
            <p style={{ margin: 0, textAlign: 'center', fontFamily: F.sans, fontSize: 12, color: c.giltDeep }}>
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
                <p style={{ margin: 0, fontFamily: F.display, fontSize: 15, color: c.ink }}>{w.name}</p>
                <span style={{
                  flexShrink: 0, padding: '4px 11px', borderRadius: 999,
                  fontFamily: F.sans, fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase',
                  background: w.rsvp === 'hadir' ? 'rgba(168,130,58,.2)' : 'rgba(58,46,35,.09)',
                  color: w.rsvp === 'hadir' ? c.giltDeep : c.faint,
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
    <section id="gp-penutup" className="relative flex flex-col items-center justify-center text-center"
      style={{ zIndex: 1, minHeight: 'var(--inv-h)', boxSizing: 'border-box', padding: '90px 26px 150px' }}>
      <Reveal className="flex flex-col items-center" style={{ ...cardStyle, padding: '30px 24px 26px', width: 'min(348px, 100%)' }}>
        {photo && <ArchPhoto src={photo} w={150} ratio="3 / 4" style={{ marginBottom: 20 }} />}
        <p style={{ margin: 0, fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.9, color: c.muted, maxWidth: 300 }}>
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir
          untuk memberikan doa restu.
        </p>
        <Rule width={52} style={{ margin: '22px 0' }} />
        <Kicker>Wassalamualaikum Wr. Wb.</Kicker>
        <h2 style={{ margin: '14px 0 0', fontFamily: F.script, fontSize: 44, lineHeight: 1, color: c.ink }}>
          {groomNick} &amp; {brideNick}
        </h2>
        <p style={{ margin: '10px 0 0', fontFamily: F.display, fontSize: 13.5, letterSpacing: '.16em', color: c.giltDeep }}>{heroDate}</p>
      </Reveal>
    </section>
  )
}

// ─── NAV & MUSIK ─────────────────────────────────────────────────
// Fixed murni, tanpa `md:absolute`. Tema-tema lama memakai
// `fixed md:absolute`, dan di layar >= 768px varian absolute-lah yang
// menang: navigasinya lalu berlabuh di dasar dokumen, bukan di layar, dan
// hilang dari pandangan begitu tamu menggulir. Penjangkarannya ke lebar
// kolom (--inv-w) melakukan pekerjaan yang tadinya diminta dari absolute.
const NAV = [['Home', 'gp-home'], ['Mempelai', 'gp-mempelai'], ['Acara', 'gp-acara'], ['Galeri', 'gp-galeri'], ['RSVP', 'gp-rsvp']]

const scrollToId = (id) => {
  // Yang menggulir itu div bagian dalam InvitationLayout, bukan jendela.
  // window.scrollTo di sini selalu tidak berefek — scrollIntoView menemukan
  // scroller yang benar sendiri.
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const BottomNav = ({ visible }) => (
  <nav className="fixed flex" style={{
    bottom: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
    width: 'min(420px, calc(var(--inv-w) - 28px))', gap: 2, padding: '7px 9px', borderRadius: 999,
    background: 'rgba(247,241,230,.86)', border: `1px solid rgba(168,130,58,.4)`,
    backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
    boxShadow: '0 16px 38px rgba(58,46,35,.28)',
    opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none', transition: 'opacity .7s ease .3s',
  }}>
    {NAV.map(([label, id]) => (
      <button key={id} className="gp-nav-btn" onClick={() => scrollToId(id)}
        style={{
          flex: 1, padding: '8px 2px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: 'transparent', color: c.giltDeep,
          fontFamily: F.sans, fontSize: 9.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase',
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
      background: 'rgba(247,241,230,.86)', border: `1px solid rgba(168,130,58,.42)`,
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '0 12px 26px rgba(58,46,35,.26)',
      opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none', transition: 'opacity .7s ease .3s',
    }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        display: 'block', width: 3, height: 14, borderRadius: 2, background: c.giltDeep,
        transformOrigin: 'bottom',
        transform: musicPlaying ? undefined : 'scaleY(.35)',
        animation: musicPlaying ? `gp-eq ${0.62 + i * 0.15}s ease-in-out infinite` : 'none',
      }} />
    ))}
  </button>
)

// ═══════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════
export default function GildedPalaceTheme({
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

  // Kartu "The Wedding Of" baru muncul saat video sampai di detik ini.
  const [heroReady, setHeroReady] = useState(false)

  // Terpisah dari `opened` dengan sengaja. Isi undangan ter-mount seketika,
  // tapi cover harus tetap terpasang sepanjang fade-nya sendiri; menggantung
  // cover pada !opened akan melepasnya di commit yang sama dan transisinya
  // tidak pernah sempat berjalan.
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
  //
  // Loop dijalankan lebih dulu, baru fase berganti, supaya frame pertamanya
  // sudah ter-decode ketika ia terlihat. Elemen intro dilepas setelah fade-nya
  // selesai: video yang sudah selesai tetap memegang decoder sampai ia
  // benar-benar hilang dari pohon.
  useEffect(() => {
    const v = introRef.current
    if (!v) return
    const onTime = () => { if (v.currentTime >= HERO_AT) setHeroReady(true) }
    const onEnd = () => {
      // Juga di sini, bukan hanya di timeupdate: bila tamu menyeret videonya
      // melewati detik 15, atau timeupdate dilewati saat tab di latar
      // belakang, kartunya tetap harus terbit.
      setHeroReady(true)
      const l = loopRef.current
      if (l) { l.currentTime = 0; l.play().catch(() => {}) }
      setPhase('loop')
      setTimeout(() => setIntroMounted(false), 900)
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
        // Muted + playsInline, dan ini pun dipicu oleh ketukan tamu — dua
        // alasan terpisah kenapa autoplay policy tidak akan menolaknya.
        // Kalau tetap gagal, latar diam di frame beku, bukan jadi kosong.
        v.play().then(() => setPhase('intro')).catch(() => {
          setPhase('poster')
          setHeroReady(true)
        })
        // Jaring pengaman. Menggantungkan kartu Hero pada video berarti video
        // yang mogok akan meninggalkan undangan kosong selamanya — dan kosong
        // jauh lebih buruk daripada kartu yang terbit kecepatan. Ambangnya
        // jauh di atas 15 detik supaya jalur normal selalu menang lebih dulu.
        setTimeout(() => setHeroReady(true), 24000)
      } else {
        setHeroReady(true)
      }
    }
    setTimeout(() => setCoverGone(true), 1150)
  }

  return (
    <InvitationLayout layout={THEMES.GILDED_PALACE} data={data}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Manrope:wght@400;500;600;700&family=Great+Vibes&display=swap');

        /* Geser saja, jangan pernah scale: men-scale raster melembekkan foto. */
        @keyframes gp-pan {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-3%, -2.5%, 0); }
        }
        @keyframes gp-eq { 0%, 100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }

        /* Garis rambut emas dengan kilau lampu kristal yang lewat pelan. */
        .gp-rule {
          position: relative;
          height: 1px;
          background: linear-gradient(90deg, transparent, ${c.gilt}, transparent);
          overflow: hidden;
        }
        .gp-rule::after {
          content: '';
          position: absolute;
          top: 0; left: -40%;
          width: 40%; height: 100%;
          background: linear-gradient(90deg, transparent, #FFF6E0, transparent);
          animation: gp-gleam 7s ease-in-out infinite;
        }
        @keyframes gp-gleam {
          0%, 62% { transform: translateX(0); }
          100%    { transform: translateX(350%); }
        }

        .gp-nav-btn:focus-visible {
          outline: 2px solid ${c.giltDeep};
          outline-offset: 2px;
        }

        /* Tamu yang meminta gerak dikurangi tetap mendapat istananya sebagai
           gambar diam — videonya tidak pernah dipasang sama sekali (lihat
           prop still di Panggung), dan sisa gerak di halaman ini ikut
           berhenti. */
        @media (prefers-reduced-motion: reduce) {
          .gp-rule::after { animation: none; opacity: 0; }
        }
      `}</style>

      <div id="top" className="w-full relative flex flex-col"
        style={{ fontFamily: F.sans, color: c.ink, background: c.champagne, minHeight: 'var(--inv-h)' }}>

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
