import { useState, useEffect } from 'react'

const TESTI_BLANK = '/avatars/testimoni/testi%20blank.jpg'

const testimonials = [
  {
    id: 1,
    avatar: '/avatars/testimoni/testi1.jpg',
    name: 'Angga & Lala',
    city: 'Jakarta',
    stars: 5,
    text: 'Jujur awalnya ragu mau pakai undangan digital, takut keliatan murahan. Tapi pas liat template Ulema langsung wow, elegan banget.',
  },
  {
    id: 2,
    avatar: '/avatars/testimoni/testi2.jpg',
    name: 'Rizky & Sinta',
    city: 'Bandung',
    stars: 4,
    text: 'Terimakasih Ulema udah bantu suksesin acara kita. Benar-benar pelayanan yang memuaskan dari awal sampai hari H!',
  },
  {
    id: 3,
    avatar: '/avatars/testimoni/testi3.jpg',
    name: 'Dian & Andi',
    city: 'Surabaya',
    stars: 5,
    text: 'Yang bikin aku milih ULEMA tuh karena bisa diedit sendiri. Nggak perlu bolak-balik chat admin buat ganti typo nama atau jam. Praktis banget, worth it banget!',
  },
  {
    id: 4,
    avatar: '/avatars/testimoni/testi4.jpg',
    name: 'Fariz & Nadia',
    city: 'Yogyakarta',
    stars: 4,
    text: 'Budget nikah kami emang terbatas, jadi tiap rupiah harus dipikir. Ulema jauh lebih hemat, tapi hasilnya juga keren. Nggak nyangka sih bisa sebagus ini.',
  },
  {
    id: 5,
    avatar: '/avatars/testimoni/testi5.jpg',
    name: 'Hendra & Putri',
    city: 'Medan',
    stars: 5,
    text: 'Aku order mepet nikah, H-5 baru inget undangan digital 😭 Tim ULEMA fast respon banget, langsung dibantu. Selesai dalam sehari. Literally penyelamat!',
  },
  {
    id: 6,
    avatar: TESTI_BLANK,
    name: 'Bagus & Maya',
    city: 'Semarang',
    stars: 5,
    text: 'Makasih ULEMA! Undangannya beneran melebihi ekspektasi aku. Kirain undangan digital tuh biasa aja, ternyata bisa seindah ini 🤍',
  },
  {
    id: 7,
    avatar: TESTI_BLANK,
    name: 'Yoga & Rini',
    city: 'Makassar',
    stars: 5,
    text: 'Makasih ULEMA udah bikin momen nikahku makin berkesan. Undangannya cantik, sistemnya gampang, dan yang paling penting tamu-tamu seneng pas nerima. Worth every penny!',
  },
  {
    id: 8,
    avatar: TESTI_BLANK,
    name: 'Teguh & Kartika',
    city: 'Solo',
    stars: 4,
    text: 'Sebagai orang yang gaptek, aku takut ribet. Tapi ternyata gampang banget dipakai. Nggak perlu tutorial panjang. Langsung bisa. Terimakasih ULEMA! 🙏',
  },
  {
    id: 9,
    avatar: TESTI_BLANK,
    name: 'Surya & Wulan',
    city: 'Bali',
    stars: 5,
    text: 'Terima kasih ULEMA udah bikin aku nggak stres ngurusin undangan. Di tengah ribetnya persiapan nikah, setidaknya urusan undangan beres dengan tenang. Rekomen banget!',
  },
  {
    id: 10,
    avatar: TESTI_BLANK,
    name: 'Aldi & Dewi',
    city: 'Malang',
    stars: 4,
    text: 'Yang bikin kaget tuh harganya terjangkau tapi kualitasnya premium banget. Dikira tamu aku bayar mahal. Padahal ya... hehehe rahasia 😂',
  },
  {
    id: 11,
    avatar: TESTI_BLANK,
    name: 'Rafi & Fitri',
    city: 'Bogor',
    stars: 5,
    text: 'Makasih ULEMA udah ada di saat yang tepat! Aku nemuin kalian seminggu sebelum nikah dan beneran jadi penyelamat. Prosesnya cepet, hasilnya keren, nggak ada drama. Love banget 🙌',
  },
  {
    id: 12,
    avatar: TESTI_BLANK,
    name: 'Ivan & Ayu',
    city: 'Depok',
    stars: 5,
    text: 'Makasih ULEMA! Undangannya beneran cantik dan prosesnya smooth banget. Tamu-tamu pada tanya buat di mana, langsung aku rekomendasiin Ulema. 🌸',
  },
]

