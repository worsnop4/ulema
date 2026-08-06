import { useState, useRef, useEffect } from 'react'
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

// ─── 1. SLIDE AWAL ───────────────────────────────────────────────
const SlideAwal = ({ groomNick, brideNick, heroDate, countdown, countdownEnabled }) => {
  const blocks = [
    { label: 'Hari', v: countdown?.d ?? 0 },
    { label: 'Jam', v: countdown?.h ?? 0 },
    { label: 'Menit', v: countdown?.m ?? 0 },
    { label: 'Detik', v: countdown?.s ?? 0 },
  ]
  return (
    <div id="vo-mulai" className="vo-babak relative flex flex-col items-center justify-center text-center"
      style={{ minHeight: '100%', boxSizing: 'border-box', padding: '64px 26px' }}>
      <p style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: '5px', color: 'rgba(244,239,230,.7)', margin: '0 0 16px' }}>THE WEDDING OF</p>
      <div style={{ width: 1, height: 34, background: `linear-gradient(${c.champagne}, transparent)`, marginBottom: 16 }} />

      <h1 style={{ fontFamily: F.script, fontSize: 74, color: c.ivory, margin: 0, lineHeight: 1.05 }}>{groomNick}</h1>
      <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 26, color: c.champagne, margin: '4px 0' }}>&amp;</span>
      <h1 style={{ fontFamily: F.script, fontSize: 74, color: c.ivory, margin: '0 0 20px', lineHeight: 1.05 }}>{brideNick}</h1>

      <img src={A.ornamentDivider} alt="" style={{ width: 240, marginBottom: 20 }} />

      <p style={{ fontFamily: F.serif, fontSize: 19, letterSpacing: '2px', color: 'rgba(244,239,230,.85)', margin: '0 0 26px' }}>{heroDate}</p>

      {countdownEnabled && (
        <div className="flex gap-2.5">
          {blocks.map(b => (
            <div key={b.label} className="flex flex-col items-center justify-center" style={{
              width: 66, padding: '12px 0', borderRadius: 18,
              background: 'rgba(244,239,230,.10)', border: '1px solid rgba(217,188,122,.28)', backdropFilter: 'blur(9px)',
            }}>
              <span style={{ fontFamily: F.serif, fontSize: 28, color: c.ivory, lineHeight: 1 }}>{b.v.toString().padStart(2, '0')}</span>
              <span style={{ fontFamily: F.sans, fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(244,239,230,.6)' }}>{b.label}</span>
            </div>
          ))}
        </div>
      )}

      <p style={{ position: 'absolute', bottom: 22, fontFamily: F.sans, fontSize: 10, letterSpacing: '4px', color: 'rgba(244,239,230,.5)' }}>GESER</p>
    </div>
  )
}

// Which optional babak actually have content — drives both the rail dot
// count/order and each section's own render-or-null. Keep in sync with the
// sections themselves as they're built out in later parts.
function getBabakList(data) {
  const hasStory = (data?.loveStory || []).length > 0
  const hasGallery = (data?.gallery || []).length > 0
  const hasDresscode = Boolean(data?.dresscode?.name || data?.dresscode?.color || data?.dresscode?.notes)
  const hasLive = Boolean(data?.livestreamEnabled) && (data?.livestreamPlatforms || []).some(p => p.url)
  const hasGift = (data?.accounts || []).length > 0
  const hasFamilies = Boolean(data?.turutMengundangEnabled) && (data?.families || []).some(f => (f.members || []).filter(m => m && m.trim()).length)
  const hasInfo = hasDresscode || hasLive || hasGift || hasFamilies
  return [
    { id: 'vo-mulai' },
    { id: 'vo-quote' },
    { id: 'vo-mempelai' },
    { id: 'vo-acara' },
    hasStory && { id: 'vo-story' },
    hasGallery && { id: 'vo-galeri' },
    hasInfo && { id: 'vo-info' },
    { id: 'vo-rsvp' },
    { id: 'vo-penutup' },
  ].filter(Boolean)
}

