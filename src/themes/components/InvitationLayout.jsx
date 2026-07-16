import React from 'react'
import FallingLeaves from './FallingLeaves'
import { THEME_CONFIGS } from '../themeConfigs'
import { THEMES } from '../../config/constants'

export default function InvitationLayout({
  children,
  layout,
  primaryColor,
  accentColor,
  bgColor,
  bgUrl
}) {
  const config = THEME_CONFIGS[layout] || {}

  return (
    <div className="flex w-full min-h-screen font-sans items-center justify-center bg-[#ede6dc] p-0 md:p-6 lg:p-8"
         style={{
           background: layout === THEMES.DARK_LUXURY
             ? 'radial-gradient(circle, #1e1915 0%, #0c0a09 100%)'
             : layout === THEMES.CINEMATIC_SHADOW
               ? 'radial-gradient(circle, #262626 0%, #1a1a1a 100%)'
             : layout === THEMES.MODERN_MINIMALIST
               ? '#fcfaf6'
             : layout === THEMES.BOTANICAL_IVORY
               ? '#ece7db'
             : layout === THEMES.AURUM_NOIR
               ? 'radial-gradient(circle, #151009 0%, #0a0807 100%)'
               : config.global?.desktopBg
                 ? config.global.desktopBg
               : layout === THEMES.PLAYFUL_ILLUSTRATIVE
                 ? `linear-gradient(180deg, ${bgColor} 0%, #ffffff 100%)`
                 : layout === THEMES.TRADITIONAL_ADAT
                   ? `linear-gradient(180deg, ${primaryColor} 0%, ${bgColor} 100%)`
                   : `url('${bgUrl}') center/cover no-repeat`
         }}>

      {/* Background overlay for better contrast if using background image */}
      {layout === THEMES.WATERCOLOR_FLORAL && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm pointer-events-none" />
      )}

      {/* Mobile Wrapper (Centered) */}
      <div className="w-full h-screen md:h-[700px] md:w-[700px] relative flex-shrink-0 flex flex-col overflow-hidden z-10 mx-auto items-center justify-center">
        
        {/* SVG Phone Frame Overlay (Desktop Only) */}
        <div className="hidden md:block absolute inset-0 pointer-events-none z-50">
          <img 
            src="/phone-frame.svg" 
            className="w-full h-full object-contain" 
            alt="Phone Frame" 
          />
        </div>

        {/* Responsive position style block */}
        <style dangerouslySetInnerHTML={{__html: `
          @media (min-width: 768px) {
            .phone-content-container {
              position: absolute !important;
              left: 27.1% !important;
              right: 27.1% !important;
              top: 2.8% !important;
              bottom: 4% !important;
              width: auto !important;
              height: auto !important;
              border-radius: 42px !important;
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
        <div className="phone-content-container flex-1 w-full h-full flex flex-col overflow-hidden bg-[#faf7f2]"
             style={config.ornaments?.bg ? {
               background: `url('${config.ornaments.bg}') center/cover no-repeat`
             } : undefined}>
          {config.ornaments?.fallingLeaves && <FallingLeaves imageSrc={config.ornaments?.fallingLeafImage} />}
          <div className="flex-1 w-full h-full relative flex flex-col overflow-x-hidden overflow-y-auto">
            {children}
          </div>
        </div>
      </div>

    </div>
  )
}
