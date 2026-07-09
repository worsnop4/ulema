import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { THEMES } from '../config/constants'

// ─── PALETTE (ivory + sage + gold — "Botanical Ivory") ───────────
const c = {
  ivory:     '#faf7f2',
  ivoryDeep: '#f2ede3',
  backdrop:  '#ece7db',
  sage:      '#3d4a3a',
  sageDeep:  '#2c352a',
  gold:      '#c9a24b',
  goldSoft:  '#e3cf9a',
  charcoal:  '#2b2b26',
  muted:     'rgba(43,43,38,0.65)',
  cream:     '#f2ede3',
  label:     '#9fa892',
  labelWarm: '#9c9585',
}

// ─── ASSETS (full-bleed backgrounds uploaded to public/themes/Special/theme-10) ──
const A = {
  coverBg:  '/themes/Special/theme-10/bg1.png',
  eventsBg: '/themes/Special/theme-10/bg2.jpg',
}

// ─── DATE HELPERS ────────────────────────────────────────────────
const ID_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const ID_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const fmtCoverDate = (s) => {
  if (!s) return 'Minggu, 28 Desember 2027'
  try {
    const d = new Date(s)
    if (isNaN(d)) return s
    return `${ID_DAYS[d.getDay()]}, ${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`
  } catch { return s }
}

const fmtEventDate = (s) => {
  if (!s) return { day: '28', monthYear: 'Desember 2027' }
  try {
    const d = new Date(s)
    if (isNaN(d)) return { day: '28', monthYear: 'Desember 2027' }
    return { day: d.getDate().toString().padStart(2, '0'), monthYear: `${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}` }
  } catch { return { day: '28', monthYear: 'Desember 2027' } }
}

// ─── REUSABLE DECOR ──────────────────────────────────────────────
const Corners = ({ inset = 18, size = 28, opacity = 0.55 }) => {
  const base = { position: 'absolute', width: size, height: size, opacity, pointerEvents: 'none' }
  return (
    <>
      <span style={{ ...base, top: inset, left: inset, borderLeft: `1px solid ${c.gold}`, borderTop: `1px solid ${c.gold}` }} />
      <span style={{ ...base, top: inset, right: inset, borderRight: `1px solid ${c.gold}`, borderTop: `1px solid ${c.gold}` }} />
      <span style={{ ...base, bottom: inset, left: inset, borderLeft: `1px solid ${c.gold}`, borderBottom: `1px solid ${c.gold}` }} />
      <span style={{ ...base, bottom: inset, right: inset, borderRight: `1px solid ${c.gold}`, borderBottom: `1px solid ${c.gold}` }} />
    </>
  )
}

const Diamond = ({ size = 7, mb = 16 }) => (
  <div style={{ width: size, height: size, background: c.gold, transform: 'rotate(45deg)', margin: `0 auto ${mb}px` }} />
)

const Eyebrow = ({ children, color = c.gold, className = '', style = {} }) => (
  <p className={`font-sans ${className}`} style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color, margin: 0, ...style }}>
    {children}
  </p>
)

const Title = ({ children, size = '1.8rem', color = c.charcoal, className = '', style = {} }) => (
  <h2 className={className} style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 500, fontSize: size, color, margin: 0, ...style }}>
    {children}
  </h2>
)

// Dotted micro-texture section wrapper
const dotted = (bg, dot) => ({
  backgroundColor: bg,
  backgroundImage: `radial-gradient(circle at center, ${dot} 1px, transparent 1.4px)`,
  backgroundSize: '22px 22px',
})

const Reveal = ({ children, x = 0, y = 24, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x, y }}
    whileInView={{ opacity: 1, x: 0, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.7, delay }}>
    {children}
  </motion.div>
)

