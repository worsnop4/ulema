import { useState } from 'react'
import { motion } from 'framer-motion'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
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

const Title = ({ children, style = {} }) => (
  <h2 style={{ margin: '12px 0 0', fontFamily: F.display, fontWeight: 300, fontSize: 30, lineHeight: 1.2, color: c.ivory, ...style }}>{children}</h2>
)

const Reveal = ({ children, delay = 0, y = 22, className = '', style = {} }) => (
  <motion.div className={className} style={style}
    initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.85, delay, ease: [0.2, 0.7, 0.2, 1] }}>
    {children}
  </motion.div>
)

// Glass panel used by every content card, so the stage stays visible behind
// the copy instead of being boxed out by it.
const cardStyle = {
  borderRadius: 22, padding: 22,
  background: 'rgba(26,21,38,.44)', border: `1px solid ${c.goldSoft}2E`,
  backdropFilter: 'blur(12px)',
  boxShadow: '0 20px 46px rgba(26,21,38,.34)',
}

// Thin horizon rule — the recurring divider motif, echoing the skyline.
const Horizon = ({ width = 58, style = {} }) => (
  <div style={{ width, height: 1, background: `linear-gradient(90deg, transparent, ${c.gold}, transparent)`, opacity: 0.8, ...style }} />
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

// ─── 3. QUOTE / DOA ──────────────────────────────────────────────
const Quote = ({ data }) => {
  const quote = data?.quote
  if (!quote) return null
  return (
    <Section id="sd-quote">
      <Reveal className="flex flex-col items-center text-center">
        <Horizon width={44} style={{ marginBottom: 26 }} />
        <p style={{
          margin: 0, fontFamily: F.display, fontStyle: 'italic', fontWeight: 300,
          fontSize: 19, lineHeight: 1.9, color: c.ivory, textWrap: 'pretty', maxWidth: 340,
        }}>{quote}</p>
        <Horizon width={44} style={{ marginTop: 26 }} />
      </Reveal>
    </Section>
  )
}

// ─── 4. MEMPELAI ─────────────────────────────────────────────────
// The arch repeats the cover portrait's silhouette, so the two read as the
// same object seen twice rather than two unrelated frames.
const PersonCard = ({ person, delay }) => (
  <Reveal delay={delay} className="flex flex-col items-center text-center" style={cardStyle}>
    <div className="relative overflow-hidden" style={{
      width: 152, height: 200, borderRadius: '76px 76px 18px 18px',
      border: `1px solid ${c.goldSoft}55`, background: c.indigo,
    }}>
      {person?.photo
        ? <img src={person.photo} alt={person?.nickname || ''} className="absolute object-cover"
            style={{ width: '112%', height: '112%', left: '-6%', top: '-6%', maxWidth: 'none' }} />
        : <span className="absolute inset-0 flex items-center justify-center" style={{ fontFamily: F.sans, fontSize: 10, color: c.faint }}>Foto</span>}
    </div>

    <h3 style={{ margin: '18px 0 0', fontFamily: F.script, fontSize: 44, lineHeight: 1, color: c.goldSoft }}>
      {person?.nickname || '—'}
    </h3>
    <p style={{ margin: '6px 0 0', fontFamily: F.display, fontSize: 16, color: c.ivory }}>
      {person?.name || person?.nickname || '—'}
    </p>
    <p style={{ margin: '10px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.7, color: c.muted }}>
      Putra/Putri dari<br />
      {person?.father || '—'} &amp; {person?.mother || '—'}
    </p>

    {person?.instagram && (
      <a href={`https://instagram.com/${person.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
        style={{ marginTop: 12, fontFamily: F.sans, fontSize: 11.5, color: c.gold }}>
        @{person.instagram.replace('@', '')}
      </a>
    )}
  </Reveal>
)

const Mempelai = ({ data }) => (
  <Section id="sd-mempelai">
    <Reveal className="flex flex-col items-center text-center" style={{ marginBottom: 34 }}>
      <Kicker>Assalamualaikum Wr. Wb.</Kicker>
      <Title>Mempelai</Title>
      <p style={{ margin: '14px 0 0', fontFamily: F.sans, fontSize: 13, lineHeight: 1.8, color: c.muted, maxWidth: 320 }}>
        Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.
      </p>
    </Reveal>

    <div className="flex flex-col items-center" style={{ gap: 18 }}>
      <PersonCard person={data?.groom} delay={0} />
      <span style={{ fontFamily: F.script, fontSize: 42, lineHeight: 1, color: c.gold }}>&amp;</span>
      <PersonCard person={data?.bride} delay={0.08} />
    </div>
  </Section>
)

// ─── 5. ACARA ────────────────────────────────────────────────────
// Field names follow §3 of the design guide: name / date / dateLabel /
// start / end / tz / venue / address / maps. Explicitly NOT title, time,
// location or mapUrl — those names appear nowhere in stored data, and the
// guide carries a warning about them for exactly that reason.
const EventCard = ({ ev, delay }) => {
  if (!ev) return null
  const dateLabel = ev.dateLabel || fmtDate(ev.date)
  const hours = [ev.start, ev.end].filter(Boolean).join(' – ')
  return (
    <Reveal delay={delay} className="text-center" style={cardStyle}>
      {ev.name && <Kicker>{ev.name}</Kicker>}
      {dateLabel && (
        <p style={{ margin: '12px 0 0', fontFamily: F.display, fontSize: 20, color: c.ivory }}>{dateLabel}</p>
      )}
      {hours && (
        <p style={{ margin: '8px 0 0', fontFamily: F.display, fontSize: 17, letterSpacing: '.06em', color: c.goldSoft }}>
          {hours}{ev.tz ? ` ${ev.tz}` : ''}
        </p>
      )}

      <Horizon width="72%" style={{ margin: '18px auto' }} />

      {ev.venue && (
        <p style={{ margin: 0, fontFamily: F.sans, fontSize: 14.5, fontWeight: 500, color: c.ivory }}>{ev.venue}</p>
      )}
      {ev.address && (
        <p style={{ margin: '6px auto 0', maxWidth: 250, fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.7, color: c.muted }}>{ev.address}</p>
      )}

      {ev.maps && (
        <a href={ev.maps} target="_blank" rel="noreferrer" className="inline-block"
          style={{
            marginTop: 18, padding: '10px 24px', borderRadius: 999,
            border: `1px solid ${c.gold}`, color: c.goldSoft,
            fontFamily: F.sans, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase',
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
    <Section id="sd-acara">
      <Reveal className="flex flex-col items-center text-center" style={{ marginBottom: 30 }}>
        <Kicker>Save The Date</Kicker>
        <Title>Rangkaian Acara</Title>
      </Reveal>
      <div className="flex flex-col" style={{ gap: 16 }}>
        {events.map((ev, i) => <EventCard key={ev?.id || i} ev={ev} delay={i * 0.08} />)}
      </div>
    </Section>
  )
}

// ─── 6. LOVE STORY (opsional) ────────────────────────────────────
// `year` is free text and is shown exactly as typed (§3). Feeding it to
// new Date() would turn "2019" into 1 Jan 2019 and swallow "Awal 2024"
// entirely — a bug that had to be undone in two other themes.
const LoveStory = ({ data }) => {
  const stories = data?.loveStory || []
  if (!stories.length) return null
  return (
    <Section id="sd-story">
      <Reveal className="flex flex-col items-center text-center" style={{ marginBottom: 30 }}>
        <Kicker>Perjalanan Kami</Kicker>
        <Title>Love Story</Title>
      </Reveal>

      <div className="relative">
        {/* The timeline spine, echoing the horizon rules elsewhere. */}
        <div className="absolute" style={{
          left: 21, top: 10, bottom: 10, width: 1,
          background: `linear-gradient(180deg, transparent, ${c.gold}88, transparent)`,
        }} />
        <div className="flex flex-col" style={{ gap: 16 }}>
          {stories.map((s, i) => (
            <Reveal key={s.id || i} delay={i * 0.06} className="relative flex" style={{ gap: 16 }}>
              <div className="flex-shrink-0 flex items-start justify-center" style={{ width: 42, paddingTop: 22 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: c.gold, boxShadow: `0 0 12px ${c.gold}` }} />
              </div>
              <div className="flex-1" style={{ ...cardStyle, padding: 18 }}>
                {s.year && <Kicker style={{ fontSize: 11, letterSpacing: '.24em' }}>{s.year}</Kicker>}
                {s.title && <p style={{ margin: '8px 0 0', fontFamily: F.display, fontSize: 17, color: c.ivory }}>{s.title}</p>}
                {s.desc && <p style={{ margin: '7px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.75, color: c.muted }}>{s.desc}</p>}
                {s.photo && (
                  <div className="overflow-hidden" style={{ marginTop: 12, borderRadius: 14, aspectRatio: '16/10' }}>
                    <img src={s.photo} alt="" className="w-full h-full object-cover" />
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
    <Section id="sd-galeri">
      <Reveal className="flex flex-col items-center text-center" style={{ marginBottom: 26 }}>
        <Kicker>Momen</Kicker>
        <Title>Galeri</Title>
      </Reveal>
      {/* Intrinsic sizing: measures this column, not the browser window, so
          the grid stays right inside the 480px shell as well as on a phone.
          The min(...,100%) floor is what stops a narrow screen overflowing. */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(132px, 100%), 1fr))', gap: 10 }}>
        {photos.map((src, i) => (
          <Reveal key={src} delay={(i % 4) * 0.05}>
            <div className="overflow-hidden" style={{ aspectRatio: '3/4', borderRadius: 16, border: `1px solid ${c.goldSoft}2E` }}>
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
    <Kicker style={{ fontSize: 9.5, letterSpacing: '.3em', color: c.faint }}>{label}</Kicker>
    <div style={{ marginTop: 12 }}>{children}</div>
  </Reveal>
)

const Dresscode = ({ dresscode }) => (
  <div className="flex items-center" style={{ gap: 14 }}>
    {dresscode.color && (
      <span className="flex-shrink-0" style={{
        width: 40, height: 40, borderRadius: '50%',
        background: dresscode.color, border: `1px solid ${c.goldSoft}66`,
      }} />
    )}
    <div style={{ minWidth: 0 }}>
      {dresscode.name && <p style={{ margin: 0, fontFamily: F.display, fontSize: 17, color: c.ivory }}>{dresscode.name}</p>}
      {dresscode.notes && <p style={{ margin: '4px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.7, color: c.muted }}>{dresscode.notes}</p>}
    </div>
  </div>
)

const Gift = ({ accounts, copiedKey, copy }) => (
  <div className="flex flex-col" style={{ gap: 12 }}>
    <p style={{ margin: 0, fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.7, color: c.muted }}>
      Doa restu Anda adalah hadiah terindah. Bila berkenan memberi tanda kasih, berikut informasinya.
    </p>
    {accounts.map((acc, i) => (
      <div key={acc.id || i} style={{ padding: '14px 16px', borderRadius: 16, background: 'rgba(247,241,232,.06)', border: `1px solid ${c.goldSoft}22` }}>
        {/* `bank` holds the e-wallet name too when type is 'ewallet' — one
            field for both, so never label it "Bank" unconditionally. */}
        <p style={{ margin: 0, fontFamily: F.sans, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: c.gold }}>
          {acc.bank || (acc.type === 'ewallet' ? 'E-Wallet' : 'Bank')}
        </p>
        <p style={{ margin: '8px 0 0', fontFamily: F.display, fontSize: 19, letterSpacing: '.06em', color: c.ivory }}>{acc.number || '—'}</p>
        {acc.holder && <p style={{ margin: '4px 0 0', fontFamily: F.sans, fontSize: 12.5, color: c.muted }}>a.n. {acc.holder}</p>}
        {acc.number && (
          <button onClick={() => copy(acc.number, acc.id || i)}
            style={{
              marginTop: 12, padding: '8px 18px', borderRadius: 999, cursor: 'pointer',
              background: 'transparent', border: `1px solid ${c.gold}`, color: c.goldSoft,
              fontFamily: F.sans, fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase',
            }}>
            {copiedKey === (acc.id || i) ? 'Tersalin' : 'Salin'}
          </button>
        )}
      </div>
    ))}
  </div>
)

const Informasi = ({ data }) => {
  const { copiedKey, copy } = useCopyToClipboard()
  const dresscode = data?.dresscode || {}
  const hasDresscode = Boolean(dresscode.name || dresscode.color || dresscode.notes)
  const live = Boolean(data?.livestreamEnabled) && (data?.livestreamPlatforms || []).filter(p => p?.url)
  const hasLive = Boolean(live && live.length)
  const accounts = data?.accounts || []
  const families = (data?.families || [])
    .map(f => ({ ...f, members: (f.members || []).filter(m => m && m.trim()) }))
    .filter(f => f.members.length)
  const hasFamilies = Boolean(data?.turutMengundangEnabled) && families.length > 0

  if (!hasDresscode && !hasLive && !accounts.length && !hasFamilies) return null

  return (
    <Section id="sd-info">
      <Reveal className="flex flex-col items-center text-center" style={{ marginBottom: 26 }}>
        <Kicker>Untuk Tamu</Kicker>
        <Title>Informasi</Title>
      </Reveal>

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
                  style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(247,241,232,.06)', border: `1px solid ${c.goldSoft}22` }}>
                  <span style={{ fontFamily: F.sans, fontSize: 13, color: c.ivory }}>{p.type || 'Siaran Langsung'}</span>
                  <span style={{ fontFamily: F.sans, fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase', color: c.gold }}>Tonton</span>
                </a>
              ))}
            </div>
          </InfoCard>
        )}

        {accounts.length > 0 && (
          <InfoCard label="Hadiah" delay={0.1}><Gift accounts={accounts} copiedKey={copiedKey} copy={copy} /></InfoCard>
        )}

        {hasFamilies && (
          <InfoCard label="Turut Mengundang" delay={0.15}>
            <div className="flex flex-col" style={{ gap: 14 }}>
              {families.map((fam, i) => (
                <div key={i}>
                  {fam.side && <p style={{ margin: 0, fontFamily: F.display, fontSize: 15, color: c.goldSoft }}>{fam.side}</p>}
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
// Stored wish shape, checked against live rows: { name, wish, rsvp, guests,
// time }. `rsvp` is 'hadir' or 'tidak_hadir' — note the underscore.
const fieldStyle = {
  width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 14,
  background: 'rgba(247,241,232,.07)', border: `1px solid ${c.goldSoft}2E`,
  color: c.ivory, fontFamily: F.sans, fontSize: 13.5, outline: 'none',
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
    <Section id="sd-rsvp">
      <Reveal className="flex flex-col items-center text-center" style={{ marginBottom: 26 }}>
        <Kicker>Konfirmasi Kehadiran</Kicker>
        <Title>RSVP &amp; Ucapan</Title>
      </Reveal>

      <Reveal style={cardStyle}>
        <form onSubmit={submit} className="flex flex-col" style={{ gap: 12 }}>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Nama Anda" style={fieldStyle} />

          <div className="flex" style={{ gap: 8 }}>
            {[['hadir', 'Hadir'], ['tidak_hadir', 'Berhalangan']].map(([val, label]) => {
              const on = attendance === val
              return (
                <button key={val} type="button" onClick={() => setAttendance(val)}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 999, cursor: 'pointer',
                    fontFamily: F.sans, fontSize: 12, letterSpacing: '.08em',
                    background: on ? `linear-gradient(135deg, ${c.gold}, ${c.goldSoft})` : 'transparent',
                    color: on ? c.night : c.muted,
                    border: `1px solid ${on ? 'transparent' : `${c.goldSoft}3A`}`,
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
                <option key={n} value={n} style={{ background: c.indigo, color: c.ivory }}>
                  {n} orang{n === 5 ? ' atau lebih' : ''}
                </option>
              ))}
            </select>
          )}

          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
            placeholder="Tulis doa & ucapan…" style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.7 }} />

          <button type="submit" disabled={!canSend}
            style={{
              padding: '13px 0', borderRadius: 999, border: 'none',
              cursor: canSend ? 'pointer' : 'not-allowed', opacity: canSend ? 1 : 0.45,
              background: `linear-gradient(135deg, ${c.gold}, ${c.goldSoft})`, color: c.night,
              fontFamily: F.sans, fontSize: 11.5, fontWeight: 500, letterSpacing: '.22em', textTransform: 'uppercase',
            }}>
            {busy ? 'Mengirim…' : 'Kirim Ucapan'}
          </button>

          {sent && (
            <p style={{ margin: 0, textAlign: 'center', fontFamily: F.sans, fontSize: 12, color: c.goldSoft }}>
              Terima kasih atas doa dan ucapannya.
            </p>
          )}
        </form>
      </Reveal>

      {list.length > 0 && (
        <div className="flex flex-col" style={{ gap: 12, marginTop: 20, maxHeight: 360, overflowY: 'auto', paddingRight: 2 }}>
          {list.map((w, i) => (
            <div key={w.id || i} style={{ ...cardStyle, padding: 16 }}>
              <div className="flex items-center justify-between" style={{ gap: 10 }}>
                <p style={{ margin: 0, fontFamily: F.display, fontSize: 15, color: c.ivory }}>{w.name}</p>
                <span style={{
                  flexShrink: 0, padding: '4px 11px', borderRadius: 999,
                  fontFamily: F.sans, fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase',
                  background: w.rsvp === 'hadir' ? 'rgba(217,164,65,.18)' : 'rgba(247,241,232,.08)',
                  color: w.rsvp === 'hadir' ? c.goldSoft : c.faint,
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
    <section id="sd-penutup" className="relative flex flex-col items-center justify-center text-center"
      style={{ zIndex: 1, minHeight: 'var(--inv-h)', boxSizing: 'border-box', padding: '96px 30px 150px' }}>
      {photo && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img src={photo} alt="" className="absolute object-cover"
            style={{ width: '112%', height: '112%', left: '-6%', top: '-6%', maxWidth: 'none', opacity: 0.32 }} />
          <div className="absolute inset-0" style={{
            background: `linear-gradient(180deg, ${c.night} 0%, rgba(26,21,38,.55) 40%, rgba(26,21,38,.75) 100%)`,
          }} />
        </div>
      )}

      <Reveal className="relative flex flex-col items-center">
        <p style={{ margin: 0, fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.9, color: c.muted, maxWidth: 320 }}>
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir
          untuk memberikan doa restu.
        </p>
        <Horizon width={52} style={{ margin: '26px 0' }} />
        <Kicker>Wassalamualaikum Wr. Wb.</Kicker>
        <h2 style={{ margin: '18px 0 0', fontFamily: F.script, fontSize: 58, lineHeight: 1, color: c.goldSoft }}>
          {groomNick} &amp; {brideNick}
        </h2>
        <p style={{ margin: '14px 0 0', fontFamily: F.display, fontSize: 14, letterSpacing: '.14em', color: c.ivory }}>{heroDate}</p>
      </Reveal>
    </section>
  )
}

// ─── NAV & MUSIK (§6.8) ──────────────────────────────────────────
const NAV = [['Home', 'sd-home'], ['Mempelai', 'sd-mempelai'], ['Acara', 'sd-acara'], ['Galeri', 'sd-galeri'], ['RSVP', 'sd-rsvp']]

const BottomNav = ({ visible }) => (
  <nav className="fixed md:absolute left-1/2 flex" style={{
    bottom: 20, transform: 'translateX(-50%)', zIndex: 60,
    width: 'min(420px, calc(var(--inv-w) - 30px))', gap: 2, padding: '7px 9px', borderRadius: 999,
    background: 'rgba(26,21,38,.62)', border: `1px solid ${c.goldSoft}2E`,
    backdropFilter: 'blur(16px) saturate(1.2)', boxShadow: '0 16px 40px rgba(26,21,38,.44)',
    opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none', transition: 'opacity .7s ease .3s',
  }}>
    {NAV.map(([label, id]) => (
      <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        style={{
          flex: 1, padding: '8px 2px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: 'transparent', color: c.goldSoft,
          fontFamily: F.sans, fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase',
        }}>
        {label}
      </button>
    ))}
  </nav>
)

const MusicButton = ({ musicPlaying, setMusicPlaying, visible }) => (
  <button onClick={() => setMusicPlaying(!musicPlaying)} title="Musik"
    className="fixed md:absolute flex items-end justify-center"
    style={{
      bottom: 88, right: 'max(16px, calc(var(--inv-w) / 2 - 214px))', zIndex: 60,
      width: 46, height: 46, borderRadius: '50%', cursor: 'pointer', gap: 3, paddingBottom: 15,
      background: 'rgba(26,21,38,.62)', border: `1px solid ${c.goldSoft}3A`,
      backdropFilter: 'blur(14px)', boxShadow: '0 12px 28px rgba(26,21,38,.4)',
      opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none', transition: 'opacity .7s ease .3s',
    }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        display: 'block', width: 3, height: 14, borderRadius: 2, background: c.goldSoft,
        transformOrigin: 'bottom',
        transform: musicPlaying ? undefined : 'scaleY(.35)',
        animation: musicPlaying ? `sd-eq ${0.62 + i * 0.15}s ease-in-out infinite` : 'none',
      }} />
    ))}
  </button>
)

// ═══════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════
export default function SenjaDioramaTheme({
  data, countdown, opened, setOpened,
  animateClose, setAnimateClose,
  musicPlaying, setMusicPlaying, audioRef,
  wishes, onSubmitWish, guestName,
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
        @keyframes sd-eq { 0%, 100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
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
