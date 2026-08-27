import LandingStars from './LandingStars'

const STEPS = [
  ['Pilih Tema', 'Jelajahi katalog dan pilih desain yang paling cocok untukmu.'],
  ['Selesaikan Pembayaran', 'Bayar dengan mudah via transfer bank, QRIS, atau dompet digital.'],
  ['Isi Data di Dashboard', 'Masukkan data pasangan, tanggal acara, lokasi, dan langsung sebar!'],
]

export default function LandingHowItWorks() {
  return (
    <section id="cara" className="relative overflow-hidden font-jost" style={{
      padding: 'clamp(72px, 11vw, 150px) clamp(20px, 5vw, 64px)', background: '#0B0D11',
    }}>
      <LandingStars count={26} seed={7331} />

      <div className="relative" style={{ zIndex: 1, maxWidth: 1060, margin: '0 auto' }}>
        <div className="text-center" style={{ marginBottom: 'clamp(44px, 6vw, 80px)' }}>
          <span style={{ fontSize: 10, letterSpacing: '0.4em', color: '#DDC497' }}>CARA KERJA</span>
          <h2 className="font-marcellus" style={{
            fontWeight: 400, fontSize: 'clamp(30px, 4.4vw, 56px)', margin: '18px 0 10px', color: '#FBF8F1',
          }}>3 Langkah Mudah</h2>
          <p style={{ fontSize: 14, fontWeight: 300, color: '#8A93A1', margin: 0 }}>
            Undanganmu siap dalam hitungan menit, bukan hari.
          </p>
        </div>

        {/* Garis di ATAS tiap kolom, bukan lingkaran bernomor. Angka besar
            transparan yang jadi penanda urutannya. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'clamp(24px, 4vw, 54px)' }}>
          {STEPS.map(([title, desc], i) => (
            <div key={title} className="flex flex-col" style={{
              gap: 14, paddingTop: 26, borderTop: '1px solid rgba(221,196,151,0.28)',
            }}>
              <span className="font-marcellus" style={{
                fontSize: 'clamp(38px, 5vw, 62px)', lineHeight: 1, color: 'rgba(221,196,151,0.35)',
              }}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className="font-marcellus" style={{ fontWeight: 400, fontSize: 22, margin: 0, color: '#F2EFE7' }}>{title}</h3>
              <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.75, color: '#8A93A1', margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