// ─── 1. COVER ────────────────────────────────────────────────────
const CoverSection = ({ data, bride, groom, primaryEvent, handleOpen, animateClose, guestName }) => {
  const coverPhoto = data?.meta?.coverPhoto || data?.meta?.photo || data?.bride?.photo || data?.groom?.photo || null
  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center text-center overflow-hidden"
      style={{
        padding: '56px 32px',
        color: c.cream,
        backgroundColor: c.sage,
        backgroundImage: `linear-gradient(rgba(44,53,42,0.35), rgba(44,53,42,0.55)), url('${A.coverBg}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      animate={animateClose ? { y: '-100%', opacity: 0 } : { y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}>
      <Corners inset={22} size={34} opacity={1} />

      <motion.div className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
        <Eyebrow className="mb-7" style={{ letterSpacing: '0.45em' }}>The Wedding Of</Eyebrow>

        <div className="mb-7 overflow-hidden flex items-center justify-center"
          style={{ width: 131, height: 240, borderRadius: 66, border: `2px solid ${c.gold}`, background: c.sageDeep }}>
          {coverPhoto
            ? <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            : <span className="font-sans" style={{ fontSize: 10, color: c.cream, opacity: 0.7 }}>Foto</span>}
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 500, fontSize: '2.5rem', lineHeight: 1.1, color: c.goldSoft, margin: 0 }}>{bride}</h1>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1.7rem', color: c.gold, margin: '6px 0' }}>&amp;</span>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 500, fontSize: '2.5rem', lineHeight: 1.1, color: c.goldSoft, margin: '0 0 20px' }}>{groom}</h1>

        <div style={{ width: 64, height: 1, background: c.gold, opacity: 0.6, marginBottom: 18 }} />
        <p className="font-sans" style={{ fontSize: 13, letterSpacing: '0.2em', margin: '0 0 30px', color: c.goldSoft }}>{fmtCoverDate(primaryEvent?.date)}</p>

        <div style={{ width: '100%', maxWidth: 280, padding: '16px 18px', border: `1px solid rgba(201,162,75,0.45)`, marginBottom: 28 }}>
          <p className="font-sans" style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: c.label, margin: '0 0 6px' }}>Kepada Yth. Bapak/Ibu/Saudara/i</p>
          <p className="font-sans" style={{ fontSize: 15, fontWeight: 500, margin: 0, color: c.goldSoft }}>{guestName}</p>
        </div>

        <motion.button onClick={handleOpen}
          className="font-sans"
          style={{ background: `linear-gradient(135deg, ${c.gold}, ${c.goldSoft})`, color: '#fff', border: 'none', padding: '14px 40px', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 600, borderRadius: 30, cursor: 'pointer' }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Buka Undangan
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ─── 2. COUNTDOWN ────────────────────────────────────────────────
const CountdownSection = ({ countdown, primaryEvent, bride, groom }) => {
  const blocks = [
    { label: 'Hari', v: countdown?.d || 0 },
    { label: 'Jam', v: countdown?.h || 0 },
    { label: 'Menit', v: countdown?.m || 0 },
    { label: 'Detik', v: countdown?.s || 0 },
  ]
  const calendarUrl = primaryEvent?.date
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${encodeURIComponent(bride)}+%26+${encodeURIComponent(groom)}&dates=${primaryEvent.date.replace(/-/g, '')}T010000Z/${primaryEvent.date.replace(/-/g, '')}T060000Z`
    : null
  return (
    <section style={{ ...dotted(c.ivory, 'rgba(201,162,75,0.14)'), padding: '56px 28px', textAlign: 'center' }}>
      <Diamond />
      <Eyebrow className="mb-2.5">Save The Date</Eyebrow>
      <Title size="1.9rem" className="mb-8" style={{ marginTop: 6 }}>Menuju Hari Bahagia</Title>
      <div className="flex justify-center gap-3 mb-8">
        {blocks.map((b, i) => (
          <Reveal key={b.label} y={14} delay={i * 0.07}>
            <div className="flex flex-col items-center justify-center gap-1" style={{ width: 68, padding: '14px 0', border: `1px solid rgba(201,162,75,0.4)` }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.7rem', color: c.sage, fontWeight: 600, lineHeight: 1 }}>{b.v.toString().padStart(2, '0')}</span>
              <span className="font-sans" style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: c.labelWarm }}>{b.label}</span>
            </div>
          </Reveal>
        ))}
      </div>
      {calendarUrl && (
        <a href={calendarUrl} target="_blank" rel="noreferrer" className="inline-block font-sans"
          style={{ padding: '12px 30px', border: `1px solid ${c.sage}`, borderRadius: 30, fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: c.sage, fontWeight: 600 }}>
          Simpan Tanggal
        </a>
      )}
    </section>
  )
}

// ─── 3. QUOTE ────────────────────────────────────────────────────
const QuoteSection = ({ data }) => {
  const quote = data?.quote || 'Di antara tanda kebesaran-Nya, diciptakan-Nya pasangan untuk kita agar hati merasa tenteram, dan ditumbuhkan-Nya kasih sayang di antara keduanya.'
  return (
    <section style={{ ...dotted(c.ivoryDeep, 'rgba(61,74,58,0.09)'), padding: '48px 34px', textAlign: 'center' }}>
      <Diamond size={8} mb={22} />
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1.15rem', lineHeight: 1.7, color: c.sage, margin: '0 0 14px' }}>
        &ldquo;{quote}&rdquo;
      </p>
      <Eyebrow color={c.label} style={{ letterSpacing: '0.2em' }}>Q.S. Ar-Rum : 21</Eyebrow>
    </section>
  )
}

// ─── 4. PROFILES ─────────────────────────────────────────────────
const ProfileSection = ({ data }) => {
  const renderPerson = (person) => (
    <Reveal>
      <div className="flex flex-col items-center text-center">
        <div className="overflow-hidden mb-4 flex items-center justify-center"
          style={{ width: 236, height: 240, borderRadius: '50%', border: `3px solid ${c.gold}`, background: c.ivoryDeep }}>
          {person?.photo
            ? <img src={person.photo} alt={person?.nickname} className="w-full h-full object-cover" />
            : <span className="font-sans" style={{ fontSize: 11, color: c.label }}>Foto</span>}
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 500, fontSize: '1.7rem', color: c.charcoal, margin: '0 0 4px' }}>{person?.name || person?.nickname}</h3>
        {person?.nickname && (
          <p className="font-sans" style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: c.gold, fontWeight: 600, margin: '0 0 12px' }}>{person.nickname}</p>
        )}
        <p className="font-sans" style={{ fontSize: 13, lineHeight: 1.6, color: c.muted, maxWidth: 220, margin: '0 0 10px' }}>
          Putra/Putri dari<br />Bpk. {person?.father || '—'} &amp; Ibu {person?.mother || '—'}
        </p>
        {person?.instagram && (
          <a href={`https://instagram.com/${person.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
            className="font-sans" style={{ fontSize: 12, letterSpacing: '0.1em', color: c.sage, fontWeight: 600 }}>
            @{person.instagram.replace('@', '')}
          </a>
        )}
      </div>
    </Reveal>
  )
  return (
    <section id="mempelai" className="relative" style={{ background: `linear-gradient(180deg, ${c.ivoryDeep}, #ffffff)`, padding: '56px 28px' }}>
      <Corners />
      <p className="text-center mb-10"><Eyebrow>Bride &amp; Groom</Eyebrow></p>

      <div className="mb-9">{renderPerson(data?.bride)}</div>

      <div className="flex items-center justify-center gap-3.5 mb-9">
        <div style={{ width: 44, height: 1, background: c.gold, opacity: 0.5 }} />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1.6rem', color: c.gold }}>&amp;</span>
        <div style={{ width: 44, height: 1, background: c.gold, opacity: 0.5 }} />
      </div>

      {renderPerson(data?.groom)}
    </section>
  )
}

// ─── 5. EVENTS ───────────────────────────────────────────────────
const EventsSection = ({ akad, resepsi }) => {
  const renderCard = (ev, title, dir) => {
    if (!ev) return null
    const { day, monthYear } = fmtEventDate(ev.date)
    return (
      <Reveal x={dir === 'L' ? -20 : 20}>
        <div style={{ border: `1px solid rgba(227,207,154,0.3)`, padding: '28px 22px', textAlign: 'center', marginBottom: 18 }}>
          <Eyebrow color={c.gold} className="mb-3.5" style={{ fontSize: 11, letterSpacing: '0.3em' }}>{title}</Eyebrow>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.4rem', fontWeight: 600, color: c.goldSoft, lineHeight: 1 }}>{day}</span>
          <p className="font-sans" style={{ fontSize: 14, margin: '8px 0 14px', color: c.cream }}>{monthYear}</p>
          <p className="font-sans" style={{ fontSize: 13, color: c.goldSoft, margin: '0 0 14px' }}>{ev.time || '—'}</p>
          <p className="font-sans" style={{ fontSize: 14, fontWeight: 600, color: c.cream, margin: '0 0 4px' }}>{ev.location || '—'}</p>
          {ev.address && <p className="font-sans" style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(242,237,227,0.7)', margin: '0 auto 18px', maxWidth: 220 }}>{ev.address}</p>}
          {ev.mapUrl && (
            <a href={ev.mapUrl} target="_blank" rel="noreferrer" className="inline-block font-sans"
              style={{ padding: '10px 24px', border: `1px solid ${c.gold}`, borderRadius: 30, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: c.goldSoft }}>
              Petunjuk Arah
            </a>
          )}
        </div>
      </Reveal>
    )
  }
  return (
    <section id="acara" className="relative" style={{
      padding: '56px 26px',
      color: c.cream,
      backgroundColor: c.sage,
      backgroundImage: `linear-gradient(rgba(44,53,42,0.72), rgba(44,53,42,0.82)), url('${A.eventsBg}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <Corners />
      <p className="text-center mb-9"><Eyebrow color={c.goldSoft}>Waktu &amp; Tempat</Eyebrow></p>
      {renderCard(akad, 'Akad Nikah', 'L')}
      {renderCard(resepsi, 'Resepsi', 'R')}
    </section>
  )
}

// ─── 6. DRESSCODE ────────────────────────────────────────────────
const DresscodeSection = ({ data }) => {
  const dc = data?.dresscode || {}
  const swatches = [c.sage, c.gold, c.goldSoft, c.ivoryDeep]
  return (
    <section style={{ ...dotted(c.ivory, 'rgba(201,162,75,0.13)'), padding: '48px 28px', textAlign: 'center' }}>
      <Diamond />
      <Eyebrow className="mb-3">Dresscode</Eyebrow>
      <Title size="1.6rem" className="mb-4" style={{ marginTop: 6 }}>{dc.name || 'Warna Pilihan Kami'}</Title>
      <p className="font-sans" style={{ fontSize: 13, lineHeight: 1.6, color: c.muted, maxWidth: 280, margin: '0 auto 26px' }}>
        {dc.notes || 'Kami dengan hormat menganjurkan warna berikut untuk melengkapi kebahagiaan hari kami.'}
      </p>
      <div className="flex justify-center gap-3.5">
        {swatches.map((col, i) => (
          <div key={i} style={{ width: 44, height: 44, borderRadius: '50%', background: col, border: `2px solid ${c.ivory}`, boxShadow: `0 0 0 1px rgba(43,43,38,0.15)` }} />
        ))}
      </div>
    </section>
  )
}

// ─── 7. LIVE STREAMING ───────────────────────────────────────────
const LiveStreamSection = ({ data }) => {
  if (!data?.livestreamEnabled) return null
  const url = data?.livestreamPlatforms?.find(p => p.url)?.url
  if (!url) return null
  return (
    <section style={{ ...dotted(c.ivoryDeep, 'rgba(61,74,58,0.09)'), padding: '48px 28px', textAlign: 'center' }}>
      <Diamond />
      <Eyebrow className="mb-3">Live Streaming</Eyebrow>
      <Title size="1.6rem" className="mb-4" style={{ marginTop: 6 }}>Saksikan Bersama Kami</Title>
      <p className="font-sans" style={{ fontSize: 13, lineHeight: 1.6, color: c.muted, maxWidth: 280, margin: '0 auto 26px' }}>
        Bagi yang berhalangan hadir, ikuti momen sakral kami secara langsung melalui tautan berikut.
      </p>
      <a href={url} target="_blank" rel="noreferrer" className="inline-block font-sans"
        style={{ padding: '13px 32px', background: `linear-gradient(135deg, ${c.gold}, ${c.goldSoft})`, borderRadius: 30, fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: c.sageDeep, fontWeight: 600 }}>
        Lihat Live Streaming
      </a>
    </section>
  )
}

// ─── 8. LOVE STORY ───────────────────────────────────────────────
const LoveStorySection = ({ data }) => {
  const stories = data?.loveStory || []
  if (!stories.length) return null
  return (
    <section style={{ ...dotted(c.ivory, 'rgba(201,162,75,0.13)'), padding: '56px 28px' }}>
      <Diamond />
      <p className="text-center mb-2"><Eyebrow>Kisah Kami</Eyebrow></p>
      <Title size="1.8rem" className="text-center mb-10" style={{ marginTop: 4 }}>Love Story</Title>
      <div className="relative">
        <div style={{ position: 'absolute', left: 23, top: 6, bottom: 6, width: 1, background: 'rgba(201,162,75,0.35)' }} />
        {stories.map((s, i) => (
          <Reveal key={s.id || i} x={-16}>
            <div className="flex relative" style={{ gap: 18, marginBottom: 30 }}>
              <div className="overflow-hidden" style={{ width: 46, height: 46, minWidth: 46, borderRadius: '50%', border: `2px solid ${c.gold}`, background: c.ivoryDeep, zIndex: 1 }}>
                {s.photo && <img src={s.photo} alt={s.title} className="w-full h-full object-cover" />}
              </div>
              <div style={{ paddingTop: 4 }}>
                <span className="font-sans" style={{ fontSize: 11, letterSpacing: '0.15em', color: c.gold, fontWeight: 600, textTransform: 'uppercase' }}>{s.date || s.year}</span>
                <h4 className="font-sans" style={{ fontSize: 15, fontWeight: 600, color: c.charcoal, margin: '4px 0 6px' }}>{s.title}</h4>
                <p className="font-sans" style={{ fontSize: 13, lineHeight: 1.65, color: c.muted, margin: 0 }}>{s.story}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

// ─── 9. GALLERY ──────────────────────────────────────────────────
const GallerySection = ({ data }) => {
  const photos = data?.gallery || []
  if (!photos.length) return null
  return (
    <section id="galeri" className="relative" style={{ ...dotted(c.ivoryDeep, 'rgba(61,74,58,0.09)'), padding: '56px 26px' }}>
      <Corners />
      <p className="text-center mb-2"><Eyebrow>Our Moments</Eyebrow></p>
      <Title size="1.8rem" className="text-center mb-8" style={{ marginTop: 4 }}>Galeri</Title>
      <div className="grid grid-cols-2 gap-2">
        {photos.map((ph, i) => {
          const src = typeof ph === 'string' ? ph : ph?.src
          if (!src) return null
          return (
            <Reveal key={ph?.id || src} y={16} delay={i * 0.05}>
              <div className="overflow-hidden group" style={{ aspectRatio: '1', border: `1px solid rgba(201,162,75,0.25)` }}>
                <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

// ─── 10. GIFT ────────────────────────────────────────────────────
const GiftSection = ({ data }) => {
  const { copiedKey: copied, copy: copyAccount } = useCopyToClipboard()
  const accounts = data?.accounts || []
  if (!accounts.length) return null
  return (
    <section id="kado" className="relative" style={{ ...dotted(c.ivory, 'rgba(201,162,75,0.13)'), padding: '56px 28px', textAlign: 'center' }}>
      <Corners />
      <Eyebrow className="mb-2">Wedding Gift</Eyebrow>
      <Title size="1.8rem" className="mb-3.5" style={{ marginTop: 4 }}>Tanda Kasih</Title>
      <p className="font-sans" style={{ fontSize: 13, lineHeight: 1.6, color: c.muted, maxWidth: 270, margin: '0 auto 30px' }}>
        Doa restu Anda adalah karunia terbesar bagi kami. Jika ingin memberi tanda kasih, dapat melalui:
      </p>
      <div className="flex flex-col gap-3.5">
        {accounts.map((acc, i) => {
          const accKey = acc.id || acc.number || i
          const isCopied = copied === accKey
          return (
            <div key={accKey} className="flex flex-col gap-1" style={{ border: `1px solid rgba(201,162,75,0.35)`, padding: 20, textAlign: 'left' }}>
              <span className="font-sans" style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: c.gold, fontWeight: 600 }}>{acc.bank}</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: c.charcoal, letterSpacing: '0.05em' }}>{acc.number}</span>
              <span className="font-sans" style={{ fontSize: 12, color: 'rgba(43,43,38,0.6)' }}>a.n. {acc.holder}</span>
              <button onClick={() => copyAccount(acc.number, accKey)} className="font-sans"
                style={{ alignSelf: 'flex-start', marginTop: 8, padding: '8px 18px', border: `1px solid ${c.sage}`, background: isCopied ? c.sage : 'transparent', color: isCopied ? c.cream : c.sage, borderRadius: 20, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
                {isCopied ? 'Tersalin!' : 'Salin Rekening'}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── 11. RSVP / WISHES ───────────────────────────────────────────
const WishRsvpSection = ({ data, wishes, onSubmitWish }) => {
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

  const list = (wishes || data?.rsvps || []).slice(0, 6)
  const inputStyle = { padding: '12px 14px', border: `1px solid rgba(201,162,75,0.4)`, background: c.ivory, fontSize: 13, color: c.charcoal, outline: 'none', width: '100%' }
  const statusLabel = (w) => {
    const raw = (w.status || w.rsvp || w.attendance || '').toString().toLowerCase()
    if (!raw) return ''
    return raw.includes('tidak') ? 'Tidak Hadir' : 'Hadir'
  }

  return (
    <section id="ucapan" className="relative" style={{ ...dotted(c.ivoryDeep, 'rgba(61,74,58,0.09)'), padding: '56px 28px' }}>
      <Corners />
      <p className="text-center mb-2"><Eyebrow>Doa &amp; Kehadiran</Eyebrow></p>
      <Title size="1.8rem" className="text-center mb-8" style={{ marginTop: 4 }}>Ucapan &amp; RSVP</Title>

      <form onSubmit={submit} className="flex flex-col gap-3 mb-8">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama Anda" required className="font-sans placeholder:opacity-50" style={inputStyle} />
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Tuliskan doa dan ucapan..." required className="font-sans placeholder:opacity-50" style={{ ...inputStyle, resize: 'none' }} />
        <div className="flex gap-5">
          {[['hadir', 'Hadir'], ['tidak_hadir', 'Tidak Hadir']].map(([v, l]) => (
            <label key={v} className="flex items-center gap-2 font-sans cursor-pointer" style={{ fontSize: 13, color: c.charcoal }}>
              <input type="radio" name="att" checked={attendance === v} onChange={() => setAttendance(v)} style={{ accentColor: c.gold }} /> {l}
            </label>
          ))}
        </div>
        <button type="submit" disabled={busy} className="font-sans"
          style={{ marginTop: 4, padding: 13, background: `linear-gradient(135deg, ${c.gold}, ${c.goldSoft})`, border: 'none', borderRadius: 30, fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 600, color: c.sageDeep, cursor: 'pointer', opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Mengirim…' : 'Sampaikan Doa'}
        </button>
      </form>

      {list.length > 0 && (
        <div className="flex flex-col gap-3">
          {list.map((w, i) => (
            <Reveal key={w.id || i} x={-12}>
              <div style={{ background: c.ivory, borderLeft: `3px solid ${c.gold}`, padding: '14px 16px' }}>
                <div className="flex justify-between mb-1">
                  <span className="font-sans" style={{ fontSize: 13, fontWeight: 600, color: c.sage }}>{w.name}</span>
                  <span className="font-sans" style={{ fontSize: 10, color: 'rgba(43,43,38,0.45)' }}>{statusLabel(w)}</span>
                </div>
                <p className="font-sans" style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(43,43,38,0.7)', margin: 0 }}>{w.message || w.wish}</p>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── 12. FOOTER ──────────────────────────────────────────────────
const FooterSection = ({ bride, groom }) => (
  <section className="relative text-center" style={{ padding: '56px 28px', color: c.cream, background: `linear-gradient(180deg, ${c.sage}, ${c.sageDeep})` }}>
    <Corners opacity={0.5} />
    <Eyebrow className="mb-4">Terima Kasih</Eyebrow>
    <p className="font-sans" style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(242,237,227,0.75)', maxWidth: 260, margin: '0 auto 28px' }}>
      Kehadiran serta doa restu Bapak/Ibu/Saudara/i merupakan kebahagiaan dan kehormatan besar bagi kami.
    </p>
    <div className="flex items-center justify-center gap-3.5 mb-9">
      <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.7rem', color: c.goldSoft }}>{bride}</span>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1.3rem', color: c.gold }}>&amp;</span>
      <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.7rem', color: c.goldSoft }}>{groom}</span>
    </div>
    <div style={{ width: 36, height: 1, background: c.gold, opacity: 0.5, margin: '0 auto 20px' }} />
    <Eyebrow color="rgba(242,237,227,0.4)" style={{ fontSize: 10, letterSpacing: '0.2em' }}>Dibuat dengan Ulema</Eyebrow>
  </section>
)

// ─── STICKY BOTTOM NAV ───────────────────────────────────────────
const StickyNav = ({ musicEnabled, musicPlaying, setMusicPlaying }) => {
  const links = [
    { href: '#top', label: 'Cover' },
    { href: '#mempelai', label: 'Mempelai' },
    { href: '#acara', label: 'Acara' },
    { href: '#galeri', label: 'Galeri' },
    { href: '#kado', label: 'Kado' },
    { href: '#ucapan', label: 'Ucapan' },
  ]
  const go = (e, href) => {
    e.preventDefault()
    const id = href.replace('#', '')
    const el = id === 'top' ? document.getElementById('top') : document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const linkStyle = { fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.sage, textAlign: 'center' }
  return (
    <div className="sticky bottom-0 left-0 right-0 flex justify-around items-center z-20"
      style={{ background: 'rgba(250,247,242,0.94)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderTop: `1px solid rgba(201,162,75,0.3)`, padding: '12px 6px' }}>
      {links.map(l => (
        <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)} className="font-sans" style={linkStyle}>{l.label}</a>
      ))}
      {musicEnabled && (
        <button onClick={() => setMusicPlaying(!musicPlaying)} className="font-sans"
          style={{ background: 'none', border: 'none', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.gold, cursor: 'pointer' }}>
          {musicPlaying ? 'Musik: On' : 'Musik: Off'}
        </button>
      )}
    </div>
  )
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────
export default function BotanicalIvoryTheme({
  data, countdown, opened, setOpened,
  animateClose, setAnimateClose,
  musicPlaying, setMusicPlaying, audioRef,
  wishes, onSubmitWish, guestName,
}) {
  const bride = data?.bride?.nickname || 'Putri'
  const groom = data?.groom?.nickname || 'Putra'
  const akad = data?.events?.[0]
  const resepsi = data?.events?.[1]
  const primary = akad || {}
  const musicEnabled = data?.music !== false

  const handleOpen = () => {
    setAnimateClose(true)
    setTimeout(() => {
      setOpened(true)
      // useAudioPlayer's effect calls .play() when musicPlaying flips true.
      if (audioRef?.current) setMusicPlaying(true)
    }, 900)
  }

  return (
    <InvitationLayout layout={THEMES.BOTANICAL_IVORY} data={data}>
      {/* Botanical Ivory uses a fixed premium type system (Playfair Display +
          Cormorant Garamond + Jost); it intentionally opts out of the generic
          fontConfig, same as the other bespoke themes. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&family=Cormorant+Garamond:ital,wght@0,500;1,500;1,600&family=Jost:wght@300;400;500;600&display=swap');
      `}</style>

      <div id="top" className="w-full relative h-full flex flex-col overflow-x-hidden"
        style={{ fontFamily: "'Jost', sans-serif", background: c.ivory, color: c.charcoal }}>

        {/* Audio */}
        {musicEnabled && (
          <audio ref={audioRef} src={data?.musicUrl || MUSIC_URLS[data?.musicId || 1] || MUSIC_URLS[1]} loop />
        )}

        {/* Cover overlay */}
        <AnimatePresence>
          {!opened && (
            <CoverSection key="cover" data={data} bride={bride} groom={groom}
              primaryEvent={primary} handleOpen={handleOpen} animateClose={animateClose} guestName={guestName} />
          )}
        </AnimatePresence>

        {/* Content */}
        {opened && (
          <motion.div className="flex flex-col w-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}>
            <CountdownSection countdown={countdown} primaryEvent={primary} bride={bride} groom={groom} />
            <QuoteSection data={data} />
            <ProfileSection data={data} />
            <EventsSection akad={akad} resepsi={resepsi} />
            <DresscodeSection data={data} />
            <LiveStreamSection data={data} />
            <LoveStorySection data={data} />
            <GallerySection data={data} />
            <GiftSection data={data} />
            <WishRsvpSection data={data} wishes={wishes} onSubmitWish={onSubmitWish} />
            <FooterSection bride={bride} groom={groom} />
            <StickyNav musicEnabled={musicEnabled} musicPlaying={musicPlaying} setMusicPlaying={setMusicPlaying} />
          </motion.div>
        )}
      </div>
    </InvitationLayout>
  )
}
