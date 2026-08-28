import { useEffect, useState } from 'react'

// Delapan hal yang membuat undangan terasa disiapkan, bukan dikirim.
// Ikon berwarna versi lama diganti nomor 01–08: di palet Grand Foyer,
// ikon multi-warna adalah satu-satunya hal yang tidak emas.
const FEATURES = [
  ['Sebar Tanpa Batas', 'Bagikan ke ribuan tamu tanpa biaya tambahan.'],
  ['Custom Nama Tamu', 'Setiap tamu menerima tautan dengan namanya sendiri.'],
  ['E-Amplop Digital', 'Hadiah dan transfer langsung ke rekening pengantin.'],
  ['Navigasi Google Maps', 'Tamu diarahkan tepat ke lokasi acara.'],
  ['Kontrol Musik Latar', 'Backsound pilihan, bisa dimatikan kapan saja.'],
  ['Galeri Foto & Video', 'Momen prewedding dan video dalam satu halaman.'],
  ['RSVP & Ucapan Doa', 'Konfirmasi kehadiran dan doa dari tamu, real time.'],
  ['Countdown Acara', 'Hitungan menuju hari H di halaman pembuka.'],
]

const MARQUEE = [
  'SEBAR TANPA BATAS', 'CUSTOM NAMA TAMU', 'RSVP REAL TIME',
  'E-AMPLOP DIGITAL', 'GARANSI 7 HARI', 'SIAP DALAM 5 MENIT',
]

const AnimatedCounter = ({ target, start, duration = 1800 }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return
    let startTime, frame
    const update = (t) => {
      if (!startTime) startTime = t
      const p = Math.min((t - startTime) / duration, 1)
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [target, start, duration])

  return <span>{(start ? count : target).toLocaleString('id-ID')}</span>
}

const eyebrowRule = { width: 40, height: 1, background: 'rgba(221,196,151,0.6)' }

const CountdownBox = ({ value, label }) => (
  <div className="flex flex-col items-center" style={{ gap: 12 }}>
    <div className="flex items-center justify-center" style={{
      width: 'clamp(70px, 9vw, 96px)', height: 'clamp(70px, 9vw, 96px)',
      border: '1px solid rgba(221,196,151,0.3)', borderRadius: 22, background: '#0B0D11',
    }}>
      <span className="font-marcellus" style={{ fontSize: 'clamp(28px, 3.6vw, 42px)', color: '#FBF8F1' }}>{value}</span>
    </div>
    <span className="font-jost" style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(221,196,151,0.7)' }}>
      {label}
    </span>
  </div>
)

const Dot = () => (
  <span className="font-marcellus" style={{
    fontSize: 'clamp(24px, 3vw, 34px)', color: 'rgba(221,196,151,0.55)',
    lineHeight: 'clamp(70px, 9vw, 96px)',
  }}>·</span>
)

