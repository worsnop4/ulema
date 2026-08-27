import { useState } from 'react'

// Lapisan bintang untuk section bawah (cara kerja, FAQ, footer).
//
// Posisinya di-seed sekali lewat LCG, bukan Math.random() saat render:
// react-hooks/purity melarang pembacaan tak-murni di badan komponen, dan
// bintang yang diacak ulang tiap render akan meloncat setiap kali ada
// state lain di halaman berubah.
const seedStars = (count, seed) => {
  let s = seed
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  return Array.from({ length: count }, (_, i) => {
    const size = 1 + Math.round(rnd() * 2.4)
    return {
      key: i,
      left: `${(rnd() * 100).toFixed(2)}%`,
      top: `${(rnd() * 100).toFixed(2)}%`,
      size,
      twinkle: `${(4 + rnd() * 6).toFixed(1)}s`,
      twinkleDelay: `${(rnd() * 5).toFixed(1)}s`,
      drift: `${(16 + rnd() * 20).toFixed(1)}s`,
      driftDelay: `${(rnd() * 4).toFixed(1)}s`,
    }
  })
}

export default function LandingStars({ count = 26, seed = 7331 }) {
  const [stars] = useState(() => seedStars(count, seed))

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {stars.map(st => (
        <span key={st.key} style={{
          position: 'absolute', left: st.left, top: st.top,
          width: st.size, height: st.size, borderRadius: '50%',
          background: 'rgba(221,196,151,0.85)',
          boxShadow: `0 0 ${4 + st.size * 2}px rgba(221,196,151,0.5)`,
          animation: `twinkle ${st.twinkle} ease-in-out ${st.twinkleDelay} infinite, drift ${st.drift} ease-in-out ${st.driftDelay} infinite alternate`,
        }} />
      ))}
    </div>
  )
}
