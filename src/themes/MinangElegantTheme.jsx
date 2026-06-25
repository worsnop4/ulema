import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Clock, MapPin } from 'lucide-react'
import InvitationLayout from './components/InvitationLayout'

// --- SVG Motif Minang ---
// Motif Kaluak Paku / Pucuak Rabuang (Sederhana)
const PucuakRabuangTop = ({ color }) => (
  <svg viewBox="0 0 100 30" className="w-full h-auto drop-shadow-md" preserveAspectRatio="none">
    <path
      d="M0,0 L100,0 L100,10 L85,25 L70,10 L55,25 L40,10 L25,25 L10,10 L0,20 Z"
      fill={color}
    />
    <path
      d="M0,0 L100,0 L100,5 L85,15 L70,5 L55,15 L40,5 L25,15 L10,5 L0,10 Z"
      fill="rgba(255,255,255,0.1)"
    />
  </svg>
)

const PucuakRabuangBottom = ({ color }) => (
  <svg viewBox="0 0 100 30" className="w-full h-auto drop-shadow-md" preserveAspectRatio="none">
    <path
      d="M0,30 L100,30 L100,20 L85,5 L70,20 L55,5 L40,20 L25,5 L10,20 L0,10 Z"
      fill={color}
    />
    <path
      d="M0,30 L100,30 L100,25 L85,15 L70,25 L55,15 L40,25 L25,15 L10,25 L0,20 Z"
      fill="rgba(255,255,255,0.1)"
    />
  </svg>
)

const DividerMinang = ({ color }) => (
  <div className="w-full flex items-center justify-center my-12 opacity-80">
    <div className="flex-1 h-[1px]" style={{ backgroundColor: color }} />
    <svg width="40" height="20" viewBox="0 0 40 20" className="mx-4">
      <path d="M20,0 L30,10 L20,20 L10,10 Z" fill="none" stroke={color} strokeWidth="1" />
      <circle cx="20" cy="10" r="3" fill={color} />
    </svg>
    <div className="flex-1 h-[1px]" style={{ backgroundColor: color }} />
  </div>
)

const CornerOrnament = ({ color, className }) => (
  <svg width="15" height="15" viewBox="0 0 15 15" className={className}>
    <path d="M0,0 L15,0 L0,15 Z" fill={color} opacity="0.3" />
    <path d="M0,0 L10,0 L0,10 Z" fill={color} />
  </svg>
)

// --- UTILITAS & WARNA ---
const colors = {
  bg: '#1a0f0a',
  text: '#f5ead0',
  accent: '#c0872a',
  secondary: '#8b1a1a',
}

const formatCoverDate = (dateStr) => {
  if (!dateStr) return 'Sabtu, 28 Desember 2027'
  try {
    const d = new Date(dateStr)
    const days = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  } catch {
    return dateStr
  }
}

const formatEventDate = (dateStr) => {
  if (!dateStr) return { day: '28', monthYear: 'Desember 2027' }
  try {
    const d = new Date(dateStr)
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return { 
      day: d.getDate().toString().padStart(2, '0'), 
      monthYear: `${months[d.getMonth()]} ${d.getFullYear()}`
    }
  } catch {
    return { day: '28', monthYear: 'Desember 2027' }
  }
}

const formatLoveStoryDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`
  } catch {
    return dateStr
  }
}

// --- KOMPONEN SECTION ---
const CoverSection = ({ animateClose, bride, groom, primaryEvent, handleOpen }) => (
  <motion.div 
    className="absolute inset-0 z-50 flex flex-col justify-between items-center overflow-hidden"
    style={{ backgroundColor: colors.bg, color: colors.text }}
    animate={animateClose ? { y: '-100%', opacity: 0 } : { y: 0, opacity: 1 }}
    transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
  >
    <motion.div 
      className="w-full absolute top-0 left-0 right-0 z-10"
      initial={{ y: -50 }}
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <PucuakRabuangTop color={colors.secondary} />
    </motion.div>

    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 z-20 w-full mt-10 mb-10">
      <motion.p 
        className="uppercase tracking-[0.3em] text-xs font-sans mb-6 opacity-80"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Baralek Gadang
      </motion.p>

      <motion.h1 
        className="font-serif text-5xl sm:text-6xl mb-6"
        style={{ color: colors.accent }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        {bride} <span className="block text-2xl my-2">&amp;</span> {groom}
      </motion.h1>

      <motion.div 
        className="w-16 h-[1px] my-6"
        style={{ backgroundColor: colors.accent }}
        initial={{ width: 0 }}
        animate={{ width: 64 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      />

      <motion.p 
        className="font-sans text-sm mb-12 opacity-90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {formatCoverDate(primaryEvent?.date)}
      </motion.p>

      <motion.button
        onClick={handleOpen}
        className="relative px-8 py-3 rounded-full font-sans text-xs tracking-widest uppercase transition-all overflow-hidden group"
        style={{ 
          color: colors.text, 
          border: `1px solid ${colors.accent}`,
          backgroundColor: 'transparent'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="relative z-10">Buka Undangan</span>
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
          style={{ backgroundColor: colors.accent }}
        />
      </motion.button>
    </div>

    <motion.div 
      className="w-full absolute bottom-0 left-0 right-0 z-10"
      initial={{ y: 50 }}
      animate={{ y: [0, 5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <PucuakRabuangBottom color={colors.secondary} />
    </motion.div>
  </motion.div>
)

const ProfileSection = ({ data }) => {
  const renderPerson = (person, type) => (
    <motion.div 
      className="flex flex-col items-center text-center w-full my-12 px-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8 }}
    >
      <p className="font-serif italic text-lg mb-4 opacity-90" style={{ color: colors.accent }}>
        {type === 'bride' ? 'Puti' : 'Sutan'}
      </p>
      <div className="relative w-48 h-48 mb-6 rounded-full p-2" style={{ border: `1px solid ${colors.accent}` }}>
        <div className="absolute inset-0 rounded-full border-2 border-dashed m-1" style={{ borderColor: colors.secondary, opacity: 0.5 }} />
        <div className="w-full h-full rounded-full overflow-hidden bg-[#21140e]">
          {person?.photo ? (
            <img src={person.photo} alt={person.nickname} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-500 text-sm">Foto {type === 'bride' ? 'Wanita' : 'Pria'}</div>
          )}
        </div>
      </div>
      <h2 className="font-serif text-3xl mb-2" style={{ color: colors.accent }}>{person?.nickname}</h2>
      <p className="text-lg mb-2 font-medium tracking-wide">{person?.name}</p>
      <p className="text-sm opacity-80 leading-relaxed max-w-xs">
        Putra dari Bpk. {person?.father} <br/> &amp; Ibu {person?.mother}
      </p>
      {person?.instagram && (
        <a href={`https://instagram.com/${person.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" 
           className="mt-5 text-xs tracking-wider uppercase border-b pb-1 hover:opacity-100 transition-opacity"
           style={{ borderColor: colors.accent, color: colors.accent, opacity: 0.8 }}>
          Instagram
        </a>
      )}
    </motion.div>
  )

  return (
    <section className="w-full py-20" style={{ backgroundColor: '#21140e' }}>
      <div className="max-w-md mx-auto">
        {renderPerson(data?.bride, 'bride')}
        <DividerMinang color={colors.accent} />
        {renderPerson(data?.groom, 'groom')}
      </div>
    </section>
  )
}

