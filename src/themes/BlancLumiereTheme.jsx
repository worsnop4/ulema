import { useState } from 'react'
import { motion } from 'framer-motion'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { THEMES } from '../config/constants'

// ═══════════════════════════════════════════════════════════════════
//  BLANC LUMIÈRE — ivory white & champagne gold, floral watercolor
//  Category: Special. Built part-by-part from the "Blanc Lumière" handoff.
// ═══════════════════════════════════════════════════════════════════

// ─── PALETTE ─────────────────────────────────────────────────────
const c = {
  page:     '#FEFDFB',
  ivory:    '#F8F5EF',
  desk1:    '#FAF7F2',
  desk2:    '#EFEBE4',
  desk3:    '#E3DDD2',
  ink:      '#3C3931',
  ink2:     '#4A463D',
  body:     '#6F6A5E',
  muted:    '#8D866F',
  muted2:   '#A39D8F',
  muted3:   '#ABA697',
  ph:       '#B8B0A0',
  gold:     '#A98A4E',
  goldLight:'#D3BF93',
  goldHover:'#C8AC72',
  line:     '#EDE6D7',
  line2:    '#EFE8D9',
  line3:    '#F4EEE1',
  tabTrack: '#F1EADC',
  fieldBg:  '#FBF9F4',
  hadir:    '#5F7A62', hadirBrd: '#DCE6DA', hadirBg: '#F3F7F1',
  absen:    '#9C8760', absenBrd: '#EDE1CB', absenBg: '#FBF6EA',
}
const goldGrad = `linear-gradient(135deg, ${c.goldLight}, ${c.gold})`
const ivoryGrad = `linear-gradient(${c.ivory}, ${c.page})`

const F = {
  script: "'Pinyon Script', cursive",
  serif:  "'Cormorant Garamond', serif",
  sans:   "'Jost', sans-serif",
}

