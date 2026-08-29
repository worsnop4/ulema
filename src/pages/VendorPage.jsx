import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchVendorBySlug, logVendorEvent } from '../services/vendorService'
import { REFERRAL_DISCOUNT_AMOUNT } from '../config/constants'
import './VendorPage.css'

// Token dari handoff "FM Project Portfolio v2" (gelap/mewah).
const C = {
  bg:        '#0D0B0A',
  surface:   '#110E0C',
  panel:     '#120F0D',
  well:      '#1A1512',
  wellDeep:  '#100D0B',
  gold:      '#C9A97C',
  goldSoft:  '#DCC7A6',
  goldLabel: '#D8BC93',
  onGold:    '#17110D',
  hi:        '#F5EDE2',
  hi2:       '#F2E9DC',
  hi3:       '#F7EFE4',
  body:      'rgba(234,224,212,0.68)',
  muted:     'rgba(234,224,212,0.6)',
  faint:     'rgba(234,224,212,0.5)',
  line:      'rgba(234,224,212,0.1)',
  lineSoft:  'rgba(234,224,212,0.12)',
  goldLine:  'rgba(201,169,124,0.4)',
}

const MOSAIC_TILES = 36
// Di bawah ini, mosaik "arsip" 36 ubin hanya mengulang foto yang sama
// berkali-kali dan terbaca sebagai galeri rusak, bukan arsip besar.
const MOSAIC_MIN_PHOTOS = 12

/** 08xx dan +62xx sama-sama jadi 62xx; wa.me menolak bentuk lainnya. */
const waNumber = (raw) => {
  const d = String(raw || '').replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('62')) return d
  if (d.startsWith('0')) return `62${d.slice(1)}`
  return d
}

/** Terima string URL, {url}, atau {thumb, full, caption}. */
const normPhotos = (gallery) => {
  if (!Array.isArray(gallery)) return []
  return gallery.map(g => {
    if (typeof g === 'string') return { thumb: g, full: g, caption: '' }
    if (!g || typeof g !== 'object') return null
    const full = g.full || g.url || g.thumb
    const thumb = g.thumb || g.url || g.full
    if (!full || !thumb) return null
    return { thumb, full, caption: typeof g.caption === 'string' ? g.caption : '' }
  }).filter(Boolean)
}

