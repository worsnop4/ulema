import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, VolumeX, Calendar } from 'lucide-react'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { THEMES } from '../config/constants'

// ═══════════════════════════════════════════════════════════════════
//  AURUM NOIR — cinematic dark luxury (black + gold)
//  Recreated from the "Aurum Noir" design handoff as a bespoke theme
//  (motion too rich for BaseThemeEngine). Props + data-shape mirror
//  BordeauxLuxeTheme; all content is pulled from the real invitation data.
// ═══════════════════════════════════════════════════════════════════

// ─── PALETTE (design tokens from the handoff) ────────────────────
const c = {
  bg:         '#0a0807',
  bgAlt:      '#0d0a08',
  card:       '#14100c',
  cardAlt:    '#100d0a',
  gold:       '#d4a96a',
  goldBright: '#e9cd9a',
  goldSh1:    '#c39754',
  goldSh2:    '#e2bc7d',
  text:       '#f4ede2',
  text2:      '#d8cbb4',
  text3:      '#cdbfa9',
  body:       '#b3a690',
  muted:      '#9a8f80',
  faint:      '#6f6455',
  btnText:    '#171310',
  brd14:      'rgba(212,169,106,0.14)',
  brd22:      'rgba(212,169,106,0.22)',
  brd35:      'rgba(212,169,106,0.35)',
  brd40:      'rgba(212,169,106,0.40)',
  brd55:      'rgba(212,169,106,0.55)',
}

const F = {
  serif:  "'Cormorant Garamond', serif",
  script: "'Pinyon Script', cursive",
  sans:   "'Jost', sans-serif",
}

const shimmerBg = `linear-gradient(90deg, ${c.goldSh1}, ${c.goldSh2}, ${c.goldSh1})`

// Corner-radius scale — soften the otherwise very square containers.
const RAD = { card: 22, panel: 18, box: 14, img: 16, input: 12, pill: 999 }

// ─── DATE HELPERS ────────────────────────────────────────────────
const ID_DAYS = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const ID_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const fmtCoverDate = (s) => {
  if (!s) return 'Kamis, 26 November 2026'
  try {
    const d = new Date(s)
    return `${ID_DAYS[d.getDay()]} · ${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`
  } catch { return s }
}

const fmtEventDate = (s) => {
  if (!s) return { day: '26', mon: 'November', yr: '2026', dayName: 'Kamis' }
  try {
    const d = new Date(s)
    return {
      day: d.getDate().toString().padStart(2, '0'),
      mon: ID_MONTHS[d.getMonth()],
      yr: d.getFullYear().toString(),
      dayName: ID_DAYS[d.getDay()],
    }
  } catch { return { day: '26', mon: 'November', yr: '2026', dayName: 'Kamis' } }
}

// ─── SHARED PRIMITIVES ───────────────────────────────────────────
const Eyebrow = ({ children, style = {} }) => (
  <p className="font-sans uppercase" style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 600, letterSpacing: '0.45em', color: c.gold, ...style }}>
    {children}
  </p>
)

const Heading = ({ children, style = {} }) => (
  <h2 style={{ fontFamily: F.serif, fontWeight: 400, letterSpacing: '0.05em', color: c.text, ...style }}>
    {children}
  </h2>
)

const ShimmerLine = ({ width = 120 }) => (
  <div style={{ width, height: 1, background: `linear-gradient(90deg, transparent, ${c.gold}, transparent)`, backgroundSize: '200% 100%', animation: 'aurum-shimmer 3.5s linear infinite' }} />
)

const DiamondRule = () => (
  <div className="flex items-center justify-center gap-4 my-2">
    <div style={{ flex: 1, height: 1, maxWidth: 90, background: `linear-gradient(90deg, transparent, ${c.brd40})` }} />
    <span style={{ fontFamily: F.script, fontSize: 34, color: c.gold }}>&amp;</span>
    <div style={{ flex: 1, height: 1, maxWidth: 90, background: `linear-gradient(270deg, transparent, ${c.brd40})` }} />
  </div>
)

// Gold shimmer CTA button
const GoldButton = ({ children, onClick, style = {}, as = 'button', href }) => {
  const props = {
    onClick,
    className: 'inline-flex items-center justify-center gap-2',
    style: {
      padding: '15px 40px', border: 'none', cursor: 'pointer',
      background: shimmerBg, backgroundSize: '200% 100%', animation: 'aurum-shimmer 5s linear infinite',
      color: c.btnText, fontFamily: F.sans, fontSize: 10, fontWeight: 600, borderRadius: RAD.pill,
      letterSpacing: '0.32em', textTransform: 'uppercase', ...style,
    },
  }
  if (as === 'a') return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
  return <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} {...props}>{children}</motion.button>
}

// Outline (ghost) button
const GhostButton = ({ children, onClick, href, as = 'button', style = {} }) => {
  const base = {
    onClick,
    className: 'inline-flex items-center justify-center gap-2',
    style: {
      padding: '13px 34px', background: 'transparent', border: `1px solid ${c.brd55}`,
      color: c.goldBright, fontFamily: F.sans, fontSize: 10, fontWeight: 600, borderRadius: RAD.pill,
      letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .3s ease', ...style,
    },
  }
  if (as === 'a') return <a href={href} target="_blank" rel="noopener noreferrer" {...base}>{children}</a>
  return <button {...base}>{children}</button>
}