// ─── ASSETS ──────────────────────────────────────────────────────
const A = {
  background:  '/themes/Special/theme-11/background.jpg',
  bloom:       '/themes/Special/theme-11/bloom.png',
  poppies:     '/themes/Special/theme-11/poppies.png',
  wreathGold:  '/themes/Special/theme-11/wreath-gold.png',
  wreathSilver:'/themes/Special/theme-11/wreath-silver.png',
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

// ─── SCROLL HELPER ───────────────────────────────────────────────
// The invitation does not scroll the window — it scrolls inside the shell
// InvitationLayout wraps every theme in. window.scrollTo therefore aimed at a
// page with nothing to scroll and the nav buttons did nothing at all.
// scrollIntoView walks up to the nearest scrollable ancestor, which is the
// right one, and is what the themes with working navs already use.
const scrollToId = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const NAV = [['Home', 'home'], ['Mempelai', 'couple'], ['Acara', 'acara'], ['Galeri', 'galeri'], ['RSVP', 'rsvp'], ['Hadiah', 'hadiah']]

// ─── PRIMITIVES ──────────────────────────────────────────────────
const Kicker = ({ children }) => (
  <div className="uppercase" style={{ fontFamily: F.sans, fontWeight: 300, fontSize: 9, letterSpacing: '0.42em', color: c.muted2 }}>{children}</div>
)
const SectionTitle = ({ children, size = 48 }) => (
  <div style={{ fontFamily: F.script, fontSize: size, color: c.gold, lineHeight: 1.05, marginTop: 8 }}>{children}</div>
)
const Divider = () => (
  <div className="flex items-center justify-center" style={{ gap: 9, marginTop: 14 }}>
    <div style={{ width: 40, height: 1, background: `linear-gradient(to right, transparent, ${c.line})` }} />
    <div style={{ width: 4, height: 4, background: c.goldHover, transform: 'rotate(45deg)' }} />
    <div style={{ width: 40, height: 1, background: `linear-gradient(to left, transparent, ${c.line})` }} />
  </div>
)

const placeholderBg = 'repeating-linear-gradient(135deg, #F6F2EA 0 20px, #EFEAE0 20px 40px)'
const Framed = ({ src, radius = '110px 110px 6px 6px', style = {} }) => (
  <div style={{ position: 'relative', width: 216, margin: '0 auto', ...style }}>
    <div style={{ position: 'absolute', inset: -10, border: `1px solid ${c.line2}`, borderRadius: '118px 118px 10px 10px', pointerEvents: 'none' }} />
    <div style={{ position: 'relative', height: 270, borderRadius: radius, overflow: 'hidden', boxShadow: '0 26px 50px rgba(122,110,88,.18)', background: placeholderBg }}>
      {src && <img src={src} alt="" className="w-full h-full object-cover" />}
    </div>
  </div>
)

const btnPill = { border: 'none', cursor: 'pointer', background: goldGrad, color: '#FFFDF9', fontFamily: F.sans, letterSpacing: '0.24em', textTransform: 'uppercase' }

// ═══════════════════════════════════════════════════════════════════
//  SECTIONS — placeholders for now, filled in over P3b/P3c/P4+
// ═══════════════════════════════════════════════════════════════════

// ─── 0. COVER ────────────────────────────────────────────────────
const Cover = ({ groomNick, brideNick, heroDate, guestName, handleOpen, animateClose }) => {
  const fade = (delay) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay, ease: [0.22, 0.61, 0.36, 1] } })
  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ zIndex: 80, background: c.page }}
      animate={animateClose ? { opacity: 0, scale: 1.08 } : { opacity: 1, scale: 1 }} transition={{ duration: 1, ease: 'easeInOut' }}>
      <div className="absolute inset-0" style={{ backgroundImage: `url("${A.background}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(254,253,251,.42) 0%, rgba(254,253,251,.12) 38%, rgba(90,82,66,.34) 100%)' }} />
      <img src={A.bloom} alt="" className="absolute pointer-events-none" style={{ top: -40, left: -50, width: 170, opacity: 0.7, animation: 'bl-float 12s ease-in-out infinite' }} />
      <img src={A.bloom} alt="" className="absolute pointer-events-none" style={{ bottom: '12%', right: -56, width: 140, opacity: 0.55, transform: 'scaleX(-1)', animation: 'bl-float 15s ease-in-out infinite 2s' }} />
      <div className="absolute pointer-events-none" style={{ inset: 18, border: `1px solid rgba(169,138,78,.34)` }} />
      <div className="absolute pointer-events-none" style={{ inset: 25, border: `1px solid rgba(169,138,78,.16)` }} />

      <div className="relative h-full flex flex-col items-center justify-center text-center" style={{ zIndex: 2, padding: '58px 40px' }}>
        <motion.div {...fade(0)} className="uppercase" style={{ fontFamily: F.sans, fontWeight: 300, fontSize: 10, letterSpacing: '0.5em', color: c.muted }}>The Wedding Of</motion.div>
        <motion.div {...fade(0.1)} style={{ marginTop: 18 }}>
          <div style={{ fontFamily: F.script, fontSize: 74, lineHeight: 0.9, color: c.ink }}>{groomNick}</div>
          <div style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 26, color: c.gold, margin: '4px 0' }}>and</div>
          <div style={{ fontFamily: F.script, fontSize: 74, lineHeight: 0.9, color: c.ink }}>{brideNick}</div>
        </motion.div>
        <motion.div {...fade(0.2)} style={{ marginTop: 26 }}><Divider /></motion.div>
        <motion.div {...fade(0.25)} className="uppercase" style={{ fontFamily: F.serif, fontSize: 16, fontWeight: 400, letterSpacing: '0.26em', color: c.body, marginTop: 16 }}>{heroDate}</motion.div>

        <div style={{ marginTop: 'auto', width: '100%' }}>
          <motion.div {...fade(0.3)} className="uppercase" style={{ fontFamily: F.sans, fontWeight: 300, fontSize: 9, letterSpacing: '0.34em', color: c.muted }}>Kepada Yth.</motion.div>
          <motion.div {...fade(0.35)} style={{ background: 'rgba(255,255,255,.66)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(211,191,147,.6)', padding: '16px 22px', margin: '12px auto 0', maxWidth: 300 }}>
            <div style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 500, letterSpacing: '0.06em', color: c.ink }}>{guestName}</div>
          </motion.div>
          <motion.button {...fade(0.42)} onClick={handleOpen} style={{ ...btnPill, marginTop: 26, fontSize: 11, fontWeight: 400, padding: '17px 42px', boxShadow: '0 16px 38px rgba(169,138,78,.34)' }}>
            Buka Undangan
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── 1. HERO ─────────────────────────────────────────────────────
const Hero = ({ groomNick, brideNick, heroDate, countdown }) => {
  const parts = [['Hari', pad2(countdown?.d)], ['Jam', pad2(countdown?.h)], ['Menit', pad2(countdown?.m)], ['Detik', pad2(countdown?.s)]]
  return (
    <section id="home" className="relative flex flex-col justify-end overflow-hidden" style={{ minHeight: 'var(--inv-h)' }}>
      <div className="absolute inset-0" style={{ backgroundImage: `url("${A.background}")`, backgroundSize: 'cover', backgroundPosition: 'center 20%' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(254,253,251,.5) 0%, rgba(254,253,251,.05) 26%, rgba(70,64,52,.18) 62%, rgba(52,47,38,.66) 100%)' }} />
      <img src={A.bloom} alt="" className="absolute pointer-events-none" style={{ top: -38, right: -46, width: 180, opacity: 0.85, filter: 'drop-shadow(0 12px 24px rgba(120,108,86,.18))', animation: 'bl-float 11s ease-in-out infinite' }} />
      <img src={A.bloom} alt="" className="absolute pointer-events-none" style={{ top: 120, left: -64, width: 120, opacity: 0.5, transform: 'scaleX(-1)', animation: 'bl-float 14s ease-in-out infinite 1.2s' }} />
      <div className="absolute pointer-events-none" style={{ inset: 20, border: '1px solid rgba(255,255,255,.42)' }} />
      <div className="absolute pointer-events-none" style={{ inset: 26, border: '1px solid rgba(255,255,255,.18)' }} />

      <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1] }}
        className="relative text-center" style={{ zIndex: 2, padding: '0 40px 62px', color: '#FFFDF9' }}>
        <div className="uppercase" style={{ fontFamily: F.sans, fontWeight: 300, fontSize: 10, letterSpacing: '0.52em', opacity: 0.92, marginBottom: 16 }}>The Wedding Of</div>
        <div style={{ fontFamily: F.script, fontSize: 70, lineHeight: 0.86, textShadow: '0 3px 26px rgba(40,36,28,.4)' }}>{groomNick}</div>
        <div style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 26, opacity: 0.8, margin: '2px 0 -2px' }}>and</div>
        <div style={{ fontFamily: F.script, fontSize: 70, lineHeight: 0.86, textShadow: '0 3px 26px rgba(40,36,28,.4)' }}>{brideNick}</div>

        <div className="flex items-center justify-center" style={{ gap: 10, margin: '24px 0 18px' }}>
          <div style={{ width: 52, height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,.75))' }} />
          <div style={{ width: 5, height: 5, background: '#FFFDF9', transform: 'rotate(45deg)' }} />
          <div style={{ width: 52, height: 1, background: 'linear-gradient(to left, rgba(255,255,255,0), rgba(255,255,255,.75))' }} />
        </div>
        <div className="uppercase" style={{ fontFamily: F.serif, fontSize: 18, fontWeight: 300, letterSpacing: '0.26em' }}>{heroDate}</div>

        <div className="flex justify-center" style={{ gap: 9, marginTop: 30 }}>
          {parts.map(([label, val]) => (
            <div key={label} style={{ flex: 1, maxWidth: 76, background: 'rgba(255,255,255,.13)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.34)', padding: '14px 4px' }}>
              <div style={{ fontFamily: F.serif, fontSize: 32, fontWeight: 400, lineHeight: 1 }}>{val}</div>
              <div className="uppercase" style={{ fontFamily: F.sans, fontWeight: 300, fontSize: 8, letterSpacing: '0.28em', marginTop: 7, opacity: 0.85 }}>{label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

const Reveal = ({ children, className = '', style = {} }) => (
  <motion.div className={className} style={style} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}>
    {children}
  </motion.div>
)

// ─── 2. QUOTE ────────────────────────────────────────────────────
const Quote = ({ data }) => (
  <section className="relative text-center overflow-hidden" style={{ padding: '104px 44px', background: c.page }}>
    <img src={A.wreathSilver} alt="" className="absolute pointer-events-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '124%', maxWidth: 'none', opacity: 0.42 }} />
    <Reveal className="relative" style={{ zIndex: 1 }}>
      <Kicker>Bismillahirrahmanirrahim</Kicker>
      <div style={{ width: 1, height: 34, margin: '22px auto', background: `linear-gradient(${c.goldLight}, rgba(211,191,147,0))` }} />
      <p style={{ fontFamily: F.serif, fontStyle: 'italic', fontWeight: 300, fontSize: 24, lineHeight: 1.75, color: c.ink2, margin: '0 auto', maxWidth: 330, textWrap: 'pretty' }}>{data?.quote}</p>
    </Reveal>
  </section>
)

// ─── 3. COUPLE ───────────────────────────────────────────────────
const PersonBlock = ({ person, role }) => (
  <div>
    <Framed src={person?.photo} />
    <div style={{ fontFamily: F.serif, fontSize: 35, fontWeight: 400, color: c.ink, marginTop: 30, lineHeight: 1.15, letterSpacing: '0.01em' }}>{person?.name}</div>
    <div style={{ fontFamily: F.sans, fontWeight: 300, fontSize: 12, color: c.body, marginTop: 12, lineHeight: 1.85, letterSpacing: '0.04em' }}>
      {role} dari<br />{person?.father} &amp; {person?.mother}
    </div>
    {person?.instagram && (
      <a href={`https://instagram.com/${person.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center" style={{ gap: 7, marginTop: 16, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: c.gold, border: `1px solid ${c.line2}`, borderRadius: 999, padding: '8px 18px' }}>
        <span style={{ fontFamily: F.serif, textTransform: 'none' }}>IG</span> @{person.instagram.replace('@', '')}
      </a>
    )}
  </div>
)

