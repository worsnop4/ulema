import { useState } from 'react'
import LandingStars from './LandingStars'

// Markup `**tebal**` di versi lama dibuang, bukan dirender: di palet ini
// penegasan datang dari warna emas, dan bintang literal akan terbaca
// sebagai salah ketik.
const FAQS = [
  ['Berapa lama proses pembuatan undangan?',
   'Setelah pembayaran dikonfirmasi, kamu bisa langsung mengisi data di dashboard. Undangan siap disebar dalam waktu kurang dari 5 menit.'],
  ['Apakah bisa custom nama tamu di setiap undangan?',
   'Ya. Fitur Custom Nama Tamu sudah termasuk di semua paket — input daftar tamu, sistem membuat tautan unik untuk masing-masing.'],
  ['Berapa banyak tamu yang bisa diundang?',
   'Semua paket mendukung sebar undangan tanpa batas. Bagikan ke ribuan tamu tanpa biaya tambahan.'],
  ['Apakah ada garansi uang kembali?',
   'Ya, garansi uang kembali 100% dalam 7 hari pertama setelah pembelian.'],
  ['Metode pembayaran apa saja yang diterima?',
   'Transfer bank (BCA, Mandiri, BNI, BRI), QRIS, GoPay, OVO, Dana, dan ShopeePay. Konfirmasi cepat dan otomatis.'],
  ['Berapa lama masa aktif undangan?',
   'Mulai dari 6 hingga 12 bulan tergantung paket, dihitung sejak tanggal aktivasi.'],
]

export default function LandingFAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section id="faq" className="relative overflow-hidden font-jost" style={{
      padding: 'clamp(72px, 11vw, 150px) clamp(20px, 5vw, 64px)', background: '#0E1116',
    }}>
      <LandingStars count={22} seed={4517} />

      <div className="relative" style={{ zIndex: 1, maxWidth: 820, margin: '0 auto' }}>
        <div className="text-center" style={{ marginBottom: 'clamp(38px, 5vw, 64px)' }}>
          <span style={{ fontSize: 10, letterSpacing: '0.4em', color: '#DDC497' }}>FAQ</span>
          <h2 className="font-marcellus" style={{
            fontWeight: 400, fontSize: 'clamp(28px, 4vw, 50px)', margin: '18px 0 0', color: '#FBF8F1',
          }}>Pertanyaan yang Sering Ditanyakan</h2>
        </div>

        <div className="flex flex-col">
          {FAQS.map(([q, a], i) => {
            const isOpen = open === i
            return (
              <div key={q} style={{ borderTop: '1px solid rgba(221,196,151,0.16)' }}>
                <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}
                  className="w-full flex items-center justify-between text-left font-jost"
                  style={{
                    gap: 20, background: 'transparent', border: 0, cursor: 'pointer',
                    padding: '24px 0', fontSize: 15, fontWeight: 400, color: '#EDE9DF',
                  }}>
                  <span>{q}</span>
                  <span className="font-marcellus" style={{ flexShrink: 0, fontSize: 18, color: '#DDC497' }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <p style={{
                    fontSize: 13, fontWeight: 300, lineHeight: 1.85, color: '#8A93A1',
                    margin: 0, padding: '0 44px 26px 0',
                  }}>{a}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