// ─── GOLD PARTICLES (seeded once per mount — lint-safe lazy init) ─
const Particles = ({ count = 18 }) => {
  const dots = useState(() => (
    [...Array(count)].map(() => ({
      left: Math.random() * 100,
      size: 2 + Math.random() * 3.5,
      delay: Math.random() * 16,
      dur: 11 + Math.random() * 13,
    }))
  ))[0]
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {dots.map((p, i) => (
        <motion.span key={i} className="absolute rounded-full"
          style={{ left: `${p.left}%`, bottom: -10, width: p.size, height: p.size, background: c.goldSh2, boxShadow: `0 0 ${p.size * 3}px ${c.goldSh2}` }}
          animate={{ y: [0, -560], opacity: [0, 0.85, 0.4, 0] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'linear' }} />
      ))}
    </div>
  )
}

// Ken Burns background image with a dark gradient scrim
const KenBurnsBg = ({ src, scrim }) => (
  <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
    {src
      // Rendered 116% of the frame (inset -8%) so a translate-only pan stays
      // within bounds. Panning (not scaling) means the raster is never
      // upscaled → the photo stays as sharp as a static background.
      ? <div className="absolute" style={{ inset: '-8%', animation: 'aurum-pan 28s ease-in-out infinite alternate' }}>
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>
      : <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 30%, #151009 0%, ${c.bg} 70%)` }} />}
    <div className="absolute inset-0 pointer-events-none" style={{ background: scrim }} />
  </div>
)

// Rotating dashed ring wrapper for circular photos
const RingPhoto = ({ src, size = 190, reverse = false, fallback = 'Foto' }) => (
  <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
    <div className="absolute rounded-full" style={{ inset: -12, border: `1px dashed ${c.brd35}`, animation: `aurum-spin 36s linear infinite${reverse ? ' reverse' : ''}` }} />
    <div className="rounded-full overflow-hidden" style={{ width: size, height: size, border: `1px solid ${c.brd40}` }}>
      {src
        ? <img src={src} alt="" className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center" style={{ background: c.card, color: c.muted, fontFamily: F.sans, fontSize: 11 }}>{fallback}</div>}
    </div>
  </div>
)

// ─── COVER (fullscreen overlay) ──────────────────────────────────
const Cover = ({ data, bride, groom, primaryEvent, guestName, handleOpen, animateClose }) => {
  const cover = data?.meta?.coverPhoto || data?.meta?.photo || data?.bride?.photo || data?.groom?.photo || null
  const mono = `${(groom || 'R').charAt(0)}${(bride || 'N').charAt(0)}`.toUpperCase()
  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ zIndex: 60, background: c.bg }}
      animate={animateClose ? { opacity: 0, scale: 1.14 } : { opacity: 1, scale: 1 }}
      transition={{ opacity: { duration: 1.3, ease: 'easeInOut' }, scale: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } }}>
      <KenBurnsBg src={cover} scrim={`linear-gradient(180deg, rgba(8,6,5,.72) 0%, rgba(8,6,5,.35) 42%, rgba(10,8,7,.94) 88%)`} />
      <Particles />
      <div className="relative h-full flex flex-col items-center justify-center text-center px-8" style={{ zIndex: 2 }}>
        {/* Monogram */}
        <div className="relative flex items-center justify-center mb-7" style={{ width: 110, height: 110 }}>
          <div className="absolute rounded-full" style={{ inset: 0, border: `1px dashed ${c.brd55}`, animation: 'aurum-spin 30s linear infinite' }} />
          <div className="absolute rounded-full" style={{ inset: 9, border: `1px solid ${c.brd35}` }} />
          <span style={{ fontFamily: F.script, fontSize: 36, color: c.goldBright }}>{mono}</span>
        </div>
        <Eyebrow style={{ letterSpacing: '0.5em', marginBottom: 12 }}>Wedding Invitation</Eyebrow>
        <h1 className="leading-tight" style={{ fontFamily: F.serif, fontWeight: 400, fontSize: 46, letterSpacing: '0.04em', color: c.text }}>
          {groom} <span style={{ fontFamily: F.script, fontSize: 38, color: c.gold }}>&amp;</span> {bride}
        </h1>
        <p className="uppercase" style={{ margin: '16px 0 30px', fontFamily: F.sans, fontSize: 10, letterSpacing: '0.35em', color: c.text3 }}>
          {fmtCoverDate(primaryEvent?.date)}
        </p>
        {guestName && (
          <div className="mb-8" style={{ border: `1px solid ${c.brd35}`, background: 'rgba(10,8,7,.55)', backdropFilter: 'blur(6px)', padding: '16px 34px', borderRadius: RAD.panel }}>
            <p className="uppercase" style={{ fontFamily: F.sans, fontSize: 8, fontWeight: 600, letterSpacing: '0.4em', color: c.muted, marginBottom: 4 }}>Kepada Yth.</p>
            <p style={{ fontFamily: F.serif, fontSize: 19, color: c.text }}>{guestName}</p>
          </div>
        )}
        <GoldButton onClick={handleOpen} style={{ padding: '16px 44px', letterSpacing: '0.34em' }}>Buka Undangan</GoldButton>
        <p className="uppercase" style={{ marginTop: 18, fontFamily: F.sans, fontSize: 8, letterSpacing: '0.35em', color: c.faint, animation: 'aurum-breathe 3s ease-in-out infinite' }}>Tap to open</p>
      </div>
    </motion.div>
  )
}

