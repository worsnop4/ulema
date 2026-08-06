import { useState } from 'react'
import { motion } from 'framer-motion'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { THEMES } from '../config/constants'

// ─── "Velour Olive" — panggung pelaminan: video latar tetap diam, konten
// scroll-snap fullscreen di atasnya. Dibangun per README/SPEC-TEMA handoff,
// bagian per bagian sesuai docs/THEME_DESIGN_GUIDE.md.
const c = {
  nightOlive: '#14150F',
  velvetOlive: '#4A5138',
  ivory: '#F4EFE6',
  champagne: '#D9BC7A',
  champagneDeep: '#B99A55',
  ink: '#1B1C14',
  mauve: '#C9A2A8',
}

const F = {
  script: "'Pinyon Script', cursive",
  serif: "'Cormorant Garamond', serif",
  sans: "'Jost', sans-serif",
}

const A = {
  bgHero: '/themes/Luxury/theme-4/bg-hero.mp4',
  bgHeroPoster: '/themes/Luxury/theme-4/bg-hero-poster.jpg',
  bgFooter: '/themes/Luxury/theme-4/bg-footer.mp4',
  bgFooterPoster: '/themes/Luxury/theme-4/bg-footer-poster.jpg',
  velvetDrape: '/themes/Luxury/theme-4/velvet-drape.jpg',
  floralCorner: '/themes/Luxury/theme-4/floral-corner-v2.png',
  ornamentDivider: '/themes/Luxury/theme-4/ornament-divider.png',
  lightChandelier: '/themes/Luxury/theme-4/light-chandelier.jpg',
  lightBokeh: '/themes/Luxury/theme-4/light-bokeh.jpg',
  petal: '/themes/Luxury/theme-4/petal-1.png',
}

// ─── DATE HELPERS ────────────────────────────────────────────────
const ID_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const ID_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const fmtDate = (s) => {
  if (!s) return ''
  try {
    const d = new Date(s)
    if (isNaN(d)) return s
    return `${ID_DAYS[d.getDay()]}, ${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`
  } catch { return s }
}

// ─── SEEDED RNG (LCG, seed 20261126 per spec) — deterministic petal layout
function seeded(n) {
  let s = 20261126 + n * 7919
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

function genPetals(count = 12) {
  const rand = seeded(1)
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: (rand() * 92 + 4).toFixed(1),
    dx: (rand() * 40 - 20).toFixed(1),
    rot: (rand() * 300 - 150).toFixed(0),
    duration: (16 + rand() * 16).toFixed(1),
    delay: (rand() * 12).toFixed(1),
  }))
}

// ─── SHARED "OVERLAY CAHAYA" (chandelier / bokeh) ─────────────────
// mix-blend-mode:screen is safe here because these layers sit behind the
// scroll content, outside of any backdrop-filter container (see spec note —
// blend mode dies inside a backdrop-filter ancestor).
const LightOverlay = ({ kind, opacity, height }) => {
  const isTop = kind === 'chandelier'
  return (
    <div
      className="absolute left-0 right-0 pointer-events-none"
      style={{
        [isTop ? 'top' : 'bottom']: 0,
        height,
        maskImage: isTop
          ? 'linear-gradient(180deg, #000 0%, #000 30%, transparent 100%)'
          : 'linear-gradient(0deg, #000 0%, transparent 100%)',
        WebkitMaskImage: isTop
          ? 'linear-gradient(180deg, #000 0%, #000 30%, transparent 100%)'
          : 'linear-gradient(0deg, #000 0%, transparent 100%)',
        animation: `vo-shimmer ${isTop ? 9 : 13}s ease-in-out infinite`,
      }}>
      <img src={isTop ? A.lightChandelier : A.lightBokeh} alt=""
        className="w-full h-full"
        style={{ objectFit: 'cover', objectPosition: isTop ? 'top' : 'bottom', mixBlendMode: 'screen', opacity }} />
    </div>
  )
}

// ─── PETALS ────────────────────────────────────────────────────────
const Petals = ({ petals }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {petals.map(p => (
      <img key={p.id} src={A.petal} alt=""
        style={{
          position: 'absolute', top: 0, left: `${p.left}%`, width: 22, height: 'auto',
          '--dx': `${p.dx}vw`, '--rot': `${p.rot}deg`,
          animation: `vo-fall ${p.duration}s linear infinite`,
          animationDelay: `${p.delay}s`,
        }} />
    ))}
  </div>
)

