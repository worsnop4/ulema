import { useState, useEffect } from 'react'
import { waLink } from '../../config/constants'

const BLANK = '/avatars/live-order/Pasangan%20blank.jpg'

const bookings = [
  { names: 'Angga & Lala', tag: 'Baru', desc: 'Telah booking untuk bulan Juli', time: '8m yang lalu', emoji: '💍', avatar: '/avatars/live-order/pasangan1.jpg' },
  { names: 'Rizky & Sinta', tag: '', desc: 'Telah booking untuk bulan Agustus', time: '15m yang lalu', emoji: '💐', avatar: '/avatars/live-order/pasangan2.jpg' },
  { names: 'Dian & Andi', tag: '', desc: 'Telah booking untuk bulan September', time: '23m yang lalu', emoji: '🌸', avatar: '/avatars/live-order/pasangan3.jpg' },
  { names: 'Fariz & Nadia', tag: 'Baru', desc: 'Telah booking untuk bulan Oktober', time: '31m yang lalu', emoji: '🌹', avatar: '/avatars/live-order/pasangan4.jpg' },
  { names: 'Hendra & Putri', tag: '', desc: 'Telah booking untuk bulan Juli', time: '45m yang lalu', emoji: '✨', avatar: '/avatars/live-order/pasangan5.jpg' },
  { names: 'Bagus & Maya', tag: 'Baru', desc: 'Telah booking untuk bulan November', time: '1j yang lalu', emoji: '💒', avatar: '/avatars/live-order/pasangan6.jpg' },
  { names: 'Yoga & Rini', tag: '', desc: 'Telah booking untuk bulan Desember', time: '1j yang lalu', emoji: '🎊', avatar: '/avatars/live-order/pasangan7.jpg' },
  { names: 'Teguh & Kartika', tag: '', desc: 'Telah booking untuk bulan Agustus', time: '2j yang lalu', emoji: '🌺', avatar: '/avatars/live-order/pasangan8.jpg' },
  { names: 'Surya & Wulan', tag: 'Baru', desc: 'Telah booking untuk bulan September', time: '2j yang lalu', emoji: '💫', avatar: '/avatars/live-order/pasangan9.jpg' },
  { names: 'Aldi & Dewi', tag: '', desc: 'Telah booking untuk bulan Oktober', time: '3j yang lalu', emoji: '🌷', avatar: '/avatars/live-order/pasangan10.jpg' },
  { names: 'Rafi & Fitri', tag: 'Baru', desc: 'Telah booking untuk bulan Januari', time: '3j yang lalu', emoji: '💝', avatar: '/avatars/live-order/pasangan11.jpg' },
  { names: 'Ivan & Ayu', tag: '', desc: 'Telah booking untuk bulan Februari', time: '4j yang lalu', emoji: '🌻', avatar: '/avatars/live-order/pasangan12.jpg' },
  { names: 'Mamat & Nisa', tag: 'Baru', desc: 'Telah booking untuk bulan Maret', time: '4j yang lalu', emoji: '💗', avatar: '/avatars/live-order/pasangan13.jpg' },
  { names: 'Budi & Sari', tag: '', desc: 'Telah booking untuk bulan April', time: '5j yang lalu', emoji: '🌼', avatar: BLANK },
  { names: 'Eko & Rina', tag: '', desc: 'Telah booking untuk bulan Mei', time: '5j yang lalu', emoji: '🎀', avatar: BLANK },
  { names: 'Dafa & Tiara', tag: 'Baru', desc: 'Telah booking untuk bulan Juni', time: '6j yang lalu', emoji: '💕', avatar: BLANK },
  { names: 'Arif & Mira', tag: '', desc: 'Telah booking untuk bulan Juli', time: '6j yang lalu', emoji: '🌙', avatar: BLANK },
  { names: 'Bayu & Citra', tag: 'Baru', desc: 'Telah booking untuk bulan Agustus', time: '7j yang lalu', emoji: '🌟', avatar: BLANK },
  { names: 'Reza & Laras', tag: '', desc: 'Telah booking untuk bulan September', time: '8j yang lalu', emoji: '🍃', avatar: BLANK },
  { names: 'Tomi & Yuni', tag: '', desc: 'Telah booking untuk bulan Oktober', time: '9j yang lalu', emoji: '🎊', avatar: BLANK },
]
// Empat lapisan cahaya yang hanyut di belakang foto hero. Nilainya
// diambil apa adanya dari handoff; yang penting di sini semuanya
// blur besar + translate, tidak ada satu pun yang men-scale foto.
const LIGHTS = [
  { top: '-22%', left: '-8%', width: '62%', height: '88%',
    background: 'radial-gradient(50% 50% at 50% 50%, rgba(221,196,151,0.3) 0%, rgba(221,196,151,0.08) 45%, transparent 72%)',
    filter: 'blur(20px)', animation: 'lightDriftA 26s ease-in-out infinite' },
  { bottom: '-26%', right: '-10%', width: '68%', height: '92%',
    background: 'radial-gradient(50% 50% at 50% 50%, rgba(180,196,220,0.22) 0%, rgba(180,196,220,0.06) 48%, transparent 74%)',
    filter: 'blur(26px)', animation: 'lightDriftB 34s ease-in-out infinite' },
  { top: 0, bottom: 0, left: 0, width: '26%',
    background: 'linear-gradient(90deg, transparent, rgba(255,248,232,0.16) 45%, rgba(255,248,232,0.28) 55%, transparent)',
    filter: 'blur(14px)', animation: 'lightSweep 17s ease-in-out 3s infinite' },
  { left: '-10%', right: '-10%', bottom: '-12%', height: '46%',
    background: 'linear-gradient(0deg, rgba(221,196,151,0.12), transparent 70%)',
    filter: 'blur(28px)', animation: 'fogFloat 22s ease-in-out infinite' },
]