// ─── RAIL BABAK ──────────────────────────────────────────────────
const Rail = ({ babakList, active, visible }) => {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return (
    <div className="absolute flex flex-col" style={{
      right: 12, top: '50%', transform: 'translateY(-50%)', gap: 12, zIndex: 30,
      opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none',
      transition: 'opacity .8s ease .3s',
    }}>
      {babakList.map((b, i) => {
        const isActive = i === active
        return (
          <button key={b.id} onClick={() => go(b.id)} aria-label={b.id}
            style={{
              width: isActive ? 9 : 6, height: isActive ? 9 : 6, borderRadius: '50%',
              background: isActive ? c.champagne : 'transparent',
              border: `1px solid ${isActive ? c.champagne : 'rgba(244,239,230,.45)'}`,
              boxShadow: isActive ? `0 0 12px ${c.champagne}` : 'none',
              transition: 'all .35s', padding: 0, cursor: 'pointer',
            }} />
        )
      })}
    </div>
  )
}

// ─── TOMBOL MUSIK ────────────────────────────────────────────────
const MusicButton = ({ musicPlaying, setMusicPlaying, visible }) => (
  <button onClick={() => setMusicPlaying(!musicPlaying)} aria-label="Toggle musik"
    className="absolute flex items-center justify-center gap-1"
    style={{
      left: 16, bottom: 18, width: 42, height: 42, borderRadius: 999, zIndex: 30, border: 'none',
      background: `linear-gradient(135deg, ${c.champagne}, ${c.champagneDeep})`, cursor: 'pointer',
      opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none',
      transition: 'opacity .8s ease .3s',
    }}>
    {[0.6, 0.75, 0.9].map((dur, i) => (
      <span key={i} style={{
        width: 2, height: 12, background: c.ink, borderRadius: 1,
        animation: musicPlaying ? `vo-eq ${dur}s ease-in-out infinite` : 'none',
        transform: musicPlaying ? undefined : 'scaleY(.45)',
      }} />
    ))}
  </button>
)

// ─── 2. QUOTE ────────────────────────────────────────────────────
const Quote = ({ data }) => {
  const quote = data?.quote || 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup agar kamu cenderung dan merasa tenteram kepadanya, serta dijadikan-Nya di antaramu rasa kasih dan sayang.'
  return (
    <div id="vo-quote" className="vo-babak flex items-center justify-center" style={{ minHeight: '100%', boxSizing: 'border-box', padding: '64px 26px' }}>
      <div className="relative" style={{
        padding: '52px 30px', borderRadius: 22, background: 'rgba(20,21,15,.42)',
        border: '1px solid rgba(217,188,122,.25)', backdropFilter: 'blur(14px)', textAlign: 'center',
      }}>
        <img src={A.floralCorner} alt="" style={{
          position: 'absolute', left: -26, top: -58, width: 168, pointerEvents: 'none',
          filter: 'drop-shadow(0 10px 22px rgba(0,0,0,.5))',
        }} />
        <p style={{
          fontFamily: F.serif, fontStyle: 'italic', fontSize: 23, lineHeight: 1.65, color: c.ivory,
          margin: '0 0 22px', position: 'relative', textWrap: 'pretty',
        }}>&ldquo;{quote}&rdquo;</p>
        <img src={A.ornamentDivider} alt="" style={{ width: 160, margin: '0 auto' }} />
      </div>
    </div>
  )
}

