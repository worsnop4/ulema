import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav id="navbar" className={`fixed top-0 left-0 right-0 z-50 grad-teal ${isScrolled ? 'scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <img src="/logo-ulema.svg" alt="Ulema Logo" className="h-10 w-auto invert group-hover:scale-105 transition-transform" />
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-blue-200 hover:text-white text-sm font-medium transition-colors">Fitur</a>
            <a href="#catalog" className="text-blue-200 hover:text-white text-sm font-medium transition-colors">Katalog</a>
            <a href="#how-it-works" className="text-blue-200 hover:text-white text-sm font-medium transition-colors">Cara Kerja</a>
            <a href="#faq" className="text-blue-200 hover:text-white text-sm font-medium transition-colors">FAQ</a>
            {/* Login Button */}
            <Link to="/login" className="flex items-center gap-1.5 grad-gold text-[#151B23] hover:opacity-90 px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-lg" style={{ boxShadow: '0 4px 20px rgba(221,196,151,0.35)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Masuk
            </Link>
            <a href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20konsultasi%20undangan%20digital" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/30 transition-all hover:scale-105">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Konsultasi WA
            </a>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Menu">
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <div id="mobileMenu" className={`md:hidden ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="pb-4 pt-2 space-y-1 border-t border-white/15">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">Fitur</a>
            <a href="#catalog" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">Katalog</a>
            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">Cara Kerja</a>
            <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">FAQ</a>
            {/* Login Button Mobile */}
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 mx-3 mt-2 bg-white text-[#1C232E] px-4 py-2.5 rounded-xl text-sm font-bold border border-white/80 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Masuk ke Dashboard
            </Link>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mx-3 mt-2 bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/25">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Konsultasi via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
