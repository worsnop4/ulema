import LandingStars from './LandingStars'
import { waLink } from '../../config/constants'

const MICRO = [
  `ULEMA.ID © ${new Date().getFullYear()}`,
  'GARANSI UANG KEMBALI 7 HARI',
  'SEBAR TANPA BATAS',
]

export default function LandingFooter() {
  return (
    // padding-bottom 110px memberi ruang untuk tombol WhatsApp melayang
    // yang menempel di pojok kanan bawah.
    <footer className="relative overflow-hidden text-center font-jost" style={{
      padding: 'clamp(64px, 9vw, 120px) clamp(20px, 5vw, 64px) 110px',
      background: '#0B0D11', borderTop: '1px solid rgba(221,196,151,0.16)',
    }}>
      <LandingStars count={30} seed={9241} />

      <div className="relative" style={{ zIndex: 1 }}>
        <img src="/logo-ulema.svg" alt="Ulema" className="w-auto mx-auto"
          style={{ height: 34, filter: 'invert(1) brightness(1.25)', marginBottom: 26 }} />

        <p className="font-cormorant" style={{
          fontStyle: 'italic', fontSize: 'clamp(20px, 3vw, 34px)', fontWeight: 300,
          color: '#EDE9DF', margin: '0 auto 32px', maxWidth: 620,
        }}>Undangan pertama yang tamu Anda buka, dan tidak akan mereka lupakan.</p>

        <a href={waLink('Halo Ulema! Saya ingin konsultasi undangan digital')}
          target="_blank" rel="noopener noreferrer"
          className="inline-block transition-opacity hover:opacity-90" style={{
            fontSize: 11, letterSpacing: '0.22em', color: '#0B0D11',
            background: 'linear-gradient(135deg, #C4A771, #E7D3AA)',
            padding: '17px 38px', borderRadius: 999,
          }}>KONSULTASI VIA WHATSAPP</a>

        <div className="flex flex-wrap justify-center" style={{
          gap: 22, marginTop: 46, fontSize: 10, letterSpacing: '0.2em', color: '#6C7480',
        }}>
          {MICRO.map(m => <span key={m}>{m}</span>)}
        </div>
      </div>
    </footer>
  )
}