// ─── VIDEO BACKDROP (persistent, does not scroll with content) ─────
const VideoBackdrop = () => (
  <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0, background: c.nightOlive }}>
    <div className="absolute" style={{ top: '-6%', left: '-6%', width: '112%', height: '112%', animation: 'vo-sway 26s ease-in-out infinite' }}>
      <video autoPlay muted loop playsInline poster={A.bgHeroPoster} preload="auto"
        className="w-full h-full" style={{ objectFit: 'cover' }}>
        <source src={A.bgHero} type="video/mp4" />
      </video>
    </div>
    <LightOverlay kind="chandelier" opacity={0.16} height="34%" />
    <LightOverlay kind="bokeh" opacity={0.14} height="30%" />
    <div className="absolute inset-0" style={{
      background: 'linear-gradient(180deg, rgba(12,13,8,.62) 0%, rgba(12,13,8,.30) 32%, rgba(12,13,8,.48) 66%, rgba(12,13,8,.80) 100%)',
    }} />
  </div>
)

// ─── COVER / CURTAIN REVEAL ──────────────────────────────────────
// Stays mounted the whole time (never unmounted via AnimatePresence): the
// curtains + content fade on their own animateClose-driven timeline, then the
// whole overlay fades opacity:0 over .9s once `opened` flips true (per spec),
// at which point it also goes pointer-events:none.
const Cover = ({ data, groomNick, brideNick, heroDate, guestName, handleOpen, animateClose, opened }) => {
  const coverPhoto = data?.meta?.coverPhoto
  const curtainTransition = { duration: 1.6, ease: [0.66, 0, 0.2, 1] }
  return (
    <motion.div className="absolute inset-0" style={{ zIndex: 60, pointerEvents: animateClose ? 'none' : 'auto' }}
      animate={{ opacity: opened ? 0 : 1 }} transition={{ duration: 0.9 }}>
      <motion.div className="absolute top-0 left-0 h-full overflow-hidden"
        style={{ width: '52%', backgroundImage: `url('${A.velvetDrape}')`, backgroundSize: 'cover', boxShadow: '12px 0 40px rgba(0,0,0,.6)' }}
        animate={animateClose ? { x: '-102%' } : { x: 0 }} transition={curtainTransition} />
      <motion.div className="absolute top-0 right-0 h-full overflow-hidden"
        style={{ width: '52%', backgroundImage: `url('${A.velvetDrape}')`, backgroundSize: 'cover', transform: 'scaleX(-1)', boxShadow: '-12px 0 40px rgba(0,0,0,.6)' }}
        animate={animateClose ? { x: '102%' } : { x: 0 }} transition={curtainTransition} />

      <motion.div className="absolute inset-0 flex flex-col items-center justify-center text-center"
        animate={animateClose ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.7 }}
        style={{ padding: '40px 32px', color: c.ivory }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(180deg, rgba(10,11,7,.55), rgba(10,11,7,.30) 45%, rgba(10,11,7,.75))',
        }} />
        <LightOverlay kind="chandelier" opacity={0.2} height="32%" />

        <div className="relative z-10 flex flex-col items-center w-full">
          <p style={{ fontFamily: F.sans, fontSize: 10, letterSpacing: '5px', color: 'rgba(244,239,230,.65)', margin: '0 0 20px' }}>UNDANGAN PERNIKAHAN</p>

          <div className="overflow-hidden flex items-center justify-center" style={{
            width: 196, height: 236, borderRadius: '98px 98px 14px 14px',
            border: '1px solid rgba(217,188,122,.35)', boxShadow: '0 20px 50px rgba(0,0,0,.5)',
            background: 'rgba(20,21,15,.5)', marginBottom: 22,
          }}>
            {coverPhoto
              ? <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
              : <span style={{ fontFamily: F.sans, fontSize: 10, color: 'rgba(244,239,230,.5)' }}>Foto Cover</span>}
          </div>

          <h1 style={{ fontFamily: F.script, fontSize: 62, color: c.ivory, margin: '0 0 16px', lineHeight: 1 }}>
            {groomNick} &amp; {brideNick}
          </h1>

          <p style={{ fontFamily: F.serif, fontSize: 17, letterSpacing: '3px', color: 'rgba(244,239,230,.8)', margin: '0 0 24px' }}>{heroDate}</p>

          <div style={{
            maxWidth: 290, padding: '16px 18px', borderRadius: 18, background: 'rgba(20,21,15,.5)',
            border: '1px solid rgba(217,188,122,.28)', backdropFilter: 'blur(10px)', marginBottom: 28,
          }}>
            <p style={{ fontFamily: F.sans, fontSize: 10, letterSpacing: '3px', color: 'rgba(244,239,230,.6)', margin: '0 0 6px' }}>KEPADA YTH.</p>
            <p style={{ fontFamily: F.serif, fontSize: 21, color: c.ivory, margin: 0 }}>{guestName || 'Tamu Undangan'}</p>
          </div>

          <motion.button onClick={handleOpen}
            style={{
              fontFamily: F.sans, padding: '14px 34px', borderRadius: 999, border: 'none',
              background: `linear-gradient(135deg, ${c.champagne}, ${c.champagneDeep})`,
              color: c.ink, fontSize: 11, letterSpacing: '3px', cursor: 'pointer',
            }}
            whileHover={{ filter: 'brightness(1.08)' }} whileTap={{ scale: 0.96 }}>
            BUKA UNDANGAN
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────
export default function VelourOliveTheme({
  data, countdown, opened, setOpened,
  animateClose, setAnimateClose,
  setMusicPlaying, audioRef,
  wishes, guestName,
}) {
  const [petals] = useState(() => genPetals(12))
  const groomNick = data?.groom?.nickname || 'Mempelai Pria'
  const brideNick = data?.bride?.nickname || 'Mempelai Wanita'
  const primaryEvent = data?.events?.[0]
  const heroDate = primaryEvent?.dateLabel || fmtDate(primaryEvent?.date)
  const musicEnabled = data?.music !== false

  const handleOpen = () => {
    setAnimateClose(true)
    setTimeout(() => {
      setOpened(true)
      if (audioRef?.current) setMusicPlaying(true)
    }, 1500)
  }

  return (
    <InvitationLayout layout={THEMES.VELOUR_OLIVE} data={data}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
        @keyframes vo-sway { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(10px); } }
        @keyframes vo-shimmer { 0%, 100% { opacity: .34; } 50% { opacity: .62; } }
        @keyframes vo-fall {
          0% { transform: translate3d(0,-12%,0) rotate(0); opacity: 0; }
          10% { opacity: .85; }
          90% { opacity: .85; }
          100% { transform: translate3d(var(--dx),112vh,0) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes vo-eq { 0%, 100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
        .vo-scroll { scroll-snap-type: y proximity; }
        .vo-babak { scroll-snap-align: start; }
      `}</style>

      <div id="top" className="relative w-full h-full overflow-hidden"
        style={{ fontFamily: F.sans, background: c.nightOlive, color: c.ivory }}>

        {musicEnabled && (
          <audio ref={audioRef} src={data?.musicUrl || MUSIC_URLS[data?.musicId || 1] || MUSIC_URLS[1]} loop />
        )}

        <VideoBackdrop />
        <Petals petals={petals} />

        <div className="vo-scroll absolute inset-0 overflow-y-auto" style={{ zIndex: 10 }}>
          {/* Babak (Slide Awal, Quote, Mempelai, Acara, opsional, RSVP, Penutup)
              ditambahkan di bagian build berikutnya — lihat TodoWrite/percakapan. */}
          <div className="vo-babak flex flex-col items-center justify-center text-center"
            style={{ minHeight: '100%', boxSizing: 'border-box', padding: '64px 26px', color: 'rgba(244,239,230,.6)', fontFamily: F.sans, fontSize: 13 }}>
            countdown: {countdown?.d ?? 0}h {countdown?.h ?? 0}j {countdown?.m ?? 0}m {countdown?.s ?? 0}d — wishes: {wishes?.length ?? 0}
          </div>
        </div>

        <Cover data={data} groomNick={groomNick} brideNick={brideNick}
          heroDate={heroDate} guestName={guestName} handleOpen={handleOpen}
          animateClose={animateClose} opened={opened} />
      </div>
    </InvitationLayout>
  )
}