// ─── HERO ────────────────────────────────────────────────────────
const Hero = ({ data, bride, groom, primaryEvent, countdown }) => {
  // "Foto Slide Awal" (meta.photo) is the dedicated hero image from the
  // photo editor; fall back to the cover / couple photos only if unset.
  const bg = data?.meta?.photo || data?.meta?.coverPhoto || data?.bride?.photo || data?.groom?.photo || null
  const blocks = [
    { label: 'Hari', v: countdown?.d || 0 },
    { label: 'Jam', v: countdown?.h || 0 },
    { label: 'Menit', v: countdown?.m || 0 },
    { label: 'Detik', v: countdown?.s || 0 },
  ]
  const calUrl = primaryEvent?.date
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Pernikahan ${groom} & ${bride}`)}&dates=${primaryEvent.date.replace(/-/g, '')}T010000Z/${primaryEvent.date.replace(/-/g, '')}T070000Z`
    : null
  return (
    <section id="aurum-hero" className="relative flex flex-col justify-end items-center text-center overflow-hidden" style={{ minHeight: 'var(--inv-h)', padding: '0 28px 100px' }}>
      <KenBurnsBg src={bg} scrim={`linear-gradient(180deg, rgba(8,6,5,.6) 0%, rgba(8,6,5,.1) 38%, rgba(10,8,7,.9) 78%, ${c.bg} 98%)`} />
      <Particles />
      <div className="relative flex flex-col items-center" style={{ zIndex: 2 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} className="flex flex-col items-center">
          <Eyebrow style={{ fontSize: 10, marginBottom: 14 }}>The Wedding Of</Eyebrow>
          <h1 style={{ fontFamily: F.serif, fontWeight: 400, fontSize: 56, lineHeight: 1.05, letterSpacing: '0.04em', color: c.text }}>
            {groom} <span style={{ fontFamily: F.script, fontSize: 44, color: c.gold }}>&amp;</span> {bride}
          </h1>
          <p className="uppercase" style={{ margin: '18px 0 0', fontFamily: F.sans, fontSize: 11, letterSpacing: '0.35em', color: c.text3 }}>
            {fmtCoverDate(primaryEvent?.date)}
          </p>
          <div className="my-6"><ShimmerLine /></div>
        </motion.div>
        {/* Countdown flip */}
        <div className="flex gap-3 justify-center mb-8">
          {blocks.map((b) => (
            <div key={b.label} className="flex flex-col items-center gap-2">
              <div className="relative" style={{ width: 56, height: 62, perspective: 320 }}>
                <motion.div key={b.v} initial={{ rotateX: -90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 flex items-center justify-center overflow-hidden"
                  style={{ border: `1px solid ${c.brd35}`, background: 'linear-gradient(180deg,#1a1410 0%,#100c09 48%,#0c0a08 52%,#14100c 100%)', fontFamily: F.serif, fontSize: 28, fontWeight: 500, color: c.goldBright, transformOrigin: 'center bottom', backfaceVisibility: 'hidden', borderRadius: RAD.box }}>
                  {b.v.toString().padStart(2, '0')}
                </motion.div>
                <div className="absolute" style={{ left: 0, right: 0, top: '50%', height: 1, background: 'rgba(0,0,0,.5)', zIndex: 2 }} />
              </div>
              <span className="uppercase" style={{ fontFamily: F.sans, fontSize: 8, letterSpacing: '0.3em', color: c.muted }}>{b.label}</span>
            </div>
          ))}
        </div>
        {calUrl && (
          <GhostButton as="a" href={calUrl}><Calendar size={12} /> Save The Date</GhostButton>
        )}
      </div>
    </section>
  )
}

// ─── QUOTE ───────────────────────────────────────────────────────
const Quote = ({ data }) => {
  if (!data?.quote) return null
  return (
    <section className="text-center" style={{ padding: '88px 32px', background: c.bgAlt, borderTop: `1px solid ${c.brd14}`, borderBottom: `1px solid ${c.brd14}` }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.9 }} style={{ maxWidth: 360, margin: '0 auto' }}>
        <Eyebrow style={{ marginBottom: 18 }}>Verse</Eyebrow>
        <p style={{ fontFamily: F.serif, fontSize: 19, fontStyle: 'italic', fontWeight: 300, lineHeight: 1.75, color: c.text2 }}>
          &ldquo;{data.quote}&rdquo;
        </p>
        {data?.quoteSource && (
          <p className="uppercase" style={{ margin: '20px 0 0', fontFamily: F.sans, fontSize: 10, letterSpacing: '0.3em', color: c.muted }}>{data.quoteSource}</p>
        )}
      </motion.div>
    </section>
  )
}

// ─── COUPLE ──────────────────────────────────────────────────────
const Couple = ({ data }) => {
  const person = (p, label, reverse) => (
    <motion.div className="text-center flex flex-col items-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.7 }}>
      <div className="mb-6"><RingPhoto src={p?.photo} reverse={reverse} /></div>
      <Eyebrow style={{ color: c.muted, marginBottom: 10 }}>{label}</Eyebrow>
      <h3 style={{ fontFamily: F.serif, fontWeight: 500, fontSize: 28, letterSpacing: '0.04em', color: c.text, marginBottom: 16 }}>{p?.name || p?.nickname || '—'}</h3>
      <p className="uppercase" style={{ fontFamily: F.sans, fontSize: 10, letterSpacing: '0.2em', color: c.muted, marginBottom: 4 }}>Putra/Putri dari</p>
      <p style={{ fontFamily: F.sans, fontSize: 13, color: c.text2, lineHeight: 1.7 }}>
        Bapak {p?.father || '—'}<br />&amp; Ibu {p?.mother || '—'}
      </p>
      {p?.instagram && (
        <a href={`https://instagram.com/${p.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="uppercase" style={{ marginTop: 18, fontFamily: F.sans, fontSize: 9, letterSpacing: '0.3em', color: c.goldBright, borderBottom: `1px solid ${c.brd40}`, paddingBottom: 3 }}>
          @{p.instagram.replace('@', '')}
        </a>
      )}
    </motion.div>
  )
  return (
    <section className="relative overflow-hidden" style={{ padding: '96px 28px', background: c.bg }}>
      {/* Gold bubble effect (like the footer) — framed at the top and bottom */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: '42%' }}><Particles count={10} /></div>
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '42%' }}><Particles count={10} /></div>
      <div className="relative" style={{ zIndex: 2 }}>
        <div className="text-center flex flex-col items-center" style={{ marginBottom: 56 }}>
          <Eyebrow style={{ marginBottom: 14 }}>The Couple</Eyebrow>
          <Heading style={{ fontSize: 34 }}>Dua Insan Bersatu</Heading>
        </div>
        <div className="flex flex-col gap-14" style={{ maxWidth: 360, margin: '0 auto' }}>
          {person(data?.groom, 'The Groom', false)}
          <DiamondRule />
          {person(data?.bride, 'The Bride', true)}
        </div>
      </div>
    </section>
  )
}

// ─── EVENTS (tabbed akad / resepsi) ──────────────────────────────
const Events = ({ akad, resepsi }) => {
  const list = [akad, resepsi].filter(Boolean)
  const [tab, setTab] = useState(0)
  if (!list.length) return null
  const ev = list[tab] || list[0]
  const { day, mon, yr, dayName } = fmtEventDate(ev.date)
  const timeStr = [ev.start, ev.end].filter(Boolean).join(' – ')
  return (
    <section className="relative overflow-hidden" style={{ padding: '96px 28px', background: c.bgAlt, borderTop: `1px solid ${c.brd14}`, borderBottom: `1px solid ${c.brd14}` }}>
      <div className="text-center flex flex-col items-center" style={{ marginBottom: 40 }}>
        <Eyebrow style={{ marginBottom: 14 }}>Schedule</Eyebrow>
        <Heading style={{ fontSize: 34 }}>Rangkaian Acara</Heading>
      </div>
      {list.length > 1 && (
        <div className="flex justify-center gap-8" style={{ marginBottom: 36 }}>
          {list.map((e, i) => (
            <button key={e.id || i} onClick={() => setTab(i)} className="uppercase"
              style={{ background: 'none', border: 'none', padding: '0 2px 10px', cursor: 'pointer', fontFamily: F.sans, fontSize: 10, fontWeight: 600, letterSpacing: '0.3em', color: tab === i ? c.goldBright : c.faint, borderBottom: tab === i ? `1px solid ${c.gold}` : '1px solid transparent', transition: 'all .3s ease' }}>
              {e.name || `Acara ${i + 1}`}
            </button>
          ))}
        </div>
      )}
      <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="text-center" style={{ maxWidth: 340, margin: '0 auto', border: `1px solid ${c.brd22}`, background: `linear-gradient(180deg, ${c.card}, ${c.bgAlt})`, padding: '44px 30px', borderRadius: RAD.card }}>
        <Eyebrow style={{ color: c.gold, marginBottom: 20 }}>{ev.name || 'Acara'}</Eyebrow>
        <p className="uppercase" style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: '0.3em', color: c.text3 }}>{dayName}</p>
        <p style={{ margin: '2px 0', fontFamily: F.serif, fontWeight: 300, fontSize: 78, lineHeight: 1, color: c.goldBright }}>{day}</p>
        <p className="uppercase" style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: '0.3em', color: c.text3 }}>{mon} {yr}</p>
        {timeStr && <p style={{ margin: '18px 0 0', fontFamily: F.sans, fontSize: 13, fontWeight: 500, color: c.text }}>{timeStr}{ev.tz ? ` ${ev.tz}` : ''}</p>}
        <div style={{ width: 60, height: 1, background: c.brd40, margin: '26px auto' }} />
        <Eyebrow style={{ color: c.muted, marginBottom: 6 }}>Venue</Eyebrow>
        <p style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 500, color: c.text, marginBottom: 4 }}>{ev.venue || '—'}</p>
        {ev.address && <p style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 300, color: c.body, lineHeight: 1.6, marginBottom: 26 }}>{ev.address}</p>}
        {ev.maps && (
          <GhostButton as="a" href={ev.maps} style={{ display: 'flex', width: '100%', padding: '13px 0' }}><MapPin size={11} /> Petunjuk Arah</GhostButton>
        )}
      </motion.div>
    </section>
  )
}

// ─── LOVE STORY (timeline) ───────────────────────────────────────
const LoveStory = ({ data }) => {
  const stories = data?.loveStory || []
  if (!stories.length) return null
  return (
    <section style={{ padding: '96px 28px', background: c.bg }}>
      <div className="text-center flex flex-col items-center" style={{ marginBottom: 56 }}>
        <Eyebrow style={{ marginBottom: 14 }}>Journey</Eyebrow>
        <Heading style={{ fontSize: 34 }}>Perjalanan Cinta</Heading>
      </div>
      <div className="relative" style={{ maxWidth: 360, margin: '0 auto', paddingLeft: 28 }}>
        <div className="absolute" style={{ left: 5, top: 8, bottom: 8, width: 1, background: `linear-gradient(180deg, transparent, ${c.brd40} 12%, ${c.brd40} 88%, transparent)` }} />
        <div className="flex flex-col gap-9">
          {stories.map((s, i) => (
            <motion.div key={s.id || i} className="relative" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.7 }}>
              <div className="absolute rotate-45" style={{ left: -27, top: 8, width: 9, height: 9, background: i === stories.length - 1 ? c.gold : c.bg, border: `1px solid ${c.gold}` }} />
              {(s.year || s.title) && (
                <p className="uppercase" style={{ marginBottom: 6, fontFamily: F.sans, fontSize: 10, letterSpacing: '0.35em', color: c.gold }}>
                  {[s.year, s.title].filter(Boolean).join(' — ')}
                </p>
              )}
              {s.photo && (
                <div className="overflow-hidden mb-3" style={{ borderRadius: RAD.img, border: `1px solid ${c.brd22}` }}>
                  <img src={s.photo} alt={s.title || ''} className="w-full object-cover" style={{ aspectRatio: '3 / 2' }} />
                </div>
              )}
              <p style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 300, color: c.body, lineHeight: 1.75 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── DRESSCODE (optional) ────────────────────────────────────────
const Dresscode = ({ data }) => {
  const dc = data?.dresscode
  if (!dc || !dc.name) return null
  return (
    <section className="text-center" style={{ padding: '88px 28px', background: c.bgAlt, borderTop: `1px solid ${c.brd14}`, borderBottom: `1px solid ${c.brd14}` }}>
      <div style={{ maxWidth: 320, margin: '0 auto' }} className="flex flex-col items-center">
        <Eyebrow style={{ marginBottom: 14 }}>Dress Code</Eyebrow>
        <h3 style={{ fontFamily: F.serif, fontWeight: 400, fontSize: 26, color: c.text, marginBottom: 20 }}>{dc.name}</h3>
        {dc.color && (
          <div className="rounded-full" style={{ width: 44, height: 44, background: dc.color, border: `1px solid ${c.brd40}`, boxShadow: `0 0 0 6px rgba(212,169,106,0.06)`, marginBottom: 22 }} />
        )}
        {dc.notes && <p style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 300, color: c.body, lineHeight: 1.7 }}>{dc.notes}</p>}
      </div>
    </section>
  )
}

// ─── GALLERY ─────────────────────────────────────────────────────
const Gallery = ({ data }) => {
  const photos = (data?.gallery || []).map(ph => (typeof ph === 'string' ? ph : ph?.src)).filter(Boolean)
  if (!photos.length) return null
  return (
    <section style={{ padding: '96px 20px', background: c.bg }}>
      <div className="text-center flex flex-col items-center" style={{ marginBottom: 44 }}>
        <Eyebrow style={{ marginBottom: 14 }}>Gallery</Eyebrow>
        <Heading style={{ fontSize: 34 }}>Momen Bersama</Heading>
      </div>
      <div className="grid grid-cols-2 gap-2.5" style={{ maxWidth: 420, margin: '0 auto' }}>
        {photos.map((src, i) => (
          <motion.div key={i} className={`relative overflow-hidden ${i === 0 ? 'col-span-2' : ''}`}
            style={{ aspectRatio: i === 0 ? '16 / 10' : '1', border: `1px solid ${c.brd14}`, borderRadius: RAD.img }}
            initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: (i % 4) * 0.05 }}>
            <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─── RSVP + WISHES ───────────────────────────────────────────────
const WishRsvp = ({ data, wishes, onSubmitWish }) => {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [att, setAtt] = useState('hadir')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    if (busy || !name.trim()) return
    setBusy(true)
    try {
      if (onSubmitWish) await onSubmitWish({ name, message: msg, attendance: att })
      setName(''); setMsg(''); setAtt('hadir')
    } finally { setBusy(false) }
  }
  const list = (wishes || data?.rsvps || []).slice(0, 5)
  const inputStyle = { width: '100%', boxSizing: 'border-box', background: c.bg, border: `1px solid ${c.brd22}`, color: c.text, padding: '13px 14px', fontSize: 13, fontFamily: F.sans, outline: 'none', borderRadius: RAD.input }
  return (
    <section id="aurum-rsvp" style={{ padding: '96px 28px', background: c.bgAlt, borderTop: `1px solid ${c.brd14}`, borderBottom: `1px solid ${c.brd14}` }}>
      <div className="text-center flex flex-col items-center" style={{ marginBottom: 44 }}>
        <Eyebrow style={{ marginBottom: 14 }}>RSVP</Eyebrow>
        <Heading style={{ fontSize: 34 }}>Konfirmasi &amp; Ucapan</Heading>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4" style={{ maxWidth: 360, margin: '0 auto', border: `1px solid ${c.brd22}`, background: c.card, padding: 28, borderRadius: RAD.card }}>
        <div>
          <label className="block uppercase" style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 600, letterSpacing: '0.35em', color: c.muted, marginBottom: 8 }}>Nama Lengkap</label>
          <input value={name} onChange={e => setName(e.target.value)} required placeholder="Masukkan nama Anda..." style={inputStyle} />
        </div>
        <div>
          <label className="block uppercase" style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 600, letterSpacing: '0.35em', color: c.muted, marginBottom: 8 }}>Kehadiran</label>
          <div className="grid grid-cols-2 gap-2.5">
            {[['hadir', 'Hadir'], ['tidak_hadir', 'Berhalangan']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setAtt(v)} className="uppercase"
                style={{ padding: '12px 0', cursor: 'pointer', fontFamily: F.sans, fontSize: 9, fontWeight: 600, letterSpacing: '0.25em', border: `1px solid ${c.brd55}`, background: att === v ? c.gold : 'transparent', color: att === v ? c.btnText : c.text3, transition: 'all .3s ease', borderRadius: RAD.pill }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block uppercase" style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 600, letterSpacing: '0.35em', color: c.muted, marginBottom: 8 }}>Ucapan &amp; Doa</label>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3} placeholder="Tulis doa terbaikmu untuk kami..." style={{ ...inputStyle, resize: 'none' }} />
        </div>
        <GoldButton onClick={undefined} style={{ padding: '15px 0', width: '100%' }}>{busy ? 'Mengirim…' : 'Kirim Konfirmasi'}</GoldButton>
      </form>
      {list.length > 0 && (
        <div className="flex flex-col gap-3" style={{ maxWidth: 360, margin: '36px auto 0' }}>
          <Eyebrow style={{ color: c.muted, marginBottom: 4 }}>Ucapan Tamu ({list.length})</Eyebrow>
          {list.map((w, i) => (
            <motion.div key={w.id || i} className="flex gap-3.5" style={{ border: `1px solid ${c.brd14}`, background: c.cardAlt, padding: '16px 18px', borderRadius: RAD.img }}
              initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <div className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 34, height: 34, border: `1px solid ${c.brd40}`, fontFamily: F.serif, fontSize: 16, color: c.goldBright }}>
                {(w.name || '?').charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="flex items-baseline gap-2.5 flex-wrap" style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 500, color: c.text }}>{w.name}</span>
                  {w.rsvp && <span className="uppercase" style={{ fontFamily: F.sans, fontSize: 8, letterSpacing: '0.25em', color: c.gold }}>{w.rsvp === 'hadir' ? 'Hadir' : 'Berhalangan'}</span>}
                </div>
                <p style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 300, fontStyle: 'italic', color: c.body, lineHeight: 1.6 }}>&ldquo;{w.message || w.wish}&rdquo;</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── GIFT ────────────────────────────────────────────────────────
const Gift = ({ data }) => {
  const [open, setOpen] = useState(false)
  const { copiedKey, copy } = useCopyToClipboard()
  const accounts = data?.accounts || []
  if (!accounts.length) return null
  return (
    <section id="aurum-gift" style={{ padding: '96px 28px', background: c.bg }}>
      <div className="text-center flex flex-col items-center" style={{ marginBottom: 32 }}>
        <Eyebrow style={{ marginBottom: 14 }}>Gifts</Eyebrow>
        <Heading style={{ fontSize: 34, marginBottom: 14 }}>Tanda Kasih</Heading>
        <p style={{ maxWidth: 320, fontFamily: F.sans, fontSize: 12, fontWeight: 300, color: c.body, lineHeight: 1.7 }}>
          Bagi yang ingin memberikan hadiah, berikut informasi rekening kami.
        </p>
      </div>
      <div className="flex justify-center" style={{ marginBottom: 22 }}>
        <GhostButton onClick={() => setOpen(v => !v)}>{open ? 'Sembunyikan Detail' : 'Lihat Detail Hadiah'}</GhostButton>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden flex flex-col gap-3" style={{ maxWidth: 360, margin: '0 auto' }}>
            {accounts.map((acc, i) => {
              const key = acc.id || acc.number || i
              return (
                <div key={key} className="flex items-center gap-4" style={{ border: `1px solid ${c.brd22}`, background: `linear-gradient(135deg, #17120d, ${c.bgAlt})`, padding: 22, borderRadius: RAD.panel }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className="uppercase" style={{ fontFamily: F.sans, fontSize: 10, letterSpacing: '0.3em', color: c.gold, marginBottom: 2 }}>{acc.bank}</p>
                    <p style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 300, color: c.muted, marginBottom: 6 }}>a.n. {acc.holder}</p>
                    <p style={{ fontFamily: F.serif, fontSize: 20, letterSpacing: '0.12em', color: c.text }}>{acc.number}</p>
                  </div>
                  <button onClick={() => copy(acc.number, key)} className="flex-shrink-0 uppercase"
                    style={{ padding: '9px 14px', cursor: 'pointer', fontFamily: F.sans, fontSize: 8, fontWeight: 600, letterSpacing: '0.25em', border: `1px solid ${c.brd55}`, background: copiedKey === key ? c.gold : 'transparent', color: copiedKey === key ? c.btnText : c.goldBright, transition: 'all .3s ease', borderRadius: RAD.pill }}>
                    {copiedKey === key ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// ─── LIVE STREAMING (optional) ───────────────────────────────────
const LiveStream = ({ data }) => {
  const platforms = data?.livestreamEnabled ? (data?.livestreamPlatforms || []).filter(p => p.url) : []
  if (!platforms.length) return null
  return (
    <section style={{ padding: '96px 28px', background: c.bgAlt, borderTop: `1px solid ${c.brd14}`, borderBottom: `1px solid ${c.brd14}` }}>
      <div className="text-center flex flex-col items-center" style={{ marginBottom: 32 }}>
        <Eyebrow style={{ marginBottom: 14 }}>Live Streaming</Eyebrow>
        <Heading style={{ fontSize: 34 }}>Saksikan Bersama</Heading>
        <p style={{ maxWidth: 300, marginTop: 14, fontFamily: F.sans, fontSize: 12, fontWeight: 300, color: c.body, lineHeight: 1.7 }}>Bagi yang berhalangan hadir, saksikan momen bahagia kami secara langsung.</p>
      </div>
      <div className="flex flex-col items-center gap-3">
        {platforms.map((p, i) => (<GhostButton key={i} as="a" href={p.url}>{p.type || 'Tonton Live'}</GhostButton>))}
      </div>
    </section>
  )
}

// ─── TURUT MENGUNDANG (optional) ─────────────────────────────────
const TurutMengundang = ({ data }) => {
  if (!data?.turutMengundangEnabled) return null
  const families = (data?.families || []).map(f => ({ ...f, members: (f.members || []).filter(m => m && m.trim()) })).filter(f => f.members.length)
  if (!families.length) return null
  return (
    <section style={{ padding: '96px 28px', background: c.bg }}>
      <div className="text-center flex flex-col items-center" style={{ marginBottom: 40 }}>
        <Eyebrow style={{ marginBottom: 14 }}>Turut Mengundang</Eyebrow>
        <Heading style={{ fontSize: 34 }}>Keluarga Besar</Heading>
      </div>
      <div className="flex flex-col gap-8" style={{ maxWidth: 340, margin: '0 auto' }}>
        {families.map((fam, i) => (
          <div key={fam.id || i} className="text-center">
            {fam.side && <p style={{ fontFamily: F.serif, fontSize: 20, color: c.goldBright, marginBottom: 10 }}>{fam.side}</p>}
            {fam.members.map((m, j) => (<p key={j} style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 300, color: c.text2, lineHeight: 1.9 }}>{m}</p>))}
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────────
const Footer = ({ bride, groom, primaryEvent, footerPhoto }) => (
  <footer className="relative text-center overflow-hidden" style={{ padding: '96px 28px 140px', borderTop: `1px solid ${c.brd14}`, background: `radial-gradient(circle at 50% 0%, ${c.card} 0%, ${c.bg} 65%)` }}>
    <Particles count={12} />
    <div className="relative flex flex-col items-center" style={{ zIndex: 2, maxWidth: 340, margin: '0 auto' }}>
      {footerPhoto && (
        <div className="rounded-full overflow-hidden" style={{ width: 128, height: 128, border: `1px solid ${c.brd40}`, marginBottom: 30 }}>
          <img src={footerPhoto} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <p style={{ fontFamily: F.script, fontSize: 52, color: c.goldBright, lineHeight: 1.2, marginBottom: 6 }}>{groom} &amp; {bride}</p>
      <p className="uppercase" style={{ fontFamily: F.sans, fontSize: 10, letterSpacing: '0.35em', color: c.muted, marginBottom: 28 }}>{fmtCoverDate(primaryEvent?.date)}</p>
      <p style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 300, color: c.body, lineHeight: 1.8, marginBottom: 32 }}>
        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
      </p>
      <div style={{ width: 60, height: 1, background: c.brd40, marginBottom: 24 }} />
      <p className="uppercase" style={{ fontFamily: F.sans, fontSize: 8, letterSpacing: '0.35em', color: c.faint }}>
        Created with love by <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 12, letterSpacing: '0.1em', color: c.muted }}>ulema</span>
      </p>
    </div>
  </footer>
)

// ─── BOTTOM NAV + MUSIC ──────────────────────────────────────────
const scrollToId = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const BottomNav = () => {
  const items = [
    ['Home', 'aurum-hero'], ['Couple', 'aurum-couple'], ['Acara', 'aurum-acara'],
    ['Galeri', 'aurum-galeri'], ['RSVP', 'aurum-rsvp'], ['Hadiah', 'aurum-gift'],
  ]
  return (
    <nav className="fixed md:absolute left-1/2 -translate-x-1/2 flex gap-1" style={{ bottom: 16, zIndex: 40, background: 'rgba(10,8,7,.82)', backdropFilter: 'blur(10px)', border: `1px solid ${c.brd22}`, borderRadius: 999, padding: '8px 10px' }}>
      {items.map(([label, id]) => (
        <button key={id} onClick={() => scrollToId(id)} className="uppercase"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text3, fontFamily: F.sans, fontSize: 8, fontWeight: 600, letterSpacing: '0.18em', padding: '6px 8px' }}>
          {label}
        </button>
      ))}
    </nav>
  )
}

const EqIcon = ({ playing }) => (
  <div className="flex items-end gap-0.5" style={{ height: 16 }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{ width: 3, height: 16, background: c.goldSh2, transformOrigin: 'bottom', animation: playing ? `aurum-eq ${0.8 + i * 0.22}s ease-in-out infinite` : 'none', transform: playing ? undefined : 'scaleY(.25)', transition: 'transform .3s ease' }} />
    ))}
  </div>
)

// ═══════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════
export default function AurumNoirTheme({
  data, countdown, opened, setOpened,
  animateClose, setAnimateClose,
  musicPlaying, setMusicPlaying, audioRef,
  wishes, onSubmitWish, guestName,
}) {
  const groom = data?.groom?.nickname || 'Raka'
  const bride = data?.bride?.nickname || 'Nadia'
  const akad = data?.events?.[0]
  const resepsi = data?.events?.[1]
  const primary = akad || {}

  const handleOpen = () => {
    setAnimateClose(true)
    setTimeout(() => {
      setOpened(true)
      if (audioRef?.current) setMusicPlaying(true)
    }, 1450)
  }

  return (
    <InvitationLayout layout={THEMES.AURUM_NOIR} data={data} bgUrl="">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Pinyon+Script&family=Jost:wght@200;300;400;500;600&display=swap');
        @keyframes aurum-pan { 0% { transform: translate(0,0) } 100% { transform: translate(-4%,-3%) } }
        @keyframes aurum-spin { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }
        @keyframes aurum-shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
        @keyframes aurum-breathe { 0%,100% { opacity: .5; transform: scale(1) } 50% { opacity: 1; transform: scale(1.06) } }
        @keyframes aurum-eq { 0%,100% { transform: scaleY(.3) } 50% { transform: scaleY(1) } }
      `}</style>

      <div className="w-full relative h-full flex flex-col overflow-x-hidden" style={{ fontFamily: F.sans, color: c.text, background: c.bg }}>
        {/* Audio */}
        {data?.music !== false && (
          <audio ref={audioRef} src={data?.musicUrl || MUSIC_URLS[data?.musicId || 1] || MUSIC_URLS[1]} loop />
        )}

        {/* Cover overlay */}
        <AnimatePresence>
          {!opened && (
            <Cover key="cover" data={data} bride={bride} groom={groom} primaryEvent={primary} guestName={guestName} handleOpen={handleOpen} animateClose={animateClose} />
          )}
        </AnimatePresence>

        {/* Content */}
        {opened && (
          <motion.div className="flex flex-col w-full relative" style={{ zIndex: 1 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}>
            {data?.music !== false && (
              <button onClick={() => setMusicPlaying(!musicPlaying)} title="Musik"
                className="fixed md:absolute flex items-center justify-center" style={{ top: 20, right: 16, zIndex: 40, width: 44, height: 44, borderRadius: '50%', background: 'rgba(10,8,7,.7)', backdropFilter: 'blur(8px)', border: `1px solid ${c.brd40}`, cursor: 'pointer' }}>
                {musicPlaying ? <EqIcon playing /> : <VolumeX size={16} color={c.goldBright} />}
              </button>
            )}

            <Hero data={data} bride={bride} groom={groom} primaryEvent={primary} countdown={countdown} />
            <Quote data={data} />
            <div id="aurum-couple"><Couple data={data} /></div>
            <div id="aurum-acara"><Events akad={akad} resepsi={resepsi} /></div>
            <LoveStory data={data} />
            <Dresscode data={data} />
            <div id="aurum-galeri"><Gallery data={data} /></div>
            <WishRsvp data={data} wishes={wishes} onSubmitWish={onSubmitWish} />
            <Gift data={data} />
            <LiveStream data={data} />
            <TurutMengundang data={data} />
            <Footer bride={bride} groom={groom} primaryEvent={primary} footerPhoto={data?.meta?.footerPhoto} />

            <BottomNav />
          </motion.div>
        )}
      </div>
    </InvitationLayout>
  )
}
