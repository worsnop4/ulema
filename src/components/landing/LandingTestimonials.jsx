import React, { useState, useEffect, useRef } from 'react'

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

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= count ? 'text-[#DDC497]' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function LandingTestimonials() {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef(null)
  const total = testimonials.length

  const goTo = (index) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrent(index)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const next = () => goTo((current + 1) % total)
  const prev = () => goTo((current - 1 + total) % total)

  useEffect(() => {
    if (isPaused) return
    intervalRef.current = setInterval(next, 4000)
    return () => clearInterval(intervalRef.current)
  }, [current, isPaused])

  // Get 3 visible cards: prev, current, next (for desktop)
  const getVisible = () => {
    const indices = []
    for (let i = -1; i <= 1; i++) {
      indices.push((current + i + total) % total)
    }
    return indices
  }

  const visibleIndices = getVisible()

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-12 reveal">
          <div className="inline-flex items-center gap-2 bg-[#DDC497]/15 border border-[#DDC497]/30 text-[#C4A771] text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase">
            🌸 Kata Mereka
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Ribuan Pasangan<br />
            <span style={{ background: 'linear-gradient(135deg,#DDC497,#C4A771)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Sudah Merasakan
            </span>
          </h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm sm:text-base">
            Cerita nyata dari pasangan yang telah mempercayakan undangan digitalnya kepada Ulema
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Cards wrapper */}
          <div className="flex gap-4 justify-center items-stretch">
            {visibleIndices.map((idx, pos) => {
              const t = testimonials[idx]
              const isCurrent = pos === 1
              return (
                <div
                  key={`${idx}-${pos}`}
                  className={`
                    flex-shrink-0 bg-white rounded-2xl p-6 flex flex-col items-center text-center
                    transition-all duration-500 ease-in-out border
                    ${isCurrent
                      ? 'shadow-xl border-[#DDC497]/40 scale-100 opacity-100 w-full sm:w-80'
                      : 'shadow-sm border-gray-100 scale-95 opacity-50 hidden sm:flex sm:w-64'
                    }
                  `}
                  style={isCurrent ? { boxShadow: '0 8px 40px rgba(221,196,151,0.2)' } : {}}
                >
                  {/* Avatar */}
                  <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-[#DDC497]/60 shadow-md"
                      style={{ border: '3px solid #DDC497' }}>
                      <img
                        src={t.avatar}
                        alt={t.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.style.background = '#F4F6F5'
                          e.target.parentElement.innerHTML = '<span style="font-size:28px;display:flex;align-items:center;justify-content:center;height:100%">💑</span>'
                        }}
                      />
                    </div>
                    {/* Verified badge */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#DDC497] rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* Stars */}
                  <StarRating count={t.stars} />

                  {/* Quote */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1 italic">
                    "{t.text}"
                  </p>

                  {/* Name & City */}
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">📍 {t.city}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Prev / Next Buttons */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:border-[#DDC497] hover:shadow-lg transition-all group"
            aria-label="Previous"
          >
            <svg className="w-4 h-4 text-gray-500 group-hover:text-[#C4A771] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:border-[#DDC497] hover:shadow-lg transition-all group"
            aria-label="Next"
          >
            <svg className="w-4 h-4 text-gray-500 group-hover:text-[#C4A771] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-1.5 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all duration-300 rounded-full ${i === current
                ? 'w-6 h-2 bg-[#DDC497]'
                : 'w-2 h-2 bg-gray-300 hover:bg-[#DDC497]/50'
                }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>

        {/* Trust badge */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-full px-6 py-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <img
                    src={i <= 3 ? `/avatars/testimoni/testi${i}.jpg` : TESTI_BLANK}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = TESTI_BLANK }}
                  />
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-xs sm:text-sm font-medium">
              <span className="font-bold text-gray-900">13,791+</span> pasangan telah mempercayai Ulema
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
