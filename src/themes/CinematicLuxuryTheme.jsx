import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Gift, MessageSquare, ExternalLink, Play, Pause, ChevronDown, Copy } from 'lucide-react'
import { MUSIC_URLS, getEmbedUrl } from '../pages/InvitationTemplate'
import InvitationLayout from './components/InvitationLayout'

import { getThemes } from '../hooks/useSharedInvitation'

// Generic Reveal Component for smooth scroll animations
const FadeUp = ({ children, delay = 0, duration = 0.8, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
)

export default function CinematicLuxuryTheme({
  data, primaryColor, accentColor, bgColor, guestName, countdown,
  opened, setOpened, animateClose, setAnimateClose,
  musicPlaying, setMusicPlaying, scrolled, handleScroll,
  wishes, handleRsvpSubmit, rsvpName, setRsvpName, rsvpWish, setRsvpWish, rsvpStatus, setRsvpStatus, rsvpSent,
  copied, copyAccount, showGifts, setShowGifts,
  primaryEvent, audioRef
}) {
  const meta = data.meta || {}
  
  // Ambil konfigurasi tema aktif
  const themes = getThemes()
  const activeTheme = themes.find(t => t.id === data.themeId)
  const isVideo = activeTheme?.themeType === 'video' || Boolean(meta.coverVideo)

  const coverVideo = meta.coverVideo || ''
  const coverPhoto = meta.coverPhoto || data.groom?.photo || data.bride?.photo || '/avatars/placeholder.svg'
  
  const luxBg = '#0a0a0a'
  const luxCard = '#141414'
  const luxGold = '#DDC497'
  const luxText = '#ffffff'
  const luxMuted = 'rgba(255,255,255,0.6)'

  if (!opened) {
    return (
      <AnimatePresence>
        {!animateClose && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
            style={{ backgroundColor: luxBg }}
          >
            <div className="absolute inset-0 pointer-events-none opacity-50">
              {isVideo && coverVideo ? (
                <video src={coverVideo} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              ) : (
                <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover scale-105" />
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.8) 100%)' }} />
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="relative z-10 flex flex-col items-center text-center px-6"
            >
              <h3 className="font-serif italic text-sm md:text-base mb-6 tracking-[0.2em]" style={{ color: luxGold }}>
                THE WEDDING OF
              </h3>
              <h1 className="font-serif text-5xl md:text-7xl mb-4 tracking-wider" style={{ color: luxText, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                {data.groom?.nickname} <br/> <span className="text-3xl md:text-5xl my-2 inline-block" style={{ color: luxGold }}>&</span> <br/> {data.bride?.nickname}
              </h1>
              
              <div className="h-12 border-l border-dashed my-8" style={{ borderColor: luxGold, opacity: 0.5 }} />

              <div className="mb-12">
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: luxMuted }}>Kpd Yth. Bapak/Ibu/Saudara/i</p>
                <p className="text-lg md:text-xl font-bold font-serif" style={{ color: luxText }}>{guestName || 'Tamu Undangan'}</p>
              </div>

              <button
                onClick={() => {
                  setAnimateClose(true)
                  setTimeout(() => setOpened(true), 1200)
                  setMusicPlaying(true)
                  if (audioRef.current) audioRef.current.play()
                }}
                className="group relative px-10 py-4 rounded-full overflow-hidden transition-all duration-500 hover:scale-105"
                style={{ backgroundColor: luxGold, color: '#0a0a0a' }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                <span className="relative z-10 flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
                  <Play size={14} fill="currentColor" /> Buka Undangan
                </span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <InvitationLayout layout="dark-luxury" data={data} primaryColor={primaryColor} accentColor={luxGold} bgColor={luxBg} primaryEvent={primaryEvent}>
      <div 
        className="w-full relative min-h-screen flex flex-col overflow-x-hidden font-sans"
        style={{ backgroundColor: luxBg, color: luxText }}
        onScroll={handleScroll}
      >
        {data.music !== false && (
          <audio ref={audioRef} src={data.musicUrl || MUSIC_URLS[data.musicId || 1] || MUSIC_URLS[1]} loop />
        )}

        <button
          onClick={() => setMusicPlaying(p => !p)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 hover:scale-110"
          style={{ backgroundColor: 'rgba(20,20,20,0.8)', borderColor: 'rgba(221,196,151,0.3)' }}
        >
          {musicPlaying ? <Pause size={16} color={luxGold} /> : <Play size={16} color={luxGold} className="ml-1" />}
        </button>

        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {isVideo && coverVideo ? (
              <video src={coverVideo} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.1) 0%, #0a0a0a 100%)' }} />
          </div>

          <FadeUp className="relative z-10 w-full max-w-lg mx-auto">
            <h3 className="font-serif italic text-sm tracking-[0.3em] mb-8" style={{ color: luxGold }}>THE WEDDING OF</h3>
            <h1 className="font-serif text-5xl md:text-7xl mb-6 tracking-wide" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
              {data.groom?.nickname}
              <span className="block my-2 text-3xl md:text-5xl" style={{ color: luxGold }}>&</span>
              {data.bride?.nickname}
            </h1>
            
            {primaryEvent && (
              <div className="mt-8 flex flex-col items-center">
                <p className="text-sm tracking-[0.2em] uppercase" style={{ color: luxMuted }}>
                  {primaryEvent.dateLabel || primaryEvent.date || 'Rabu, 26 November 2025'}
                </p>
                {data.countdownEnabled && countdown && (
                  <div className="flex gap-4 mt-8">
                    {[{ l: 'Hari', v: countdown.d }, { l: 'Jam', v: countdown.h }, { l: 'Menit', v: countdown.m }, { l: 'Detik', v: countdown.s }].map((c, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-2xl font-serif" style={{ color: luxGold }}>{c.v < 10 ? `0${c.v}` : c.v}</span>
                        <span className="text-[9px] tracking-widest uppercase mt-1" style={{ color: luxMuted }}>{c.l}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="absolute bottom-[-10vh] left-1/2 -translate-x-1/2 animate-bounce">
              <ChevronDown size={24} color={luxGold} opacity={0.5} />
            </div>
          </FadeUp>
        </section>

        <section className="relative py-24 px-6 text-center z-10" style={{ backgroundColor: luxBg }}>
          <FadeUp className="max-w-xl mx-auto">
            <h2 className="font-serif text-2xl mb-8" style={{ color: luxGold }}>Walimatul 'Ursy</h2>
            <p className="text-sm leading-loose font-light" style={{ color: luxMuted }}>
              {data.quote || "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."}
            </p>
            {!data.quote && <p className="text-xs mt-4 font-serif italic" style={{ color: luxGold }}>QS. Ar-Rum: 21</p>}
          </FadeUp>
        </section>

        <section className="py-24 px-6 relative">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, ${luxGold} 0%, transparent 60%)` }} />
          <div className="max-w-lg mx-auto relative z-10 space-y-24">
            <FadeUp className="flex flex-col items-center text-center">
              <div className="w-48 h-64 mb-8 relative p-2 border" style={{ borderColor: 'rgba(221,196,151,0.2)' }}>
                <div className="w-full h-full overflow-hidden">
                  <img src={data.groom?.photo || '/avatars/placeholder.svg'} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700" alt="Groom" />
                </div>
              </div>
              <h2 className="font-serif text-3xl mb-2" style={{ color: luxGold }}>{data.groom?.name}</h2>
              <p className="text-sm tracking-wide" style={{ color: luxMuted }}>Putra dari <br/> {data.groom?.father} & {data.groom?.mother}</p>
              {data.groom?.instagram && (
                <a href={`https://instagram.com/${data.groom.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="mt-4 text-xs tracking-widest border-b pb-1 transition-colors hover:text-white" style={{ borderColor: luxGold, color: luxGold }}>
                  {data.groom.instagram}
                </a>
              )}
            </FadeUp>

            <FadeUp className="flex justify-center">
              <span className="font-serif text-6xl" style={{ color: luxGold, opacity: 0.5 }}>&</span>
            </FadeUp>

            <FadeUp className="flex flex-col items-center text-center">
              <div className="w-48 h-64 mb-8 relative p-2 border" style={{ borderColor: 'rgba(221,196,151,0.2)' }}>
                <div className="w-full h-full overflow-hidden">
                  <img src={data.bride?.photo || '/avatars/placeholder.svg'} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700" alt="Bride" />
                </div>
              </div>
              <h2 className="font-serif text-3xl mb-2" style={{ color: luxGold }}>{data.bride?.name}</h2>
              <p className="text-sm tracking-wide" style={{ color: luxMuted }}>Putri dari <br/> {data.bride?.father} & {data.bride?.mother}</p>
              {data.bride?.instagram && (
                <a href={`https://instagram.com/${data.bride.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="mt-4 text-xs tracking-widest border-b pb-1 transition-colors hover:text-white" style={{ borderColor: luxGold, color: luxGold }}>
                  {data.bride.instagram}
                </a>
              )}
            </FadeUp>
          </div>
        </section>

        {data.events?.length > 0 && (
          <section className="py-24 px-4 bg-[#0d0d0d]">
            <FadeUp className="text-center mb-12">
              <h2 className="font-serif text-3xl tracking-widest uppercase" style={{ color: luxGold }}>Rangkaian Acara</h2>
              <div className="w-12 h-px mx-auto mt-4" style={{ backgroundColor: luxGold }} />
            </FadeUp>
            
            <div className="max-w-lg mx-auto space-y-8">
              {data.events.map((event, idx) => (
                <FadeUp key={idx} delay={idx * 0.2}>
                  <div className="relative p-8 overflow-hidden" style={{ backgroundColor: luxCard, border: '1px solid rgba(221,196,151,0.1)' }}>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Calendar size={100} color={luxGold} />
                    </div>
                    <div className="relative z-10 text-center">
                      <h3 className="font-serif text-2xl mb-4" style={{ color: luxGold }}>{event.title}</h3>
                      <p className="text-sm uppercase tracking-widest mb-1">{event.dateLabel || event.date}</p>
                      <p className="text-xs mb-6" style={{ color: luxMuted }}>Pukul {event.time}</p>
                      
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(221,196,151,0.3)] to-transparent my-6" />
                      
                      <p className="font-bold text-sm mb-2">{event.venue}</p>
                      <p className="text-xs leading-relaxed mb-8" style={{ color: luxMuted }}>{event.address}</p>
                      
                      {event.mapUrl && (
                        <a 
                          href={event.mapUrl} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 text-xs tracking-widest uppercase border transition-colors hover:bg-white hover:text-black"
                          style={{ borderColor: luxGold, color: luxGold }}
                        >
                          <MapPin size={14} /> Lihat Peta Lokasi
                        </a>
                      )}
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </section>
        )}

        {data.gallery?.length > 0 && (
          <section className="py-24 px-2">
            <FadeUp className="text-center mb-12">
              <h2 className="font-serif text-3xl tracking-widest uppercase" style={{ color: luxGold }}>Galeri Momen</h2>
              <div className="w-12 h-px mx-auto mt-4" style={{ backgroundColor: luxGold }} />
            </FadeUp>
            <div className="max-w-2xl mx-auto columns-2 gap-2 space-y-2">
              {data.gallery.map((photo, i) => (
                <FadeUp key={i} delay={(i % 4) * 0.1} className="break-inside-avoid">
                  <img src={photo.src} alt="Gallery" className="w-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700" />
                </FadeUp>
              ))}
            </div>
          </section>
        )}

        <section className="py-24 px-6 bg-[#0d0d0d]">
          <div className="max-w-lg mx-auto">
            {data.accounts?.length > 0 && (
              <FadeUp className="mb-20 text-center">
                <h2 className="font-serif text-3xl tracking-widest uppercase mb-4" style={{ color: luxGold }}>Tanda Kasih</h2>
                <p className="text-sm leading-relaxed mb-8" style={{ color: luxMuted }}>
                  Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda bermaksud memberikan tanda kasih, dapat melalui:
                </p>
                <div className="space-y-4">
                  {data.accounts.map((acc, i) => (
                    <div key={i} className="p-6 text-left" style={{ backgroundColor: luxCard, border: '1px solid rgba(221,196,151,0.1)' }}>
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: luxMuted }}>{acc.bank}</p>
                      <p className="font-serif text-2xl tracking-widest mb-1">{acc.no}</p>
                      <p className="text-sm" style={{ color: luxGold }}>a.n. {acc.name}</p>
                      <button 
                        onClick={() => copyAccount(acc.no)}
                        className="mt-4 flex items-center gap-2 text-xs uppercase tracking-widest hover:text-white transition-colors"
                        style={{ color: luxGold }}
                      >
                        <Copy size={12} /> {copied === acc.no ? 'Tersalin!' : 'Salin Nomor'}
                      </button>
                    </div>
                  ))}
                </div>
              </FadeUp>
            )}

            <FadeUp>
              <div className="p-8 text-center" style={{ backgroundColor: luxCard, border: '1px solid rgba(221,196,151,0.1)' }}>
                <h2 className="font-serif text-2xl tracking-widest uppercase mb-6" style={{ color: luxGold }}>Konfirmasi Kehadiran</h2>
                <form onSubmit={handleRsvpSubmit} className="space-y-4 text-left">
                  <div>
                    <input 
                      type="text" value={rsvpName} onChange={e => setRsvpName(e.target.value)} required
                      placeholder="Nama Lengkap" 
                      className="w-full bg-transparent border-b px-2 py-3 text-sm focus:outline-none transition-colors"
                      style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                  </div>
                  <div>
                    <textarea 
                      value={rsvpWish} onChange={e => setRsvpWish(e.target.value)} required rows="3"
                      placeholder="Berikan ucapan atau doa restu" 
                      className="w-full bg-transparent border-b px-2 py-3 text-sm focus:outline-none transition-colors resize-none"
                      style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                  </div>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="status" value="Hadir" checked={rsvpStatus === 'Hadir'} onChange={e => setRsvpStatus(e.target.value)} className="accent-[#DDC497]" /> Hadir
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="status" value="Tidak Hadir" checked={rsvpStatus === 'Tidak Hadir'} onChange={e => setRsvpStatus(e.target.value)} className="accent-[#DDC497]" /> Tidak Hadir
                    </label>
                  </div>
                  <button 
                    type="submit" 
                    className="w-full mt-6 py-4 text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-neutral-200 transition-colors"
                  >
                    {rsvpSent ? 'Terkirim!' : 'Kirim Ucapan'}
                  </button>
                </form>

                {wishes?.length > 0 && (
                  <div className="mt-12 text-left">
                    <h3 className="font-serif text-xl mb-6 text-center" style={{ color: luxGold }}>Ucapan & Doa</h3>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      {wishes.map((w, i) => (
                        <div key={i} className="p-4" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderLeft: `2px solid ${luxGold}` }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-sm">{w.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: w.status === 'Hadir' ? 'rgba(221,196,151,0.2)' : 'rgba(255,255,255,0.1)', color: w.status === 'Hadir' ? luxGold : '#999' }}>
                              {w.status}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: luxMuted }}>{w.wish}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </FadeUp>
          </div>
        </section>

        <section className="py-24 px-6 text-center">
          <FadeUp>
            <p className="text-sm mb-4" style={{ color: luxMuted }}>Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.</p>
            <p className="text-xs uppercase tracking-widest mb-12" style={{ color: luxGold }}>Kami yang berbahagia</p>
            <h1 className="font-serif text-4xl mb-4">{data.groom?.nickname} & {data.bride?.nickname}</h1>
            <p className="text-xs mt-12" style={{ color: luxMuted }}>Created with Ulema.app</p>
          </FadeUp>
        </section>
      </div>
    </InvitationLayout>
  )
}