const CountdownSection = ({ countdown, primaryEvent, groom, bride }) => {
  const timeBlocks = [
    { label: 'Hari', value: countdown?.d || 0 },
    { label: 'Jam', value: countdown?.h || 0 },
    { label: 'Menit', value: countdown?.m || 0 },
    { label: 'Detik', value: countdown?.s || 0 },
  ]

  return (
    <section className="w-full py-24 px-6 relative flex flex-col items-center">
      <motion.h3 
        className="font-serif text-3xl text-center mb-12"
        style={{ color: colors.accent }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Menuju Hari Bahagia
      </motion.h3>

      <div className="flex gap-4 justify-center mb-16">
        {timeBlocks.map((block, i) => (
          <motion.div 
            key={block.label}
            className="relative w-[4.5rem] h-24 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm"
            style={{ border: `1px solid ${colors.accent}40` }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
          >
            <CornerOrnament color={colors.accent} className="absolute top-0 left-0" />
            <CornerOrnament color={colors.accent} className="absolute top-0 right-0 rotate-90" />
            <CornerOrnament color={colors.accent} className="absolute bottom-0 right-0 rotate-180" />
            <CornerOrnament color={colors.accent} className="absolute bottom-0 left-0 -rotate-90" />

            <span className="font-serif text-3xl mb-1" style={{ color: colors.text }}>
              {block.value.toString().padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-widest opacity-70">
              {block.label}
            </span>
          </motion.div>
        ))}
      </div>

      {primaryEvent?.date && (
        <motion.a
          href={`https://www.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${groom}+%26+${bride}&dates=${primaryEvent.date.replace(/-/g, '')}T080000Z/${primaryEvent.date.replace(/-/g, '')}T100000Z`}
          target="_blank"
          rel="noreferrer"
          className="px-8 py-3 rounded-full font-sans text-xs tracking-widest uppercase transition-all shadow-lg"
          style={{ 
            backgroundColor: colors.accent,
            color: colors.bg
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Simpan Tanggal
        </motion.a>
      )}
    </section>
  )
}

const EventsSection = ({ akadEvent, baralekEvent }) => {
  const renderEventCard = (eventData, title, direction) => {
    if (!eventData) return null
    const dateObj = formatEventDate(eventData.date)

    return (
      <motion.div 
        className="relative w-full p-8 flex flex-col items-center text-center my-8 shadow-2xl"
        style={{ backgroundColor: '#2a1510', border: `1px solid ${colors.accent}60` }}
        initial={{ opacity: 0, x: direction === 'left' ? -30 : 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
      >
        <CornerOrnament color={colors.accent} className="absolute top-0 left-0" />
        <CornerOrnament color={colors.accent} className="absolute top-0 right-0 rotate-90" />
        <CornerOrnament color={colors.accent} className="absolute bottom-0 right-0 rotate-180" />
        <CornerOrnament color={colors.accent} className="absolute bottom-0 left-0 -rotate-90" />

        <h3 className="font-serif text-3xl mb-6" style={{ color: colors.secondary }}>
          {title}
        </h3>

        <div className="flex items-center gap-4 mb-6">
          <span className="font-serif text-5xl" style={{ color: colors.accent }}>
            {dateObj.day}
          </span>
          <div className="flex flex-col text-left text-sm uppercase tracking-wider opacity-80">
            <span>{dateObj.monthYear.split(' ')[0]}</span>
            <span>{dateObj.monthYear.split(' ')[1]}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 text-sm opacity-90">
          <Clock size={16} color={colors.accent} />
          <span>{eventData.time || '10:00 - Selesai'}</span>
        </div>

        <p className="font-bold text-lg mb-2" style={{ color: colors.text }}>
          {eventData.location || 'Nama Venue Belum Ditentukan'}
        </p>
        <p className="text-sm opacity-70 mb-8 max-w-xs leading-relaxed">
          {eventData.address || 'Alamat lengkap akan diperbarui'}
        </p>

        {eventData.mapUrl && (
          <a 
            href={eventData.mapUrl} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 px-6 py-2 rounded-full font-sans text-xs tracking-widest uppercase transition-all"
            style={{ border: `1px solid ${colors.accent}`, color: colors.accent }}
          >
            <MapPin size={14} />
            Petunjuk Lokasi
          </a>
        )}
      </motion.div>
    )
  }

  return (
    <section className="w-full py-16 px-6" style={{ backgroundColor: colors.bg }}>
      <div className="max-w-md mx-auto flex flex-col items-center">
        {renderEventCard(akadEvent, 'Akad Nikah', 'left')}
        {(akadEvent && baralekEvent) && <DividerMinang color={colors.accent} />}
        {renderEventCard(baralekEvent, 'Baralek', 'right')}
      </div>
    </section>
  )
}

const LoveStorySection = ({ data }) => {
  const stories = data?.loveStory || []
  if (stories.length === 0) return null

  return (
    <section className="w-full py-24 px-6 relative" style={{ backgroundColor: '#21140e' }}>
      <div className="max-w-md mx-auto">
        <motion.h3 
          className="font-serif text-3xl text-center mb-16"
          style={{ color: colors.accent }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Kisah Kami
        </motion.h3>

        <div className="relative">
          <div 
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px]" 
            style={{ backgroundColor: colors.accent, opacity: 0.5 }} 
          />

          {stories.map((story, i) => {
            const isEven = i % 2 === 0
            return (
              <motion.div 
                key={story.id || i}
                className={`flex w-full items-center justify-between mb-16 relative ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
                initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8 }}
              >
                <div 
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2" 
                  style={{ backgroundColor: colors.bg, borderColor: colors.accent, zIndex: 10 }}
                />

                <div className="w-5/12 flex justify-center">
                  {story.photo ? (
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden p-1" style={{ border: `1px solid ${colors.accent}` }}>
                      <img src={story.photo} alt={story.title} className="w-full h-full object-cover rounded-full" />
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-full border border-dashed flex items-center justify-center text-xs opacity-50" style={{ borderColor: colors.accent }}>
                      <Heart size={20} />
                    </div>
                  )}
                </div>

                <div className={`w-5/12 flex flex-col ${isEven ? 'text-left' : 'text-right'}`}>
                  <span className="font-serif italic text-sm mb-2" style={{ color: colors.accent }}>
                    {formatLoveStoryDate(story.date || story.year)}
                  </span>
                  <h4 className="font-bold text-lg mb-2 leading-tight" style={{ color: colors.text }}>
                    {story.title}
                  </h4>
                  <p className="text-xs opacity-80 leading-relaxed">
                    {story.story}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const GallerySection = ({ data }) => {
  const photos = data?.gallery || []
  if (photos.length === 0) return null

  return (
    <section className="w-full py-20 px-6" style={{ backgroundColor: colors.bg }}>
      <div className="max-w-md mx-auto">
        <motion.h3 
          className="font-serif text-3xl text-center mb-12"
          style={{ color: colors.accent }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Momen Kami
        </motion.h3>

        <div className="grid grid-cols-2 gap-3">
          {photos.map((photoUrl, i) => (
            <motion.div
              key={i}
              className="w-full aspect-square overflow-hidden cursor-pointer group"
              style={{ border: `1px solid ${colors.accent}` }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <img 
                src={photoUrl} 
                alt={`Gallery ${i+1}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const WishRsvpSection = ({ data, wishes, onSubmitWish }) => {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [attendance, setAttendance] = useState('hadir')
  const [pax, setPax] = useState('1')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !message) return
    setIsSubmitting(true)
    if (onSubmitWish) {
      await onSubmitWish({ name, message, attendance, pax })
    }
    setName('')
    setMessage('')
    setAttendance('hadir')
    setPax('1')
    setIsSubmitting(false)
  }

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des']
      return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`
    } catch {
      return isoString
    }
  }

  const recentWishes = (wishes || data?.rsvps || []).slice(0, 5)

  return (
    <section className="w-full py-20 px-6 relative" style={{ backgroundColor: '#21140e' }}>
      <div className="max-w-md mx-auto">
        <motion.h3 
          className="font-serif text-3xl text-center mb-12"
          style={{ color: colors.accent }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Sampaikan Doa &amp; Kehadiran
        </motion.h3>

        <motion.form 
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 mb-16 p-6 shadow-2xl relative"
          style={{ backgroundColor: '#2a1510', border: `1px solid ${colors.accent}40` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <CornerOrnament color={colors.accent} className="absolute top-0 left-0" />
          <CornerOrnament color={colors.accent} className="absolute top-0 right-0 rotate-90" />
          <CornerOrnament color={colors.accent} className="absolute bottom-0 right-0 rotate-180" />
          <CornerOrnament color={colors.accent} className="absolute bottom-0 left-0 -rotate-90" />

          <input 
            type="text" 
            placeholder="Nama Anda"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-transparent p-3 outline-none text-sm font-sans"
            style={{ borderBottom: `1px solid ${colors.accent}60`, color: colors.text }}
          />

          <textarea 
            placeholder="Tuliskan doa & ucapan..."
            required
            rows={4}
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full bg-transparent p-3 outline-none text-sm font-sans resize-none mt-2"
            style={{ border: `1px solid ${colors.accent}60`, color: colors.text }}
          />

          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer opacity-90">
              <input 
                type="radio" 
                name="attendance" 
                value="hadir" 
                checked={attendance === 'hadir'} 
                onChange={e => setAttendance(e.target.value)}
                className="accent-[#c0872a]"
              />
              Hadir
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer opacity-90">
              <input 
                type="radio" 
                name="attendance" 
                value="tidak_hadir" 
                checked={attendance === 'tidak_hadir'} 
                onChange={e => setAttendance(e.target.value)}
                className="accent-[#c0872a]"
              />
              Tidak Hadir
            </label>
          </div>

          <AnimatePresence>
            {attendance === 'hadir' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-1"
              >
                <select 
                  value={pax}
                  onChange={e => setPax(e.target.value)}
                  className="w-full bg-transparent p-3 outline-none text-sm font-sans appearance-none"
                  style={{ border: `1px solid ${colors.accent}60`, color: colors.text }}
                >
                  <option value="1" style={{ background: '#2a1510' }}>1 Orang</option>
                  <option value="2" style={{ background: '#2a1510' }}>2 Orang</option>
                  <option value="3" style={{ background: '#2a1510' }}>3 Orang</option>
                  <option value="4" style={{ background: '#2a1510' }}>4 Orang</option>
                  <option value="5+" style={{ background: '#2a1510' }}>5+ Orang</option>
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="mt-4 px-6 py-3 font-sans text-xs tracking-widest uppercase transition-all shadow-md hover:opacity-90 active:scale-95"
            style={{ 
              backgroundColor: colors.accent,
              color: colors.bg,
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Mengirim...' : 'Sampaikan Doa'}
          </button>
        </motion.form>

        {recentWishes.length > 0 && (
          <div className="flex flex-col gap-4">
            {recentWishes.map((wish, i) => (
              <motion.div 
                key={wish.id || i}
                className="p-4"
                style={{ backgroundColor: 'transparent', borderBottom: `1px solid ${colors.accent}40` }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold text-sm" style={{ color: colors.accent }}>{wish.name}</span>
                  <span className="text-[10px] opacity-60 uppercase tracking-wider">{formatDate(wish.createdAt || new Date().toISOString())}</span>
                </div>
                <p className="text-sm opacity-80 leading-relaxed font-sans">{wish.message || wish.wish}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

const FooterSection = ({ bride, groom }) => (
  <section 
    className="w-full flex flex-col items-center justify-center text-center relative overflow-hidden"
    style={{ backgroundColor: colors.bg, minHeight: '80vh' }}
  >
    <div className="absolute top-0 left-0 right-0 w-full z-10">
      <PucuakRabuangTop color={colors.secondary} />
    </div>
    
    <div className="flex-1 flex flex-col justify-center items-center px-8 z-20 py-24">
      <motion.h2 
        className="font-serif text-5xl mb-8"
        style={{ color: colors.accent }}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        Tarimo Kasih
      </motion.h2>

      <motion.p 
        className="text-sm opacity-80 leading-relaxed max-w-xs mb-8 font-sans"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
      </motion.p>

      <motion.p 
        className="text-sm font-serif italic mb-16 opacity-90"
        style={{ color: colors.accent }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        Wassalamu'alaikum Warahmatullahi Wabarakatuh
      </motion.p>

      <motion.h1 
        className="font-serif text-4xl mt-4"
        style={{ color: colors.accent }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
      >
        {bride} <span className="text-2xl mx-2">&amp;</span> {groom}
      </motion.h1>
    </div>

    <div className="absolute bottom-10 left-0 right-0 w-full z-10">
      <PucuakRabuangBottom color={colors.secondary} />
    </div>

    <div className="absolute bottom-3 text-[9px] opacity-40 font-sans tracking-[0.2em] z-20 uppercase">
      Dibuat dengan ♥ oleh Ulema
    </div>
  </section>
)

export default function MinangElegantTheme({
  data,
  countdown,
  opened,
  setOpened,
  animateClose,
  setAnimateClose,
  musicPlaying,
  setMusicPlaying,
  audioRef,
  wishes,
  onSubmitWish
}) {
  const groom = data?.groom?.nickname || 'Groom'
  const bride = data?.bride?.nickname || 'Bride'
  const akadEvent = data?.events?.[0]
  const baralekEvent = data?.events?.[1]
  const primaryEvent = akadEvent || {}

  const handleOpen = () => {
    setAnimateClose(true)
    setTimeout(() => {
      setOpened(true)
      if (audioRef?.current) {
        audioRef.current.play().catch(e => console.log('Autoplay blocked'))
        setMusicPlaying(true)
      }
    }, 800)
  }

  return (
    <InvitationLayout layout="minang-elegant" data={data}>
      <div 
        className="w-full relative min-h-screen flex flex-col overflow-x-hidden font-sans"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        <AnimatePresence>
          {!opened && <CoverSection key="cover" bride={bride} groom={groom} primaryEvent={primaryEvent} handleOpen={handleOpen} animateClose={animateClose} />}
        </AnimatePresence>

        {opened && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="flex flex-col w-full"
          >
            <ProfileSection data={data} />
            <CountdownSection countdown={countdown} primaryEvent={primaryEvent} groom={groom} bride={bride} />
            <EventsSection akadEvent={akadEvent} baralekEvent={baralekEvent} />
            <LoveStorySection data={data} />
            <GallerySection data={data} />
            <WishRsvpSection data={data} wishes={wishes} onSubmitWish={onSubmitWish} />
            <FooterSection bride={bride} groom={groom} />
          </motion.div>
        )}
      </div>
    </InvitationLayout>
  )
}
