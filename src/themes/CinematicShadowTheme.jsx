import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, X, ChevronLeft, ChevronRight } from 'lucide-react'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { THEMES } from '../config/constants'

// ─── PALETTE (dark elegant + gold, ref: kompetitor Luxury 01 Video Background) ──
const c = {
  bgDark: '#1a1a1a',
  bgLight: '#f5f0e8',
  gold: '#c9a96e',
  textDark: '#2a2a2a',
  textLight: '#f5f0e8',
}

// ─── HELPERS ─────────────────────────────────────────────────────
const ID_DAYS = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const ID_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

// Jam acara, dirakit dari field yang benar-benar tersimpan. Tema ini dulu
// membaca `ev.time`, yang tidak ada di satu pun undangan: data menyimpan
// `start`, `end`, dan `tz` secara terpisah (lihat panduan desain §3, yang
// memuat peringatan khusus soal nama-nama ini). Akibatnya jam acara selalu
// jatuh ke teks cadangan.
const fmtHours = (ev) => {
  const range = [ev?.start, ev?.end].filter(Boolean).join(' \u2014 ')
  return range && ev?.tz ? `${range} ${ev.tz}` : range
}

const fmtDotDate = (s) => {
  if (!s) return '28 . 12 . 2027'
  try {
    const d = new Date(s)
    return `${d.getDate().toString().padStart(2, '0')} . ${(d.getMonth() + 1).toString().padStart(2, '0')} . ${d.getFullYear()}`
  } catch { return s }
}

const fmtEventParts = (s) => {
  if (!s) return { dayName: 'Sabtu', day: '28', month: 'Desember', year: '2027' }
  try {
    const d = new Date(s)
    return {
      dayName: ID_DAYS[d.getDay()],
      day: d.getDate().toString().padStart(2, '0'),
      month: ID_MONTHS[d.getMonth()],
      year: d.getFullYear().toString(),
    }
  } catch { return { dayName: 'Sabtu', day: '28', month: 'Desember', year: '2027' } }
}

// ─── CUSTOM HOOK: useScrollReveal ────────────────────────────────
// IntersectionObserver-driven visibility (threshold 120px dari bottom viewport,
// per spec), dipakai sebagai "engine" deteksi in-view — transisi visualnya
// sendiri tetap didorong oleh framer-motion (variants di bawah) supaya konsisten
// dengan aturan arsitektur "gunakan framer-motion untuk semua animasi".
function useScrollReveal(thresholdPx = 120) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { rootMargin: `0px 0px -${thresholdPx}px 0px`, threshold: 0.01 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [thresholdPx])

  return [ref, visible]
}

