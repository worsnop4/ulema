import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getThemes } from '../../hooks/useSharedInvitation'
import { fetchPricing } from '../../services/billingService'

export default function LandingCatalog() {
  const navigate = useNavigate()
  const [themes, setThemes] = useState(() => getThemes())
  const [pricing, setPricing] = useState({ Special: 99000, Adat: 110000, Motion: 140000, Luxury: 175000 })
  const [activeTab, setActiveTab] = useState('Special')

  useEffect(() => {
    const handleUpdate = () => setThemes(getThemes())
    window.addEventListener('local-storage-update', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('local-storage-update', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  // Authoritative prices from the DB (public-readable).
  useEffect(() => { fetchPricing().then(setPricing) }, [])

  const categories = [
    { id: 'Special', label: '⭐ SPECIAL' },
    { id: 'Luxury', label: '💎 LUXURY' },
    { id: 'Motion', label: '🎬 3D MOTION' },
    { id: 'Adat', label: '🪁 TEMA ADAT' },
  ]

  const getPriceByCategory = (cat) => {
    let p = pricing[cat] || 99000
    if (cat === 'Special' && !pricing.Special) p = 99000
    if (cat === 'Adat' && !pricing.Adat) p = 110000
    if (cat === 'Motion' && !pricing.Motion) p = 140000
    if (cat === 'Luxury' && !pricing.Luxury) p = 175000
    return {
      promo: `Rp ${(p / 1000).toLocaleString('id-ID')}k`,
      original: `Rp ${((p * 2) / 1000).toLocaleString('id-ID')}k`
    }
  }

  const filteredThemes = useMemo(() => {
    return themes.filter(t => t.category === activeTab)
  }, [themes, activeTab])

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
    return () => observer.disconnect()
  }, [filteredThemes])

  return (
    <section id="catalog" className="py-16 md:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 reveal">
          <div className="section-badge-teal inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-wider uppercase">
            Katalog Tema
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Pilih Tema Favoritmu</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
            Ratusan pilihan tema yang bisa disesuaikan dengan selera dan budayamu.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-10 overflow-x-auto pb-2" role="tablist">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`tab-btn flex-shrink-0 flex items-center gap-1.5 px-4 py-2 font-semibold text-sm transition-colors ${activeTab === cat.id ? 'active text-teal-700' : 'text-gray-600 hover:text-teal-700'}`}
              role="tab"
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Card Grids per tab */}
        <div id="catalog-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[300px] transition-opacity duration-300">
          {filteredThemes.length > 0 ? filteredThemes.map(t => {
            const prices = getPriceByCategory(t.category)
            const gradientBg = `linear-gradient(135deg, ${t.colors?.[0] || '#134e4a'}, ${t.colors?.[1] || '#d4a96a'})`

            return (
              <div key={t.id} className="theme-card relative h-[380px] rounded-2xl overflow-hidden shadow-sm flex flex-col group">
                {/* Background visual covering entire card */}
                <div className="absolute inset-0 z-0 bg-gray-100">
                  {t.thumbnail ? (
                    <img src={t.thumbnail} alt={t.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: gradientBg }}>
                      <span className="text-6xl opacity-90 drop-shadow-md">{t.emoji}</span>
                    </div>
                  )}
                  {/* Subtle dark gradient overlay at the bottom to ensure text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C232E]/90 via-[#1C232E]/20 to-transparent pointer-events-none"></div>
                </div>
                
                {/* Badges Overlay */}
                <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-20 shadow-md">-50%</div>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur shadow-md text-sm px-2.5 py-1 rounded-lg z-20 flex items-center gap-1 text-gray-900 font-medium">
                  {t.emoji}
                </div>

                {/* Spacer to push content to bottom */}
                <div className="flex-1 z-10 pointer-events-none"></div>

                {/* Card body (Glassmorphism overlay at bottom) */}
                <div className="p-4 z-20 bg-[#1C232E]/60 backdrop-blur-md border-t border-white/10 flex flex-col">
                  <h3 className="font-semibold text-white text-base mb-1 drop-shadow-sm">{t.name}</h3>
                  <p className="text-gray-300 text-xs mb-3 leading-relaxed drop-shadow-sm line-clamp-2">{t.desc || 'Tema undangan elegan'}</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-gray-400 text-xs line-through">{prices.original}</span>
                    <span className="text-[#DDC497] font-bold text-lg drop-shadow-sm">{prices.promo}</span>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/invite/demo?theme=${t.id}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center border border-gray-400 text-gray-300 hover:bg-white/10 hover:text-white py-2.5 px-2 rounded-xl text-xs font-semibold transition-all">
                      Lihat Preview
                    </a>
                    <Link to={`/login?register=true&category=${t.category}&themeName=${encodeURIComponent(t.name)}`} className="order-btn flex-1 text-center bg-[#DDC497] text-[#1C232E] hover:opacity-90 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all shadow-lg">
                      Pesan Sekarang
                    </Link>
                  </div>
                </div>
              </div>
            )
          }) : (
            <div className="col-span-full text-center text-gray-400 py-10">
              Belum ada tema di kategori ini.
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="catalog-see-all-link inline-flex items-center gap-2 border-2 font-bold px-8 py-3 rounded-full transition-all text-sm" style={{ borderColor: 'rgba(221,196,151,0.5)', color: '#DDC497' }}>
            Konsultasi Tema &rarr;
          </a>
        </div>
      </div>
    </section>
  )
}
