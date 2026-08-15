import React, { useEffect } from 'react'
import { waLink } from '../../config/constants'

export default function LandingHowItWorks() {
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
    return () => observer.disconnect()
  }, [])

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <div className="section-badge-teal inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-wider uppercase">
            Cara Kerja
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-3">3 Langkah Mudah</h2>
          <p className="text-gray-500 text-sm sm:text-base">Undanganmu siap dalam hitungan menit, bukan hari.</p>
        </div>

        {/* Steps */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-0 reveal">
          {/* Step 1 */}
          <div className="flex-1 text-center flex flex-col items-center">
            <div className="relative w-16 h-16 grad-teal rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-teal-200">
              <span className="text-2xl">🎨</span>
              <div className="absolute -top-2 -right-2 w-6 h-6 grad-gold rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Pilih Tema</h3>
            <p className="text-gray-500 text-sm max-w-[180px]">Jelajahi katalog dan pilih desain yang paling cocok untukmu.</p>
          </div>
          {/* Connector */}
          <div className="step-line hidden md:block"></div>
          {/* Step 2 */}
          <div className="flex-1 text-center flex flex-col items-center">
            <div className="relative w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-200">
              <span className="text-2xl">💳</span>
              <div className="absolute -top-2 -right-2 w-6 h-6 grad-gold rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Selesaikan Pembayaran</h3>
            <p className="text-gray-500 text-sm max-w-[200px]">Bayar dengan mudah via transfer bank, QRIS, atau dompet digital.</p>
          </div>
          {/* Connector */}
          <div className="step-line hidden md:block"></div>
          {/* Step 3 */}
          <div className="flex-1 text-center flex flex-col items-center">
            <div className="relative w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-rose-200">
              <span className="text-2xl">✍️</span>
              <div className="absolute -top-2 -right-2 w-6 h-6 grad-gold rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Isi Data di Dashboard</h3>
            <p className="text-gray-500 text-sm max-w-[200px]">Masukkan data pasangan, tanggal acara, lokasi, dan langsung sebar!</p>
          </div>
        </div>

        {/* CTA below steps */}
        <div className="text-center mt-14 reveal">
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 grad-gold text-[#151B23] font-bold px-8 py-4 rounded-full shadow-lg hover:opacity-90 hover:scale-105 transition-all" style={{ boxShadow: '0 8px 32px rgba(221,196,151,0.35)' }}>
            Mulai Sekarang &rarr;
          </a>
        </div>
      </div>
    </section>
  )
}
