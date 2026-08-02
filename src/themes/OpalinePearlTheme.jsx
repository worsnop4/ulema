import { useState } from 'react'
import { motion } from 'framer-motion'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { THEMES } from '../config/constants'

// ═══════════════════════════════════════════════════════════════════
//  OPALINE PEARL — pearl/ivory & opal shimmer, gold filigree, 3D doors
//  Category: Special. Built part-by-part from the "Opaline Pearl" handoff.
// ═══════════════════════════════════════════════════════════════════

// ─── PALETTE ─────────────────────────────────────────────────────
const c = {
  pearl:    '#FCF9F7',
  pearl2:   '#F8F1EC',
  ivoryDoor:'#EFE9E0',
  ink:      '#2E2722',
  body:     '#5C5148',
  muted:    '#8C8078',
  muted2:   '#A38C6A',
  muted3:   '#B09B7E',
  gold:     '#C3A15D',
  goldDeep: '#8E7134',
  goldMid:  '#C9A863',
  goldLight:'#E7C87E',
  opalPink: '#F6DCE4',
  opalMint: '#DCEDE6',
  opalLilac:'#E4DDF3',
  opalChamp:'#F7E6CF',
  hadir:    '#4C7A62', hadirBg: 'rgba(214,235,224,.8)',
  absen:    '#9A6A6A', absenBg: 'rgba(240,224,224,.8)',
}
const goldGrad = `linear-gradient(120deg,${c.goldMid},${c.goldDeep})`
const opalConic = `conic-gradient(from 0deg, ${c.opalPink}, ${c.opalMint}, ${c.opalLilac}, ${c.opalChamp}, ${c.opalPink})`

const F = {
  script: "'Parisienne', cursive",
  serif:  "'Cormorant Garamond', serif",
  sans:   "'Jost', sans-serif",
}

// ─── ASSETS ──────────────────────────────────────────────────────
const A = {
  bgBlossom:   '/themes/Special/theme-12/bg-blossom.jpg',
  coverRelief: '/themes/Special/theme-12/cover-relief.jpg',
}

// ─── DATE HELPERS ────────────────────────────────────────────────
const ID_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const ID_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const fmtDate = (s) => {
  if (!s) return ''
  try { const d = new Date(s); return `${ID_DAYS[d.getDay()]}, ${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}` } catch { return s }
}
const dateLabelOf = (ev) => ev?.dateLabel || fmtDate(ev?.date)
const fmtTime = (t) => { if (!t) return ''; const [h, m] = t.split(':'); return `${h}.${m}` }
const pad2 = (n) => String(n ?? 0).padStart(2, '0')

// ─── SEEDED RNG (deterministic — matches design spec's LCG exactly) ──
// Never Math.random() in render (react-hooks/purity); particles are seeded
// once via a lazy useState initializer so positions don't reshuffle on re-render.
function seeded(n) {
  let s = 20261126 + n * 7919
  return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648 }
}

// ─── SCROLL HELPER ───────────────────────────────────────────────
const scrollToId = (id) => {
  const el = document.getElementById(id)
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 4, behavior: 'smooth' })
}

const NAV = [['Home', 'op-home'], ['Couple', 'op-couple'], ['Acara', 'op-acara'], ['Galeri', 'op-galeri'], ['RSVP', 'op-rsvp'], ['Hadiah', 'op-hadiah']]

// ─── PRIMITIVES ──────────────────────────────────────────────────
const Kicker = ({ children, style = {} }) => (
  <p className="uppercase" style={{ margin: 0, fontFamily: F.sans, fontSize: 10, letterSpacing: '.4em', color: c.muted3, ...style }}>{children}</p>
)
const SectionTitle = ({ children, style = {} }) => (
  <h2 style={{ margin: '10px 0 0', fontFamily: F.serif, fontWeight: 400, fontSize: 30, color: c.ink, ...style }}>{children}</h2>
)
const Reveal = ({ children, className = '', style = {} }) => (
  <motion.div className={className} style={style} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}>
    {children}
  </motion.div>
)

const placeholderBg = 'repeating-linear-gradient(135deg,#EAE0D9 0 12px,#F6F0EB 12px 24px)'
const Framed = ({ src, width = 116, height = 146, radius = '60px 60px 18px 18px', style = {} }) => (
  <div style={{ position: 'relative', flex: `0 0 ${width}px`, width, height, borderRadius: radius, overflow: 'hidden', background: placeholderBg, border: `1px solid rgba(195,161,93,.4)`, ...style }}>
    {src && <img src={src} alt="" className="w-full h-full object-cover" />}
  </div>
)

const btnPill = { border: 'none', cursor: 'pointer', background: goldGrad, color: '#FFF9EF', fontFamily: F.sans, letterSpacing: '.24em', textTransform: 'uppercase', borderRadius: 999 }

// ─── SEEDED PARTICLE LAYERS ──────────────────────────────────────
const genDust = () => {
  const rnd = seeded(3)
  return Array.from({ length: 46 }, (_, i) => ({
    x: rnd() * 100, y: rnd() * 100, s: 1.5 + rnd() * 3.5,
    d: rnd() * 8, t: 4 + rnd() * 7, o: 0.25 + rnd() * 0.6, gold: i % 3 === 0,
  }))
}
const genPetals = () => {
  const rp = seeded(11)
  const hues = [c.opalPink, c.opalMint, c.opalLilac, c.opalChamp]
  return Array.from({ length: 14 }, () => ({
    x: rp() * 100, s: 9 + rp() * 12, d: rp() * 16, t: 14 + rp() * 12,
    hue: hues[Math.floor(rp() * 4) % 4],
  }))
}

const Stardust = ({ dust }) => (
  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2, overflow: 'hidden' }}>
    {dust.map((p, i) => (
      <div key={i} style={{
        position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, borderRadius: '50%',
        background: p.gold ? c.goldLight : '#FFFFFF',
        boxShadow: `0 0 ${p.s * 3}px rgba(231,200,126,.9)`, opacity: p.o,
        animation: `op-twinkle ${p.t}s ease-in-out ${p.d}s infinite, op-float ${p.t * 2.4}s ease-in-out ${p.d}s infinite`,
      }} />
    ))}
  </div>
)

