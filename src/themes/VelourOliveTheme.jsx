import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
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
    // Sway and spin run on their own cycles, deliberately not multiples of the
    // fall duration, so no petal ever repeats the same visible arc.
    sway: (3.2 + rand() * 2.6).toFixed(1),
    swayX: (7 + rand() * 7).toFixed(1),
    spin: (7 + rand() * 9).toFixed(1),
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
// A petal used to be a single element carrying one `transform` animation, from
// a start pose straight to an end pose on a `linear` timing function. One
// transform cannot be linear and eased at the same time, so the fall, the
// sideways drift and the spin were all forced onto the same constant-rate
// ramp: every petal slid down a ruler-straight diagonal at unvarying speed,
// which is what read as stiff.
//
// Split across two elements instead. The wrapper owns the vertical fall, which
// genuinely is linear — gravity at terminal velocity. The image owns the
// sideways drift on a separate eased cycle, and the spin via the independent
// `rotate` property so it composes with that drift instead of overwriting it
// (two animations on the same `transform` would not compose — the later one
// simply wins). All three still animate compositor-only properties.
const Petals = ({ petals }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {petals.map(p => (
      <div key={p.id}
        style={{
          position: 'absolute', top: 0, left: `${p.left}%`,
          // dx is authored as a vw-style percentage; resolve it against the
          // invitation column, not the browser window (on desktop the window
          // is several times wider, which threw petals clean out of frame).
          '--dx': `calc(var(--inv-w) * ${p.dx / 100})`,
          animation: `vo-fall ${p.duration}s linear infinite`,
          animationDelay: `${p.delay}s`,
        }}>
        <img src={A.petal} alt=""
          style={{
            display: 'block', width: 22, height: 'auto',
            '--rot': `${p.rot}deg`, '--sway': `${p.swayX}px`,
            animation: `vo-drift ${p.sway}s ease-in-out infinite, vo-spin ${p.spin}s linear infinite`,
            animationDelay: `${p.delay}s, ${p.delay}s`,
          }} />
      </div>
    ))}
  </div>
)

// ─── VIDEO BACKDROP (persistent, does not scroll with content) ─────
// Both videos stay mounted always; only opacity crossfades when the Penutup
// babak becomes active, so neither ever reloads (per spec).
const VideoBackdrop = ({ footerActive }) => {
  const heroRef = useRef(null)
  const footerRef = useRef(null)

  // A video at opacity:0 keeps decoding every single frame — browsers do not
  // pause playback just because an element is invisible. Both of these loops
  // are ~4.5MB, and both carried `autoPlay`, so the whole session ran two
  // simultaneous video decodes to show one. That is the largest continuous
  // drain in the theme, and it competes directly with the petal animation and
  // with scrolling. Keep both mounted so neither ever reloads (per spec), but
  // only ever let the visible one run.
  useEffect(() => {
    const show = footerActive ? footerRef.current : heroRef.current
    const hide = footerActive ? heroRef.current : footerRef.current
    hide?.pause()
    // Muted + playsInline, so this is allowed without a gesture; the catch is
    // for the interrupted-by-pause rejection when babak change back to back.
    show?.play?.()?.catch(() => {})
  }, [footerActive])

  return (
  <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0, background: c.nightOlive }}>
    <div className="absolute" style={{ top: '-6%', left: '-6%', width: '112%', height: '112%', animation: 'vo-sway 26s ease-in-out infinite' }}>
      <video ref={heroRef} autoPlay muted loop playsInline poster={A.bgHeroPoster} preload="auto"
        className="absolute inset-0 w-full h-full" style={{ objectFit: 'cover', opacity: footerActive ? 0 : 1, transition: 'opacity 1.2s' }}>
        <source src={A.bgHero} type="video/mp4" />
      </video>
      {/* No autoPlay: the effect above starts it only when the Penutup babak
          is reached, so it costs nothing until then. */}
      <video ref={footerRef} muted loop playsInline poster={A.bgFooterPoster} preload="metadata"
        className="absolute inset-0 w-full h-full" style={{ objectFit: 'cover', opacity: footerActive ? 1 : 0, transition: 'opacity 1.2s' }}>
        <source src={A.bgFooter} type="video/mp4" />
      </video>
    </div>
    <LightOverlay kind="chandelier" opacity={0.16} height="34%" />
    <LightOverlay kind="bokeh" opacity={0.14} height="30%" />
    <div className="absolute inset-0" style={{
      background: 'linear-gradient(180deg, rgba(12,13,8,.62) 0%, rgba(12,13,8,.30) 32%, rgba(12,13,8,.48) 66%, rgba(12,13,8,.80) 100%)',
    }} />
  </div>
  )
}

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
function getBabakFlags(data) {
  const hasStory = (data?.loveStory || []).length > 0
  const hasGallery = (data?.gallery || []).length > 0
  const hasDresscode = Boolean(data?.dresscode?.name || data?.dresscode?.color || data?.dresscode?.notes)
  const hasLive = Boolean(data?.livestreamEnabled) && (data?.livestreamPlatforms || []).some(p => p.url)
  // Alamat Pengiriman Kado punya toggle sendiri; tanpa ikut dihitung di sini
  // pasangan yang hanya mengisi alamat kirim kehilangan babak Informasi.
  const g = data?.giftAddress
  const hasGift = (data?.accounts || []).length > 0 || Boolean(g?.enabled && (g.address || g.recipient || g.phone))
  const hasFamilies = Boolean(data?.turutMengundangEnabled) && (data?.families || []).some(f => (f.members || []).filter(m => m && m.trim()).length)
  return { hasStory, hasGallery, hasDresscode, hasLive, hasGift, hasFamilies, hasInfo: hasDresscode || hasLive || hasGift || hasFamilies }
}

