import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { THEMES } from '../config/constants'

// ═══════════════════════════════════════════════════════════════════
//  MORNING MIST LUXE — cinematic misty dark luxury (silver-champagne)
//  Ported from the "Morning Mist Luxe" design handoff as a bespoke theme.
//  Mist/noise ornaments are CSS approximations (gradient fog) until the
//  PNG ornament assets are supplied — the design's documented fallback.
//  Props + data-shape follow the Ulema theme contract (guide §5).
// ═══════════════════════════════════════════════════════════════════

// ─── PALETTE (design tokens) ─────────────────────────────────────
const c = {
  bgDeep:   '#0e141b',
  bgBase:   '#101720',
  bgRaised: '#141d27',
  bgCover:  '#0b1016',
  ink:      '#f3f6f8',
  ink2:     '#eef2f5',
  soft:     '#c9d4dc',
  soft2:    '#aebbc5',
  soft3:    '#8fa0ac',
  quote:    '#d5dee5',
  silver1:  '#c9d4dc',
  silver2:  '#9fb0bc',
  glassBrd: 'rgba(233,239,244,0.16)',
  hadir:    '#a8c5b4',
  hadirBrd: 'rgba(159,192,176,0.45)',
  halangan: '#c0aa9d',
  halBrd:   'rgba(190,170,160,0.4)',
  btnText:  '#101720',
}

const F = {
  serif:  "'Cormorant Garamond', serif",
  script: "'Ephesis', cursive",
  sans:   "'Jost', sans-serif",
}

const glass = (alpha = 0.08) => ({
  background: `rgba(233,239,244,${alpha})`,
  border: `1px solid ${c.glassBrd}`,
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
})

// Frosted-glass "condensation" texture overlay (real ornament asset).
const A = { condensation: '/themes/glass-condensation.png' }
const GlassTexture = ({ opacity = 0.12 }) => (
  <div className="absolute inset-0 pointer-events-none" style={{ background: `url("${A.condensation}") center/cover`, opacity, mixBlendMode: 'screen' }} />
)

// ─── DATE HELPERS ────────────────────────────────────────────────
const ID_DAYS = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const ID_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const fmtDate = (s) => {
  if (!s) return ''
  try {
    const d = new Date(s)
    return `${ID_DAYS[d.getDay()]}, ${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`
  } catch { return s }
}
const dateLabelOf = (ev) => ev?.dateLabel || fmtDate(ev?.date)
const pad2 = (n) => String(n ?? 0).padStart(2, '0')

// ─── SHARED PRIMITIVES ───────────────────────────────────────────
const Eyebrow = ({ children, style = {} }) => (
  <p className="uppercase" style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 300, letterSpacing: '0.4em', color: 'rgba(238,242,245,0.55)', margin: 0, ...style }}>
    {children}
  </p>
)

const SectionHead = ({ eyebrow, title }) => (
  <motion.div className="text-center" style={{ padding: '0 30px 54px' }}
    initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 1, ease: [0.22, 0.8, 0.3, 1] }}>
    <Eyebrow>{eyebrow}</Eyebrow>
    <h2 style={{ fontFamily: F.serif, fontSize: 34, fontWeight: 400, color: c.ink2, marginTop: 12 }}>{title}</h2>
  </motion.div>
)

const Reveal = ({ children, className = '', style = {} }) => (
  <motion.div className={className} style={style}
    initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 1.1, ease: [0.22, 0.8, 0.3, 1] }}>
    {children}
  </motion.div>
)

// Full-bleed photo with translate-only pan (never scale — keeps it sharp).
const PhotoBg = ({ src, fallback, scrim, dur = 28 }) => (
  <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
    <div className="absolute" style={{
      inset: '-8%',
      background: src ? `url("${src}") center/cover no-repeat` : fallback,
      animation: `mm-pan ${dur}s ease-in-out infinite`,
    }} />
    {scrim && <div className="absolute inset-0" style={{ background: scrim }} />}
  </div>
)

// CSS fog (fallback for the mist PNG ornaments) — drifting glow at the bottom.
const Mist = ({ opacity = 0.5, dur = 24, reverse = false, style = {} }) => (
  <div className="absolute pointer-events-none" style={{
    left: '-30%', right: '-30%', bottom: '-14%', height: '58%',
    background: 'radial-gradient(ellipse 60% 100% at 50% 100%, rgba(201,212,220,0.30), rgba(201,212,220,0) 72%)',
    filter: 'blur(16px)', opacity,
    animation: `${reverse ? 'mm-mist2' : 'mm-mist'} ${dur}s ease-in-out infinite`,
    maskImage: 'linear-gradient(180deg, transparent 0%, black 45%)',
    WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 45%)',
    zIndex: 1, ...style,
  }} />
)

