import React, { useState, useEffect } from 'react'

const BLANK = '/avatars/live-order/Pasangan%20blank.jpg'

const bookings = [
  { names: 'Angga & Lala', tag: 'Baru', desc: 'Telah booking untuk bulan Juli', time: '8m yang lalu', emoji: '💍', avatar: '/avatars/live-order/pasangan1.png' },
  { names: 'Rizky & Sinta', tag: '', desc: 'Telah booking untuk bulan Agustus', time: '15m yang lalu', emoji: '💐', avatar: '/avatars/live-order/pasangan2.png' },
  { names: 'Dian & Andi', tag: '', desc: 'Telah booking untuk bulan September', time: '23m yang lalu', emoji: '🌸', avatar: '/avatars/live-order/pasangan3.png' },
  { names: 'Fariz & Nadia', tag: 'Baru', desc: 'Telah booking untuk bulan Oktober', time: '31m yang lalu', emoji: '🌹', avatar: '/avatars/live-order/pasangan4.png' },
  { names: 'Hendra & Putri', tag: '', desc: 'Telah booking untuk bulan Juli', time: '45m yang lalu', emoji: '✨', avatar: '/avatars/live-order/pasangan5.png' },
  { names: 'Bagus & Maya', tag: 'Baru', desc: 'Telah booking untuk bulan November', time: '1j yang lalu', emoji: '💒', avatar: '/avatars/live-order/pasangan6.png' },
  { names: 'Yoga & Rini', tag: '', desc: 'Telah booking untuk bulan Desember', time: '1j yang lalu', emoji: '🎊', avatar: '/avatars/live-order/pasangan7.png' },
  { names: 'Teguh & Kartika', tag: '', desc: 'Telah booking untuk bulan Agustus', time: '2j yang lalu', emoji: '🌺', avatar: '/avatars/live-order/pasangan8.png' },
  { names: 'Surya & Wulan', tag: 'Baru', desc: 'Telah booking untuk bulan September', time: '2j yang lalu', emoji: '💫', avatar: '/avatars/live-order/pasangan9.png' },
  { names: 'Aldi & Dewi', tag: '', desc: 'Telah booking untuk bulan Oktober', time: '3j yang lalu', emoji: '🌷', avatar: '/avatars/live-order/pasangan10.png' },
  { names: 'Rafi & Fitri', tag: 'Baru', desc: 'Telah booking untuk bulan Januari', time: '3j yang lalu', emoji: '💝', avatar: '/avatars/live-order/pasangan11.png' },
  { names: 'Ivan & Ayu', tag: '', desc: 'Telah booking untuk bulan Februari', time: '4j yang lalu', emoji: '🌻', avatar: '/avatars/live-order/pasangan12.png' },
  { names: 'Mamat & Nisa', tag: 'Baru', desc: 'Telah booking untuk bulan Maret', time: '4j yang lalu', emoji: '💗', avatar: '/avatars/live-order/pasangan13.png' },
  { names: 'Budi & Sari', tag: '', desc: 'Telah booking untuk bulan April', time: '5j yang lalu', emoji: '🌼', avatar: BLANK },
  { names: 'Eko & Rina', tag: '', desc: 'Telah booking untuk bulan Mei', time: '5j yang lalu', emoji: '🎀', avatar: BLANK },
  { names: 'Dafa & Tiara', tag: 'Baru', desc: 'Telah booking untuk bulan Juni', time: '6j yang lalu', emoji: '💕', avatar: BLANK },
  { names: 'Arif & Mira', tag: '', desc: 'Telah booking untuk bulan Juli', time: '6j yang lalu', emoji: '🌙', avatar: BLANK },
  { names: 'Bayu & Citra', tag: 'Baru', desc: 'Telah booking untuk bulan Agustus', time: '7j yang lalu', emoji: '🌟', avatar: BLANK },
  { names: 'Reza & Laras', tag: '', desc: 'Telah booking untuk bulan September', time: '8j yang lalu', emoji: '🍃', avatar: BLANK },
  { names: 'Tomi & Yuni', tag: '', desc: 'Telah booking untuk bulan Oktober', time: '9j yang lalu', emoji: '🎊', avatar: BLANK },
]