const Petals = ({ petals }) => (
  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3, overflow: 'hidden' }}>
    {petals.map((p, i) => (
      <div key={i} style={{
        position: 'absolute', left: `${p.x}%`, top: 0, width: p.s, height: p.s * 0.62,
        borderRadius: '50% 50% 50% 50% / 62% 62% 38% 38%',
        background: `linear-gradient(140deg, ${p.hue}, rgba(255,255,255,.75))`,
        opacity: 0, animation: `op-petal ${p.t}s linear ${p.d}s infinite`,
      }} />
    ))}
  </div>
)

// ═══════════════════════════════════════════════════════════════════
//  SECTIONS — placeholders for now, filled in over P3+
// ═══════════════════════════════════════════════════════════════════

// ─── FILIGREE (self-drawing gold ornament on each cover door) ────
const strokeBase = { fill: 'none', stroke: c.gold, strokeWidth: 1, strokeLinecap: 'round' }
const draw = (dur, delay) => ({ strokeDasharray: 900, strokeDashoffset: 900, animation: `op-draw ${dur}s cubic-bezier(.4,.1,.2,1) ${delay}s forwards` })
const Filigree = ({ mirror }) => (
  <svg viewBox="0 0 240 540" preserveAspectRatio="none" className="absolute inset-0 pointer-events-none"
    style={{ width: '100%', height: '100%', opacity: 0.5, transform: mirror ? 'scaleX(-1)' : 'none' }}>
    <rect x={14} y={14} width={212} height={512} rx={14} {...strokeBase} strokeOpacity={0.45} style={draw(2.6, 0.1)} />
    <rect x={24} y={24} width={192} height={492} rx={10} {...strokeBase} strokeOpacity={0.25} style={draw(2.6, 0.35)} />
    <circle cx={178} cy={212} r={62} {...strokeBase} strokeOpacity={0.5} style={draw(3, 0.5)} />
    <circle cx={178} cy={212} r={44} {...strokeBase} strokeOpacity={0.35} style={draw(3, 0.8)} />
    <circle cx={178} cy={212} r={7} fill={c.gold} fillOpacity={0.55} stroke="none" />
    <path d="M178 90 A 82 82 0 0 0 178 334" {...strokeBase} strokeOpacity={0.5} style={draw(3.2, 0.7)} />
    <path d="M178 130 A 52 52 0 0 0 178 294" {...strokeBase} strokeOpacity={0.32} style={draw(3.2, 1)} />
    <path d="M178 48 V 66" {...strokeBase} strokeOpacity={0.4} style={draw(2, 1.1)} />
    <path d="M178 376 V 474" {...strokeBase} strokeOpacity={0.4} style={draw(2, 1.1)} />
    <rect x={165} y={53} width={26} height={26} transform="rotate(45 178 66)" {...strokeBase} strokeOpacity={0.5} style={draw(2.2, 1.2)} />
    <rect x={165} y={461} width={26} height={26} transform="rotate(45 178 474)" {...strokeBase} strokeOpacity={0.5} style={draw(2.2, 1.35)} />
    <circle cx={88} cy={212} r={5} fill={c.gold} fillOpacity={0.5} stroke="none" />
    <path d="M88 210 V 150" {...strokeBase} strokeOpacity={0.3} style={draw(2.4, 1.45)} />
    <path d="M88 330 V 390" {...strokeBase} strokeOpacity={0.3} style={draw(2.4, 1.45)} />
  </svg>
)

// ─── DIVIDER (self-drawing, reveals on scroll) ────────────────────
const Divider = () => (
  <motion.svg viewBox="0 0 300 60" style={{ width: 220, height: 44, display: 'block', margin: '0 auto' }}
    initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}>
    {[
      { d: 'M10 30 H110', delay: 0, op: 0.55 },
      { d: 'M190 30 H290', delay: 0, op: 0.55 },
      { d: 'M110 30 A 20 20 0 0 1 150 30 A 20 20 0 0 0 190 30', delay: 0.15, op: 0.5 },
    ].map((p, i) => (
      <motion.path key={i} d={p.d} {...strokeBase} strokeOpacity={p.op}
        variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 1.2, delay: p.delay, ease: [0.4, 0.1, 0.2, 1] } } }} />
    ))}
    <motion.circle cx={150} cy={14} r={5} {...strokeBase} strokeOpacity={0.5}
      initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.35 }} />
    <motion.rect x={143} y={37} width={14} height={14} transform="rotate(45 150 44)" {...strokeBase} strokeOpacity={0.5}
      initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.45 }} />
  </motion.svg>
)

// Small framed photo, visible on the closed cover, that mirrors the big
// door mechanism — its two halves rotate open in sync with animateClose.
const CoverPhotoFrame = ({ src, animateClose }) => (
  <div className="relative mx-auto" style={{ width: 168, height: 206, borderRadius: '84px 84px 20px 20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,.5)', boxShadow: '0 20px 44px rgba(30,20,14,.35)', perspective: 700, background: placeholderBg }}>
    <div className="absolute top-0 bottom-0 left-0 pointer-events-none" style={{
      width: '50%', transformOrigin: 'left center', transformStyle: 'preserve-3d',
      backgroundImage: src ? `url("${src}")` : 'none', backgroundSize: '200% 100%', backgroundPosition: 'left center', backgroundRepeat: 'no-repeat',
      animation: animateClose ? 'op-doorL 1.7s cubic-bezier(.6,.02,.2,1) forwards' : 'none',
    }} />
    <div className="absolute top-0 bottom-0 right-0 pointer-events-none" style={{
      width: '50%', transformOrigin: 'right center', transformStyle: 'preserve-3d',
      backgroundImage: src ? `url("${src}")` : 'none', backgroundSize: '200% 100%', backgroundPosition: 'right center', backgroundRepeat: 'no-repeat',
      animation: animateClose ? 'op-doorR 1.7s cubic-bezier(.6,.02,.2,1) forwards' : 'none',
    }} />
  </div>
)