// Dew particles — seeded deterministically once per mount (lint-safe).
const Dew = () => {
  const dots = useState(() => (
    [...Array(10)].map((_, i) => {
      const r = Math.sin(i * 127.1) * 43758.5453
      const f = r - Math.floor(r)
      return { left: 6 + f * 88, size: 3 + (i % 3) * 2, dur: 7 + (i % 5) * 2, delay: (i * 1.3) % 8 }
    })
  ))[0]
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {dots.map((d, i) => (
        <span key={i} className="absolute rounded-full" style={{
          left: `${d.left}%`, bottom: '10%', width: d.size, height: d.size,
          background: 'rgba(220,230,237,0.8)', filter: 'blur(0.5px)', opacity: 0,
          animation: `mm-dew ${d.dur}s linear ${d.delay}s infinite`,
        }} />
      ))}
    </div>
  )
}

const PILL = { borderRadius: 999, fontFamily: F.sans, letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer' }

// ─── 0. COVER ────────────────────────────────────────────────────
const Cover = ({ data, groomNick, brideNick, dateLabel, guestName, handleOpen, animateClose }) => {
  const coverPhoto = data?.meta?.coverPhoto || ''
  const beat = (delay) => ({ initial: { opacity: 0, y: 26 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1.4, delay, ease: [0.22, 0.8, 0.3, 1] } })
  return (
    <motion.div className="absolute inset-0 flex justify-center overflow-hidden" style={{ zIndex: 60, background: c.bgCover }}
      animate={animateClose ? { opacity: 0, scale: 1.06 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 1.4, ease: 'easeInOut' }}>
      <PhotoBg src={coverPhoto} fallback="linear-gradient(160deg, #2a3644 0%, #17202b 55%, #0b1016 100%)"
        scrim="linear-gradient(180deg, rgba(11,16,22,.28) 0%, rgba(11,16,22,.06) 34%, rgba(11,16,22,.62) 68%, rgba(11,16,22,.94) 100%)" dur={26} />
      <Mist opacity={0.85} dur={22} />
      <Mist opacity={0.55} dur={30} reverse style={{ height: '48%' }} />
      <div className="relative w-full flex flex-col items-center justify-end text-center" style={{ zIndex: 2, padding: '0 28px 64px', color: c.ink2 }}>
        <motion.div {...beat(0.3)}>
          <Eyebrow style={{ letterSpacing: '0.42em', fontSize: 11, color: 'rgba(238,242,245,0.75)' }}>The Wedding Of</Eyebrow>
        </motion.div>
        <motion.div {...beat(0.9)}>
          <div style={{ fontFamily: F.script, fontSize: 64, lineHeight: 1.05, margin: '18px 0 6px', color: c.ink, textShadow: '0 2px 30px rgba(0,0,0,.45)' }}>{groomNick} &amp; {brideNick}</div>
          <div style={{ fontFamily: F.serif, fontSize: 15, letterSpacing: '0.3em', color: c.soft }}>{dateLabel}</div>
        </motion.div>
        <motion.div {...beat(1.6)} className="flex flex-col items-center">
          <div className="relative overflow-hidden" style={{ margin: '34px auto 26px', maxWidth: 300, borderRadius: 20, padding: '18px 22px', ...glass(0.09) }}>
            <GlassTexture opacity={0.14} />
            <div className="relative" style={{ zIndex: 1 }}>
              <div className="uppercase" style={{ fontFamily: F.sans, fontSize: 10, letterSpacing: '0.34em', color: 'rgba(238,242,245,0.6)' }}>Kepada Yth.</div>
              <div style={{ fontFamily: F.serif, fontSize: 24, marginTop: 8, color: c.ink }}>{guestName}</div>
            </div>
          </div>
          <button onClick={handleOpen} style={{ ...PILL, fontSize: 12, letterSpacing: '0.28em', padding: '15px 38px', border: '1px solid rgba(220,230,237,0.5)', background: 'linear-gradient(120deg, rgba(233,239,244,.16), rgba(233,239,244,.05))', color: c.ink, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
            Buka Undangan
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── 1. HERO ─────────────────────────────────────────────────────
const Hero = ({ data, groomNick, brideNick, dateLabel, countdown }) => {
  const heroPhoto = data?.meta?.photo || ''
  const parts = [
    { value: pad2(countdown?.d), label: 'Hari' },
    { value: pad2(countdown?.h), label: 'Jam' },
    { value: pad2(countdown?.m), label: 'Menit' },
    { value: pad2(countdown?.s), label: 'Detik' },
  ]
  return (
    <section id="mm-home" className="relative flex flex-col justify-end overflow-hidden" style={{ height: 'var(--inv-h)', minHeight: 640 }}>
      <PhotoBg src={heroPhoto} fallback="linear-gradient(150deg, #33404f 0%, #1a2430 60%, #0e141b 100%)"
        scrim={`linear-gradient(180deg, rgba(14,20,27,.5) 0%, rgba(14,20,27,.05) 30%, rgba(14,20,27,.55) 66%, ${c.bgBase} 100%)`} dur={30} />
      <Mist opacity={0.55} dur={26} reverse style={{ height: '60%', filter: 'blur(6px)', maskImage: 'radial-gradient(ellipse 62% 46% at 50% 55%, black 30%, transparent 78%)', WebkitMaskImage: 'radial-gradient(ellipse 62% 46% at 50% 55%, black 30%, transparent 78%)' }} />
      <Dew />
      <div className="relative text-center" style={{ zIndex: 2, padding: '0 30px 120px', color: c.ink2 }}>
        <Eyebrow style={{ fontSize: 10, letterSpacing: '0.4em', color: 'rgba(238,242,245,0.65)' }}>Kami Akan Menikah</Eyebrow>
        <div style={{ fontFamily: F.script, fontSize: 56, lineHeight: 1.1, margin: '14px 0 8px' }}>{groomNick} &amp; {brideNick}</div>
        <div style={{ fontFamily: F.serif, fontSize: 16, letterSpacing: '0.26em', color: c.soft, marginBottom: 30 }}>{dateLabel}</div>
        {(data?.countdownEnabled ?? true) && (
          <div className="flex justify-center gap-2.5">
            {parts.map((cd) => (
              <div key={cd.label} style={{ width: 66, padding: '12px 0 10px', borderRadius: 18, ...glass(0.08) }}>
                <div style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 500, color: c.ink }}>{cd.value}</div>
                <div className="uppercase" style={{ fontFamily: F.sans, fontSize: 9, letterSpacing: '0.24em', color: 'rgba(238,242,245,0.55)', marginTop: 2 }}>{cd.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── 2. QUOTE ────────────────────────────────────────────────────
const Quote = ({ data }) => {
  if (!data?.quote) return null
  return (
    <Reveal className="text-center" style={{ padding: '92px 34px', background: `linear-gradient(180deg, ${c.bgBase} 0%, ${c.bgRaised} 100%)` }}>
      <div style={{ width: 54, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,212,220,.7), transparent)', margin: '0 auto 30px' }} />
      <div style={{ fontFamily: F.serif, fontStyle: 'italic', fontWeight: 300, fontSize: 21, lineHeight: 1.75, color: c.quote, maxWidth: 380, margin: '0 auto' }}>&ldquo;{data.quote}&rdquo;</div>
      <div style={{ width: 54, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,212,220,.7), transparent)', margin: '30px auto 0' }} />
    </Reveal>
  )
}

// ─── 3. COUPLE (alternating editorial panels) ────────────────────
const Couple = ({ data }) => {
  const people = [
    { p: data?.groom, role: 'Mempelai Pria', child: 'Putra dari', align: 'left' },
    { p: data?.bride, role: 'Mempelai Wanita', child: 'Putri dari', align: 'right' },
  ]
  return (
    <section id="mm-couple" style={{ background: c.bgRaised, padding: '88px 0 40px' }}>
      <SectionHead eyebrow="Mempelai" title="Dua jiwa, satu janji" />
      {people.map(({ p, role, child, align }, i) => (
        <Reveal key={i} className="relative overflow-hidden flex flex-col justify-end" style={{ margin: '0 20px 48px', borderRadius: 22, height: 520 }}>
          <div className="absolute inset-0" style={{ background: p?.photo ? `url("${p.photo}") center top/cover no-repeat` : 'linear-gradient(160deg, #2e3a48, #18222d)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(16,23,32,0) 30%, rgba(16,23,32,.78) 78%, rgba(16,23,32,.94) 100%)' }} />
          <div className="relative" style={{ padding: '26px 24px 24px', color: c.ink2, textAlign: align }}>
            <Eyebrow style={{ fontSize: 10, letterSpacing: '0.36em', color: 'rgba(238,242,245,0.6)' }}>{role}</Eyebrow>
            <div style={{ fontFamily: F.script, fontSize: 46, lineHeight: 1.1, margin: '8px 0 4px', color: c.ink }}>{p?.nickname || '—'}</div>
            <div style={{ fontFamily: F.serif, fontSize: 19, color: c.soft2 }}>{p?.name || ''}</div>
            <div style={{ marginTop: 16, borderRadius: 16, padding: '14px 18px', ...glass(0.08), fontSize: 13, lineHeight: 1.7, color: '#c3ced7', fontWeight: 300, display: 'inline-block', textAlign: align }}>
              {child}<br />Bapak {p?.father || '—'} &amp; Ibu {p?.mother || '—'}
            </div>
            {p?.instagram && (
              <div>
                <a href={`https://instagram.com/${p.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5" style={{ marginTop: 14, fontSize: 12, letterSpacing: '0.1em', color: '#b9c6cf', border: '1px solid rgba(185,198,207,0.35)', borderRadius: 999, padding: '8px 16px' }}>
                  <span style={{ fontFamily: F.serif, fontStyle: 'italic' }}>@</span>{p.instagram.replace('@', '')}
                </a>
              </div>
            )}
          </div>
        </Reveal>
      ))}
    </section>
  )
}

// ─── 4. ACARA (vertical itinerary) ───────────────────────────────
const Acara = ({ data }) => {
  const events = data?.events || []
  if (!events.length) return null
  return (
    <section id="mm-acara" className="relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${c.bgRaised} 0%, ${c.bgBase} 100%)`, padding: '88px 24px 96px' }}>
      <SectionHead eyebrow="Rangkaian Acara" title="Perjalanan hari itu" />
      <div className="relative">
        <div className="absolute" style={{ left: 27, top: 10, bottom: 10, width: 1, background: 'linear-gradient(180deg, transparent, rgba(201,212,220,.4) 12%, rgba(201,212,220,.4) 88%, transparent)' }} />
        {events.map((ev, i) => (
          <Reveal key={ev.id || i} className="relative" style={{ paddingLeft: 62, marginBottom: 40 }}>
            <div className="absolute flex items-center justify-center" style={{ left: 18, top: 26, width: 19, height: 19, borderRadius: 50, border: '1px solid rgba(201,212,220,.6)', background: c.bgBase }}>
              <div style={{ width: 7, height: 7, borderRadius: 50, background: c.soft }} />
            </div>
            <div style={{ borderRadius: 22, padding: '26px 24px', ...glass(0.06) }}>
              <div className="flex justify-between items-baseline gap-3">
                <div style={{ fontFamily: F.serif, fontSize: 26, color: c.ink }}>{ev.name || 'Acara'}</div>
                {(ev.start || ev.end) && <div style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: '0.16em', color: '#9fb0bc', whiteSpace: 'nowrap' }}>{[ev.start, ev.end].filter(Boolean).join('–')} {ev.tz || ''}</div>}
              </div>
              <div style={{ margin: '14px 0', height: 1, background: 'linear-gradient(90deg, rgba(201,212,220,.3), transparent)' }} />
              <div style={{ fontFamily: F.serif, fontSize: 16, letterSpacing: '0.06em', color: c.soft2 }}>{dateLabelOf(ev)}</div>
              <div style={{ fontFamily: F.sans, fontSize: 14, color: '#c3ced7', marginTop: 10 }}>{ev.venue || ''}</div>
              {ev.address && <div style={{ fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.65, color: c.soft3, marginTop: 4, fontWeight: 300 }}>{ev.address}</div>}
              {ev.maps && (
                <a href={ev.maps} target="_blank" rel="noopener noreferrer" className="inline-block uppercase" style={{ marginTop: 18, fontFamily: F.sans, fontSize: 11, letterSpacing: '0.24em', color: c.ink2, border: '1px solid rgba(220,230,237,.4)', borderRadius: 999, padding: '11px 22px' }}>Petunjuk Arah</a>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

// ─── 5. LOVE STORY (zigzag) ──────────────────────────────────────
const LoveStory = ({ data }) => {
  const stories = data?.loveStory || []
  if (!stories.length) return null
  return (
    <section className="relative overflow-hidden" style={{ background: c.bgDeep, padding: '88px 24px 72px' }}>
      <SectionHead eyebrow="Perjalanan Cinta" title="Dari kabut menjadi cahaya" />
      {stories.map((ls, i) => {
        const rev = i % 2 === 1
        return (
          <Reveal key={ls.id || i} className="relative" style={{ marginBottom: 54, padding: '0 6px' }}>
            <div style={{ position: 'absolute', top: -26, fontFamily: F.serif, fontSize: 92, fontWeight: 300, color: 'rgba(201,212,220,.10)', lineHeight: 1, [rev ? 'left' : 'right']: 0 }}>{ls.year}</div>
            <div className="relative flex items-start gap-4" style={{ flexDirection: rev ? 'row-reverse' : 'row' }}>
              {ls.photo && (
                <div style={{ flex: '0 0 128px', height: 160, borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(233,239,244,.15)' }}>
                  <div style={{ width: '100%', height: '100%', background: `url("${ls.photo}") center/cover no-repeat` }} />
                </div>
              )}
              <div style={{ flex: 1, borderRadius: 18, padding: 20, background: 'rgba(233,239,244,.05)', border: '1px solid rgba(233,239,244,.12)' }}>
                {ls.year && <div style={{ fontFamily: F.sans, fontSize: 10, letterSpacing: '0.3em', color: '#9fb0bc' }}>{ls.year}</div>}
                {ls.title && <div style={{ fontFamily: F.serif, fontSize: 21, color: c.ink2, margin: '6px 0 8px' }}>{ls.title}</div>}
                <div style={{ fontFamily: F.sans, fontSize: 13, lineHeight: 1.75, color: '#aebbc5', fontWeight: 300 }}>{ls.desc}</div>
              </div>
            </div>
          </Reveal>
        )
      })}
    </section>
  )
}

// ─── 6. DRESSCODE ────────────────────────────────────────────────
const Dresscode = ({ data }) => {
  const dc = data?.dresscode
  if (!dc || !dc.name) return null
  return (
    <Reveal className="text-center" style={{ background: c.bgBase, padding: '72px 24px' }}>
      <Eyebrow>Dresscode</Eyebrow>
      <div style={{ margin: '26px auto 0', maxWidth: 340, borderRadius: 22, padding: '28px 24px', ...glass(0.06) }}>
        <div style={{ width: 52, height: 52, borderRadius: 50, margin: '0 auto 16px', border: '3px solid rgba(233,239,244,.25)', background: dc.color || '#8fa3b8' }} />
        <div style={{ fontFamily: F.serif, fontSize: 24, color: c.ink2 }}>{dc.name}</div>
        {dc.notes && <div style={{ fontFamily: F.sans, fontSize: 13, lineHeight: 1.7, color: '#aebbc5', marginTop: 10, fontWeight: 300 }}>{dc.notes}</div>}
      </div>
    </Reveal>
  )
}

// ─── 7. GALLERY (hero + film strip) ──────────────────────────────
const Gallery = ({ data }) => {
  const photos = (data?.gallery || []).map(g => (typeof g === 'string' ? g : g?.src)).filter(Boolean)
  if (!photos.length) return null
  const [hero, ...rest] = photos
  return (
    <section id="mm-galeri" className="overflow-hidden" style={{ background: `linear-gradient(180deg, ${c.bgBase}, ${c.bgRaised})`, padding: '88px 0 96px' }}>
      <SectionHead eyebrow="Galeri" title="Potongan momen" />
      <Reveal style={{ margin: '0 20px 18px', height: 420, borderRadius: 22, overflow: 'hidden', border: '1px solid rgba(233,239,244,.12)' }}>
        <div style={{ width: '100%', height: '100%', background: `url("${hero}") center/cover no-repeat` }} />
      </Reveal>
      {rest.length > 0 && (
        <>
          <div className="flex gap-3.5" style={{ overflowX: 'auto', padding: '6px 20px 18px', scrollSnapType: 'x mandatory' }}>
            {rest.map((src, i) => (
              <div key={i} style={{ flex: '0 0 210px', height: 280, borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(233,239,244,.12)', scrollSnapAlign: 'start' }}>
                <div style={{ width: '100%', height: '100%', background: `url("${src}") center/cover no-repeat` }} />
              </div>
            ))}
          </div>
          <div className="text-center uppercase" style={{ fontFamily: F.sans, fontSize: 10, letterSpacing: '0.3em', color: 'rgba(238,242,245,.35)' }}>geser untuk melihat →</div>
        </>
      )}
    </section>
  )
}

// ─── 8. RSVP & WISHES ────────────────────────────────────────────
const WishRsvp = ({ data, wishes, onSubmitWish }) => {
  const [name, setName] = useState('')
  const [wish, setWish] = useState('')
  const [att, setAtt] = useState('hadir')
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    if (busy || !name.trim() || !wish.trim()) return
    setBusy(true)
    try {
      if (onSubmitWish) await onSubmitWish({ name, message: wish, attendance: att })
      setName(''); setWish(''); setAtt('hadir')
    } finally { setBusy(false) }
  }
  const list = (wishes || data?.rsvps || [])
  const field = { width: '100%', boxSizing: 'border-box', padding: '14px 18px', borderRadius: 12, border: '1px solid rgba(233,239,244,.18)', background: 'rgba(14,20,27,.55)', color: c.ink2, fontFamily: F.sans, fontSize: 14, outline: 'none' }
  const toggle = (active) => ({ flex: 1, padding: '13px 0', ...PILL, letterSpacing: '0.12em', textTransform: 'none', fontSize: 12, border: `1px solid ${active ? 'rgba(220,230,237,.7)' : 'rgba(233,239,244,.18)'}`, background: active ? 'rgba(233,239,244,.16)' : 'transparent', color: active ? c.ink : c.soft3 })
  return (
    <section id="mm-rsvp" className="relative overflow-hidden" style={{ background: c.bgDeep, padding: '88px 24px 80px' }}>
      <SectionHead eyebrow="RSVP & Ucapan" title="Doa & restu Anda" />
      <Reveal className="relative overflow-hidden" style={{ borderRadius: 22, padding: '26px 22px', ...glass(0.06) }}>
        <GlassTexture opacity={0.1} />
        <div className="relative" style={{ zIndex: 1 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama Anda" style={field} />
          <div className="flex gap-2.5" style={{ margin: '14px 0' }}>
            <button type="button" onClick={() => setAtt('hadir')} style={toggle(att === 'hadir')}>Hadir</button>
            <button type="button" onClick={() => setAtt('tidak_hadir')} style={toggle(att === 'tidak_hadir')}>Berhalangan</button>
          </div>
          <textarea value={wish} onChange={e => setWish(e.target.value)} rows={4} placeholder="Tulis doa & ucapan untuk kedua mempelai…" style={{ ...field, lineHeight: 1.6, resize: 'vertical' }} />
          <button onClick={submit} disabled={busy} className="uppercase" style={{ width: '100%', marginTop: 14, padding: '15px 0', borderRadius: 999, border: 'none', background: `linear-gradient(120deg, ${c.silver1}, ${c.silver2})`, color: c.btnText, fontFamily: F.sans, fontSize: 12, letterSpacing: '0.26em', fontWeight: 500, cursor: 'pointer', opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Mengirim…' : 'Kirim Ucapan'}
          </button>
        </div>
      </Reveal>
      {list.length > 0 && (
        <Reveal style={{ marginTop: 34 }}>
          <div className="text-center uppercase" style={{ fontFamily: F.sans, fontSize: 10, letterSpacing: '0.3em', color: 'rgba(238,242,245,.45)', marginBottom: 18 }}>{list.length} ucapan</div>
          <div className="flex gap-3.5" style={{ overflowX: 'auto', padding: '4px 2px 16px', scrollSnapType: 'x mandatory' }}>
            {list.map((w, i) => {
              const hadir = w.rsvp === 'hadir'
              return (
                <div key={w.id || i} style={{ flex: '0 0 260px', borderRadius: 18, padding: 20, background: 'rgba(233,239,244,.05)', border: '1px solid rgba(233,239,244,.12)', scrollSnapAlign: 'start' }}>
                  <div className="flex justify-between items-center gap-2">
                    <div style={{ fontFamily: F.serif, fontSize: 18, color: c.ink2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</div>
                    {w.rsvp && <div className="uppercase" style={{ fontFamily: F.sans, fontSize: 9.5, letterSpacing: '0.12em', padding: '5px 10px', borderRadius: 999, whiteSpace: 'nowrap', border: `1px solid ${hadir ? c.hadirBrd : c.halBrd}`, color: hadir ? c.hadir : c.halangan }}>{hadir ? 'Hadir' : 'Berhalangan'}</div>}
                  </div>
                  <div style={{ fontFamily: F.sans, fontSize: 13, lineHeight: 1.7, color: '#aebbc5', marginTop: 10, fontWeight: 300 }}>{w.wish || w.message}</div>
                  {w.time && <div style={{ fontFamily: F.sans, fontSize: 10.5, color: 'rgba(238,242,245,.35)', marginTop: 12 }}>{w.time}</div>}
                </div>
              )
            })}
          </div>
        </Reveal>
      )}
    </section>
  )
}

// ─── 9. GIFT ─────────────────────────────────────────────────────
const Gift = ({ data }) => {
  const { copiedKey, copy } = useCopyToClipboard()
  const accounts = data?.accounts || []
  if (!accounts.length) return null
  return (
    <section id="mm-hadiah" style={{ background: c.bgBase, padding: '88px 24px 80px' }}>
      <SectionHead eyebrow="Hadiah" title="Tanda kasih" />
      <div style={{ marginTop: -30, marginBottom: 40, textAlign: 'center' }}>
        <div style={{ fontFamily: F.sans, fontSize: 13, lineHeight: 1.7, color: c.soft3, maxWidth: 320, margin: '0 auto', fontWeight: 300 }}>
          Kehadiran Anda adalah hadiah terindah. Namun bila ingin berbagi tanda kasih, dapat melalui:
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {accounts.map((ac, i) => {
          const key = ac.id || ac.number || i
          return (
            <Reveal key={key} style={{ borderRadius: 20, padding: '24px 22px', background: 'linear-gradient(130deg, rgba(233,239,244,.10), rgba(233,239,244,.04))', border: '1px solid rgba(233,239,244,.16)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
              <div className="flex justify-between items-center">
                <div style={{ fontFamily: F.serif, fontSize: 22, letterSpacing: '0.08em', color: c.ink }}>{ac.bank}</div>
                <div className="uppercase" style={{ fontFamily: F.sans, fontSize: 9.5, letterSpacing: '0.2em', color: 'rgba(238,242,245,.45)', border: '1px solid rgba(233,239,244,.2)', borderRadius: 999, padding: '4px 12px' }}>{ac.type === 'ewallet' ? 'E-Wallet' : 'Bank'}</div>
              </div>
              <div style={{ fontFamily: F.sans, fontSize: 17, letterSpacing: '0.14em', color: c.soft2, margin: '14px 0 4px' }}>{ac.number}</div>
              <div style={{ fontFamily: F.sans, fontSize: 12.5, color: c.soft3, fontWeight: 300 }}>a.n. {ac.holder}</div>
              <button onClick={() => copy(ac.number, key)} className="uppercase" style={{ marginTop: 16, padding: '10px 24px', ...PILL, letterSpacing: '0.22em', fontSize: 11, border: '1px solid rgba(220,230,237,.4)', background: copiedKey === key ? 'rgba(233,239,244,.16)' : 'transparent', color: c.ink2 }}>
                {copiedKey === key ? 'Tersalin ✓' : 'Salin Nomor'}
              </button>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

// ─── LIVE STREAMING (optional) ───────────────────────────────────
const LiveStream = ({ data }) => {
  const platforms = data?.livestreamEnabled ? (data?.livestreamPlatforms || []).filter(p => p.url) : []
  if (!platforms.length) return null
  return (
    <section style={{ background: c.bgBase, padding: '88px 24px' }}>
      <SectionHead eyebrow="Live Streaming" title="Saksikan Bersama" />
      <div className="flex flex-col items-center gap-3">
        {platforms.map((p, i) => (
          <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="uppercase" style={{ padding: '13px 34px', borderRadius: 999, border: '1px solid rgba(220,230,237,.4)', color: c.ink2, fontFamily: F.sans, fontSize: 11, letterSpacing: '0.24em' }}>{p.type || 'Tonton Live'}</a>
        ))}
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
    <section style={{ background: c.bgRaised, padding: '88px 24px' }}>
      <SectionHead eyebrow="Turut Mengundang" title="Keluarga Besar" />
      <div className="flex flex-col gap-8" style={{ maxWidth: 340, margin: '0 auto' }}>
        {families.map((fam, i) => (
          <div key={fam.id || i} className="text-center">
            {fam.side && <p style={{ fontFamily: F.serif, fontSize: 20, color: c.soft, marginBottom: 10 }}>{fam.side}</p>}
            {fam.members.map((m, j) => (<p key={j} style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 300, color: c.soft2, lineHeight: 1.9 }}>{m}</p>))}
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── 10. FOOTER ──────────────────────────────────────────────────
const Footer = ({ data, groomNick, brideNick, dateLabel }) => (
  <section className="relative overflow-hidden flex items-end justify-center" style={{ height: 'calc(var(--inv-h) * 0.78)', minHeight: 540 }}>
    <PhotoBg src={data?.meta?.footerPhoto || ''} fallback="linear-gradient(200deg, #2a3644, #0e141b)"
      scrim={`linear-gradient(180deg, ${c.bgBase} 0%, rgba(16,23,32,.15) 38%, rgba(16,23,32,.85) 82%, ${c.bgCover} 100%)`} dur={32} />
    <div className="relative text-center" style={{ zIndex: 2, color: c.ink2, padding: '0 30px 110px' }}>
      <Eyebrow style={{ fontSize: 10, letterSpacing: '0.4em', color: 'rgba(238,242,245,.6)' }}>Sampai jumpa di hari bahagia kami</Eyebrow>
      <div style={{ fontFamily: F.script, fontSize: 52, margin: '16px 0 8px' }}>{groomNick} &amp; {brideNick}</div>
      <div style={{ fontFamily: F.serif, fontSize: 14, letterSpacing: '0.3em', color: c.soft }}>{dateLabel}</div>
    </div>
  </section>
)

// ─── FIXED: MUSIC + NAV ──────────────────────────────────────────
const scrollToId = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const NAV = [['Home', 'mm-home'], ['Couple', 'mm-couple'], ['Acara', 'mm-acara'], ['Galeri', 'mm-galeri'], ['RSVP', 'mm-rsvp'], ['Hadiah', 'mm-hadiah']]

// ═══════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════
export default function MorningMistLuxeTheme({
  data, countdown, opened, setOpened,
  animateClose, setAnimateClose,
  musicPlaying, setMusicPlaying, audioRef,
  wishes, onSubmitWish, guestName,
}) {
  const groomNick = data?.groom?.nickname || 'Mempelai Pria'
  const brideNick = data?.bride?.nickname || 'Mempelai Wanita'
  const dateLabel = dateLabelOf(data?.events?.[0])
  const guest = guestName || 'Bapak/Ibu/Saudara/i'

  const handleOpen = () => {
    setAnimateClose(true)
    setTimeout(() => {
      setOpened(true)
      if (audioRef?.current) setMusicPlaying(true)
    }, 1400)
  }

  return (
    <InvitationLayout layout={THEMES.MORNING_MIST} data={data} bgUrl="">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Ephesis&family=Jost:wght@300;400;500&display=swap');
        @keyframes mm-pan { 0% { transform: translate(-3.5%, 0) } 50% { transform: translate(0, -2%) } 100% { transform: translate(-3.5%, 0) } }
        @keyframes mm-mist { 0% { transform: translateX(-6%) } 50% { transform: translateX(6%) } 100% { transform: translateX(-6%) } }
        @keyframes mm-mist2 { 0% { transform: translateX(5%) } 50% { transform: translateX(-5%) } 100% { transform: translateX(5%) } }
        @keyframes mm-dew { 0% { transform: translateY(0); opacity: 0 } 12% { opacity: .7 } 88% { opacity: .5 } 100% { transform: translateY(-90px); opacity: 0 } }
        @keyframes mm-eq { 0% { height: 4px } 50% { height: 14px } 100% { height: 4px } }
      `}</style>

      <div className="w-full relative h-full flex flex-col overflow-x-hidden" style={{ fontFamily: F.sans, color: c.ink2, background: c.bgBase }}>
        {data?.music !== false && (
          <audio ref={audioRef} src={data?.musicUrl || MUSIC_URLS[data?.musicId || 1] || MUSIC_URLS[1]} loop />
        )}

        <AnimatePresence>
          {!opened && (
            <Cover key="cover" data={data} groomNick={groomNick} brideNick={brideNick} dateLabel={dateLabel} guestName={guest} handleOpen={handleOpen} animateClose={animateClose} />
          )}
        </AnimatePresence>

        {opened && (
          <motion.div className="flex flex-col w-full relative" style={{ zIndex: 1 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}>
            <Hero data={data} groomNick={groomNick} brideNick={brideNick} dateLabel={dateLabel} countdown={countdown} />
            <Quote data={data} />
            <Couple data={data} />
            <Acara data={data} />
            <LoveStory data={data} />
            <Dresscode data={data} />
            <Gallery data={data} />
            <WishRsvp data={data} wishes={wishes} onSubmitWish={onSubmitWish} />
            <Gift data={data} />
            <LiveStream data={data} />
            <TurutMengundang data={data} />
            <Footer data={data} groomNick={groomNick} brideNick={brideNick} dateLabel={dateLabel} />

            {/* Music toggle (equalizer) */}
            {data?.music !== false && (
              <button onClick={() => setMusicPlaying(!musicPlaying)} title="Musik"
                className="fixed md:absolute flex items-center justify-center gap-0.5" style={{ right: 16, bottom: 92, zIndex: 50, width: 46, height: 46, borderRadius: 50, border: '1px solid rgba(233,239,244,.25)', background: 'rgba(16,23,32,.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', cursor: 'pointer' }}>
                {[0, 1, 2, 3].map(i => (
                  <span key={i} style={{ width: 2.5, borderRadius: 2, background: c.soft, height: 8, animation: musicPlaying ? `mm-eq ${0.7 + i * 0.13}s ease-in-out ${i * 0.1}s infinite` : 'none' }} />
                ))}
              </button>
            )}

            {/* Bottom nav */}
            <nav className="fixed md:absolute left-1/2 -translate-x-1/2 flex gap-1" style={{ bottom: 18, zIndex: 50, padding: '8px 10px', borderRadius: 999, background: 'rgba(16,23,32,.78)', border: '1px solid rgba(233,239,244,.16)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
              {NAV.map(([label, id]) => (
                <button key={id} onClick={() => scrollToId(id)} style={{ border: 'none', background: 'transparent', color: c.soft3, fontFamily: F.sans, fontSize: 10.5, letterSpacing: '0.08em', padding: '9px 13px', borderRadius: 999, cursor: 'pointer', whiteSpace: 'nowrap' }}>{label}</button>
              ))}
            </nav>
          </motion.div>
        )}
      </div>
    </InvitationLayout>
  )
}