export default function LandingHero() {
  const [activeBooking, setActiveBooking] = useState(null)
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    let bookingIndex = 0
    let loopTimeout
    let dismissTimeout
    let resetTimeout

    const triggerNextNotification = () => {
      setExiting(false)
      setActiveBooking(bookings[bookingIndex])
      setVisible(true)
      bookingIndex = (bookingIndex + 1) % bookings.length

      dismissTimeout = setTimeout(() => {
        setExiting(true)
        setVisible(false)
        resetTimeout = setTimeout(() => setExiting(false), 700)
      }, 4000)

      const intervals = [5500, 7000, 9000]
      loopTimeout = setTimeout(
        triggerNextNotification,
        intervals[Math.floor(Math.random() * intervals.length)]
      )
    }

    const initialTimeout = setTimeout(triggerNextNotification, 1500)
    return () => {
      clearTimeout(initialTimeout)
      clearTimeout(loopTimeout)
      clearTimeout(dismissTimeout)
      clearTimeout(resetTimeout)
    }
  }, [])

  return (
    <>
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="slide-bg slide-1"></div>
        <div className="slide-bg slide-2"></div>
        <div className="slide-bg slide-3"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-10 pointer-events-none"></div>

        <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-16">
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-xl">
            Undangan Digital<br />Express #1
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium mb-12 drop-shadow-md">
            Cepat, Mudah, dan Praktis
          </p>
          <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex justify-center items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold px-8 py-4 rounded-full transition-all hover:scale-[1.02] text-base backdrop-blur-md shadow-lg"
            >
              Konsultasi GRATIS !
            </a>
            <a
              href="#catalog"
              className="w-full inline-flex justify-center items-center gap-2 bg-[#DDC497] hover:bg-[#C4A771] text-gray-900 font-bold px-8 py-4 rounded-full transition-all hover:scale-[1.02] text-base shadow-lg"
            >
              Lihat Katalog Undangan
            </a>
          </div>
        </div>

        {/* Bottom Fade Gradient */}
        <div 
          className="absolute bottom-0 left-0 w-full h-48 md:h-72 z-10 pointer-events-none" 
          style={{ background: 'linear-gradient(to top, rgba(244,246,245,1) 0%, rgba(244,246,245,0.7) 40%, rgba(244,246,245,0) 100%)' }}
        ></div>
      </section>

      {/* Live Booking Notification */}
      <div className="fixed top-24 left-4 right-4 md:left-auto md:right-4 md:w-72 z-[9999] flex flex-col gap-2 pointer-events-none">
        {activeBooking && (
          <div
            className={`w-full bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.04)] p-2.5 flex gap-2.5 pointer-events-auto transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${visible
              ? 'translate-x-0 translate-y-0 opacity-100 scale-100'
              : exiting
                ? 'translate-x-full translate-y-0 opacity-0 scale-95'
                : '-translate-y-12 translate-x-0 opacity-0 scale-95'
              }`}
          >
            {/* Avatar with emoji badge */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/40 shadow-md bg-slate-200/30">
                <img
                  src={activeBooking.avatar}
                  alt={activeBooking.names}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = BLANK }}
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 text-[10px] leading-none bg-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm border border-white/60">
                {activeBooking.emoji}
              </span>
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-teal-800 tracking-wider uppercase">Ulema.id</span>
                <span className="text-[8px] text-gray-500 font-medium">{activeBooking.time}</span>
              </div>
              <h4 className="text-[11px] font-bold text-gray-900 mt-0.5 flex items-center gap-1.5">
                Booking Baru!
                {activeBooking.tag && (
                  <span className="bg-green-100 text-green-800 text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    {activeBooking.tag}
                  </span>
                )}
              </h4>
              <p className="text-[10px] text-gray-700 mt-0.5 leading-relaxed">
                <strong>{activeBooking.names}</strong> {activeBooking.desc.toLowerCase()}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
