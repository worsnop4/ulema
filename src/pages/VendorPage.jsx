import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchVendorBySlug, logVendorEvent } from '../services/vendorService'
import { formatEventDate, mosaicStep, normFeature } from '../config/vendorContent'
import { rememberReferral } from '../config/referral'
import { REFERRAL_DISCOUNT_AMOUNT } from '../config/constants'
import VendorMilaPutri from './VendorMilaPutri'
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

/**
 * Packages arrive either flat — [{name, price, features}] — or grouped:
 * [{group, note, items:[…]}]. A vendor with one price list wants the flat
 * form; a photographer whose list is genuinely split into Prewedding /
 * Wedding / All-in loses real information if that split is flattened away.
 * Both normalise to the grouped shape so the renderer only knows one.
 */
const normPackages = (packages) => {
  const raw = arr(packages)
  const grouped = raw.filter(g => Array.isArray(g?.items))
  if (grouped.length) {
    return grouped
      .map(g => ({
        group: g.group || '',
        note: g.note || '',
        items: arr(g.items).filter(p => p?.name),
      }))
      .filter(g => g.items.length)
  }
  const flat = raw.filter(p => p?.name)
  return flat.length ? [{ group: '', note: '', items: flat }] : []
}
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

/** Satu foto potret sebagai latar blok, dengan scrim gradien yang meleburkan
 *  tepinya ke latar halaman dan membuat teks di atasnya terbaca. */
const PhotoBand = ({ src, eager = false }) => {
  if (!src) return null
  return (
    <div className="vp-band-photo" aria-hidden="true">
      <img src={src} alt="" loading={eager ? 'eager' : 'lazy'} />
      <span className="vp-band-scrim" />
    </div>
  )
}

const VpField = ({ label, value, onChange, type = 'text', placeholder, maxLength, autoFocus }) => (
  <label style={{ display: 'block' }}>
    <span className="font-archivo" style={{
      display: 'block', marginBottom: 7, fontSize: 9, letterSpacing: '0.22em',
      textTransform: 'uppercase', color: 'rgba(234,224,212,0.55)',
    }}>{label}</span>
    <input
      type={type} value={value} placeholder={placeholder} maxLength={maxLength}
      autoFocus={autoFocus} onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', background: C.well, color: C.hi,
        border: `1px solid ${C.line}`, borderRadius: 12,
        padding: '13px 15px', fontSize: 14, fontFamily: 'inherit',
        /* Pemilih tanggal bawaan menggambar ikonnya gelap, jadi ia hilang di
           latar sekelam ini. */
        colorScheme: 'dark',
      }}
    />
  </label>
)

const Arrow = ({ dir, onClick, label }) => (
  <button onClick={onClick} aria-label={label}
    className="flex items-center justify-center vp-btn vp-btn-outline"
    style={{
      flex: '0 0 auto', width: 42, height: 42, borderRadius: '50%',
      background: 'transparent', border: `1px solid ${C.goldLine}`,
      color: C.goldSoft, fontSize: 16, cursor: 'pointer',
    }}>
    {dir === 'prev' ? '\u2039' : '\u203A'}
  </button>
)

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