const Couple = ({ data }) => (
  <section id="couple" className="relative text-center" style={{ padding: '20px 36px 100px', background: c.page }}>
    <Kicker>Dengan penuh syukur</Kicker>
    <SectionTitle>Kedua Mempelai</SectionTitle>
    <Divider />

    <Reveal style={{ marginTop: 48 }}>
      <PersonBlock person={data?.groom} role="Putra" />
    </Reveal>

    <div style={{ fontFamily: F.script, fontSize: 62, color: c.goldLight, margin: '30px 0 26px', lineHeight: 1 }}>&amp;</div>

    <Reveal>
      <PersonBlock person={data?.bride} role="Putri" />
    </Reveal>
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
    <section id="acara" className="relative overflow-hidden" style={{ padding: '96px 36px', background: ivoryGrad }}>
      <img src={A.wreathGold} alt="" className="absolute pointer-events-none" style={{ top: -56, right: -78, width: 210, opacity: 0.4 }} />
      <div className="relative text-center" style={{ zIndex: 1 }}>
        <Kicker>Save the date</Kicker>
        <SectionTitle>Rangkaian Acara</SectionTitle>
      </div>

      {events.length > 1 && (
        <div className="flex relative" style={{ gap: 6, background: c.tabTrack, borderRadius: 999, padding: 5, margin: '32px auto 0', maxWidth: 300, zIndex: 1 }}>
          {events.map((e, i) => (
            <button key={e.id ?? i} onClick={() => setActive(i)} style={{
              flex: 1, fontFamily: F.sans, fontSize: 10, fontWeight: 400, letterSpacing: '0.2em', textTransform: 'uppercase',
              cursor: 'pointer', border: 'none', borderRadius: 999, padding: '12px 8px', transition: 'all .35s',
              color: active === i ? '#FFFDF9' : c.muted,
              background: active === i ? goldGrad : 'transparent',
              boxShadow: active === i ? '0 8px 18px rgba(169,138,78,.28)' : 'none',
            }}>{e.name}</button>
          ))}
        </div>
      )}

      <Reveal style={{ marginTop: 26, background: '#FFFFFF', border: `1px solid ${c.line2}`, padding: 12, boxShadow: '0 26px 54px rgba(122,110,88,.14)', position: 'relative', zIndex: 1 }}>
        <div style={{ border: `1px solid ${c.line3}`, padding: '30px 22px', textAlign: 'center' }}>
          <div className="uppercase" style={{ fontFamily: F.serif, fontSize: 15, fontWeight: 500, letterSpacing: '0.3em', color: c.muted }}>{ev.name}</div>
          <div className="flex items-center justify-center" style={{ gap: 18, marginTop: 22 }}>
            <div className="text-right uppercase" style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 300, letterSpacing: '0.24em', color: c.muted2 }}>{d ? ID_DAYS[d.getDay()] : ''}</div>
            <div style={{ fontFamily: F.serif, fontSize: 66, fontWeight: 300, color: c.gold, lineHeight: 0.9, padding: '0 14px', borderLeft: `1px solid ${c.line}`, borderRight: `1px solid ${c.line}` }}>{d ? d.getDate() : '—'}</div>
            <div className="text-left">
              <div style={{ fontFamily: F.serif, fontSize: 21, color: c.ink }}>{d ? ID_MONTHS[d.getMonth()] : ''}</div>
              <div style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 300, color: c.muted2, letterSpacing: '0.12em' }}>{d ? d.getFullYear() : ''}</div>
            </div>
          </div>
          <div style={{ margin: '24px 0' }}><Divider /></div>
          <div style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 300, letterSpacing: '0.2em', color: c.ink2 }}>{fmtTime(ev.start)} — {fmtTime(ev.end)} {ev.tz}</div>
          <div style={{ fontFamily: F.serif, fontSize: 23, fontWeight: 500, color: c.ink, marginTop: 20 }}>{ev.venue}</div>
          <div style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 300, color: c.muted, marginTop: 7, lineHeight: 1.7 }}>{ev.address}</div>
          {ev.maps && (
            <a href={ev.maps} target="_blank" rel="noopener noreferrer" className="inline-block uppercase" style={{ ...btnPill, marginTop: 24, fontSize: 11, fontWeight: 400, padding: '14px 30px' }}>Petunjuk Arah</a>
          )}
        </div>
      </Reveal>
    </section>
  )
}

