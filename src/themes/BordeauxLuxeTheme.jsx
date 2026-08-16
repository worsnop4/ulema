import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, MapPin, Heart, Volume2, VolumeX, Calendar } from 'lucide-react'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { THEMES } from '../config/constants'

// ─── PALETTE (wine-burgundy + gold, ref: invisimple Luxury 04) ────
const c = {
  wine:     '#4b0f28',
  wineDeep: '#2b0817',
  gold:     '#c9a24b',
  goldSoft: '#a99d87',
  cream:    '#faf3ea',
  text:     '#f5ece0',
  glass:    'rgba(43,8,23,0.55)',
  glassBrd: 'rgba(201,162,75,0.28)',
  overlay:  'rgba(43,8,23,0.55)',
}

// ─── ASSETS (public/themes/Luxury/theme-13/) — graceful fallback ──
const A = {
  coverVideo:  '/themes/Luxury/theme-13/cover-bg.mp4',
  coverPoster: '/themes/Luxury/theme-13/cover-poster.jpg',
  bgVideo:     '/themes/Luxury/theme-13/bg.mp4',
  desktopBg:   '/themes/Luxury/theme-13/desktop-bg.jpg',
  frame:       '/themes/Luxury/theme-13/frame.png',
  music:       '/themes/Luxury/theme-13/music.mp3',
}

// ─── HELPERS ─────────────────────────────────────────────────────
const ID_DAYS = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const ID_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const ID_MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des']

const fmtCoverDate = (s) => {
  if (!s) return 'Sabtu, 28 Desember 2027'
  try {
    const d = new Date(s)
    return `${ID_DAYS[d.getDay()]}, ${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`
  } catch { return s }
}

const fmtEventDate = (s) => {
  if (!s) return { day: '28', mon: 'Desember', yr: '2027' }
  try {
    const d = new Date(s)
    return { day: d.getDate().toString().padStart(2, '0'), mon: ID_MONTHS[d.getMonth()], yr: d.getFullYear().toString() }
  } catch { return { day: '28', mon: 'Desember', yr: '2027' } }
}

// Guarded for the love-story timeline, which passes a free-text "Tahun" (every
// stored milestone carries `year`, none carries `date`). `new Date('2024')`
// resolves to 1 Jan 2024, so the theme printed a day and month the couple never
// entered, and "Awal 2024" lost its words the same way. The try/catch never
// helped — `new Date` returns Invalid Date rather than throwing. Real ISO dates
// and timestamps still format, so the wish `createdAt` caller is unaffected.
const fmtShortDate = (s) => {
  if (!s) return ''
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return s
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return `${d.getDate().toString().padStart(2, '0')} ${ID_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

// Jam acara, dirakit dari field yang benar-benar tersimpan. Tema ini dulu
// membaca `ev.time`, yang tidak ada di satu pun undangan: data menyimpan
// `start`, `end`, dan `tz` secara terpisah (lihat panduan desain §3, yang
// memuat peringatan khusus soal nama-nama ini). Akibatnya jam acara selalu
// jatuh ke teks cadangan.
const fmtHours = (ev) => {
  const range = [ev?.start, ev?.end].filter(Boolean).join(' \u2014 ')
  return range && ev?.tz ? `${range} ${ev.tz}` : range
}

// ─── GLASS CARD ──────────────────────────────────────────────────
const Glass = ({ children, className = '', style = {} }) => (
  <div
    className={className}
    style={{
      background: c.glass,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${c.glassBrd}`,
      borderRadius: '18px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(201,162,75,0.15)',
      ...style,
    }}
  >
    {children}
  </div>
)

// ─── GOLD DIVIDER ────────────────────────────────────────────────
const GoldDivider = ({ className = '' }) => (
  <div className={`flex items-center justify-center gap-3 my-7 ${className}`}>
    <div className="h-px w-16" style={{ background: `linear-gradient(to right, transparent, ${c.gold})` }} />
    <div className="w-1.5 h-1.5 rotate-45" style={{ background: c.gold, boxShadow: `0 0 8px ${c.gold}` }} />
    <div className="h-px w-16" style={{ background: `linear-gradient(to left, transparent, ${c.gold})` }} />
  </div>
)

// ─── SECTION LABEL ───────────────────────────────────────────────
const Label = ({ children }) => (
  <p className="text-[11px] tracking-[0.4em] uppercase font-sans mb-3" style={{ color: c.gold }}>
    {children}
  </p>
)

