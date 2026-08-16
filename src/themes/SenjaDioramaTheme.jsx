import { useState } from 'react'
import { motion } from 'framer-motion'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { THEMES } from '../config/constants'

// ═══════════════════════════════════════════════════════════════════
//  SENJA DIORAMA — kategori Motion (MOT-001)
//
//  Panggung berlapis: langit, siluet bukit, barisan pohon, dan dedaunan
//  depan bergerak dengan laju berbeda saat undangan digulir, sehingga
//  terbentuk kedalaman sungguhan — seperti panggung kertas berlapis.
//
//  Kenapa tanpa video sama sekali. Kategori Motion menggoda untuk diisi
//  video latar, dan itu persis yang membuat Velour Olive patah-patah: dua
//  loop 4,5MB men-decode bersamaan sepanjang sesi. Seluruh gerak di sini
//  dibuat dari `transform` dan `opacity` pada bentuk SVG dan gradien, yang
//  keduanya dikerjakan compositor. Nol byte aset, nol JavaScript per frame.
// ═══════════════════════════════════════════════════════════════════

// ─── PALETTE (senja: indigo pekat → plum → amber di kaki langit) ───
const c = {
  night:    '#1A1526',
  indigo:   '#2A2140',
  plum:     '#5B3A5B',
  ember:    '#C4703F',
  amber:    '#E8A87C',
  glow:     '#F6C89A',
  ivory:    '#F7F1E8',
  gold:     '#D9A441',
  goldSoft: '#EBC77E',
  muted:    'rgba(247,241,232,.68)',
  faint:    'rgba(247,241,232,.45)',
}

const F = {
  display: "'Fraunces', serif",
  script:  "'Italianno', cursive",
  sans:    "'Outfit', sans-serif",
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

// ─── SEEDED RNG ──────────────────────────────────────────────────
// Star positions are seeded once (§6.2): never Math.random() during render,
// or the sky reshuffles on every re-render and trips react-hooks/purity.
function seeded(n) {
  let s = 20261126 + n * 7919
  return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648 }
}
const genStars = () => {
  const rnd = seeded(5)
  return Array.from({ length: 38 }, (_, i) => ({
    id: i,
    x: (rnd() * 100).toFixed(1),
    // Upper two-thirds only — stars below the horizon would sit inside the hills.
    y: (rnd() * 62).toFixed(1),
    s: (0.9 + rnd() * 1.9).toFixed(1),
    t: (2.6 + rnd() * 4).toFixed(1),
    d: (rnd() * 6).toFixed(1),
  }))
}

// ═══════════════════════════════════════════════════════════════════
//  PANGGUNG — the parallax stage itself
// ═══════════════════════════════════════════════════════════════════

// Each layer declares how far it travels across the whole scroll. Negative
// values move up, so a bigger magnitude reads as nearer to the viewer:
// distant hills barely shift, foreground fronds race past.
//
// The shift is expressed against --inv-h (the shell's own height) rather than
// a percentage, because a percentage inside translate() resolves against the
// element's own box, not its container — the trap that once threw Velour
// Olive's petals clean out of frame.
const LAYERS = [
  { key: 'stars', shift: -0.06 },
  { key: 'hills', shift: -0.16 },
  { key: 'trees', shift: -0.34 },
  { key: 'front', shift: -0.62 },
]

const Stars = ({ stars }) => (
  <div className="absolute inset-0 pointer-events-none">
    {stars.map(st => (
      <div key={st.id} style={{
        position: 'absolute', left: `${st.x}%`, top: `${st.y}%`,
        width: Number(st.s), height: Number(st.s), borderRadius: '50%',
        background: c.glow, boxShadow: `0 0 ${Number(st.s) * 3}px ${c.goldSoft}`,
        animation: `sd-twinkle ${st.t}s ease-in-out ${st.d}s infinite`,
      }} />
    ))}
  </div>
)

// Silhouettes are drawn rather than shipped as PNGs. A parallax foreground
// needs real transparency between its leaves, and a flat raster would either
// need alpha (bigger files) or a blend-mode workaround that dies inside the
// backdrop-filter cards this theme uses. Paths have alpha for free.
const Hills = () => (
  <svg viewBox="0 0 480 220" preserveAspectRatio="none" className="absolute left-0 right-0 w-full"
    style={{ bottom: 0, height: '32%' }}>
    <path d="M0 210 L0 128 L58 92 L112 122 L168 74 L228 118 L286 86 L344 126 L402 96 L480 134 L480 210 Z"
      fill={c.indigo} opacity={0.85} />
    <path d="M0 210 L0 162 L64 138 L128 166 L196 132 L264 168 L330 142 L400 172 L480 150 L480 210 Z"
      fill={c.night} opacity={0.92} />
  </svg>
)

