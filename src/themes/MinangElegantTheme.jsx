import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Clock, MapPin } from 'lucide-react'
import InvitationLayout from './components/InvitationLayout'

// --- UTILITAS & WARNA ---
const colors = {
  bg: 'transparent',
  surface: 'rgba(253, 246, 238, 0.85)',
  text: '#4a2c2a',
  accent: '#a05a2c',
  secondary: '#8b1a1a',
}

const assets = {
  mobileBg: '/themes/Adat/theme-12/bg.jpeg',
  desktopBg: '/themes/Adat/theme-12/dekstop%20bg.jpeg',
  ampersand: '/themes/Adat/theme-12/06.png',
  frame: '/themes/Adat/theme-12/Frame%20bg.png',
  motion1: '/themes/Adat/theme-12/asset-motion-1.png',
  motion2: '/themes/Adat/theme-12/asset-motion-2.png',
  motion3: '/themes/Adat/theme-12/asset-motion-3.png',
  motion4: '/themes/Adat/theme-12/asset-motion-4.png',
  motion5: '/themes/Adat/theme-12/asset-motion-5.png',
}

const DividerMinang = ({ color }) => (
  <div className="w-full flex items-center justify-center my-12 opacity-60">
    <div className="flex-1 h-[1px]" style={{ backgroundColor: color }} />
    <img src={assets.ampersand} alt="divider" className="w-8 h-8 mx-4 object-contain opacity-50 grayscale" />
    <div className="flex-1 h-[1px]" style={{ backgroundColor: color }} />
  </div>
)

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