const Stars = ({ n }) => (
  <div className="flex" style={{ gap: 3, marginBottom: 18, fontSize: 12, letterSpacing: 2 }}>
    <span style={{ color: '#DDC497' }}>{'★★★★★'.slice(0, n)}</span>
    <span style={{ color: 'rgba(221,196,151,0.2)' }}>{'★★★★★'.slice(0, 5 - n)}</span>
  </div>
)

const Arrow = ({ dir, onClick, label }) => (
  <button onClick={onClick} aria-label={label} className="flex items-center justify-center transition-colors"
    style={{
      flex: '0 0 auto', width: 40, height: 40, borderRadius: '50%',
      background: 'rgba(11,13,17,0.75)', border: '1px solid rgba(221,196,151,0.3)',
      color: '#DDC497', fontSize: 15, cursor: 'pointer',
    }}>
    {dir === 'prev' ? '‹' : '›'}
  </button>
)

export default function LandingTestimonials() {
  const [i, setI] = useState(0)
  const n = testimonials.length

  useEffect(() => {
    const id = setInterval(() => setI(v => (v + 1) % n), 4600)
    return () => clearInterval(id)
  }, [n])

  // Tiga kartu: sebelum, tengah, sesudah. Tombol panah adalah saudara
  // flex dari barisnya, bukan elemen absolute — itu yang mencegah kartu
  // samping menabrak tombolnya di layar sempit.
  const visible = [
    { t: testimonials[(i - 1 + n) % n], center: false, slot: 'prev' },
    { t: testimonials[i], center: true, slot: 'center' },
    { t: testimonials[(i + 1) % n], center: false, slot: 'next' },
  ]

  return (
    <section className="overflow-hidden font-jost" style={{
      padding: 'clamp(64px, 10vw, 130px) clamp(20px, 5vw, 64px)', background: '#0B0D11',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="text-center" style={{ marginBottom: 'clamp(38px, 5vw, 66px)' }}>
          <div className="flex items-center justify-center" style={{ gap: 14, marginBottom: 22 }}>
            <div style={{ width: 40, height: 1, background: 'rgba(221,196,151,0.6)' }} />
            <span style={{ fontSize: 10, letterSpacing: '0.4em', color: '#DDC497' }}>KATA MEREKA</span>
            <div style={{ width: 40, height: 1, background: 'rgba(221,196,151,0.6)' }} />
          </div>
          <h2 className="font-marcellus" style={{
            fontWeight: 400, fontSize: 'clamp(30px, 4.4vw, 56px)', lineHeight: 1.12,
            color: '#FBF8F1', margin: '0 0 14px',
          }}>
            Ribuan Pasangan<br /><span className="text-gold-grad">Sudah Merasakan</span>
          </h2>
          <p className="font-cormorant" style={{ fontStyle: 'italic', fontSize: 17, color: 'rgba(221,196,151,0.62)', margin: 0 }}>
            Cerita nyata dari pasangan yang mempercayakan undangannya kepada Ulema
          </p>
        </div>

        <div className="flex items-center" style={{ gap: 'clamp(8px, 2vw, 20px)' }}>
          <Arrow dir="prev" label="Sebelumnya" onClick={() => setI(v => (v - 1 + n) % n)} />

          <div className="flex justify-center items-stretch overflow-hidden" style={{ flex: 1, minWidth: 0, gap: 18 }}>
            {visible.map(({ t, center, slot }) => (
              <div key={slot} className="flex flex-col items-center text-center" style={{
                flex: '0 0 auto', width: center ? 'min(340px, 100%)' : 260,
                background: '#10141A', borderRadius: 24, padding: '34px 28px 30px',
                border: `1px solid ${center ? 'rgba(221,196,151,0.42)' : 'rgba(221,196,151,0.12)'}`,
                boxShadow: center ? '0 24px 60px rgba(0,0,0,0.5)' : 'none',
                opacity: center ? 1 : 0.42,
                transform: `scale(${center ? 1 : 0.95})`,
                transition: 'all .55s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}>
                <div className="relative" style={{ marginBottom: 20 }}>
                  <div style={{
                    width: 66, height: 66, borderRadius: '50%', overflow: 'hidden',
                    border: '1px solid rgba(221,196,151,0.65)', padding: 3, background: '#10141A',
                  }}>
                    <img src={t.avatar} alt={t.name} loading="lazy"
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                  <div className="absolute flex items-center justify-center" style={{
                    bottom: -2, right: -2, width: 18, height: 18, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #C4A771, #E7D3AA)', color: '#0B0D11', fontSize: 10,
                  }}>✓</div>
                </div>

                <Stars n={t.stars} />

                <p className="font-cormorant" style={{
                  fontWeight: 300, fontSize: center ? 19 : 17, fontStyle: 'italic',
                  lineHeight: 1.6, color: '#EDE9DF', margin: '0 0 22px', flex: 1,
                }}>&ldquo;{t.text}&rdquo;</p>

                <div style={{ width: 26, height: 1, background: 'rgba(221,196,151,0.45)', marginBottom: 16 }} />
                <p className="font-marcellus" style={{ fontSize: 15, color: '#F2EFE7', margin: 0 }}>{t.name}</p>
                <p style={{
                  fontSize: 10, letterSpacing: '0.24em', color: 'rgba(221,196,151,0.6)',
                  margin: '7px 0 0', textTransform: 'uppercase',
                }}>{t.city}</p>
              </div>
            ))}
          </div>

          <Arrow dir="next" label="Berikutnya" onClick={() => setI(v => (v + 1) % n)} />
        </div>

        <div className="flex justify-center" style={{ gap: 7, marginTop: 34 }}>
          {testimonials.map((t, k) => (
            <button key={t.id ?? k} onClick={() => setI(k)} aria-label={`Testimoni ${k + 1}`}
              style={{
                width: k === i ? 30 : 10, height: 3, borderRadius: 999, border: 0, padding: 0,
                cursor: 'pointer', transition: 'all 0.35s ease',
                background: k === i ? '#DDC497' : 'rgba(221,196,151,0.28)',
              }} />
          ))}
        </div>

        <div className="text-center" style={{ marginTop: 42 }}>
          <div className="inline-flex items-center" style={{
            gap: 14, border: '1px solid rgba(221,196,151,0.2)', borderRadius: 999,
            background: '#0E1116', padding: '12px 24px',
          }}>
            <div className="flex">
              {testimonials.slice(0, 4).map((t, k) => (
                <img key={t.id ?? k} src={t.avatar} alt="" loading="lazy" style={{
                  width: 26, height: 26, borderRadius: '50%', objectFit: 'cover',
                  border: '1px solid rgba(221,196,151,0.5)', marginLeft: k === 0 ? 0 : -8,
                }} />
              ))}
            </div>
            <p style={{
              fontSize: 11, letterSpacing: '0.1em', lineHeight: 1.6, textAlign: 'left',
              textTransform: 'uppercase', color: '#8A93A1', margin: 0,
            }}>
              <span style={{ color: '#DDC497' }}>13.791+</span> pasangan telah mempercayai Ulema
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
