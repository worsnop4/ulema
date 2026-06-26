import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, MapPin, Heart } from 'lucide-react'
import InvitationLayout from './components/InvitationLayout'

// ─── FONT IMPORT ─────────────────────────────────────────────────
// Tambahkan ke index.html atau biarkan dimuat via @import di style global
// Fonts: Cormorant Infant (serif elegan), Nunito Sans (body), Pinyon Script (kaligrafi)

// ─── WARNA ───────────────────────────────────────────────────────
const c = {
  maroon:   '#7a1c1c',
  gold:     '#b5863a',
  cream:    '#fdf6ee',
  text:     '#3d2218',
  glass:    'rgba(253,246,238,0.55)',
  glassBrd: 'rgba(181,134,58,0.25)',
  overlay:  'rgba(253,246,238,0.18)',
}

// ─── ASSETS ──────────────────────────────────────────────────────
const A = {
  mobileBg:   '/themes/Adat/theme-12/bg.jpeg',
  desktopBg:  '/themes/Adat/theme-12/dekstop%20bg.jpeg',
  coverVideo: '/themes/Adat/theme-12/cover-motion-06.mp4',
  bgVideo:    '/themes/Adat/theme-12/bg-motion-fixed-06-compress-1.mp4',
  ampersand:  '/themes/Adat/theme-12/06.png',
  frame:      '/themes/Adat/theme-12/Frame%20bg.png',
  m1: '/themes/Adat/theme-12/asset-motion-1.png',
  m2: '/themes/Adat/theme-12/asset-motion-2.png',
  m3: '/themes/Adat/theme-12/asset-motion-3.png',
  m4: '/themes/Adat/theme-12/asset-motion-4.png',
  m5: '/themes/Adat/theme-12/asset-motion-5.png',
}

// ─── HELPERS ─────────────────────────────────────────────────────
const fmtCoverDate = (s) => {
  if (!s) return 'Sabtu, 28 Desember 2027'
  try {
    const d = new Date(s)
    const D = ['Ahad','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
    const M = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
    return `${D[d.getDay()]}, ${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`
  } catch { return s }
}

const fmtEventDate = (s) => {
  if (!s) return { day: '28', mon: 'Desember', yr: '2027' }
  try {
    const d = new Date(s)
    const M = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
    return { day: d.getDate().toString().padStart(2,'0'), mon: M[d.getMonth()], yr: d.getFullYear().toString() }
  } catch { return { day: '28', mon: 'Desember', yr: '2027' } }
}

const fmtLSDate = (s) => {
  if (!s) return ''
  try {
    const d = new Date(s)
    const M = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des']
    return `${d.getDate().toString().padStart(2,'0')} ${M[d.getMonth()]} ${d.getFullYear()}`
  } catch { return s }
}

// ─── GLASS CARD ──────────────────────────────────────────────────
const Glass = ({ children, className = '', style = {} }) => (
  <div
    className={`${className}`}
    style={{
      background: c.glass,
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: `1px solid ${c.glassBrd}`,
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(122,28,28,0.10), 0 2px 8px rgba(0,0,0,0.06)',
      ...style
    }}
  >
    {children}
  </div>
)

// ─── DIVIDER ─────────────────────────────────────────────────────
const Divider = () => (
  <div className="flex items-center justify-center gap-3 my-8 opacity-60">
    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${c.gold})` }} />
    <img src={A.m5} alt="" className="w-6 h-6 object-contain opacity-70 grayscale" />
    <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${c.gold})` }} />
  </div>
)

// ─── VIDEO BG ────────────────────────────────────────────────────
const VideoBg = ({ src, fallback }) => (
  <div className="absolute inset-0 z-0 overflow-hidden">
    <video autoPlay muted loop playsInline poster={fallback}
      className="w-full h-full object-cover"
      onError={e => { e.target.style.display = 'none' }}>
      <source src={src} type="video/mp4" />
    </video>
    <div className="absolute inset-0" style={{ background: c.overlay }} />
  </div>
)