function getBabakList(data) {
  const { hasStory, hasGallery, hasInfo } = getBabakFlags(data)
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
    <div id="vo-quote" className="vo-babak flex items-center justify-center" style={{ boxSizing: 'border-box', padding: '86px 26px' }}>
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
    {/* Cincin cahaya. A light travels around the rim of the portrait, with a
        soft halo bleeding onto the card behind it.

        Done in CSS rather than as a generated plate for a hard reason: a ring
        around a photo has to be transparent in the middle and feather out at
        its edges, which needs real per-pixel alpha. Kling emits no alpha, and
        the usual workaround for that — opaque art on black composited with
        mix-blend-mode: screen, as LightOverlay does above — is unavailable
        here, because this card carries backdrop-filter and blending is
        isolated inside a backdrop root. A gradient has the alpha natively,
        costs no bytes, and rescales with the frame. */}
    <div className="relative flex-shrink-0" style={{
      width: 138, height: 164, borderRadius: 18, overflow: 'hidden',
      boxShadow: '0 0 22px rgba(217,188,122,.22)',
    }}>
      {/* Oversized so its corners still cover the frame as it turns. */}
      <div className="absolute" style={{
        top: '50%', left: '50%', width: '190%', aspectRatio: '1',
        background: 'conic-gradient(from 0deg, transparent 0deg, rgba(217,188,122,.15) 55deg, rgba(244,239,230,.9) 82deg, rgba(217,188,122,.5) 112deg, transparent 175deg, transparent 360deg)',
        animation: 'vo-ring 7s linear infinite',
      }} />
      {/* Inset by 2px, which is what leaves the rim of light showing. */}
      <div className="absolute overflow-hidden" style={{ inset: 2, borderRadius: 16, background: 'rgba(20,21,15,.6)' }}>
        {person?.photo
          ? <img src={person.photo} alt={person?.nickname} className="w-full h-full object-cover" />
          : <span className="absolute inset-0 flex items-center justify-center" style={{ fontFamily: F.sans, fontSize: 10, color: 'rgba(244,239,230,.5)' }}>Foto</span>}
        <img src={A.velvetDrape} alt="" className="absolute top-0 left-0 h-full object-cover"
          style={{ width: 17, filter: 'brightness(.5)', boxShadow: '6px 0 14px rgba(0,0,0,.55)' }} />
        <img src={A.velvetDrape} alt="" className="absolute top-0 right-0 h-full object-cover"
          style={{ width: 17, filter: 'brightness(.5)', boxShadow: '-6px 0 14px rgba(0,0,0,.55)' }} />
      </div>
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
  <div id="vo-mempelai" className="vo-babak flex flex-col items-center justify-center text-center" style={{ boxSizing: 'border-box', padding: '86px 26px' }}>
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

// ─── 4. ACARA ─────────────────────────────────────────────────────
const EventCard = ({ ev }) => {
  if (!ev) return null
  const dateLabel = ev.dateLabel || fmtDate(ev.date)
  return (
    <div style={{
      padding: 22, borderRadius: 22, background: 'rgba(20,21,15,.46)',
      border: '1px solid rgba(217,188,122,.24)', backdropFilter: 'blur(12px)', textAlign: 'center',
    }}>
      <h3 style={{ fontFamily: F.serif, fontSize: 24, color: c.champagne, margin: '0 0 8px' }}>{ev.name || 'Acara'}</h3>
      <p style={{ fontFamily: F.sans, fontSize: 12.5, color: 'rgba(244,239,230,.75)', margin: '0 0 10px' }}>{dateLabel}</p>
      <p style={{ fontFamily: F.serif, fontSize: 20, color: c.ivory, margin: 0 }}>
        {ev.start || '—'}{ev.end ? ` – ${ev.end}` : ''} {ev.tz || ''}
      </p>
      <div style={{ height: 1, background: 'rgba(217,188,122,.24)', margin: '14px 0' }} />
      <p style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 500, color: c.ivory, margin: '0 0 4px' }}>{ev.venue || '—'}</p>
      {ev.address && <p style={{ fontFamily: F.sans, fontSize: 12, lineHeight: 1.6, color: 'rgba(244,239,230,.65)', margin: '0 0 16px' }}>{ev.address}</p>}
      {ev.maps && (
        <a href={ev.maps} target="_blank" rel="noreferrer" className="inline-block"
          style={{
            padding: '10px 22px', borderRadius: 999, border: '1px solid rgba(217,188,122,.55)',
            fontFamily: F.sans, fontSize: 11, letterSpacing: '2px', color: c.champagne,
          }}>
          PETUNJUK ARAH
        </a>
      )}
    </div>
  )
}

