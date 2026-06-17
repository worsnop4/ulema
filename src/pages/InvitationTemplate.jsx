import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSharedInvitation, getCountdownTarget, getThemes } from '../hooks/useSharedInvitation'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { useRsvp } from '../hooks/useRsvp'

// Import Theme Layout Components
import WatercolorFloralTheme from '../themes/WatercolorFloralTheme'
import DarkLuxuryTheme from '../themes/DarkLuxuryTheme'
import ModernMinimalistTheme from '../themes/ModernMinimalistTheme'
import PlayfulIllustrativeTheme from '../themes/PlayfulIllustrativeTheme'
import TraditionalAdatTheme from '../themes/TraditionalAdatTheme'
import Special001Theme from '../themes/Special001Theme'
import Special002Theme from '../themes/Special002Theme'
import Special003Theme from '../themes/Special003Theme'

const THEME_COMPONENTS = {
  'watercolor-floral': WatercolorFloralTheme,
  'dark-luxury': DarkLuxuryTheme,
  'modern-minimalist': ModernMinimalistTheme,
  'playful-illustrative': PlayfulIllustrativeTheme,
  'traditional-adat': TraditionalAdatTheme,
  'special-001': Special001Theme,
  'special-002': Special002Theme,
  'special-003': Special003Theme,
}

// ── Countdown Hook ─────────────────────────────────────────────
export function useCountdown(targetDateStr) {
  const calc = () => {
    const diff = new Date(targetDateStr) - new Date()
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 }
    const total = Math.floor(diff / 1000)
    return {
      d: Math.floor(total / 86400),
      h: Math.floor(total / 3600) % 24,
      m: Math.floor(total / 60) % 60,
      s: total % 60,
    }
  }
  const [time, setTime] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [targetDateStr])
  return time
}

// ── Reveal on scroll ───────────────────────────────────────────
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.12 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