// ─── 5. LOVE STORY ───────────────────────────────────────────────
const LoveStory = ({ data }) => {
  const story = data?.loveStory || []
  if (!story.length) return null
  return (
    <section className="relative text-center" style={{ padding: '96px 36px', background: c.page }}>
      <Kicker>Our love story</Kicker>
      <SectionTitle>Perjalanan Cinta</SectionTitle>
      <div className="relative text-left" style={{ marginTop: 46 }}>
        <div className="absolute" style={{ left: 23, top: 10, bottom: 10, width: 1, background: `linear-gradient(#E4DAC4, #F3EEE2)` }} />
        {story.map((mo, i) => (
          <Reveal key={mo.id ?? i} className="relative flex" style={{ gap: 22, marginBottom: 30 }}>
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: 47, height: 47, borderRadius: '50%', background: '#FFFFFF', border: `1px solid #E4DAC4`, fontFamily: F.serif, fontSize: 14, fontWeight: 500, color: c.gold, letterSpacing: '0.04em', zIndex: 1 }}>{mo.year}</div>
            <div style={{ flex: 1, background: '#FFFFFF', border: `1px solid ${c.line2}`, padding: '20px 22px', boxShadow: '0 14px 34px rgba(122,110,88,.09)' }}>
              <div style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 500, color: c.ink }}>{mo.title}</div>
              <p style={{ fontFamily: F.sans, fontSize: 12.5, fontWeight: 300, lineHeight: 1.8, color: c.body, margin: '8px 0 0', textWrap: 'pretty' }}>{mo.desc}</p>
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
  if (!dc?.name) return null
  return (
    <section className="relative text-center overflow-hidden" style={{ padding: '96px 36px', background: ivoryGrad }}>
      <img src={A.bloom} alt="" className="absolute pointer-events-none" style={{ bottom: -30, left: -44, width: 150, opacity: 0.5, transform: 'scaleX(-1)' }} />
      <Reveal className="relative" style={{ zIndex: 1 }}>
        <Kicker>Busana tamu</Kicker>
        <SectionTitle>Dresscode</SectionTitle>
        <div className="relative" style={{ width: 126, height: 126, margin: '34px auto 0' }}>
          <div className="absolute" style={{ inset: 0, border: `1px solid #E4DAC4`, borderRadius: '50%' }} />
          <div className="absolute" style={{ inset: 9, borderRadius: '50%', background: dc.color, boxShadow: 'inset 0 6px 18px rgba(255,255,255,.35), 0 18px 40px rgba(122,110,88,.2)' }} />
        </div>
        <div style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 500, color: c.ink, marginTop: 22, letterSpacing: '0.04em' }}>{dc.name}</div>
        <p style={{ fontFamily: F.sans, fontSize: 12.5, fontWeight: 300, color: c.body, margin: '10px auto 0', maxWidth: 300, lineHeight: 1.85 }}>{dc.notes}</p>
      </Reveal>
    </section>
  )
}

