import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getThemes } from '../../hooks/useSharedInvitation'
import { fetchPricing } from '../../services/billingService'
import { waLink } from '../../config/constants'

const CATEGORIES = [
  { id: 'Special', label: 'SPECIAL' },
  { id: 'Luxury', label: 'LUXURY' },
  { id: 'Motion', label: '3D MOTION' },
  { id: 'Adat', label: 'TEMA ADAT' },
]

const FALLBACK_PRICING = { Special: 99000, Adat: 110000, Motion: 140000, Luxury: 175000 }

export default function LandingCatalog() {
  const [themes, setThemes] = useState(() => getThemes())
  const [pricing, setPricing] = useState(FALLBACK_PRICING)
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

  // Harga otoritatif dari database — jangan pernah di-hardcode di sini.
  useEffect(() => { fetchPricing().then(setPricing) }, [])

  const priceOf = (cat) => {
    const p = pricing[cat] || FALLBACK_PRICING[cat] || 99000
    return {
      promo: `Rp ${(p / 1000).toLocaleString('id-ID')}k`,
      original: `Rp ${((p * 2) / 1000).toLocaleString('id-ID')}k`,
    }
  }

  const filteredThemes = useMemo(
    () => themes.filter(t => t.category === activeTab && t.visible !== false),
    [themes, activeTab]
  )

  return (
    <section id="katalog" className="font-jost" style={{
      padding: 'clamp(72px, 11vw, 150px) clamp(20px, 5vw, 64px)',
      background: '#0E1116', borderTop: '1px solid rgba(221,196,151,0.12)',
    }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div className="flex flex-wrap items-end justify-between" style={{ gap: 20, marginBottom: 'clamp(36px, 5vw, 64px)' }}>
          <div>
            <span style={{ fontSize: 10, letterSpacing: '0.4em', color: '#DDC497' }}>KATALOG TEMA</span>
            <h2 className="font-marcellus" style={{
              fontWeight: 400, fontSize: 'clamp(30px, 4.4vw, 56px)', margin: '16px 0 10px', color: '#FBF8F1',
            }}>Pilih Tema Favoritmu</h2>
            <p style={{ fontSize: 14, fontWeight: 300, color: '#8A93A1', margin: 0, maxWidth: 460 }}>
              Ratusan pilihan tema yang bisa disesuaikan dengan selera dan budayamu.
            </p>
          </div>

          {/* Chip kategori sekaligus tab — bentuknya pill outline, bukan
              underline seperti versi terang. */}
          <div className="flex flex-wrap" style={{ gap: 8 }} role="tablist">
            {CATEGORIES.map(cat => {
              const on = activeTab === cat.id
              return (
                <button key={cat.id} role="tab" aria-selected={on} onClick={() => setActiveTab(cat.id)}
                  style={{
                    fontSize: 10, letterSpacing: '0.2em', cursor: 'pointer', borderRadius: 999,
                    padding: '9px 16px', transition: 'all .3s ease',
                    color: on ? '#0B0D11' : 'rgba(232,228,218,0.75)',
                    background: on ? 'linear-gradient(135deg, #C4A771, #E7D3AA)' : 'transparent',
                    border: `1px solid ${on ? 'transparent' : 'rgba(221,196,151,0.3)'}`,
                  }}>
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 22 }}>
          {filteredThemes.length > 0 ? filteredThemes.map(t => {
            const prices = priceOf(t.category)
            const gradientBg = `linear-gradient(135deg, ${t.colors?.[0] || '#134e4a'}, ${t.colors?.[1] || '#d4a96a'})`

            return (
              <div key={t.id} className="theme-card relative overflow-hidden" style={{
                border: '1px solid rgba(221,196,151,0.16)', borderRadius: 22, background: '#10141A',
              }}>
                <div className="relative overflow-hidden" style={{ height: 300 }}>
                  {t.thumbnail ? (
                    <img src={t.thumbnail} alt={t.name} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: gradientBg }}>
                      <span className="text-6xl opacity-90 drop-shadow-md">{t.emoji}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'linear-gradient(to top, rgba(11,13,17,0.94) 0%, rgba(11,13,17,0.1) 55%, transparent 100%)',
                  }} />
                  <span className="absolute" style={{
                    top: 14, left: 14, fontSize: 9, letterSpacing: '0.22em', color: '#DDC497',
                    border: '1px solid rgba(221,196,151,0.4)', padding: '6px 12px', borderRadius: 999,
                    background: 'rgba(11,13,17,0.6)',
                  }}>{CATEGORIES.find(c => c.id === t.category)?.label || t.category}</span>
                  <span className="absolute" style={{
                    top: 14, right: 14, fontSize: 9, letterSpacing: '0.14em', color: '#0B0D11',
                    background: '#DDC497', padding: '6px 11px', borderRadius: 999,
                  }}>-50%</span>
                </div>

                <div style={{ padding: '20px 20px 24px' }}>
                  <h3 className="font-marcellus line-clamp-1" style={{
                    fontWeight: 400, fontSize: 20, margin: '0 0 10px', color: '#F2EFE7',
                  }}>{t.name}</h3>
                  <div className="flex items-baseline" style={{ gap: 10, marginBottom: 18 }}>
                    <span style={{ fontSize: 12, color: '#6C7480', textDecoration: 'line-through' }}>{prices.original}</span>
                    <span className="font-marcellus" style={{ fontSize: 22, color: '#DDC497' }}>{prices.promo}</span>
                  </div>
                  <div className="flex" style={{ gap: 8 }}>
                    <a href={`/invite/demo?theme=${t.id}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-center transition-colors hover:text-foyer-gold" style={{
                        fontSize: 10, letterSpacing: '0.16em', color: '#C8CCD3',
                        border: '1px solid rgba(200,204,211,0.28)', padding: '12px 8px', borderRadius: 999,
                      }}>PREVIEW</a>
                    <Link to={`/login?register=true&category=${t.category}&themeName=${encodeURIComponent(t.name)}`}
                      className="order-btn flex-1 text-center transition-opacity hover:opacity-90" style={{
                        fontSize: 10, letterSpacing: '0.16em', color: '#0B0D11',
                        background: 'linear-gradient(135deg, #C4A771, #E7D3AA)', padding: '12px 8px', borderRadius: 999,
                      }}>PESAN</Link>
                  </div>
                </div>
              </div>
            )
          }) : (
            <div className="col-span-full text-center" style={{ color: '#6C7480', padding: '40px 0' }}>
              Belum ada tema di kategori ini.
            </div>
          )}
        </div>

        <div className="text-center" style={{ marginTop: 'clamp(40px, 5vw, 60px)' }}>
          <a href={waLink('Halo Ulema! Saya ingin konsultasi tema undangan')}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center transition-colors" style={{
              gap: 8, fontSize: 11, letterSpacing: '0.22em', color: '#DDC497',
              border: '1px solid rgba(221,196,151,0.4)', padding: '15px 32px', borderRadius: 999,
            }}>
            KONSULTASI TEMA →
          </a>
        </div>
      </div>
    </section>
  )
}
