import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSharedInvitation, getCountdownTarget, getThemes } from '../hooks/useSharedInvitation'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { useRsvp } from '../hooks/useRsvp'
import { useWishSubmit } from '../hooks/useWishSubmit'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { invitationService } from '../services/invitationService'
import { ThemeErrorBoundary } from '../components/common/ThemeErrorBoundary'
import { THEMES } from '../config/constants'
// Import Theme Layout Components via Lazy Loading (Code Splitting)
const WatercolorFloralTheme = lazy(() => import('../themes/WatercolorFloralTheme'))
const DarkLuxuryTheme = lazy(() => import('../themes/DarkLuxuryTheme'))
const ModernMinimalistTheme = lazy(() => import('../themes/ModernMinimalistTheme'))
const PlayfulIllustrativeTheme = lazy(() => import('../themes/PlayfulIllustrativeTheme'))
const TraditionalAdatTheme = lazy(() => import('../themes/TraditionalAdatTheme'))
const Special001Theme = lazy(() => import('../themes/Special001Theme'))
const Special002Theme = lazy(() => import('../themes/Special002Theme'))
const Special003Theme = lazy(() => import('../themes/Special003Theme'))
const CinematicLuxuryTheme = lazy(() => import('../themes/CinematicLuxuryTheme'))
const MinangElegantTheme = lazy(() => import('../themes/MinangElegantTheme'))

const THEME_COMPONENTS = {
  [THEMES.WATERCOLOR_FLORAL]: WatercolorFloralTheme,
  [THEMES.DARK_LUXURY]: DarkLuxuryTheme,
  [THEMES.MODERN_MINIMALIST]: ModernMinimalistTheme,
  [THEMES.PLAYFUL_ILLUSTRATIVE]: PlayfulIllustrativeTheme,
  [THEMES.TRADITIONAL_ADAT]: TraditionalAdatTheme,
  [THEMES.SPECIAL_001]: Special001Theme,
  [THEMES.SPECIAL_002]: Special002Theme,
  [THEMES.SPECIAL_003]: Special003Theme,
  [THEMES.CINEMATIC_LUXURY]: CinematicLuxuryTheme,
  [THEMES.MINANG_ELEGANT]: MinangElegantTheme,
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
  // Shared wish/RSVP submit used by custom themes (e.g. MinangElegantTheme) that manage their own form state
  const { submitWish } = useWishSubmit(updateData)
  const { copiedKey: copied, copy: copyAccount } = useCopyToClipboard()



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

    // Atomic RPC increment instead of the full-object save pipeline — a guest
    // just viewing the page must never overwrite the whole invitation row
    // (see supabase/migrations for the increment_invitation_views function).
    if (!isDemo && data.id && !sessionStorage.getItem(viewKey)) {
      invitationService.incrementViews(data.id).then(({ error }) => {
        if (error) console.error('[InvitationTemplate] Gagal mencatat view:', error)
      })
      sessionStorage.setItem(viewKey, 'true')
    }
  }, [data.slug, data.id])

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

  // Memoized so the countdown's per-second tick doesn't re-read localStorage
  // and rebuild theme objects (and re-trigger the image-preload effect below) every render.
  const themes = useMemo(() => getThemes(), [])
  const themeParam = searchParams.get('theme')
  const themeId = themeParam ? Number(themeParam) : data.themeId
  const activeTheme = useMemo(() => themes.find(t => t.id === themeId) || themes[0], [themes, themeId])
  const layout = activeTheme?.layout || THEMES.WATERCOLOR_FLORAL
  
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
    if (layout === THEMES.WATERCOLOR_FLORAL) return 'rounded-full'
    if (layout === THEMES.MODERN_MINIMALIST) return 'rounded-none border-2'
    if (layout === THEMES.DARK_LUXURY) return 'rounded-[30%_70%_70%_30%_/_40%_50%_60%_50%]'
    if (layout === THEMES.PLAYFUL_ILLUSTRATIVE) return 'rounded-[30%_70%_30%_70%_/_50%_30%_70%_50%]'
    if (layout === THEMES.TRADITIONAL_ADAT) return 'rounded-3xl border-double border-8'
    return 'rounded-2xl'
  }
  const avatarClass = getAvatarClass()

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

      {/* Render dynamically selected theme subcomponent with ErrorBoundary and Suspense fallback */}
      <ThemeErrorBoundary>
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: bgColor }}>
            <div className="w-10 h-10 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin mb-4" />
            <p className="text-xs font-serif tracking-[0.2em] uppercase text-slate-600">Menyiapkan Tema</p>
          </div>
        }>
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
            onSubmitWish={submitWish}
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
        </Suspense>
      </ThemeErrorBoundary>
    </div>
  )
}