// ─── FLOATING ORNAMENTS ──────────────────────────────────────────
const FloatOrnament = () => (
  <>
    <motion.img src={A.m1} alt=""
      className="absolute bottom-0 left-0 w-36 h-36 object-contain pointer-events-none z-10"
      animate={{ rotate: [-2, 2, -2], y: [0, -6, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
    <motion.img src={A.m2} alt=""
      className="absolute bottom-0 right-0 w-36 h-36 object-contain pointer-events-none z-10"
      animate={{ rotate: [2, -2, 2], y: [0, -8, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
  </>
)

// ─── 1. COVER SECTION ────────────────────────────────────────────
const CoverSection = ({ data, bride, groom, primaryEvent, handleOpen, animateClose }) => {
  const coverPhoto = data?.meta?.coverPhoto || data?.meta?.photo || data?.bride?.photo || data?.groom?.photo || null

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ color: c.text }}
      animate={animateClose ? { y: '-100%', opacity: 0 } : { y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
    >
      <VideoBg src={A.coverVideo} fallback={A.mobileBg} />

      {/* ornamen pojok */}
      <motion.img src={A.m1} alt="" className="absolute bottom-0 left-0 w-36 h-36 object-contain z-10 pointer-events-none"
        initial={{ rotate: -80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.9, ease: 'easeOut' }} />
      <motion.img src={A.m2} alt="" className="absolute bottom-0 right-0 w-36 h-36 object-contain z-10 pointer-events-none"
        initial={{ rotate: 80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.9, ease: 'easeOut' }} />

      <div className="relative z-20 flex flex-col items-center text-center px-10 w-full pt-12">
        <motion.p className="text-[10px] tracking-[0.35em] uppercase font-sans mb-6 opacity-80"
          style={{ fontFamily: 'Nunito Sans, sans-serif', color: c.text }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          The Wedding Of
        </motion.p>

        {/* Frame Oval Foto */}
        {coverPhoto && (
          <motion.div 
            className="mb-8 relative p-1.5 rounded-[50%]"
            style={{ border: `1px solid ${c.gold}80` }}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="w-32 h-44 rounded-[50%] overflow-hidden relative shadow-lg"
                 style={{ border: `2px solid ${c.cream}` }}>
              <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
              {/* Efek inner shadow/glass ringan di atas foto */}
              <div className="absolute inset-0 rounded-[50%]" style={{ boxShadow: 'inset 0 0 15px rgba(0,0,0,0.1)' }} />
            </div>
          </motion.div>
        )}

      <motion.h1 className="mb-1 leading-none"
        style={{ fontFamily: 'Cormorant Infant, serif', fontSize: '3.2rem', color: c.maroon, fontWeight: 400, fontStyle: 'italic' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
        {bride}
      </motion.h1>

      <motion.img src={A.ampersand} alt="&" className="w-12 h-12 object-contain my-1"
        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55, type: 'spring', stiffness: 200 }} />

      <motion.h1 className="mb-8 leading-none"
        style={{ fontFamily: 'Cormorant Infant, serif', fontSize: '3.2rem', color: c.maroon, fontWeight: 400, fontStyle: 'italic' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}>
        {groom}
      </motion.h1>

      <motion.p className="text-[11px] tracking-widest mb-10 opacity-80 font-sans"
        style={{ color: c.text }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        {fmtCoverDate(primaryEvent?.date)}
      </motion.p>

      <motion.button onClick={handleOpen}
        className="px-8 py-2.5 text-[10px] tracking-[0.3em] uppercase font-sans font-semibold rounded-full shadow-lg"
        style={{ backgroundColor: c.maroon, color: '#fff', letterSpacing: '0.3em' }}
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        Buka Undangan
      </motion.button>
    </div>
  </motion.div>
  )
}

// ─── 3. PROFILE SECTION ──────────────────────────────────────────
const ProfileSection = ({ data }) => {
  const renderPerson = (person, label) => (
    <motion.div className="flex flex-col items-center text-center px-6 py-10"
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.7 }}>
      <p className="text-[9px] tracking-[0.35em] uppercase mb-3 font-sans opacity-60" style={{ color: c.text }}>
        {label}
      </p>

      {/* Frame + Foto */}
      <div className="relative w-52 h-52 flex items-center justify-center mb-6">
        <img src={A.frame} alt="" className="absolute inset-0 w-full h-full object-contain scale-[1.12] z-10 drop-shadow" />
        <div className="w-[75%] h-[75%] rounded-full overflow-hidden z-20 shadow-md border-2 border-white/60"
          style={{ backdropFilter: 'blur(4px)' }}>
          {person?.photo
            ? <img src={person.photo} alt={person.nickname} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-xs font-sans opacity-40" style={{ background: c.cream }}>Foto</div>}
        </div>
      </div>

      <h3 className="mb-1 leading-tight"
        style={{ fontFamily: 'Cormorant Infant, serif', fontSize: '2rem', color: c.maroon, fontWeight: 400, fontStyle: 'italic' }}>
        {person?.nickname}
      </h3>
      <p className="text-xs font-semibold mb-2 tracking-wide font-sans" style={{ color: c.text }}>
        {person?.name}
      </p>
      <p className="text-[10px] leading-relaxed opacity-70 max-w-[220px] font-sans" style={{ color: c.text }}>
        Putri/Putra dari<br />
        Bpk. {person?.father || '—'} &amp; Ibu {person?.mother || '—'}
      </p>
      {person?.instagram && (
        <a href={`https://instagram.com/${person.instagram.replace('@','')}`}
          target="_blank" rel="noreferrer"
          className="mt-4 flex items-center gap-1.5 text-[10px] tracking-widest uppercase font-sans font-semibold opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: c.gold }}>
          <span className="font-bold">@</span>
          {person.instagram}
        </a>
      )}
    </motion.div>
  )

  return (
    <section className="w-full py-4">
      <Glass className="mx-4 overflow-hidden">
        {/* Dekorasi top */}
        <div className="flex justify-center pt-8 opacity-50">
          <img src={A.m5} alt="" className="h-16 object-contain" />
        </div>
        <div className="px-2">
          <motion.p className="text-center text-[9px] tracking-[0.4em] uppercase pt-4 pb-2 font-sans opacity-60"
            style={{ color: c.text }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            Bride &amp; Groom
          </motion.p>
          {renderPerson(data?.bride, 'Puti')}
          <Divider />
          {renderPerson(data?.groom, 'Sutan')}
        </div>
      </Glass>
    </section>
  )
}

// ─── 4. COUNTDOWN ────────────────────────────────────────────────
const CountdownSection = ({ countdown, primaryEvent, bride, groom }) => {
  const blocks = [
    { label: 'Hari', v: countdown?.d || 0 },
    { label: 'Jam',  v: countdown?.h || 0 },
    { label: 'Menit', v: countdown?.m || 0 },
    { label: 'Detik', v: countdown?.s || 0 },
  ]
  return (
    <section className="w-full py-6 px-4">
      <Glass className="p-8 flex flex-col items-center">
        <p className="text-[9px] tracking-[0.4em] uppercase mb-2 font-sans opacity-60" style={{ color: c.text }}>
          Save The Date
        </p>
        <h3 className="mb-8 text-center"
          style={{ fontFamily: 'Cormorant Infant, serif', fontSize: '1.6rem', color: c.maroon, fontWeight: 400, fontStyle: 'italic' }}>
          Menuju Hari Bahagia
        </h3>

        <div className="flex gap-3 justify-center mb-8">
          {blocks.map((b, i) => (
            <motion.div key={b.label}
              className="w-16 h-16 flex flex-col items-center justify-center rounded-xl"
              style={{ background: 'rgba(255,255,255,0.5)', border: `1px solid ${c.glassBrd}`, boxShadow: '0 2px 12px rgba(122,28,28,0.08)' }}
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <span className="leading-none mb-0.5"
                style={{ fontFamily: 'Cormorant Infant, serif', fontSize: '1.6rem', color: c.maroon, fontWeight: 600 }}>
                {b.v.toString().padStart(2,'0')}
              </span>
              <span className="text-[8px] uppercase tracking-widest font-sans opacity-60" style={{ color: c.text }}>
                {b.label}
              </span>
            </motion.div>
          ))}
        </div>

        {primaryEvent?.date && (
          <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${groom}+%26+${bride}&dates=${primaryEvent.date.replace(/-/g,'')}T080000Z/${primaryEvent.date.replace(/-/g,'')}T120000Z`}
            target="_blank" rel="noreferrer"
            className="text-[10px] tracking-[0.25em] uppercase font-sans font-semibold px-6 py-2 rounded-full shadow"
            style={{ backgroundColor: c.maroon, color: '#fff' }}>
            Simpan Tanggal
          </a>
        )}
      </Glass>
    </section>
  )
}

// ─── 5. EVENTS SECTION ───────────────────────────────────────────
const EventsSection = ({ akad, baralek }) => {
  const renderCard = (ev, title, dir) => {
    if (!ev) return null
    const { day, mon, yr } = fmtEventDate(ev.date)
    return (
      <motion.div className="w-full"
        initial={{ opacity: 0, x: dir === 'L' ? -20 : 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.7 }}>
        <Glass className="p-7 flex flex-col items-center text-center">
          <p className="text-[9px] tracking-[0.35em] uppercase mb-1 font-sans opacity-50" style={{ color: c.text }}>
            {title}
          </p>
          <div className="flex items-end gap-2 mt-3 mb-5">
            <span style={{ fontFamily: 'Cormorant Infant, serif', fontSize: '3rem', color: c.maroon, fontWeight: 600, lineHeight: 1 }}>
              {day}
            </span>
            <div className="flex flex-col items-start text-left mb-1">
              <span className="text-xs font-semibold font-sans tracking-wide" style={{ color: c.text }}>{mon}</span>
              <span className="text-[10px] font-sans opacity-60" style={{ color: c.text }}>{yr}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-3 text-[11px] font-sans opacity-80" style={{ color: c.text }}>
            <Clock size={11} color={c.gold} />
            <span>{ev.time || '10:00 — Selesai'}</span>
          </div>
          <p className="font-semibold text-sm mb-1 font-sans" style={{ color: c.maroon }}>{ev.location || '—'}</p>
          <p className="text-[10px] leading-relaxed mb-5 opacity-70 font-sans max-w-[200px]" style={{ color: c.text }}>
            {ev.address || ''}
          </p>
          {ev.mapUrl && (
            <a href={ev.mapUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase font-sans font-semibold px-5 py-2 rounded-full"
              style={{ border: `1px solid ${c.maroon}`, color: c.maroon }}>
              <MapPin size={10} /> Petunjuk Arah
            </a>
          )}
        </Glass>
      </motion.div>
    )
  }
  return (
    <section className="w-full py-4 px-4 flex flex-col gap-4">
      <motion.p className="text-center text-[9px] tracking-[0.4em] uppercase font-sans opacity-60"
        style={{ color: c.text }}
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        Waktu &amp; Tempat
      </motion.p>
      {renderCard(akad, 'Akad Nikah', 'L')}
      {renderCard(baralek, 'Baralek', 'R')}
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
        <p className="text-center text-[9px] tracking-[0.4em] uppercase mb-2 font-sans opacity-60" style={{ color: c.text }}>
          Our Story
        </p>
        <h3 className="text-center mb-10"
          style={{ fontFamily: 'Cormorant Infant, serif', fontSize: '1.6rem', color: c.maroon, fontWeight: 400, fontStyle: 'italic' }}>
          Kisah Kami
        </h3>
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px" style={{ background: `${c.gold}50` }} />
          {stories.map((s, i) => {
            const isL = i % 2 === 0
            return (
              <motion.div key={s.id || i}
                className={`flex w-full items-center justify-between mb-12 relative ${isL ? 'flex-row' : 'flex-row-reverse'}`}
                initial={{ opacity: 0, x: isL ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.7 }}>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 bg-white"
                  style={{ borderColor: c.maroon, zIndex: 10 }} />
                <div className="w-5/12 flex justify-center">
                  {s.photo
                    ? <div className="w-24 h-24 rounded-full overflow-hidden border-2 shadow-md" style={{ borderColor: c.gold + '80' }}>
                        <img src={s.photo} alt={s.title} className="w-full h-full object-cover" />
                      </div>
                    : <div className="w-16 h-16 rounded-full border flex items-center justify-center" style={{ borderColor: c.gold + '60', background: 'rgba(255,255,255,0.5)' }}>
                        <Heart size={16} color={c.maroon} />
                      </div>}
                </div>
                <div className={`w-5/12 flex flex-col ${isL ? 'text-left' : 'text-right'}`}>
                  <span className="text-[9px] font-sans mb-1 opacity-60" style={{ color: c.gold }}>
                    {fmtLSDate(s.date || s.year)}
                  </span>
                  <h4 className="font-semibold text-xs mb-1.5 font-sans leading-tight" style={{ color: c.maroon }}>
                    {s.title}
                  </h4>
                  <p className="text-[10px] opacity-80 leading-relaxed font-sans" style={{ color: c.text }}>
                    {s.story}
                  </p>
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
        <p className="text-center text-[9px] tracking-[0.4em] uppercase mb-6 font-sans opacity-60" style={{ color: c.text }}>
          Our Moments
        </p>
        <div className="grid grid-cols-2 gap-2">
          {photos.map((ph, i) => {
            const src = typeof ph === 'string' ? ph : ph?.src
            if (!src) return null
            return (
              <motion.div key={i}
                className="aspect-square overflow-hidden rounded-lg shadow-sm group cursor-pointer"
                style={{ border: `1px solid ${c.glassBrd}` }}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <img src={src} alt={`Foto ${i+1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </motion.div>
            )
          })}
        </div>
      </Glass>
    </section>
  )
}

// ─── 8. WISH & RSVP ──────────────────────────────────────────────
const WishRsvpSection = ({ data, wishes, onSubmitWish }) => {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [att, setAtt] = useState('hadir')
  const [pax, setPax] = useState('1')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!name || !msg) return
    setBusy(true)
    if (onSubmitWish) await onSubmitWish({ name, message: msg, attendance: att, pax })
    setName(''); setMsg(''); setAtt('hadir'); setPax('1')
    setBusy(false)
  }

  const fmtDate = (s) => {
    try {
      const d = new Date(s)
      return `${d.getDate().toString().padStart(2,'0')} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'][d.getMonth()]} ${d.getFullYear()}`
    } catch { return s }
  }

  const list = (wishes || data?.rsvps || []).slice(0, 5)

  return (
    <section className="w-full py-6 px-4">
      <Glass className="p-8">
        <p className="text-center text-[9px] tracking-[0.4em] uppercase mb-2 font-sans opacity-60" style={{ color: c.text }}>
          Doa &amp; Kehadiran
        </p>
        <h3 className="text-center mb-8"
          style={{ fontFamily: 'Cormorant Infant, serif', fontSize: '1.6rem', color: c.maroon, fontWeight: 400, fontStyle: 'italic' }}>
          Sampaikan Doa
        </h3>

        <form onSubmit={submit} className="flex flex-col gap-3 mb-8">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama Anda" required
            className="w-full text-[11px] font-sans bg-white/50 px-4 py-2.5 outline-none rounded-lg"
            style={{ border: `1px solid ${c.glassBrd}`, color: c.text }} />
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3} placeholder="Tuliskan ucapan..." required
            className="w-full text-[11px] font-sans bg-white/50 px-4 py-2.5 outline-none rounded-lg resize-none"
            style={{ border: `1px solid ${c.glassBrd}`, color: c.text }} />
          <div className="flex gap-4">
            {[['hadir','Hadir'],['tidak_hadir','Tidak Hadir']].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 text-[10px] font-sans cursor-pointer" style={{ color: c.text }}>
                <input type="radio" name="att" value={v} checked={att===v} onChange={() => setAtt(v)} className="accent-[#7a1c1c]" />
                {l}
              </label>
            ))}
          </div>
          <AnimatePresence>
            {att === 'hadir' && (
              <motion.select value={pax} onChange={e => setPax(e.target.value)}
                className="w-full text-[11px] font-sans bg-white/50 px-4 py-2.5 outline-none rounded-lg appearance-none"
                style={{ border: `1px solid ${c.glassBrd}`, color: c.text }}
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                {['1','2','3','4','5+'].map(n => <option key={n} value={n}>{n} Orang</option>)}
              </motion.select>
            )}
          </AnimatePresence>
          <button type="submit" disabled={busy}
            className="text-[10px] tracking-[0.25em] uppercase font-sans font-semibold px-6 py-2.5 rounded-full mt-1 shadow"
            style={{ backgroundColor: c.maroon, color: '#fff', opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Mengirim…' : 'Sampaikan Doa'}
          </button>
        </form>

        {list.length > 0 && (
          <div className="flex flex-col gap-3">
            {list.map((w, i) => (
              <motion.div key={w.id || i}
                className="p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.45)', borderLeft: `3px solid ${c.maroon}80` }}
                initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-semibold font-sans" style={{ color: c.maroon }}>{w.name}</span>
                  <span className="text-[8px] font-sans opacity-50" style={{ color: c.text }}>{fmtDate(w.createdAt || '')}</span>
                </div>
                <p className="text-[10px] leading-relaxed font-sans opacity-80" style={{ color: c.text }}>{w.message || w.wish}</p>
              </motion.div>
            ))}
          </div>
        )}
      </Glass>
    </section>
  )
}

// ─── 9. FOOTER ───────────────────────────────────────────────────
const FooterSection = ({ bride, groom }) => (
  <section className="w-full px-4 pb-10 pt-6 relative overflow-hidden">
    <Glass className="p-10 flex flex-col items-center text-center relative overflow-hidden">
      {/* ornamen pojok */}
      <img src={A.m3} alt="" className="absolute -bottom-4 -left-4 w-32 h-32 object-contain opacity-30 pointer-events-none" />
      <img src={A.m4} alt="" className="absolute -bottom-4 -right-4 w-32 h-32 object-contain opacity-30 pointer-events-none" />

      <p className="text-[9px] tracking-[0.4em] uppercase mb-3 font-sans opacity-60" style={{ color: c.text }}>
        Terima Kasih
      </p>
      <h2 className="mb-6" style={{ fontFamily: 'Cormorant Infant, serif', fontSize: '2.2rem', color: c.maroon, fontWeight: 400, fontStyle: 'italic' }}>
        Tarimo Kasih
      </h2>
      <p className="text-[10px] leading-relaxed mb-6 max-w-[220px] font-sans opacity-75" style={{ color: c.text }}>
        Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
      </p>
      <p className="text-[10px] font-sans opacity-60 mb-8" style={{ fontFamily: 'Cormorant Infant, serif', fontStyle: 'italic', color: c.maroon }}>
        Wassalamu'alaikum Warahmatullahi Wabarakatuh
      </p>
      <div className="flex items-center gap-3">
        <span style={{ fontFamily: 'Pinyon Script, cursive', fontSize: '2rem', color: c.maroon }}>{bride}</span>
        <img src={A.ampersand} alt="&" className="w-8 h-8 object-contain opacity-80" />
        <span style={{ fontFamily: 'Pinyon Script, cursive', fontSize: '2rem', color: c.maroon }}>{groom}</span>
      </div>
      <p className="text-[8px] font-sans opacity-40 mt-8 tracking-widest uppercase" style={{ color: c.text }}>
        Dibuat dengan ♥ oleh Ulema
      </p>
    </Glass>
  </section>
)

// ─── VIDEO BG MOTION (fixed behind all content) ──────────────────
const MotionVideoBg = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <video autoPlay muted loop playsInline poster={A.mobileBg}
      className="w-full h-full object-cover"
      onError={e => {
        e.target.parentElement.style.backgroundImage = `url('${A.mobileBg}')`
        e.target.parentElement.style.backgroundSize = 'cover'
        e.target.style.display = 'none'
      }}>
      <source src={A.bgVideo} type="video/mp4" />
    </video>
    <div className="absolute inset-0" style={{ background: 'rgba(253,246,238,0.18)' }} />
  </div>
)

// ─── MAIN EXPORT ─────────────────────────────────────────────────
export default function MinangElegantTheme({
  data, countdown, opened, setOpened,
  animateClose, setAnimateClose,
  musicPlaying, setMusicPlaying, audioRef,
  wishes, onSubmitWish
}) {
  const groom = data?.groom?.nickname || 'Groom'
  const bride = data?.bride?.nickname || 'Bride'
  const akad    = data?.events?.[0]
  const baralek = data?.events?.[1]
  const primary = akad || {}

  const handleOpen = () => {
    setAnimateClose(true)
    setTimeout(() => {
      setOpened(true)
      if (audioRef?.current) {
        audioRef.current.play().catch(() => {})
        setMusicPlaying(true)
      }
    }, 800)
  }

  return (
    <InvitationLayout layout="minang-elegant" data={data} bgUrl={A.desktopBg}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Infant:ital,wght@0,400;0,600;1,400;1,600&family=Pinyon+Script&family=Nunito+Sans:wght@300;400;600&display=swap');
      `}</style>

      <div className="w-full relative h-full flex flex-col overflow-x-hidden"
        style={{ fontFamily: 'Nunito Sans, sans-serif', color: c.text }}>

        {/* Cover */}
        <AnimatePresence>
          {!opened && (
            <CoverSection key="cover"
              data={data}
              bride={bride} groom={groom}
              primaryEvent={primary}
              handleOpen={handleOpen}
              animateClose={animateClose} />
          )}
        </AnimatePresence>

        {/* Konten Utama */}
        {opened && (
          <motion.div className="flex flex-col w-full relative"
            style={{ zIndex: 1 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}>

            <MotionVideoBg />

            <div className="relative flex flex-col gap-5 pt-8 pb-6" style={{ zIndex: 2 }}>
              <ProfileSection data={data} />
              <CountdownSection countdown={countdown} primaryEvent={primary} bride={bride} groom={groom} />
              <EventsSection akad={akad} baralek={baralek} />
              <LoveStorySection data={data} />
              <GallerySection data={data} />
              <WishRsvpSection data={data} wishes={wishes} onSubmitWish={onSubmitWish} />
              <FooterSection bride={bride} groom={groom} />
            </div>
          </motion.div>
        )}
      </div>
    </InvitationLayout>
  )
}