const Heading = ({ children, className = '', style = {} }) => (
  <h2 className={className} style={{ fontFamily: "'Cormorant Upright', serif", color: c.cream, fontWeight: 500, fontStyle: 'italic', letterSpacing: '0.01em', ...style }}>
    {children}
  </h2>
)

// ─── VIDEO BG (fallback to gradient if file missing) ─────────────
const VideoBg = ({ src, poster, className = '' }) => (
  <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}
    style={{ background: `radial-gradient(circle at 50% 20%, ${c.wine} 0%, ${c.wineDeep} 75%)` }}>
    <video autoPlay muted loop playsInline poster={poster}
      className="w-full h-full object-cover opacity-90"
      onError={(e) => { e.currentTarget.style.display = 'none' }}>
      <source src={src} type="video/mp4" />
    </video>
    <div className="absolute inset-0" style={{ background: c.overlay }} />
  </div>
)

// ─── GOLD DUST PARTICLES (generated once per mount) ──────────────
const GoldDust = () => {
  const dust = useState(() => (
    [...Array(18)].map(() => ({
      size: Math.random() * 3 + 1.5,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 6,
      duration: Math.random() * 4 + 3,
    }))
  ))[0]
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {dust.map((p, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ width: p.size, height: p.size, top: `${p.top}%`, left: `${p.left}%`, background: c.gold, boxShadow: `0 0 ${p.size * 4}px ${c.gold}` }}
          animate={{ opacity: [0, 0.9, 0], y: [0, -14, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
      ))}
    </div>
  )
}

// ─── 1. COVER ────────────────────────────────────────────────────
const CoverSection = ({ data, bride, groom, primaryEvent, handleOpen, animateClose, guestName }) => {
  const coverPhoto = data?.meta?.coverPhoto || data?.meta?.photo || data?.bride?.photo || data?.groom?.photo || null
  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ color: c.text }}
      animate={animateClose ? { y: '-100%', opacity: 0 } : { y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}>
      <VideoBg src={A.coverVideo} poster={A.coverPoster} />
      <GoldDust />

      <div className="relative z-20 flex flex-col items-center text-center px-10 w-full">
        <motion.p className="text-[12px] tracking-[0.5em] uppercase font-sans mb-8"
          style={{ color: c.gold }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          The Wedding Of
        </motion.p>

        {coverPhoto && (
          <motion.div className="mb-8 relative p-[3px] rounded-full"
            style={{ background: `linear-gradient(135deg, ${c.gold}, ${c.goldSoft}, ${c.gold})` }}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
            <div className="w-40 h-52 rounded-full overflow-hidden relative" style={{ border: `2px solid ${c.wineDeep}` }}>
              <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4)' }} />
            </div>
          </motion.div>
        )}

        <motion.h1 className="leading-none mb-2"
          style={{ fontFamily: "'Cormorant Upright', serif", fontSize: '3.4rem', color: c.cream, fontWeight: 500, fontStyle: 'italic', textShadow: `0 2px 30px ${c.wineDeep}` }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
          {bride}
        </motion.h1>
        <motion.span className="block my-1" style={{ fontFamily: "'Pinyon Script', cursive", fontSize: '2rem', color: c.gold }}
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55, type: 'spring', stiffness: 200 }}>
          &amp;
        </motion.span>
        <motion.h1 className="leading-none mb-8"
          style={{ fontFamily: "'Cormorant Upright', serif", fontSize: '3.4rem', color: c.cream, fontWeight: 500, fontStyle: 'italic', textShadow: `0 2px 30px ${c.wineDeep}` }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}>
          {groom}
        </motion.h1>

        <motion.div className="w-24 mb-8" style={{ height: 1, background: `linear-gradient(to right, transparent, ${c.gold}, transparent)` }}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.75, duration: 0.8 }} />

        <motion.p className="text-sm tracking-[0.25em] mb-3 font-sans"
          style={{ color: c.text }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
          {fmtCoverDate(primaryEvent?.date)}
        </motion.p>

        {guestName && (
          <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }}>
            <p className="text-[11px] tracking-widest uppercase font-sans mb-1" style={{ color: c.goldSoft }}>Kepada Yth.</p>
            <p className="text-base font-sans font-semibold" style={{ color: c.cream }}>{guestName}</p>
          </motion.div>
        )}

        <motion.button onClick={handleOpen}
          className="px-9 py-3 text-[12px] tracking-[0.3em] uppercase font-sans font-semibold rounded-full"
          style={{ background: `linear-gradient(135deg, ${c.gold}, ${c.goldSoft})`, color: c.wineDeep, boxShadow: `0 8px 24px ${c.wineDeep}` }}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Buka Undangan
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── 2. QUOTE ────────────────────────────────────────────────────
const QuoteSection = ({ data }) => {
  if (!data?.quote) return null
  return (
    <section className="px-6 relative z-10">
      <Glass className="p-10 text-center flex flex-col items-center">
        <div className="w-2 h-2 rotate-45 mb-6" style={{ background: c.gold, boxShadow: `0 0 10px ${c.gold}` }} />
        <p className="text-[15px] leading-relaxed font-sans italic" style={{ color: c.text, opacity: 0.9 }}>
          &ldquo;{data.quote}&rdquo;
        </p>
      </Glass>
    </section>
  )
}