const Trees = () => {
  // One pine repeated at varying heights: cheaper than a bespoke path per
  // tree, and the irregular spacing keeps it from reading as wallpaper.
  const pines = [[18, 46], [62, 62], [104, 38], [152, 70], [206, 50], [258, 66], [312, 42], [360, 58], [414, 48], [458, 64]]
  return (
    <svg viewBox="0 0 480 120" preserveAspectRatio="none" className="absolute left-0 right-0 w-full"
      style={{ bottom: 0, height: '18%' }}>
      <rect x={0} y={104} width={480} height={16} fill={c.night} />
      {pines.map(([x, h], i) => (
        <path key={i} d={`M${x} 108 L${x - h * 0.34} 108 L${x} ${108 - h} L${x + h * 0.34} 108 Z`} fill={c.night} />
      ))}
    </svg>
  )
}

const Fronds = () => (
  <svg viewBox="0 0 480 300" preserveAspectRatio="none" className="absolute left-0 right-0 w-full"
    style={{ bottom: 0, height: '46%' }}>
    <g fill={c.night} opacity={0.95}>
      {/* Left frond, arcing in from the corner */}
      <path d="M-10 300 C 40 250, 70 190, 78 120 C 92 190, 120 246, 168 300 Z" />
      <path d="M-10 300 C 30 262, 44 224, 40 178 C 62 226, 92 266, 118 300 Z" opacity={0.8} />
      {/* Right frond */}
      <path d="M490 300 C 440 244, 412 186, 404 112 C 388 184, 358 242, 310 300 Z" />
      <path d="M490 300 C 452 258, 438 220, 442 172 C 420 222, 392 264, 366 300 Z" opacity={0.8} />
    </g>
  </svg>
)

const LAYER_NODE = { stars: Stars, hills: Hills, trees: Trees, front: Fronds }

// The stage sits behind every section and never scrolls away: it is `sticky`
// inside the scroller, so the layers stay on screen while their own scroll
// timeline slides them at different rates.
const Panggung = ({ stars }) => (
  <div className="sticky top-0 pointer-events-none" style={{ height: 0, zIndex: 0 }}>
    <div className="absolute left-0 right-0 overflow-hidden" style={{ top: 0, height: 'var(--inv-h)' }}>
      {/* Sky: the only layer that never moves — it is the far distance. */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(180deg, ${c.night} 0%, ${c.indigo} 26%, ${c.plum} 52%, ${c.ember} 78%, ${c.amber} 100%)`,
      }} />
      {/* Sun glow resting on the horizon. */}
      <div className="absolute" style={{
        left: '50%', bottom: '14%', width: 320, height: 320, transform: 'translateX(-50%)',
        borderRadius: '50%', background: `radial-gradient(circle, ${c.glow} 0%, rgba(246,200,154,.34) 38%, transparent 68%)`,
        animation: 'sd-breathe 9s ease-in-out infinite',
      }} />
      {LAYERS.map(({ key, shift }) => {
        const Node = LAYER_NODE[key]
        return (
          <div key={key} className="sd-layer absolute inset-0"
            style={{ '--sd-shift': `calc(var(--inv-h) * ${shift})` }}>
            <Node stars={stars} />
          </div>
        )
      })}
      {/* Scrim so ivory type stays readable over the brightest part of the sky. */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(180deg, rgba(26,21,38,.16) 0%, rgba(26,21,38,0) 34%, rgba(26,21,38,.42) 76%, rgba(26,21,38,.72) 100%)`,
      }} />
    </div>
  </div>
)

// ═══════════════════════════════════════════════════════════════════
//  PRIMITIVES
// ═══════════════════════════════════════════════════════════════════
const Kicker = ({ children, style = {} }) => (
  <p className="uppercase" style={{ margin: 0, fontFamily: F.sans, fontSize: 10, fontWeight: 400, letterSpacing: '.42em', color: c.goldSoft, ...style }}>{children}</p>
)

const Section = ({ id, children, style = {} }) => (
  <section id={id} className="relative" style={{ zIndex: 1, padding: '92px 28px', ...style }}>
    {children}
  </section>
)