// Pure CSS-class reveal (per spec): useScrollReveal flips `.is-visible`,
// the transition itself is plain CSS (see the .inv-fade-* rules injected
// in the theme's <style> block below) — no framer-motion involved here.
function Reveal({ children, variant = 'inv-fade-up', delay = 0, className = '' }) {
  const [ref, visible] = useScrollReveal()
  return (
    <div ref={ref} className={`${variant} ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

// ─── SHADOW TREE (custom SVG silhouette, bukan PNG statis) ───────
const ShadowTree = ({ flip = false, className = '', style = {} }) => (
  <svg viewBox="0 0 200 260" width="200" height="260" className={className}
    style={{ transform: flip ? 'scaleX(-1)' : undefined, ...style }}
    aria-hidden="true">
    <g fill="#000000" opacity="0.4">
      <path d="M96 260 C94 205 92 175 90 152 C79 146 73 132 76 116 C59 109 51 92 58 74 C45 67 41 49 54 35 C64 23 83 19 96 28 C104 13 125 9 138 21 C150 31 150 50 140 60 C151 72 148 91 133 99 C138 113 129 129 115 133 C118 151 116 197 112 260 Z" />
      <ellipse cx="68" cy="72" rx="27" ry="21" />
      <ellipse cx="132" cy="56" rx="31" ry="25" />
      <ellipse cx="99" cy="38" rx="25" ry="21" />
      <ellipse cx="117" cy="92" rx="23" ry="18" />
    </g>
  </svg>
)

const EnvelopeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 6l10 7 10-7" />
  </svg>
)

// Custom SVG (lucide-react in this project has no Instagram glyph)
const IgIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </svg>
)

const DiamondDivider = () => (
  <div className="flex items-center justify-center gap-3 my-8 w-full max-w-[220px]">
    <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${c.gold}80)` }} />
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <rect x="1.5" y="1.5" width="7" height="7" fill="none" stroke={c.gold} strokeWidth="1" transform="rotate(45 5 5)" />
    </svg>
    <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${c.gold}80)` }} />
  </div>
)

// ─── KEN BURNS SLIDESHOW HOOK (auto-advance, interval cleaned up) ─
function useSlideshow(photos, intervalMs = 6000) {
  const [index, setIndex] = useState(0)
  const len = photos?.length || 0

  useEffect(() => {
    if (len <= 1) return
    const id = setInterval(() => setIndex(i => (i + 1) % len), intervalMs)
    return () => clearInterval(id)
  }, [len, intervalMs])

  return index
}

// ─── 1. COVER (Amplop) ────────────────────────────────────────────
const CoverSection = ({ data, bride, groom, primaryEvent, handleOpen, animateClose, guestName }) => {
  const photos = (data?.coverPhotos?.length ? data.coverPhotos : null)
    || (data?.meta?.coverPhoto ? [data.meta.coverPhoto] : null)
    || (data?.bride?.photo ? [data.bride.photo] : null)
    || (data?.groom?.photo ? [data.groom.photo] : [])
  const activeIndex = useSlideshow(photos)
  const activePhoto = photos[activeIndex]

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: c.bgDark, color: c.textLight }}
      animate={animateClose ? { y: '-100%', opacity: 0 } : { y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}>

      {/* Ken Burns photo slideshow */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="sync">
          {activePhoto && (
            <motion.img key={activeIndex} src={activePhoto} alt=""
              className="kb-zoom absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }} />
          )}
        </AnimatePresence>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }} />
      </div>

      {/* Shadow tree, kiri bawah */}
      <motion.div className="absolute bottom-0 left-0 pointer-events-none z-10"
        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1, duration: 1 }}>
        <ShadowTree />
      </motion.div>

      {/* Teks tengah */}
      <div className="relative z-20 flex flex-col items-center text-center px-10">
        <motion.p className="text-[11px] tracking-[0.3em] uppercase mb-6"
          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: `${c.textLight}99` }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          The Wedding Of
        </motion.p>

        <motion.h1 className="mb-1 leading-none"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, fontSize: '3.5rem', color: c.textLight }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
          {bride}
        </motion.h1>
        <motion.span className="block my-1"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, fontSize: '1.5rem', color: c.gold }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
          &amp;
        </motion.span>
        <motion.h1 className="mt-1 mb-8 leading-none"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, fontSize: '3.5rem', color: c.textLight }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.8 }}>
          {groom}
        </motion.h1>

        <motion.p className="text-sm tracking-[0.3em] mb-8"
          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: `${c.textLight}cc` }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          {fmtDotDate(primaryEvent?.date)}
        </motion.p>

        {guestName && (
          <motion.p className="text-xs mb-10"
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: `${c.textLight}88` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            Kepada Yth. <span style={{ color: c.textLight }}>{guestName}</span>
          </motion.p>
        )}

        <motion.button onClick={handleOpen}
          className="flex items-center gap-2 px-8 py-3 text-[11px] tracking-[0.25em] uppercase"
          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, border: `1px solid ${c.textLight}`, color: c.textLight }}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          whileHover={{ backgroundColor: c.textLight, color: c.bgDark }}
          whileTap={{ scale: 0.96 }}>
          <EnvelopeIcon /> Buka Undangan
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── 2. VIDEO HERO (setelah cover dibuka) ────────────────────────
const VideoHeroSection = ({ data, bride, groom, primaryEvent, countdown }) => {
  const hasVideo = Boolean(data?.coverVideoUrl)
  const galleryFallback = (data?.gallery || [])
    .slice(0, 3)
    .map(g => (typeof g === 'string' ? g : g?.src))
    .filter(Boolean)
  const fallbackIndex = useSlideshow(hasVideo ? [] : galleryFallback)
  const fallbackPhoto = galleryFallback[fallbackIndex]

  const blocks = [
    { label: 'Hari', v: countdown?.d || 0 },
    { label: 'Jam', v: countdown?.h || 0 },
    { label: 'Menit', v: countdown?.m || 0 },
    { label: 'Detik', v: countdown?.s || 0 },
  ]

  return (
    <section className="relative w-full h-[var(--inv-h)] overflow-hidden" style={{ background: c.bgDark }}>
      {hasVideo ? (
        <video autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none' }}>
          <source src={data.coverVideoUrl} type="video/mp4" />
        </video>
      ) : (
        <AnimatePresence mode="sync">
          {fallbackPhoto && (
            <motion.img key={fallbackIndex} src={fallbackPhoto} alt=""
              className="kb-zoom absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }} />
          )}
        </AnimatePresence>
      )}

      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.85) 100%)' }} />

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center text-center px-8 pb-14">
        <motion.h2 className="mb-2 leading-none"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, fontSize: '2.8rem', color: c.textLight }}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }}>
          {bride} &amp; {groom}
        </motion.h2>
        <motion.p className="text-sm tracking-[0.3em] mb-8"
          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: `${c.textLight}cc` }}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
          {fmtDotDate(primaryEvent?.date)}
        </motion.p>

        <div className="flex gap-3 justify-center">
          {blocks.map((b, i) => (
            <motion.div key={b.label}
              className="w-16 h-16 flex flex-col items-center justify-center rounded"
              style={{ border: `1px solid ${c.gold}55`, background: 'rgba(0,0,0,0.25)' }}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.1, duration: 0.6 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: c.gold, lineHeight: 1 }}>
                {b.v.toString().padStart(2, '0')}
              </span>
              <span className="text-[8px] uppercase tracking-widest mt-1"
                style={{ fontFamily: "'Lato', sans-serif", color: `${c.textLight}99` }}>
                {b.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── 3. PROFIL MEMPELAI ──────────────────────────────────────────
const ProfileSection = ({ data }) => {
  const renderPerson = (person, variant, isBride) => (
    <Reveal variant={variant} className="flex flex-col items-center text-center w-full max-w-[280px]">
      <div className="w-40 mb-6 overflow-hidden"
        style={{ aspectRatio: '3 / 4', border: `1px solid ${c.gold}`, boxShadow: '0 10px 28px rgba(0,0,0,0.18)' }}>
        {person?.photo
          ? <img src={person.photo} alt={person?.nickname} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-xs"
              style={{ background: '#e9e2d4', color: c.textDark, fontFamily: "'Lato', sans-serif" }}>Foto</div>}
      </div>
      <h3 className="mb-1 leading-none"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 400, fontSize: '2.4rem', color: c.gold }}>
        {person?.nickname}
      </h3>
      <p className="text-sm font-medium mb-3 tracking-wide"
        style={{ fontFamily: "'Playfair Display', serif", color: c.textDark }}>
        {person?.name}
      </p>
      <p className="text-[11px] mb-1 uppercase tracking-[0.25em]"
        style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: `${c.textDark}99` }}>
        {isBride ? 'Putri dari' : 'Putra dari'}
      </p>
      <p className="text-sm mb-4" style={{ fontFamily: "'Lato', sans-serif", color: c.textDark }}>
        Bpk. {person?.father || '—'} &amp; Ibu {person?.mother || '—'}
      </p>
      {person?.instagram && (
        <a href={`https://instagram.com/${person.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 text-[11px] tracking-widest uppercase px-4 py-2 rounded-full"
          style={{ fontFamily: "'Lato', sans-serif", border: `1px solid ${c.gold}`, color: c.gold }}>
          <IgIcon /> {person.instagram.replace('@', '')}
        </a>
      )}
    </Reveal>
  )

  const defaultQuote = '"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu istri-istri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang." — QS. Ar-Rum: 21'

  return (
    <section className="w-full py-16 px-6" style={{ background: c.bgLight }}>
      <h2 className="text-center mb-4"
        style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.2em', fontSize: '1.5rem', color: c.textDark }}>
        KEDUA MEMPELAI
      </h2>
      <p className="text-center italic text-sm max-w-md mx-auto mb-4 leading-relaxed"
        style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: `${c.textDark}bb` }}>
        {data?.quote || defaultQuote}
      </p>
      <div className="flex flex-col items-center max-w-md mx-auto">
        {renderPerson(data?.bride, 'inv-fade-left', true)}
        <DiamondDivider />
        {renderPerson(data?.groom, 'inv-fade-right', false)}
      </div>
    </section>
  )
}