// ─── 7. GALLERY ──────────────────────────────────────────────────
const GALLERY_SPANS = [232, 168, 168, 232, 232, 168]
const Gallery = ({ data }) => {
  const photos = (data?.gallery || []).map((g) => (typeof g === 'string' ? g : g?.src)).filter(Boolean)
  if (!photos.length) return null
  return (
    <section id="galeri" className="text-center" style={{ padding: '96px 28px', background: c.page }}>
      <Kicker>Momen berharga</Kicker>
      <SectionTitle>Galeri</SectionTitle>
      <div className="grid grid-cols-2" style={{ gap: 9, marginTop: 32 }}>
        {photos.map((src, i) => (
          <div key={i} className="relative overflow-hidden" style={{ height: GALLERY_SPANS[i % GALLERY_SPANS.length], border: `1px solid ${c.line2}`, boxShadow: '0 12px 28px rgba(122,110,88,.1)' }}>
            <img src={src} alt="" className="w-full h-full object-cover" />
            <div className="absolute pointer-events-none" style={{ inset: 6, border: '1px solid rgba(255,255,255,.6)' }} />
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── 8. LIVE STREAMING ───────────────────────────────────────────
const LiveStream = ({ data }) => {
  const platforms = data?.livestreamEnabled ? (data?.livestreamPlatforms || []).filter((p) => p?.url) : []
  if (!platforms.length) return null
  return (
    <section className="text-center" style={{ padding: '96px 36px', background: ivoryGrad }}>
      <Kicker>Saksikan dari rumah</Kicker>
      <SectionTitle>Live Streaming</SectionTitle>
      <div className="flex flex-col" style={{ gap: 12, marginTop: 32 }}>
        {platforms.map((lv, i) => (
          <a key={lv.id ?? i} href={lv.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between" style={{ background: '#FFFFFF', border: `1px solid ${c.line2}`, padding: '18px 22px', boxShadow: '0 14px 34px rgba(122,110,88,.09)' }}>
            <span style={{ fontFamily: F.serif, fontSize: 20, fontWeight: 500, color: c.ink }}>{lv.type || 'Live Streaming'}</span>
            <span className="uppercase" style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 400, letterSpacing: '0.22em', color: c.gold, border: `1px solid #E4DAC4`, padding: '9px 18px' }}>Tonton</span>
          </a>
        ))}
      </div>
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
  const field = { width: '100%', boxSizing: 'border-box', border: `1px solid ${c.line}`, background: c.fieldBg, padding: '14px 16px', fontFamily: F.sans, fontSize: 13, fontWeight: 300, letterSpacing: '0.04em', color: c.ink, outline: 'none' }
  const toggle = (on) => ({ flex: 1, cursor: 'pointer', fontFamily: F.sans, fontSize: 10, fontWeight: 400, letterSpacing: '0.2em', textTransform: 'uppercase', padding: 13, transition: 'all .3s', border: `1px solid ${on ? 'transparent' : c.line}`, color: on ? '#FFFDF9' : c.muted, background: on ? goldGrad : c.fieldBg })

  return (
    <section id="rsvp" className="relative overflow-hidden" style={{ padding: '96px 36px', background: c.page }}>
      <img src={A.wreathSilver} alt="" className="absolute pointer-events-none" style={{ top: 24, left: '50%', transform: 'translateX(-50%)', width: '126%', maxWidth: 'none', opacity: 0.3 }} />
      <div className="relative text-center" style={{ zIndex: 1 }}>
        <Kicker>RSVP &amp; wishes</Kicker>
        <SectionTitle>Ucapan &amp; Doa</SectionTitle>
      </div>

      <Reveal className="relative" style={{ zIndex: 1, marginTop: 32, background: '#FFFFFF', border: `1px solid ${c.line2}`, padding: '26px 24px', boxShadow: '0 26px 54px rgba(122,110,88,.13)' }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Anda" style={field} />
        <div className="flex" style={{ gap: 10, marginTop: 10 }}>
          <button type="button" onClick={() => setAtt('hadir')} style={toggle(att === 'hadir')}>Hadir</button>
          <button type="button" onClick={() => setAtt('tidak_hadir')} style={toggle(att === 'tidak_hadir')}>Berhalangan</button>
        </div>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} placeholder="Tulis ucapan & doa..." style={{ ...field, marginTop: 10, resize: 'none' }} />
        <button onClick={submit} disabled={busy} style={{ ...btnPill, width: '100%', marginTop: 14, fontSize: 11, padding: 16, opacity: busy ? 0.7 : 1 }}>{busy ? 'Mengirim…' : 'Kirim Ucapan'}</button>
      </Reveal>

      {list.length > 0 && (
        <div className="relative flex flex-col" style={{ zIndex: 1, marginTop: 20, gap: 10, maxHeight: 340, overflowY: 'auto' }}>
          {list.map((w, i) => {
            const hadir = w.rsvp === 'hadir'
            return (
              <div key={w.id ?? i} style={{ background: '#FFFFFF', border: `1px solid ${c.line2}`, padding: '18px 20px' }}>
                <div className="flex items-center justify-between" style={{ gap: 10 }}>
                  <span style={{ fontFamily: F.serif, fontSize: 19, fontWeight: 500, color: c.ink }}>{w.name}</span>
                  {w.rsvp && (
                    <span className="uppercase whitespace-nowrap" style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 400, letterSpacing: '0.18em', padding: '5px 12px', color: hadir ? c.hadir : c.absen, border: `1px solid ${hadir ? c.hadirBrd : c.absenBrd}`, background: hadir ? c.hadirBg : c.absenBg }}>{hadir ? 'Hadir' : 'Berhalangan'}</span>
                  )}
                </div>
                <p style={{ fontFamily: F.sans, fontSize: 12.5, fontWeight: 300, lineHeight: 1.75, color: c.body, margin: '9px 0 0', textWrap: 'pretty' }}>{w.wish || w.message}</p>
                {w.time && <div style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 300, letterSpacing: '0.1em', color: c.ph, marginTop: 9 }}>{w.time}</div>}
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
  // "Alamat Pengiriman Kado" is its own toggle in the editor, independent of
  // the account list. Gating the whole section on accounts alone hid it from
  // couples who only wanted to give a shipping address, and hid the address
  // from everyone regardless — this theme never rendered giftAddress at all.
  const gift = data?.giftAddress
  const hasGiftAddress = Boolean(gift?.enabled && (gift.address || gift.recipient || gift.phone))
  if (!accounts.length && !hasGiftAddress) return null
  return (
    <section id="hadiah" className="text-center" style={{ padding: '96px 36px', background: ivoryGrad }}>
      <Kicker>Wedding gift</Kicker>
      <SectionTitle>Tanda Kasih</SectionTitle>
      <p style={{ fontFamily: F.sans, fontSize: 12.5, fontWeight: 300, color: c.body, margin: '16px auto 0', maxWidth: 320, lineHeight: 1.85 }}>Doa restu Anda merupakan karunia yang berharga. Bila berkenan memberi tanda kasih, dapat melalui:</p>
      <div className="flex flex-col" style={{ gap: 12, marginTop: 30 }}>
        {accounts.map((acc, i) => {
          const key = acc.id ?? acc.number ?? i
          const copied = copiedKey === key
          return (
            <Reveal key={key} className="text-left" style={{ background: '#FFFFFF', border: `1px solid ${c.line2}`, padding: 24, boxShadow: '0 14px 34px rgba(122,110,88,.09)' }}>
              <div className="uppercase" style={{ fontFamily: F.serif, fontSize: 15, fontWeight: 500, letterSpacing: '0.3em', color: c.gold }}>{acc.bank}</div>
              <div style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 400, letterSpacing: '0.16em', color: c.ink, marginTop: 12 }}>{acc.number}</div>
              <div style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 300, letterSpacing: '0.08em', color: c.muted, marginTop: 6 }}>a.n. {acc.holder}</div>
              <button onClick={() => copy(acc.number, key)} className="uppercase" style={{ marginTop: 16, fontFamily: F.sans, fontSize: 10, letterSpacing: '0.22em', cursor: 'pointer', padding: '10px 20px', transition: 'all .3s', color: copied ? '#FFFDF9' : c.gold, background: copied ? goldGrad : 'transparent', border: `1px solid ${copied ? 'transparent' : c.line2}` }}>{copied ? 'Tersalin' : 'Salin Nomor'}</button>
            </Reveal>
          )
        })}

        {hasGiftAddress && (
          <Reveal className="text-left" style={{ background: '#FFFFFF', border: `1px solid ${c.line2}`, padding: 24, boxShadow: '0 14px 34px rgba(122,110,88,.09)' }}>
            <div className="uppercase" style={{ fontFamily: F.serif, fontSize: 15, fontWeight: 500, letterSpacing: '0.3em', color: c.gold }}>Kirim Kado</div>
            {gift.recipient && <div style={{ fontFamily: F.serif, fontSize: 20, color: c.ink, marginTop: 12 }}>{gift.recipient}</div>}
            {gift.phone && <div style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 300, letterSpacing: '0.08em', color: c.muted, marginTop: 6 }}>{gift.phone}</div>}
            {gift.address && <div style={{ fontFamily: F.sans, fontSize: 12.5, fontWeight: 300, lineHeight: 1.8, color: c.body, marginTop: 12, whiteSpace: 'pre-line' }}>{gift.address}</div>}
            {gift.address && (
              <button onClick={() => copy(gift.address, 'bl-gift-address')} className="uppercase" style={{ marginTop: 16, fontFamily: F.sans, fontSize: 10, letterSpacing: '0.22em', cursor: 'pointer', padding: '10px 20px', transition: 'all .3s', color: copiedKey === 'bl-gift-address' ? '#FFFDF9' : c.gold, background: copiedKey === 'bl-gift-address' ? goldGrad : 'transparent', border: `1px solid ${copiedKey === 'bl-gift-address' ? 'transparent' : c.line2}` }}>{copiedKey === 'bl-gift-address' ? 'Tersalin' : 'Salin Alamat'}</button>
            )}
          </Reveal>
        )}
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
    <section className="text-center" style={{ padding: '96px 36px', background: c.page }}>
      <SectionTitle size={44}>Turut Mengundang</SectionTitle>
      <div className="flex flex-col" style={{ gap: 26, marginTop: 30 }}>
        {families.map((fam, i) => (
          <div key={fam.id ?? i}>
            {fam.side && <div className="uppercase" style={{ fontFamily: F.sans, fontWeight: 300, fontSize: 9, letterSpacing: '0.32em', color: c.gold }}>{fam.side}</div>}
            <div style={{ fontFamily: F.serif, fontSize: 19, fontWeight: 300, color: c.ink2, lineHeight: 1.9, marginTop: 10 }}>{fam.members.join(' · ')}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════

export default function BlancLumiereTheme({
  data, countdown, opened, setOpened,
  animateClose, setAnimateClose,
  musicPlaying, setMusicPlaying, audioRef,
  wishes, onSubmitWish, guestName,
}) {
  const groomNick = data?.groom?.nickname || 'Mempelai Pria'
  const brideNick = data?.bride?.nickname || 'Mempelai Wanita'
  const heroDate = dateLabelOf(data?.events?.[0])
  const guest = guestName || 'Bapak/Ibu/Saudara/i'

  const handleOpen = () => {
    setAnimateClose(true)
    setTimeout(() => { setOpened(true); if (audioRef?.current) setMusicPlaying(true) }, 950)
  }

  return (
    <InvitationLayout layout={THEMES.BLANC_LUMIERE} data={data} bgUrl="">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Pinyon+Script&family=Jost:wght@200;300;400;500&display=swap');
        @keyframes bl-eq { 0%,100% { height: 18%; } 50% { height: 100%; } }
        @keyframes bl-float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(2deg); } }
      `}</style>

      <div className="w-full relative h-full flex flex-col overflow-x-hidden" style={{ fontFamily: F.sans, color: c.ink, background: c.page }}>
        {data?.music !== false && (
          <audio ref={audioRef} src={data?.musicUrl || MUSIC_URLS[data?.musicId || 1] || MUSIC_URLS[1]} loop />
        )}

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
            <Gallery data={data} />

            {/* Urutan baku Ulema: seluruh informasi tamu berdekatan, lalu RSVP,
                lalu penutup. Sebelumnya sebagian di antaranya berada SESUDAH
                formulir RSVP — tamu diminta mengisi kehadiran lebih dulu, baru
                sesudah itu diberi tautan siaran atau ditunjukkan ke mana
                mengirim kado. */}
            <Dresscode data={data} />
            <LiveStream data={data} />
            <Gift data={data} />
            <TurutMengundang data={data} />

            <WishRsvp data={data} wishes={wishes} onSubmitWish={onSubmitWish} />

            {/* Music toggle */}
            {data?.music !== false && (
              <button onClick={() => setMusicPlaying(!musicPlaying)} title="Musik"
                className="fixed flex items-center justify-center" style={{ bottom: 84, right: 'max(20px, calc(50vw - var(--inv-w) / 2 + 20px))', zIndex: 55, width: 46, height: 46, borderRadius: 50, border: `1px solid ${c.line}`, background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', cursor: 'pointer', gap: 2.5, boxShadow: '0 10px 26px rgba(122,110,88,.2)' }}>
                {[0, 0.15, 0.3, 0.45].map((delay, i) => (
                  <span key={i} style={{ display: 'block', width: 2, height: '55%', background: c.gold, alignSelf: 'flex-end', animation: `bl-eq 0.9s ease-in-out ${delay}s infinite`, animationPlayState: musicPlaying ? 'running' : 'paused' }} />
                ))}
              </button>
            )}

            {/* Bottom nav */}
            <nav className="fixed left-1/2 -translate-x-1/2 flex" style={{ bottom: 16, zIndex: 55, background: 'rgba(255,254,251,.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${c.line2}`, borderRadius: 999, padding: '9px 6px', gap: 2, boxShadow: '0 14px 36px rgba(122,110,88,.18)' }}>
              {NAV.map(([label, id]) => (
                <button key={id} onClick={() => scrollToId(id)} style={{ border: 'none', cursor: 'pointer', background: 'transparent', color: c.muted3, fontFamily: F.sans, fontWeight: 300, fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '6px 8px' }}>{label}</button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </InvitationLayout>
  )
}
