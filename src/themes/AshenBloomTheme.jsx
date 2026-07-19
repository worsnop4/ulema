import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { THEMES } from '../config/constants'

// ═══════════════════════════════════════════════════════════════════
//  ASHEN BLOOM — ivory & ash with terracotta watercolor florals
//  Ported from the "Ashen Bloom" design handoff. Light, airy, elegant.
//  Floral ornaments load from /themes/AshenBloom/*; if an asset is missing
//  the layout still works (graceful fallback). Data-shape follows the
//  Ulema theme contract.
// ═══════════════════════════════════════════════════════════════════

// ─── PALETTE ─────────────────────────────────────────────────────
const c = {
  page:    '#eceae6',
  paper:   '#fbfaf8',
  panel:   '#f3f1ec',
  ink:     '#33312d',
  muted:   '#6f6b63',
  ash:     '#8b877f',
  ph:      '#a8a49c',
  line:    '#e4e1db',
  line2:   '#ddd9d1',
  linePnl: '#e7e4dd',
  terra:   '#b07a52',
  terraDk: '#8f5f3d',
  btnBg:   '#33312d',
  btnText: '#f5f3ef',
  hadir:   '#7d8a6e', hadirBrd: '#c3ccb6',
  halangan:'#a8a49c', halBrd:  '#ddd9d1',
  copyBg:  '#f7efe7', copyBrd: '#cbb59f',
}

const F = {
  serif:  "'Marcellus', serif",
  script: "'Pinyon Script', cursive",
  sans:   "'Jost', sans-serif",
}

// ─── ASSETS (drop into public/themes/AshenBloom/) ────────────────
const A = {
  coverBg:       '/themes/AshenBloom/floral-bg.jpg',
  footerBg:      '/themes/AshenBloom/footer-floral.png',
  ornamentAsh:   '/themes/AshenBloom/ornament-ash.png',
  ornamentTerra: '/themes/AshenBloom/ornament-terracotta.png',
}

// ─── DATE HELPERS ────────────────────────────────────────────────
const ID_DAYS = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const ID_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const ID_MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const fmtDate = (s) => {
  if (!s) return ''
  try { const d = new Date(s); return `${ID_DAYS[d.getDay()]}, ${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}` } catch { return s }
}
const dateLabelOf = (ev) => ev?.dateLabel || fmtDate(ev?.date)
const dateParts = (s) => {
  if (!s) return { day: '—', mon: '', yr: '' }
  try { const d = new Date(`${s}T00:00:00`); return { day: String(d.getDate()), mon: ID_MON_SHORT[d.getMonth()], yr: String(d.getFullYear()) } } catch { return { day: '—', mon: '', yr: '' } }
}
const pad2 = (n) => String(n ?? 0).padStart(2, '0')

// ─── PRIMITIVES ──────────────────────────────────────────────────
const Kicker = ({ children }) => (
  <div className="uppercase" style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: '0.34em', color: c.terra }}>{children}</div>
)
const Script = ({ children, style = {} }) => (
  <div style={{ fontFamily: F.script, color: c.ink, ...style }}>{children}</div>
)
const Reveal = ({ children, className = '', style = {} }) => (
  <motion.div className={className} style={style} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.9, ease: [0.22, 0.8, 0.3, 1] }}>
    {children}
  </motion.div>
)

// Framed photo (arch / circle) with a woven placeholder when empty.
const placeholderBg = 'repeating-linear-gradient(45deg, #e9e7e2 0 14px, #f2f0eb 14px 28px)'
const Framed = ({ src, radius, inner, style = {} }) => (
  <div style={{ borderRadius: radius, overflow: 'hidden', border: `1px solid ${c.line2}`, padding: 8, background: c.panel, ...style }}>
    <div style={{ width: '100%', height: '100%', borderRadius: inner, overflow: 'hidden', background: placeholderBg }}>
      {src && <img src={src} alt="" className="w-full h-full object-cover" />}
    </div>
  </div>
)

