import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../App'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, Loader2, Heart, User, Mail, Lock, ArrowRight, Send, Star } from 'lucide-react'
import Logo from '../components/Logo'
import { storageService } from '../services/storageService'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedCategory = searchParams.get('category') || ''
  const selectedThemeName = searchParams.get('themeName') || ''

  useEffect(() => {
    if (searchParams.get('register') === 'true') {
      setIsRegister(true)
    }
  }, [searchParams])

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Email dan password harus diisi.'); return }
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !password) { 
      setError('Semua data registrasi harus diisi.')
      return 
    }
    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { name: name.trim() } }
      })

      if (authError) {
        let errorMsg = authError.message
        if (errorMsg === '{}' || typeof errorMsg !== 'string') {
          errorMsg = "Pengiriman email ditolak oleh Resend. Pastikan Sender Email di Supabase adalah onboarding@resend.dev (jika belum verifikasi domain) atau cek konfigurasi API Key Resend Anda."
        }
        setError(errorMsg)
        setLoading(false)
        return
      }

      if (authData.user) {
        // Create initial invitation data
        const category = selectedCategory || 'Special'
        const themeName = selectedThemeName || 'Classic Elegance'

        const { DEFAULT_THEMES, defaultInvitationData } = await import('../hooks/useSharedInvitation')
        const matchedTheme = DEFAULT_THEMES.find(t => t.name.toLowerCase().includes(themeName.toLowerCase()) || t.name === themeName) || DEFAULT_THEMES[0]

        let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        if (!slug) slug = `undangan-${Date.now()}`
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`

        const initialData = {
          ...defaultInvitationData,
          slug,
          themeId: matchedTheme.id,
          groom: { ...defaultInvitationData.groom, nickname: name.split('&')[0]?.trim() || 'Groom' },
          bride: { ...defaultInvitationData.bride, nickname: name.split('&')[1]?.trim() || 'Bride' }
        }

        // Insert into invitations table
        await supabase.from('invitations').insert({
          user_id: authData.user.id,
          theme_id: matchedTheme.id,
          groom_name: initialData.groom.nickname,
          bride_name: initialData.bride.nickname,
          data: initialData
        })

        // Temporary fallback for existing components that rely on local storage (Phase 4 will remove this)
        storageService.setItem(`inviter_template_data_${authData.user.email}`, initialData)
      }
    } catch (err) {
      setError('Terjadi kesalahan saat pendaftaran. Coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left decorative panel (60%) */}
      <div className="hidden lg:flex lg:w-3/5 flex-col justify-between p-12 relative overflow-hidden"
           style={{ background: 'linear-gradient(160deg, #1C232E 0%, #151B23 55%, #19202A 100%)' }}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{background:'linear-gradient(180deg, transparent 0%, rgba(28,35,46,0.5) 100%)'}} />

        {/* ✦ Aurora Cinematic Orbs ✦ */}
        <div className="login-aurora-1 absolute rounded-full"
             style={{top:'-15%',left:'20%',width:'550px',height:'550px',background:'radial-gradient(ellipse, rgba(160,170,184,0.15), transparent 70%)',filter:'blur(90px)'}} />
        <div className="login-aurora-2 absolute rounded-full"
             style={{bottom:'-10%',right:'-5%',width:'420px',height:'420px',background:'radial-gradient(ellipse, rgba(221,196,151,0.18), transparent 70%)',filter:'blur(70px)'}} />
        <div className="login-aurora-3 absolute rounded-full"
             style={{top:'40%',left:'-10%',width:'300px',height:'300px',background:'radial-gradient(ellipse, rgba(160,170,184,0.12), transparent 70%)',filter:'blur(60px)'}} />

        {/* ✦ Star Particles ✦ */}
        <span className="login-particle lp1" />
        <span className="login-particle lp2" />
        <span className="login-particle lp3" />
        <span className="login-particle lp4" />
        <span className="login-particle lp5" />
        <span className="login-particle lp6" />
        <span className="login-particle lp7" />
        <span className="login-particle lp8" />

        {/* ✦ Vertical Light Beams ✦ */}
        <div className="login-beam" style={{height:'45%',right:'15%'}} />
        <div className="login-beam" style={{height:'30%',right:'30%',animationDelay:'3s',opacity:0.06}} />

        {/* Elegant Gold Wave Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100,600 C150,700 350,450 850,550" stroke="#DDC497" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M-50,650 C200,750 400,350 800,600" stroke="#DDC497" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M-150,550 C100,650 300,500 900,500" stroke="#DDC497" strokeWidth="0.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Top-left: Logo */}
        <div className="relative z-10 flex items-center">
          <Logo className="h-12 w-auto invert" />
        </div>

        {/* Center phone preview with glowing background */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto">
          {/* Glowing effect - Royal Blue aurora */}
          <div className="absolute w-72 h-72 rounded-full pointer-events-none" style={{background:'rgba(221,196,151,0.15)',filter:'blur(60px)'}} />

          {/* Spinning dashed rings around phone */}
          <div className="phone-ring" style={{width:'260px',height:'260px',left:'50%',top:'50%',marginLeft:'-130px',marginTop:'-130px'}} />
          <div className="phone-ring" style={{width:'310px',height:'310px',left:'50%',top:'50%',marginLeft:'-155px',marginTop:'-155px',animationDuration:'45s',animationDirection:'reverse',borderColor:'rgba(221,196,151,0.15)'}} />

          {/* Phone mockup (~320px tall) */}
          <div className="relative w-[180px] h-[320px] rounded-[2.5rem] border-4 overflow-hidden" style={{borderColor:'rgba(221,196,151,0.25)',background:'linear-gradient(180deg,#1C232E,#151B23)',boxShadow:'0 30px 60px rgba(0,0,0,0.6), 0 0 60px rgba(221,196,151,0.1), 0 0 0 1px rgba(221,196,151,0.08)'}}>
            {/* Phone header */}
            <div className="h-10 flex items-center justify-center" style={{borderBottom:'1px solid rgba(221,196,151,0.15)'}}>
              <span style={{color:'rgba(221,196,151,0.8)'}} className="font-serif text-[10px] tracking-wide">💍 Undangan Digital</span>
            </div>
            {/* Invitation preview card */}
            <div className="p-3 flex flex-col gap-3 h-[calc(100%-40px)] justify-center">
              <div className="rounded-xl h-24 flex items-center justify-center" style={{background:'rgba(221,196,151,0.08)'}}>
                <span className="text-4xl">💐</span>
              </div>
              <div className="rounded-lg h-3 w-3/4 mx-auto" style={{background:'rgba(221,196,151,0.15)'}} />
              <div className="rounded-lg h-2.5 w-1/2 mx-auto" style={{background:'rgba(221,196,151,0.1)'}} />
              {/* Mini music bar */}
              <div className="rounded-lg p-1.5 flex items-center gap-2" style={{background:'rgba(221,196,151,0.05)',border:'1px solid rgba(221,196,151,0.1)'}}>
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{background:'linear-gradient(135deg,#C4A870,#DDC497)'}} />
                <div className="flex-1 h-1 rounded-full" style={{background:'rgba(221,196,151,0.15)'}}>
                  <div className="h-full w-2/3 rounded-full" style={{background:'linear-gradient(90deg,#1C232E,#DDC497)'}} />
                </div>
              </div>
            </div>
          </div>

          {/* Badges with float animation */}
          <div className="badge-float-1 absolute -top-1 -right-6 z-20 rounded-full px-3 py-1 text-xs font-semibold shadow-lg" style={{background:'linear-gradient(135deg,#C4A870,#DDC497)',color:'#1C232E',boxShadow:'0 4px 15px rgba(221,196,151,0.4)'}}>
            ⚡ Siap disebar!
          </div>
          <div className="badge-float-2 absolute -bottom-1 -left-6 z-20 rounded-full px-3 py-1 text-xs font-semibold shadow-lg" style={{background:'rgba(28,35,46,0.85)',border:'1px solid rgba(221,196,151,0.3)',color:'rgba(221,196,151,0.9)',boxShadow:'0 4px 15px rgba(0,0,0,0.4)'}}>
            👥 Tanpa Batas Tamu
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10 text-center mb-8">
          <h2 className="text-white text-3xl font-bold tracking-tight max-w-md mx-auto leading-tight">
            Platform Undangan Digital <br />
            <span className="font-serif text-4xl block mt-2" style={{color:'#D6BE93'}}>Terpercaya</span>
          </h2>
          <p className="text-[15px] max-w-xs leading-relaxed mx-auto mt-3" style={{color:'rgba(214,190,147,0.65)'}}>
            Kelola undangan pernikahanmu dengan mudah, cepat, dan profesional.
          </p>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 w-full pt-6" style={{borderTop:'1px solid rgba(214,190,147,0.15)'}}>
          <div className="flex flex-row items-center justify-between max-w-lg mx-auto gap-4">
            {/* Stat 1 */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{background:'rgba(28,35,46,0.5)',border:'1px solid rgba(221,196,151,0.2)'}}>
                <Heart className="w-5 h-5" style={{color:'#D6BE93'}} />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-xl leading-none">13.5rb+</p>
                <p className="text-xs mt-1" style={{color:'rgba(214,190,147,0.65)'}}>Undangan Dibuat</p>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{background:'rgba(28,35,46,0.5)',border:'1px solid rgba(221,196,151,0.2)'}}>
                <Send className="w-5 h-5" style={{color:'#D6BE93'}} />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-xl leading-none">2Jt+</p>
                <p className="text-xs mt-1" style={{color:'rgba(214,190,147,0.65)'}}>Undangan Disebar</p>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{background:'rgba(28,35,46,0.5)',border:'1px solid rgba(221,196,151,0.2)'}}>
                <Star className="w-5 h-5" style={{color:'#D6BE93'}} />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-xl leading-none">4.9★</p>
                <p className="text-xs mt-1" style={{color:'rgba(214,190,147,0.65)'}}>Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

       {/* Right Form Panel (40%) */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center px-4 sm:px-10 md:px-12 py-10 relative overflow-y-auto"
           style={{ background: 'linear-gradient(135deg, #F0F4FF 0%, #F8F6F2 50%, #F0F4FF 100%)' }}>

        {/* Subtle right panel background orb */}
        <div className="right-panel-orb" style={{width:'300px',height:'300px',top:'-50px',right:'-80px',background:'radial-gradient(ellipse, rgba(160,170,184,0.15), transparent 70%)',filter:'blur(40px)'}} />
        <div className="right-panel-orb" style={{width:'200px',height:'200px',bottom:'0',left:'-40px',background:'radial-gradient(ellipse, rgba(221,196,151,0.15), transparent 70%)',filter:'blur(30px)',animationDelay:'6s'}} />
        
        {/* Aesthetic Card wrapper */}
        <div className="bg-white rounded-2xl border shadow-card-md p-6 sm:p-8 max-w-sm w-full mx-auto relative z-10" style={{borderColor:'rgba(28,35,46,0.12)',boxShadow:'0 8px 40px rgba(28,35,46,0.08)'}}>
          {/* Logo repeated */}
          <div className="flex items-center mb-6">
            <Logo className="h-10 w-auto" />
          </div>

          <h1 className="text-[#0A1628] text-[28px] sm:text-[32px] font-bold tracking-tight mb-1">
            {isRegister ? 'Daftar Akun Baru' : 'Selamat datang'}
          </h1>
          <p className="text-[#6B7280] text-[15px] mb-8">
            {isRegister ? 'Mulai langkah bahagiamu di sini.' : 'Masuk ke dashboard undangan digitalmu.'}
          </p>

          {/* Segmented Control Tab */}
          <div className="flex p-1 rounded-lg h-11 mb-8" style={{background:'#F0F4FF'}}>
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError('') }}
              className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-[6px] transition-all ${!isRegister ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              style={!isRegister ? {background:'linear-gradient(135deg,#1C232E,#151B23)'} : {}}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError('') }}
              className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-[6px] transition-all ${isRegister ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              style={isRegister ? {background:'linear-gradient(135deg,#1C232E,#151B23)'} : {}}
            >
              Daftar Akun
            </button>
          </div>

          {/* Show selection context if registering from catalog */}
          {isRegister && selectedCategory && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-5 text-xs text-slate-700">
              📌 Anda memesan Kategori: <strong className="text-slate-900 font-bold">{selectedCategory}</strong><br />
              Desain Awal: <strong className="text-slate-900 font-bold">{selectedThemeName || 'Classic Elegance'}</strong>
            </div>
          )}

          <form onSubmit={isRegister ? handleRegisterSubmit : handleLoginSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nama Pengantin</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full h-12 bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] rounded-lg pl-11 pr-4 text-[15px] text-gray-800 placeholder-gray-400 focus:border-[#1C232E] focus:ring-2 focus:ring-[#1C232E]/10 focus:outline-none transition-all"
                    placeholder="misal: Doni & Rizka"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                  <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full h-12 bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] rounded-lg pl-11 pr-4 text-[15px] text-gray-800 placeholder-gray-400 focus:border-[#1C232E] focus:ring-2 focus:ring-[#1C232E]/10 focus:outline-none transition-all"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="w-full h-12 bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] rounded-lg pl-11 pr-12 text-[15px] text-gray-800 placeholder-gray-400 focus:border-[#13325C] focus:ring-2 focus:ring-[#13325C]/10 focus:outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  required
                />
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
                    className="w-full h-12 text-white font-semibold text-[15px] rounded-lg mt-2 flex items-center justify-center gap-2 transition-all disabled:opacity-70 group hover:opacity-90 hover:scale-[1.01]"
                    style={{background:'linear-gradient(135deg, #1C232E 0%, #151B23 100%)',boxShadow:'0 4px 20px rgba(28,35,46,0.3)'}}>
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Memproses…</>
              ) : (
                <>
                  <span>{isRegister ? 'Buat Akun & Lanjut Pembayaran' : 'Masuk Dashboard'}</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Demo info removed */}
        </div>

        {/* Footer outside card */}
        <p className="text-center text-[12px] text-[#9CA3AF] mt-6">
          Dibuat dengan <Heart size={11} className="text-rose-450 fill-current inline-block align-middle mb-0.5" /> di Indonesia
        </p>
      </div>
    </div>
  )
}