// ─── 1. COVER ────────────────────────────────────────────────────
const Cover = ({ data, groomNick, brideNick, heroDate, guestName, handleOpen, animateClose }) => {
  const coverPhoto = data?.meta?.coverPhoto || data?.meta?.photo || data?.bride?.photo || data?.groom?.photo || null
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ zIndex: 80, padding: '56px 32px', background: `linear-gradient(180deg, ${c.night} 0%, ${c.indigo} 40%, ${c.plum} 74%, ${c.ember} 100%)` }}
      animate={animateClose ? { opacity: 0, scale: 1.06 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}>

      <motion.div className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.9 }}>
        <Kicker style={{ marginBottom: 22 }}>The Wedding Of</Kicker>

        {/* Arched portrait. §6.1: the photo is never scaled — it is rendered
            larger than its frame and only ever translated. */}
        <div className="relative overflow-hidden" style={{
          width: 186, height: 248, borderRadius: '93px 93px 20px 20px',
          border: `1px solid ${c.goldSoft}66`, background: c.indigo,
        }}>
          {coverPhoto
            ? <img src={coverPhoto} alt="" className="absolute object-cover"
                style={{ width: '114%', height: '114%', left: '-7%', top: '-7%', maxWidth: 'none', animation: 'sd-pan 22s ease-in-out infinite alternate' }} />
            : <span className="absolute inset-0 flex items-center justify-center" style={{ fontFamily: F.sans, fontSize: 11, color: c.faint }}>Foto</span>}
        </div>

        <h1 style={{ margin: '26px 0 0', fontFamily: F.script, fontSize: 62, lineHeight: 1, color: c.goldSoft }}>
          {groomNick} &amp; {brideNick}
        </h1>
        <p style={{ margin: '14px 0 0', fontFamily: F.display, fontSize: 15, letterSpacing: '.16em', color: c.ivory }}>{heroDate}</p>

        <div style={{ marginTop: 30, padding: '14px 24px', borderRadius: 18, background: 'rgba(26,21,38,.42)', border: `1px solid ${c.goldSoft}33`, backdropFilter: 'blur(10px)' }}>
          <Kicker style={{ fontSize: 9, letterSpacing: '.3em', color: c.faint }}>Kepada Yth.</Kicker>
          <p style={{ margin: '7px 0 0', fontFamily: F.display, fontSize: 19, color: c.ivory }}>{guestName}</p>
        </div>

        <motion.button onClick={handleOpen} whileTap={{ scale: 0.96 }}
          style={{
            marginTop: 28, padding: '14px 36px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${c.gold}, ${c.goldSoft})`, color: c.night,
            fontFamily: F.sans, fontSize: 11, fontWeight: 500, letterSpacing: '.26em', textTransform: 'uppercase',
            boxShadow: '0 14px 34px rgba(217,164,65,.32)',
          }}>
          Buka Undangan
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ─── 2. HERO ─────────────────────────────────────────────────────
const Hero = ({ data, groomNick, brideNick, heroDate, countdown, countdownEnabled }) => {
  const heroPhoto = data?.meta?.photo || data?.meta?.coverPhoto || data?.groom?.photo || data?.bride?.photo || null
  const parts = [['Hari', countdown?.d], ['Jam', countdown?.h], ['Menit', countdown?.m], ['Detik', countdown?.s]]
  return (
    <section id="sd-home" className="relative flex flex-col items-center justify-center text-center"
      style={{ zIndex: 1, minHeight: 'var(--inv-h)', boxSizing: 'border-box', padding: '96px 28px' }}>
      {heroPhoto && (
        <div className="relative overflow-hidden" style={{
          width: 'min(300px, 78%)', aspectRatio: '3/4', borderRadius: '150px 150px 22px 22px',
          border: `1px solid ${c.goldSoft}55`, boxShadow: '0 26px 60px rgba(26,21,38,.5)', marginBottom: 30,
        }}>
          <img src={heroPhoto} alt="" className="absolute object-cover"
            style={{ width: '112%', height: '112%', left: '-6%', top: '-6%', maxWidth: 'none', animation: 'sd-pan 26s ease-in-out infinite alternate' }} />
        </div>
      )}

      <Kicker>The Wedding Of</Kicker>
      <h1 style={{ margin: '14px 0 0', fontFamily: F.script, fontSize: 66, lineHeight: 1, color: c.ivory }}>
        {groomNick} &amp; {brideNick}
      </h1>
      <div style={{ width: 58, height: 1, background: c.gold, opacity: 0.7, margin: '18px 0' }} />
      <p style={{ margin: 0, fontFamily: F.display, fontSize: 16, letterSpacing: '.14em', color: c.goldSoft }}>{heroDate}</p>

      {countdownEnabled && (
        <div className="grid grid-cols-4" style={{ gap: 8, marginTop: 30, width: '100%', maxWidth: 320 }}>
          {parts.map(([label, val]) => (
            <div key={label} style={{
              borderRadius: 16, padding: '13px 4px 10px',
              background: 'rgba(26,21,38,.4)', border: `1px solid ${c.goldSoft}30`, backdropFilter: 'blur(8px)',
            }}>
              <div style={{ fontFamily: F.display, fontSize: 25, lineHeight: 1, color: c.ivory }}>{pad2(val)}</div>
              <div className="uppercase" style={{ marginTop: 5, fontFamily: F.sans, fontSize: 8.5, letterSpacing: '.2em', color: c.faint }}>{label}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════
export default function SenjaDioramaTheme({
  data, countdown, opened, setOpened,
  animateClose, setAnimateClose,
  // `musicPlaying` joins in the final part, with the equalizer button (§6.8).
  setMusicPlaying, audioRef,
  guestName,
}) {
  const [stars] = useState(genStars)
  // Separate from `opened` on purpose. The body mounts immediately, but the
  // cover has to stay mounted through its own fade — gating it on `!opened`
  // would unmount it in the same commit and the transition would never play.
  const [coverGone, setCoverGone] = useState(false)
  const groomNick = data?.groom?.nickname || 'Mempelai Pria'
  const brideNick = data?.bride?.nickname || 'Mempelai Wanita'
  const heroDate = data?.events?.[0]?.dateLabel || fmtDate(data?.events?.[0]?.date)
  const guest = guestName || 'Bapak/Ibu/Saudara/i'
  const musicEnabled = data?.music !== false

  const handleOpen = () => {
    if (animateClose) return
    setAnimateClose(true)
    // Mount the body immediately, underneath the still-opaque cover. Paying
    // the layout cost while nothing has moved yet is invisible; doing it at
    // the end of the transition drops frames exactly at the reveal.
    setOpened(true)
    if (audioRef?.current) setMusicPlaying(true)
    setTimeout(() => setCoverGone(true), 1200)
  }

  return (
    <InvitationLayout layout={THEMES.SENJA_DIORAMA} data={data}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Italianno&family=Outfit:wght@300;400;500&display=swap');
        @keyframes sd-twinkle { 0%, 100% { opacity: .2; } 50% { opacity: 1; } }
        @keyframes sd-breathe { 0%, 100% { opacity: .72; } 50% { opacity: 1; } }
        /* §6.1 — pan only, never scale: scaling a raster softens the photo. */
        @keyframes sd-pan {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-3.5%, -2.5%, 0); }
        }
        @keyframes sd-parallax {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(0, var(--sd-shift), 0); }
        }
        /* The whole parallax effect is opt-in on support. Where the browser
           lacks a scroll timeline the layers simply hold still and the scene
           stays a composed dusk illustration — degraded, never broken. No
           scroll listener anywhere, so nothing runs per frame either way. */
        @supports (animation-timeline: scroll()) {
          .sd-layer {
            animation: sd-parallax linear both;
            animation-timeline: scroll(nearest block);
          }
        }
      `}</style>

      <div id="top" className="w-full relative flex flex-col"
        style={{ fontFamily: F.sans, color: c.ivory, background: c.night, minHeight: 'var(--inv-h)' }}>

        {musicEnabled && (
          <audio ref={audioRef} src={data?.musicUrl || MUSIC_URLS[data?.musicId || 1] || MUSIC_URLS[1]} loop />
        )}

        <Panggung stars={stars} />

        {opened && (
          <div className="relative flex flex-col w-full" style={{ zIndex: 1 }}>
            <Hero data={data} groomNick={groomNick} brideNick={brideNick} heroDate={heroDate}
              countdown={countdown} countdownEnabled={data?.countdownEnabled ?? true} />

            {/* Bagian 2 dan seterusnya menyusul: Quote, Mempelai, Acara,
                Love Story, Galeri, Informasi, RSVP, Penutup. */}
            <Section id="sd-placeholder" style={{ paddingBottom: 140 }}>
              <p className="text-center" style={{ fontFamily: F.display, fontSize: 15, color: c.muted, margin: 0 }}>
                Bagian berikutnya sedang dibangun.
              </p>
            </Section>
          </div>
        )}

        {!coverGone && (
          <Cover data={data} groomNick={groomNick} brideNick={brideNick} heroDate={heroDate}
            guestName={guest} handleOpen={handleOpen} animateClose={animateClose} />
        )}
      </div>
    </InvitationLayout>
  )
}