// ─── 3. PROFILE ──────────────────────────────────────────────────
const ProfileSection = ({ data }) => {
  const renderPerson = (person, label) => (
    <motion.div className="flex flex-col items-center text-center px-6 py-8"
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.7 }}>
      <Label>{label}</Label>
      <div className="relative w-48 h-48 flex items-center justify-center mb-5">
        <img src={A.frame} alt="" className="absolute inset-0 w-full h-full object-contain scale-[1.15] z-10 pointer-events-none"
          onError={(e) => { e.currentTarget.style.display = 'none' }} />
        <div className="w-[74%] h-[74%] rounded-full overflow-hidden z-0 relative"
          style={{ border: `3px solid ${c.gold}`, boxShadow: `0 0 24px ${c.wineDeep}` }}>
          {person?.photo
            ? <img src={person.photo} alt={person.nickname} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-xs font-sans" style={{ background: c.wineDeep, color: c.goldSoft }}>Foto</div>}
        </div>
      </div>
      <h3 style={{ fontFamily: "'Cormorant Upright', serif", fontSize: '2.3rem', color: c.cream, fontWeight: 500, fontStyle: 'italic' }}>
        {person?.nickname}
      </h3>
      <p className="text-sm font-semibold mb-2 tracking-wide font-sans" style={{ color: c.gold }}>
        {person?.name}
      </p>
      <p className="text-[13px] leading-relaxed max-w-[230px] font-sans" style={{ color: c.text, opacity: 0.75 }}>
        Putra/Putri dari<br />
        Bpk. {person?.father || '—'} &amp; Ibu {person?.mother || '—'}
      </p>
      {person?.instagram && (
        <a href={`https://instagram.com/${person.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
          className="mt-4 flex items-center gap-1.5 text-[12px] tracking-widest uppercase font-sans font-semibold transition-opacity hover:opacity-100"
          style={{ color: c.goldSoft, opacity: 0.8 }}>
          @{person.instagram.replace('@', '')}
        </a>
      )}
    </motion.div>
  )
  return (
    <section className="w-full py-4 px-4">
      <Glass className="overflow-hidden">
        <div className="px-2 pt-8">
          <p className="text-center"><Label>Bride &amp; Groom</Label></p>
          {renderPerson(data?.bride, 'The Bride')}
          <GoldDivider />
          {renderPerson(data?.groom, 'The Groom')}
        </div>
      </Glass>
    </section>
  )
}

// ─── 4. COUNTDOWN ────────────────────────────────────────────────
const CountdownSection = ({ countdown, primaryEvent, bride, groom }) => {
  const blocks = [
    { label: 'Hari', v: countdown?.d || 0 },
    { label: 'Jam', v: countdown?.h || 0 },
    { label: 'Menit', v: countdown?.m || 0 },
    { label: 'Detik', v: countdown?.s || 0 },
  ]
  const calendarUrl = primaryEvent?.date
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${groom}+%26+${bride}&dates=${primaryEvent.date.replace(/-/g, '')}T080000Z/${primaryEvent.date.replace(/-/g, '')}T120000Z`
    : null
  return (
    <section className="w-full py-6 px-4">
      <Glass className="p-8 flex flex-col items-center">
        <Label>Save The Date</Label>
        <Heading className="mb-8 text-center" style={{ fontSize: '2.2rem' }}>Menuju Hari Bahagia</Heading>
        <div className="flex gap-3 justify-center mb-8">
          {blocks.map((b, i) => (
            <motion.div key={b.label}
              className="w-16 h-16 flex flex-col items-center justify-center rounded-xl"
              style={{ background: 'rgba(201,162,75,0.08)', border: `1px solid ${c.glassBrd}` }}
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <span style={{ fontFamily: "'Cormorant Upright', serif", fontSize: '2rem', color: c.gold, fontWeight: 600, lineHeight: 1 }}>
                {b.v.toString().padStart(2, '0')}
              </span>
              <span className="text-[8px] uppercase tracking-widest font-sans mt-0.5" style={{ color: c.text, opacity: 0.6 }}>{b.label}</span>
            </motion.div>
          ))}
        </div>
        {calendarUrl && (
          <a href={calendarUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-[12px] tracking-[0.25em] uppercase font-sans font-semibold px-6 py-2.5 rounded-full"
            style={{ background: `linear-gradient(135deg, ${c.gold}, ${c.goldSoft})`, color: c.wineDeep }}>
            <Calendar size={13} /> Simpan Tanggal
          </a>
        )}
      </Glass>
    </section>
  )
}

// ─── 5. EVENTS ───────────────────────────────────────────────────
// AcaraForm membiarkan pasangan menambah sesi sebanyak yang mereka mau, dan
// kolom namanya boleh dikosongkan. Dua sesi pertama punya nama baku; sesudah
// itu dinomori supaya sesi tanpa nama tetap bisa dibedakan satu sama lain.
const eventTitle = (ev, i) => ev?.name || ['Akad Nikah', 'Resepsi'][i] || `Acara ${i + 1}`

const EventsSection = ({ events }) => {
  const renderCard = (ev, i) => {
    if (!ev) return null
    const { day, mon, yr } = fmtEventDate(ev.date)
    const title = eventTitle(ev, i)
    // Kartu bergantian masuk dari kiri dan kanan; dengan indeks genap/ganjil
    // dua kartu pertama tetap bergerak persis seperti sebelumnya.
    const dir = i % 2 === 0 ? 'L' : 'R'
    return (
      <motion.div key={ev.id || i} className="w-full"
        initial={{ opacity: 0, x: dir === 'L' ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.7 }}>
        <Glass className="p-7 flex flex-col items-center text-center">
          <Label>{title}</Label>
          <div className="flex flex-col items-center justify-center mt-2 mb-4">
            <span style={{ fontFamily: "'Cormorant Upright', serif", fontSize: '2.6rem', color: c.gold, fontWeight: 600, lineHeight: 1 }}>{day}</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-sm font-semibold font-sans tracking-wide" style={{ color: c.cream }}>{mon}</span>
              <span className="text-sm font-sans" style={{ color: c.text, opacity: 0.6 }}>{yr}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-3 text-sm font-sans" style={{ color: c.text, opacity: 0.85 }}>
            <Clock size={12} color={c.gold} />
            <span>{fmtHours(ev) || '10:00 — Selesai'}</span>
          </div>
          <p className="font-semibold text-sm mb-1 font-sans" style={{ color: c.gold }}>{ev.venue || '—'}</p>
          <p className="text-[13px] leading-relaxed mb-5 font-sans max-w-[210px]" style={{ color: c.text, opacity: 0.7 }}>{ev.address || ''}</p>
          {ev.maps && (
            <a href={ev.maps} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-[12px] tracking-widest uppercase font-sans font-semibold px-5 py-2 rounded-full"
              style={{ border: `1px solid ${c.gold}`, color: c.gold }}>
              <MapPin size={11} /> Petunjuk Arah
            </a>
          )}
        </Glass>
      </motion.div>
    )
  }
  return (
    <section className="w-full py-4 px-4 flex flex-col gap-4">
      <p className="text-center"><Label>Waktu &amp; Tempat</Label></p>
      {events.map(renderCard)}
    </section>
  )
}

// ─── 6. LOVE STORY ───────────────────────────────────────────────
const LoveStorySection = ({ data }) => {
  const stories = data?.loveStory || []
  if (!stories.length) return null
  return (
    <section className="w-full py-6 px-4">
      <Glass className="p-8">
        <p className="text-center"><Label>Kisah Kami</Label></p>
        <Heading className="mb-10 text-center" style={{ fontSize: '2.2rem' }}>Love Story</Heading>
        <div className="relative w-full flex flex-col">
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{ background: `linear-gradient(to bottom, transparent, ${c.gold}55, transparent)` }} />
          {stories.map((s, i) => {
            const isL = i % 2 === 0
            return (
              <motion.div key={s.id || i}
                className={`flex w-full items-center justify-between mb-10 relative ${isL ? 'flex-row' : 'flex-row-reverse'}`}
                initial={{ opacity: 0, x: isL ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.7 }}>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rotate-45 z-10"
                  style={{ background: c.gold, boxShadow: `0 0 10px ${c.gold}` }} />
                <div className="w-5/12 flex justify-center">
                  {s.photo
                    ? <div className="w-24 h-24 rounded-full overflow-hidden" style={{ border: `2px solid ${c.gold}` }}>
                      <img src={s.photo} alt={s.title} className="w-full h-full object-cover" />
                    </div>
                    : <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ border: `1px solid ${c.gold}55`, background: 'rgba(201,162,75,0.06)' }}>
                      <Heart size={16} color={c.gold} />
                    </div>}
                </div>
                <div className={`w-5/12 flex flex-col ${isL ? 'text-left' : 'text-right'}`}>
                  <span className="text-xs font-sans mb-1 tracking-widest" style={{ color: c.gold }}>{fmtShortDate(s.date || s.year)}</span>
                  <h4 className="font-semibold text-[15px] mb-1.5 font-sans leading-tight" style={{ color: c.cream }}>{s.title}</h4>
                  <p className="text-[13px] leading-relaxed font-sans" style={{ color: c.text, opacity: 0.8 }}>{s.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </Glass>
    </section>
  )
}

// ─── 7. GALLERY ──────────────────────────────────────────────────
const GallerySection = ({ data }) => {
  const photos = data?.gallery || []
  if (!photos.length) return null
  return (
    <section className="w-full py-4 px-4">
      <Glass className="p-6">
        <p className="text-center"><Label>Our Moments</Label></p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {photos.map((ph, i) => {
            const src = typeof ph === 'string' ? ph : ph?.src
            if (!src) return null
            return (
              <motion.div key={ph?.id || src}
                className="aspect-square overflow-hidden rounded-lg group cursor-pointer"
                style={{ border: `1px solid ${c.glassBrd}` }}
                initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </motion.div>
            )
          })}
        </div>
      </Glass>
    </section>
  )
}

// ─── 8. GIFT ─────────────────────────────────────────────────────
const GiftSection = ({ data }) => {
  const [showGifts, setShowGifts] = useState(false)
  const { copiedKey: copied, copy: copyAccount } = useCopyToClipboard()
  // Toggle Alamat Pengiriman Kado berdiri sendiri di editor, jadi section ini
  // tidak boleh digerbangi hanya oleh daftar rekening.
  const gift = data?.giftAddress
  const hasGiftAddress = Boolean(gift?.enabled && (gift.address || gift.recipient || gift.phone))
  if ((!data?.accounts || data.accounts.length === 0) && !hasGiftAddress) return null
  return (
    <section className="px-6 relative z-10">
      <Glass className="p-8 flex flex-col items-center">
        <Label>Wedding Gift</Label>
        <Heading className="mb-4 text-center" style={{ fontSize: '2.2rem' }}>Kirim Hadiah</Heading>
        <p className="text-[13px] leading-relaxed font-sans text-center max-w-[250px] mb-7" style={{ color: c.text, opacity: 0.75 }}>
          Bagi yang ingin memberikan hadiah, berikut informasi rekening kami.
        </p>
        <button onClick={() => setShowGifts(v => !v)}
          className="px-6 py-2 text-[12px] tracking-[0.2em] uppercase font-sans font-semibold rounded-full transition-all"
          style={{ border: `1px solid ${c.gold}`, color: showGifts ? c.wineDeep : c.gold, background: showGifts ? c.gold : 'transparent' }}>
          {showGifts ? 'Tutup Detail' : 'Lihat Detail'}
        </button>
        <AnimatePresence>
          {showGifts && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="w-full flex flex-col gap-4 mt-6 overflow-hidden">
              {data.accounts.map((acc, i) => {
                const accKey = acc.id || acc.number || i
                return (
                  <div key={accKey} className="p-5 rounded-2xl flex flex-col items-center text-center"
                    style={{ border: `1px solid ${c.glassBrd}`, background: 'rgba(201,162,75,0.05)' }}>
                    <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: c.gold }}>{acc.bank}</p>
                    <p className="text-[13px] mb-3 font-sans" style={{ color: c.text, opacity: 0.75 }}>{acc.holder}</p>
                    <p className="text-[15px] font-mono tracking-widest font-semibold mb-4" style={{ color: c.cream }}>{acc.number}</p>
                    <button onClick={() => copyAccount(acc.number, accKey)}
                      className="px-5 py-1.5 text-xs uppercase tracking-wider font-semibold rounded-full transition-all"
                      style={{ border: `1px solid ${c.gold}`, background: copied === accKey ? c.gold : 'transparent', color: copied === accKey ? c.wineDeep : c.gold }}>
                      {copied === accKey ? 'Tersalin!' : 'Salin Rekening'}
                    </button>
                  </div>
                )
              })}

              {hasGiftAddress && (
                <div className="p-5 rounded-2xl flex flex-col items-center text-center"
                  style={{ border: `1px solid ${c.glassBrd}`, background: 'rgba(201,162,75,0.05)' }}>
                  <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: c.gold }}>Kirim Kado</p>
                  {gift.recipient && <p className="text-[15px] font-semibold mb-1" style={{ color: c.cream }}>{gift.recipient}</p>}
                  {gift.phone && <p className="text-[13px] mb-2 font-sans" style={{ color: c.text, opacity: 0.75 }}>{gift.phone}</p>}
                  {gift.address && <p className="text-[13px] leading-relaxed font-sans mb-4 whitespace-pre-line" style={{ color: c.text, opacity: 0.8 }}>{gift.address}</p>}
                  {gift.address && (
                    <button onClick={() => copyAccount(gift.address, 'bx-gift-address')}
                      className="px-5 py-1.5 text-xs uppercase tracking-wider font-semibold rounded-full transition-all"
                      style={{ border: `1px solid ${c.gold}`, background: copied === 'bx-gift-address' ? c.gold : 'transparent', color: copied === 'bx-gift-address' ? c.wineDeep : c.gold }}>
                      {copied === 'bx-gift-address' ? 'Tersalin!' : 'Salin Alamat'}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Glass>
    </section>
  )
}

// ─── 9. WISH & RSVP ──────────────────────────────────────────────
const WishRsvpSection = ({ data, wishes, onSubmitWish }) => {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [att, setAtt] = useState('hadir')
  const [pax, setPax] = useState('1')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (busy || !name.trim() || !msg.trim()) return
    setBusy(true)
    try {
      if (onSubmitWish) await onSubmitWish({ name, message: msg, attendance: att, guests: pax })
      setName(''); setMsg(''); setAtt('hadir'); setPax('1')
    } finally {
      setBusy(false)
    }
  }

  const list = (wishes || data?.rsvps || []).slice(0, 5)
  const inputStyle = { border: `1px solid ${c.glassBrd}`, background: 'rgba(201,162,75,0.05)', color: c.cream }

  return (
    <section className="w-full py-6 px-4">
      <Glass className="p-8">
        <p className="text-center"><Label>Doa &amp; Kehadiran</Label></p>
        <Heading className="text-center mb-7" style={{ fontSize: '2.2rem' }}>Sampaikan Doa</Heading>

        <form onSubmit={submit} className="flex flex-col gap-3 mb-8">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama Anda" required
            className="w-full text-sm font-sans px-4 py-2.5 outline-none rounded-lg placeholder:opacity-40" style={inputStyle} />
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3} placeholder="Tuliskan ucapan..." required
            className="w-full text-sm font-sans px-4 py-2.5 outline-none rounded-lg resize-none placeholder:opacity-40" style={inputStyle} />
          <div className="flex gap-4">
            {[['hadir', 'Hadir'], ['tidak_hadir', 'Tidak Hadir']].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 text-[13px] font-sans cursor-pointer" style={{ color: c.text }}>
                <input type="radio" name="att" value={v} checked={att === v} onChange={() => setAtt(v)} style={{ accentColor: c.gold }} />
                {l}
              </label>
            ))}
          </div>
          <AnimatePresence>
            {att === 'hadir' && (
              <motion.select value={pax} onChange={e => setPax(e.target.value)}
                className="w-full text-sm font-sans px-4 py-2.5 outline-none rounded-lg appearance-none" style={inputStyle}
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                {['1', '2', '3', '4', '5+'].map(n => <option key={n} value={n} style={{ color: '#000' }}>{n} Orang</option>)}
              </motion.select>
            )}
          </AnimatePresence>
          <button type="submit" disabled={busy}
            className="text-[12px] tracking-[0.25em] uppercase font-sans font-semibold px-6 py-2.5 rounded-full mt-1"
            style={{ background: `linear-gradient(135deg, ${c.gold}, ${c.goldSoft})`, color: c.wineDeep, opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Mengirim…' : 'Sampaikan Doa'}
          </button>
        </form>

        {list.length > 0 && (
          <div className="flex flex-col gap-3">
            {list.map((w, i) => (
              <motion.div key={w.id || i} className="p-4 rounded-xl"
                style={{ background: 'rgba(201,162,75,0.05)', borderLeft: `3px solid ${c.gold}` }}
                initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold font-sans" style={{ color: c.gold }}>{w.name}</span>
                  <span className="text-[9px] font-sans" style={{ color: c.text, opacity: 0.5 }}>{fmtShortDate(w.createdAt || '')}</span>
                </div>
                <p className="text-[13px] leading-relaxed font-sans" style={{ color: c.text, opacity: 0.8 }}>{w.message || w.wish}</p>
              </motion.div>
            ))}
          </div>
        )}
      </Glass>
    </section>
  )
}

// ─── 10. FOOTER ──────────────────────────────────────────────────
// ─── LIVE STREAMING (optional) ───────────────────────────────────
const LiveStreamSection = ({ data }) => {
  const platforms = data?.livestreamEnabled ? (data?.livestreamPlatforms || []).filter(p => p.url) : []
  if (!platforms.length) return null
  return (
    <section className="w-full py-6 px-4">
      <Glass className="p-8 flex flex-col items-center text-center">
        <Label>Live Streaming</Label>
        <Heading className="mb-4" style={{ fontSize: '2.2rem' }}>Saksikan Bersama</Heading>
        <p className="text-[13px] leading-relaxed font-sans mb-6" style={{ color: c.text, opacity: 0.75, maxWidth: 260 }}>Bagi yang berhalangan hadir, saksikan momen bahagia kami secara langsung.</p>
        <div className="flex flex-col gap-3 items-center">
          {platforms.map((p, i) => (
            <a key={i} href={p.url} target="_blank" rel="noreferrer" className="text-[12px] tracking-[0.25em] uppercase font-sans font-semibold px-6 py-2.5 rounded-full" style={{ background: `linear-gradient(135deg, ${c.gold}, ${c.goldSoft})`, color: c.wineDeep }}>{p.type || 'Tonton Live'}</a>
          ))}
        </div>
      </Glass>
    </section>
  )
}

// ─── TURUT MENGUNDANG (optional) ─────────────────────────────────
const TurutMengundangSection = ({ data }) => {
  if (!data?.turutMengundangEnabled) return null
  const families = (data?.families || []).map(f => ({ ...f, members: (f.members || []).filter(m => m && m.trim()) })).filter(f => f.members.length)
  if (!families.length) return null
  return (
    <section className="w-full py-6 px-4">
      <Glass className="p-8">
        <div className="text-center"><Label>Turut Mengundang</Label></div>
        <Heading className="text-center mb-8" style={{ fontSize: '2.2rem' }}>Keluarga Besar</Heading>
        <div className="flex flex-col gap-6">
          {families.map((fam, i) => (
            <div key={fam.id || i} className="text-center">
              {fam.side && <p className="font-semibold text-sm mb-2 font-sans" style={{ color: c.gold }}>{fam.side}</p>}
              {fam.members.map((m, j) => (<p key={j} className="text-[13px] font-sans" style={{ color: c.text, opacity: 0.8, lineHeight: 1.9 }}>{m}</p>))}
            </div>
          ))}
        </div>
      </Glass>
    </section>
  )
}

const FooterSection = ({ bride, groom }) => (
  <section className="w-full px-4 pb-10 pt-6 relative">
    <Glass className="p-10 flex flex-col items-center text-center">
      <Label>Terima Kasih</Label>
      <p className="text-[13px] leading-relaxed mb-6 max-w-[230px] font-sans" style={{ color: c.text, opacity: 0.75 }}>
        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
      </p>
      <div className="flex items-center gap-3">
        <span style={{ fontFamily: "'Pinyon Script', cursive", fontSize: '2rem', color: c.gold }}>{bride}</span>
        <span style={{ fontFamily: "'Pinyon Script', cursive", fontSize: '1.4rem', color: c.goldSoft }}>&amp;</span>
        <span style={{ fontFamily: "'Pinyon Script', cursive", fontSize: '2rem', color: c.gold }}>{groom}</span>
      </div>
      <p className="text-[8px] font-sans mt-8 tracking-widest uppercase" style={{ color: c.text, opacity: 0.4 }}>
        Dibuat dengan ♥ oleh Ulema
      </p>
    </Glass>
  </section>
)

// ─── BG VIDEO (fixed, behind content) ────────────────────────────
const MotionVideoBg = () => (
  <div className="fixed inset-0 z-0 pointer-events-none"
    style={{ background: `radial-gradient(circle at 50% 0%, ${c.wine} 0%, ${c.wineDeep} 80%)` }}>
    <video autoPlay muted loop playsInline poster={A.coverPoster}
      className="w-full h-full object-cover opacity-40"
      onError={(e) => { e.currentTarget.style.display = 'none' }}>
      <source src={A.bgVideo} type="video/mp4" />
    </video>
    <div className="absolute inset-0" style={{ background: 'rgba(43,8,23,0.4)' }} />
    <GoldDust />
  </div>
)

// ─── MAIN EXPORT ─────────────────────────────────────────────────
export default function BordeauxLuxeTheme({
  data, countdown, opened, setOpened,
  animateClose, setAnimateClose,
  musicPlaying, setMusicPlaying, audioRef,
  wishes, onSubmitWish, guestName,
}) {
  const groom = data?.groom?.nickname || 'Groom'
  const bride = data?.bride?.nickname || 'Bride'
  const events = data?.events || []
  // Sesi pertama tetap jadi acuan hitung mundur dan tanggal di sampul.
  const primary = events[0] || {}

  const handleOpen = () => {
    setAnimateClose(true)
    setTimeout(() => {
      setOpened(true)
      // useAudioPlayer's effect calls .play() when musicPlaying flips true.
      if (audioRef?.current) setMusicPlaying(true)
    }, 900)
  }

  return (
    <InvitationLayout layout={THEMES.BORDEAUX_LUXE} data={data} bgUrl={A.desktopBg}>
      {/* Fixed premium typography by design (Cormorant Upright + Pinyon Script),
          matching the wine-gold luxury look; this bespoke theme intentionally
          doesn't use InvitationTemplate's generic fontConfig. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Upright:wght@400;500;600;700&family=Pinyon+Script&family=Nunito+Sans:wght@300;400;600;700&display=swap');
      `}</style>

      <div className="w-full relative h-full flex flex-col overflow-x-hidden"
        style={{ fontFamily: "'Nunito Sans', sans-serif", color: c.text }}>

        {/* Audio */}
        {data?.music !== false && (
          <audio ref={audioRef} src={data?.musicUrl || MUSIC_URLS[data?.musicId || 1] || A.music || MUSIC_URLS[1]} loop />
        )}

        {/* Cover */}
        <AnimatePresence>
          {!opened && (
            <CoverSection key="cover" data={data} bride={bride} groom={groom}
              primaryEvent={primary} handleOpen={handleOpen} animateClose={animateClose} guestName={guestName} />
          )}
        </AnimatePresence>

        {/* Content */}
        {opened && (
          <motion.div className="flex flex-col w-full relative" style={{ zIndex: 1 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}>

            {data?.music !== false && (
              <button onClick={() => setMusicPlaying(!musicPlaying)}
                className="fixed top-6 right-4 md:absolute md:top-6 md:right-4 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all"
                style={{ background: `linear-gradient(135deg, ${c.gold}, ${c.goldSoft})`, color: c.wineDeep, boxShadow: `0 6px 18px ${c.wineDeep}` }}>
                {musicPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            )}

            <MotionVideoBg />

            <div className="relative flex flex-col gap-5 pt-8 pb-6" style={{ zIndex: 2 }}>
              <QuoteSection data={data} />
              <ProfileSection data={data} />
              <CountdownSection countdown={countdown} primaryEvent={primary} bride={bride} groom={groom} />
              <EventsSection events={events} />
              <LoveStorySection data={data} />
              <GallerySection data={data} />
              <GiftSection data={data} />
              <WishRsvpSection data={data} wishes={wishes} onSubmitWish={onSubmitWish} />
              <LiveStreamSection data={data} />
              <TurutMengundangSection data={data} />
              <FooterSection bride={bride} groom={groom} />
            </div>
          </motion.div>
        )}
      </div>
    </InvitationLayout>
  )
}