const btnPill = { border: 'none', cursor: 'pointer', background: c.btnBg, color: c.btnText, fontFamily: F.sans, letterSpacing: '0.22em', textTransform: 'uppercase', borderRadius: 999 }

// ─── 0. COVER ────────────────────────────────────────────────────
const Cover = ({ data, groomNick, brideNick, heroDate, guestName, handleOpen, animateClose }) => {
  const coverStyle = data?.meta?.coverStyle || 'circle'
  const coverPhoto = data?.meta?.coverPhoto || ''
  const fade = (delay) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay, ease: [0.22, 0.8, 0.3, 1] } })
  return (
    <motion.div className="absolute inset-0 flex justify-center overflow-hidden" style={{ zIndex: 60, background: c.page }}
      animate={animateClose ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }} transition={{ duration: 0.85, ease: 'easeInOut' }}>
      <div className="w-full h-full relative flex flex-col items-center" style={{ background: `${c.paper} url("${A.coverBg}") center bottom/cover no-repeat`, padding: '64px 32px 48px' }}>
        <motion.div {...fade(0)} className="uppercase" style={{ fontFamily: F.sans, letterSpacing: '0.42em', fontSize: 11, color: c.ash }}>The Wedding Of</motion.div>
        {coverStyle === 'circle' && (
          <motion.div {...fade(0.1)} style={{ marginTop: 28, flexShrink: 0 }}>
            <Framed src={coverPhoto} radius="50%" inner="50%" style={{ width: 205, height: 214 }} />
          </motion.div>
        )}
        <motion.div {...fade(0.2)} className="text-center" style={{ marginTop: 30 }}>
          <div style={{ fontFamily: F.serif, fontSize: 42, lineHeight: 1.12, letterSpacing: '0.04em' }}>{groomNick}</div>
          <div style={{ fontFamily: F.script, fontSize: 34, color: c.terra, lineHeight: 1 }}>&amp;</div>
          <div style={{ fontFamily: F.serif, fontSize: 42, lineHeight: 1.12, letterSpacing: '0.04em' }}>{brideNick}</div>
        </motion.div>
        <motion.div {...fade(0.3)} style={{ marginTop: 18, letterSpacing: '0.3em', fontSize: 12, color: c.muted }}>{heroDate}</motion.div>
        <div style={{ flex: 1 }} />
        <motion.div {...fade(0.45)} className="text-center" style={{ background: 'rgba(251,250,248,.82)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', border: `1px solid ${c.line}`, borderRadius: 20, padding: '18px 30px', maxWidth: 300 }}>
          <div className="uppercase" style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: '0.28em', color: c.ash }}>Kepada Yth.</div>
          <div style={{ fontFamily: F.serif, fontSize: 20, marginTop: 6 }}>{guestName}</div>
          <button onClick={handleOpen} style={{ ...btnPill, marginTop: 16, fontSize: 12, padding: '13px 26px' }}>Buka Undangan</button>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── 1. HERO ─────────────────────────────────────────────────────
