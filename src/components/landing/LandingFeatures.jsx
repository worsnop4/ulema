import React, { useEffect, useState } from 'react'

const AnimatedCounter = ({ target, start, duration = 2000 }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return

    let startTime
    let animationFrame

    const update = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(eased * target)

      setCount(current)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(update)
      }
    }

    animationFrame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(animationFrame)
  }, [target, start, duration])

  return <span>{start ? count.toLocaleString('en-US') : target.toLocaleString('en-US')}</span>
}

export default function LandingFeatures() {
  const [promoTime, setPromoTime] = useState({ hours: '00', minutes: '00', seconds: '00' })
  const [statsStarted, setStatsStarted] = useState(false)

  useEffect(() => {
    const now = new Date()
    const promoEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0)

    const updateCountdown = () => {
      const diff = promoEnd - new Date()
      if (diff <= 0) return

      const totalSeconds = Math.floor(diff / 1000)
      const hours = Math.floor(totalSeconds / 3600) % 24
      const minutes = Math.floor(totalSeconds / 60) % 60
      const seconds = totalSeconds % 60

      setPromoTime({
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  // Scroll reveal logic
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          observer.unobserve(e.target)
        }
      })
    }, { threshold: 0.1 })

    revealEls.forEach(el => observer.observe(el))

    const statsEl = document.getElementById('stats-counter-section')
    let statsObserver
    if (statsEl) {
      statsObserver = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
          setStatsStarted(true)
          statsObserver.disconnect()
        }
      }, { threshold: 0.2 })
      statsObserver.observe(statsEl)
    }

    return () => {
      observer.disconnect()
      if (statsObserver) statsObserver.disconnect()
    }
  }, [])

  // Invitation Ornament Line Divider component (reusable inline)
  const OrnamentDivider = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', background: '#F4F6F5' }}>
      {/* Left side */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#DDC497', flexShrink: 0 }}></div>
        <div style={{ flex: 1, height: 1.5, background: 'linear-gradient(to right,#DDC497,rgba(221,196,151,0.3))' }}></div>
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0, margin: '0 4px' }}>
          <polygon points="7,1 13,7 7,13 1,7" fill="none" stroke="#DDC497" strokeWidth="1.5" />
          <polygon points="7,4 10,7 7,10 4,7" fill="#DDC497" opacity="0.5" />
        </svg>
        <div style={{ flex: 1, height: 1.5, background: 'linear-gradient(to right,rgba(221,196,151,0.3),#DDC497)' }}></div>
      </div>
      {/* Center floral ornament */}
      <div style={{ flexShrink: 0, margin: '0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="10" height="10" viewBox="0 0 14 14">
          <polygon points="7,1 13,7 7,13 1,7" fill="none" stroke="#DDC497" strokeWidth="1.5" />
        </svg>
        <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
          <path d="M20 4 Q22 14 20 20 Q18 14 20 4Z" fill="#DDC497" />
          <path d="M20 20 Q22 26 20 36 Q18 26 20 20Z" fill="#DDC497" />
          <path d="M4 20 Q14 22 20 20 Q14 18 4 20Z" fill="#DDC497" />
          <path d="M20 20 Q26 22 36 20 Q26 18 20 20Z" fill="#DDC497" />
          <path d="M8.5 8.5 Q14 14 20 20" stroke="#C4A771" strokeWidth="1" opacity="0.7" />
          <path d="M20 20 Q26 26 31.5 31.5" stroke="#C4A771" strokeWidth="1" opacity="0.7" />
          <path d="M31.5 8.5 Q26 14 20 20" stroke="#C4A771" strokeWidth="1" opacity="0.7" />
          <path d="M20 20 Q14 26 8.5 31.5" stroke="#C4A771" strokeWidth="1" opacity="0.7" />
          <circle cx="20" cy="20" r="4" fill="#C4A771" />
          <circle cx="20" cy="20" r="2" fill="#fff" opacity="0.6" />
        </svg>
        <svg width="10" height="10" viewBox="0 0 14 14">
          <polygon points="7,1 13,7 7,13 1,7" fill="none" stroke="#DDC497" strokeWidth="1.5" />
        </svg>
      </div>
      {/* Right side */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: 1, height: 1.5, background: 'linear-gradient(to left,rgba(221,196,151,0.3),#DDC497)' }}></div>
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0, margin: '0 4px' }}>
          <polygon points="7,1 13,7 7,13 1,7" fill="none" stroke="#DDC497" strokeWidth="1.5" />
          <polygon points="7,4 10,7 7,10 4,7" fill="#DDC497" opacity="0.5" />
        </svg>
        <div style={{ flex: 1, height: 1.5, background: 'linear-gradient(to left,#DDC497,rgba(221,196,151,0.3))' }}></div>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#DDC497', flexShrink: 0 }}></div>
      </div>
    </div>
  )

  return (
    <>
      {/* URGENCY / PROMO BANNER */}
      <section id="promo" className="relative pb-16 px-4 bg-cream-dark text-center z-20">

        {/* Floating Stats Container */}
        <div className="max-w-3xl mx-auto relative z-30 -mt-16 md:-mt-28 mb-12">
          {/* Stats Container Card — WHITE background, dark text */}
          <div className="relative overflow-hidden rounded-[32px] bg-white shadow-xl px-6 pt-8 pb-8 text-center reveal" id="stats-counter-section">
            {/* Thin gold top border accent */}
            <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: 'linear-gradient(to right,transparent,#DDC497 30%,#C4A771 50%,#DDC497 70%,transparent)' }}></div>

            {/* Text row */}
            <p className="text-gray-700 text-sm sm:text-base font-normal leading-relaxed mb-5 px-2">
              Buat undangan-mu sendiri <strong className="font-bold text-gray-900">langsung jadi</strong><br />
              <strong className="font-bold text-gray-900">tanpa antri</strong>, siap disebar dalam hitungan menit !
            </p>

            {/* Ornament divider between text and stats */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right,transparent,#DDC497)' }}></div>
              <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
                <path d="M20 4 Q22 12 20 20 Q18 12 20 4Z" fill="#DDC497" />
                <path d="M20 20 Q22 28 20 36 Q18 28 20 20Z" fill="#DDC497" />
                <path d="M4 20 Q12 22 20 20 Q12 18 4 20Z" fill="#DDC497" />
                <path d="M20 20 Q28 22 36 20 Q28 18 20 20Z" fill="#DDC497" />
                <circle cx="20" cy="20" r="3" fill="#C4A771" />
              </svg>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left,transparent,#DDC497)' }}></div>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-10 sm:gap-20">
              <div className="text-center">
                <span className="block text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-serif">
                  <AnimatedCounter target={13791} start={statsStarted} />
                </span>
                <span className="block text-xs text-gray-400 font-medium mt-1">Undangan Dibuat</span>
              </div>
              {/* Vertical separator */}
              <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom,transparent,#DDC497,transparent)' }}></div>
              <div className="text-center">
                <span className="block text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-serif">
                  <AnimatedCounter target={2123974} start={statsStarted} />
                </span>
                <span className="block text-xs text-gray-400 font-medium mt-1">Undangan Disebar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Promo Container Card */}
        <div className="max-w-4xl mx-auto relative z-20">
          <div className="relative overflow-hidden rounded-[40px] sm:rounded-[48px] grad-hero shadow-2xl px-6 py-10 text-center">
            {/* decorative lines */}
            <div className="absolute top-0 left-0 w-full h-1 grad-gold"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-[#DDC497] text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase">
                🔥 Penawaran Terbatas
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-1">PROMO BULAN INI</h2>
              <div className="text-5xl sm:text-6xl font-extrabold mb-2 text-grad font-serif">DISKON 50%</div>
              <p style={{ color: 'rgba(221,196,151,0.75)' }} className="text-sm mb-8">Harga spesial hanya untuk waktu terbatas. Jangan lewatkan kesempatan ini!</p>

              {/* Countdown */}
              <div className="flex items-center justify-center gap-3 sm:gap-5 mb-8">
                <div className="flex flex-col items-center">
                  <div className="glass rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                    <span className="countdown-digit font-serif text-3xl sm:text-4xl font-bold text-white">{promoTime.hours}</span>
                  </div>
                  <span style={{ color: 'rgba(221,196,151,0.8)' }} className="text-xs mt-2 font-medium uppercase tracking-wider">Jam</span>
                </div>
                <span className="text-gold text-3xl sm:text-4xl font-bold mb-6">:</span>
                <div className="flex flex-col items-center">
                  <div className="glass rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                    <span className="countdown-digit font-serif text-3xl sm:text-4xl font-bold text-white">{promoTime.minutes}</span>
                  </div>
                  <span style={{ color: 'rgba(221,196,151,0.8)' }} className="text-xs mt-2 font-medium uppercase tracking-wider">Menit</span>
                </div>
                <span className="text-gold text-3xl sm:text-4xl font-bold mb-6">:</span>
                <div className="flex flex-col items-center">
                  <div className="glass rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                    <span className="countdown-digit font-serif text-3xl sm:text-4xl font-bold text-white">{promoTime.seconds}</span>
                  </div>
                  <span style={{ color: 'rgba(221,196,151,0.8)' }} className="text-xs mt-2 font-medium uppercase tracking-wider">Detik</span>
                </div>
              </div>

              <a href="#catalog" className="inline-flex items-center gap-2 grad-gold text-[#151B23] font-bold px-8 py-4 rounded-full shadow-lg hover:opacity-90 hover:scale-105 transition-all text-base" style={{ boxShadow: '0 8px 32px rgba(221,196,151,0.4)' }}>
                🎉 Klaim Diskon Sekarang &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <div className="section-badge-teal inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-wider uppercase">Fitur Lengkap</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Semua yang Kamu Butuhkan<br /><span className="text-grad-teal">Sudah Ada di Sini</span></h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">Satu platform, fitur lengkap untuk undangan digital pernikahanmu yang berkesan.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="reveal feature-card group bg-gradient-to-br from-teal-50 to-white border border-teal-100 rounded-2xl p-5 hover:shadow-lg hover:border-teal-300 transition-all cursor-default">
              <div className="w-12 h-12 grad-teal rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">Sebar Tanpa Batas</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Kirim ke semua tamu tanpa batasan jumlah.</p>
            </div>

            <div className="reveal feature-card group bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-2xl p-5 hover:shadow-lg hover:border-amber-300 transition-all cursor-default">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">Custom Nama Tamu</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Personalisasi nama tamu di setiap undangan.</p>
            </div>

            <div className="reveal feature-card group bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-5 hover:shadow-lg hover:border-emerald-300 transition-all cursor-default">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">E-Amplop Digital</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Terima hadiah atau sumbangan via dompet digital.</p>
            </div>

            <div className="reveal feature-card group bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-5 hover:shadow-lg hover:border-blue-300 transition-all cursor-default">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">Navigasi Google Maps</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Tampilkan lokasi acara dengan peta interaktif.</p>
            </div>

            <div className="reveal feature-card group bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl p-5 hover:shadow-lg hover:border-purple-300 transition-all cursor-default">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">Kontrol Musik Latar</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Tambahkan lagu favorit sebagai backsound undangan.</p>
            </div>

            <div className="reveal feature-card group bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-2xl p-5 hover:shadow-lg hover:border-rose-300 transition-all cursor-default">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">Galeri Foto &amp; Video</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Tampilkan kenangan indah dalam galeri yang cantik.</p>
            </div>

            <div className="reveal feature-card group bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-5 hover:shadow-lg hover:border-indigo-300 transition-all cursor-default">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">RSVP &amp; Ucapan Doa</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Konfirmasi kehadiran &amp; kumpulkan ucapan tamu.</p>
            </div>

            <div className="reveal feature-card group bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl p-5 hover:shadow-lg hover:border-orange-300 transition-all cursor-default">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">Countdown Acara</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Hitung mundur menuju hari spesialmu secara live.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