// --- ORNAMEN MELAYANG (BOTTOM CORNERS) ---
const FloatingOrnaments = () => (
  <div className="fixed bottom-0 left-0 right-0 h-64 pointer-events-none z-40 overflow-hidden">
    {/* Kiri Bawah */}
    <motion.img 
      src={assets.motion1} 
      className="absolute -bottom-10 -left-10 w-48 h-48 object-contain origin-bottom-left"
      animate={{ rotate: [-3, 3, -3], scale: [1, 1.05, 1] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.img 
      src={assets.motion3} 
      className="absolute bottom-10 -left-6 w-32 h-32 object-contain origin-bottom-left opacity-80"
      animate={{ rotate: [5, -2, 5], y: [0, -10, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Kanan Bawah */}
    <motion.img 
      src={assets.motion2} 
      className="absolute -bottom-10 -right-10 w-48 h-48 object-contain origin-bottom-right"
      animate={{ rotate: [3, -3, 3], scale: [1, 1.05, 1] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.img 
      src={assets.motion4} 
      className="absolute bottom-12 -right-8 w-36 h-36 object-contain origin-bottom-right opacity-80"
      animate={{ rotate: [-4, 4, -4], y: [0, -15, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
)

// --- KOMPONEN SECTION ---
const CoverSection = ({ animateClose, bride, groom, primaryEvent, handleOpen }) => (
  <motion.div 
    className="absolute inset-0 z-50 flex flex-col justify-center items-center overflow-hidden"
    style={{ color: colors.text }}
    animate={animateClose ? { y: '-100%', opacity: 0 } : { y: 0, opacity: 1 }}
    transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
  >
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 z-20 w-full bg-white/10 backdrop-blur-sm">
      <motion.p 
        className="uppercase tracking-[0.3em] text-xs font-sans mb-8 opacity-90 font-bold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Baralek Gadang
      </motion.p>

      <motion.h1 
        className="font-serif text-5xl sm:text-6xl mb-2"
        style={{ color: colors.secondary }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        {bride}
      </motion.h1>

      <motion.img 
        src={assets.ampersand} 
        alt="&" 
        className="w-16 h-16 object-contain my-2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
      />

      <motion.h1 
        className="font-serif text-5xl sm:text-6xl mt-2 mb-8"
        style={{ color: colors.secondary }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        {groom}
      </motion.h1>

      <motion.p 
        className="font-sans text-sm mb-12 opacity-90 font-bold tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {formatCoverDate(primaryEvent?.date)}
      </motion.p>

      <motion.button
        onClick={handleOpen}
        className="relative px-8 py-3 rounded-full font-sans text-xs tracking-widest uppercase transition-all overflow-hidden group shadow-md font-bold"
        style={{ 
          color: colors.surface, 
          backgroundColor: colors.secondary
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="relative z-10">Buka Undangan</span>
      </motion.button>
    </div>
  </motion.div>
)

const ProfileSection = ({ data }) => {
  const renderPerson = (person, type) => (
    <motion.div 
      className="flex flex-col items-center text-center w-full my-12 px-6 relative z-10"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8 }}
    >
      <p className="font-serif italic text-lg mb-6 font-bold" style={{ color: colors.secondary }}>
        {type === 'bride' ? 'Puti' : 'Sutan'}
      </p>
      
      <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
        {/* Frame ornamen di belakang */}
        <img 
          src={assets.frame} 
          alt="Frame" 
          className="absolute inset-0 w-full h-full object-contain scale-[1.15] z-0 drop-shadow-md" 
        />
        {/* Foto mempelai di DEPAN */}
        <div className="w-[75%] h-[75%] rounded-full overflow-hidden bg-stone-200 z-10 shadow-lg border-4 border-white/50">
          {person?.photo ? (
            <img src={person.photo} alt={person.nickname} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-500 text-sm">Foto {type === 'bride' ? 'Wanita' : 'Pria'}</div>
          )}
        </div>
      </div>

      <h2 className="font-serif text-3xl mb-2" style={{ color: colors.secondary }}>{person?.nickname}</h2>
      <p className="text-lg mb-2 font-bold tracking-wide" style={{ color: colors.text }}>{person?.name}</p>
      <p className="text-sm opacity-90 leading-relaxed max-w-xs font-medium">
        Putra dari Bpk. {person?.father} <br/> &amp; Ibu {person?.mother}
      </p>
      {person?.instagram && (
        <a href={`https://instagram.com/${person.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" 
           className="mt-5 text-xs tracking-wider uppercase border-b pb-1 hover:opacity-100 transition-opacity font-bold"
           style={{ borderColor: colors.accent, color: colors.accent }}>
          Instagram
        </a>
      )}
    </motion.div>
  )

  return (
    <section className="w-full py-20 mt-12 relative" style={{ backgroundColor: colors.surface }}>
      <div className="max-w-md mx-auto">
        <motion.div 
          className="w-full flex justify-center mb-4 relative z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <img src={assets.motion5} alt="Ornament Top" className="h-20 object-contain drop-shadow-md" />
        </motion.div>

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
    <section className="w-full py-24 px-6 relative flex flex-col items-center border-y" style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderColor: colors.accent }}>
      <motion.h3 
        className="font-serif text-3xl text-center mb-12"
        style={{ color: colors.secondary }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Menuju Hari Bahagia
      </motion.h3>

      <div className="flex gap-4 justify-center mb-16 relative z-10">
        {timeBlocks.map((block, i) => (
          <motion.div 
            key={block.label}
            className="relative w-[4.5rem] h-24 flex flex-col items-center justify-center bg-white/80 shadow-md rounded-md"
            style={{ border: `1px solid ${colors.accent}60` }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
          >
            <span className="font-serif text-3xl mb-1 font-bold" style={{ color: colors.secondary }}>
              {block.value.toString().padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-widest opacity-80 font-bold" style={{ color: colors.text }}>
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
          className="relative z-10 px-8 py-3 rounded-full font-sans text-xs tracking-widest uppercase transition-all shadow-lg font-bold"
          style={{ 
            backgroundColor: colors.secondary,
            color: '#fff'
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
        className="relative w-full p-8 flex flex-col items-center text-center my-8 shadow-xl bg-white/95 rounded-lg z-10"
        style={{ border: `1px solid ${colors.accent}60` }}
        initial={{ opacity: 0, x: direction === 'left' ? -30 : 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="font-serif text-3xl mb-6 font-bold" style={{ color: colors.secondary }}>
          {title}
        </h3>

        <div className="flex items-center gap-4 mb-6">
          <span className="font-serif text-5xl font-bold" style={{ color: colors.accent }}>
            {dateObj.day}
          </span>
          <div className="flex flex-col text-left text-sm uppercase tracking-wider opacity-90 font-bold">
            <span style={{ color: colors.text }}>{dateObj.monthYear.split(' ')[0]}</span>
            <span style={{ color: colors.text }}>{dateObj.monthYear.split(' ')[1]}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 text-sm font-bold" style={{ color: colors.text }}>
          <Clock size={16} color={colors.accent} />
          <span>{eventData.time || '10:00 - Selesai'}</span>
        </div>

        <p className="font-bold text-lg mb-2" style={{ color: colors.secondary }}>
          {eventData.location || 'Nama Venue Belum Ditentukan'}
        </p>
        <p className="text-sm opacity-90 mb-8 max-w-xs leading-relaxed font-medium" style={{ color: colors.text }}>
          {eventData.address || 'Alamat lengkap akan diperbarui'}
        </p>

        {eventData.mapUrl && (
          <a 
            href={eventData.mapUrl} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 px-6 py-2 rounded-full font-sans text-xs tracking-widest uppercase transition-all font-bold bg-stone-50 hover:bg-stone-100"
            style={{ border: `1px solid ${colors.secondary}`, color: colors.secondary }}
          >
            <MapPin size={14} />
            Petunjuk Lokasi
          </a>
        )}
      </motion.div>
    )
  }

  return (
    <section className="w-full py-16 px-6 relative" style={{ backgroundColor: colors.surface }}>
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
    <section className="w-full py-24 px-6 relative" style={{ backgroundColor: 'rgba(255,255,255,0.75)' }}>
      <div className="max-w-md mx-auto relative z-10">
        <motion.h3 
          className="font-serif text-3xl text-center mb-16 font-bold"
          style={{ color: colors.secondary }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Kisah Kami
        </motion.h3>

        <div className="relative">
          <div 
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px]" 
            style={{ backgroundColor: colors.accent, opacity: 0.3 }} 
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
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 shadow-sm" 
                  style={{ backgroundColor: '#fff', borderColor: colors.secondary, zIndex: 10 }}
                />

                <div className="w-5/12 flex justify-center">
                  {story.photo ? (
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden p-1 bg-white shadow-md" style={{ border: `1px solid ${colors.accent}` }}>
                      <img src={story.photo} alt={story.title} className="w-full h-full object-cover rounded-full" />
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-full border border-dashed flex items-center justify-center text-xs bg-white/80" style={{ borderColor: colors.accent }}>
                      <Heart size={20} color={colors.secondary} />
                    </div>
                  )}
                </div>

                <div className={`w-5/12 flex flex-col ${isEven ? 'text-left' : 'text-right'}`}>
                  <span className="font-serif italic text-sm mb-2 font-bold" style={{ color: colors.accent }}>
                    {formatLoveStoryDate(story.date || story.year)}
                  </span>
                  <h4 className="font-bold text-lg mb-2 leading-tight" style={{ color: colors.secondary }}>
                    {story.title}
                  </h4>
                  <p className="text-xs opacity-90 leading-relaxed font-semibold" style={{ color: colors.text }}>
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
    <section className="w-full py-20 px-6 relative" style={{ backgroundColor: colors.surface }}>
      <div className="max-w-md mx-auto relative z-10">
        <motion.h3 
          className="font-serif text-3xl text-center mb-12 font-bold"
          style={{ color: colors.secondary }}
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
              className="w-full aspect-square overflow-hidden cursor-pointer group rounded-sm shadow-md"
              style={{ border: `2px solid #fff` }}
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
    <section className="w-full py-20 px-6 relative border-t" style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderColor: colors.accent }}>
      <div className="max-w-md mx-auto relative z-10">
        <motion.h3 
          className="font-serif text-3xl text-center mb-12 font-bold"
          style={{ color: colors.secondary }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Sampaikan Doa &amp; Kehadiran
        </motion.h3>

        <motion.form 
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 mb-16 p-8 shadow-xl bg-white rounded-lg"
          style={{ border: `1px solid ${colors.accent}40` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <input 
            type="text" 
            placeholder="Nama Anda"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-transparent p-3 outline-none text-sm font-sans font-bold"
            style={{ borderBottom: `2px solid ${colors.accent}60`, color: colors.text }}
          />

          <textarea 
            placeholder="Tuliskan doa & ucapan..."
            required
            rows={4}
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full bg-stone-50 p-3 outline-none text-sm font-sans resize-none mt-2 rounded-md font-medium shadow-inner"
            style={{ border: `1px solid ${colors.accent}60`, color: colors.text }}
          />

          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer font-bold opacity-90" style={{ color: colors.text }}>
              <input 
                type="radio" 
                name="attendance" 
                value="hadir" 
                checked={attendance === 'hadir'} 
                onChange={e => setAttendance(e.target.value)}
                className="accent-[#8b1a1a]"
              />
              Hadir
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer font-bold opacity-90" style={{ color: colors.text }}>
              <input 
                type="radio" 
                name="attendance" 
                value="tidak_hadir" 
                checked={attendance === 'tidak_hadir'} 
                onChange={e => setAttendance(e.target.value)}
                className="accent-[#8b1a1a]"
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
                  className="w-full p-3 outline-none text-sm font-sans appearance-none rounded-md font-bold bg-stone-50"
                  style={{ border: `1px solid ${colors.accent}60`, color: colors.text }}
                >
                  <option value="1">1 Orang</option>
                  <option value="2">2 Orang</option>
                  <option value="3">3 Orang</option>
                  <option value="4">4 Orang</option>
                  <option value="5+">5+ Orang</option>
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="mt-4 px-6 py-3 font-sans text-xs tracking-widest uppercase transition-all shadow-md hover:opacity-90 active:scale-95 rounded-full font-bold"
            style={{ 
              backgroundColor: colors.secondary,
              color: '#fff',
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
                className="p-4 bg-white/60 rounded-lg shadow-sm"
                style={{ borderLeft: `4px solid ${colors.secondary}` }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold text-sm" style={{ color: colors.secondary }}>{wish.name}</span>
                  <span className="text-[10px] opacity-80 uppercase tracking-wider font-bold" style={{ color: colors.text }}>{formatDate(wish.createdAt || new Date().toISOString())}</span>
                </div>
                <p className="text-sm opacity-90 leading-relaxed font-sans font-medium" style={{ color: colors.text }}>{wish.message || wish.wish}</p>
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
    style={{ backgroundColor: colors.surface, minHeight: '60vh' }}
  >
    <div className="flex-1 flex flex-col justify-center items-center px-8 z-20 py-24">
      <motion.h2 
        className="font-serif text-5xl mb-8"
        style={{ color: colors.secondary }}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        Tarimo Kasih
      </motion.h2>

      <motion.p 
        className="text-sm opacity-90 leading-relaxed max-w-xs mb-8 font-sans font-bold"
        style={{ color: colors.text }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
      </motion.p>

      <motion.p 
        className="text-sm font-serif italic mb-16 font-bold"
        style={{ color: colors.secondary }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        Wassalamu'alaikum Warahmatullahi Wabarakatuh
      </motion.p>

      <motion.div 
        className="flex items-center gap-4 mt-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
      >
        <h1 className="font-serif text-3xl font-bold" style={{ color: colors.secondary }}>{bride}</h1>
        <img src={assets.ampersand} alt="&" className="w-10 h-10 object-contain" />
        <h1 className="font-serif text-3xl font-bold" style={{ color: colors.secondary }}>{groom}</h1>
      </motion.div>
    </div>

    <div className="absolute bottom-3 text-[9px] font-bold font-sans tracking-[0.2em] z-20 uppercase" style={{ color: colors.text }}>
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
    <InvitationLayout layout="minang-elegant" data={data} bgUrl={assets.desktopBg}>
      <div 
        className="w-full relative min-h-screen flex flex-col overflow-x-hidden font-sans"
        style={{ 
          backgroundImage: `url('${assets.mobileBg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          color: colors.text 
        }}
      >
        {opened && <FloatingOrnaments />}

        <AnimatePresence>
          {!opened && <CoverSection key="cover" bride={bride} groom={groom} primaryEvent={primaryEvent} handleOpen={handleOpen} animateClose={animateClose} />}
        </AnimatePresence>

        {opened && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="flex flex-col w-full relative z-10"
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