const Hero = ({ data, groomNick, brideNick, heroDate, countdown }) => {
  const parts = [['Hari', pad2(countdown?.d)], ['Jam', pad2(countdown?.h)], ['Menit', pad2(countdown?.m)], ['Detik', pad2(countdown?.s)]]
  return (
    <section id="sec-home" className="relative overflow-hidden" style={{ padding: '72px 28px 88px', background: c.paper }}>
      <img src={A.ornamentAsh} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} style={{ position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)', width: 300, opacity: 0.9, pointerEvents: 'none' }} />
      <div className="text-center" style={{ marginTop: 64 }}><Script style={{ fontSize: 30, color: c.terra }}>Undangan Pernikahan</Script></div>
      <div style={{ margin: '26px auto 0', width: 'min(300px, 80%)', aspectRatio: '3 / 4.1' }}>
        <Framed src={data?.meta?.photo || ''} radius="160px 160px 22px 22px" inner="152px 152px 16px 16px" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="text-center" style={{ marginTop: 30 }}>
        <div style={{ fontFamily: F.serif, fontSize: 40, letterSpacing: '0.05em', lineHeight: 1.15 }}>{groomNick} <span style={{ fontFamily: F.script, fontSize: 32, color: c.terra }}>&amp;</span> {brideNick}</div>
        <div className="flex items-center justify-center" style={{ marginTop: 14, gap: 14, color: c.muted }}>
          <span style={{ display: 'block', width: 36, height: 1, background: c.line2 }} />
          <span style={{ letterSpacing: '0.3em', fontSize: 12.5 }}>{heroDate}</span>
          <span style={{ display: 'block', width: 36, height: 1, background: c.line2 }} />
        </div>
      </div>
      {(data?.countdownEnabled ?? true) && (
        <div style={{ marginTop: 34, borderTop: `1px solid ${c.line}`, borderBottom: `1px solid ${c.line}`, padding: '18px 6px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {parts.map(([label, value], i) => (
            <div key={label} className="text-center" style={{ borderRight: i < 3 ? `1px solid ${c.line}` : 'none' }}>
              <div style={{ fontFamily: F.serif, fontSize: 27 }}>{value}</div>
              <div className="uppercase" style={{ fontFamily: F.sans, fontSize: 10, letterSpacing: '0.24em', color: c.ash, marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── 2. QUOTE ────────────────────────────────────────────────────
const Quote = ({ data }) => {
  if (!data?.quote) return null
  return (
    <Reveal className="text-center" style={{ padding: '0 34px 92px', background: c.paper }}>
      <Kicker>02 · Kalam</Kicker>
      <p style={{ margin: '22px 0 0', fontFamily: F.serif, fontSize: 19, lineHeight: 1.75, color: '#57534b' }}>&ldquo;{data.quote}&rdquo;</p>
      <img src={A.ornamentTerra} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} style={{ width: 190, margin: '26px auto 0', display: 'block', opacity: 0.92 }} />
    </Reveal>
  )
}

// ─── 3. COUPLE ───────────────────────────────────────────────────
const Person = ({ p, role, child, mirror }) => (
  <div className="flex items-center" style={{ gap: 20, flexDirection: mirror ? 'row-reverse' : 'row' }}>
    <Framed src={p?.photo || ''} radius="80px 80px 14px 14px" inner="72px 72px 10px 10px" style={{ flex: '0 0 128px', aspectRatio: '3 / 4' }} />
    <div style={{ flex: 1, minWidth: 0, textAlign: mirror ? 'right' : 'left' }}>
      <Script style={{ fontSize: 27, color: c.terra, lineHeight: 1 }}>{role}</Script>
      <div style={{ fontFamily: F.serif, fontSize: 21, marginTop: 8, lineHeight: 1.3 }}>{p?.name || '—'}</div>
      <div style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 300, color: c.muted, marginTop: 8, lineHeight: 1.65 }}>{child} Bapak {p?.father || '—'} &amp; Ibu {p?.mother || '—'}</div>
      {p?.instagram && (
        <div>
          <a href={`https://instagram.com/${p.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center" style={{ gap: 7, marginTop: 12, fontSize: 12, letterSpacing: '0.08em', border: `1px solid ${c.line2}`, borderRadius: 999, padding: '6px 14px', color: '#57534b' }}>
            <span style={{ fontFamily: F.serif }}>IG</span> @{p.instagram.replace('@', '')}
          </a>
        </div>
      )}
    </div>
  </div>
)
const Couple = ({ data }) => (
  <section id="sec-couple" style={{ padding: '78px 28px 92px', background: c.panel, borderTop: `1px solid ${c.linePnl}`, borderBottom: `1px solid ${c.linePnl}` }}>
    <Reveal className="text-center">
      <Kicker>03 · Mempelai</Kicker>
      <Script style={{ fontSize: 38, marginTop: 10 }}>Assalamu&rsquo;alaikum</Script>
      <p style={{ margin: '14px auto 0', maxWidth: 330, fontFamily: F.sans, fontSize: 14, fontWeight: 300, lineHeight: 1.8, color: c.muted }}>Dengan memohon rahmat dan ridha Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami:</p>
    </Reveal>
    <Reveal style={{ marginTop: 44 }}><Person p={data?.groom} role="Mempelai Pria" child="Putra dari" mirror={false} /></Reveal>
    <div className="flex items-center" style={{ gap: 16, margin: '34px 0' }}>
      <span style={{ flex: 1, height: 1, background: c.line2 }} />
      <span style={{ fontFamily: F.script, fontSize: 30, color: c.terra }}>&amp;</span>
      <span style={{ flex: 1, height: 1, background: c.line2 }} />
    </div>
    <Reveal><Person p={data?.bride} role="Mempelai Wanita" child="Putri dari" mirror /></Reveal>
  </section>
)

// ─── 4. ACARA ────────────────────────────────────────────────────
const Acara = ({ data }) => {
  const events = data?.events || []
  if (!events.length) return null
  return (
    <section id="sec-acara" className="relative overflow-hidden" style={{ padding: '80px 28px 92px', background: c.paper }}>
      <Reveal className="text-center">
        <Kicker>04 · Rangkaian Acara</Kicker>
        <Script style={{ fontSize: 40, marginTop: 10 }}>Waktu &amp; Tempat</Script>
      </Reveal>
      <div style={{ marginTop: 38, display: 'flex', flexDirection: 'column', gap: 26 }}>
        {events.map((ev, i) => {
          const { day, mon, yr } = dateParts(ev.date)
          return (
            <Reveal key={ev.id || i} style={{ border: `1px solid ${c.line2}`, borderRadius: 22, background: c.paper, overflow: 'hidden' }}>
              <div className="flex" style={{ alignItems: 'stretch' }}>
                <div className="flex flex-col items-center justify-center" style={{ flex: '0 0 96px', background: c.panel, borderRight: `1px solid ${c.linePnl}`, padding: '20px 8px' }}>
                  <div style={{ fontFamily: F.serif, fontSize: 38, lineHeight: 1 }}>{day}</div>
                  <div className="uppercase" style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: '0.22em', color: c.ash, marginTop: 6 }}>{mon}</div>
                  <div style={{ fontFamily: F.sans, fontSize: 12, color: c.ash, marginTop: 2 }}>{yr}</div>
                </div>
                <div style={{ flex: 1, padding: '20px 22px' }}>
                  <div style={{ fontFamily: F.serif, fontSize: 22 }}>{ev.name || 'Acara'}</div>
                  <div style={{ fontFamily: F.sans, fontSize: 13, color: c.muted, fontWeight: 300, marginTop: 5 }}>{dateLabelOf(ev)}</div>
                  {(ev.start || ev.end) && <div style={{ display: 'inline-block', marginTop: 9, fontFamily: F.sans, fontSize: 12, letterSpacing: '0.14em', border: `1px solid ${c.line2}`, borderRadius: 999, padding: '4px 12px', color: '#57534b' }}>{[ev.start, ev.end].filter(Boolean).join(' – ')} {ev.tz || ''}</div>}
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${c.linePnl}`, padding: '16px 22px 20px' }}>
                <div style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 500 }}>{ev.venue || ''}</div>
                {ev.address && <div style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 300, color: c.muted, marginTop: 4, lineHeight: 1.6 }}>{ev.address}</div>}
                {ev.maps && <a href={ev.maps} target="_blank" rel="noopener noreferrer" className="inline-block uppercase" style={{ ...btnPill, marginTop: 13, fontSize: 11.5, letterSpacing: '0.2em', padding: '11px 22px' }}>Petunjuk Arah</a>}
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

// ─── 5. LOVE STORY ───────────────────────────────────────────────
const LoveStory = ({ data }) => {
  const stories = data?.loveStory || []
  if (!stories.length) return null
  return (
    <section style={{ padding: '78px 28px 88px', background: c.panel, borderTop: `1px solid ${c.linePnl}`, borderBottom: `1px solid ${c.linePnl}` }}>
      <Reveal className="text-center">
        <Kicker>05 · Perjalanan</Kicker>
        <Script style={{ fontSize: 40, marginTop: 10 }}>Kisah Kami</Script>
      </Reveal>
      <div style={{ marginTop: 36, position: 'relative', paddingLeft: 26, borderLeft: `1px solid ${c.line2}`, display: 'flex', flexDirection: 'column', gap: 30 }}>
        {stories.map((st, i) => (
          <Reveal key={st.id || i} style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: -31, top: 7, width: 9, height: 9, borderRadius: 50, background: c.terra, border: `2px solid ${c.panel}` }} />
            {st.year && <Script style={{ fontSize: 26, color: c.terra, lineHeight: 1 }}>{st.year}</Script>}
            {st.title && <div style={{ fontFamily: F.serif, fontSize: 18, marginTop: 6 }}>{st.title}</div>}
            <p style={{ margin: '7px 0 0', fontFamily: F.sans, fontSize: 13.5, fontWeight: 300, lineHeight: 1.75, color: c.muted }}>{st.desc}</p>
            {st.photo && (
              <div style={{ marginTop: 12, borderRadius: 14, overflow: 'hidden', border: `1px solid ${c.line2}`, maxWidth: 250 }}>
                <img src={st.photo} alt={st.title || ''} className="w-full object-cover" style={{ aspectRatio: '4 / 3', display: 'block' }} />
              </div>
            )}
          </Reveal>
        ))}
      </div>
    </section>
  )
}

// ─── 6. DRESSCODE ────────────────────────────────────────────────
const Dresscode = ({ data }) => {
  const dc = data?.dresscode
  if (!dc || !dc.name) return null
  return (
    <Reveal className="text-center" style={{ padding: '74px 28px 84px', background: c.paper }}>
      <Kicker>06 · Dresscode</Kicker>
      <Script style={{ fontSize: 38, marginTop: 10 }}>Busana Tamu</Script>
      <div style={{ margin: '26px auto 0', width: 74, height: 74, borderRadius: 50, border: `1px solid ${c.line2}`, padding: 6 }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 50, background: dc.color || '#b9b5ac' }} />
      </div>
      <div style={{ fontFamily: F.serif, fontSize: 20, marginTop: 16 }}>{dc.name}</div>
      {dc.notes && <p style={{ margin: '10px auto 0', maxWidth: 320, fontFamily: F.sans, fontSize: 13.5, fontWeight: 300, lineHeight: 1.75, color: c.muted }}>{dc.notes}</p>}
    </Reveal>
  )
}

