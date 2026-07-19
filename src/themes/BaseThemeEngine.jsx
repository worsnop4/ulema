import React from 'react'
import { Home, Heart, Calendar, Camera, Gift, MessageSquare, Volume2, VolumeX, BookOpen } from 'lucide-react'
import { Reveal, MUSIC_URLS, getEmbedUrl } from '../pages/InvitationTemplate'
import InvitationLayout from './components/InvitationLayout'
import { THEME_CONFIGS } from './themeConfigs'

export default function BaseThemeEngine({
  layout,
  data,
  primaryColor,
  accentColor,
  bgColor,
  guestName,
  countdown,
  opened,
  setOpened,
  animateClose,
  setAnimateClose,
  musicPlaying,
  setMusicPlaying,
  scrolled,
  handleScroll,
  wishes,
  handleRsvpSubmit,
  rsvpName,
  setRsvpName,
  rsvpWish,
  setRsvpWish,
  rsvpStatus,
  setRsvpStatus,
  rsvpSent,
  copied,
  copyAccount,
  showGifts,
  setShowGifts,
  bgUrl,
  ornamentUrl,
  handleNavClick,
  primaryEvent,
  audioRef
}) {
  const config = THEME_CONFIGS[layout] || THEME_CONFIGS['watercolor-floral']
  const meta = data.meta || {}
  const [activeTab, setActiveTab] = React.useState(0)

  // Use generic avatars if no photos provided
  const coverFallback = layout === 'dark-luxury' ? '/avatars/placeholder.svg' : '/avatars/placeholder.svg'
  const coverPhoto = meta.coverPhoto || null
  const heroPhoto = meta.photo || coverPhoto || data.groom?.photo || data.bride?.photo || null

  let coverBg = undefined
  if (config.ornaments?.bg) {
    coverBg = `url('${config.ornaments.bg}') center/cover no-repeat`
  } else {
    if (meta.coverStyle === 'fade' && coverPhoto) {
      const isDark = layout === 'dark-luxury'
      const gradStart = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
      coverBg = `linear-gradient(to bottom, ${gradStart} 0%, ${bgColor} 95%), url('${coverPhoto}') center/cover no-repeat`
    }
  }

  return (
    <InvitationLayout
      layout={layout}
      data={data}
      primaryColor={primaryColor}
      accentColor={accentColor}
      bgColor={bgColor}
      bgUrl={bgUrl}
      ornamentUrl={ornamentUrl}
      primaryEvent={primaryEvent}
    >
      <div className={`w-full relative h-full flex flex-col ${config.global.bgContainer}`}>

        {/* Audio Player */}
        {data.music !== false && (
          <audio
            ref={audioRef}
            src={data.musicUrl || MUSIC_URLS[data.musicId || 1] || MUSIC_URLS[1]}
            loop
          />
        )}

        {/* Sticky Music Button */}
        {data.music !== false && (
          <button
            onClick={() => setMusicPlaying(p => !p)}
            className={`fixed top-6 right-4 md:absolute md:top-6 md:right-4 z-50 w-12 h-12 rounded-full shadow-md flex items-center justify-center transition-all duration-500 ${scrolled ? 'opacity-0 pointer-events-none scale-90 translate-y-[-10px]' : 'opacity-100 scale-100 translate-y-0'
              }`}
            style={{
              backgroundColor: '#ffffff',
              border: `1px solid ${primaryColor}33`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
            title="Musik"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}>
              {musicPlaying ? <Volume2 size={13} className="text-white" /> : <VolumeX size={13} className="text-white" />}
            </div>
          </button>
        )}

        {/* Scrollable Container */}
        <div className={`flex-1 w-full overflow-x-hidden scroll-smooth ${animateClose ? 'overflow-y-auto' : 'overflow-hidden'}`} onScroll={handleScroll}>
          <div className={`min-h-screen font-sans relative pb-28 ${config.global.bgContainer}`} style={{ background: config.ornaments?.bg ? 'transparent' : bgColor }}>

            {/* ══════════  HERO SECTION  ══════════ */}
            <section id="hero" className={`relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden px-6 py-20 ${config.hero.bgClass}`}>
              {config.ornaments?.leaves && (
                <>
                  {config.ornaments.leaves.topLeft && (
                    <img
                      src={config.ornaments.leaves.topLeft}
                      className="absolute -top-4 -left-4 w-36 h-36 object-contain pointer-events-none opacity-85 z-[1] ${config.ornaments.leafClass || 'animate-ornament-zoom'}"
                      alt=""
                    />
                  )}
                  {config.ornaments.leaves.topRight && (
                    <img
                      src={config.ornaments.leaves.topRight}
                      className="absolute -top-4 -right-4 w-36 h-36 object-contain pointer-events-none opacity-85 z-[1] ${config.ornaments.leafClass || 'animate-ornament-zoom'}"
                      alt=""
                    />
                  )}
                  {config.ornaments.leaves.bottomLeft && (
                    <img
                      src={config.ornaments.leaves.bottomLeft}
                      className="absolute -bottom-8 -left-8 w-36 h-36 object-contain pointer-events-none opacity-40 z-[1] ${config.ornaments.leafClass || 'animate-ornament-zoom'}"
                      alt=""
                    />
                  )}
                  {config.ornaments.leaves.bottomRight && (
                    <img
                      src={config.ornaments.leaves.bottomRight}
                      className="absolute -bottom-8 -right-8 w-36 h-36 object-contain pointer-events-none opacity-40 z-[1] ${config.ornaments.leafClass || 'animate-ornament-zoom'}"
                      alt=""
                    />
                  )}
                </>
              )}

              <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
                <p className={config.global.labelClass}>THE WEDDING OF</p>

                {config.ornaments?.frame ? (
                  <>
                    {/* Circle photo with frame ornament */}
                    {heroPhoto && (
                      <div className={`relative ${config.ornaments.frameSize} my-6 flex items-center justify-center`}>
                        <img
                          src={config.ornaments.frame}
                          className="absolute inset-0 w-full h-full object-contain z-10"
                          alt=""
                        />
                        <div className={`${config.ornaments.photoSize} ${config.ornaments.photoShapeClass || 'rounded-full'} overflow-hidden z-0`}
                          style={{ transform: config.ornaments.photoOffset, ...(config.ornaments.photoStyle || {}) }}>
                          <img
                            src={heroPhoto}
                            className="w-full h-full object-cover"
                            alt="Couple"
                          />
                        </div>
                      </div>
                    )}
                    <h1 className={`${config.hero.brideGroomClass} my-4`}>
                      {data.groom.nickname} <span className={config.hero.ampersandClass}>&</span> {data.bride.nickname}
                    </h1>
                  </>
                ) : (
                  <>
                    <h1 className={`${config.hero.brideGroomClass} ${config.global.textPrimary}`}>
                      {data.groom.nickname}
                    </h1>
                    <p className={config.hero.ampersandClass}>&</p>
                    <h1 className={`${config.hero.brideGroomClass} ${config.global.textPrimary} mb-8`}>
                      {data.bride.nickname}
                    </h1>
                  </>
                )}

                <div className="w-8 h-[1px] bg-neutral-300 mb-8" />

                <p className={config.hero.dateClass}>
                  {primaryEvent?.dateLabel || primaryEvent?.date || 'Rabu, 26 November 2025'}
                </p>
                <p className={`text-xs px-6 mb-8 ${config.global.textMuted} leading-relaxed font-light`}>
                  {primaryEvent ? `${primaryEvent.venue}${primaryEvent.address ? ` · ${primaryEvent.address.split(',').slice(-2).join(', ').trim()}` : ''}` : 'Jakarta'}
                </p>

                {/* Countdown Timer */}
                {data.countdownEnabled && countdown && (
                  <div className="flex gap-2 mb-8">
                    {[
                      { label: 'days', val: countdown.d },
                      { label: 'hours', val: countdown.h },
                      { label: 'mins', val: countdown.m },
                      { label: 'secs', val: countdown.s }
                    ].map((unit, i) => (
                      <div key={i} className={`w-16 h-16 ${config.global.rounded} flex flex-col items-center justify-center border ${config.global.borderClass} bg-white/80 shadow-sm transition-transform hover:scale-105`}>
                        <span className={`text-lg font-light ${config.global.textPrimary} font-serif`}>{String(unit.val).padStart(2, '0')}</span>
                        <span className={`text-[8px] font-bold tracking-widest ${config.global.textMuted} mt-1 uppercase`}>{unit.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Save Date Button */}
                <button
                  onClick={() => {
                    const title = encodeURIComponent(`Pernikahan ${data.groom.nickname} & ${data.bride.nickname}`)
                    const dateStr = primaryEvent?.date?.replace(/-/g, '') || '20261126'
                    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}T080000Z/${dateStr}T120000Z`, '_blank')
                  }}
                  className={`inline-flex items-center gap-2 py-2.5 ${config.hero.buttonClass}`}
                  style={config.global.primaryButtonColor ? {
                    backgroundColor: config.global.primaryButtonColor,
                    color: '#ffffff'
                  } : (data.customColors?.primary ? {
                    backgroundColor: primaryColor,
                    color: '#ffffff'
                  } : undefined)}
                >
                  <Calendar size={12} />
                  <span>{config.global.saveDateLabel || 'SAVE THE DATE'}</span>
                </button>
              </div>
            </section>

            {/* ══════════  QUOTE  ══════════ */}
            {data.quote && (
              <section className={`py-20 px-6 border-y ${config.global.borderClass} ${config.global.sectionBg}`}>
                <Reveal className="max-w-xl mx-auto text-center">
                  <span className={config.global.labelClass}>VERSE</span>
                  <p className={`font-serif text-base leading-relaxed ${config.global.textSecondary} font-light italic`}>
                    {data.quote}
                  </p>
                </Reveal>
              </section>
            )}

            {/* ══════════  COUPLE INFO  ══════════ */}
            <section id="mempelai" className={`relative py-20 px-6 ${config.global.sectionAltBg}`}>
              {config.ornaments?.leaves && (
                <>
                  {config.ornaments.leaves.topRight && (
                    <img
                      src={config.ornaments.leaves.topRight}
                      className="absolute top-0 right-0 w-32 h-32 object-contain pointer-events-none opacity-50 z-0 ${config.ornaments.leafClass || 'animate-ornament-zoom'}"
                      alt=""
                    />
                  )}
                  {config.ornaments.leaves.bottomLeft && (
                    <img
                      src={config.ornaments.leaves.bottomLeft}
                      className="absolute bottom-0 left-0 w-32 h-32 object-contain pointer-events-none opacity-50 z-0 ${config.ornaments.leafClass || 'animate-ornament-zoom'}"
                      alt=""
                    />
                  )}
                </>
              )}
              <Reveal className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                  <span className={config.global.labelClass}>THE COUPLE</span>
                  <h2 className={config.global.headingClass}>Dua Insan Bersatu</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  {[data.groom, data.bride].map((person, i) => (
                    <Reveal key={i} delay={i * 150}
                      className={`${config.couple.cardClass} relative`}>

                      {config.couple.frame ? (
                        <div className={`relative ${config.couple.frameSize} mx-auto ${config.couple.photoMargin || 'mb-6'} flex items-center justify-center`}>
                          <img
                            src={config.couple.frame}
                            className="absolute inset-0 w-full h-full object-contain z-10"
                            alt=""
                          />
                          <div className={`${config.couple.photoSize} ${config.couple.photoShapeClass || 'rounded-full'} overflow-hidden z-0`}
                            style={{ transform: config.couple.photoOffset, ...(config.couple.photoStyle || {}) }}>
                            {person.photo ? (
                              <img src={person.photo} alt={person.name} className={`w-full h-full object-cover ${config.couple.photoClass}`} />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center text-4xl ${config.couple.photoClass} bg-neutral-100`}>
                                <span>{i === 0 ? '🤵' : '👰'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        person.photo ? (
                          <img src={person.photo} alt={person.name}
                            className={`${config.couple.photoSize || 'w-28 h-28'} mx-auto ${config.couple.photoMargin || 'mb-6'} object-cover ${config.couple.photoClass}`} />
                        ) : (
                          <div className={`${config.couple.photoSize || 'w-28 h-28'} mx-auto ${config.couple.photoMargin || 'mb-6'} flex items-center justify-center text-4xl ${config.couple.photoClass} bg-neutral-100`}>
                            <span>{i === 0 ? '🤵' : '👰'}</span>
                          </div>
                        )
                      )}
                      <p className={`text-[9px] font-bold tracking-[0.25em] ${config.global.textMuted} uppercase mb-2`}>
                        {i === 0 ? 'GROOM' : 'BRIDE'}
                      </p>
                      <h3 className={`${config.couple.nameClass} ${config.global.textPrimary}`}>{person.name}</h3>
                      <div className={`${config.couple.infoClass || 'text-xs space-y-1'} ${config.global.textSecondary} font-light`}>
                        <p className={`text-[10px] ${config.global.textMuted}`}>{i === 0 ? 'Putra' : 'Putri'} dari</p>
                        <p className={`font-medium ${config.global.textPrimary}`}>{person.father}</p>
                        <p className={`text-[9px] ${config.global.textMuted}`}>dan</p>
                        <p className={`font-medium ${config.global.textPrimary}`}>{person.mother}</p>
                      </div>
                      <a href={`https://instagram.com/${person.instagram}`}
                        target="_blank" rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 mt-6 text-[10px] tracking-wider uppercase ${config.global.textMuted} hover:${config.global.textPrimary} transition-colors`}>
                        📸 Instagram
                      </a>
                    </Reveal>
                  ))}
                </div>
              </Reveal>
            </section>

            {/* ══════════  EVENTS  ══════════ */}
            <section id="acara" className={`relative py-20 px-6 border-y ${config.global.borderClass} ${config.global.sectionBg}`}>
              {config.ornaments?.leaves && (
                <>
                  {config.ornaments.leaves.topLeft && (
                    <img
                      src={config.ornaments.leaves.topLeft}
                      className="absolute top-0 left-0 w-32 h-32 object-contain pointer-events-none opacity-50 z-0 ${config.ornaments.leafClass || 'animate-ornament-zoom'}"
                      alt=""
                    />
                  )}
                  {config.ornaments.leaves.bottomRight && (
                    <img
                      src={config.ornaments.leaves.bottomRight}
                      className="absolute bottom-0 right-0 w-32 h-32 object-contain pointer-events-none opacity-50 z-0 ${config.ornaments.leafClass || 'animate-ornament-zoom'}"
                      alt=""
                    />
                  )}
                </>
              )}
              <Reveal className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                  <span className={config.global.labelClass}>SCHEDULE</span>
                  <h2 className={config.global.headingClass}>Rangkaian Acara</h2>
                </div>

                {/* Tab navigation */}
                <div className={`flex gap-4 mb-8 mx-auto w-fit border-b ${config.global.borderClass}`}>
                  {data.events.map((ev, idx) => (
                    <button key={ev.id}
                      onClick={() => setActiveTab(idx)}
                      className={`${config.events.tabClass} transition-all duration-200 relative`}
                      style={{
                        color: activeTab === idx ? primaryColor : '#aaa',
                      }}>
                      {ev.name || `Session ${idx + 1}`}
                      {activeTab === idx && (
                        <div className="absolute bottom-[-1px] left-0 right-0 h-[2px]" style={{ background: primaryColor }} />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {(() => {
                  const ev = data.events[activeTab] || data.events[0]
                  if (!ev) return null

                  // Parse date for calendar-style layout (special-001)
                  const parseDateParts = (dateStr) => {
                    if (!dateStr) return null
                    const d = new Date(dateStr)
                    if (isNaN(d)) return null
                    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
                    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
                    return {
                      dayName: days[d.getDay()],
                      date: d.getDate(),
                      year: d.getFullYear(),
                      month: months[d.getMonth()]
                    }
                  }
                  const dateParts = config.events?.calendarStyle ? parseDateParts(ev.date) : null

                  return (
                    <div className={`${config.events.cardClass}`}>
                      <div className="text-center mb-6">
                        {config.events?.calendarStyle ? (
                          <>
                            <h4 className={`${config.events.titleClass} mb-4`}>{ev.name}</h4>
                            {dateParts ? (
                              <div className="flex flex-col items-center gap-0 mb-4">
                                <p className={`text-[13px] font-medium ${config.global.textSecondary} tracking-wider uppercase`}>{dateParts.dayName}</p>
                                <p className="text-[65px] font-light leading-none font-serif" style={config.global.primaryButtonColor ? { color: config.global.primaryButtonColor } : undefined}>{dateParts.date}</p>
                                <p className={`text-[13px] font-medium ${config.global.textSecondary} tracking-wider`}>{dateParts.year}</p>
                                <p className={`text-[13px] font-medium ${config.global.textSecondary} tracking-wider uppercase`}>{dateParts.month}</p>
                              </div>
                            ) : (
                              <h4 className={`${config.events.titleClass}`}>{ev.dateLabel || ev.date}</h4>
                            )}
                            <div className="w-8 h-[1px] mx-auto mb-3" style={config.global.primaryButtonColor ? { backgroundColor: `${config.global.primaryButtonColor}4d` } : { backgroundColor: 'currentColor', opacity: 0.3 }} />
                            <p className={`text-[13px] ${config.global.textPrimary} font-medium`}>{ev.start}{ev.end ? ` - ${ev.end}` : ''} {ev.tz}</p>
                          </>
                        ) : (
                          <>
                            <div className="text-2xl mb-2">{ev.emoji || '⚜️'}</div>
                            <p className={`text-[9px] font-bold tracking-[0.25em] ${config.global.textMuted} uppercase mb-1`}>{ev.name}</p>
                            <h4 className={`${config.events.titleClass}`}>{ev.dateLabel || ev.date}</h4>
                            <p className={`${config.global.textSecondary} text-xs mt-1 font-light`}>{ev.start} – {ev.end} {ev.tz}</p>
                          </>
                        )}
                      </div>
                      <div className={`border-t ${config.global.borderClass} pt-6 space-y-4`}>
                        <div className="text-center">
                          <p className={`text-[9px] font-bold ${config.global.textMuted} uppercase tracking-widest mb-1`}>{config.global.venueLabel || 'VENUE'}</p>
                          <p className={`font-medium ${config.global.textPrimary} text-sm`}>{ev.venue}</p>
                          <p className={`text-xs ${config.global.textSecondary} mt-1 font-light`}>{ev.address}</p>
                        </div>
                        {ev.maps && (
                          <a href={ev.maps} target="_blank" rel="noopener noreferrer"
                            className={`flex items-center justify-center gap-2 w-full py-3 ${config.global.rounded} font-medium text-[10px] tracking-widest uppercase transition-all border ${config.global.borderClass} ${config.global.textPrimary} hover:opacity-80`}
                            style={config.global.primaryButtonColor ? { background: config.global.primaryButtonColor, color: '#fff', borderColor: config.global.primaryButtonColor, borderRadius: '12px' } : { background: 'transparent' }}>
                            {config.global.venueButtonLabel || (config.global.isSpecial ? 'Google Maps' : 'MAP DIRECTIONS')}
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </Reveal>
            </section>

            {/* ══════════  LOVE STORY  ══════════ */}
            {data.loveStory && data.loveStory.length > 0 && (
              <section id="love-story" className={`py-20 px-6 ${config.global.sectionAltBg}`}>
                <Reveal className="max-w-xl mx-auto">
                  <div className="text-center mb-16">
                    <span className={config.global.labelClass}>JOURNEY</span>
                    <h2 className={config.global.headingClass}>Perjalanan Cinta Kami</h2>
                  </div>
                  <div className="relative pl-6">
                    <div className={`absolute left-2.5 top-0 bottom-0 w-[1px] ${config.story.lineClass}`} />
                    <div className="space-y-8">
                      {data.loveStory.map((item, i) => (
                        <Reveal key={i} delay={i * 100} className="relative">
                          <div className={`absolute -left-[22px] w-3 h-3 ${config.story.dotClass}`} style={{ top: '22px' }} />
                          <div className={`${config.story.cardClass}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{item.emoji}</span>
                              <span className={`text-[10px] font-bold tracking-wider ${config.global.textMuted}`}>{item.year}</span>
                              <span className={`w-1.5 h-1.5 ${config.story.lineClass} rounded-full`} />
                              <p className={`font-serif font-light ${config.global.textPrimary} text-sm tracking-wide`}>{item.title}</p>
                            </div>
                            {item.photo && (
                              <div className={`mb-3 ${config.global.rounded} overflow-hidden aspect-video relative border ${config.global.borderClass}`}>
                                <img src={item.photo} alt={item.title} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <p className={`${config.global.textSecondary} text-xs font-light leading-relaxed`}>{item.desc}</p>
                          </div>
                        </Reveal>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </section>
            )}

            {/* ══════════  DRESSCODE  ══════════ */}
            {data.dresscode?.name && (
              <section className={`py-20 px-6 border-y ${config.global.borderClass} ${config.global.sectionBg}`}>
                <Reveal className="max-w-sm mx-auto text-center">
                  <span className={config.global.labelClass}>DRESS CODE</span>
                  <div className={`w-20 h-20 ${config.global.rounded} mx-auto mb-5 flex items-center justify-center text-3xl border ${config.global.borderClass} ${config.global.shadow}`}
                    style={{ background: data.dresscode.color }}>
                    👗
                  </div>
                  <h3 className={`font-serif text-xl font-light ${config.global.textPrimary} mb-2`}>{data.dresscode.name}</h3>
                  <p className={`${config.global.textSecondary} text-xs font-light leading-relaxed mb-4`}>{data.dresscode.notes}</p>
                  <div className={`mt-4 w-12 h-2 border ${config.global.borderClass} mx-auto`}
                    style={{ background: data.dresscode.color }} />
                </Reveal>
              </section>
            )}

            {/* ══════════  GALLERY  ══════════ */}
            {((data.gallery && data.gallery.length > 0) || data.videoUrl) && (
              <section id="galeri" className={`py-20 px-6 ${config.global.sectionAltBg}`}>
                <Reveal className="max-w-3xl mx-auto">
                  <div className="text-center mb-12">
                    <span className={config.global.labelClass}>GALLERY</span>
                    <h2 className={config.global.headingClass}>Momen Bersama</h2>
                  </div>
                  {data.gallery && data.gallery.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {data.gallery.map((photo, i) => (
                        <div key={photo.id || i}
                          className={`aspect-square ${config.gallery.itemClass}`}>
                          <img src={photo.src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  {data.videoUrl && getEmbedUrl(data.videoUrl) && (
                    <div className={`mt-6 aspect-video w-full ${config.global.rounded} overflow-hidden ${config.global.shadow} border ${config.global.borderClass}`}>
                      <iframe
                        src={getEmbedUrl(data.videoUrl)}
                        className="w-full h-full"
                        title="Prewedding Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </Reveal>
              </section>
            )}

            {/* ══════════  RSVP & WISHES  ══════════ */}
            <section id="rsvp" className={`relative py-20 px-6 border-y ${config.global.borderClass} ${config.global.sectionBg}`}>
              {config.ornaments?.leaves && (
                <>
                  {config.ornaments.leaves.topLeft && (
                    <img
                      src={config.ornaments.leaves.topLeft}
                      className="absolute top-4 left-4 w-28 h-28 object-contain pointer-events-none opacity-40 z-0 ${config.ornaments.leafClass || 'animate-ornament-zoom'}"
                      alt=""
                    />
                  )}
                  {config.ornaments.leaves.bottomRight && (
                    <img
                      src={config.ornaments.leaves.bottomRight}
                      className="absolute bottom-4 right-4 w-28 h-28 object-contain pointer-events-none opacity-40 z-0 ${config.ornaments.leafClass || 'animate-ornament-zoom'}"
                      alt=""
                    />
                  )}
                </>
              )}
              <Reveal className="max-w-xl mx-auto">
                <div className="text-center mb-12">
                  <span className={config.global.labelClass}>RSVP</span>
                  <h2 className={config.global.headingClass}>Konfirmasi & Ucapan</h2>
                </div>

                {!rsvpSent ? (
                  <form onSubmit={handleRsvpSubmit} className={`${config.rsvp.formClass} space-y-4`}>
                    <div className="text-left">
                      <label className={`block text-[9px] font-bold ${config.global.textMuted} uppercase tracking-widest mb-1.5`}>FULL NAME</label>
                      <input className={`${config.rsvp.inputClass}`}
                        value={rsvpName} onChange={e => setRsvpName(e.target.value)}
                        placeholder="Masukkan nama Anda..." required />
                    </div>
                    <div className="text-left">
                      <label className={`block text-[9px] font-bold ${config.global.textMuted} uppercase tracking-widest mb-1.5`}>ATTENDANCE</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['hadir', 'tidak_hadir'].map(status => (
                          <button key={status} type="button"
                            onClick={() => setRsvpStatus(status)}
                            className={`py-3 ${config.global.rounded} text-[10px] tracking-wider uppercase font-bold border transition-all duration-200`}
                            style={{
                              background: rsvpStatus === status ? primaryColor : 'transparent',
                              borderColor: primaryColor,
                              color: rsvpStatus === status ? '#fff' : primaryColor,
                            }}>
                            {status === 'hadir' ? '✅ Saya Hadir' : '❌ Tidak Hadir'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="text-left">
                      <label className={`block text-[9px] font-bold ${config.global.textMuted} uppercase tracking-widest mb-1.5`}>WISHES & BLESSINGS</label>
                      <textarea className={`${config.rsvp.inputClass} resize-none`}
                        rows={3} value={rsvpWish} onChange={e => setRsvpWish(e.target.value)}
                        placeholder="Tulis ucapan dan doa terbaikmu untuk kami..." />
                    </div>
                    <button type="submit"
                      className={`w-full py-4 ${config.rsvp.buttonClass}`}
                      style={{ background: primaryColor }}>
                      SEND RSVP & WISHES
                    </button>
                  </form>
                ) : (
                  <div className={`text-center p-8 ${config.rsvp.formClass}`}>
                    <div className="text-4xl mb-3">🕊️</div>
                    <h3 className={`font-serif text-xl font-light mb-2 ${config.global.textPrimary}`}>Terima Kasih!</h3>
                    <p className={`text-xs ${config.global.textSecondary} font-light`}>RSVP dan ucapanmu telah kami terima. Sampai jumpa di hari bahagia kami! 💍</p>
                  </div>
                )}

                {wishes.length > 0 && (
                  <div className="mt-8 space-y-3 text-left">
                    <h4 className={`font-bold ${config.global.textMuted} text-[9px] tracking-widest uppercase`}>GUEST MESSAGES ({wishes.length})</h4>
                    {wishes.map((w, i) => (
                      <div key={i} className={`flex gap-3 ${config.rsvp.cardClass}`}>
                        <div className={`w-8 h-8 flex items-center justify-center font-serif ${config.global.textSecondary} text-sm font-light ${config.rsvp.avatarClass}`}>
                          {w.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className={`font-semibold ${config.global.textPrimary} text-xs`}>{w.name}</p>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 ${config.global.rounded} border ${config.global.borderClass} tracking-wider ${config.global.textMuted} uppercase`}>
                              {w.rsvp === 'hadir' ? 'Attending' : 'Regret'}
                            </span>
                          </div>
                          {w.wish && <p className={`${config.global.textSecondary} text-xs font-light leading-relaxed`}>"{w.wish}"</p>}
                          <p className={`${config.global.textMuted} text-[8px] mt-1 font-light uppercase tracking-wider`}>{w.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Reveal>
            </section>

            {/* ══════════  GIFT / E-AMPLOP  ══════════ */}
            {data.accounts && data.accounts.length > 0 && (
              <section id="hadiah" className={`py-20 px-6 ${config.global.sectionAltBg}`}>
                <Reveal className="max-w-xl mx-auto">
                  <div className="text-center mb-12">
                    <span className={config.global.labelClass}>GIFTS</span>
                    <h2 className={config.global.headingClass}>Kirim Hadiah</h2>
                    <p className={`${config.global.textSecondary} text-xs mt-2 font-light`}>
                      {data.giftAddress?.enabled
                        ? 'Bagi yang ingin memberikan hadiah, berikut informasi rekening & alamat pengiriman kami.'
                        : 'Bagi yang ingin memberikan hadiah, berikut informasi rekening kami.'}
                    </p>
                  </div>

                  <div className="flex justify-center mb-6">
                    <button
                      onClick={() => setShowGifts(p => !p)}
                      className={`flex items-center gap-2 py-3.5 px-6 ${config.gift.buttonClass} transition-all duration-300`}
                      style={data.customColors?.primary ? {
                        borderColor: primaryColor,
                        color: primaryColor,
                      } : (config.global.secondaryButtonColor ? {
                        borderColor: config.global.secondaryButtonColor,
                        color: config.global.secondaryButtonColor,
                      } : undefined)}
                    >
                      🎁 {showGifts ? 'HIDE GIFT DETAILS' : 'SHOW GIFT DETAILS'}
                    </button>
                  </div>

                  {showGifts && (
                    <div className="space-y-3 animate-fade-in text-left">
                      {data.accounts.map((acc, i) => {
                        const accKey = acc.id || acc.number || i
                        return (
                          <div key={accKey} className={`${config.gift.cardClass} flex items-center gap-4`}>
                            <div className={`w-10 h-10 flex items-center justify-center text-lg ${config.gift.iconClass}`}>
                              {acc.type === 'bank' ? '🏦' : '📱'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold ${config.global.textPrimary} text-xs`}>{acc.bank}</p>
                              <p className={`${config.global.textSecondary} text-[10px] font-light`}>{acc.holder}</p>
                              <p className={`font-mono text-sm font-bold ${config.global.textPrimary} mt-0.5`}>{acc.number}</p>
                            </div>
                            <button
                              onClick={() => copyAccount(acc.number, accKey)}
                              className={`flex-shrink-0 px-3 py-1.5 border ${config.global.borderClass} ${config.global.rounded} text-[9px] font-bold tracking-wider uppercase transition-all ${config.global.textPrimary} hover:opacity-80`}
                              style={{
                                background: copied === accKey ? primaryColor : 'transparent',
                                color: copied === accKey ? '#fff' : primaryColor,
                                borderColor: primaryColor
                              }}>
                              {copied === accKey ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        )
                      })}

                      {data.giftAddress?.enabled && (
                        <div className={`${config.gift.cardClass} flex items-start gap-4`}>
                          <div className={`w-10 h-10 flex items-center justify-center text-lg ${config.gift.iconClass}`}>
                            🎁
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold ${config.global.textPrimary} text-xs`}>Alamat Pengiriman Kado</p>
                            <p className={`${config.global.textSecondary} text-[10px] mt-1 font-semibold`}>Penerima: {data.giftAddress.recipient}</p>
                            {data.giftAddress.phone && (
                              <p className={`${config.global.textMuted} text-[10px] font-light`}>No. HP: {data.giftAddress.phone}</p>
                            )}
                            <p className={`${config.global.textMuted} text-[11px] mt-1.5 whitespace-pre-line leading-relaxed font-light`}>{data.giftAddress.address}</p>
                          </div>
                          <button
                            onClick={() => copyAccount(data.giftAddress.address, 'address')}
                            className={`flex-shrink-0 px-3 py-1.5 border ${config.global.borderClass} ${config.global.rounded} text-[9px] font-bold tracking-wider uppercase transition-all ${config.global.textPrimary} self-center hover:opacity-80`}
                            style={{
                              background: copied === 'address' ? primaryColor : 'transparent',
                              color: copied === 'address' ? '#fff' : primaryColor,
                              borderColor: primaryColor
                            }}>
                            {copied === 'address' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </Reveal>
              </section>
            )}

            {/* ══════════  LIVE STREAMING  ══════════ */}
            {data.livestreamEnabled && data.livestreamPlatforms && data.livestreamPlatforms.some(p => p.url) && (
              <section id="livestream" className={`py-20 px-6 border-t ${config.global.borderClass} ${config.global.sectionBg}`}>
                <Reveal className="max-w-md mx-auto text-center">
                  <span className={config.global.labelClass}>LIVE STREAMING</span>
                  <h2 className={`${config.global.headingClass} mb-4`}>Saksikan Bersama</h2>
                  <p className={`${config.global.textSecondary} text-sm font-light leading-relaxed mb-7 max-w-xs mx-auto`}>Bagi yang berhalangan hadir, saksikan momen bahagia kami secara langsung.</p>
                  <div className="flex flex-col gap-3 items-center">
                    {data.livestreamPlatforms.filter(p => p.url).map((p, i) => (
                      <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-2 py-3 px-8 ${config.global.rounded} font-medium text-[10px] tracking-widest uppercase transition-all border ${config.global.borderClass} ${config.global.textPrimary} hover:opacity-80`}
                        style={config.global.primaryButtonColor ? { background: config.global.primaryButtonColor, color: '#fff', borderColor: config.global.primaryButtonColor, borderRadius: '12px' } : { background: 'transparent' }}>
                        {p.type || 'Tonton Live'}
                      </a>
                    ))}
                  </div>
                </Reveal>
              </section>
            )}

            {/* ══════════  TURUT MENGUNDANG  ══════════ */}
            {data.turutMengundangEnabled && data.families && data.families.some(f => f.members.some(m => m.trim() !== '')) && (
              <section id="turut-mengundang" className={`py-20 px-6 border-t ${config.global.borderClass} ${config.global.sectionAltBg}`}>
                <Reveal className="max-w-xl mx-auto text-center">
                  <span className={config.global.labelClass}>TURUT MENGUNDANG</span>
                  <h2 className={`${config.global.headingClass} mb-12`}>Keluarga Besar</h2>
                  <div className="grid sm:grid-cols-2 gap-8">
                    {data.families.map((fam, i) => {
                      const validMembers = fam.members.filter(m => m.trim() !== '');
                      if (validMembers.length === 0) return null;
                      return (
                        <div key={i} className="space-y-3">
                          <h3 className={`font-serif text-lg ${config.global.textPrimary}`}>{fam.side}</h3>
                          <div className={`space-y-1.5 ${config.global.textSecondary} text-sm font-light leading-relaxed`}>
                            {validMembers.map((member, idx) => (
                              <p key={idx}>{member}</p>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Reveal>
              </section>
            )}

            {/* ══════════  FOOTER  ══════════ */}
            <footer className={`relative py-20 px-6 text-center border-t ${config.global.borderClass} ${config.global.sectionBg}`}>
              {config.ornaments?.leaves && (
                <>
                  {config.ornaments.leaves.topLeft && (
                    <img
                      src={config.ornaments.leaves.topLeft}
                      className="absolute top-0 left-0 w-32 h-32 object-contain pointer-events-none opacity-50 z-0 ${config.ornaments.leafClass || 'animate-ornament-zoom'}"
                      alt=""
                    />
                  )}
                  {config.ornaments.leaves.topRight && (
                    <img
                      src={config.ornaments.leaves.topRight}
                      className="absolute top-0 right-0 w-32 h-32 object-contain pointer-events-none opacity-50 z-0 ${config.ornaments.leafClass || 'animate-ornament-zoom'}"
                      alt=""
                    />
                  )}
                </>
              )}
              <div className="max-w-sm mx-auto">
                <div className="w-6 h-[1px] bg-neutral-300 mx-auto mb-8" />
                {data.meta?.footerPhoto && (
                  <div className={`w-32 h-32 mx-auto mb-6 ${config.footer?.photoClass || config.global.rounded} overflow-hidden border ${config.global.borderClass} shadow-sm relative z-10 flex items-center justify-center`}>
                    <img src={data.meta.footerPhoto} className="w-full h-full object-cover" alt="Footer Couple" />
                  </div>
                )}
                <h2 className={`${config.global.headingClass} mb-2`}>
                  {data.groom.nickname} & {data.bride.nickname}
                </h2>
                <p className={`text-[10px] font-bold tracking-widest uppercase mb-8 ${config.global.textMuted}`}>
                  {(primaryEvent?.dateLabel || primaryEvent?.date || '26 November 2025')} · {primaryEvent?.venue || 'Jakarta'}
                </p>
                <p className={`text-xs leading-relaxed mb-8 ${config.global.textSecondary} font-light`}>
                  Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
                </p>
                <div className="w-6 h-[1px] bg-neutral-300 mx-auto mb-8" />
                <p className={`text-[9px] ${config.global.textMuted} tracking-wider uppercase font-light`}>CREATED WITH LOVE BY</p>
                <div className="flex items-center justify-center gap-1 mt-1.5">
                  <span className={`font-serif italic font-light text-sm ${config.global.textPrimary} tracking-wide`}>ulema</span>
                </div>
              </div>
            </footer>
          </div>
        </div>

        {/* Floating Bottom Navigation Bar */}
        {opened && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 md:absolute md:bottom-6 md:left-1/2 md:-translate-x-1/2 z-50 flex items-center justify-center bg-white/95 border ${config.global.borderClass} ${config.global.rounded} p-1.5 shadow-md gap-1.5 max-w-md w-fit transition-all duration-300`}>
            {[
              { href: '#hero', icon: Home, title: 'Home' },
              { href: '#mempelai', icon: Heart, title: 'Mempelai' },
              { href: '#acara', icon: Calendar, title: 'Acara' },
              { href: '#galeri', icon: Camera, title: 'Galeri' },
              { href: '#hadiah', icon: Gift, title: 'Hadiah' },
              { href: '#rsvp', icon: MessageSquare, title: 'RSVP' }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <a
                  key={index}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`w-9 h-9 ${config.global.rounded} flex items-center justify-center ${config.global.textMuted} hover:${config.global.textPrimary} transition-colors border border-transparent hover:border-neutral-200`}
                  title={item.title}
                >
                  <Icon size={16} />
                </a>
              )
            })}
          </div>
        )}

        {/* Cover Screen Overlay */}
        {!opened && (
          <div className={`absolute inset-0 z-50 flex flex-col overflow-y-auto overflow-x-hidden ${config.global.sectionAltBg}`}
            style={{
              transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1s ease',
              transform: animateClose ? 'translateY(-100%)' : 'translateY(0)',
              opacity: animateClose ? 0 : 1,
              pointerEvents: animateClose ? 'none' : 'auto',
              background: coverBg
            }}>
            <div className={`flex-1 min-h-screen flex flex-col items-center ${meta.coverStyle === 'fade' ? 'justify-end pb-12' : 'justify-center'} relative overflow-hidden`}>
              {/* Fade Cover Photo */}
              {meta.coverStyle === 'fade' && coverPhoto && (
                <div className="absolute inset-x-0 top-0 h-[65%] z-0 overflow-hidden">
                  <img
                    src={coverPhoto}
                    className="w-full h-full object-cover"
                    style={{
                      maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 100%)'
                    }}
                    alt="Cover"
                  />
                </div>
              )}

              {config.ornaments?.leaves && (
                <>
                  {config.ornaments.leaves.topLeft && (
                    <img
                      src={config.ornaments.leaves.topLeft}
                      className="absolute top-0 left-0 w-36 h-36 object-contain pointer-events-none opacity-85 z-10 ${config.ornaments.leafClass || 'animate-ornament-zoom'}"
                      alt=""
                    />
                  )}
                  {config.ornaments.leaves.topRight && (
                    <img
                      src={config.ornaments.leaves.topRight}
                      className="absolute top-0 right-0 w-36 h-36 object-contain pointer-events-none opacity-85 z-10 ${config.ornaments.leafClass || 'animate-ornament-zoom'}"
                      alt=""
                    />
                  )}
                  {config.ornaments.leaves.bottomLeft && (
                    <img
                      src={config.ornaments.leaves.bottomLeft}
                      className="absolute bottom-0 left-0 w-36 h-36 object-contain pointer-events-none opacity-85 z-10 ${config.ornaments.leafClass || 'animate-ornament-zoom'}"
                      alt=""
                    />
                  )}
                  {config.ornaments.leaves.bottomRight && (
                    <img
                      src={config.ornaments.leaves.bottomRight}
                      className="absolute bottom-0 right-0 w-36 h-36 object-contain pointer-events-none opacity-85 z-10 ${config.ornaments.leafClass || 'animate-ornament-zoom'}"
                      alt=""
                    />
                  )}
                </>
              )}

              <div className={`relative z-10 text-center px-8 max-w-sm mx-auto w-full flex flex-col items-center py-8`}>
                <p className={`${config.global.labelClass}`}>WEDDING INVITATION</p>

                {(!meta.coverStyle || meta.coverStyle === 'circle') && (
                  <div className={`w-36 h-36 mx-auto my-5 ${config.couple.photoClass} overflow-hidden flex items-center justify-center`}>
                    <img src={coverPhoto} className="w-full h-full object-cover" alt="Cover" />
                  </div>
                )}

                {config.global.isSpecial ? (
                  <h1 className={`${config.hero.brideGroomClass} my-8`}
                    style={{
                      fontSize: '42px',
                      lineHeight: '1.2',
                      ...(meta.coverStyle === 'fade' && coverPhoto ? {
                        color: '#ffffff',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.6)'
                      } : {})
                    }}>
                    {data.groom.nickname}{' '}
                    <span className={config.hero.ampersandClass}
                      style={meta.coverStyle === 'fade' && coverPhoto ? { color: '#ffffff' } : undefined}>
                      &
                    </span>{' '}
                    {data.bride.nickname}
                  </h1>
                ) : (
                  <>
                    <h1 className={`${config.hero.brideGroomClass} ${config.global.textPrimary}`}>
                      {data.groom.nickname}
                    </h1>
                    <p className={config.hero.ampersandClass}>&</p>
                    <h1 className={`${config.hero.brideGroomClass} ${config.global.textPrimary} mb-8`}>
                      {data.bride.nickname}
                    </h1>
                  </>
                )}

                <div className="w-6 h-[1px] bg-neutral-300 mb-8" />

                {config.global.isSpecial ? (
                  <div className="mb-8 text-center w-full flex flex-col items-center">
                    <p className={`text-[10px] ${config.global.textSecondary} mb-0.5 tracking-widest uppercase font-bold`}>Kepada Yth.</p>
                    <p className={`text-[11px] ${config.global.textSecondary} mb-3 font-semibold`}>Bapak/Ibu/Saudara/i</p>
                    <div className="bg-white/75 backdrop-blur-sm px-6 py-4 border rounded-2xl shadow-sm text-center min-w-[220px] mb-3"
                      style={config.global.primaryButtonColor ? { borderColor: `${config.global.primaryButtonColor}33` } : undefined}>
                      <p className="font-serif text-lg font-medium"
                        style={config.global.primaryButtonColor ? { color: config.global.primaryButtonColor } : undefined}>{guestName}</p>
                    </div>
                    <p className={`text-[9px] ${config.global.textMuted} italic leading-normal px-4`}>
                      *Mohon maaf jika ada kesalahan dalam penulisan nama / gelar.
                    </p>
                  </div>
                ) : (
                  <div className={`${config.rsvp.cardClass} mb-8 text-center w-full`}>
                    <p className={`text-[9px] mb-1 tracking-widest uppercase ${config.global.textMuted} font-bold`}>DEAR GUEST</p>
                    <p className={`font-serif font-light text-sm ${config.global.textPrimary}`}>{guestName}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setAnimateClose(true)
                    setMusicPlaying(true)
                    setTimeout(() => {
                      setOpened(true)
                    }, 1200)
                  }}
                  className={`group w-full flex items-center justify-center gap-2 py-3.5 px-8 ${config.hero.buttonClass}`}
                  style={data.customColors?.primary ? {
                    background: primaryColor,
                    color: '#fff',
                    borderColor: primaryColor
                  } : (config.global.primaryButtonColor ? {
                    background: config.global.primaryButtonColor,
                    color: '#ffffff',
                    borderColor: config.global.primaryButtonColor
                  } : {
                    background: primaryColor,
                    color: '#fff',
                    borderColor: primaryColor
                  })}
                >
                  {config.global.isSpecial ? (
                    <>
                      <BookOpen size={14} className="animate-pulse" />
                      <span className="tracking-wide">{config.global.openInvitationLabel || 'Buka Undangan'}</span>
                    </>
                  ) : (
                    <>
                      <span>OPEN INVITATION</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </>
                  )}
                </button>

                <p className={`text-[9px] mt-4 ${config.global.textMuted} tracking-wider uppercase font-light`}>
                  {config.global.tapToOpenLabel || 'TAP TO OPEN'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </InvitationLayout>
  )
}