const Acara = ({ data }) => {
  // Wajib per babak table — always rendered so it stays in sync with
  // getBabakList()'s unconditional 'vo-acara' entry, even before the couple
  // has filled any event in yet.
  const events = data?.events?.length ? data.events : [null]
  return (
    <div id="vo-acara" className="vo-babak flex flex-col justify-center" style={{ boxSizing: 'border-box', padding: '86px 26px', gap: 18 }}>
      {events.map((ev, i) => <EventCard key={ev?.id || i} ev={ev || {}} />)}
    </div>
  )
}

// ─── 5. LOVE STORY (opsional) ────────────────────────────────────
const LoveStory = ({ data }) => {
  const stories = data?.loveStory || []
  if (!stories.length) return null
  return (
    <div id="vo-story" className="vo-babak flex flex-col justify-center" style={{ boxSizing: 'border-box', padding: '86px 26px', gap: 14 }}>
      {stories.map((s, i) => (
        <div key={s.id || i} className="flex" style={{
          gap: 14, padding: '16px 18px', borderRadius: 20, background: 'rgba(20,21,15,.42)',
          border: '1px solid rgba(217,188,122,.2)', backdropFilter: 'blur(10px)',
        }}>
          <div style={{ width: 52, flexShrink: 0, fontFamily: F.serif, fontSize: 22, color: c.champagne }}>{s.year}</div>
          <div>
            <h4 style={{ fontFamily: F.serif, fontSize: 18, color: c.ivory, margin: '0 0 4px' }}>{s.title}</h4>
            <p style={{ fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.7, color: 'rgba(244,239,230,.7)', margin: 0 }}>{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── 6. GALERI (opsional) ────────────────────────────────────────
const Galeri = ({ data }) => {
  const photos = data?.gallery || []
  if (!photos.length) return null
  return (
    <div id="vo-galeri" className="vo-babak flex flex-col justify-center" style={{ boxSizing: 'border-box', padding: '86px 26px' }}>
      <div className="grid grid-cols-2" style={{ gap: 10 }}>
        {photos.map((ph, i) => {
          const src = typeof ph === 'string' ? ph : ph?.src
          if (!src) return null
          return (
            <div key={ph?.id || src} className="relative overflow-hidden" style={{ aspectRatio: '3/4', borderRadius: 16, border: '1px solid rgba(217,188,122,.18)' }}>
              <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              {/* Pantulan cahaya menyapu ubin. Staggered by index so the grid
                  glints one tile at a time instead of flashing as a block; the
                  keyframe idles off-screen for most of its cycle so the sweep
                  reads as an occasional catch of light, not a strobe. */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(115deg, transparent 34%, rgba(244,239,230,.26) 46%, rgba(217,188,122,.34) 52%, transparent 66%)',
                animation: `vo-sheen 6s ease-in-out ${(i % 4) * 0.7}s infinite`,
              }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── 7. INFORMASI (opsional — dresscode / live / hadiah / turut mengundang) ──
const InfoLabel = ({ children }) => (
  <p style={{ fontFamily: F.sans, fontSize: 10, letterSpacing: '3px', color: 'rgba(244,239,230,.6)', margin: '0 0 12px' }}>{children}</p>
)

const infoCardStyle = {
  borderRadius: 20, background: 'rgba(20,21,15,.44)', border: '1px solid rgba(217,188,122,.2)',
  backdropFilter: 'blur(10px)', padding: 18,
}

const DresscodeBlock = ({ data }) => (
  <div style={infoCardStyle}>
    <InfoLabel>DRESSCODE</InfoLabel>
    <div className="flex items-center" style={{ gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: data?.dresscode?.color || c.velvetOlive, border: '1px solid rgba(244,239,230,.35)' }} />
      <div>
        <p style={{ fontFamily: F.serif, fontSize: 19, color: c.ivory, margin: 0 }}>{data?.dresscode?.name || '—'}</p>
        {data?.dresscode?.notes && <p style={{ fontFamily: F.sans, fontSize: 12, color: 'rgba(244,239,230,.65)', margin: '2px 0 0' }}>{data.dresscode.notes}</p>}
      </div>
    </div>
  </div>
)

const LiveStreamBlock = ({ data }) => (
  <div style={infoCardStyle}>
    <InfoLabel>LIVE STREAMING</InfoLabel>
    <div className="flex flex-wrap" style={{ gap: 8 }}>
      {(data?.livestreamPlatforms || []).filter(p => p.url).map((p, i) => (
        <a key={p.id || i} href={p.url} target="_blank" rel="noreferrer" className="inline-block"
          style={{ padding: '9px 18px', borderRadius: 999, border: '1px solid rgba(217,188,122,.5)', fontFamily: F.sans, fontSize: 12, color: c.ivory }}>
          {p.type}
        </a>
      ))}
    </div>
  </div>
)

const GiftBlock = ({ data }) => {
  const { copiedKey, copy } = useCopyToClipboard(1600)
  return (
    <div style={infoCardStyle}>
      <InfoLabel>HADIAH</InfoLabel>
      <div className="flex flex-col" style={{ gap: 10 }}>
        {(data?.accounts || []).map((acc, i) => {
          const key = acc.id || acc.number || i
          const isCopied = copiedKey === key
          return (
            <div key={key} style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(244,239,230,.06)' }}>
              <p style={{ fontFamily: F.serif, fontSize: 17, color: c.ivory, margin: 0 }}>{acc.bank}</p>
              <p style={{ fontFamily: F.sans, fontSize: 12, letterSpacing: '1px', color: 'rgba(244,239,230,.85)', margin: '4px 0' }}>{acc.number}</p>
              <p style={{ fontFamily: F.sans, fontSize: 11, color: 'rgba(244,239,230,.6)', margin: '0 0 10px' }}>a.n. {acc.holder}</p>
              <button onClick={() => copy(acc.number, key)}
                style={{
                  padding: '7px 16px', borderRadius: 999, border: `1px solid ${c.champagne}`,
                  background: isCopied ? c.champagne : 'transparent', color: isCopied ? c.ink : c.champagne,
                  fontFamily: F.sans, fontSize: 10, letterSpacing: '1.5px', cursor: 'pointer',
                }}>
                {isCopied ? 'TERSALIN' : 'SALIN'}
              </button>
            </div>
          )
        })}

        {(() => {
          const gift = data?.giftAddress
          if (!gift?.enabled || !(gift.address || gift.recipient || gift.phone)) return null
          return (
            <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(244,239,230,.06)' }}>
              <p style={{ fontFamily: F.serif, fontSize: 17, color: c.ivory, margin: 0 }}>Kirim Kado</p>
              {gift.recipient && <p style={{ fontFamily: F.sans, fontSize: 12.5, color: 'rgba(244,239,230,.85)', margin: '6px 0 0' }}>{gift.recipient}</p>}
              {gift.phone && <p style={{ fontFamily: F.sans, fontSize: 11.5, color: 'rgba(244,239,230,.6)', margin: '3px 0 0' }}>{gift.phone}</p>}
              {gift.address && <p style={{ fontFamily: F.sans, fontSize: 11.5, lineHeight: 1.7, color: 'rgba(244,239,230,.6)', margin: '8px 0 10px', whiteSpace: 'pre-line' }}>{gift.address}</p>}
              {gift.address && (
                <button onClick={() => copy(gift.address, 'vo-gift-address')}
                  style={{
                    padding: '7px 16px', borderRadius: 999, border: `1px solid ${c.champagne}`,
                    background: copiedKey === 'vo-gift-address' ? c.champagne : 'transparent',
                    color: copiedKey === 'vo-gift-address' ? c.ink : c.champagne,
                    fontFamily: F.sans, fontSize: 10, letterSpacing: '1.5px', cursor: 'pointer',
                  }}>
                  {copiedKey === 'vo-gift-address' ? 'TERSALIN' : 'SALIN ALAMAT'}
                </button>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

const FamiliesBlock = ({ data }) => {
  const families = (data?.families || []).map(f => ({ ...f, members: (f.members || []).filter(m => m && m.trim()) })).filter(f => f.members.length)
  return (
    <div style={infoCardStyle}>
      <InfoLabel>TURUT MENGUNDANG</InfoLabel>
      <div className="flex flex-col" style={{ gap: 10 }}>
        {families.map((fam, i) => (
          <div key={fam.id || i}>
            {fam.side && <p style={{ fontFamily: F.serif, fontSize: 16, color: c.champagne, margin: '0 0 3px' }}>{fam.side}</p>}
            <p style={{ fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.7, color: 'rgba(244,239,230,.75)', margin: 0 }}>{fam.members.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const Informasi = ({ data, flags }) => {
  if (!flags.hasInfo) return null
  return (
    <div id="vo-info" className="vo-babak flex flex-col justify-center" style={{ boxSizing: 'border-box', padding: '86px 26px', gap: 14 }}>
      {flags.hasDresscode && <DresscodeBlock data={data} />}
      {flags.hasLive && <LiveStreamBlock data={data} />}
      {flags.hasGift && <GiftBlock data={data} />}
      {flags.hasFamilies && <FamiliesBlock data={data} />}
    </div>
  )
}

// ─── 8. RSVP & UCAPAN ────────────────────────────────────────────
const rsvpInputStyle = {
  padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(217,188,122,.28)',
  background: 'rgba(244,239,230,.06)', color: c.ivory, fontSize: 13, fontFamily: F.sans, outline: 'none', width: '100%',
}

const RsvpUcapan = ({ wishes, onSubmitWish }) => {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [attendance, setAttendance] = useState('hadir')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (busy || !name.trim() || !message.trim()) return
    setBusy(true)
    try {
      if (onSubmitWish) await onSubmitWish({ name, message, attendance })
      setName(''); setMessage(''); setAttendance('hadir')
    } finally {
      setBusy(false)
    }
  }

  const list = (wishes || []).slice(0, 6)
  const choiceStyle = (active) => ({
    flex: 1, padding: '10px 0', borderRadius: 999, textAlign: 'center', cursor: 'pointer',
    fontFamily: F.sans, fontSize: 10, letterSpacing: '2px',
    border: `1px solid ${active ? c.champagne : 'rgba(217,188,122,.3)'}`,
    background: active ? 'rgba(217,188,122,.18)' : 'transparent',
    color: active ? c.champagne : 'rgba(244,239,230,.7)',
  })

  return (
    <div id="vo-rsvp" className="vo-babak flex flex-col justify-center" style={{ boxSizing: 'border-box', padding: '86px 26px' }}>
      <form onSubmit={submit} className="flex flex-col" style={{
        gap: 10, padding: 22, borderRadius: 22, background: 'rgba(20,21,15,.5)',
        border: '1px solid rgba(217,188,122,.24)', backdropFilter: 'blur(12px)', marginBottom: 22,
      }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama kamu" required style={rsvpInputStyle} />
        <div className="flex" style={{ gap: 8 }}>
          {[['hadir', 'HADIR'], ['tidak_hadir', 'BERHALANGAN']].map(([v, label]) => (
            <div key={v} role="button" tabIndex={0} onClick={() => setAttendance(v)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setAttendance(v) }}
              style={choiceStyle(attendance === v)}>
              {label}
            </div>
          ))}
        </div>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Tuliskan doa dan ucapan..." required
          style={{ ...rsvpInputStyle, resize: 'none' }} />
        <button type="submit" disabled={busy}
          style={{
            marginTop: 4, padding: 13, borderRadius: 999, border: 'none',
            background: `linear-gradient(135deg, ${c.champagne}, ${c.champagneDeep})`,
            color: c.ink, fontFamily: F.sans, fontSize: 11, letterSpacing: '3px', cursor: 'pointer', opacity: busy ? 0.7 : 1,
          }}>
          {busy ? 'MENGIRIM…' : 'KIRIM UCAPAN'}
        </button>
      </form>

      {list.length > 0 && (
        <div className="flex flex-col" style={{ gap: 10, maxHeight: 190, overflowY: 'auto' }}>
          {list.map((w, i) => (
            <div key={w.id || i} style={{ padding: '14px 16px', borderRadius: 16, background: 'rgba(20,21,15,.42)', border: '1px solid rgba(217,188,122,.16)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 4 }}>
                <span style={{ fontFamily: F.serif, fontSize: 16, color: c.ivory }}>{w.name}</span>
                <span style={{ fontFamily: F.sans, fontSize: 10, color: w.rsvp === 'tidak_hadir' ? 'rgba(244,239,230,.45)' : c.champagne }}>
                  {w.rsvp === 'tidak_hadir' ? 'BERHALANGAN' : 'HADIR'}
                </span>
              </div>
              <p style={{ fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.65, color: 'rgba(244,239,230,.75)', margin: '0 0 4px' }}>{w.wish}</p>
              {w.time && <span style={{ fontFamily: F.sans, fontSize: 10, color: 'rgba(244,239,230,.4)' }}>{w.time}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 9. PENUTUP ──────────────────────────────────────────────────
const Penutup = ({ data, groomNick, brideNick, heroDate }) => {
  const footerPhoto = data?.meta?.footerPhoto
  return (
    <div id="vo-penutup" className="vo-babak flex flex-col items-center justify-center text-center" style={{ minHeight: '100%', boxSizing: 'border-box', padding: '64px 30px' }}>
      <div className="overflow-hidden flex items-center justify-center" style={{
        width: 180, height: 220, borderRadius: '110px 110px 16px 16px', border: '1px solid rgba(217,188,122,.3)',
        background: 'rgba(20,21,15,.5)', marginBottom: 26,
      }}>
        {footerPhoto
          ? <img src={footerPhoto} alt="" className="w-full h-full object-cover" />
          : <span style={{ fontFamily: F.sans, fontSize: 10, color: 'rgba(244,239,230,.5)' }}>Foto Penutup</span>}
      </div>

      <p style={{ fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.8, color: 'rgba(244,239,230,.75)', maxWidth: 330, margin: '0 0 26px' }}>
        Terima kasih atas doa dan restu yang telah diberikan. Kehadiran serta doa Bapak/Ibu/Saudara/i merupakan kebahagiaan dan kehormatan besar bagi kami.
      </p>

      <img src={A.ornamentDivider} alt="" style={{ width: 210, marginBottom: 22 }} />

      <h2 style={{ fontFamily: F.script, fontSize: 52, color: c.ivory, margin: '0 0 10px', lineHeight: 1 }}>{groomNick} &amp; {brideNick}</h2>
      <p style={{ fontFamily: F.serif, fontSize: 16, letterSpacing: '2px', color: 'rgba(244,239,230,.75)', margin: 0 }}>{heroDate}</p>
    </div>
  )
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────
export default function VelourOliveTheme({
  data, countdown, opened, setOpened,
  animateClose, setAnimateClose,
  musicPlaying, setMusicPlaying, audioRef,
  wishes, onSubmitWish, guestName,
}) {
  const [petals] = useState(() => genPetals(12))
  const [active, setActive] = useState(0)
  const scrollRef = useRef(null)
  const groomNick = data?.groom?.nickname || 'Mempelai Pria'
  const brideNick = data?.bride?.nickname || 'Mempelai Wanita'
  const primaryEvent = data?.events?.[0]
  const heroDate = primaryEvent?.dateLabel || fmtDate(primaryEvent?.date)
  const musicEnabled = data?.music !== false
  const flags = getBabakFlags(data)
  const babakList = getBabakList(data)
  const footerActive = babakList[active]?.id === 'vo-penutup'

  // Which babak is on screen. The old version divided scrollTop by the
  // scroller height, which silently assumed every babak is exactly one screen
  // tall. They are `min-height: 100%`, not `height`, so any babak whose
  // content overflows — two event cards, a long love story, the RSVP form
  // above its wish list — makes that division drift, and every dot below it
  // points at the wrong babak. Observing the real elements is correct at any
  // height, and it also stops running JS on every scroll frame.
  //
  // The -50%/-50% rootMargin collapses the scrollport to a single line across
  // its middle, so exactly one babak is ever intersecting: whichever one the
  // reader is actually looking at.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const nodes = Array.from(el.querySelectorAll('.vo-babak'))
    if (!nodes.length) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        const i = nodes.indexOf(e.target)
        if (i !== -1) setActive(i)
      })
    }, { root: el, rootMargin: '-50% 0px -50% 0px', threshold: 0 })
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
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
          0% { transform: translate3d(0,-40px,0); opacity: 0; }
          8% { opacity: .85; }
          88% { opacity: .85; }
          100% { transform: translate3d(var(--dx),calc(var(--inv-h) * 1.12),0); opacity: 0; }
        }
        /* Sideways drift, eased so the petal slows at each extreme the way a
           real one does as it changes direction. */
        @keyframes vo-drift {
          0%, 100% { transform: translate3d(calc(var(--sway) * -1),0,0); }
          50% { transform: translate3d(var(--sway),0,0); }
        }
        /* The independent rotate property, not transform:rotate(), so the spin
           composes with the drift above instead of replacing it. */
        @keyframes vo-spin { from { rotate: 0deg; } to { rotate: var(--rot); } }
        @keyframes vo-eq { 0%, 100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
        /* Cincin cahaya mempelai — the translate is restated in both stops so
           the rotation composes with the centring instead of discarding it. */
        @keyframes vo-ring {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to { transform: translate(-50%,-50%) rotate(360deg); }
        }
        /* Pantulan cahaya galeri — idle, one sweep, idle again. */
        @keyframes vo-sheen {
          0%, 58% { transform: translate3d(-135%,0,0) skewX(-12deg); opacity: 0; }
          64% { opacity: 1; }
          96%, 100% { transform: translate3d(135%,0,0) skewX(-12deg); opacity: 0; }
        }
        /* Tidak ada scroll-snap di sini, dan itu perubahan yang disengaja.
           Sebelumnya tiap babak setinggi satu layar penuh dan dikunci snap.
           Bentuknya rapi, tapi tamu jadi hanya pernah melihat satu hal pada
           satu waktu — hitung mundur, doa, dan mempelai tidak pernah bisa
           muncul bersama dalam satu bingkai seperti di tema-tema lain, dan
           undangan terasa ditelusuri satu per satu alih-alih dibaca.

           Sekarang babaknya setinggi isinya dan mengalir menyambung; hanya
           slide awal dan penutup yang mengambil satu layar penuh, karena
           keduanya memang momen yang berdiri sendiri. Rail titik tetap ada
           dan tetap bisa ditekan, jadi tamu tidak kehilangan cara melompat. */
      `}</style>

      <div id="top" className="relative w-full h-full overflow-hidden"
        style={{ fontFamily: F.sans, background: c.nightOlive, color: c.ivory }}>

        {musicEnabled && (
          <audio ref={audioRef} src={data?.musicUrl || MUSIC_URLS[data?.musicId || 1] || MUSIC_URLS[1]} loop />
        )}

        <VideoBackdrop footerActive={footerActive} />
        <Petals petals={petals} />

        <div ref={scrollRef} className="vo-scroll absolute inset-0 overflow-y-auto" style={{ zIndex: 10 }}>
          <SlideAwal groomNick={groomNick} brideNick={brideNick} heroDate={heroDate}
            countdown={countdown} countdownEnabled={data?.countdownEnabled ?? true} />
          <Quote data={data} />
          <Mempelai data={data} />
          <Acara data={data} />
          <LoveStory data={data} />
          <Galeri data={data} />
          <Informasi data={data} flags={flags} />
          <RsvpUcapan wishes={wishes} onSubmitWish={onSubmitWish} />
          <Penutup data={data} groomNick={groomNick} brideNick={brideNick} heroDate={heroDate} />
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
