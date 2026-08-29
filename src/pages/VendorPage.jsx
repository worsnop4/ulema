import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchVendorBySlug, logVendorEvent } from '../services/vendorService'
import { REFERRAL_DISCOUNT_AMOUNT } from '../config/constants'

// Palet halaman vendor sengaja terang dan hangat, bukan gelap seperti landing
// Ulema. Ini etalase vendor, dan yang harus mendominasi adalah fotonya --
// halaman gelap membuat foto pernikahan yang cerah terlihat seperti tempelan.
const C = {
  ground: '#FBF9F5',
  surface: '#FFFFFF',
  ink:     '#1C1A17',
  body:    '#5A544C',
  muted:   '#8C857A',
  accent:  '#A8763E',
  line:    '#E7E1D6',
}

/** 08xx dan +62xx sama-sama jadi 62xx; wa.me menolak bentuk lainnya. */
const waNumber = (raw) => {
  const d = String(raw || '').replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('62')) return d
  if (d.startsWith('0')) return `62${d.slice(1)}`
  return d
}

/** gallery boleh berisi string URL atau objek {url}. Terima keduanya. */
const galleryUrls = (gallery) => {
  if (!Array.isArray(gallery)) return []
  return gallery.map(g => (typeof g === 'string' ? g : g?.url)).filter(Boolean)
}

const Eyebrow = ({ children }) => (
  <span className="font-jost block" style={{
    fontSize: 10, letterSpacing: '0.34em', textTransform: 'uppercase', color: C.accent,
  }}>{children}</span>
)

