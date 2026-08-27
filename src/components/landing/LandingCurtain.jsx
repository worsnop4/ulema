import { useState, useEffect } from 'react'

// Tirai pembuka — dua panel kain ivory yang tersibak ke samping saat
// halaman dibuka, memberi kesan melangkah masuk ke gedung.
//
// Hanya sekali per sesi. Animasi 3,4 detik yang menahan konten itu
// menyenangkan pada kunjungan pertama dan mengesalkan pada kunjungan
// kedua, dan pengunjung yang membandingkan harga akan membuka halaman
// ini berkali-kali.
const SEEN_KEY = 'ulema_curtain_seen'

export default function LandingCurtain() {
  // Dibaca lewat lazy initializer, bukan saat render: membaca
  // sessionStorage di badan komponen adalah pembacaan tak-murni yang
  // dilarang react-hooks/purity.
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return false
    } catch {
      // Mode penyamaran memblokir sessionStorage; tirai tetap tampil.
    }
    return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (!show) return
    try { sessionStorage.setItem(SEEN_KEY, '1') } catch { /* diabaikan */ }
    // Dilepas dari pohon setelah animasinya selesai. Overlay fixed
    // seukuran layar yang tertinggal akan terus dihitung ulang browser
    // meski sudah tak terlihat.
    const t = setTimeout(() => setShow(false), 4400)
    return () => clearTimeout(t)
  }, [show])

  if (!show) return null

  const fold = (deg) => `repeating-linear-gradient(${deg}deg, rgba(255,255,255,0) 0px, rgba(170,150,112,0.05) 90px, rgba(255,255,255,0) 190px)`
  const cloth = (deg) => `linear-gradient(${deg}deg, #F2EADC 0%, #E9DFCD 46%, #DED2BB 78%, #CFC1A6 100%)`

  return (
    <div aria-hidden="true" className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      <div style={{
        position: 'absolute', inset: '0 50% 0 0',
        background: `${fold(93)}, ${cloth(97)}`,
        maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 78%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 78%, rgba(0,0,0,0) 100%)',
        filter: 'blur(0.4px)',
        animation: 'curtL 3.4s cubic-bezier(0.24, 0.72, 0.18, 1) 0.85s forwards',
      }} />
      <div style={{
        position: 'absolute', inset: '0 0 0 50%',
        background: `${fold(267)}, ${cloth(263)}`,
        maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 78%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 78%, rgba(0,0,0,0) 100%)',
        filter: 'blur(0.4px)',
        animation: 'curtR 3.4s cubic-bezier(0.24, 0.72, 0.18, 1) 0.85s forwards',
      }} />

      <div className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ gap: 18, animation: 'sealOut 1s ease 0.75s forwards' }}>
        <div style={{ width: 54, height: 1, background: 'linear-gradient(90deg, transparent, #B99C64, transparent)' }} />
        <div className="font-marcellus" style={{ color: '#8C7442', fontSize: 15, letterSpacing: '0.72em', textIndent: '0.72em' }}>ULEMA</div>
        <div className="font-jost" style={{ color: 'rgba(140,116,66,0.6)', fontSize: 9, letterSpacing: '0.36em', textIndent: '0.36em' }}>UNDANGAN DIGITAL</div>
        <div style={{ width: 54, height: 1, background: 'linear-gradient(90deg, transparent, #B99C64, transparent)' }} />
      </div>
    </div>
  )
}
