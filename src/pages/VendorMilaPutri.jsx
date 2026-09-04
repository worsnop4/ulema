import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { formatEventDate, normFeature, MAX_ITEMS, MAX_FEATURES, MAX_PHOTOS, MAX_TESTI, MAX_BEFORE_AFTER } from '../config/vendorContent'
import { rememberReferral } from '../config/referral'
import { REFERRAL_DISCOUNT_AMOUNT } from '../config/constants'
import './VendorMilaPutri.css'

/**
 * Halaman portofolio Mila Putri MakeUP (kategori MUA).
 *
 * Desain kedua yang berdiri sendiri, sengaja tidak berbagi kode tata letak
 * dengan VendorPage (FM Project). Alasannya tercatat di
 * docs/ARSITEKTUR_HALAMAN_VENDOR.md: mesinnya baru ditarik keluar setelah ada
 * dua contoh nyata, karena abstraksi dari satu contoh hampir selalu memotong
 * di tempat yang salah. Duplikasi di berkas ini disengaja, dan hanya berlaku
 * sampai vendor ketiga masuk.
 *
 * Aturan MUA yang mengikat ada di VendorMilaPutri.css.
 */

const PAPER = '#F7F4F3'
const PAPER_2 = '#EFEAE8'
const INK = '#241A22'
const INK_60 = '#6A5C64'
const PLUM = '#5B2740'
const BULB = '#F6E3C4'
const LINE = '#DED6D3'

const FS_H2 = 'clamp(26px, 3.2vw, 44px)'
const FS_BODY = 'clamp(15px, 1.15vw, 17px)'
const WRAP = { maxWidth: 1240, margin: '0 auto', padding: 'clamp(48px, 7vw, 96px) 24px' }
const PAD_Y = 'clamp(48px, 7vw, 96px)'