// ─── 4. SAVE THE DATE ────────────────────────────────────────────
const SaveTheDateSection = ({ countdown, primaryEvent, bride, groom }) => {
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
    <section className="relative w-full py-20 px-6 overflow-hidden" style={{ background: c.bgDark }}>
      <div className="absolute top-0 right-0 pointer-events-none">
        <ShadowTree flip />
      </div>

      <Reveal variant="inv-fade-up" className="relative z-10 flex flex-col items-center text-center">
        <h2 className="mb-10" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.2em', fontSize: '1.6rem', color: c.textLight }}>
          SAVE THE DATE
        </h2>

        <div className="flex gap-3 justify-center mb-10">
          {blocks.map((b) => (
            <div key={b.label} className="w-[68px] h-[68px] flex flex-col items-center justify-center"
              style={{ border: '1px solid rgba(201,169,110,0.4)' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.9rem', fontWeight: 500, color: c.gold, lineHeight: 1 }}>
                {b.v.toString().padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-widest mt-1"
                style={{ fontFamily: "'Lato', sans-serif", color: `${c.textLight}99` }}>
                {b.label}
              </span>
            </div>
          ))}
        </div>

        {calendarUrl && (
          <a href={calendarUrl} target="_blank" rel="noreferrer"
            className="text-[11px] tracking-[0.25em] uppercase px-7 py-2.5"
            style={{ fontFamily: "'Lato', sans-serif", border: `1px solid ${c.gold}`, color: c.gold }}>
            Simpan Tanggal
          </a>
        )}
      </Reveal>
    </section>
  )
}

// ─── 5. DETAIL ACARA ─────────────────────────────────────────────
const EventCard = ({ ev, title }) => {
  if (!ev) return null
  const { dayName, day, month, year } = fmtEventParts(ev.date)
  return (
    <Reveal variant="inv-fade-up" className="flex-1 min-w-0">
      <div className="bg-white p-8 flex flex-col items-center text-center h-full"
        style={{ borderTop: `2px solid ${c.gold}`, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
        <h3 className="mb-4" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: c.textDark }}>
          {title}
        </h3>
        <p className="text-[11px] uppercase tracking-[0.2em] mb-2"
          style={{ fontFamily: "'Lato', sans-serif", color: `${c.textDark}88` }}>
          {dayName}
        </p>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '3rem', fontWeight: 500, color: c.gold, lineHeight: 1 }}>
          {day}
        </span>
        <p className="text-sm mt-1 mb-4" style={{ fontFamily: "'Lato', sans-serif", color: c.textDark }}>
          {month} {year}
        </p>
        <div className="flex items-center gap-1.5 mb-4 text-sm"
          style={{ fontFamily: "'Lato', sans-serif", color: c.textDark }}>
          <Clock size={13} color={c.gold} />
          {fmtHours(ev) || '08:00 — Selesai'}
        </div>
        <p className="font-bold text-sm mb-1" style={{ fontFamily: "'Lato', sans-serif", color: c.textDark }}>
          {ev.venue || '—'}
        </p>
        <p className="text-xs mb-5 max-w-[220px]" style={{ fontFamily: "'Lato', sans-serif", color: `${c.textDark}99` }}>
          {ev.address || ''}
        </p>
        {ev.maps && (
          <a href={ev.maps} target="_blank" rel="noreferrer"
            className="text-[11px] tracking-widest uppercase px-5 py-2"
            style={{ fontFamily: "'Lato', sans-serif", border: `1px solid ${c.gold}`, color: c.gold }}>
            Google Maps
          </a>
        )}
      </div>
    </Reveal>
  )
}