const HERO_SLIDES = ['/hero/hero1.jpg', '/hero/hero2.jpg', '/hero/hero3.jpg']

export default function LandingHero() {
  const [booking, setBooking] = useState(null)
  const [popIn, setPopIn] = useState(false)

  useEffect(() => {
    let i = 0
    let hideT, nextT

    const cycle = () => {
      setBooking(bookings[i % bookings.length])
      setPopIn(true)
      i += 1
      hideT = setTimeout(() => setPopIn(false), 4200)
      // Jeda acak supaya tidak terbaca sebagai carousel bergilir.
      nextT = setTimeout(cycle, 5800 + Math.random() * 3600)
    }

    const startT = setTimeout(cycle, 2600)
    return () => { clearTimeout(startT); clearTimeout(hideT); clearTimeout(nextT) }
  }, [])

  return (
    <>
      <section id="hero" className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: '100vh' }}>

        {/* Slideshow: tiga foto bersilang selama 24 detik. Zoom di sini
            ada di dalam keyframes-nya sendiri dan hanya menyentuh foto
            latar, bukan teks di atasnya. */}
        {HERO_SLIDES.map((src, i) => (
          <div key={src} className="hero-slide absolute inset-0"
            style={{
              backgroundImage: `url('${src}')`, backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: 0, animation: `heroFade 24s ease-in-out ${i * 8}s infinite`,
            }} />
        ))}

        <div className="absolute inset-0" style={{
          background: 'radial-gradient(120% 80% at 50% 40%, rgba(11,13,17,0.35) 0%, rgba(11,13,17,0.82) 60%, #0B0D11 100%)',
        }} />

        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
          {LIGHTS.map((s, i) => <div key={i} style={{ position: 'absolute', ...s }} />)}
        </div>

        {/* Bingkai emas ganda — yang memberi kesan "pintu gedung". */}
        <div className="absolute pointer-events-none" style={{
          inset: 'clamp(14px, 2.6vw, 34px)', border: '1px solid rgba(221,196,151,0.28)', borderRadius: 28,
        }} />
        <div className="absolute pointer-events-none" style={{
          inset: 'clamp(22px, 3.6vw, 46px)', border: '1px solid rgba(221,196,151,0.1)', borderRadius: 22,
        }} />

        <div className="relative text-center" style={{
          padding: '120px clamp(24px, 6vw, 40px) 190px', maxWidth: 940,
          animation: 'fadeUp 1.2s ease 1.5s both',
        }}>
          <div className="flex items-center justify-center" style={{ gap: 14, marginBottom: 34 }}>
            <div style={{ width: 40, height: 1, background: 'rgba(221,196,151,0.6)' }} />
            <span className="font-jost" style={{ fontSize: 10, letterSpacing: '0.42em', color: '#DDC497' }}>
              SEJAK 2023 · SELAMANYA AKTIF
            </span>
            <div style={{ width: 40, height: 1, background: 'rgba(221,196,151,0.6)' }} />
          </div>

          <h1 className="font-marcellus" style={{
            fontWeight: 400, fontSize: 'clamp(42px, 8vw, 104px)', lineHeight: 1.02,
            letterSpacing: '-0.01em', margin: '0 0 26px', color: '#FBF8F1', textWrap: 'balance',
          }}>
            Undangan Digital<br />
            <span className="text-gold-grad">Express #1</span>
          </h1>

          <p className="font-jost" style={{
            fontSize: 'clamp(15px, 1.6vw, 19px)', fontWeight: 300, letterSpacing: '0.06em',
            color: 'rgba(232,228,218,0.82)', margin: '0 0 8px',
          }}>Cepat, Mudah, dan Praktis</p>

          <p className="font-cormorant" style={{
            fontStyle: 'italic', fontSize: 'clamp(14px, 1.5vw, 18px)',
            color: 'rgba(221,196,151,0.66)', margin: '0 0 44px',
          }}>Every invitation, an entrance.</p>

          <div className="flex flex-wrap justify-center" style={{ gap: 14 }}>
            <a href="#katalog" className="font-jost transition-opacity hover:opacity-90" style={{
              fontSize: 11, letterSpacing: '0.22em', color: '#0B0D11',
              background: 'linear-gradient(135deg, #C4A771, #E7D3AA)',
              padding: '17px 34px', borderRadius: 999,
            }}>LIHAT KATALOG UNDANGAN</a>
            <a href={waLink('Halo Ulema! Saya ingin konsultasi undangan digital')}
              target="_blank" rel="noopener noreferrer"
              className="font-jost transition-colors" style={{
                fontSize: 11, letterSpacing: '0.22em', color: '#EFEADF',
                border: '1px solid rgba(239,234,223,0.4)', background: 'rgba(255,255,255,0.06)',
                padding: '17px 34px', borderRadius: 999,
              }}>KONSULTASI GRATIS</a>
          </div>
        </div>

        <div className="absolute flex flex-col items-center" style={{
          bottom: 62, left: '50%', transform: 'translateX(-50%)', gap: 8,
          animation: 'cueDrop 2.6s ease-in-out infinite',
        }}>
          <span className="font-jost" style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(221,196,151,0.7)' }}>
            GESER KE BAWAH
          </span>
          <div style={{ width: 1, height: 42, background: 'linear-gradient(180deg, rgba(221,196,151,0.7), transparent)' }} />
        </div>
      </section>

      {/* Notifikasi booking. Tetap ter-mount lalu digeser keluar layar,
          bukan dilepas: melepasnya membuang transisi keluarnya. */}
      {booking && (
        <div className="fixed flex font-jost" style={{
          top: 86, right: 16, zIndex: 130, width: 'min(304px, calc(100vw - 32px))',
          gap: 12, padding: '13px 15px', borderRadius: 20,
          background: 'rgba(14,17,22,0.88)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(221,196,151,0.24)', boxShadow: '0 22px 54px rgba(0,0,0,0.5)',
          transform: popIn ? 'translateX(0)' : 'translateX(115%)', opacity: popIn ? 1 : 0,
          transition: 'transform .85s cubic-bezier(0.16,1,0.3,1), opacity .7s ease',
        }}>
          <div style={{ flexShrink: 0, width: 42, height: 42, borderRadius: '50%', border: '1px solid rgba(221,196,151,0.55)', padding: 2 }}>
            <img src={booking.avatar} alt="" loading="lazy"
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center justify-between" style={{ gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 8.5, letterSpacing: '0.26em', color: '#DDC497' }}>ULEMA.ID</span>
              <span style={{ fontSize: 8.5, letterSpacing: '0.06em', color: '#6C7480' }}>{booking.time}</span>
            </div>
            <div className="flex items-center" style={{ gap: 7, marginBottom: 3 }}>
              <span className="font-marcellus" style={{ fontSize: 13, color: '#F2EFE7' }}>Booking Baru</span>
              {booking.tag && (
                <span style={{
                  fontSize: 7.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#0B0D11',
                  background: 'linear-gradient(135deg, #C4A771, #E7D3AA)', padding: '3px 7px', borderRadius: 999,
                }}>{booking.tag}</span>
              )}
            </div>
            <p style={{ fontSize: 11, fontWeight: 300, lineHeight: 1.55, color: '#8A93A1', margin: 0 }}>
              <span style={{ color: '#EDE9DF' }}>{booking.names}</span> {booking.desc.toLowerCase()}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