// ─── 3. MEMPELAI ─────────────────────────────────────────────────
const PersonCard = ({ person }) => (
  <div className="flex" style={{
    gap: 16, padding: 16, borderRadius: 22, background: 'rgba(20,21,15,.44)',
    border: '1px solid rgba(217,188,122,.22)', backdropFilter: 'blur(12px)', overflow: 'hidden',
  }}>
    <div className="relative flex-shrink-0 overflow-hidden" style={{ width: 138, height: 164, borderRadius: 16, background: 'rgba(20,21,15,.6)' }}>
      {person?.photo
        ? <img src={person.photo} alt={person?.nickname} className="w-full h-full object-cover" />
        : <span className="absolute inset-0 flex items-center justify-center" style={{ fontFamily: F.sans, fontSize: 10, color: 'rgba(244,239,230,.5)' }}>Foto</span>}
      <img src={A.velvetDrape} alt="" className="absolute top-0 left-0 h-full object-cover"
        style={{ width: 17, filter: 'brightness(.5)', boxShadow: '6px 0 14px rgba(0,0,0,.55)' }} />
      <img src={A.velvetDrape} alt="" className="absolute top-0 right-0 h-full object-cover"
        style={{ width: 17, filter: 'brightness(.5)', boxShadow: '-6px 0 14px rgba(0,0,0,.55)' }} />
    </div>
    <div className="flex flex-col justify-center" style={{ minWidth: 0 }}>
      <h3 style={{ fontFamily: F.script, fontSize: 38, color: c.ivory, margin: 0, lineHeight: 1 }}>{person?.nickname}</h3>
      <p style={{ fontFamily: F.serif, fontSize: 17, color: 'rgba(244,239,230,.9)', margin: '4px 0 8px' }}>{person?.name || person?.nickname || '—'}</p>
      <p style={{ fontFamily: F.sans, fontSize: 12, lineHeight: 1.6, color: 'rgba(244,239,230,.65)', margin: '0 0 6px' }}>
        Putra dari {person?.father || '—'} &amp; {person?.mother || '—'}
      </p>
      {person?.instagram && (
        <a href={`https://instagram.com/${person.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
          style={{ fontFamily: F.sans, fontSize: 11, color: c.champagne }}>
          @{person.instagram.replace('@', '')}
        </a>
      )}
    </div>
  </div>
)

const Mempelai = ({ data }) => (
  <div id="vo-mempelai" className="vo-babak flex flex-col items-center justify-center text-center" style={{ minHeight: '100%', boxSizing: 'border-box', padding: '64px 26px' }}>
    <p style={{ fontFamily: F.sans, fontSize: 10, letterSpacing: '5px', color: 'rgba(244,239,230,.7)', margin: '0 0 14px' }}>MEMPELAI</p>
    <h2 style={{ fontFamily: F.serif, fontSize: 30, color: c.ivory, margin: '0 0 14px' }}>Assalamualaikum Wr. Wb.</h2>
    <p style={{ fontFamily: F.sans, fontSize: 13, lineHeight: 1.75, color: 'rgba(244,239,230,.7)', maxWidth: 320, margin: '0 0 30px' }}>
      Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.
    </p>
    <div className="w-full flex flex-col" style={{ gap: 20, maxWidth: 360 }}>
      <PersonCard person={data?.groom} />
      <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 24, color: c.champagne }}>&amp;</span>
      <PersonCard person={data?.bride} />
    </div>
  </div>
)

// ─── MAIN EXPORT ────────────────────────────────────────────────────
export default function VelourOliveTheme({
  data, countdown, opened, setOpened,
  animateClose, setAnimateClose,
  musicPlaying, setMusicPlaying, audioRef,
  wishes, guestName,
}) {
  const [petals] = useState(() => genPetals(12))
  const [active, setActive] = useState(0)
  const scrollRef = useRef(null)
  const groomNick = data?.groom?.nickname || 'Mempelai Pria'
  const brideNick = data?.bride?.nickname || 'Mempelai Wanita'
  const primaryEvent = data?.events?.[0]
  const heroDate = primaryEvent?.dateLabel || fmtDate(primaryEvent?.date)
  const musicEnabled = data?.music !== false
  const babakList = getBabakList(data)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / el.clientHeight)
      setActive(Math.max(0, Math.min(idx, babakList.length - 1)))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [babakList.length])

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

        <div ref={scrollRef} className="vo-scroll absolute inset-0 overflow-y-auto" style={{ zIndex: 10 }}>
          <SlideAwal groomNick={groomNick} brideNick={brideNick} heroDate={heroDate}
            countdown={countdown} countdownEnabled={data?.countdownEnabled ?? true} />
          <Quote data={data} />
          <Mempelai data={data} />
          {/* Acara, babak opsional, RSVP, Penutup — ditambahkan di bagian
              build berikutnya (lihat TodoWrite/percakapan). */}
          <div className="vo-babak flex flex-col items-center justify-center text-center"
            style={{ minHeight: '100%', boxSizing: 'border-box', padding: '64px 26px', color: 'rgba(244,239,230,.6)', fontFamily: F.sans, fontSize: 13 }}>
            wishes: {wishes?.length ?? 0}
          </div>
        </div>

        <Rail babakList={babakList} active={active} visible={opened} />
        {musicEnabled && <MusicButton musicPlaying={musicPlaying} setMusicPlaying={setMusicPlaying} visible={opened} />}

        <Cover data={data} groomNick={groomNick} brideNick={brideNick}
          heroDate={heroDate} guestName={guestName} handleOpen={handleOpen}
          animateClose={animateClose} opened={opened} />
      </div>
    </InvitationLayout>
  )
}
