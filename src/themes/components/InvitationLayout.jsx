import React from 'react'
import FallingLeaves from './FallingLeaves'
import { THEME_CONFIGS } from '../themeConfigs'
import { THEMES } from '../../config/constants'

// Desktop column width for the invitation.
//
// Replaces the old fixed 700x700 phone-mockup, whose hardcoded percentage
// insets left themes only ~320x652px to render in — a narrow sliver on any
// real monitor, and short enough that `min-h-screen` sections inside themes
// overflowed their own container.
//
// Themes are authored mobile-first, so the column stays close to a large
// phone (a Pro Max is 430px) rather than a tablet width: designs render at
// roughly the size they were drawn for, but now get the full height of the
// viewport instead of 652px.
const COLUMN_WIDTH = 480

// Used when a theme passes no `bgUrl` (most bespoke themes paint their own
// background). Previously this fell through to `url('undefined')`, which
// resets background-color via the shorthand and left the backdrop bare.
const DEFAULT_BACKDROP = '#ede6dc'

export default function InvitationLayout({
  children,
  layout,
  primaryColor,
  accentColor,
  bgColor,
  bgUrl
}) {
  const config = THEME_CONFIGS[layout] || {}

  const backdrop = layout === THEMES.DARK_LUXURY
    ? 'radial-gradient(circle, #1e1915 0%, #0c0a09 100%)'
    : layout === THEMES.CINEMATIC_SHADOW
      ? 'radial-gradient(circle, #262626 0%, #1a1a1a 100%)'
    : layout === THEMES.MODERN_MINIMALIST
      ? '#fcfaf6'
    : layout === THEMES.BOTANICAL_IVORY
      ? '#ece7db'
    : layout === THEMES.AURUM_NOIR
      ? 'radial-gradient(circle, #151009 0%, #0a0807 100%)'
    : layout === THEMES.MORNING_MIST
      ? 'radial-gradient(circle, #1b232d 0%, #0e141b 100%)'
    : layout === THEMES.ASHEN_BLOOM
      ? '#eceae6'
      : config.global?.desktopBg
        ? config.global.desktopBg
      : layout === THEMES.PLAYFUL_ILLUSTRATIVE
        ? `linear-gradient(180deg, ${bgColor} 0%, #ffffff 100%)`
        : layout === THEMES.TRADITIONAL_ADAT
          ? `linear-gradient(180deg, ${primaryColor} 0%, ${bgColor} 100%)`
          : bgUrl
            ? `url('${bgUrl}') center/cover no-repeat`
            : DEFAULT_BACKDROP

  return (
    <div className="inv-backdrop relative flex w-full font-sans items-center justify-center overflow-hidden"
         style={{ background: backdrop }}>

      {/* Desktop only: the theme's own artwork, blurred out behind the column,
          so wide screens read as designed rather than as empty margins. */}
      {config.ornaments?.bg && (
        <div className="hidden md:block absolute inset-0 pointer-events-none"
             style={{
               backgroundImage: `url('${config.ornaments.bg}')`,
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               filter: 'blur(30px) saturate(1.15)',
               transform: 'scale(1.15)',
               opacity: 0.45,
             }} />
      )}

      {/* Background overlay for better contrast if using background image */}
      {layout === THEMES.WATERCOLOR_FLORAL && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm pointer-events-none" />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        /* --inv-w / --inv-h are the shell's own dimensions, published to every
           theme inside it. Themes must size against these instead of vw/vh:
           viewport units still measure the browser window, which on desktop is
           several times wider than this column. Percentages are not a
           substitute inside transforms, where % resolves against the animated
           element's own box rather than its container. */
        .inv-backdrop {
          --inv-w: 100vw;
          --inv-h: 100vh;
          min-height: var(--inv-h);
        }
        /* dvh keeps the shell honest under mobile browser chrome. Applied via
           @supports because a custom property would happily store an
           unsupported value and only fail later, at use site. */
        @supports (height: 100dvh) {
          .inv-backdrop {
            --inv-h: 100dvh;
          }
        }
        .inv-shell {
          width: 100%;
          height: var(--inv-h);
        }
        @media (min-width: 768px) {
          .inv-backdrop {
            --inv-w: ${COLUMN_WIDTH}px;
          }
          .inv-shell {
            width: var(--inv-w);
            box-shadow: 0 0 70px rgba(0, 0, 0, 0.3);
          }
        }
        .animate-ornament-zoom {
          animation: ornament-zoom 8s ease-in-out infinite !important;
        }
        @keyframes ornament-zoom {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.12);
          }
        }
      `}} />

      {/* Actual Invitation Content */}
      <div className="inv-shell relative z-10 flex-shrink-0 flex flex-col overflow-hidden bg-[#faf7f2]"
           style={config.ornaments?.bg ? {
             background: `url('${config.ornaments.bg}') center/cover no-repeat`
           } : undefined}>
        {config.ornaments?.fallingLeaves && <FallingLeaves imageSrc={config.ornaments?.fallingLeafImage} />}
        <div className="flex-1 w-full h-full relative flex flex-col overflow-x-hidden overflow-y-auto">
          {children}
        </div>
      </div>

    </div>
  )
}