// AcaraForm membiarkan pasangan menambah sesi sebanyak yang mereka mau, dan
// kolom namanya boleh dikosongkan. Dua sesi pertama punya nama baku; sesudah
// itu dinomori supaya sesi tanpa nama tetap bisa dibedakan satu sama lain.
const eventTitle = (ev, i) => ev?.name || ['Akad Nikah', 'Resepsi'][i] || `Acara ${i + 1}`

const EventsSection = ({ events }) => {
  // Tidak pernah terisi hari ini: tidak satu pun dari 45 sesi tersimpan punya
  // `photo`, dan AcaraForm memang tidak punya kotak unggahnya. Dibiarkan
  // sebagai cadangan bila kelak field itu ada, bukan sebagai fitur hidup.
  const venuePhoto = events.find(ev => ev?.photo)?.photo

  return (
    <section className="w-full py-16 px-6" style={{ background: c.bgLight }}>
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] mb-1"
          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: `${c.textDark}88` }}>
          Wedding
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '2.4rem', color: c.textDark }}>
          Event
        </h2>
      </div>

      {/* Grid yang mengukur dirinya sendiri, menggantikan `md:flex-row` yang
          dulu memaksa tepat dua kartu berdampingan. Breakpoint md membaca
          lebar jendela, padahal kolom undangan hanya 480px di desktop — dua
          kartu di sana sudah sempit, dan sesi ketiga akan meremas ketiganya
          jadi 144px. Sekarang jumlah kolomnya mengikuti ruang yang benar-benar
          ada, berapa pun jumlah sesinya. */}
      <div className="grid gap-6 max-w-3xl mx-auto"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))' }}>
        {events.map((ev, i) => (
          <EventCard key={ev?.id || i} ev={ev} title={eventTitle(ev, i)} />
        ))}
      </div>

      {venuePhoto && (
        <Reveal variant="inv-zoom-in" className="w-full mt-10">
          <div className="w-full overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
            <img src={venuePhoto} alt="Venue" className="w-full h-full object-cover" />
          </div>
        </Reveal>
      )}
    </section>
  )
}