// ─── 0. COVER ────────────────────────────────────────────────────
const Cover = ({ data, groomNick, brideNick, heroDate, guestName, handleOpen, animateClose }) => (
  <div className="fixed inset-0 flex justify-center" style={{ zIndex: 90, background: '#2E2722', animation: animateClose ? 'op-coverOut 2.1s ease forwards' : 'none' }}>
    <div className="relative w-full h-full overflow-hidden" style={{ maxWidth: 480, perspective: 1600 }}>
      <div className="absolute pointer-events-none" style={{ inset: '-6%', animation: 'op-pan 24s ease-in-out infinite alternate', background: data?.meta?.coverPhoto ? `url("${data.meta.coverPhoto}") center/cover no-repeat` : placeholderBg }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(44,34,28,.35) 0%, rgba(44,34,28,.15) 40%, rgba(44,34,28,.78) 100%)' }} />

      <div className="absolute top-0 bottom-0 left-0 pointer-events-none" style={{
        width: '50.4%', transformOrigin: 'left center', transformStyle: 'preserve-3d',
        backgroundColor: c.ivoryDoor, backgroundImage: `url("${A.coverRelief}")`, backgroundSize: '198.4% 100%', backgroundPosition: 'left center', backgroundRepeat: 'no-repeat',
        boxShadow: 'inset -18px 0 40px rgba(94,72,50,.18)',
        animation: animateClose ? 'op-doorL 1.7s cubic-bezier(.6,.02,.2,1) forwards' : 'none',
      }}>
        <Filigree mirror={false} />
      </div>
      <div className="absolute top-0 bottom-0 right-0 pointer-events-none" style={{
        width: '50.4%', transformOrigin: 'right center', transformStyle: 'preserve-3d',
        backgroundColor: c.ivoryDoor, backgroundImage: `url("${A.coverRelief}")`, backgroundSize: '198.4% 100%', backgroundPosition: 'right center', backgroundRepeat: 'no-repeat',
        boxShadow: 'inset 18px 0 40px rgba(94,72,50,.18)',
        animation: animateClose ? 'op-doorR 1.7s cubic-bezier(.6,.02,.2,1) forwards' : 'none',
      }}>
        <Filigree mirror={true} />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-end text-center" style={{ padding: '0 36px 66px', color: '#FFF8F0' }}>
        <p className="uppercase" style={{ margin: '0 0 12px', fontFamily: F.sans, fontSize: 10, letterSpacing: '.45em', color: c.muted2 }}>The Wedding Of</p>
        <CoverPhotoFrame src={data?.meta?.coverPhoto} animateClose={animateClose} />
        <h1 style={{
          margin: '18px 0 0', fontFamily: F.script, fontSize: 56, lineHeight: 1.06, fontWeight: 400,
          background: `linear-gradient(100deg,${c.goldDeep} 18%,${c.goldMid} 34%,${c.goldLight} 46%,${c.goldDeep} 64%)`,
          backgroundSize: '220% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          animation: 'op-shimmer 6s linear infinite',
        }}>{groomNick} &amp; {brideNick}</h1>
        <p style={{ margin: '14px 0 0', fontFamily: F.serif, fontSize: 16, letterSpacing: '.24em', color: c.body }}>{heroDate}</p>

        <div style={{ marginTop: 30, padding: '16px 22px', borderRadius: 20, background: 'rgba(255,255,255,.6)', border: `1px solid rgba(195,161,93,.4)`, backdropFilter: 'blur(12px)', boxShadow: '0 12px 30px rgba(94,72,50,.12)' }}>
          <p className="uppercase" style={{ margin: 0, fontFamily: F.sans, fontSize: 9.5, letterSpacing: '.3em', color: c.muted2 }}>Kepada Yth.</p>
          <p style={{ margin: '8px 0 0', fontFamily: F.serif, fontSize: 21, color: c.ink }}>{guestName}</p>
        </div>

        <button onClick={handleOpen} style={{ ...btnPill, marginTop: 26, fontSize: 11, padding: '15px 34px', boxShadow: '0 16px 34px rgba(142,113,52,.32)' }}>Buka Undangan</button>
      </div>
    </div>
  </div>
)