// ─── 7. GALLERY (masonry) ────────────────────────────────────────
const Gallery = ({ data }) => {
  const photos = (data?.gallery || []).map(g => (typeof g === 'string' ? g : g?.src)).filter(Boolean)
  if (!photos.length) return null
  const heights = ['180px', '230px', '160px', '210px', '190px', '150px']
  return (
    <section id="sec-galeri" style={{ padding: '78px 24px 90px', background: c.panel, borderTop: `1px solid ${c.linePnl}`, borderBottom: `1px solid ${c.linePnl}` }}>
      <Reveal className="text-center" style={{ marginBottom: 34 }}>
        <Kicker>07 · Galeri</Kicker>
        <Script style={{ fontSize: 40, marginTop: 10 }}>Potret Kami</Script>
      </Reveal>
      <div style={{ columns: 2, columnGap: 12 }}>
        {photos.map((src, i) => (
          <div key={i} style={{ breakInside: 'avoid', marginBottom: 12, borderRadius: 16, overflow: 'hidden', border: `1px solid ${c.line2}`, height: heights[i % heights.length] }}>
            <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── 8. RSVP & WISHES ────────────────────────────────────────────
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
  const field = { width: '100%', boxSizing: 'border-box', border: `1px solid ${c.line2}`, borderRadius: 12, background: c.paper, padding: '13px 16px', fontFamily: F.sans, fontSize: 14, color: c.ink, outline: 'none' }
  const toggle = (on) => ({ flex: 1, cursor: 'pointer', borderRadius: 999, padding: '11px 0', fontFamily: F.sans, fontSize: 12.5, letterSpacing: '0.12em', border: `1px solid ${on ? c.btnBg : c.line2}`, background: on ? c.btnBg : c.paper, color: on ? c.btnText : c.muted })
  return (
    <section id="sec-rsvp" style={{ padding: '80px 28px 90px', background: c.paper }}>
      <Reveal className="text-center">
        <Kicker>08 · RSVP</Kicker>
        <Script style={{ fontSize: 40, marginTop: 10 }}>Doa &amp; Ucapan</Script>
      </Reveal>
      <div style={{ marginTop: 32, border: `1px solid ${c.line2}`, borderRadius: 22, padding: '24px 22px', background: '#f7f5f1', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama Anda" style={field} />
        <div className="flex" style={{ gap: 10 }}>
          <button type="button" onClick={() => setAtt('hadir')} style={toggle(att === 'hadir')}>Hadir</button>
          <button type="button" onClick={() => setAtt('tidak_hadir')} style={toggle(att === 'tidak_hadir')}>Berhalangan</button>
        </div>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} placeholder="Tuliskan doa & ucapan..." style={{ ...field, resize: 'vertical' }} />
        <button onClick={submit} disabled={busy} style={{ ...btnPill, fontSize: 12, padding: '14px 0', opacity: busy ? 0.7 : 1 }}>{busy ? 'Mengirim…' : 'Kirim Ucapan'}</button>
      </div>
      {list.length > 0 && (
        <div style={{ marginTop: 26, maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingRight: 4 }}>
          {list.map((w, i) => {
            const hadir = w.rsvp === 'hadir'
            return (
              <div key={w.id || i} style={{ border: `1px solid ${c.linePnl}`, borderRadius: 18, padding: '16px 18px', background: c.paper }}>
                <div className="flex items-center justify-between" style={{ gap: 10 }}>
                  <div style={{ fontFamily: F.serif, fontSize: 15.5 }}>{w.name}</div>
                  {w.rsvp && <div style={{ fontFamily: F.sans, fontSize: 10.5, letterSpacing: '0.1em', color: hadir ? c.hadir : c.halangan, border: `1px solid ${hadir ? c.hadirBrd : c.halBrd}`, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>{hadir ? 'Hadir' : 'Berhalangan'}</div>}
                </div>
                <p style={{ margin: '8px 0 0', fontFamily: F.sans, fontSize: 13.5, fontWeight: 300, lineHeight: 1.7, color: '#57534b' }}>{w.wish || w.message}</p>
                {w.time && <div style={{ marginTop: 8, fontFamily: F.sans, fontSize: 11, color: c.ph }}>{w.time}</div>}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ─── 9. HADIAH ───────────────────────────────────────────────────
const Gift = ({ data }) => {
  const { copiedKey, copy } = useCopyToClipboard()
  const accounts = data?.accounts || []
  if (!accounts.length) return null
  return (
    <section id="sec-hadiah" style={{ padding: '78px 28px 90px', background: c.panel, borderTop: `1px solid ${c.linePnl}` }}>
      <Reveal className="text-center">
        <Kicker>09 · Hadiah</Kicker>
        <Script style={{ fontSize: 40, marginTop: 10 }}>Tanda Kasih</Script>
        <p style={{ margin: '14px auto 0', maxWidth: 330, fontFamily: F.sans, fontSize: 13.5, fontWeight: 300, lineHeight: 1.75, color: c.muted }}>Kehadiran Anda adalah hadiah terindah. Namun bila ingin berbagi tanda kasih, dapat melalui:</p>
      </Reveal>
      <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {accounts.map((acc, i) => {
          const key = acc.id || acc.number || i
          return (
            <Reveal key={key} style={{ border: `1px solid ${c.line2}`, borderRadius: 20, background: c.paper, padding: '20px 22px' }}>
              <div className="flex justify-between items-center" style={{ gap: 12 }}>
                <div style={{ fontFamily: F.serif, fontSize: 19, letterSpacing: '0.06em' }}>{acc.bank}</div>
                <div className="uppercase" style={{ fontFamily: F.sans, fontSize: 10, letterSpacing: '0.2em', color: c.ash }}>{acc.type === 'ewallet' ? 'E-Wallet' : 'Bank'}</div>
              </div>
              <div style={{ fontFamily: F.sans, fontSize: 17, letterSpacing: '0.12em', marginTop: 10, color: c.ink }}>{acc.number}</div>
              <div className="flex justify-between items-center" style={{ gap: 12, marginTop: 6 }}>
                <div style={{ fontFamily: F.sans, fontSize: 12.5, fontWeight: 300, color: c.muted }}>a.n. {acc.holder}</div>
                <button onClick={() => copy(acc.number, key)} className="uppercase" style={{ cursor: 'pointer', border: `1px solid ${c.copyBrd}`, background: c.copyBg, color: c.terraDk, fontFamily: F.sans, fontSize: 11, letterSpacing: '0.16em', padding: '8px 16px', borderRadius: 999 }}>{copiedKey === key ? 'Tersalin ✓' : 'Salin'}</button>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

// ─── 10. TURUT MENGUNDANG (optional) ─────────────────────────────
const TurutMengundang = ({ data }) => {
  if (!data?.turutMengundangEnabled) return null
  const families = (data?.families || [])
    .map(f => ({ ...f, members: (f.members || []).filter(m => m && m.trim()) }))
    .filter(f => f.members.length)
  if (!families.length) return null
  return (
    <section style={{ padding: '78px 28px 88px', background: c.paper }}>
      <Reveal className="text-center">
        <Kicker>10 · Turut Mengundang</Kicker>
        <Script style={{ fontSize: 38, marginTop: 10 }}>Keluarga Besar</Script>
      </Reveal>
      <Reveal style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 26 }}>
        {families.map((fam, i) => (
          <div key={fam.id || i} className="text-center">
            {fam.side && <div style={{ fontFamily: F.serif, fontSize: 17, color: c.terra }}>{fam.side}</div>}
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {fam.members.map((m, j) => (
                <div key={j} style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 300, color: c.muted }}>{m}</div>
              ))}
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  )
}

// ─── 11. FOOTER ──────────────────────────────────────────────────
const Footer = ({ data, groomNick, brideNick, heroDate }) => (
  <section className="relative overflow-hidden text-center" style={{ padding: '84px 30px 130px', background: `${c.paper} url("${A.footerBg}") center/cover no-repeat` }}>
    {data?.meta?.footerPhoto && (
      <Framed src={data.meta.footerPhoto} radius="50%" inner="50%" style={{ width: 150, height: 150, margin: '0 auto 28px' }} />
    )}
    <p style={{ margin: '0 auto', maxWidth: 330, fontFamily: F.sans, fontSize: 13.5, fontWeight: 300, lineHeight: 1.8, color: '#57534b' }}>Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.</p>
    <Script style={{ marginTop: 26, fontSize: 30, color: c.terra }}>Wassalamu&rsquo;alaikum Wr. Wb.</Script>
    <div className="uppercase" style={{ marginTop: 22, fontFamily: F.sans, fontSize: 11, letterSpacing: '0.32em', color: c.ash }}>Kami yang berbahagia</div>
    <div style={{ marginTop: 10, fontFamily: F.serif, fontSize: 32, letterSpacing: '0.04em' }}>{groomNick} <span style={{ fontFamily: F.script, fontSize: 26, color: c.terra }}>&amp;</span> {brideNick}</div>
    <div style={{ marginTop: 6, letterSpacing: '0.28em', fontSize: 12, color: c.muted }}>{heroDate}</div>
  </section>
)

// ─── FIXED: MUSIC + NAV ──────────────────────────────────────────
const scrollToId = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
const NAV = [['Home', 'sec-home'], ['Couple', 'sec-couple'], ['Acara', 'sec-acara'], ['Galeri', 'sec-galeri'], ['RSVP', 'sec-rsvp'], ['Hadiah', 'sec-hadiah']]

// ═══════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════
export default function AshenBloomTheme({
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
    setTimeout(() => { setOpened(true); if (audioRef?.current) setMusicPlaying(true) }, 850)
  }

  return (
    <InvitationLayout layout={THEMES.ASHEN_BLOOM} data={data} bgUrl="">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Pinyon+Script&family=Jost:ital,wght@0,300;0,400;0,500;1,300&display=swap');
        @keyframes ab-eq1 { 0%,100% { height: 5px } 50% { height: 14px } }
        @keyframes ab-eq2 { 0%,100% { height: 12px } 50% { height: 4px } }
        @keyframes ab-eq3 { 0%,100% { height: 7px } 50% { height: 15px } }
      `}</style>

      <div className="w-full relative h-full flex flex-col overflow-x-hidden" style={{ fontFamily: F.sans, color: c.ink, background: c.paper }}>
        {data?.music !== false && (
          <audio ref={audioRef} src={data?.musicUrl || MUSIC_URLS[data?.musicId || 1] || MUSIC_URLS[1]} loop />
        )}

        <AnimatePresence>
          {!opened && (
            <Cover key="cover" data={data} groomNick={groomNick} brideNick={brideNick} heroDate={heroDate} guestName={guest} handleOpen={handleOpen} animateClose={animateClose} />
          )}
        </AnimatePresence>

        {opened && (
          <motion.div className="flex flex-col w-full relative" style={{ zIndex: 1 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <Hero data={data} groomNick={groomNick} brideNick={brideNick} heroDate={heroDate} countdown={countdown} />
            <Quote data={data} />
            <Couple data={data} />
            <Acara data={data} />
            <LoveStory data={data} />
            <Dresscode data={data} />
            <Gallery data={data} />
            <WishRsvp data={data} wishes={wishes} onSubmitWish={onSubmitWish} />
            <Gift data={data} />
            <TurutMengundang data={data} />
            <Footer data={data} groomNick={groomNick} brideNick={brideNick} heroDate={heroDate} />

            {/* Music toggle */}
            {data?.music !== false && (
              <button onClick={() => setMusicPlaying(!musicPlaying)} title="Musik"
                className="fixed md:absolute flex items-end justify-center" style={{ bottom: 88, right: 14, zIndex: 55, width: 44, height: 44, borderRadius: 50, border: `1px solid ${c.line2}`, background: 'rgba(251,250,248,.92)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', cursor: 'pointer', gap: 3, paddingBottom: 14, boxShadow: '0 6px 18px rgba(60,55,48,.14)' }}>
                {[['ab-eq1', '0.9s', 8], ['ab-eq2', '0.8s', 12], ['ab-eq3', '1s', 6]].map(([anim, dur, h], i) => (
                  <span key={i} style={{ width: 3, borderRadius: 2, background: c.terra, height: h, animation: `${anim} ${dur} ease-in-out infinite`, animationPlayState: musicPlaying ? 'running' : 'paused' }} />
                ))}
              </button>
            )}

            {/* Bottom nav */}
            <nav className="fixed md:absolute left-1/2 -translate-x-1/2 flex" style={{ bottom: 18, zIndex: 55, background: 'rgba(46,44,41,.94)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderRadius: 999, padding: '8px 10px', gap: 2, boxShadow: '0 10px 30px rgba(30,28,25,.3)' }}>
              {NAV.map(([label, id]) => (
                <button key={id} onClick={() => scrollToId(id)} style={{ border: 'none', cursor: 'pointer', background: 'transparent', color: '#e8e5df', fontFamily: F.sans, fontSize: 10.5, letterSpacing: '0.08em', padding: '8px 10px', borderRadius: 999 }}>{label}</button>
              ))}
            </nav>
          </motion.div>
        )}
      </div>
    </InvitationLayout>
  )
}