const arr = (v) => (Array.isArray(v) ? v : [])
const rp = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`

// Nomor disimpan apa adanya oleh vendor -- "0878...", "+62 878...", dengan
// spasi atau tanda hubung. wa.me hanya menerima angka berawalan kode negara.
const waNumber = (raw) => {
  const d = String(raw || '').replace(/\D/g, '')
  if (!d) return null
  if (d.startsWith('62')) return d
  if (d.startsWith('0')) return `62${d.slice(1)}`
  return d
}

const waDisplay = (raw) => {
  const d = waNumber(raw)
  if (!d) return null
  return `+${d.replace(/^(\d{2})(\d{3})(\d{4})(\d+)$/, '$1 $2 $3 $4')}`
}

// Galeri punya dua bentuk: string URL polos (baris lama) dan objek
// {full, thumb, caption} (editor konten). Keduanya masih ada di basis data.
const photoOf = (g) => (typeof g === 'string'
  ? { full: g, thumb: g, caption: '' }
  : { full: g?.full || g?.thumb || '', thumb: g?.thumb || g?.full || '', caption: g?.caption || '' })

const normPhotos = (gallery) => arr(gallery).map(photoOf).filter(p => p.full).slice(0, MAX_PHOTOS)

// Paket punya bentuk berkelompok dan bentuk datar. Yang datar dibungkus jadi
// satu grup tanpa judul supaya sisa render tidak perlu tahu bedanya.
const normPackages = (packages) => {
  const list = arr(packages)
  if (!list.length) return []
  if (list[0] && Array.isArray(list[0].items)) {
    return list.slice(0, 8).map(g => ({
      group: g?.group || '', note: g?.note || '', items: arr(g?.items).slice(0, MAX_ITEMS),
    }))
  }
  return [{ group: '', note: '', items: list.slice(0, MAX_ITEMS) }]
}

/* ── Potongan kecil ─────────────────────────────────────────────────────── */

const Dot = ({ size = 7, style }) => (
  <span aria-hidden="true" style={{
    flex: 'none', width: size, height: size, borderRadius: '50%', background: BULB,
    boxShadow: `0 0 ${size + 3}px ${Math.round(size / 2.3)}px rgba(246, 227, 196, 0.9)`, ...style,
  }} />
)

const Label = ({ children, style }) => (
  <span style={{
    fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_60, ...style,
  }}>{children}</span>
)

const H2 = ({ children, style }) => (
  <h2 className="mp-serif" style={{
    fontSize: FS_H2, margin: 0, lineHeight: 1.05, ...style,
  }}>{children}</h2>
)

/** Judul section: teks, subteks, lalu garis yang mengisi sisa baris. */
const SectionHead = ({ title, sub, bulb = false }) => (
  <div className="flex flex-wrap items-end" style={{ gap: 16, marginBottom: 30 }}>
    <H2>{title}</H2>
    {sub && <p style={{ margin: '0 0 6px', fontSize: 13, letterSpacing: '0.05em', color: INK_60 }}>{sub}</p>}
    <span aria-hidden="true" style={{ flex: 1, height: 1, background: LINE, marginBottom: 12 }} />
    {bulb && <Dot style={{ marginBottom: 9 }} />}
  </div>
)

/**
 * Section yang naik pelan saat masuk layar.
 *
 * Tanpa efek yang berjalan -- render server, atau pengguna yang minta gerak
 * dikurangi -- elemennya tampil penuh apa adanya. Animasinya menambah, bukan
 * mengungkap: halaman tidak boleh bergantung padanya untuk terlihat.
 */
function Reveal({ children, ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    if (typeof IntersectionObserver !== 'function') return
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        e.target.classList.add('mp-rise')
        io.unobserve(e.target)
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -8%' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <section ref={ref} {...rest}>{children}</section>
}

/**
 * Kartu sebelum/sesudah.
 *
 * Prototipenya mengunci lebar foto "sesudah" dalam piksel dan menghitung
 * ulang tiap resize, karena wadah yang menyempit ikut menyempitkan fotonya.
 * Di sini pemotongannya pakai clip-path: fotonya tetap seukuran wadah, yang
 * berubah cuma bidang yang terlihat. Tidak ada pengukuran, tidak ada
 * pendengar resize, dan tidak ada keadaan yang bisa basi.
 */
function BeforeAfter({ pair }) {
  const [pct, setPct] = useState(50)
  const ref = useRef(null)
  const dragging = useRef(false)

  const moveTo = (clientX) => {
    const box = ref.current?.getBoundingClientRect()
    if (!box || !box.width) return
    setPct(Math.max(0, Math.min(100, ((clientX - box.left) / box.width) * 100)))
  }

  const label = pair?.label || ''

  return (
    <div>
      <div
        ref={ref}
        role="slider"
        aria-label={label ? `Sebelum dan sesudah — ${label}` : 'Sebelum dan sesudah'}
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}
        tabIndex={0}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture?.(e.pointerId)
          dragging.current = true
          moveTo(e.clientX)
        }}
        onPointerMove={(e) => { if (dragging.current) moveTo(e.clientX) }}
        onPointerUp={() => { dragging.current = false }}
        onPointerCancel={() => { dragging.current = false }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') { e.preventDefault(); setPct(v => Math.max(0, v - 4)) }
          if (e.key === 'ArrowRight') { e.preventDefault(); setPct(v => Math.min(100, v + 4)) }
        }}
        style={{
          position: 'relative', aspectRatio: '3 / 4', overflow: 'hidden',
          border: `1px solid ${LINE}`, background: PAPER_2,
          userSelect: 'none', touchAction: 'none', cursor: 'ew-resize',
        }}
      >
        <img src={pair.before} alt="Sebelum riasan" loading="lazy" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        }} />
        <img src={pair.after} alt="Sesudah riasan" loading="lazy" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          clipPath: `inset(0 ${100 - pct}% 0 0)`,
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', top: 0, bottom: 0, left: `${pct}%`, width: 2,
          background: '#fff', boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.18)',
        }}>
          <span className="grid place-items-center" style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 36, height: 36, borderRadius: '50%', background: '#fff',
            boxShadow: '0 1px 6px rgba(0, 0, 0, 0.25)', fontSize: 13, color: INK,
          }}>↔</span>
        </div>
        {/* Satu-satunya lapisan di atas foto di halaman ini, dan ia netral:
            hitam transparan, bukan warna. Lihat catatan MUA di CSS. */}
        {[['left', 'Sebelum'], ['right', 'Sesudah']].map(([side, text]) => (
          <span key={side} style={{
            position: 'absolute', [side]: 10, bottom: 10, padding: '4px 9px',
            background: 'rgba(0, 0, 0, 0.55)', color: '#fff',
            fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
          }}>{text}</span>
        ))}
      </div>
      {label && (
        <p style={{ margin: '10px 0 0', fontSize: 13, letterSpacing: '0.04em', color: INK_60 }}>{label}</p>
      )}
    </div>
  )
}

/* ── Halaman ────────────────────────────────────────────────────────────── */

export default function VendorMilaPutri({ vendor, copied = false, onCopy = () => {}, onTrack = () => {} }) {
  const photos = normPhotos(vendor.gallery)
  const groups = normPackages(vendor.packages)
  const testimonials = arr(vendor.testimonials).slice(0, MAX_TESTI)
  const pairs = arr(vendor.before_after).filter(p => p?.before && p?.after).slice(0, MAX_BEFORE_AFTER)
  const services = arr(vendor.service_types).filter(Boolean)
  const stats = arr(vendor.stats).slice(0, 4)
  const facts = arr(vendor.facts)

  const [shownPhotos, setShownPhotos] = useState(12)
  const [lightbox, setLightbox] = useState(null)   // { items, i }
  const [inquiry, setInquiry] = useState(null)     // nama paket, null = tertutup
  const [lead, setLead] = useState({ name: '', address: '', date: '' })
  const [scrolled, setScrolled] = useState(false)
  const nameField = useRef(null)

  const wa = waNumber(vendor.whatsapp)
  const waHref = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${vendor.name}, saya mau tanya jadwal riasan.`)}`
    : null
  const ig = vendor.instagram ? String(vendor.instagram).replace(/^@/, '') : null

  const heroPhoto = arr(vendor.hero_photos)[0] || photos[0]?.full || null
  const aboutPhoto = arr(vendor.about_photos)[0] || vendor.about_photo_url || null
  const hasAbout = Boolean(vendor.description || facts.length || aboutPhoto)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setLightbox(null); setInquiry(null); return }
      if (!lightbox) return
      if (e.key === 'ArrowLeft') setLightbox(v => v && { ...v, i: (v.i - 1 + v.items.length) % v.items.length })
      if (e.key === 'ArrowRight') setLightbox(v => v && { ...v, i: (v.i + 1) % v.items.length })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  // Latar halaman dikunci selagi ada lapisan terbuka, kalau tidak halaman di
  // belakangnya ikut bergulir saat pengguna menggeser di dalam lightbox.
  useEffect(() => {
    if (!lightbox && !inquiry) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [lightbox, inquiry])

  useEffect(() => {
    if (inquiry) setTimeout(() => nameField.current?.focus(), 40)
  }, [inquiry])

  const openPhotos = (i) => setLightbox({
    items: photos.map(p => ({ src: p.full, cap: p.caption })), i,
  })
  const openTesti = (i) => setLightbox({
    items: testimonials.map(t => ({
      src: t.image || t.thumb,
      cap: [t.event, t.date && formatEventDate(t.date)].filter(Boolean).join(' · '),
    })),
    i,
  })

  const leadReady = lead.name.trim() && lead.address.trim() && lead.date

  const sendInquiry = (e) => {
    e.preventDefault()
    if (!inquiry || !leadReady || !wa) return
    const msg = [
      `Halo ${vendor.name}, saya mau ambil paket ${inquiry}.`,
      `Nama: ${lead.name.trim()}`,
      `Alamat acara: ${lead.address.trim()}`,
      `Tanggal acara: ${formatEventDate(lead.date)}`,
    ].join('\n')
    onTrack('wa_click')
    // window.open harus dipanggil langsung di dalam penangan submit. Ditunda
    // sedikit saja -- await, setTimeout -- dan pemblokir popup menutupnya.
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
    setInquiry(null)
  }

  const btnBase = {
    fontSize: 14, letterSpacing: '0.05em', borderRadius: 2,
    padding: '14px 26px', display: 'inline-block',
  }
  const tile = {
    margin: 0, position: 'relative', background: PAPER_2,
    border: `1px solid ${LINE}`, overflow: 'hidden', cursor: 'zoom-in',
  }

  const visiblePhotos = photos.slice(0, Math.max(shownPhotos, Math.min(12, photos.length)))

  return (
    <div className="mp">
      {/* ── Header ───────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(247, 244, 243, 0.88)', backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${LINE}`,
        boxShadow: scrolled ? '0 1px 14px rgba(36, 26, 34, 0.07)' : 'none',
        transition: 'box-shadow 180ms ease',
      }}>
        <div className="flex flex-wrap items-center" style={{
          maxWidth: 1240, margin: '0 auto', padding: '14px 24px', gap: 24,
        }}>
          <a href="#top" className="flex items-baseline" style={{ gap: 10, color: INK, minWidth: 0 }}>
            {vendor.logo_url ? (
              <img src={vendor.logo_url} alt={vendor.name} style={{
                height: 'clamp(24px, 2.6vw, 34px)', width: 'auto',
                maxWidth: 'min(52vw, 220px)', objectFit: 'contain', alignSelf: 'center',
              }} />
            ) : (
              <span className="mp-serif" style={{ fontSize: 20, letterSpacing: '0.01em' }}>{vendor.name}</span>
            )}
            {vendor.city && <Label style={{ whiteSpace: 'nowrap' }}>{vendor.city}</Label>}
          </a>
          <nav className="mp-nav flex flex-wrap" style={{
            marginLeft: 'auto', gap: 22, fontSize: 13, letterSpacing: '0.06em', color: INK_60,
          }}>
            {photos.length > 0 && <a href="#galeri" style={{ color: 'inherit' }}>Galeri</a>}
            {hasAbout && <a href="#tentang" style={{ color: 'inherit' }}>Tentang</a>}
            {groups.length > 0 && <a href="#paket" style={{ color: 'inherit' }}>Paket</a>}
            {testimonials.length > 0 && <a href="#testimoni" style={{ color: 'inherit' }}>Testimoni</a>}
            <a href="#kontak" style={{ color: 'inherit' }}>Kontak</a>
          </nav>
          <a href="#kontak" className="mp-btn-plum" style={{
            flex: 'none', padding: '9px 18px', background: PLUM, color: '#fff',
            borderRadius: 2, fontSize: 13, letterSpacing: '0.04em',
            border: `1px solid ${PLUM}`,
          }}>WhatsApp</a>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section id="top" className="flex flex-wrap items-center" style={{
        maxWidth: 1240, margin: '0 auto',
        padding: 'clamp(36px, 6vw, 84px) 24px clamp(28px, 4vw, 56px)',
        gap: 'clamp(28px, 5vw, 72px)',
      }}>
        <div style={{ flex: '1 1 380px', minWidth: 280 }}>
          {vendor.category && (
            <div className="flex items-center" style={{ gap: 10, marginBottom: 22 }}>
              <Dot />
              <span style={{
                fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', color: INK_60,
              }}>{vendor.category}</span>
            </div>
          )}
          <h1 className="mp-serif" style={{
            fontSize: 'clamp(38px, 6vw, 86px)', lineHeight: 1.02, letterSpacing: '-0.015em',
            margin: '0 0 20px', textWrap: 'pretty',
          }}>
            <Headline text={vendor.headline || vendor.name} accent={vendor.headline_accent} />
          </h1>
          {vendor.tagline && (
            <p style={{
              fontSize: FS_BODY, lineHeight: 1.65, color: INK_60, maxWidth: '44ch', margin: '0 0 28px',
            }}>{vendor.tagline}</p>
          )}
          <div className="flex flex-wrap" style={{ gap: 12, marginBottom: services.length ? 30 : 0 }}>
            <a href="#kontak" className="mp-btn-plum" style={{
              ...btnBase, background: PLUM, color: '#fff', border: `1px solid ${PLUM}`,
            }}>Hubungi via WhatsApp</a>
            {photos.length > 0 && (
              <a href="#galeri" className="mp-btn-line" style={{
                ...btnBase, border: `1px solid ${LINE}`, color: INK,
              }}>Lihat karya</a>
            )}
          </div>
          {services.length > 0 && (
            <div className="flex flex-wrap" style={{ gap: 8 }}>
              {services.map((s, i) => (
                <span key={i} style={{
                  padding: '6px 13px', border: `1px solid ${LINE}`, borderRadius: 999,
                  fontSize: 12, letterSpacing: '0.04em', color: INK_60,
                }}>{s}</span>
              ))}
            </div>
          )}
        </div>

        {/* Cermin rias: bingkai lengkung dengan bohlam di atasnya. Bohlamnya
            ada DI LUAR bidang foto -- kalau ia jadi cahaya di sekeliling foto,
            warna kulit di dalamnya ikut bergeser. */}
        <div style={{ flex: '1 1 340px', minWidth: 280, maxWidth: 520, margin: '0 auto' }}>
          <div style={{
            position: 'relative', padding: '26px 22px 22px', background: '#fff',
            border: `1px solid ${LINE}`, borderRadius: '999px 999px 6px 6px',
          }}>
            <div className="flex justify-center" aria-hidden="true" style={{
              position: 'absolute', top: 9, left: 0, right: 0, gap: 'clamp(14px, 3.4vw, 30px)',
            }}>
              {[0, 0.8, 1.9, 3.1, 4.2].map((d, i) => (
                <span key={i} className="mp-bulb" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
            <div className="grid place-items-center" style={{
              position: 'relative', aspectRatio: '3 / 4', background: PAPER_2,
              borderRadius: '999px 999px 6px 6px', overflow: 'hidden',
            }}>
              {heroPhoto ? (
                <img src={heroPhoto} alt={`Karya ${vendor.name}`} style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                }} />
              ) : (
                <span style={{
                  position: 'relative', fontSize: 11, letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: '#9A8F8B',
                }}>Foto hero 3:4</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Statistik ────────────────────────────────────────────── */}
      {stats.length > 0 && (
        <Reveal style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, background: '#fff' }}>
          <div className="grid" style={{
            maxWidth: 1240, margin: '0 auto', padding: 'clamp(24px, 3vw, 40px) 24px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 24,
          }}>
            {stats.map((s, i) => (
              <div key={i}>
                <div className="mp-serif" style={{ fontSize: 'clamp(28px, 3vw, 40px)', lineHeight: 1 }}>{s?.value}</div>
                <div style={{
                  fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: INK_60, marginTop: 8,
                }}>{s?.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {/* ── Galeri ───────────────────────────────────────────────── */}
      {photos.length > 0 && (
        <Reveal id="galeri" style={WRAP}>
          <SectionHead title="Galeri" sub="Klik foto untuk melihat detail riasan" bulb />
          <div className="grid" style={{
            gridTemplateColumns: photos.length === 1
              ? 'minmax(0, 420px)'
              : 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 14,
          }}>
            {visiblePhotos.map((p, i) => {
              // Ubin besar tiap tujuh foto, hanya saat galerinya sudah ramai.
              // Batas 560px bukan gaya: sumber thumb diunggah pada lebar 600px
              // dan mulai buram di atas itu.
              const big = photos.length >= 12 && i % 7 === 0
              return (
                <figure key={i} className="mp-tile" tabIndex={0} role="button"
                  aria-label={`Perbesar foto ${i + 1}`}
                  onClick={() => openPhotos(i)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPhotos(i) } }}
                  style={{
                    ...tile, aspectRatio: '3 / 4',
                    ...(big ? { gridColumn: 'span 2', gridRow: 'span 2', maxWidth: 560 } : null),
                  }}>
                  <img src={p.thumb} alt={p.caption || ''} loading="lazy" style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                  }} />
                </figure>
              )
            })}
          </div>
          {photos.length > visiblePhotos.length && (
            <div className="flex justify-center" style={{ marginTop: 26 }}>
              <button onClick={() => setShownPhotos(MAX_PHOTOS)} className="mp-btn-line" style={{
                padding: '12px 26px', background: 'none', border: `1px solid ${LINE}`,
                borderRadius: 2, fontSize: 13, letterSpacing: '0.06em', cursor: 'pointer',
              }}>Lihat semua foto</button>
            </div>
          )}
        </Reveal>
      )}

      {/* ── Sebelum & sesudah ────────────────────────────────────── */}
      {pairs.length > 0 && (
        <Reveal id="beforeafter" style={{
          background: '#fff', borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`,
        }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: `${PAD_Y} 24px` }}>
            <SectionHead title="Sebelum & sesudah" sub="Geser garisnya" />
            <div className="grid" style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 22,
            }}>
              {pairs.map((p, i) => <BeforeAfter key={i} pair={p} />)}
            </div>
          </div>
        </Reveal>
      )}

      {/* ── Tentang ──────────────────────────────────────────────── */}
      {hasAbout && (
        <Reveal id="tentang" className="flex flex-wrap" style={{
          maxWidth: 1240, margin: '0 auto', padding: `${PAD_Y} 24px`, gap: 'clamp(28px, 5vw, 64px)',
        }}>
          {aboutPhoto && (
            <div style={{ flex: '1 1 300px', minWidth: 260, maxWidth: 440 }}>
              <div style={{
                position: 'relative', aspectRatio: '4 / 5', background: PAPER_2,
                border: `1px solid ${LINE}`, overflow: 'hidden',
              }}>
                <img src={aboutPhoto} alt={`Tentang ${vendor.name}`} loading="lazy" style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                }} />
              </div>
            </div>
          )}
          <div style={{ flex: '1 1 380px', minWidth: 300 }}>
            <H2 style={{ marginBottom: 20 }}>{vendor.about_title || 'Tentang'}</H2>
            {String(vendor.description || '').split('\n\n').filter(Boolean).map((p, i) => (
              <p key={i} style={{
                fontSize: FS_BODY, lineHeight: 1.75, color: INK_60,
                margin: '0 0 20px', maxWidth: '56ch', textWrap: 'pretty',
              }}>{p}</p>
            ))}
            {facts.length > 0 && (
              <dl className="grid" style={{
                margin: '8px 0 0', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '18px 32px', borderTop: `1px solid ${LINE}`, paddingTop: 24,
              }}>
                {facts.map((f, i) => (
                  <div key={i}>
                    <dt><Label>{f?.label}</Label></dt>
                    <dd style={{ margin: '6px 0 0', fontSize: 16 }}>{f?.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </Reveal>
      )}

      {/* ── Paket ────────────────────────────────────────────────── */}
      {groups.length > 0 && (
        <Reveal id="paket" style={{ background: '#fff', borderTop: `1px solid ${LINE}` }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: `${PAD_Y} 24px` }}>
            <div className="flex flex-wrap items-end" style={{ gap: 16, marginBottom: 12 }}>
              <H2>Paket</H2>
              <span aria-hidden="true" style={{ flex: 1, height: 1, background: LINE, marginBottom: 12 }} />
            </div>
            {vendor.package_note && (
              <p style={{ fontSize: 14, color: INK_60, margin: '0 0 34px', maxWidth: '60ch' }}>
                {vendor.package_note}
              </p>
            )}
            <div className="grid" style={{ gap: 44 }}>
              {groups.map((g, gi) => (
                <div key={gi}>
                  {g.group && (
                    <div className="flex items-baseline" style={{ gap: 14, marginBottom: 18 }}>
                      <h3 className="mp-serif" style={{
                        fontSize: 'clamp(17px, 1.5vw, 21px)', letterSpacing: '0.02em', margin: 0,
                      }}>{g.group}</h3>
                      {g.note && <span style={{ fontSize: 12, color: INK_60 }}>{g.note}</span>}
                      <span aria-hidden="true" style={{ flex: 1, height: 1, background: LINE }} />
                    </div>
                  )}
                  <div className="grid" style={{
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16,
                  }}>
                    {g.items.map((it, ii) => (
                      <div key={ii} className="flex flex-col" style={{
                        border: `1px solid ${it?.highlight ? PLUM : LINE}`,
                        background: PAPER, padding: 24, gap: 14,
                      }}>
                        <div className="flex items-start" style={{ gap: 10 }}>
                          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 500, letterSpacing: '0.02em' }}>
                            {it?.name}
                          </h4>
                          {it?.note && (
                            <span style={{
                              marginLeft: 'auto', fontSize: 10, letterSpacing: '0.14em',
                              textTransform: 'uppercase', color: PLUM, border: `1px solid ${PLUM}`,
                              padding: '3px 7px', whiteSpace: 'nowrap',
                            }}>{it.note}</span>
                          )}
                        </div>
                        {it?.price && (
                          <div className="mp-serif" style={{ fontSize: 26, lineHeight: 1 }}>{it.price}</div>
                        )}
                        <ul className="grid" style={{
                          margin: 0, padding: 0, listStyle: 'none', gap: 8,
                          fontSize: 13.5, color: INK_60, lineHeight: 1.5,
                        }}>
                          {/* Fitur boleh berupa string biasa atau {text, heading}.
                              Merendernya mentah-mentah membuat React melempar
                              "Objects are not valid as a React child" -- dan itu
                              layar kosong di depan calon klien vendor. */}
                          {arr(it?.features).slice(0, MAX_FEATURES).map(normFeature)
                            .filter(f => f.text)
                            .map((f, fi) => (f.heading ? (
                              <li key={fi} style={{
                                listStyle: 'none', marginTop: fi === 0 ? 0 : 6,
                                fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                                color: INK, fontWeight: 500,
                              }}>{f.text}</li>
                            ) : (
                              <li key={fi} className="flex" style={{ gap: 9 }}>
                                <Dot size={5} style={{ marginTop: 7 }} />
                                <span>{f.text}</span>
                              </li>
                            )))}
                        </ul>
                        <button
                          onClick={() => { setInquiry(it?.name || ''); setLead({ name: '', address: '', date: '' }) }}
                          className={it?.highlight ? 'mp-btn-plum' : 'mp-btn-line'}
                          style={{
                            marginTop: 'auto', padding: 12,
                            background: it?.highlight ? PLUM : 'transparent',
                            color: it?.highlight ? '#fff' : INK,
                            border: `1px solid ${it?.highlight ? PLUM : LINE}`,
                            borderRadius: 2, cursor: 'pointer', fontSize: 13, letterSpacing: '0.06em',
                          }}>Ambil paket</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {vendor.package_footnote && (
              <p style={{ fontSize: 13, color: INK_60, margin: '34px 0 0' }}>{vendor.package_footnote}</p>
            )}
          </div>
        </Reveal>
      )}

      {/* ── Testimoni ────────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <Reveal id="testimoni" style={WRAP}>
          <SectionHead title="Kata pengantinnya" sub="Tangkapan layar asli, klik untuk memperbesar" />
          {/* Dinding bukti: ubin kecil dan banyak. Jumlahnya sendiri yang jadi
              argumennya -- ditata sebagai kartu kutipan besar satu per satu,
              yang tersisa justru kesan dibuat-buat. */}
          <div className="grid" style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))', gap: 12,
          }}>
            {testimonials.map((t, i) => (
              <figure key={i} className="mp-tile" tabIndex={0} role="button"
                onClick={() => openTesti(i)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTesti(i) } }}
                style={{ margin: 0, cursor: 'zoom-in', background: 'none', border: 'none' }}>
                <div style={{
                  position: 'relative', aspectRatio: '9 / 16', background: PAPER_2,
                  border: `1px solid ${LINE}`, overflow: 'hidden',
                }}>
                  <img src={t?.thumb || t?.image} alt={`Testimoni ${t?.event || ''}`} loading="lazy" style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                  }} />
                </div>
                <figcaption style={{ marginTop: 7, fontSize: 11, lineHeight: 1.4, color: INK_60 }}>
                  {t?.event}
                  {t?.date && <><br /><span style={{ opacity: 0.7 }}>{formatEventDate(t.date)}</span></>}
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      )}

      {/* ── Kontak ───────────────────────────────────────────────── */}
      <Reveal id="kontak" style={{ background: INK, color: '#F4EFF1' }}>
        <div className="flex flex-wrap" style={{
          maxWidth: 1240, margin: '0 auto', padding: 'clamp(48px, 7vw, 90px) 24px',
          gap: 'clamp(28px, 5vw, 64px)',
        }}>
          <div style={{ flex: '1 1 320px' }}>
            <H2 style={{ color: '#fff', marginBottom: 16 }}>Ceritakan hari kamu</H2>
            <p style={{
              fontSize: FS_BODY, lineHeight: 1.7, color: 'rgba(244, 239, 241, 0.7)',
              margin: '0 0 28px', maxWidth: '44ch',
            }}>Kirim tanggal dan lokasi acara. Balasan biasanya di hari yang sama.</p>
            {waHref && (
              <a href={waHref} target="_blank" rel="noopener noreferrer"
                onClick={() => onTrack('wa_click')}
                className="mp-btn-white" style={{
                  ...btnBase, padding: '15px 28px', background: '#fff', color: INK,
                }}>Chat WhatsApp</a>
            )}
          </div>
          <div className="grid" style={{
            flex: '1 1 260px', gap: 20, alignContent: 'start', fontSize: 15,
          }}>
            {waDisplay(vendor.whatsapp) && (
              <div>
                <Label style={{ color: 'rgba(244, 239, 241, 0.5)', display: 'block', marginBottom: 6 }}>WhatsApp</Label>
                <span>{waDisplay(vendor.whatsapp)}</span>
              </div>
            )}
            {ig && (
              <div>
                <Label style={{ color: 'rgba(244, 239, 241, 0.5)', display: 'block', marginBottom: 6 }}>Instagram</Label>
                <a className="mp-ig" href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer"
                  style={{ color: BULB }}>@{ig}</a>
              </div>
            )}
            {vendor.city && (
              <div>
                <Label style={{ color: 'rgba(244, 239, 241, 0.5)', display: 'block', marginBottom: 6 }}>Kota</Label>
                <span>{vendor.city}</span>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* ── Blok undangan Ulema ──────────────────────────────────── */}
      <section style={{ background: PAPER }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(44px, 6vw, 80px) 24px' }}>
          <div className="flex flex-wrap items-center" style={{
            border: `1px solid ${LINE}`, background: '#fff',
            padding: 'clamp(26px, 4vw, 44px)', gap: 32,
          }}>
            <div style={{ flex: '1 1 320px' }}>
              <Label style={{ letterSpacing: '0.24em', display: 'block', marginBottom: 14 }}>
                Undangan digital Ulema
              </Label>
              <h3 className="mp-serif" style={{
                fontSize: 'clamp(22px, 2.6vw, 32px)', margin: '0 0 12px', lineHeight: 1.15,
              }}>Undangannya sekalian, dari orang yang sama</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: INK_60, margin: 0, maxWidth: '48ch' }}>
                Pakai kode di samping saat memesan undangan digital Ulema dan dapat potongan {rp(REFERRAL_DISCOUNT_AMOUNT)}.
              </p>
            </div>
            <div className="grid" style={{ flex: '1 1 260px', gap: 12 }}>
              {vendor.referral_code && (
                <button onClick={onCopy} aria-label={`Salin kode ${vendor.referral_code}`}
                  className="mp-copy flex items-center justify-between" style={{
                    gap: 16, padding: '16px 20px', background: PAPER,
                    border: `1px dashed ${PLUM}`, borderRadius: 2, cursor: 'pointer', textAlign: 'left',
                  }}>
                  <span>
                    <Label style={{ display: 'block', marginBottom: 5 }}>Kode referal</Label>
                    <span className="mp-serif" style={{
                      fontSize: 24, letterSpacing: '0.06em', color: PLUM,
                    }}>{vendor.referral_code}</span>
                  </span>
                  <span style={{ fontSize: 12, letterSpacing: '0.08em', color: PLUM, whiteSpace: 'nowrap' }}>
                    {copied ? 'Tersalin' : 'Salin'}
                  </span>
                </button>
              )}
              {/* Kodenya ikut dibawa, tidak cuma ditampilkan untuk disalin.
                  Menyalin lalu mengetik ulang berbulan-bulan kemudian adalah
                  langkah paling mudah gagal di seluruh rantai komisi -- dan
                  kalau gagal, tidak ada yang tahu: pembeli tetap membayar,
                  cuma vendornya yang tidak dapat apa-apa. */}
              <Link to="/#katalog"
                onClick={() => { rememberReferral(vendor.referral_code); onTrack('catalog_click') }}
                className="mp-btn-plum" style={{
                  padding: '14px 22px', background: PLUM, color: '#fff', textAlign: 'center',
                  fontSize: 14, letterSpacing: '0.05em', borderRadius: 2, border: `1px solid ${PLUM}`,
                }}>Lihat katalog undangan</Link>
            </div>
          </div>
          <p style={{
            textAlign: 'center', fontSize: 12, letterSpacing: '0.06em', color: INK_60, margin: '28px 0 0',
          }}>
            Halaman vendor oleh <Link to="/" style={{ color: PLUM }}>Ulema</Link> · {vendor.name}
          </p>
        </div>
      </section>

      {/* ── Lightbox ─────────────────────────────────────────────── */}
      {lightbox && (
        <div className="mp-lb flex items-center justify-center" role="dialog" aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setLightbox(null) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 90,
            background: 'rgba(20, 14, 18, 0.94)', padding: 24,
          }}>
          <button onClick={() => setLightbox(null)} aria-label="Tutup" style={{
            position: 'absolute', top: 18, right: 20, width: 42, height: 42,
            background: 'none', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#fff',
            borderRadius: '50%', cursor: 'pointer', fontSize: 18,
          }}>×</button>
          {lightbox.items.length > 1 && ['prev', 'next'].map(dir => (
            <button key={dir} aria-label={dir === 'prev' ? 'Sebelumnya' : 'Berikutnya'}
              onClick={() => setLightbox(v => v && {
                ...v, i: (v.i + (dir === 'prev' ? -1 : 1) + v.items.length) % v.items.length,
              })}
              style={{
                position: 'absolute', [dir === 'prev' ? 'left' : 'right']: 14, top: '50%',
                transform: 'translateY(-50%)', width: 44, height: 44, background: 'none',
                border: '1px solid rgba(255, 255, 255, 0.3)', color: '#fff',
                borderRadius: '50%', cursor: 'pointer',
              }}>{dir === 'prev' ? '‹' : '›'}</button>
          ))}
          <figure className="flex flex-col items-center" style={{
            margin: 0, maxWidth: 'min(92vw, 900px)', maxHeight: '88vh', gap: 12,
          }}>
            <img src={lightbox.items[lightbox.i]?.src} alt={lightbox.items[lightbox.i]?.cap || ''} style={{
              maxWidth: '100%', maxHeight: '78vh', objectFit: 'contain', background: '#2A2027',
            }} />
            {lightbox.items[lightbox.i]?.cap && (
              <figcaption style={{
                color: 'rgba(255, 255, 255, 0.7)', fontSize: 13,
                letterSpacing: '0.05em', textAlign: 'center',
              }}>{lightbox.items[lightbox.i].cap}</figcaption>
            )}
          </figure>
        </div>
      )}

      {/* ── Formulir sebelum WhatsApp ────────────────────────────── */}
      {inquiry !== null && (
        <div className="flex items-center justify-center" role="dialog" aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setInquiry(null) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 95, background: 'rgba(20, 14, 18, 0.6)', padding: 20,
          }}>
          <form onSubmit={sendInquiry} className="grid" style={{
            background: '#fff', width: 'min(100%, 440px)', padding: 'clamp(24px, 4vw, 36px)',
            borderRadius: 6, gap: 16, maxHeight: '92vh', overflowY: 'auto',
          }}>
            <div>
              <Label style={{ letterSpacing: '0.22em', display: 'block', marginBottom: 8 }}>Ambil paket</Label>
              <h3 className="mp-serif" style={{ fontSize: 26, margin: 0, lineHeight: 1.15 }}>{inquiry}</h3>
            </div>
            <Field label="Nama" value={lead.name} inputRef={nameField} placeholder="Nama kamu"
              onChange={(v) => setLead(s => ({ ...s, name: v }))} maxLength={60} />
            <Field label="Alamat acara" value={lead.address} placeholder="Gedung / alamat"
              onChange={(v) => setLead(s => ({ ...s, address: v }))} maxLength={120} />
            <Field label="Tanggal acara" value={lead.date} type="date"
              onChange={(v) => setLead(s => ({ ...s, date: v }))} />
            <div className="flex" style={{ gap: 10, marginTop: 6 }}>
              <button type="button" onClick={() => setInquiry(null)} className="mp-btn-line" style={{
                flex: 1, padding: 13, background: 'none', border: `1px solid ${LINE}`,
                borderRadius: 2, cursor: 'pointer', fontSize: 14,
              }}>Batal</button>
              <button type="submit" disabled={!leadReady || !wa} className="mp-btn-plum" style={{
                flex: 2, padding: 13, background: PLUM, color: '#fff', border: `1px solid ${PLUM}`,
                borderRadius: 2, cursor: leadReady && wa ? 'pointer' : 'not-allowed',
                fontSize: 14, letterSpacing: '0.04em', opacity: leadReady && wa ? 1 : 0.55,
              }}>Lanjut ke WhatsApp</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

/**
 * Headline dengan satu potongan miring berwarna plum.
 *
 * Aksennya hanya dipakai kalau ia benar-benar ada di dalam headline. Kalau
 * tidak cocok persis, headline-nya tampil polos -- lebih baik daripada
 * memotong kalimat vendor di tempat yang salah.
 */
function Headline({ text, accent }) {
  const full = String(text || '')
  const acc = String(accent || '')
  const at = acc ? full.indexOf(acc) : -1
  if (at < 0) return full
  return (
    <>
      {full.slice(0, at)}
      <em style={{ fontStyle: 'italic', color: PLUM }}>{acc}</em>
      {full.slice(at + acc.length)}
    </>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, maxLength, inputRef }) {
  return (
    <label className="grid" style={{
      gap: 6, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: INK_60,
    }}>
      {label}
      <input
        ref={inputRef}
        type={type}
        required
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '12px 14px', border: `1px solid ${LINE}`, borderRadius: 2,
          fontSize: 15, letterSpacing: 'normal', textTransform: 'none', color: INK,
          background: '#fff',
        }}
      />
    </label>
  )
}