const arr = (v) => (Array.isArray(v) ? v : [])
const rp = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`

/** Headline dengan satu potongan dicetak emas. Kalau potongannya tidak
 *  ditemukan, seluruh headline dirender polos — bukan error. */
const HeadlineText = ({ text, accent }) => {
  const lines = String(text || '').split('\n')
  return lines.map((line, i) => {
    const at = accent ? line.indexOf(accent) : -1
    return (
      <span key={i}>
        {i > 0 && <br />}
        {at < 0 ? line : (
          <>
            {line.slice(0, at)}
            <span style={{ color: C.gold }}>{accent}</span>
            {line.slice(at + accent.length)}
          </>
        )}
      </span>
    )
  })
}

const Eyebrow = ({ children, style }) => (
  <p className="font-archivo" style={{
    margin: 0, fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
    color: 'rgba(201,169,124,0.85)', ...style,
  }}>{children}</p>
)

const H2 = ({ children, style }) => (
  <h2 className="font-archivo" style={{
    margin: 0, fontWeight: 300, fontSize: 'clamp(26px, 3.4vw, 46px)',
    letterSpacing: '0.07em', textTransform: 'uppercase', color: C.hi, ...style,
  }}>{children}</h2>
)

export default function VendorPage() {
  const { slug } = useParams()
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    fetchVendorBySlug(slug).then(v => {
      if (!alive) return
      setVendor(v)
      setLoading(false)
      if (v) {
        document.title = `${v.name} — ${v.category}${v.city ? ` ${v.city}` : ''}`
        logVendorEvent(v.id, 'view')
      }
    })
    return () => { alive = false }
  }, [slug])

  const track = useCallback((kind) => vendor && logVendorEvent(vendor.id, kind), [vendor])

  const handleCopy = () => {
    if (!vendor?.referral_code) return
    navigator.clipboard.writeText(vendor.referral_code)
    setCopied(true)
    track('code_copy')
    setTimeout(() => setCopied(false), 2200)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-karla"
        style={{ background: C.bg, color: C.muted }}>
        <p style={{ fontSize: 14 }}>Memuat…</p>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 font-karla"
        style={{ background: C.bg, color: C.body }}>
        <h1 className="font-archivo" style={{
          fontWeight: 300, fontSize: 30, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: C.hi, margin: 0,
        }}>Halaman tidak ditemukan</h1>
        <p style={{ fontSize: 15, marginTop: 14, maxWidth: 380, lineHeight: 1.8 }}>
          Vendor ini belum tayang atau alamatnya keliru.
        </p>
        <Link to="/" className="font-archivo vp-btn vp-btn-gold" style={{
          marginTop: 26, fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase',
          background: C.gold, color: C.onGold, padding: '17px 30px', borderRadius: 999,
        }}>Ke Ulema</Link>
      </div>
    )
  }

  return <VendorPageView vendor={vendor} copied={copied} onCopy={handleCopy} onTrack={track} />
}

/**
 * The presentational half, split out so it can be rendered directly against
 * real vendor rows in an SSR smoke test. This page renders database content
 * verbatim, and one unexpectedly-shaped value is enough to turn a vendor's
 * whole site into a blank error screen in front of their client.
 */
export function VendorPageView({ vendor, copied = false, onCopy = () => {}, onTrack = () => {} }) {
  const photos = normPhotos(vendor.gallery)
  const [i, setI] = useState(0)
  const [lightbox, setLightbox] = useState(null)
  const paused = useRef(false)

  const n = photos.length
  const active = n ? photos[Math.min(i, n - 1)] : null

  // Slideshow otomatis. Berhenti saat kursor di dalam galeri, saat lightbox
  // terbuka, dan sepenuhnya kalau pengguna minta gerak dikurangi.
  useEffect(() => {
    if (n < 2) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      if (paused.current || lightbox) return
      setI(v => (v + 1) % n)
    }, 4000)
    return () => clearInterval(id)
  }, [n, lightbox])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const wa = waNumber(vendor.whatsapp)
  const waHref = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${vendor.name}, saya ingin konsultasi untuk pernikahan saya.`)}`
    : null
  const ig = vendor.instagram ? String(vendor.instagram).replace(/^@/, '') : null

  const heroPhotos = arr(vendor.hero_photos).filter(x => typeof x === 'string' && x)
  const hero3 = heroPhotos.length >= 3 ? heroPhotos.slice(0, 3) : photos.slice(0, 3).map(p => p.full)

  const stats = arr(vendor.stats).filter(s => s?.value)
  const facts = arr(vendor.facts).filter(f => f?.label)
  const packages = arr(vendor.packages).filter(p => p?.name)
  const testimonials = arr(vendor.testimonials).filter(t => t?.quote)
  const hasPrice = vendor.price_from || vendor.price_to
  const useMosaic = n >= MOSAIC_MIN_PHOTOS

  // 36 ubin dari n foto. Langkah 7 relatif prima terhadap 20, jadi seluruh
  // arsip lewat sekali sebelum ada yang terulang.
  const tiles = useMosaic
    ? Array.from({ length: MOSAIC_TILES }, (_, k) => photos[(k * 7) % n])
    : []

  const NAV = [
    ['#galeri', 'Galeri'],
    vendor.description || facts.length ? ['#tentang', 'Tentang'] : null,
    packages.length ? ['#paket', 'Paket'] : null,
    testimonials.length ? ['#testimoni', 'Testimoni'] : null,
  ].filter(Boolean)

  return (
    <div className="font-karla" style={{ background: C.bg, color: '#EAE0D4', overflowX: 'hidden' }}>

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 flex items-center justify-between" style={{
        zIndex: 30, gap: 24, padding: '16px clamp(18px, 3vw, 28px)',
        background: 'rgba(13,11,10,0.82)', backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(234,224,212,0.09)',
      }}>
        <a href="#top" className="font-archivo" style={{
          fontSize: 13, fontWeight: 500, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: C.hi2, whiteSpace: 'nowrap',
        }}>{vendor.name}</a>

        <nav className="vp-nav flex font-archivo" style={{
          gap: 30, fontSize: 10, letterSpacing: '0.26em',
          textTransform: 'uppercase', color: C.muted,
        }}>
          {NAV.map(([href, label]) => (
            <a key={href} href={href} className="vp-link">{label}</a>
          ))}
        </nav>

        {waHref && (
          <a href={waHref} target="_blank" rel="noopener noreferrer"
            onClick={() => onTrack('wa_click')}
            className="font-archivo vp-btn vp-btn-outline" style={{
              fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
              border: `1px solid rgba(201,169,124,0.5)`, color: C.goldSoft,
              padding: '11px 20px', borderRadius: 999, whiteSpace: 'nowrap',
            }}>WhatsApp</a>
        )}
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section id="top" className="vp-hero relative grid" style={{
        gridTemplateColumns: '1fr 0.95fr', gap: 28, alignItems: 'stretch',
        padding: 'clamp(28px, 4vw, 44px) clamp(18px, 3vw, 28px) clamp(38px, 5vw, 56px)',
        backgroundImage: 'radial-gradient(120% 90% at 8% 6%, rgba(201,169,124,0.22) 0%, rgba(201,169,124,0.07) 34%, rgba(13,11,10,0) 68%), linear-gradient(180deg, rgba(255,250,242,0.05) 0%, rgba(13,11,10,0) 42%)',
      }}>
        <div className="absolute pointer-events-none" style={{
          left: '-6%', top: '-12%', width: '46%', height: '70%',
          background: 'radial-gradient(closest-side, rgba(201,169,124,0.3), rgba(201,169,124,0) 100%)',
          filter: 'blur(60px)',
        }} />

        <div className="relative flex flex-col justify-between" style={{
          gap: 'clamp(28px, 4vw, 48px)', padding: 'clamp(16px, 3vw, 36px) 12px 12px',
        }}>
          <Eyebrow style={{ letterSpacing: '0.32em' }}>
            {vendor.category}{vendor.city ? ` · ${vendor.city}` : ''}
          </Eyebrow>

          <div>
            <h1 className="font-archivo" style={{
              margin: '0 0 30px', fontWeight: 300, fontSize: 'clamp(34px, 5.4vw, 78px)',
              lineHeight: 1.0, letterSpacing: '0.04em', textTransform: 'uppercase',
              color: C.hi, textWrap: 'balance',
            }}>
              {vendor.headline
                ? <HeadlineText text={vendor.headline} accent={vendor.headline_accent} />
                : vendor.name}
            </h1>
            {vendor.tagline && (
              <p style={{ margin: 0, maxWidth: '44ch', fontSize: 15, lineHeight: 1.9, color: 'rgba(234,224,212,0.66)' }}>
                {vendor.tagline}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center" style={{ gap: 12 }}>
            <a href="#galeri" className="font-archivo vp-btn vp-btn-gold" style={{
              fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase',
              background: C.gold, color: C.onGold, padding: '17px 30px', borderRadius: 999,
            }}>Lihat galeri</a>
            <a href={packages.length ? '#paket' : '#kontak'} className="font-archivo vp-btn vp-btn-ghost" style={{
              fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase',
              border: '1px solid rgba(234,224,212,0.28)', padding: '17px 30px', borderRadius: 999,
            }}>{packages.length ? 'Paket & harga' : 'Hubungi kami'}</a>
          </div>
        </div>

        {hero3.length > 0 && (
          <div className="vp-hero-photos relative grid" style={{ gridTemplateColumns: '1.15fr 1fr', gap: 14 }}>
            <div className="overflow-hidden" style={{
              borderRadius: 28, background: C.well, boxShadow: '0 26px 60px rgba(0,0,0,0.5)',
            }}>
              <img src={hero3[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div className="grid" style={{ gridTemplateRows: '1fr 1fr', gap: 14 }}>
              {hero3.slice(1, 3).map((src, k) => (
                <div key={k} className="overflow-hidden" style={{
                  borderRadius: 28, background: C.well, boxShadow: '0 26px 60px rgba(0,0,0,0.5)',
                }}>
                  <img src={src} alt="" loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Statistik ────────────────────────────────────────────── */}
      {stats.length > 0 && (
        <section style={{ padding: '0 clamp(18px, 3vw, 28px) clamp(40px, 6vw, 64px)' }}>
          <div className="vp-stats grid" style={{
            gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`, gap: 14,
          }}>
            {stats.map((s, k) => (
              <div key={k} style={{
                border: `1px solid ${C.line}`, borderRadius: 24,
                padding: 'clamp(20px, 3vw, 28px) clamp(18px, 3vw, 30px)', background: C.surface,
              }}>
                <p className="font-archivo" style={{
                  margin: '0 0 10px', fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 300,
                  letterSpacing: '0.03em', color: C.hi2,
                }}>{s.value}</p>
                <p className="font-archivo" style={{
                  margin: 0, fontSize: 9, letterSpacing: '0.24em',
                  textTransform: 'uppercase', color: 'rgba(234,224,212,0.55)',
                }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Galeri ───────────────────────────────────────────────── */}
      {n > 0 && (
        <>
          <section id="galeri" style={{ padding: '0 clamp(18px, 3vw, 28px) 18px' }}>
            <div className="flex flex-wrap justify-between items-end" style={{
              gap: 32, paddingBottom: 24, borderBottom: `1px solid ${C.lineSoft}`,
            }}>
              <H2>Galeri Terpilih</H2>
              <p style={{ margin: 0, maxWidth: 420, fontSize: 14, lineHeight: 1.75, color: C.muted }}>
                {useMosaic
                  ? 'Foto tengah berganti otomatis. Ketuk bingkai kecil mana pun untuk memindahkannya ke tengah, ketuk foto tengah untuk ukuran penuh.'
                  : 'Ketuk foto untuk melihat ukuran penuh.'}
              </p>
            </div>
          </section>

          {useMosaic ? (
            <>
              <section
                onMouseEnter={() => { paused.current = true }}
                onMouseLeave={() => { paused.current = false }}
                className="relative"
                style={{ padding: '26px clamp(18px, 3vw, 28px) 20px' }}>
                <div className="absolute pointer-events-none" style={{
                  left: 0, right: 0, top: 0, height: 150, zIndex: 5,
                  background: 'linear-gradient(180deg,#0D0B0A 0%,rgba(13,11,10,0.85) 26%,rgba(13,11,10,0.45) 58%,rgba(13,11,10,0) 100%)',
                }} />
                <div className="absolute pointer-events-none" style={{
                  left: 0, right: 0, bottom: 0, height: 150, zIndex: 5,
                  background: 'linear-gradient(0deg,#0D0B0A 0%,rgba(13,11,10,0.85) 26%,rgba(13,11,10,0.45) 58%,rgba(13,11,10,0) 100%)',
                }} />

                <div className="vm-grid">
                  <div className="vm-center relative overflow-hidden"
                    onClick={() => active && setLightbox(active.full)}
                    style={{
                      backgroundColor: C.wellDeep, backgroundImage: `url('${active?.full}')`,
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      cursor: 'zoom-in', boxShadow: '0 40px 110px rgba(0,0,0,0.8)', zIndex: 2,
                    }}>
                    <div className="absolute pointer-events-none" style={{
                      left: 0, right: 0, bottom: 0, height: '44%',
                      background: 'linear-gradient(180deg,rgba(10,7,6,0) 0%,rgba(10,7,6,0.8) 100%)',
                    }} />
                    <div className="absolute flex justify-between items-end pointer-events-none font-archivo" style={{
                      left: 'clamp(10px, 2vw, 20px)', right: 'clamp(10px, 2vw, 20px)', bottom: 18,
                      gap: 14, fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase',
                    }}>
                      <span style={{ color: 'rgba(242,233,220,0.9)' }}>{active?.caption}</span>
                      <span style={{ color: 'rgba(201,169,124,0.95)', whiteSpace: 'nowrap' }}>
                        {String(Math.min(i, n - 1) + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {tiles.map((p, k) => (
                    <div key={k} className="vm-tile overflow-hidden"
                      onClick={() => setI(photos.indexOf(p))}
                      style={{ background: '#171310' }}>
                      <img src={p.thumb} alt="" loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  ))}
                </div>
              </section>

              <section className="flex justify-center" style={{ gap: 10, padding: '0 clamp(18px, 3vw, 28px) clamp(48px, 7vw, 76px)' }}>
                <button onClick={() => setI(v => (v - 1 + n) % n)}
                  className="font-archivo vp-btn vp-btn-outline" style={{
                    fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
                    background: 'transparent', color: C.goldSoft, border: `1px solid ${C.goldLine}`,
                    borderRadius: 999, padding: '13px 30px', cursor: 'pointer',
                  }}>Sebelumnya</button>
                <button onClick={() => setI(v => (v + 1) % n)}
                  className="font-archivo vp-btn vp-btn-outline" style={{
                    fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
                    background: 'transparent', color: C.goldSoft, border: `1px solid ${C.goldLine}`,
                    borderRadius: 999, padding: '13px 30px', cursor: 'pointer',
                  }}>Selanjutnya</button>
              </section>
            </>
          ) : (
            <section style={{ padding: '26px clamp(18px, 3vw, 28px) clamp(48px, 7vw, 76px)' }}>
              <div className="grid" style={{
                gap: 6, gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(130px, 24vw, 240px), 1fr))',
              }}>
                {photos.map((p, k) => (
                  <div key={k} className="overflow-hidden" onClick={() => setLightbox(p.full)}
                    style={{ aspectRatio: '3 / 4', background: '#171310', cursor: 'zoom-in' }}>
                    <img src={p.thumb} alt={p.caption || ''} loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── Tentang ──────────────────────────────────────────────── */}
      {(vendor.description || facts.length > 0) && (
        <section id="tentang" className="vp-about grid" style={{
          gridTemplateColumns: '1fr 1.15fr', gap: 'clamp(28px, 4vw, 56px)', alignItems: 'start',
          padding: '24px clamp(18px, 3vw, 28px) clamp(56px, 8vw, 96px)',
        }}>
          {(vendor.about_photo_url || photos.length > 0) && (
            <div className="overflow-hidden" style={{
              aspectRatio: '4 / 5', borderRadius: 28, background: C.well,
              boxShadow: '0 30px 70px rgba(0,0,0,0.55)',
            }}>
              <img src={vendor.about_photo_url || photos[photos.length - 1]?.full} alt="" loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          <div style={{ paddingTop: 8 }}>
            <Eyebrow style={{ marginBottom: 22 }}>Tentang</Eyebrow>
            {vendor.about_title && (
              <h2 className="font-archivo" style={{
                margin: '0 0 28px', fontWeight: 300, fontSize: 'clamp(24px, 2.8vw, 38px)',
                lineHeight: 1.22, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.hi,
              }}>{vendor.about_title}</h2>
            )}
            {String(vendor.description || '').split('\n').filter(Boolean).map((para, k) => (
              <p key={k} style={{
                margin: '0 0 18px', fontSize: 15, lineHeight: 1.9,
                color: C.body, maxWidth: '56ch', textWrap: 'pretty',
              }}>{para}</p>
            ))}

            {facts.length > 0 && (
              <div className="vp-facts grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
                {facts.map((f, k) => (
                  <div key={k} style={{
                    border: `1px solid ${C.line}`, borderRadius: 20, padding: '22px 24px', background: C.surface,
                  }}>
                    <p className="font-archivo" style={{
                      margin: '0 0 6px', fontSize: 9, letterSpacing: '0.24em',
                      textTransform: 'uppercase', color: 'rgba(234,224,212,0.55)',
                    }}>{f.label}</p>
                    <p style={{ margin: 0, fontSize: 14 }}>{f.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Paket ────────────────────────────────────────────────── */}
      {packages.length > 0 && (
        <section id="paket" style={{ padding: '0 clamp(18px, 3vw, 28px) clamp(56px, 8vw, 96px)' }}>
          <div style={{
            borderRadius: 36, background: C.panel, border: '1px solid rgba(234,224,212,0.09)',
            padding: 'clamp(28px, 5vw, 56px) clamp(20px, 4vw, 44px)',
          }}>
            <div className="flex flex-wrap justify-between items-end" style={{ gap: 32, paddingBottom: 36 }}>
              <H2>Paket</H2>
              {vendor.package_note && (
                <p style={{ margin: 0, maxWidth: 420, fontSize: 14, lineHeight: 1.75, color: C.muted }}>
                  {vendor.package_note}
                </p>
              )}
            </div>

            <div className="vp-tiers grid" style={{
              gridTemplateColumns: `repeat(${Math.min(packages.length, 3)}, 1fr)`, gap: 16,
            }}>
              {packages.map((p, k) => (
                <div key={k} className="flex flex-col" style={{
                  borderRadius: 26, padding: 'clamp(26px, 4vw, 36px) clamp(20px, 3vw, 30px)', gap: 26,
                  border: `1px solid ${p.highlight ? 'rgba(201,169,124,0.55)' : 'rgba(234,224,212,0.12)'}`,
                  background: p.highlight
                    ? 'linear-gradient(180deg, rgba(201,169,124,0.12), rgba(201,169,124,0.02))'
                    : 'transparent',
                }}>
                  <div>
                    <p className="font-archivo" style={{
                      margin: '0 0 14px', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
                      color: p.highlight ? C.goldLabel : 'rgba(234,224,212,0.55)',
                    }}>{p.name}{p.note ? ` · ${p.note}` : ''}</p>
                    <p className="font-archivo" style={{
                      margin: 0, fontSize: 'clamp(26px, 3.2vw, 32px)', fontWeight: 300,
                      letterSpacing: '0.02em', color: p.highlight ? C.hi3 : C.hi2,
                    }}>{p.price}</p>
                  </div>
                  <ul className="grid" style={{
                    margin: 0, padding: 0, listStyle: 'none', gap: 12, fontSize: 14, lineHeight: 1.6,
                    color: p.highlight ? 'rgba(234,224,212,0.82)' : 'rgba(234,224,212,0.72)',
                  }}>
                    {arr(p.features).map((f, j) => <li key={j}>{f}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            {vendor.package_footnote && (
              <p style={{ margin: '28px 0 0', fontSize: 13, color: C.faint }}>{vendor.package_footnote}</p>
            )}
          </div>
        </section>
      )}

      {/* ── Testimoni ────────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section id="testimoni" style={{ padding: '0 clamp(18px, 3vw, 28px) clamp(56px, 8vw, 96px)' }}>
          <H2 style={{ marginBottom: 36 }}>Testimoni</H2>
          <div className="vp-testimonials grid" style={{
            gridTemplateColumns: `repeat(${Math.min(testimonials.length, 3)}, 1fr)`, gap: 16,
          }}>
            {testimonials.map((t, k) => (
              <figure key={k} style={{
                margin: 0, border: `1px solid ${C.line}`, borderRadius: 26,
                background: C.surface, padding: 'clamp(26px, 4vw, 34px) clamp(22px, 3vw, 30px)',
              }}>
                <blockquote style={{
                  margin: '0 0 22px', fontSize: 17, lineHeight: 1.78,
                  color: 'rgba(240,232,221,0.9)', textWrap: 'pretty',
                }}>{t.quote}</blockquote>
                <figcaption className="font-archivo" style={{
                  fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: 'rgba(201,169,124,0.8)',
                }}>{t.author}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ── Kontak ───────────────────────────────────────────────── */}
      <section id="kontak" style={{ padding: '0 clamp(18px, 3vw, 28px) 28px' }}>
        <div className="vp-contact grid" style={{
          borderRadius: 36, background: 'linear-gradient(160deg,#1A1512,#0F0C0A)',
          border: '1px solid rgba(201,169,124,0.22)',
          padding: 'clamp(34px, 6vw, 64px) clamp(22px, 4vw, 48px)',
          gridTemplateColumns: '1.4fr 1fr', gap: 'clamp(28px, 4vw, 56px)', alignItems: 'end',
        }}>
          <div>
            <h2 className="font-archivo" style={{
              margin: '0 0 24px', fontWeight: 300, fontSize: 'clamp(28px, 4.6vw, 62px)',
              lineHeight: 1.04, letterSpacing: '0.05em', textTransform: 'uppercase',
              color: C.hi3, textWrap: 'balance',
            }}>Ceritakan rencana<br />acara Anda</h2>
            <p style={{ margin: 0, maxWidth: '52ch', fontSize: 15, lineHeight: 1.85, color: 'rgba(234,224,212,0.66)' }}>
              Kirimkan tanggal, lokasi, dan gambaran rangkaian acara. Kami akan membalas
              dengan ketersediaan tim dan rincian paket.
            </p>
          </div>

          <div className="grid" style={{ gap: 18 }}>
            {waHref && (
              <a href={waHref} target="_blank" rel="noopener noreferrer"
                onClick={() => onTrack('wa_click')}
                className="font-archivo vp-btn vp-btn-gold block text-center" style={{
                  fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
                  background: C.gold, color: C.onGold, padding: '19px 24px', borderRadius: 999,
                }}>Konsultasi via WhatsApp</a>
            )}
            {vendor.email && (
              <a href={`mailto:${vendor.email}`} className="font-archivo vp-btn block text-center" style={{
                fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
                border: '1px solid rgba(234,224,212,0.32)', color: '#EAE0D4',
                padding: '19px 24px', borderRadius: 999,
              }}>{vendor.email}</a>
            )}
            <div className="grid" style={{ gap: 8, fontSize: 14, color: C.muted }}>
              {vendor.whatsapp && <p style={{ margin: 0 }}>WhatsApp · {vendor.whatsapp}</p>}
              {ig && (
                <p style={{ margin: 0 }}>Instagram ·{' '}
                  <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer"
                    className="vp-link" style={{ color: 'inherit' }}>@{ig}</a>
                </p>
              )}
              {vendor.website && (
                <p style={{ margin: 0 }}>
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer"
                    className="vp-link" style={{ color: 'inherit' }}>{vendor.website}</a>
                </p>
              )}
              {hasPrice && (
                <p style={{ margin: 0 }}>
                  Kisaran · {vendor.price_from && vendor.price_to
                    ? `${rp(vendor.price_from)} – ${rp(vendor.price_to)}`
                    : rp(vendor.price_from || vendor.price_to)}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Undangan digital — blok inilah yang menghasilkan komisi ─ */}
      <section style={{ padding: '20px clamp(18px, 3vw, 28px) 8px' }}>
        <div className="flex flex-wrap items-center justify-between" style={{
          borderRadius: 28, border: '1px solid rgba(201,169,124,0.24)',
          background: 'linear-gradient(120deg, rgba(201,169,124,0.09), rgba(13,11,10,0) 62%)',
          padding: 'clamp(24px, 4vw, 30px) clamp(22px, 4vw, 36px)', gap: 28,
        }}>
          <div style={{ flex: '1 1 320px' }}>
            <Eyebrow style={{ fontSize: 9, letterSpacing: '0.28em', marginBottom: 10 }}>Partner</Eyebrow>
            <p className="font-archivo" style={{
              margin: 0, fontSize: 'clamp(17px, 1.7vw, 23px)', fontWeight: 300,
              letterSpacing: '0.04em', textTransform: 'uppercase', color: C.hi2,
            }}>Pesan juga undangan digital di ulema.id</p>
            <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.7, color: C.muted, maxWidth: '56ch' }}>
              Undangan pernikahan digital dengan tema yang bisa disesuaikan, RSVP, dan peta lokasi.
              {vendor.referral_code && ` Pakai kode kami dan kamu dapat potongan ${rp(REFERRAL_DISCOUNT_AMOUNT)}.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center" style={{ gap: 12 }}>
            {vendor.referral_code && (
              <button onClick={onCopy} aria-label={`Salin kode ${vendor.referral_code}`}
                className="font-archivo vp-btn" style={{
                  fontSize: 'clamp(15px, 1.6vw, 19px)', letterSpacing: '0.16em',
                  color: copied ? '#9BD8A8' : C.goldSoft,
                  background: 'rgba(201,169,124,0.08)',
                  border: `1px dashed ${copied ? 'rgba(155,216,168,0.6)' : 'rgba(201,169,124,0.55)'}`,
                  borderRadius: 14, padding: '14px 22px', cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                {copied ? '✓ Tersalin' : vendor.referral_code}
              </button>
            )}
            <Link to="/#katalog" onClick={() => onTrack('catalog_click')}
              className="font-archivo vp-btn vp-btn-gold" style={{
                fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
                background: C.gold, color: C.onGold, padding: '17px 30px',
                borderRadius: 999, whiteSpace: 'nowrap',
              }}>Buat undangan digital</Link>
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap justify-between font-archivo" style={{
        gap: 24, padding: '24px clamp(18px, 3vw, 40px) 34px',
        fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: C.muted,
      }}>
        <p style={{ margin: 0 }}>{vendor.name} — {vendor.category}</p>
        <p style={{ margin: 0 }}>
          Halaman disediakan oleh <Link to="/" className="vp-link" style={{ color: C.goldSoft }}>Ulema</Link>
        </p>
      </footer>

      {/* ── Lightbox ─────────────────────────────────────────────── */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} className="fixed inset-0 flex items-center justify-center vp-fade"
          style={{ zIndex: 60, background: 'rgba(8,6,5,0.96)', padding: 'clamp(16px, 4vw, 40px)', cursor: 'zoom-out' }}>
          <img src={lightbox} alt=""
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block',
              filter: 'drop-shadow(0 40px 90px rgba(0,0,0,0.8))' }} />
          <span className="absolute font-archivo" style={{
            top: 26, right: 34, fontSize: 10, letterSpacing: '0.24em',
            textTransform: 'uppercase', color: 'rgba(201,169,124,0.8)',
          }}>Tutup</span>
        </div>
      )}
    </div>
  )
}