const Section = ({ children, style }) => (
  <section style={{ padding: 'clamp(48px, 8vw, 96px) clamp(20px, 6vw, 64px)', ...style }}>
    <div style={{ maxWidth: 1080, margin: '0 auto' }}>{children}</div>
  </section>
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.ground, color: C.muted }}>
        <p className="font-jost text-sm">Memuat…</p>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{ background: C.ground, color: C.body }}>
        <h1 className="font-marcellus" style={{ fontSize: 30, color: C.ink, margin: 0 }}>Halaman tidak ditemukan</h1>
        <p className="font-jost" style={{ fontSize: 14, marginTop: 12, maxWidth: 380 }}>
          Vendor ini belum tayang atau alamatnya keliru.
        </p>
        <Link to="/" className="font-jost" style={{
          marginTop: 24, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: C.surface, background: C.ink, padding: '14px 28px', borderRadius: 999,
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
  const photos = galleryUrls(vendor.gallery)
  const wa = waNumber(vendor.whatsapp)
  const waHref = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${vendor.name}, saya ingin menanyakan ketersediaan untuk pernikahan saya.`)}`
    : null
  const hasPrice = vendor.price_from || vendor.price_to
  const rp = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`

  return (
    <div className="font-jost" style={{ background: C.ground, color: C.body, minHeight: '100vh' }}>

      {/* ── Sampul ───────────────────────────────────────────────── */}
      <header className="relative" style={{ minHeight: 'min(88vh, 720px)', display: 'flex', alignItems: 'flex-end' }}>
        {vendor.cover_url ? (
          <img src={vendor.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(140deg, ${C.ink}, ${C.accent})` }} />
        )}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, rgba(20,18,15,0.88) 0%, rgba(20,18,15,0.35) 45%, rgba(20,18,15,0.18) 100%)',
        }} />

        <div className="relative w-full" style={{ padding: 'clamp(32px, 6vw, 72px) clamp(20px, 6vw, 64px)' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            {vendor.logo_url && (
              <img src={vendor.logo_url} alt={vendor.name}
                style={{ height: 62, width: 'auto', marginBottom: 22, filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.4))' }} />
            )}
            <div className="flex items-center" style={{ gap: 10, marginBottom: 14 }}>
              <span className="font-jost" style={{
                fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#F6F1E7',
                border: '1px solid rgba(246,241,231,0.45)', padding: '6px 13px', borderRadius: 999,
              }}>{vendor.category}</span>
              {vendor.verified && (
                <span className="font-jost" style={{
                  fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.ink,
                  background: '#EBD9BC', padding: '6px 13px', borderRadius: 999,
                }}>Terverifikasi</span>
              )}
            </div>
            <h1 className="font-marcellus" style={{
              fontWeight: 400, fontSize: 'clamp(34px, 6.5vw, 68px)', lineHeight: 1.05,
              color: '#FFFDF8', margin: 0, textWrap: 'balance',
            }}>{vendor.name}</h1>
            {vendor.tagline && (
              <p className="font-cormorant" style={{
                fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(17px, 2.4vw, 24px)',
                color: 'rgba(255,253,248,0.85)', margin: '14px 0 0', maxWidth: 560,
              }}>{vendor.tagline}</p>
            )}
            {vendor.city && (
              <p className="font-jost" style={{
                fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
                color: 'rgba(255,253,248,0.7)', margin: '18px 0 0',
              }}>{vendor.city}</p>
            )}
          </div>
        </div>
      </header>

      {/* ── Tentang ──────────────────────────────────────────────── */}
      {vendor.description && (
        <Section>
          <Eyebrow>Tentang Kami</Eyebrow>
          <p className="font-cormorant" style={{
            fontSize: 'clamp(19px, 2.4vw, 26px)', fontWeight: 300, lineHeight: 1.65,
            color: C.ink, margin: '22px 0 0', maxWidth: 720, whiteSpace: 'pre-line',
          }}>{vendor.description}</p>
        </Section>
      )}

      {/* ── Galeri ───────────────────────────────────────────────── */}
      {photos.length > 0 && (
        <Section style={{ background: C.surface, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
          <Eyebrow>Portofolio</Eyebrow>
          <h2 className="font-marcellus" style={{
            fontWeight: 400, fontSize: 'clamp(26px, 3.6vw, 40px)', color: C.ink, margin: '16px 0 34px',
          }}>Karya Kami</h2>
          <div style={{
            display: 'grid', gap: 'clamp(8px, 1.4vw, 16px)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 30vw, 280px), 1fr))',
          }}>
            {photos.map((src, i) => (
              <div key={src + i} className="overflow-hidden" style={{
                borderRadius: 14, aspectRatio: '3 / 4', background: C.line,
              }}>
                <img src={src} alt={`${vendor.name} ${i + 1}`} loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Harga ────────────────────────────────────────────────── */}
      {hasPrice && (
        <Section>
          <Eyebrow>Kisaran Harga</Eyebrow>
          <p className="font-marcellus" style={{
            fontSize: 'clamp(26px, 4vw, 44px)', color: C.ink, margin: '16px 0 0',
          }}>
            {vendor.price_from && vendor.price_to
              ? `${rp(vendor.price_from)} – ${rp(vendor.price_to)}`
              : rp(vendor.price_from || vendor.price_to)}
          </p>
          <p className="font-jost" style={{ fontSize: 13, color: C.muted, margin: '10px 0 0' }}>
            Harga dapat berubah menyesuaikan tanggal dan kebutuhan acara.
          </p>
        </Section>
      )}

      {/* ── Undangan digital — blok inilah yang menghasilkan komisi ─ */}
      <Section style={{ background: C.ink }}>
        <div style={{
          border: '1px solid rgba(235,217,188,0.24)', borderRadius: 26,
          padding: 'clamp(28px, 5vw, 56px)', textAlign: 'center',
        }}>
          <Eyebrow>Rekomendasi Kami</Eyebrow>
          <h2 className="font-marcellus" style={{
            fontWeight: 400, fontSize: 'clamp(26px, 4.2vw, 46px)', lineHeight: 1.15,
            color: '#FFFDF8', margin: '16px auto 14px', maxWidth: 620, textWrap: 'balance',
          }}>Undangan Digital untuk Hari Bahagiamu</h2>
          <p className="font-cormorant" style={{
            fontStyle: 'italic', fontSize: 'clamp(16px, 2vw, 20px)', fontWeight: 300,
            color: 'rgba(255,253,248,0.72)', margin: '0 auto clamp(26px, 4vw, 38px)', maxWidth: 480, lineHeight: 1.6,
          }}>
            Kami bekerja sama dengan Ulema. Pakai kode di bawah dan kamu dapat potongan
            {' '}{rp(REFERRAL_DISCOUNT_AMOUNT)}.
          </p>

          {vendor.referral_code && (
            <>
              <p className="font-jost" style={{
                fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
                color: 'rgba(235,217,188,0.65)', margin: '0 0 12px',
              }}>Kode Voucher</p>

              <button onClick={onCopy} className="font-marcellus transition-colors"
                aria-label={`Salin kode ${vendor.referral_code}`}
                style={{
                  fontSize: 'clamp(22px, 4vw, 34px)', letterSpacing: '0.14em', color: '#EBD9BC',
                  background: 'rgba(235,217,188,0.08)', border: '1px dashed rgba(235,217,188,0.5)',
                  borderRadius: 16, padding: 'clamp(14px, 2.4vw, 20px) clamp(22px, 4vw, 44px)',
                  cursor: 'pointer', display: 'inline-block',
                }}>
                {vendor.referral_code}
              </button>

              <p className="font-jost" style={{
                fontSize: 12, color: copied ? '#9BD8A8' : 'rgba(255,253,248,0.5)', margin: '14px 0 0',
                transition: 'color .3s ease',
              }}>
                {copied ? '✓ Kode tersalin — tempel saat pembayaran' : 'Ketuk kode untuk menyalin'}
              </p>
            </>
          )}

          <div className="flex flex-wrap justify-center" style={{ gap: 12, marginTop: 'clamp(26px, 4vw, 36px)' }}>
            <Link to="/#katalog" onClick={() => onTrack('catalog_click')} className="font-jost"
              style={{
                fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.ink,
                background: 'linear-gradient(135deg, #C4A771, #E7D3AA)', padding: '15px 30px', borderRadius: 999,
              }}>Lihat Katalog Tema</Link>
          </div>
        </div>
      </Section>

      {/* ── Kontak ───────────────────────────────────────────────── */}
      <Section style={{ background: C.surface, borderTop: `1px solid ${C.line}`, textAlign: 'center' }}>
        <Eyebrow>Hubungi Kami</Eyebrow>
        <h2 className="font-marcellus" style={{
          fontWeight: 400, fontSize: 'clamp(26px, 3.8vw, 42px)', color: C.ink, margin: '16px 0 26px',
        }}>Mari Bicarakan Hari Besarmu</h2>

        <div className="flex flex-wrap justify-center" style={{ gap: 12 }}>
          {waHref && (
            <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={() => onTrack('wa_click')}
              className="font-jost" style={{
                fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: C.surface, background: C.ink, padding: '16px 32px', borderRadius: 999,
              }}>Chat WhatsApp</a>
          )}
          {vendor.instagram && (
            <a href={`https://instagram.com/${String(vendor.instagram).replace(/^@/, '')}`}
              target="_blank" rel="noopener noreferrer" className="font-jost"
              style={{
                fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.ink,
                border: `1px solid ${C.line}`, padding: '16px 32px', borderRadius: 999,
              }}>Instagram</a>
          )}
          {vendor.website && (
            <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="font-jost"
              style={{
                fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.ink,
                border: `1px solid ${C.line}`, padding: '16px 32px', borderRadius: 999,
              }}>Website</a>
          )}
        </div>
      </Section>

      <footer className="text-center" style={{ padding: '32px 20px', borderTop: `1px solid ${C.line}` }}>
        <p className="font-jost" style={{ fontSize: 11, letterSpacing: '0.14em', color: C.muted, margin: 0 }}>
          Halaman ini disediakan gratis oleh{' '}
          <Link to="/" style={{ color: C.accent }}>Ulema</Link>
        </p>
      </footer>
    </div>
  )
}