// ─── 6. LIVE STREAMING ───────────────────────────────────────────
const LiveStreamingSection = ({ data }) => {
  const platforms = data?.livestreamEnabled ? (data?.livestreamPlatforms || []).filter(p => p.url) : []
  if (!platforms.length) return null
  return (
    <section className="w-full py-16 px-6 text-center" style={{ background: c.bgDark }}>
      <Reveal variant="inv-fade-up" className="flex flex-col items-center">
        <h2 className="mb-4" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.15em', fontSize: '1.5rem', color: c.textLight }}>
          Live Streaming
        </h2>
        <p className="text-sm max-w-sm mb-8 leading-relaxed"
          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: `${c.textLight}bb` }}>
          Bagi Bapak/Ibu/Saudara/i yang berhalangan hadir, kami mengundang untuk menyaksikan jalannya acara secara langsung melalui tautan berikut.
        </p>
        <div className="flex flex-col gap-3 items-center">
          {platforms.map((p, i) => (
            <a key={i} href={p.url} target="_blank" rel="noreferrer"
              className="text-[11px] tracking-[0.25em] uppercase px-7 py-2.5"
              style={{ fontFamily: "'Lato', sans-serif", border: `1px solid ${c.gold}`, color: c.gold }}>
              {p.type || 'Tonton Live Streaming'}
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

// ─── TURUT MENGUNDANG (optional) ─────────────────────────────────
const TurutMengundangSection = ({ data }) => {
  if (!data?.turutMengundangEnabled) return null
  const families = (data?.families || []).map(f => ({ ...f, members: (f.members || []).filter(m => m && m.trim()) })).filter(f => f.members.length)
  if (!families.length) return null
  return (
    <section className="w-full py-16 px-6 text-center" style={{ background: c.bgDark }}>
      <Reveal variant="inv-fade-up" className="flex flex-col items-center">
        <h2 className="mb-8" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.15em', fontSize: '1.5rem', color: c.textLight }}>Turut Mengundang</h2>
        <div className="flex flex-col gap-6" style={{ maxWidth: 320 }}>
          {families.map((fam, i) => (
            <div key={fam.id || i}>
              {fam.side && <p className="mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', color: c.gold }}>{fam.side}</p>}
              {fam.members.map((m, j) => (<p key={j} className="text-sm leading-relaxed" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: `${c.textLight}cc` }}>{m}</p>))}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

// ─── 7. DRESSCODE ─────────────────────────────────────────────────
// Mendukung data.dresscode.colors (array, {hex,name} atau string hex) kalau
// ada, fallback ke data.dresscode.color/name tunggal (skema yang sudah ada
// di types/invitation.js) supaya tidak butuh perubahan form admin sekarang.
const DresscodeSection = ({ data }) => {
  const colors = data?.dresscode?.colors?.length
    ? data.dresscode.colors.map(item => (
      typeof item === 'string' ? { hex: item, name: '' } : { hex: item?.hex || item?.color, name: item?.name || '' }
    ))
    : (data?.dresscode?.color ? [{ hex: data.dresscode.color, name: data.dresscode.name || '' }] : [])

  if (colors.length === 0) return null

  return (
    <section className="w-full py-16 px-6 text-center" style={{ background: c.bgLight }}>
      <Reveal variant="inv-fade-up" className="flex flex-col items-center">
        <h2 className="mb-4" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.15em', fontSize: '1.5rem', color: c.textDark }}>
          Dresscode
        </h2>
        <p className="text-sm max-w-sm mb-8 leading-relaxed"
          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: `${c.textDark}99` }}>
          {data?.dresscode?.notes || 'Kami mengundang Bapak/Ibu/Saudara/i untuk mengenakan busana dengan palet warna berikut.'}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          {colors.map((item, i) => (
            <div key={item.hex || i} title={item.name || item.hex}
              className="w-[60px] h-[60px] rounded-full"
              style={{ background: item.hex, border: '2px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }} />
          ))}
        </div>
      </Reveal>
    </section>
  )
}

// ─── 8. LOVE STORY ────────────────────────────────────────────────
const LoveStorySection = ({ data }) => {
  const stories = data?.loveStory || []
  if (!stories.length) return null

  const bgPhotoRaw = data?.gallery?.[0]
  const bgPhoto = typeof bgPhotoRaw === 'string' ? bgPhotoRaw : bgPhotoRaw?.src

  return (
    <section className="relative w-full py-16 px-6 overflow-hidden" style={{ background: c.bgDark }}>
      {bgPhoto && (
        <div className="absolute inset-0" style={{
          backgroundImage: `url('${bgPhoto}')`, backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.3, filter: 'blur(2px)',
        }} />
      )}
      <div className="absolute inset-0" style={{ background: 'rgba(26,26,26,0.6)' }} />

      <div className="relative z-10">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] mb-1"
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: `${c.textLight}88` }}>
            Love
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '2.6rem', color: c.gold }}>
            Story
          </h2>
        </div>

        <div className="relative max-w-md mx-auto pl-8">
          <div className="absolute left-[7px] top-2 bottom-2 w-px"
            style={{ background: `linear-gradient(to bottom, transparent, ${c.gold}70, transparent)` }} />
          <div className="flex flex-col gap-10">
            {stories.map((s, i) => (
              <Reveal key={s.id || i} variant="inv-fade-up" delay={i * 100} className="relative">
                <div className="absolute -left-8 top-1.5 w-3 h-3 rounded-full"
                  style={{ background: c.gold, boxShadow: `0 0 8px ${c.gold}` }} />
                <p className="text-xs uppercase tracking-widest mb-1.5" style={{ fontFamily: "'Lato', sans-serif", color: c.gold }}>
                  {s.date || s.year}
                </p>
                {s.photo && (
                  <div className="w-full mb-3 overflow-hidden" style={{ aspectRatio: '4 / 3', border: `1px solid ${c.gold}` }}>
                    <img src={s.photo} alt={s.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <h4 className="font-semibold text-[15px] mb-1.5" style={{ fontFamily: "'Playfair Display', serif", color: c.textLight }}>
                  {s.title}
                </h4>
                <p className="text-[13px] leading-relaxed" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: `${c.textLight}cc` }}>
                  {s.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── 9. GALERI (Momen Bahagia) ────────────────────────────────────
const GallerySection = ({ data }) => {
  const photos = (data?.gallery || [])
    .map(g => (typeof g === 'string' ? g : g?.src))
    .filter(Boolean)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i + 1) % photos.length)
      if (e.key === 'ArrowLeft') setLightboxIndex(i => (i - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, photos.length])

  if (!photos.length) return null

  return (
    <section className="w-full py-16" style={{ background: c.bgDark }}>
      <div className="text-center mb-8 px-6">
        <p className="text-xs uppercase tracking-[0.3em] mb-1"
          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: `${c.textLight}88` }}>
          Momen
        </p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '2.6rem', color: c.gold }}>
          Bahagia
        </h2>
      </div>

      <Reveal variant="inv-zoom-in" className="flex flex-wrap gap-1.5 px-1.5">
        {photos.map((src, i) => (
          <div key={src + i} onClick={() => setLightboxIndex(i)}
            className="group cursor-pointer relative overflow-hidden"
            style={{ height: 280, flexGrow: 1, flexBasis: 0, minWidth: 110 }}>
            <img src={src} alt={`Momen ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `${c.gold}33` }} />
          </div>
        ))}
      </Reveal>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}>
            <button onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-full"
              style={{ border: `1px solid ${c.gold}`, color: c.gold }}>
              <X size={16} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + photos.length) % photos.length) }}
              className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full"
              style={{ border: `1px solid ${c.gold}`, color: c.gold }}>
              <ChevronLeft size={18} />
            </button>
            <motion.img key={lightboxIndex} src={photos[lightboxIndex]} alt=""
              className="max-w-full max-h-[calc(var(--inv-h)*0.8)] object-contain"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} />
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % photos.length) }}
              className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full"
              style={{ border: `1px solid ${c.gold}`, color: c.gold }}>
              <ChevronRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// ─── 10. WEDDING GIFT ─────────────────────────────────────────────
// Pakai data.accounts / data.giftAddress (field nyata yang dipakai
// RekeningForm.jsx & semua tema lain), bukan data.bankAccounts dari teks
// spek — supaya section ini tidak kosong untuk data yang sudah diisi admin.
const GiftSection = ({ data }) => {
  const [showGifts, setShowGifts] = useState(false)
  const { copiedKey, copy } = useCopyToClipboard()
  const [shakeTarget, setShakeTarget] = useState(null)
  const [shakeNonce, setShakeNonce] = useState(0)

  const accounts = data?.accounts || []
  if (accounts.length === 0 && !data?.giftAddress?.enabled) return null

  const handleCopy = (text, key) => {
    copy(text, key)
    setShakeTarget(key)
    setShakeNonce(n => n + 1)
  }

  return (
    <section className="w-full py-16 px-6 text-center" style={{ background: c.bgLight }}>
      <Reveal variant="inv-fade-up" className="flex flex-col items-center">
        <h2 className="mb-4" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.15em', fontSize: '1.5rem', color: c.textDark }}>
          Wedding Gift
        </h2>
        <p className="text-sm max-w-sm mb-7 leading-relaxed"
          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: `${c.textDark}99` }}>
          Doa restu Anda adalah karunia yang sangat berarti bagi kami. Namun jika ingin memberikan tanda kasih, kami sediakan informasi berikut.
        </p>
        <button onClick={() => setShowGifts(v => !v)}
          className="text-[11px] tracking-[0.25em] uppercase px-7 py-2.5 transition-colors"
          style={{ fontFamily: "'Lato', sans-serif", border: `1px solid ${c.gold}`, color: showGifts ? c.bgLight : c.gold, background: showGifts ? c.gold : 'transparent' }}>
          {showGifts ? 'Tutup' : 'Klik di Sini'}
        </button>

        <AnimatePresence>
          {showGifts && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-sm flex flex-col gap-4 mt-6 overflow-hidden">
              {accounts.map((acc, i) => {
                const accKey = acc.id || acc.number || i
                const isShaking = shakeTarget === accKey
                return (
                  <div key={accKey} className="p-5 flex items-center gap-4 text-left" style={{ background: c.bgDark }}>
                    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
                      style={{ border: `1px solid ${c.gold}66` }}>
                      {acc.type === 'bank' ? '🏦' : '📱'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider mb-0.5"
                        style={{ fontFamily: "'Lato', sans-serif", color: c.gold }}>
                        {acc.bank}
                      </p>
                      <p className="text-[11px] mb-1" style={{ fontFamily: "'Lato', sans-serif", color: `${c.textLight}99` }}>
                        {acc.holder}
                      </p>
                      <p className="font-mono text-sm font-semibold" style={{ color: c.textLight }}>
                        {acc.number}
                      </p>
                    </div>
                    <motion.button key={isShaking ? `shake-${shakeNonce}` : 'still'}
                      onClick={() => handleCopy(acc.number, accKey)}
                      animate={isShaking ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex-shrink-0 text-[10px] uppercase tracking-wider px-3 py-2 rounded"
                      style={{
                        fontFamily: "'Lato', sans-serif", border: `1px solid ${c.gold}`,
                        color: copiedKey === accKey ? c.bgDark : c.gold,
                        background: copiedKey === accKey ? c.gold : 'transparent',
                      }}>
                      {copiedKey === accKey ? 'Tersalin' : 'Salin'}
                    </motion.button>
                  </div>
                )
              })}

              {data?.giftAddress?.enabled && (
                <div className="p-5 text-left" style={{ background: c.bgDark }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ fontFamily: "'Lato', sans-serif", color: c.gold }}>
                    Alamat Pengiriman
                  </p>
                  <p className="text-[13px] mb-1" style={{ fontFamily: "'Lato', sans-serif", color: c.textLight }}>
                    {data.giftAddress.recipient}
                  </p>
                  {data.giftAddress.phone && (
                    <p className="text-[12px] mb-2" style={{ fontFamily: "'Lato', sans-serif", color: `${c.textLight}99` }}>
                      {data.giftAddress.phone}
                    </p>
                  )}
                  <p className="text-[12px] whitespace-pre-line leading-relaxed"
                    style={{ fontFamily: "'Lato', sans-serif", color: `${c.textLight}cc` }}>
                    {data.giftAddress.address}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Reveal>
    </section>
  )
}

// ─── 11. UCAPAN & RSVP ────────────────────────────────────────────
const WishRsvpSection = ({ data, wishes, onSubmitWish }) => {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [attendance, setAttendance] = useState('hadir')
  const [guests, setGuests] = useState('1')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting || !name.trim() || !message.trim()) return

    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      if (onSubmitWish) await onSubmitWish({ name, message, attendance, guests })
      setSuccessMsg('Terima kasih, ucapan Anda telah terkirim.')
      setName('')
      setMessage('')
      setAttendance('hadir')
      setGuests('1')
    } catch {
      setErrorMsg('Gagal mengirim ucapan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const list = (wishes || data?.rsvps || []).slice(0, 5)
  const inputStyle = { fontFamily: "'Lato', sans-serif", borderBottom: `1px solid ${c.textDark}44`, color: c.textDark }

  return (
    <section className="w-full py-16 px-6" style={{ background: c.bgLight }}>
      <h2 className="text-center mb-10" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.15em', fontSize: '1.5rem', color: c.textDark }}>
        Ucapan &amp; RSVP
      </h2>

      <form onSubmit={handleSubmit} className="max-w-sm mx-auto flex flex-col gap-5 mb-14">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama Anda" required
          className="w-full text-sm px-1 py-2 outline-none bg-transparent" style={inputStyle} />
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Tuliskan ucapan & doa..." required
          className="w-full text-sm px-1 py-2 outline-none resize-none bg-transparent" style={inputStyle} />

        <div className="flex gap-3 justify-center">
          {[['hadir', 'Hadir'], ['tidak_hadir', 'Tidak Hadir']].map(([v, l]) => (
            <button key={v} type="button" onClick={() => setAttendance(v)}
              className="text-xs uppercase tracking-wider px-5 py-2 rounded-full transition-colors"
              style={{
                fontFamily: "'Lato', sans-serif", border: `1px solid ${c.gold}`,
                background: attendance === v ? c.gold : 'transparent',
                color: attendance === v ? c.bgLight : c.gold,
              }}>
              {l}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {attendance === 'hadir' && (
            <motion.select value={guests} onChange={e => setGuests(e.target.value)}
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="w-full text-sm px-1 py-2 outline-none bg-transparent appearance-none" style={inputStyle}>
              {['1', '2', '3', '4', '5+'].map(n => <option key={n} value={n}>{n} Orang</option>)}
            </motion.select>
          )}
        </AnimatePresence>

        {errorMsg && (
          <p className="text-xs text-center" style={{ fontFamily: "'Lato', sans-serif", color: '#b23b3b' }}>{errorMsg}</p>
        )}
        {successMsg && (
          <p className="text-xs text-center" style={{ fontFamily: "'Lato', sans-serif", color: '#3b7a4a' }}>{successMsg}</p>
        )}

        <button type="submit" disabled={isSubmitting}
          className="text-[11px] tracking-[0.25em] uppercase px-6 py-3 mt-1 transition-opacity"
          style={{ fontFamily: "'Lato', sans-serif", background: c.bgDark, color: c.textLight, opacity: isSubmitting ? 0.6 : 1 }}>
          {isSubmitting ? 'Mengirim…' : 'Kirim'}
        </button>
      </form>

      {list.length > 0 && (
        <div className="max-w-sm mx-auto flex flex-col gap-4">
          {list.map((w, i) => (
            <Reveal key={w.id || i} variant="inv-fade-up" delay={i * 80} className="flex gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
                style={{ background: c.gold, color: c.bgDark, fontFamily: "'Playfair Display', serif" }}>
                {(w.name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-sm font-semibold" style={{ fontFamily: "'Lato', sans-serif", color: c.textDark }}>
                    {w.name}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ fontFamily: "'Lato', sans-serif", border: `1px solid ${c.gold}`, color: c.gold }}>
                    {w.rsvp === 'hadir' ? 'Hadir' : 'Tidak Hadir'}
                  </span>
                </div>
                <p className="text-xs mb-1" style={{ fontFamily: "'Lato', sans-serif", color: `${c.textDark}77` }}>
                  {w.time || fmtDotDate(w.createdAt)}
                </p>
                <p className="text-[13px] leading-relaxed" style={{ fontFamily: "'Lato', sans-serif", color: `${c.textDark}cc` }}>
                  {w.message || w.wish}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── 12. PENUTUP ──────────────────────────────────────────────────
const ClosingSection = ({ data, bride, groom }) => {
  const photos = (data?.gallery || [])
    .map(g => (typeof g === 'string' ? g : g?.src))
    .filter(Boolean)
  const activeIndex = useSlideshow(photos)
  const activePhoto = photos[activeIndex]

  return (
    <section className="relative w-full py-24 px-8 overflow-hidden flex flex-col items-center text-center"
      style={{ background: c.bgDark }}>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="sync">
          {activePhoto && (
            <motion.img key={activeIndex} src={activePhoto} alt=""
              className="kb-zoom absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} />
          )}
        </AnimatePresence>
        <div className="absolute inset-0" style={{ background: 'rgba(26,26,26,0.75)' }} />
      </div>

      <div className="absolute bottom-0 left-0 pointer-events-none z-10 opacity-90">
        <ShadowTree />
      </div>

      <Reveal variant="inv-fade-up" className="relative z-20 flex flex-col items-center">
        <h2 className="mb-5" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.15em', fontSize: '1.6rem', color: c.textLight }}>
          Terima Kasih
        </h2>
        <p className="text-sm max-w-xs mb-6 leading-relaxed"
          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: `${c.textLight}bb` }}>
          Atas kehadiran, doa, dan restu yang diberikan, kami mengucapkan terima kasih yang sebesar-besarnya.
        </p>
        <p className="text-sm font-bold italic mb-1" style={{ fontFamily: "'Lato', sans-serif", color: c.gold }}>
          Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh
        </p>
        <p className="text-xs mb-6" style={{ fontFamily: "'Lato', sans-serif", color: `${c.textLight}88` }}>
          Kami Yang Berbahagia
        </p>
        <p className="mb-10" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 400, fontSize: '2.2rem', color: c.gold }}>
          {bride} &amp; {groom}
        </p>
        <p className="text-[9px] uppercase tracking-widest" style={{ fontFamily: "'Lato', sans-serif", color: `${c.textLight}55` }}>
          Dibuat dengan ♥ oleh Ulema
        </p>
      </Reveal>
    </section>
  )
}

// ─── MUSIK: custom icon + tombol fade (bukan hard mute) ───────────
const MusicIcon = ({ muted, color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
    {muted && <line x1="3" y1="3" x2="21" y2="21" />}
  </svg>
)

// Fade volume via requestAnimationFrame instead of hard pause/mute — audio
// keeps playing in the background, only its volume ramps to/from 0. rAF loop
// is cancelled on unmount and whenever a new fade starts (no leaked loops).
const MusicToggleButton = ({ audioRef }) => {
  const [muted, setMuted] = useState(false)
  const rafRef = useRef(null)

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  const fadeVolumeTo = (target, duration = 600) => {
    const audio = audioRef?.current
    if (!audio) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const from = audio.volume
    const start = performance.now()
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1)
      audio.volume = from + (target - from) * t
      if (t < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }

  const toggle = () => {
    const next = !muted
    setMuted(next)
    fadeVolumeTo(next ? 0 : 1)
  }

  return (
    <button onClick={toggle}
      className="fixed bottom-6 right-5 z-40 w-11 h-11 rounded-full flex items-center justify-center"
      style={{ background: c.bgDark, border: `1px solid ${c.gold}` }}>
      <MusicIcon muted={muted} color={c.gold} />
    </button>
  )
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────
export default function CinematicShadowTheme({
  data, countdown, opened, setOpened,
  animateClose, setAnimateClose,
  setMusicPlaying, audioRef,
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
      // useAudioPlayer's own effect calls .play() when musicPlaying flips true.
      if (audioRef?.current) setMusicPlaying(true)
    }, 900)
  }

  return (
    <InvitationLayout layout={THEMES.CINEMATIC_SHADOW} data={data}>
      {/* Fixed typography by design: Cormorant Garamond (nama, italic 300) +
          Playfair Display (heading) + Lato 300 (body), sesuai spek referensi. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Lato:wght@300;400;700&display=swap');

        @keyframes cst-kenburns {
          0%   { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.1) translate(-2%, -2%); }
        }
        .kb-zoom { animation: cst-kenburns 8s ease-in-out infinite alternate; will-change: transform; }

        .inv-fade-up, .inv-fade-left, .inv-fade-right, .inv-zoom-in {
          opacity: 0;
          transition: opacity 0.8s cubic-bezier(0.25,0.1,0.25,1), transform 0.8s cubic-bezier(0.25,0.1,0.25,1);
          will-change: opacity, transform;
        }
        .inv-fade-up    { transform: translateY(40px); }
        .inv-fade-left  { transform: translateX(-40px); }
        .inv-fade-right { transform: translateX(40px); }
        .inv-zoom-in    { transform: scale(0.9); }
        .inv-fade-up.is-visible,
        .inv-fade-left.is-visible,
        .inv-fade-right.is-visible,
        .inv-zoom-in.is-visible {
          opacity: 1;
          transform: translate(0, 0) scale(1);
        }
      `}</style>

      <div className="w-full relative h-full flex flex-col overflow-x-hidden" style={{ fontFamily: "'Lato', sans-serif" }}>

        {data?.music !== false && (
          <audio ref={audioRef} src={data?.musicUrl || MUSIC_URLS[data?.musicId || 1] || MUSIC_URLS[1]} loop />
        )}

        <AnimatePresence>
          {!opened && (
            <CoverSection key="cover" data={data} bride={bride} groom={groom}
              primaryEvent={primary} handleOpen={handleOpen} animateClose={animateClose} guestName={guestName} />
          )}
        </AnimatePresence>

        {opened && (
          <motion.div className="flex flex-col w-full relative" style={{ zIndex: 1 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}>
            <div id="cs-home"><VideoHeroSection data={data} bride={bride} groom={groom} primaryEvent={primary} countdown={countdown} /></div>
            <div id="cs-mempelai"><ProfileSection data={data} /></div>
            <SaveTheDateSection countdown={countdown} primaryEvent={primary} bride={bride} groom={groom} />
            <div id="cs-acara"><EventsSection events={events} /></div>
            <LoveStorySection data={data} />
            <div id="cs-galeri"><GallerySection data={data} /></div>

            {/* Urutan baku Ulema: seluruh informasi tamu berdekatan, lalu RSVP,
                lalu penutup. Sebelumnya sebagian di antaranya berada SESUDAH
                formulir RSVP — tamu diminta mengisi kehadiran lebih dulu, baru
                sesudah itu diberi tautan siaran atau ditunjukkan ke mana
                mengirim kado. */}
            <DresscodeSection data={data} />
            <LiveStreamingSection data={data} />
            <GiftSection data={data} />
            <TurutMengundangSection data={data} />

            <div id="cs-rsvp"><WishRsvpSection data={data} wishes={wishes} onSubmitWish={onSubmitWish} /></div>
            <ClosingSection data={data} bride={bride} groom={groom} />

            {data?.music !== false && <MusicToggleButton audioRef={audioRef} />}

            {/* NAVIGASI BAWAH — tema terakhir yang belum punya. Fixed murni
                dijangkarkan ke lebar kolom (--inv-w), bukan `fixed
                md:absolute`: di layar >= 768px varian absolute yang menang dan
                navigasinya berlabuh ke dasar dokumen, bukan ke layar. */}
            <nav className="fixed flex" style={{
              bottom: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
              width: 'min(420px, calc(var(--inv-w) - 28px))', gap: 2, padding: '7px 9px', borderRadius: 999,
              background: 'rgba(26,26,26,.86)', border: `1px solid ${c.gold}44`,
              backdropFilter: 'blur(16px) saturate(1.2)', WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
              boxShadow: '0 14px 32px rgba(0,0,0,.45)',
            }}>
              {[['Home', 'cs-home'], ['Mempelai', 'cs-mempelai'], ['Acara', 'cs-acara'], ['Galeri', 'cs-galeri'], ['RSVP', 'cs-rsvp']].map(([label, id]) => (
                <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  style={{
                    flex: 1, padding: '8px 2px', borderRadius: 999, border: 'none', cursor: 'pointer',
                    background: 'transparent', color: c.gold,
                    fontFamily: "'Lato', sans-serif", fontSize: 9.5, letterSpacing: '.06em', textTransform: 'uppercase',
                  }}>
                  {label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </div>
    </InvitationLayout>
  )
}
