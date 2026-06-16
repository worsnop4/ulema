import React, { useState, useEffect } from 'react'

const faqData = [
  {
    q: 'Berapa lama proses pembuatan undangan?',
    a: 'Proses pembuatan undangan sangat cepat! Setelah pembayaran dikonfirmasi, kamu bisa langsung mengisi data di dashboard. Undangan siap disebar dalam **waktu kurang dari 5 menit**. Tidak perlu menunggu berjam-jam atau berhari-hari.'
  },
  {
    q: 'Apakah bisa custom nama tamu di setiap undangan?',
    a: 'Ya, tentu! Fitur **Custom Nama Tamu** sudah termasuk di semua paket. Kamu cukup input daftar tamu, dan sistem kami akan otomatis membuat link unik dengan nama tamu masing-masing. Undangan terasa personal dan berkesan.'
  },
  {
    q: 'Berapa banyak tamu yang bisa diundang?',
    a: 'Semua paket kami mendukung **sebar undangan tanpa batas**. Tidak ada batasan jumlah tamu yang bisa kamu undang. Bagikan ke ribuan tamu sekalipun tanpa biaya tambahan.'
  },
  {
    q: 'Apakah ada garansi uang kembali?',
    a: 'Ya! Kami memberikan **garansi uang kembali 100%** jika kamu tidak puas dengan layanan kami dalam 7 hari pertama setelah pembelian. Kepuasanmu adalah prioritas utama kami.'
  },
  {
    q: 'Metode pembayaran apa saja yang diterima?',
    a: 'Kami menerima berbagai metode pembayaran: **Transfer Bank** (BCA, Mandiri, BNI, BRI), **QRIS**, **GoPay**, **OVO**, **Dana**, dan **ShopeePay**. Proses konfirmasi cepat dan otomatis.'
  },
  {
    q: 'Berapa lama masa aktif undangan?',
    a: 'Masa aktif undangan bervariasi tergantung paket yang kamu pilih: mulai dari **6 bulan hingga 12 bulan**. Undanganmu tetap bisa diakses oleh tamu selama masa aktif tersebut. Masa aktif dihitung sejak tanggal aktivasi, bukan tanggal acara.'
  }
]

export default function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          observer.unobserve(e.target)
        }
      })
    }, { threshold: 0.1 })
    
    revealEls.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="faq" className="py-16 md:py-24 bg-cream">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <div className="section-badge-teal inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-wider uppercase">
            FAQ
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Pertanyaan yang Sering Ditanyakan</h2>
        </div>

        <div className="space-y-3 reveal">
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={index} className="faq-item bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="faq-toggle w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800 text-sm sm:text-base pr-4">{faq.q}</span>
                  <span 
                    className={`faq-icon flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-lg font-bold ${isOpen ? 'open rotate-45' : ''} transition-transform`} 
                    style={{ background: 'rgba(160,170,184,0.15)', color: '#DDC497' }}
                  >
                    +
                  </span>
                </button>
                <div className={`faq-body px-6 ${isOpen ? 'open' : ''}`} style={{ maxHeight: isOpen ? '600px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
                  <p className="text-gray-600 text-sm leading-relaxed pb-5" dangerouslySetInnerHTML={{ __html: faq.a.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