export default function LandingFeatures() {
  const [time, setTime] = useState({ h: '00', m: '00', s: '00' })
  const [statsStarted, setStatsStarted] = useState(false)

  // Hitung mundur ke pukul 00:00 tanggal 1 bulan berikutnya, waktu lokal.
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0)
      const total = Math.max(0, Math.floor((end - now) / 1000))
      setTime({
        h: String(Math.floor(total / 3600) % 24).padStart(2, '0'),
        m: String(Math.floor(total / 60) % 60).padStart(2, '0'),
        s: String(total % 60).padStart(2, '0'),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Angka statistik baru berjalan saat blok-nya benar-benar terlihat.
  useEffect(() => {
    const el = document.getElementById('stats-counter-section')
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) setStatsStarted(true)
    }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <>
      {/* ── Ticker ─────────────────────────────────────────────── */}
      <div style={{
        borderTop: '1px solid rgba(221,196,151,0.14)', borderBottom: '1px solid rgba(221,196,151,0.14)',
        padding: '16px 0', overflow: 'hidden', background: '#0E1116',
      }}>
        <div className="ticker-track">
          {[0, 1].map(dup => (
            <div key={dup} className="flex font-jost" style={{
              gap: 46, paddingRight: 46, fontSize: 11, letterSpacing: '0.28em',
              color: 'rgba(221,196,151,0.62)', whiteSpace: 'nowrap',
            }} aria-hidden={dup === 1 ? 'true' : undefined}>
              {MARQUEE.map(m => (
                <span key={m} className="flex" style={{ gap: 46 }}>{m}<span>·</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Promo ──────────────────────────────────────────────── */}
      <section id="promo" className="relative overflow-hidden font-jost" style={{
        padding: 'clamp(64px, 10vw, 140px) clamp(20px, 5vw, 64px)', background: '#0E1116',
        borderTop: '1px solid rgba(221,196,151,0.12)', borderBottom: '1px solid rgba(221,196,151,0.12)',
      }}>
        <div className="absolute pointer-events-none" style={{
          inset: 'clamp(14px, 2.4vw, 30px)', border: '1px solid rgba(221,196,151,0.16)', borderRadius: 32,
        }} />

        <div className="relative text-center" style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="flex items-center justify-center" style={{ gap: 14, marginBottom: 26 }}>
            <div style={eyebrowRule} />
            <span style={{ fontSize: 10, letterSpacing: '0.4em', color: '#DDC497', animation: 'goldBreath 3.4s ease-in-out infinite' }}>
              PENAWARAN TERBATAS
            </span>
            <div style={eyebrowRule} />
          </div>

          <h2 className="font-marcellus" style={{
            fontWeight: 400, fontSize: 'clamp(22px, 2.8vw, 32px)', letterSpacing: '0.18em',
            color: 'rgba(251,248,241,0.9)', margin: '0 0 18px',
          }}>PROMO BULAN INI</h2>

          <div className="font-marcellus text-gold-grad" style={{
            fontSize: 'clamp(52px, 11vw, 132px)', lineHeight: 0.98, letterSpacing: '-0.01em', margin: '0 0 22px',
          }}>Diskon 50%</div>

          <p className="font-cormorant" style={{
            fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(16px, 1.8vw, 21px)',
            color: 'rgba(232,228,218,0.78)', margin: '0 auto clamp(38px, 5vw, 56px)',
            maxWidth: 470, lineHeight: 1.55,
          }}>Harga spesial hanya untuk waktu terbatas. Jangan lewatkan kesempatan ini.</p>

          <div className="flex items-start justify-center" style={{
            gap: 'clamp(14px, 3vw, 34px)', marginBottom: 'clamp(38px, 5vw, 54px)',
          }}>
            <CountdownBox value={time.h} label="Jam" />
            <Dot />
            <CountdownBox value={time.m} label="Menit" />
            <Dot />
            <CountdownBox value={time.s} label="Detik" />
          </div>

          <a href="#katalog" className="inline-block transition-opacity hover:opacity-90" style={{
            fontSize: 11, letterSpacing: '0.22em', color: '#0B0D11',
            background: 'linear-gradient(135deg, #C4A771, #E7D3AA)', padding: '17px 36px', borderRadius: 999,
          }}>KLAIM DISKON SEKARANG</a>

          {/* Tiga angka ini adalah satu kalimat, bukan tiga kartu terpisah:
              dibuat -> disebar -> selesai. Ditumpuk ke bawah, urutannya
              hilang. Jadi kolomnya dikunci tiga, dan yang mengecil di HP
              adalah kotak dan hurufnya. */}
          <div id="stats-counter-section" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(6px, 1.6vw, 14px)', marginTop: 'clamp(44px, 6vw, 70px)',
          }}>
            {[
              [<AnimatedCounter key="a" target={2456} start={statsStarted} />, 'Undangan Dibuat'],
              [<AnimatedCounter key="b" target={203050} start={statsStarted} />, 'Undangan Disebar'],
              ['5 menit', 'Siap Disebar'],
            ].map(([value, label]) => (
              <div key={label} style={{
                background: '#0B0D11', border: '1px solid rgba(221,196,151,0.14)',
                borderRadius: 'clamp(12px, 2vw, 18px)',
                padding: 'clamp(14px, 3vw, 28px) clamp(6px, 2vw, 22px)',
              }}>
                <span className="font-marcellus block" style={{
                  fontSize: 'clamp(15px, 4.4vw, 40px)', lineHeight: 1.1, color: '#FBF8F1',
                }}>{value}</span>
                <span className="block" style={{
                  fontSize: 'clamp(7px, 1.9vw, 9px)', letterSpacing: 'clamp(0.06em, 0.4vw, 0.28em)',
                  lineHeight: 1.5, textTransform: 'uppercase', color: '#8A93A1',
                  marginTop: 'clamp(4px, 1vw, 8px)',
                }}>{label}</span>
              </div>
            ))}
          </div>

          <p style={{
            fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
            color: 'rgba(221,196,151,0.45)', margin: '26px 0 0',
          }}>Semua kategori tema · Garansi 7 hari · Aktif hingga 12 bulan</p>
        </div>
      </section>

      {/* ── Fitur ──────────────────────────────────────────────── */}
      <section id="fitur" className="font-jost" style={{
        padding: 'clamp(72px, 11vw, 150px) clamp(20px, 5vw, 64px)', background: '#0B0D11',
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div className="text-center" style={{ marginBottom: 'clamp(44px, 6vw, 80px)' }}>
            <span style={{ fontSize: 10, letterSpacing: '0.4em', color: '#DDC497' }}>FITUR</span>
            <h2 className="font-marcellus" style={{
              fontWeight: 400, fontSize: 'clamp(30px, 4.4vw, 56px)', lineHeight: 1.14,
              margin: '18px 0 12px', color: '#FBF8F1',
            }}>Semua yang Kamu Butuhkan<br />Sudah Ada di Sini</h2>
            <p className="font-cormorant" style={{ fontStyle: 'italic', fontSize: 17, color: 'rgba(221,196,151,0.6)', margin: 0 }}>
              Everything the day needs, in one link.
            </p>
          </div>

          {/* Lebar minimum kolom ikut menyusut di layar sempit. Dengan 230px
              tetap, auto-fit hanya muat satu kolom di HP dan kartunya jadi
              selebar layar; clamp menjaganya tetap dua. */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(130px, 26vw, 230px), 1fr))',
            gap: 'clamp(8px, 1.6vw, 14px)',
          }}>
            {FEATURES.map(([title, desc], i) => (
              <div key={title} className="feature-card flex flex-col" style={{
                background: '#0E1116', border: '1px solid rgba(221,196,151,0.14)',
                borderRadius: 'clamp(12px, 2vw, 18px)',
                padding: 'clamp(16px, 3vw, 34px) clamp(12px, 2.4vw, 28px) clamp(18px, 3.4vw, 38px)',
                gap: 'clamp(6px, 1.2vw, 12px)', transition: 'background 0.4s ease',
              }}>
                <span className="font-marcellus" style={{
                  fontSize: 'clamp(9px, 2.2vw, 12px)', letterSpacing: '0.2em', color: 'rgba(221,196,151,0.55)',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-marcellus" style={{
                  fontWeight: 400, fontSize: 'clamp(13px, 3.4vw, 20px)', lineHeight: 1.25,
                  margin: 0, color: '#F2EFE7',
                }}>{title}</h3>
                <p style={{
                  fontSize: 'clamp(10px, 2.6vw, 13px)', fontWeight: 300, lineHeight: 1.6,
                  color: '#8A93A1', margin: 0,
                }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
