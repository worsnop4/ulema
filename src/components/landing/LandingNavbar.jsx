import { useState } from 'react'
import { Link } from 'react-router-dom'
import { waLink } from '../../config/constants'

const LINKS = [
  ['#fitur', 'FITUR'],
  ['#katalog', 'KATALOG'],
  ['#cara', 'CARA KERJA'],
  ['#faq', 'FAQ'],
]

export default function LandingNavbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <nav id="navbar" className="fixed top-0 left-0 right-0 z-[100] flex flex-col"
      style={{
        padding: '18px clamp(20px, 5vw, 64px)',
        background: 'linear-gradient(180deg, rgba(11,13,17,0.94), rgba(11,13,17,0.5))',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(221,196,151,0.12)',
      }}>
      <div className="flex items-center justify-between gap-5">
        <a href="#" aria-label="Ulema">
          <img src="/logo-ulema.svg" alt="Ulema" className="w-auto"
            style={{ height: 30, filter: 'invert(1) brightness(1.25)' }} />
        </a>

        {/* Tautan penuh hanya dari 768px ke atas; di bawah itu jadi hamburger. */}
        <div className="hidden md:flex items-center" style={{ gap: 'clamp(14px, 2.4vw, 34px)' }}>
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="font-jost transition-colors hover:text-foyer-gold"
              style={{ fontSize: 11, letterSpacing: '0.18em', color: '#A9AFB9' }}>
              {label}
            </a>
          ))}
          <Link to="/login" className="font-jost transition-opacity hover:opacity-90"
            style={{
              fontSize: 11, letterSpacing: '0.18em', color: '#0B0D11',
              background: 'linear-gradient(135deg, #C4A771, #E4CFA4)',
              padding: '10px 20px', borderRadius: 999,
            }}>
            MASUK
          </Link>
        </div>

        <button onClick={() => setOpen(v => !v)} aria-label="Menu" aria-expanded={open}
          className="md:hidden flex items-center justify-center"
          style={{
            width: 42, height: 42, borderRadius: 14,
            background: 'rgba(221,196,151,0.08)', border: '1px solid rgba(221,196,151,0.3)',
            color: '#DDC497', fontSize: 15, cursor: 'pointer',
          }}>
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="md:hidden flex flex-col"
          style={{ gap: 2, marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(221,196,151,0.16)' }}>
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} onClick={close} className="font-jost"
              style={{ fontSize: 12, letterSpacing: '0.2em', color: '#C8CCD3', padding: '13px 4px' }}>
              {label}
            </a>
          ))}
          <Link to="/login" onClick={close} className="font-jost text-center"
            style={{
              fontSize: 11, letterSpacing: '0.2em', color: '#0B0D11',
              background: 'linear-gradient(135deg, #C4A771, #E4CFA4)',
              padding: '15px 20px', borderRadius: 999, marginTop: 10,
            }}>
            MASUK KE DASHBOARD
          </Link>
          <a href={waLink('Halo Ulema! Saya ingin konsultasi undangan digital')}
            target="_blank" rel="noopener noreferrer" onClick={close}
            className="font-jost text-center"
            style={{
              fontSize: 11, letterSpacing: '0.2em', color: '#EFEADF',
              border: '1px solid rgba(239,234,223,0.35)',
              padding: '15px 20px', borderRadius: 999, marginTop: 8,
            }}>
            KONSULTASI WHATSAPP
          </a>
        </div>
      )}
    </nav>
  )
}