// ─── 1. HERO ─────────────────────────────────────────────────────
const Hero = ({ data, groomNick, brideNick, heroDate, countdown }) => {
  const parts = [['Hari', pad2(countdown?.d)], ['Jam', pad2(countdown?.h)], ['Menit', pad2(countdown?.m)], ['Detik', pad2(countdown?.s)]]
  return (
    <section id="op-home" className="relative flex flex-col justify-end overflow-hidden" style={{ zIndex: 1, height: '100svh', minHeight: 640 }}>
      <div className="absolute pointer-events-none" style={{ inset: '-6%', animation: 'op-pan 26s ease-in-out infinite alternate', background: data?.meta?.photo ? `url("${data.meta.photo}") center/cover no-repeat` : placeholderBg }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(252,249,247,.7) 0%, rgba(252,249,247,0) 20%, rgba(44,34,28,.34) 42%, rgba(44,34,28,.6) 62%, rgba(30,22,17,.76) 100%)' }} />

      <div className="relative text-center" style={{ padding: '0 34px 116px', color: '#FFF8F0' }}>
        <p className="uppercase" style={{ margin: '0 0 14px', fontFamily: F.sans, fontSize: 11, letterSpacing: '.42em', color: 'rgba(255,248,240,.78)' }}>The Wedding Of</p>
        <h1 style={{
          margin: 0, fontFamily: F.script, fontSize: 58, lineHeight: 1.05, fontWeight: 400, textShadow: '0 6px 30px rgba(30,20,14,.45)',
          background: 'linear-gradient(100deg,#FFF6E8 20%,#FFFFFF 34%,#F3DFB8 48%,#FFF6E8 66%)',
          backgroundSize: '220% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          animation: 'op-shimmer 7s linear infinite',
        }}>{groomNick} &amp; {brideNick}</h1>
        <p style={{ margin: '18px 0 0', fontFamily: F.serif, fontSize: 17, letterSpacing: '.2em', color: 'rgba(255,248,240,.92)' }}>{heroDate}</p>

        {(data?.countdownEnabled ?? true) && (
          <div className="grid grid-cols-4" style={{ marginTop: 26, gap: 8 }}>
            {parts.map(([label, val]) => (
              <div key={label} style={{ borderRadius: 18, padding: '12px 6px 10px', background: 'rgba(255,250,244,.14)', border: '1px solid rgba(255,246,232,.32)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontFamily: F.serif, fontSize: 27, lineHeight: 1, color: '#FFF7EC' }}>{val}</div>
                <div className="uppercase" style={{ marginTop: 5, fontSize: 9, letterSpacing: '.22em', color: 'rgba(255,246,232,.7)' }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── 2. QUOTE ────────────────────────────────────────────────────
const Quote = ({ data }) => (
  <section className="relative text-center" style={{ zIndex: 1, padding: '92px 34px' }}>
    <Reveal>
      <Divider />
      <p style={{ margin: '30px 0 0', fontFamily: F.serif, fontStyle: 'italic', fontSize: 20, lineHeight: 1.85, color: '#4A4038', textWrap: 'pretty' }}>{data?.quote}</p>
      <div style={{ margin: '28px auto 0', width: 52, height: 1, background: 'linear-gradient(90deg,transparent,#C3A15D,transparent)' }} />
    </Reveal>
  </section>
)

// ─── 3. COUPLE ───────────────────────────────────────────────────
const PersonCard = ({ person, role, reverse, sheenDelay }) => (
  <Reveal className="relative" style={{ marginBottom: reverse ? 0 : 34, padding: 22, borderRadius: 22, background: 'linear-gradient(160deg,#FFFFFF 0%,#FBF5F1 100%)', border: '1px solid rgba(195,161,93,.28)', boxShadow: '0 18px 48px rgba(94,72,50,.10)', overflow: 'hidden' }}>
    <div className="absolute inset-0 pointer-events-none" style={{ top: 0, left: 0, width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.85),transparent)', animation: `op-sheen 6s ease-in-out ${sheenDelay}s infinite` }} />
    <div className="relative flex items-center" style={{ gap: 18, flexDirection: reverse ? 'row-reverse' : 'row', textAlign: reverse ? 'right' : 'left' }}>
      <Framed src={person?.photo} />
      <div style={{ minWidth: 0 }}>
        <h3 style={{ margin: 0, fontFamily: F.script, fontSize: 34, fontWeight: 400, color: c.ink }}>{person?.nickname}</h3>
        <p style={{ margin: '4px 0 0', fontFamily: F.serif, fontSize: 16, color: c.body }}>{person?.name}</p>
        <p style={{ margin: '10px 0 0', fontSize: 12, lineHeight: 1.7, color: c.muted }}>{role} dari {person?.father}<br />&amp; {person?.mother}</p>
        {person?.instagram && (
          <a href={`https://instagram.com/${person.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center" style={{ gap: 6, marginTop: 12, padding: '7px 14px', borderRadius: 999, border: `1px solid rgba(195,161,93,.5)`, fontSize: 11, letterSpacing: '.08em', color: c.goldDeep }}>
            @{person.instagram.replace('@', '')}
          </a>
        )}
      </div>
    </div>
  </Reveal>
)

const Couple = ({ data }) => (
  <section id="op-couple" className="relative" style={{ zIndex: 1, padding: '12px 26px 96px' }}>
    <div className="text-center" style={{ marginBottom: 44 }}>
      <Kicker>Bismillahirrahmanirrahim</Kicker>
      <SectionTitle>Mempelai</SectionTitle>
    </div>

    <PersonCard person={data?.groom} role="Putra" sheenDelay={0} />

    <div className="flex items-center justify-center" style={{ gap: 14, margin: '0 0 34px' }}>
      <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg,transparent,rgba(195,161,93,.55))' }} />
      <div className="relative flex items-center justify-center" style={{ width: 38, height: 38 }}>
        <div className="absolute inset-0 rounded-full" style={{ border: `1px solid rgba(195,161,93,.6)`, animation: 'op-ring 3.4s ease-out infinite' }} />
        <div style={{ width: 9, height: 9, transform: 'rotate(45deg)', background: 'linear-gradient(135deg,#E7C87E,#B08F4B)' }} />
      </div>
      <div style={{ height: 1, flex: 1, background: 'linear-gradient(270deg,transparent,rgba(195,161,93,.55))' }} />
    </div>

    <PersonCard person={data?.bride} role="Putri" reverse sheenDelay={1.6} />
  </section>
)

// ─── 4. ACARA ────────────────────────────────────────────────────
const Acara = ({ data }) => {
  const events = data?.events || []
  const [active, setActive] = useState(0)
  const ev = events[active]
  if (!ev) return null
  const d = ev.date ? new Date(`${ev.date}T00:00:00`) : null

  return (
    <section id="op-acara" className="relative" style={{ zIndex: 1, padding: '0 26px 96px' }}>
      <div className="text-center" style={{ marginBottom: 26 }}>
        <SectionTitle style={{ margin: 0 }}>Rangkaian Acara</SectionTitle>
        <p className="uppercase" style={{ margin: '8px 0 0', fontSize: 11, letterSpacing: '.28em', color: c.muted3 }}>Save The Date</p>
      </div>

      {events.length > 1 && (
        <div className="flex" style={{ gap: 6, padding: 5, borderRadius: 999, background: 'rgba(255,255,255,.7)', border: `1px solid rgba(195,161,93,.28)`, backdropFilter: 'blur(10px)', marginBottom: 22 }}>
          {events.map((e, i) => (
            <button key={e.id ?? i} onClick={() => setActive(i)} style={{
              flex: 1, padding: '11px 8px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontFamily: F.sans, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', transition: 'all .35s ease',
              background: active === i ? goldGrad : 'transparent', color: active === i ? '#FFF9EF' : c.goldDeep,
              boxShadow: active === i ? '0 8px 20px rgba(142,113,52,.26)' : 'none',
            }}>{e.name}</button>
          ))}
        </div>
      )}

      <Reveal className="relative text-center" style={{ padding: '30px 24px 26px', borderRadius: 22, background: 'linear-gradient(165deg,#FFFFFF,#FAF3EE)', border: `1px solid rgba(195,161,93,.3)`, boxShadow: '0 20px 54px rgba(94,72,50,.12)', overflow: 'hidden' }}>
        <div className="absolute pointer-events-none" style={{ inset: 8, borderRadius: 16, border: `1px solid rgba(195,161,93,.18)` }} />
        <p className="uppercase" style={{ margin: 0, fontSize: 10, letterSpacing: '.4em', color: c.muted3 }}>{ev.name}</p>
        <div className="flex items-center justify-center" style={{ margin: '16px 0 6px', gap: 16 }}>
          <div style={{ height: 1, width: 34, background: 'rgba(195,161,93,.6)' }} />
          <div style={{ fontFamily: F.serif, fontSize: 52, lineHeight: 1, color: c.ink }}>{d ? d.getDate() : '—'}</div>
          <div style={{ height: 1, width: 34, background: 'rgba(195,161,93,.6)' }} />
        </div>
        <p style={{ margin: '6px 0 0', fontFamily: F.serif, fontSize: 17, color: c.body }}>{ev.dateLabel || fmtDate(ev.date)}</p>
        <p style={{ margin: '14px 0 0', fontSize: 13, letterSpacing: '.06em', color: c.muted }}>{fmtTime(ev.start)} – {fmtTime(ev.end)} {ev.tz}</p>
        <div style={{ margin: '20px auto 0', width: 44, height: 1, background: 'linear-gradient(90deg,transparent,#C3A15D,transparent)' }} />
        <p style={{ margin: '18px 0 0', fontFamily: F.serif, fontSize: 20, color: c.ink }}>{ev.venue}</p>
        <p style={{ margin: '8px 0 0', fontSize: 12.5, lineHeight: 1.8, color: c.muted, textWrap: 'pretty' }}>{ev.address}</p>
        {ev.maps && (
          <a href={ev.maps} target="_blank" rel="noopener noreferrer" className="inline-block uppercase" style={{ ...btnPill, marginTop: 20, fontSize: 11.5, padding: '12px 26px', boxShadow: '0 12px 26px rgba(142,113,52,.28)' }}>Petunjuk Arah</a>
        )}
      </Reveal>
    </section>
  )
}

// ─── 5. LOVE STORY ───────────────────────────────────────────────
const LoveStory = ({ data }) => {
  const story = data?.loveStory || []
  if (!story.length) return null
  return (
    <section className="relative" style={{ zIndex: 1, padding: '0 26px 96px' }}>
      <div className="text-center" style={{ marginBottom: 34 }}>
        <SectionTitle style={{ margin: 0 }}>Perjalanan Cinta</SectionTitle>
        <p className="uppercase" style={{ margin: '8px 0 0', fontSize: 11, letterSpacing: '.28em', color: c.muted3 }}>Our Story</p>
      </div>
      <div className="relative" style={{ paddingLeft: 28 }}>
        <div className="absolute" style={{ left: 7, top: 6, bottom: 6, width: 1, background: 'linear-gradient(180deg,transparent,rgba(195,161,93,.7),rgba(195,161,93,.7),transparent)' }} />
        {story.map((ls, i) => (
          <Reveal key={ls.id ?? i} className="relative" style={{ marginBottom: 26 }}>
            <div className="absolute" style={{ left: -25, top: 8, width: 9, height: 9, transform: 'rotate(45deg)', background: 'linear-gradient(135deg,#E7C87E,#B08F4B)', boxShadow: '0 0 0 4px rgba(195,161,93,.14)' }} />
            <div style={{ borderRadius: 20, overflow: 'hidden', background: '#FFFFFF', border: `1px solid rgba(195,161,93,.24)`, boxShadow: '0 14px 36px rgba(94,72,50,.08)' }}>
              <div style={{ height: 132, background: placeholderBg }}>
                {ls.photo && <img src={ls.photo} alt="" className="w-full h-full object-cover" />}
              </div>
              <div style={{ padding: '16px 18px 18px' }}>
                <span style={{ fontSize: 10, letterSpacing: '.3em', color: c.muted3 }}>{ls.year}</span>
                <h4 style={{ margin: '6px 0 6px', fontFamily: F.serif, fontWeight: 500, fontSize: 20, color: c.ink }}>{ls.title}</h4>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.8, color: c.muted, textWrap: 'pretty' }}>{ls.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

// ─── 6. DRESSCODE ────────────────────────────────────────────────
const Dresscode = ({ data }) => {
  const dc = data?.dresscode
  if (!dc?.name && !dc?.color) return null
  return (
    <section className="relative" style={{ zIndex: 1, padding: '0 26px 96px' }}>
      <Reveal className="text-center" style={{ padding: '34px 24px', borderRadius: 22, background: 'linear-gradient(150deg,#F7EFE9,#FDF9F6)', border: `1px solid rgba(195,161,93,.26)` }}>
        <p className="uppercase" style={{ margin: 0, fontSize: 10, letterSpacing: '.4em', color: c.muted3 }}>Dresscode</p>
        <div className="flex justify-center" style={{ margin: '22px auto 0', gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: dc.color || c.opalPink, boxShadow: '0 8px 20px rgba(94,72,50,.14)', border: '2px solid #FFFFFF' }} />
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: c.opalMint, boxShadow: '0 8px 20px rgba(94,72,50,.14)', border: '2px solid #FFFFFF' }} />
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: c.opalLilac, boxShadow: '0 8px 20px rgba(94,72,50,.14)', border: '2px solid #FFFFFF' }} />
        </div>
        <h4 style={{ margin: '20px 0 0', fontFamily: F.serif, fontWeight: 500, fontSize: 22, color: c.ink }}>{dc.name}</h4>
        <p style={{ margin: '8px 0 0', fontSize: 12.5, lineHeight: 1.8, color: c.muted }}>{dc.notes}</p>
      </Reveal>
    </section>
  )
}

// ─── 7. GALLERY (carousel) ────────────────────────────────────────
const Gallery = ({ data }) => {
  const photos = (data?.gallery || []).map((g) => (typeof g === 'string' ? g : g?.src)).filter(Boolean)
  const [idx, setIdx] = useState(0)
  if (!photos.length) return null
  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length)
  const next = () => setIdx((i) => (i + 1) % photos.length)

  return (
    <section id="op-galeri" className="relative" style={{ zIndex: 1, padding: '0 0 96px' }}>
      <div className="text-center" style={{ marginBottom: 26, padding: '0 26px' }}>
        <SectionTitle style={{ margin: 0 }}>Galeri</SectionTitle>
        <p className="uppercase" style={{ margin: '8px 0 0', fontSize: 11, letterSpacing: '.28em', color: c.muted3 }}>Moments</p>
      </div>
      <div className="relative overflow-hidden" style={{ padding: '0 26px' }}>
        <div className="flex" style={{ gap: 14, transition: 'transform .7s cubic-bezier(.22,.75,.2,1)', transform: `translateX(calc(${-idx * 100}% - ${idx * 14}px))` }}>
          {photos.map((src, i) => (
            <div key={i} style={{ flex: '0 0 100%', height: 400, borderRadius: 22, overflow: 'hidden', border: `1px solid rgba(195,161,93,.3)`, boxShadow: '0 20px 50px rgba(94,72,50,.12)' }}>
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center" style={{ gap: 18, marginTop: 20 }}>
        <button onClick={prev} className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid rgba(195,161,93,.5)`, background: 'rgba(255,255,255,.7)', color: c.goldDeep, fontSize: 16, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>‹</button>
        <span style={{ fontFamily: F.serif, fontSize: 15, color: c.muted, letterSpacing: '.14em' }}>{idx + 1} / {photos.length}</span>
        <button onClick={next} className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid rgba(195,161,93,.5)`, background: 'rgba(255,255,255,.7)', color: c.goldDeep, fontSize: 16, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>›</button>
      </div>
    </section>
  )
}

// ─── 8. LIVE STREAMING ───────────────────────────────────────────
const LiveStream = ({ data }) => {
  const platforms = data?.livestreamEnabled ? (data?.livestreamPlatforms || []).filter((p) => p?.url) : []
  if (!platforms.length) return null
  return (
    <section className="relative" style={{ zIndex: 1, padding: '0 26px 96px' }}>
      <Reveal className="relative text-center" style={{ padding: '30px 24px', borderRadius: 22, background: 'linear-gradient(160deg,#2E2722,#4A3D31)', color: '#FBF3E7', boxShadow: '0 22px 54px rgba(46,39,34,.3)', overflow: 'hidden' }}>
        <div className="absolute pointer-events-none" style={{ inset: '-60%', opacity: 0.22, filter: 'blur(50px)', background: opalConic, animation: 'op-opal 60s linear infinite' }} />
        <div className="relative">
          <p className="uppercase" style={{ margin: 0, fontSize: 10, letterSpacing: '.4em', color: 'rgba(251,243,231,.62)' }}>Live Streaming</p>
          <h4 style={{ margin: '12px 0 8px', fontFamily: F.serif, fontWeight: 400, fontSize: 23 }}>Untuk yang berhalangan hadir</h4>
          <p style={{ margin: '0 0 20px', fontSize: 12.5, lineHeight: 1.8, color: 'rgba(251,243,231,.68)' }}>Saksikan momen sakral kami secara langsung.</p>
          <div className="flex flex-col" style={{ gap: 10 }}>
            {platforms.map((lv, i) => (
              <a key={lv.id ?? i} href={lv.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between" style={{ padding: '14px 18px', borderRadius: 16, background: 'rgba(251,243,231,.09)', border: `1px solid rgba(251,243,231,.22)`, color: '#FBF3E7', fontSize: 13, letterSpacing: '.06em' }}>
                <span>{lv.type || 'Live Streaming'}</span>
                <span className="uppercase" style={{ fontSize: 11, letterSpacing: '.2em', color: c.goldLight }}>Tonton</span>
              </a>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

// ─── 9. RSVP & UCAPAN ────────────────────────────────────────────
const WishRsvp = ({ data, wishes, onSubmitWish }) => {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [att, setAtt] = useState('hadir')
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    if (busy || !name.trim() || !msg.trim()) return
    setBusy(true)
    try { if (onSubmitWish) await onSubmitWish({ name, message: msg, attendance: att }); setName(''); setMsg(''); setAtt('hadir') } finally { setBusy(false) }
  }
  const list = wishes || data?.rsvps || []
  const field = { width: '100%', boxSizing: 'border-box', padding: '13px 16px', borderRadius: 12, border: `1px solid rgba(195,161,93,.34)`, background: '#FDFAF8', fontSize: 13.5, color: c.ink, outline: 'none' }
  const toggle = (on) => ({ flex: 1, padding: '11px 8px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: F.sans, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', transition: 'all .35s ease', background: on ? goldGrad : 'transparent', color: on ? '#FFF9EF' : c.goldDeep, boxShadow: on ? '0 8px 20px rgba(142,113,52,.26)' : 'none' })

  return (
    <section id="op-rsvp" className="relative" style={{ zIndex: 1, padding: '0 26px 96px' }}>
      <div className="text-center" style={{ marginBottom: 26 }}>
        <SectionTitle style={{ margin: 0 }}>Ucapan &amp; Doa</SectionTitle>
        <p className="uppercase" style={{ margin: '8px 0 0', fontSize: 11, letterSpacing: '.28em', color: c.muted3 }}>RSVP</p>
      </div>

      <Reveal style={{ padding: 22, borderRadius: 22, background: '#FFFFFF', border: `1px solid rgba(195,161,93,.26)`, boxShadow: '0 18px 44px rgba(94,72,50,.09)' }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kamu" style={{ ...field, marginBottom: 10 }} />
        <div className="flex" style={{ gap: 10, marginBottom: 10 }}>
          <button type="button" onClick={() => setAtt('hadir')} style={toggle(att === 'hadir')}>Hadir</button>
          <button type="button" onClick={() => setAtt('tidak_hadir')} style={toggle(att === 'tidak_hadir')}>Berhalangan</button>
        </div>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} placeholder="Tulis ucapan & doa" style={{ ...field, resize: 'none', marginBottom: 12 }} />
        <button onClick={submit} disabled={busy} style={{ ...btnPill, width: '100%', padding: 14, fontSize: 11.5, boxShadow: '0 14px 30px rgba(142,113,52,.28)', opacity: busy ? 0.7 : 1 }}>{busy ? 'Mengirim…' : 'Kirim Ucapan'}</button>
      </Reveal>

      {list.length > 0 && (
        <div className="flex flex-col" style={{ marginTop: 20, maxHeight: 330, overflowY: 'auto', gap: 12, paddingRight: 2 }}>
          {list.map((w, i) => {
            const hadir = w.rsvp === 'hadir'
            return (
              <div key={w.id ?? i} style={{ padding: '16px 18px', borderRadius: 18, background: 'rgba(255,255,255,.72)', border: `1px solid rgba(195,161,93,.2)`, backdropFilter: 'blur(8px)' }}>
                <div className="flex items-center justify-between" style={{ gap: 10 }}>
                  <span style={{ fontFamily: F.serif, fontSize: 17, color: c.ink }}>{w.name}</span>
                  {w.rsvp && (
                    <span className="uppercase whitespace-nowrap" style={{ fontSize: 9.5, letterSpacing: '.16em', padding: '5px 10px', borderRadius: 999, color: hadir ? c.hadir : c.absen, background: hadir ? c.hadirBg : c.absenBg }}>{hadir ? 'Hadir' : 'Berhalangan'}</span>
                  )}
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 12.5, lineHeight: 1.75, color: c.muted, textWrap: 'pretty' }}>{w.wish || w.message}</p>
                <span className="uppercase" style={{ display: 'block', marginTop: 8, fontSize: 10, letterSpacing: '.16em', color: '#BCADA2' }}>{w.time}</span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ─── 10. GIFT ────────────────────────────────────────────────────
const Gift = ({ data }) => {
  const { copiedKey, copy } = useCopyToClipboard()
  const accounts = data?.accounts || []
  if (!accounts.length) return null
  return (
    <section id="op-hadiah" className="relative" style={{ zIndex: 1, padding: '0 26px 96px' }}>
      <div className="text-center" style={{ marginBottom: 24 }}>
        <SectionTitle style={{ margin: 0 }}>Kado Pernikahan</SectionTitle>
        <p style={{ margin: '10px 0 0', fontSize: 12.5, lineHeight: 1.8, color: c.muted }}>Doa restu Anda sudah lebih dari cukup. Namun bila ingin memberi tanda kasih, silakan melalui:</p>
      </div>
      <div className="flex flex-col" style={{ gap: 12 }}>
        {accounts.map((acc, i) => {
          const key = acc.id ?? acc.number ?? i
          const copied = copiedKey === key
          return (
            <Reveal key={key} className="relative" style={{ padding: 20, borderRadius: 20, background: 'linear-gradient(135deg,#FFFFFF,#F8F1EC)', border: `1px solid rgba(195,161,93,.3)`, boxShadow: '0 16px 38px rgba(94,72,50,.09)', overflow: 'hidden' }}>
              <div className="absolute inset-0 pointer-events-none" style={{ top: 0, left: 0, width: '50%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.8),transparent)', animation: 'op-sheen 7s ease-in-out infinite' }} />
              <div className="relative flex items-center justify-between" style={{ gap: 12 }}>
                <div>
                  <p className="uppercase" style={{ margin: 0, fontSize: 10, letterSpacing: '.3em', color: c.muted3 }}>{acc.bank}</p>
                  <p style={{ margin: '8px 0 0', fontFamily: F.serif, fontSize: 22, letterSpacing: '.06em', color: c.ink }}>{acc.number}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: c.muted }}>a.n. {acc.holder}</p>
                </div>
                <button onClick={() => copy(acc.number, key)} className="uppercase whitespace-nowrap" style={{ padding: '10px 16px', borderRadius: 999, border: `1px solid rgba(195,161,93,.5)`, background: 'rgba(255,255,255,.8)', color: c.goldDeep, fontSize: 10.5, letterSpacing: '.18em', cursor: 'pointer' }}>{copied ? 'Tersalin' : 'Salin'}</button>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

// ─── 11. TURUT MENGUNDANG ────────────────────────────────────────
const TurutMengundang = ({ data }) => {
  if (!data?.turutMengundangEnabled) return null
  const families = (data?.families || [])
    .map((f) => ({ ...f, members: (f.members || []).filter((m) => m && m.trim()) }))
    .filter((f) => f.members.length)
  if (!families.length) return null
  return (
    <section className="relative text-center" style={{ zIndex: 1, padding: '0 26px 96px' }}>
      <h2 style={{ margin: '0 0 6px', fontFamily: F.serif, fontWeight: 400, fontSize: 30, color: c.ink }}>Turut Mengundang</h2>
      <div style={{ margin: '14px auto 26px', width: 44, height: 1, background: 'linear-gradient(90deg,transparent,#C3A15D,transparent)' }} />
      <div className="grid" style={{ gap: 14 }}>
        {families.map((fam, i) => (
          <div key={fam.id ?? i} style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,.7)', border: `1px solid rgba(195,161,93,.22)` }}>
            <p className="uppercase" style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: '.3em', color: c.muted3 }}>{fam.side}</p>
            <p style={{ margin: 0, fontFamily: F.serif, fontSize: 16, lineHeight: 1.9, color: c.body }}>{fam.members.join(' · ')}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── 12. FOOTER ──────────────────────────────────────────────────
const Footer = ({ data, groomNick, brideNick, heroDate }) => (
  <section className="relative overflow-hidden flex items-end" style={{ zIndex: 1, height: 560 }}>
    <div className="absolute pointer-events-none" style={{ inset: '-6%', animation: 'op-pan 30s ease-in-out infinite alternate', background: data?.meta?.footerPhoto ? `url("${data.meta.footerPhoto}") center/cover no-repeat` : placeholderBg }} />
    <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(252,249,247,.85) 0%, rgba(252,249,247,0) 22%, rgba(44,34,28,.38) 44%, rgba(44,34,28,.64) 66%, rgba(30,22,17,.78) 100%)' }} />
    <div className="relative w-full text-center" style={{ padding: '0 34px 120px', color: '#FFF8F0' }}>
      <p style={{ margin: '0 0 14px', fontSize: 12.5, lineHeight: 1.9, color: 'rgba(255,248,240,.85)', textWrap: 'pretty' }}>Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu berkenan hadir memberikan doa restu.</p>
      <h3 style={{ margin: '16px 0 0', fontFamily: F.script, fontSize: 44, fontWeight: 400, color: '#FFF6E8' }}>{groomNick} &amp; {brideNick}</h3>
      <p className="uppercase" style={{ margin: '10px 0 0', fontSize: 11, letterSpacing: '.3em', color: 'rgba(255,248,240,.7)' }}>{heroDate}</p>
    </div>
  </section>
)

// ═══════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════

export default function OpalinePearlTheme({
  data, countdown, opened, setOpened,
  animateClose, setAnimateClose,
  musicPlaying, setMusicPlaying, audioRef,
  wishes, onSubmitWish, guestName,
}) {
  const groomNick = data?.groom?.nickname || 'Mempelai Pria'
  const brideNick = data?.bride?.nickname || 'Mempelai Wanita'
  const heroDate = dateLabelOf(data?.events?.[0])
  const guest = guestName || 'Bapak/Ibu/Saudara/i'
  const [dust] = useState(genDust)
  const [petals] = useState(genPetals)

  const handleOpen = () => {
    if (animateClose) return
    setAnimateClose(true)
    setMusicPlaying(true)
    setTimeout(() => setOpened(true), 2100)
  }

  return (
    <InvitationLayout layout={THEMES.OPALINE_PEARL} data={data} bgUrl="">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Parisienne&family=Jost:wght@300;400;500&display=swap');
        @keyframes op-twinkle { 0%,100% { opacity: .12; } 50% { opacity: .95; } }
        @keyframes op-float { 0% { transform: translate3d(0,0,0); } 50% { transform: translate3d(10px,-22px,0); } 100% { transform: translate3d(0,0,0); } }
        @keyframes op-petal { 0% { transform: translate3d(0,-12vh,0) rotate(0deg); opacity: 0; } 12% { opacity: .9; } 100% { transform: translate3d(46px,112vh,0) rotate(460deg); opacity: 0; } }
        @keyframes op-opal { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes op-pan { 0% { transform: translate3d(-3.5%,-2.5%,0); } 100% { transform: translate3d(3.5%,2.5%,0); } }
        @keyframes op-eq { 0%,100% { height: 4px; } 50% { height: 15px; } }
        @keyframes op-ring { 0% { transform: scale(1); opacity: .5; } 100% { transform: scale(1.75); opacity: 0; } }
        @keyframes op-sheen { 0% { transform: translateX(-140%) skewX(-18deg); } 100% { transform: translateX(240%) skewX(-18deg); } }
        @keyframes op-shimmer { 0% { background-position: 220% 0; } 100% { background-position: -220% 0; } }
        @keyframes op-draw { from { stroke-dashoffset: 900; } to { stroke-dashoffset: 0; } }
        @keyframes op-doorL { to { transform: perspective(1400px) rotateY(-96deg); } }
        @keyframes op-doorR { to { transform: perspective(1400px) rotateY(96deg); } }
        @keyframes op-coverOut { 0% { opacity: 1; } 55% { opacity: 1; } 100% { opacity: 0; visibility: hidden; } }
      `}</style>

      <div className="w-full relative h-full flex flex-col overflow-x-hidden" style={{ fontFamily: F.sans, color: c.ink, background: c.pearl }}>
        {data?.music !== false && (
          <audio ref={audioRef} src={data?.musicUrl || MUSIC_URLS[data?.musicId || 1] || MUSIC_URLS[1]} loop />
        )}

        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, background: 'linear-gradient(180deg, rgba(252,249,247,.12) 0%, rgba(252,249,247,.42) 26%, rgba(252,249,247,.52) 60%, rgba(252,249,247,.44) 100%)' }} />
        <div className="absolute pointer-events-none" style={{ inset: '-40% -40% auto -40%', height: '180%', zIndex: 0, opacity: 0.3, filter: 'blur(60px)', animation: 'op-opal 90s linear infinite', background: opalConic }} />
        <Stardust dust={dust} />
        <Petals petals={petals} />

        {!opened && (
          <Cover data={data} groomNick={groomNick} brideNick={brideNick} heroDate={heroDate} guestName={guest} handleOpen={handleOpen} animateClose={animateClose} />
        )}

        {opened && (
          <div className="flex flex-col w-full relative" style={{ zIndex: 1 }}>
            <Hero data={data} groomNick={groomNick} brideNick={brideNick} heroDate={heroDate} countdown={countdown} />
            <Quote data={data} />
            <Couple data={data} />
            <Acara data={data} />
            <LoveStory data={data} />
            <Dresscode data={data} />
            <Gallery data={data} />
            <LiveStream data={data} />
            <WishRsvp data={data} wishes={wishes} onSubmitWish={onSubmitWish} />
            <Gift data={data} />
            <TurutMengundang data={data} />
            <Footer data={data} groomNick={groomNick} brideNick={brideNick} heroDate={heroDate} />

            {/* Music toggle */}
            {data?.music !== false && (
              <button onClick={() => setMusicPlaying(!musicPlaying)} title="Musik"
                className="fixed md:absolute flex items-center justify-center" style={{ bottom: 96, right: 'max(18px, calc(50vw - 218px))', zIndex: 70, width: 50, height: 50, borderRadius: '50%', border: `1px solid rgba(195,161,93,.45)`, background: 'rgba(255,252,249,.72)', backdropFilter: 'blur(14px)', boxShadow: '0 12px 28px rgba(94,72,50,.18)', cursor: 'pointer', gap: 3 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ display: 'block', width: 3, height: musicPlaying ? 4 : 12, borderRadius: 2, background: c.goldDeep, animation: musicPlaying ? `op-eq ${0.6 + i * 0.16}s ease-in-out infinite` : 'none' }} />
                ))}
              </button>
            )}

            {/* Bottom nav */}
            <nav className="fixed md:absolute left-1/2 -translate-x-1/2 flex justify-between" style={{ bottom: 22, zIndex: 70, width: 'min(432px, calc(100vw - 32px))', gap: 2, padding: '8px 10px', borderRadius: 999, background: 'rgba(255,252,249,.62)', border: '1px solid rgba(255,255,255,.75)', boxShadow: '0 16px 40px rgba(94,72,50,.18), inset 0 1px 0 rgba(255,255,255,.9)', backdropFilter: 'blur(18px) saturate(1.3)' }}>
              {NAV.map(([label, id]) => (
                <button key={id} onClick={() => scrollToId(id)} style={{ flex: 1, border: 'none', cursor: 'pointer', background: 'transparent', color: c.goldDeep, fontFamily: F.sans, fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', padding: '9px 2px 8px', borderRadius: 999 }}>{label}</button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </InvitationLayout>
  )
}