export function Reveal({ children, className = '', delay = 0 }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ── RSVP & Wishes state ────────────────────────────────────────
const SAMPLE_WISHES = [
  { name: 'Ahmad Fariz', wish: 'Selamat ya, semoga langgeng dan bahagia selalu! 🎉', rsvp: 'hadir', time: '2 jam lalu' },
  { name: 'Sinta Dewi', wish: 'Bahagia selalu kalian berdua ❤️', rsvp: 'hadir', time: '5 jam lalu' },
  { name: 'Maya Putri', wish: 'Congrats! God bless your marriage 🙏', rsvp: 'hadir', time: '1 hari lalu' },
]

export const MUSIC_URLS = {
  1: '/music/song1.mp3',
  2: '/music/song2.mp3',
  3: '/music/song3.mp3',
  4: '/music/song4.mp3',
  5: '/music/song5.mp3',
  6: '/music/song6.mp3',
}

export const getEmbedUrl = (url) => {
  if (!url) return null
  if (url.includes('embed/')) return url
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`
    }
  } catch (e) {
    return null
  }
  return null
}

// ══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function InvitationTemplate() {
  const [searchParams] = useSearchParams()
  const guestName = searchParams.get('to') || 'Tamu Undangan'

  const [opened, setOpened] = useState(false)
  const [animateClose, setAnimateClose] = useState(false)
  const [copied, setCopied] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [showGifts, setShowGifts] = useState(false)

  const [data, updateData, isLoading] = useSharedInvitation()
  const countdownTarget = getCountdownTarget(data)
  const countdown = useCountdown(countdownTarget)
  
  // Custom hooks for extracted logic
  const { musicPlaying, setMusicPlaying, audioRef } = useAudioPlayer()
  const { 
    rsvpName, setRsvpName, 
    rsvpWish, setRsvpWish, 
    rsvpStatus, setRsvpStatus, 
    rsvpSent, setRsvpSent, 
    handleRsvpSubmit 
  } = useRsvp(updateData)



  // Reset cover screen overlay when cover styles or photos are changed in the editor
  useEffect(() => {
    setOpened(false)
    setAnimateClose(false)
  }, [data.meta?.coverStyle, data.meta?.coverPhoto])

  // Track page views
  useEffect(() => {
    // Prevent tracking in admin demo mode or if already viewed in this session
    const isDemo = window.location.pathname.includes('/demo')
    const viewKey = 'has_viewed_' + (data.slug || 'temp')
    
    if (!isDemo && !sessionStorage.getItem(viewKey)) {
      updateData(prev => ({ ...prev, views: (prev.views || 0) + 1 }))
      sessionStorage.setItem(viewKey, 'true')
    }
  }, [data.slug])

  const wishes = data.rsvps && data.rsvps.length > 0 ? data.rsvps : SAMPLE_WISHES
  const primaryEvent = data.events?.find(ev => ev.date && ev.date.length === 10) || data.events?.[0]

  const handleScroll = (e) => {
    const scrollTop = e.currentTarget.scrollTop
    if (scrollTop > 50) {
      setScrolled(true)
    } else {
      setScrolled(false)
    }
  }

  const themes = getThemes()
  const themeParam = searchParams.get('theme')
  const themeId = themeParam ? Number(themeParam) : data.themeId
  const activeTheme = themes.find(t => t.id === themeId) || themes[0]
  const layout = activeTheme?.layout || 'watercolor-floral'
  
  // Custom colors fallback to theme default colors
  const primaryColor = data.customColors?.primary || activeTheme?.colors?.[0] || '#134e4a'
  const accentColor = data.customColors?.accent || activeTheme?.colors?.[1] || '#d4a96a'
  const bgColor = data.customColors?.bg || activeTheme?.colors?.[2] || '#faf7f2'

  // Dynamic Google Fonts loading
  const fontConfig = data.fontConfig || { headingIndex: 0, bodyIndex: 5, headingSize: 36, bodySize: 14 }
  const FONTS_LIST = [
    'Playfair Display',
    'Cormorant Garamond',
    'Libre Baskerville',
    'Great Vibes',
    'Dancing Script',
    'Lato'
  ]
  const headingFont = FONTS_LIST[fontConfig.headingIndex] || FONTS_LIST[0]
  const bodyFont = FONTS_LIST[fontConfig.bodyIndex] || FONTS_LIST[5]

  useEffect(() => {
    const headingClean = headingFont.replace(/\s+/g, '+')
    const bodyClean = bodyFont.replace(/\s+/g, '+')
    const fontLinkUrl = `https://fonts.googleapis.com/css2?family=${headingClean}:ital,wght@0,300;0,400;0,700;1,400&family=${bodyClean}:ital,wght@0,300;0,400;0,700;1,400&display=swap`
    
    let link = document.getElementById('dynamic-google-fonts')
    if (!link) {
      link = document.createElement('link')
      link.id = 'dynamic-google-fonts'
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
    link.href = fontLinkUrl
  }, [headingFont, bodyFont])

  const [bgUrl, setBgUrl] = useState('/watercolor_bg.png')
  const [ornamentUrl, setOrnamentUrl] = useState('/watercolor_leaves.png')

  useEffect(() => {
    if (!activeTheme) return
    const category = activeTheme.category || 'Special'
    const themeId = activeTheme.id || 1
    const targetBg = `/themes/${category}/theme-${themeId}/bg.png`
    const targetOrnament = `/themes/${category}/theme-${themeId}/ornament.png`

    const bgImg = new Image()
    bgImg.src = targetBg
    bgImg.onload = () => setBgUrl(targetBg)
    bgImg.onerror = () => setBgUrl('/watercolor_bg.png')

    const ornamentImg = new Image()
    ornamentImg.src = targetOrnament
    ornamentImg.onload = () => setOrnamentUrl(targetOrnament)
    ornamentImg.onerror = () => setOrnamentUrl('/watercolor_leaves.png')
  }, [activeTheme])

  const getAvatarClass = () => {
    if (layout === 'watercolor-floral') return 'rounded-full'
    if (layout === 'modern-minimalist') return 'rounded-none border-2'
    if (layout === 'dark-luxury') return 'rounded-[30%_70%_70%_30%_/_40%_50%_60%_50%]'
    if (layout === 'playful-illustrative') return 'rounded-[30%_70%_30%_70%_/_50%_30%_70%_50%]'
    if (layout === 'traditional-adat') return 'rounded-3xl border-double border-8'
    return 'rounded-2xl'
  }
  const avatarClass = getAvatarClass()

  const copyAccount = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleNavClick = (e, href) => {
    e.preventDefault()
    const targetId = href.replace('#', '')
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Choose component from registry
  const ThemeComponent = THEME_COMPONENTS[layout] || WatercolorFloralTheme

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] space-y-4" style={{ backgroundColor: '#faf7f2' }}>
        <div className="w-8 h-8 rounded-full border-2 border-slate-400 border-t-slate-800 animate-spin" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Membuka Undangan...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full font-sans overflow-hidden">
      {/* Dynamic Fonts Overriding Style */}
      <style>{`
        .font-serif {
          font-family: '${headingFont}', Georgia, serif !important;
        }
        .font-sans {
          font-family: '${bodyFont}', sans-serif !important;
        }
        .font-script {
          font-family: '${headingFont}', cursive !important;
        }
        
        /* Customize header and body sizes dynamically based on fontConfig */
        .font-script, h1.font-serif, h2.font-serif, h3.font-serif, 
        .font-serif.text-2xl, .font-serif.text-3xl, .font-serif.text-4xl, .font-serif.text-5xl, .font-serif.text-6xl {
          font-size: ${fontConfig.headingSize ? fontConfig.headingSize + 'px' : ''} !important;
        }
        
        /* Customize body texts dynamically */
        p.text-lg, p.text-base, p.text-sm, p.text-xs, div.text-lg, div.text-base, div.text-sm, div.text-xs, span.text-lg, span.text-base, span.text-sm, span.text-xs {
          font-size: ${fontConfig.bodySize ? fontConfig.bodySize + 'px' : ''} !important;
        }
      `}</style>

      {/* Render dynamically selected theme subcomponent */}
      <ThemeComponent
        data={data}
        primaryColor={primaryColor}
        accentColor={accentColor}
        bgColor={bgColor}
        guestName={guestName}
        countdown={countdown}
        opened={opened}
        setOpened={setOpened}
        animateClose={animateClose}
        setAnimateClose={setAnimateClose}
        musicPlaying={musicPlaying}
        setMusicPlaying={setMusicPlaying}
        scrolled={scrolled}
        handleScroll={handleScroll}
        wishes={wishes}
        handleRsvpSubmit={handleRsvpSubmit}
        rsvpName={rsvpName}
        setRsvpName={setRsvpName}
        rsvpWish={rsvpWish}
        setRsvpWish={setRsvpWish}
        rsvpStatus={rsvpStatus}
        setRsvpStatus={setRsvpStatus}
        rsvpSent={rsvpSent}
        copied={copied}
        copyAccount={copyAccount}
        showGifts={showGifts}
        setShowGifts={setShowGifts}
        bgUrl={bgUrl}
        ornamentUrl={ornamentUrl}
        avatarClass={avatarClass}
        handleNavClick={handleNavClick}
        primaryEvent={primaryEvent}
        audioRef={audioRef}
        layout={layout}
      />
    </div>
  )
}