/**
 * Buku alamat halaman vendor, bukan menu.
 *
 * Kolom vendors.theme diisi admin sekali saat vendor bergabung; ia tidak ada
 * di dashboard vendor dan tidak lewat update_vendor_content. Alasannya di
 * docs/ARSITEKTUR_HALAMAN_VENDOR.md -- keautentikan adalah nilai jual halaman
 * ini, jadi tiap vendor punya desainnya sendiri, bukan memilih milik vendor
 * lain.
 */
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

  const props = { vendor, copied, onCopy: handleCopy, onTrack: track }

  /* Pemilihan halamannya ditulis terbuka, bukan lewat tabel yang dibaca saat
   * render: komponen yang datang dari sebuah variabel akan kehilangan
   * seluruh state-nya setiap identitasnya berubah, dan React memang
   * melarangnya. Menambah vendor berarti menambah satu case di sini.
   *
   * Tema yang tidak dikenal jatuh ke desain pertama dan TIDAK membuat halaman
   * gagal -- tapi jatuhnya disebut namanya. Tema undangan pernah kena versi
   * diam dari ini: fallback-nya themes[0], "baris pertama menurut id",
   * sehingga sebuah undangan bisa tampil dengan palet dan tata letak yang
   * sama sekali berbeda tanpa satu pun error di mana pun. */
  switch (vendor.theme) {
    case 'mila-putri': return <VendorMilaPutri {...props} />
    case 'fm-project':
    default: return <VendorPageView {...props} />
  }
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
  // Paket yang sedang ditanyakan. null = formulir tertutup.
  const [inquiry, setInquiry] = useState(null)
  const [lead, setLead] = useState({ name: '', address: '', date: '' })
  // Kategori paket yang dipilih, dan paket ke berapa di dalamnya.
  const [pkgGroup, setPkgGroup] = useState(0)
  const [pkgIndex, setPkgIndex] = useState(0)
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
    const onKey = (e) => { if (e.key === 'Escape') { setLightbox(null); setInquiry(null) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const wa = waNumber(vendor.whatsapp)
  const waHref = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${vendor.name}, saya ingin konsultasi untuk pernikahan saya.`)}`
    : null
  const ig = vendor.instagram ? String(vendor.instagram).replace(/^@/, '') : null

  // Satu foto per pita. hero_photos dan about_photos tetap berupa larik supaya
  // vendor bisa mengganti pilihannya tanpa migrasi -- yang dipakai elemen
  // pertama.
  const listed = (v) => arr(v).filter(x => typeof x === 'string' && x)
  const heroPhoto = listed(vendor.hero_photos)[0] || photos[0]?.full || null
  const aboutPhoto = listed(vendor.about_photos)[0]
    || vendor.about_photo_url
    || photos[photos.length - 1]?.full
    || null

  const stats = arr(vendor.stats).filter(s => s?.value)
  const facts = arr(vendor.facts).filter(f => f?.label)
  const packageGroups = normPackages(vendor.packages)
  const packageCount = packageGroups.reduce((n, g) => n + g.items.length, 0)
  const testimonials = arr(vendor.testimonials).filter(t => t?.image)
  const hasPrice = vendor.price_from || vendor.price_to
  const useMosaic = n >= MOSAIC_MIN_PHOTOS

  // Kategori aktif dan paket aktif, dijaga tetap di dalam rentang supaya
  // berpindah kategori tidak pernah menunjuk paket yang tidak ada.
  const curGroup = packageGroups.length ? Math.min(pkgGroup, packageGroups.length - 1) : 0
  const group = packageGroups[curGroup]
  const items = group?.items || []
  const curIndex = items.length ? pkgIndex % items.length : 0

  const visiblePkgs = items.length === 0 ? []
    : items.length === 1 ? [{ p: items[0], center: true, slot: 'c' }]
    : items.length === 2 ? [
        { p: items[curIndex], center: true, slot: 'c' },
        { p: items[(curIndex + 1) % 2], center: false, slot: 'n' },
      ]
    : [
        { p: items[(curIndex - 1 + items.length) % items.length], center: false, slot: 'p' },
        { p: items[curIndex], center: true, slot: 'c' },
        { p: items[(curIndex + 1) % items.length], center: false, slot: 'n' },
      ]

  // Pesan yang sudah membawa data acara, bukan sekadar nama paket. Yang
  // pertama ditanyakan fotografer selalu sama -- tanggal dan lokasinya --
  // jadi menaruhnya di pesan pembuka memotong satu putaran bolak-balik.
  const pkgWaHref = (p, l) => {
    if (!wa) return null
    const lines = [
      `Halo ${vendor.name}, saya tertarik dengan paket ${p.name}${p.price ? ` (${p.price})` : ''}.`,
      '',
      `Nama: ${l.name.trim()}`,
      `Alamat: ${l.address.trim()}`,
      `Tanggal acara: ${formatEventDate(l.date)}`,
      '',
      'Boleh minta info ketersediaan tanggalnya?',
    ]
    return `https://wa.me/${wa}?text=${encodeURIComponent(lines.join('\n'))}`
  }

  const leadReady = lead.name.trim() && lead.address.trim() && lead.date

  const sendInquiry = (e) => {
    e.preventDefault()
    if (!inquiry || !leadReady) return
    // window.open dipanggil langsung di dalam penanganan klik, tanpa await
    // apa pun sebelumnya: begitu ada jeda asinkron, peramban memperlakukannya
    // sebagai jendela yang dibuka sendiri oleh halaman dan memblokirnya.
    onTrack('wa_click')
    window.open(pkgWaHref(inquiry, lead), '_blank', 'noopener')
    setInquiry(null)
  }

  // 36 ubin dari n foto, diambil melompat supaya ubin bersebelahan tidak
  // menampilkan foto berurutan. Langkahnya harus koprima dengan n, kalau
  // tidak ia hanya berputar di sebagian kecil arsip: dengan 14 foto, langkah
  // 7 cuma menampilkan 2 foto yang diulang 18 kali. Dulu ini tidak terlihat
  // karena jumlah fotonya tetap 20; begitu vendor bisa menambah dan mengurangi
  // sendiri, angka seperti 14, 21, dan 28 jadi mungkin.
  const tiles = useMosaic
    ? Array.from({ length: MOSAIC_TILES }, (_, k) => photos[(k * mosaicStep(n)) % n])
    : []

  const NAV = [
    ['#galeri', 'Galeri'],
    vendor.description || facts.length ? ['#tentang', 'Tentang'] : null,
    packageCount ? ['#paket', 'Paket'] : null,
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
        {/* Logo kalau ada, nama kalau tidak. Halaman ini gelap, jadi logo yang
            disimpan di logo_url memang harus versi yang terbaca di latar
            gelap -- bukan versi gelap yang dibalik lewat CSS filter, karena
            filter itu akan menghancurkan logo vendor berikutnya yang
            kebetulan berwarna. */}
        <a href="#top" className="flex items-center" style={{ minWidth: 0 }}>
          {vendor.logo_url ? (
            <img src={vendor.logo_url} alt={vendor.name} style={{
              height: 'clamp(22px, 2.4vw, 30px)', width: 'auto',
              maxWidth: 'min(52vw, 240px)', objectFit: 'contain', display: 'block',
            }} />
          ) : (
            <span className="font-archivo" style={{
              fontSize: 13, fontWeight: 500, letterSpacing: '0.3em',
              textTransform: 'uppercase', color: C.hi2, whiteSpace: 'nowrap',
            }}>{vendor.name}</span>
          )}
        </a>

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
      <section id="top" className="vp-band flex" style={{
        minHeight: 'min(88vh, 780px)', alignItems: 'stretch',
        padding: 'clamp(28px, 4vw, 44px) clamp(18px, 3vw, 28px) clamp(38px, 5vw, 56px)',
      }}>
        <PhotoBand src={heroPhoto} eager />

        <div className="absolute pointer-events-none" style={{
          left: '-6%', top: '-12%', width: '46%', height: '70%',
          background: 'radial-gradient(closest-side, rgba(201,169,124,0.26), rgba(201,169,124,0) 100%)',
          filter: 'blur(60px)',
        }} />

        <div className="vp-band-text relative flex flex-col justify-between" style={{
          zIndex: 2, flex: 1, maxWidth: '46%',
          gap: 'clamp(28px, 4vw, 48px)', padding: 'clamp(16px, 3vw, 36px) 12px 12px',
        }}>
          <Eyebrow style={{ letterSpacing: '0.32em' }}>
            {vendor.category}{vendor.city ? ` \u00B7 ${vendor.city}` : ''}
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
              <p style={{ margin: 0, maxWidth: '44ch', fontSize: 15, lineHeight: 1.9, color: 'rgba(234,224,212,0.72)' }}>
                {vendor.tagline}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center" style={{ gap: 12 }}>
            <a href="#galeri" className="font-archivo vp-btn vp-btn-gold" style={{
              fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase',
              background: C.gold, color: C.onGold, padding: '17px 30px', borderRadius: 999,
            }}>Lihat galeri</a>
            <a href={packageCount ? '#paket' : '#kontak'} className="font-archivo vp-btn vp-btn-ghost" style={{
              fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase',
              border: '1px solid rgba(234,224,212,0.38)', padding: '17px 30px', borderRadius: 999,
              background: 'rgba(13,11,10,0.35)',
            }}>{packageCount ? 'Paket & harga' : 'Hubungi kami'}</a>
          </div>
        </div>
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
        <section id="tentang" className="vp-band vp-band--flip flex justify-end" style={{
          minHeight: 'min(72vh, 660px)', alignItems: 'center',
          padding: 'clamp(44px, 7vw, 88px) clamp(18px, 3vw, 28px)',
        }}>
          <PhotoBand src={aboutPhoto} />

          <div className="vp-band-text relative" style={{ zIndex: 2, flex: 1, maxWidth: '46%' }}>
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
                color: 'rgba(234,224,212,0.76)', maxWidth: '56ch', textWrap: 'pretty',
              }}>{para}</p>
            ))}

            {facts.length > 0 && (
              <div className="vp-facts grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
                {facts.map((f, k) => (
                  <div key={k} style={{
                    border: `1px solid ${C.line}`, borderRadius: 20, padding: '22px 24px',
                    background: 'rgba(17,14,12,0.82)', backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
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
      {packageCount > 0 && (
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

            {/* Tab kategori. Enam kelompok yang ditampilkan sekaligus
                membanjiri halaman, jadi satu kelompok saja per waktu. */}
            {packageGroups.length > 1 && (
              <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 28 }} role="tablist">
                {packageGroups.map((g, k) => {
                  const on = k === curGroup
                  return (
                    <button key={k} role="tab" aria-selected={on}
                      onClick={() => { setPkgGroup(k); setPkgIndex(0) }}
                      className="font-archivo vp-btn" style={{
                        fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                        cursor: 'pointer', borderRadius: 999, padding: '10px 18px',
                        color: on ? C.onGold : 'rgba(234,224,212,0.75)',
                        background: on ? 'linear-gradient(135deg, #C4A771, #E7D3AA)' : 'transparent',
                        border: `1px solid ${on ? 'transparent' : 'rgba(201,169,124,0.3)'}`,
                      }}>{g.group || `Paket ${k + 1}`}</button>
                  )
                })}
              </div>
            )}

            {group?.note && (
              <p style={{ margin: '0 0 22px', fontSize: 13, lineHeight: 1.7, color: C.faint }}>
                {group.note}
              </p>
            )}

            {/* Panah adalah saudara flex dari barisnya, bukan elemen absolute
                -- itu yang mencegah kartu samping menabraknya di layar sempit. */}
            <div className="flex items-center" style={{ gap: 'clamp(6px, 1.6vw, 18px)' }}>
              {items.length > 1 && (
                <Arrow dir="prev" label="Paket sebelumnya"
                  onClick={() => setPkgIndex(v => (v - 1 + items.length) % items.length)} />
              )}

              <div className="flex justify-center items-stretch overflow-hidden"
                style={{ flex: 1, minWidth: 0, gap: 'clamp(10px, 1.6vw, 18px)' }}>
                {visiblePkgs.map(({ p, center, slot }) => (
                  <div key={slot} className="flex flex-col" style={{
                    flex: '0 0 auto', width: center ? 'min(400px, 100%)' : 'clamp(180px, 24vw, 300px)',
                    borderRadius: 26, padding: 'clamp(24px, 3.4vw, 36px) clamp(20px, 2.6vw, 30px)',
                    border: `1px solid ${center ? 'rgba(201,169,124,0.5)' : 'rgba(234,224,212,0.12)'}`,
                    background: center
                      ? 'linear-gradient(180deg, rgba(201,169,124,0.1), rgba(201,169,124,0.015))'
                      : 'transparent',
                    boxShadow: center ? '0 24px 60px rgba(0,0,0,0.5)' : 'none',
                    opacity: center ? 1 : 0.4,
                    transform: `scale(${center ? 1 : 0.96})`,
                    transition: 'all .5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}>
                    <p className="font-archivo" style={{
                      margin: '0 0 12px', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
                      color: center ? C.goldLabel : 'rgba(234,224,212,0.55)',
                    }}>{p.name}{p.note ? ` \u00B7 ${p.note}` : ''}</p>

                    <p className="font-archivo" style={{
                      margin: '0 0 24px', fontSize: center ? 'clamp(26px, 3.2vw, 34px)' : 'clamp(19px, 2.2vw, 24px)',
                      fontWeight: 300, letterSpacing: '0.02em', color: center ? C.hi3 : C.hi2,
                    }}>{p.price}</p>

                    <ul className="grid" style={{
                      margin: 0, padding: 0, listStyle: 'none', gap: 10, flex: 1,
                      fontSize: center ? 14 : 13, lineHeight: 1.6,
                      color: center ? 'rgba(234,224,212,0.85)' : 'rgba(234,224,212,0.7)',
                    }}>
                      {/* Rincian boleh berbentuk teks polos atau objek judul
                          bagian. Merendernya langsung akan melempar "Objects
                          are not valid as a React child", yang oleh batas galat
                          tema berubah jadi halaman rusak tanpa petunjuk apa
                          pun soal penyebabnya. */}
                      {arr(p.features).map(normFeature).filter(f => f.text).map((f, j) => (
                        f.heading
                          ? <li key={j} className="font-archivo" style={{
                              listStyle: 'none', marginTop: j === 0 ? 0 : 10,
                              fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
                              color: C.goldLabel,
                            }}>{f.text}</li>
                          : <li key={j}>{f.text}</li>
                      ))}
                    </ul>

                    {center && waHref && (
                      <button type="button" onClick={() => setInquiry(p)}
                        className="font-archivo vp-btn vp-btn-gold text-center" style={{
                          marginTop: 28, fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
                          background: C.gold, color: C.onGold, padding: '16px 24px', borderRadius: 999,
                          border: 0, cursor: 'pointer', width: '100%',
                        }}>Ambil paket</button>
                    )}
                  </div>
                ))}
              </div>

              {items.length > 1 && (
                <Arrow dir="next" label="Paket berikutnya"
                  onClick={() => setPkgIndex(v => (v + 1) % items.length)} />
              )}
            </div>

            {items.length > 1 && (
              <div className="flex justify-center" style={{ gap: 7, marginTop: 30 }}>
                {items.map((p, k) => (
                  <button key={k} onClick={() => setPkgIndex(k)} aria-label={`Paket ${k + 1}`}
                    style={{
                      width: k === curIndex ? 30 : 10, height: 3, borderRadius: 999, border: 0, padding: 0,
                      cursor: 'pointer', transition: 'all 0.35s ease',
                      background: k === curIndex ? C.gold : 'rgba(201,169,124,0.28)',
                    }} />
                ))}
              </div>
            )}

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
          {/* Dinding bukti, bukan carousel. Testimoni berupa tangkapan layar
              bekerja lewat jumlahnya: melihat dua puluh percakapan sekaligus
              meyakinkan dengan cara yang tidak bisa ditiru satu kartu besar.
              Carousel justru menyembunyikan berapa banyak yang ada.
              auto-fill, bukan jumlah kolom tetap: ubinnya menyempit sampai
              batas terkecil lalu barisnya pecah sendiri, jadi tiga di ponsel
              dan lima sampai tujuh di layar lebar tanpa titik henti manual. */}
          <div className="vp-testimonials grid" style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(96px, 16vw, 260px), 1fr))',
            gap: 'clamp(10px, 1.2vw, 16px)',
          }}>
            {testimonials.map((t, k) => (
              <figure key={k} style={{
                margin: 0, border: `1px solid ${C.line}`, borderRadius: 14,
                background: C.surface, overflow: 'hidden',
              }}>
                {/* Dipotong dari atas, bukan dari tengah: percakapan dibaca
                    dari atas ke bawah, jadi bagian atas yang paling berguna
                    sebagai pratinjau. Utuhnya dibuka lewat lightbox -- di
                    ukuran ubin ini tulisannya memang belum terbaca, dan itu
                    tidak apa-apa: yang dikenali sekilas adalah bentuk
                    percakapannya, bukan kata-katanya. */}
                <button type="button" onClick={() => setLightbox(t.image)}
                  aria-label={`Perbesar testimoni ${t.event || k + 1}`}
                  className="vp-testimoni-shot"
                  style={{
                    display: 'block', width: '100%', border: 0, padding: 0,
                    background: C.well, cursor: 'zoom-in', aspectRatio: '4 / 5',
                  }}>
                  {/* Ubin memakai ukuran kecil; yang penuh baru diunduh saat
                      dibuka di lightbox. Baris lama tanpa thumb jatuh kembali
                      ke gambar penuh, jadi tidak ada yang kosong. */}
                  <img src={t.thumb || t.image} alt="" loading="lazy" style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    objectPosition: 'top', display: 'block',
                  }} />
                </button>
                <figcaption style={{ padding: 'clamp(8px, 0.9vw, 13px) clamp(9px, 1vw, 14px) clamp(10px, 1.1vw, 15px)' }}>
                  <p className="vp-testimoni-event" style={{
                    margin: 0, fontSize: 'clamp(10px, 0.85vw, 13px)', lineHeight: 1.45,
                    color: 'rgba(240,232,221,0.88)',
                  }}>{t.event}</p>
                  <p className="font-archivo" style={{
                    margin: '5px 0 0', fontSize: 9, letterSpacing: '0.16em',
                    textTransform: 'uppercase', color: 'rgba(201,169,124,0.75)',
                  }}>{formatEventDate(t.date)}</p>
                </figcaption>
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
            {/* Kodenya ikut dibawa, tidak cuma ditampilkan untuk disalin.
                Menyalin lalu mengetik ulang berbulan-bulan kemudian adalah
                langkah paling mudah gagal di seluruh rantai komisi -- dan
                kalau gagal, tidak ada yang tahu: pembeli tetap membayar,
                cuma vendornya yang tidak dapat apa-apa. Kotak kodenya tetap
                ada untuk yang membeli dari perangkat lain. */}
            <Link to="/#katalog"
              onClick={() => { rememberReferral(vendor.referral_code); onTrack('catalog_click') }}
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
      {/* ── Formulir sebelum ke WhatsApp ─────────────────────────── */}
      {inquiry && (
        <div onClick={() => setInquiry(null)} className="fixed inset-0 flex items-center justify-center vp-fade"
          style={{ zIndex: 70, background: 'rgba(8,6,5,0.9)', padding: 'clamp(16px, 4vw, 40px)' }}>
          <form onClick={e => e.stopPropagation()} onSubmit={sendInquiry}
            style={{
              width: 'min(440px, 100%)', maxHeight: '100%', overflowY: 'auto',
              background: C.surface, border: `1px solid ${C.line}`, borderRadius: 22,
              padding: 'clamp(22px, 3.5vw, 32px)',
            }}>
            <p className="font-archivo" style={{
              margin: 0, fontSize: 10, letterSpacing: '0.24em',
              textTransform: 'uppercase', color: C.gold,
            }}>{inquiry.name}{inquiry.price ? ` · ${inquiry.price}` : ''}</p>
            <h3 style={{ margin: '10px 0 6px', fontSize: 21, lineHeight: 1.3, color: C.hi }}>
              Data acara kamu
            </h3>
            <p style={{ margin: '0 0 22px', fontSize: 13, lineHeight: 1.7, color: C.muted }}>
              Diisi sekali di sini supaya {vendor.name} bisa langsung mengecek ketersediaan
              tanggalnya, tanpa perlu tanya-jawab dulu.
            </p>

            <div style={{ display: 'grid', gap: 14 }}>
              <VpField label="Nama" value={lead.name} placeholder="Nama kamu atau pasangan"
                onChange={v => setLead(f => ({ ...f, name: v }))} maxLength={80} autoFocus />
              <VpField label="Alamat acara" value={lead.address} placeholder="Kota atau nama gedung"
                onChange={v => setLead(f => ({ ...f, address: v }))} maxLength={120} />
              <VpField label="Tanggal acara" value={lead.date} type="date"
                onChange={v => setLead(f => ({ ...f, date: v }))} />
            </div>

            <div className="flex flex-wrap items-center" style={{ gap: 10, marginTop: 24 }}>
              <button type="submit" disabled={!leadReady}
                className="font-archivo vp-btn vp-btn-gold" style={{
                  flex: 1, fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
                  background: leadReady ? C.gold : 'rgba(201,169,124,0.25)',
                  color: leadReady ? C.onGold : 'rgba(23,17,13,0.55)',
                  padding: '16px 24px', borderRadius: 999, border: 0,
                  cursor: leadReady ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap',
                }}>Kirim ke WhatsApp</button>
              <button type="button" onClick={() => setInquiry(null)}
                className="font-archivo" style={{
                  fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
                  background: 'transparent', color: C.faint, border: `1px solid ${C.line}`,
                  padding: '16px 20px', borderRadius: 999, cursor: 'pointer',
                }}>Batal</button>
            </div>

            {!leadReady && (
              <p style={{ margin: '12px 0 0', fontSize: 11, color: C.faint }}>
                Ketiganya diisi dulu supaya pesannya lengkap.
              </p>
            )}
          </form>
        </div>
      )}

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
