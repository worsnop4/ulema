export const THEME_CONFIGS = {
  'watercolor-floral': {
    global: {
      bgContainer: 'bg-[#fdfcf9] text-[#4a4138]',
      sectionBg: 'bg-transparent',
      sectionAltBg: 'bg-[#fbf9f4]',
      borderClass: 'border-[#eaddcf]',
      textPrimary: 'text-[#4a4138]',
      textSecondary: 'text-[#6f6356]',
      textMuted: 'text-[#8b7d6b]',
      rounded: 'rounded-2xl',
      shadow: 'shadow-md',
      labelClass: 'text-[9px] font-bold tracking-[0.3em] uppercase mb-4',
      headingClass: 'font-serif text-3xl font-normal tracking-wide',
    },
    hero: {
      bgClass: 'bg-transparent',
      brideGroomClass: 'font-serif text-5xl leading-tight text-center',
      ampersandClass: 'font-script text-4xl text-center',
      dateClass: 'tracking-widest text-xs uppercase font-medium mt-6 text-center',
      buttonClass: 'rounded-full px-10 shadow-lg text-white font-bold tracking-widest uppercase text-xs hover:scale-105 active:scale-95'
    },
    couple: {
      cardClass: 'bg-white p-8 text-center shadow-sm border border-[#eaddcf]/50 rounded-2xl',
      photoClass: 'rounded-full border-4 border-white shadow-md',
      nameClass: 'font-serif text-2xl mb-4',
    },
    events: {
      cardClass: 'bg-white p-8 shadow-sm border border-[#eaddcf]/50 rounded-2xl',
      tabClass: 'text-[10px] font-bold tracking-[0.25em] uppercase pb-2',
      titleClass: 'font-serif text-2xl mb-2',
    },
    story: {
      cardClass: 'bg-white p-5 border border-[#eaddcf]/50 shadow-sm rounded-2xl',
      dotClass: 'border-2 border-[#eaddcf] bg-white rounded-full',
      lineClass: 'bg-[#eaddcf]'
    },
    gallery: {
      itemClass: 'rounded-2xl overflow-hidden shadow-sm border border-[#eaddcf]/50 hover:scale-105 transition-transform'
    },
    rsvp: {
      formClass: 'bg-white p-6 shadow-sm border border-[#eaddcf]/50 rounded-2xl',
      inputClass: 'w-full rounded-xl px-4 py-3 text-xs border border-[#eaddcf] bg-white focus:border-[#a0855b]',
      buttonClass: 'rounded-xl tracking-widest uppercase font-bold transition-all text-white',
      cardClass: 'p-4 bg-white border border-[#eaddcf]/50 rounded-2xl',
      avatarClass: 'rounded-full border border-[#eaddcf] bg-[#fbf9f4]'
    },
    gift: {
      cardClass: 'bg-white p-5 border border-[#eaddcf]/50 shadow-sm rounded-2xl',
      iconClass: 'rounded-full bg-[#fbf9f4] border border-[#eaddcf]',
      buttonClass: 'rounded-xl uppercase font-bold tracking-wider text-xs border'
    }
  },

  'dark-luxury': {
    global: {
      bgContainer: 'bg-[#0c0a09] text-white',
      sectionBg: 'bg-[#0c0a09]',
      sectionAltBg: 'bg-[#151210]',
      borderClass: 'border-[#d4a96a]/20',
      textPrimary: 'text-white',
      textSecondary: 'text-neutral-300',
      textMuted: 'text-neutral-500',
      rounded: 'rounded-none',
      shadow: 'shadow-none',
      labelClass: 'text-[10px] font-bold tracking-[0.4em] uppercase mb-4 text-[#d4a96a]',
      headingClass: 'font-serif text-3xl font-extrabold tracking-widest uppercase',
    },
    hero: {
      bgClass: 'bg-[#0c0a09]',
      brideGroomClass: 'font-serif text-5xl font-extrabold tracking-widest uppercase text-center',
      ampersandClass: 'font-script text-4xl text-center text-[#d4a96a]',
      dateClass: 'tracking-[0.2em] text-xs uppercase font-bold mt-6 text-center text-neutral-300',
      buttonClass: 'rounded-none px-10 border border-[#d4a96a] text-[#d4a96a] font-bold tracking-[0.2em] uppercase text-xs hover:bg-[#d4a96a] hover:text-black'
    },
    couple: {
      cardClass: 'bg-[#151210] p-8 text-center border border-[#d4a96a]/20 rounded-none relative',
      photoClass: 'rounded-[30%_70%_70%_30%_/_40%_50%_60%_50%] border-2 border-[#d4a96a]/30 shadow-lg',
      nameClass: 'font-serif text-2xl font-extrabold tracking-widest uppercase mb-4',
    },
    events: {
      cardClass: 'bg-[#151210] p-8 border border-[#d4a96a]/20 rounded-none',
      tabClass: 'text-[10px] font-bold tracking-[0.3em] uppercase pb-2',
      titleClass: 'font-serif text-2xl font-extrabold tracking-widest uppercase mb-2',
    },
    story: {
      cardClass: 'bg-[#151210] p-5 border border-[#d4a96a]/20 rounded-none',
      dotClass: 'border border-[#d4a96a] bg-[#151210] rounded-none rotate-45',
      lineClass: 'bg-[#d4a96a]/30'
    },
    gallery: {
      itemClass: 'rounded-none overflow-hidden border border-[#d4a96a]/30 hover:opacity-80 transition-opacity'
    },
    rsvp: {
      formClass: 'bg-[#151210] p-6 border border-[#d4a96a]/20 rounded-none',
      inputClass: 'w-full rounded-none px-4 py-3 text-xs border border-[#d4a96a]/20 bg-[#0c0a09] text-white focus:border-[#d4a96a]',
      buttonClass: 'rounded-none tracking-[0.2em] uppercase font-bold transition-all text-black bg-[#d4a96a]',
      cardClass: 'p-4 bg-[#151210] border border-[#d4a96a]/20 rounded-none',
      avatarClass: 'rounded-none border border-[#d4a96a]/20 bg-[#0c0a09]'
    },
    gift: {
      cardClass: 'bg-[#151210] p-5 border border-[#d4a96a]/20 rounded-none',
      iconClass: 'rounded-none bg-[#0c0a09] border border-[#d4a96a]/20',
      buttonClass: 'rounded-none uppercase font-bold tracking-[0.2em] text-[9px] border border-[#d4a96a] text-[#d4a96a] hover:bg-[#d4a96a] hover:text-black'
    }
  },

  'modern-minimalist': {
    global: {
      bgContainer: 'bg-white text-slate-900',
      sectionBg: 'bg-white',
      sectionAltBg: 'bg-[#fbfbfb]',
      borderClass: 'border-neutral-200',
      textPrimary: 'text-neutral-900',
      textSecondary: 'text-neutral-600',
      textMuted: 'text-neutral-400',
      rounded: 'rounded-none',
      shadow: 'shadow-sm',
      labelClass: 'text-[9px] font-bold tracking-[0.3em] uppercase mb-4 text-neutral-500',
      headingClass: 'font-serif text-4xl font-light tracking-wide',
    },
    hero: {
      bgClass: 'bg-[#fbfbfb]',
      brideGroomClass: 'font-serif text-5xl font-light tracking-wider text-center',
      ampersandClass: 'font-serif text-3xl font-light italic text-center text-neutral-400',
      dateClass: 'tracking-widest text-xs uppercase font-medium mt-6 text-center text-neutral-800',
      buttonClass: 'rounded-none px-10 bg-neutral-900 text-white font-medium tracking-widest uppercase text-xs hover:bg-black'
    },
    couple: {
      cardClass: 'bg-white p-8 text-center border border-neutral-200 rounded-none shadow-sm',
      photoClass: 'rounded-none border border-neutral-300',
      nameClass: 'font-serif text-2xl font-light mb-4',
    },
    events: {
      cardClass: 'bg-white p-8 border border-neutral-200 rounded-none shadow-sm',
      tabClass: 'text-[10px] font-bold tracking-[0.25em] uppercase pb-2',
      titleClass: 'font-serif text-2xl font-light mb-2',
    },
    story: {
      cardClass: 'bg-white p-5 border border-neutral-200 rounded-none shadow-sm',
      dotClass: 'border border-neutral-300 bg-white rounded-full',
      lineClass: 'bg-neutral-200'
    },
    gallery: {
      itemClass: 'rounded-none overflow-hidden border border-neutral-200 shadow-sm hover:scale-[1.02] transition-transform'
    },
    rsvp: {
      formClass: 'bg-white p-6 border border-neutral-200 rounded-none shadow-sm',
      inputClass: 'w-full rounded-none px-4 py-3 text-xs border border-neutral-200 bg-[#fafafa] focus:border-neutral-800',
      buttonClass: 'rounded-none tracking-widest uppercase font-bold transition-all text-white bg-neutral-800 hover:bg-neutral-900',
      cardClass: 'p-4 bg-white border border-neutral-200 rounded-none',
      avatarClass: 'rounded-none border border-neutral-200 bg-[#fafafa]'
    },
    gift: {
      cardClass: 'bg-white p-5 border border-neutral-200 rounded-none shadow-sm',
      iconClass: 'rounded-none bg-[#fafafa] border border-neutral-100',
      buttonClass: 'rounded-none uppercase font-bold tracking-widest text-[9px] border border-neutral-800 text-neutral-800 hover:bg-neutral-800 hover:text-white'
    }
  },

  'playful-illustrative': {
    global: {
      bgContainer: 'bg-[#fff5f5] text-slate-800',
      sectionBg: 'bg-white',
      sectionAltBg: 'bg-[#fff5f5]',
      borderClass: 'border-pink-200 border-2',
      textPrimary: 'text-slate-800',
      textSecondary: 'text-slate-600',
      textMuted: 'text-slate-400',
      rounded: 'rounded-[2rem]',
      shadow: 'shadow-[4px_4px_0px_rgba(0,0,0,0.05)]',
      labelClass: 'text-[11px] font-bold tracking-widest uppercase mb-4 text-pink-500 bg-pink-50 px-4 py-1.5 rounded-full inline-block border-2 border-pink-200',
      headingClass: 'font-script text-4xl font-bold tracking-wide',
    },
    hero: {
      bgClass: 'bg-[#fff5f5]',
      brideGroomClass: 'font-script text-5xl font-bold tracking-wide text-center',
      ampersandClass: 'font-script text-4xl font-bold text-center text-pink-400',
      dateClass: 'tracking-widest text-sm font-bold mt-6 text-center text-slate-700 bg-white border-2 border-pink-200 px-6 py-2 rounded-full',
      buttonClass: 'rounded-full px-10 bg-pink-500 text-white font-bold tracking-widest uppercase text-sm border-2 border-pink-600 shadow-[4px_4px_0px_#db2777] hover:translate-y-1 hover:shadow-[0px_0px_0px_#db2777] active:scale-95 transition-all'
    },
    couple: {
      cardClass: 'bg-white p-8 text-center border-2 border-pink-200 rounded-[2rem] shadow-[4px_4px_0px_rgba(251,113,133,0.2)]',
      photoClass: 'rounded-[30%_70%_30%_70%_/_50%_30%_70%_50%] border-4 border-pink-200',
      nameClass: 'font-script text-3xl font-bold mb-4',
    },
    events: {
      cardClass: 'bg-white p-8 border-2 border-pink-200 rounded-[2rem] shadow-[4px_4px_0px_rgba(251,113,133,0.2)]',
      tabClass: 'text-xs font-bold tracking-wider uppercase pb-2',
      titleClass: 'font-script text-3xl font-bold mb-2',
    },
    story: {
      cardClass: 'bg-white p-5 border-2 border-pink-200 rounded-[2rem] shadow-[4px_4px_0px_rgba(251,113,133,0.2)]',
      dotClass: 'border-4 border-pink-300 bg-white rounded-full',
      lineClass: 'bg-pink-200 w-1'
    },
    gallery: {
      itemClass: 'rounded-2xl overflow-hidden border-2 border-pink-200 shadow-[4px_4px_0px_rgba(251,113,133,0.2)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_rgba(251,113,133,0.2)] transition-all'
    },
    rsvp: {
      formClass: 'bg-white p-6 border-2 border-pink-200 rounded-[2rem] shadow-[4px_4px_0px_rgba(251,113,133,0.2)]',
      inputClass: 'w-full rounded-2xl px-4 py-3 text-sm border-2 border-pink-100 bg-pink-50/50 focus:border-pink-300 font-medium',
      buttonClass: 'rounded-2xl tracking-wider uppercase font-bold transition-all text-white bg-pink-500 border-2 border-pink-600 shadow-[4px_4px_0px_#db2777] hover:translate-y-1 hover:shadow-none',
      cardClass: 'p-4 bg-white border-2 border-pink-100 rounded-[1.5rem]',
      avatarClass: 'rounded-full border-2 border-pink-200 bg-pink-50'
    },
    gift: {
      cardClass: 'bg-white p-5 border-2 border-pink-200 rounded-[2rem] shadow-[4px_4px_0px_rgba(251,113,133,0.2)]',
      iconClass: 'rounded-2xl bg-pink-50 border-2 border-pink-200',
      buttonClass: 'rounded-2xl uppercase font-bold tracking-wider text-[10px] border-2 border-pink-500 text-pink-600 hover:bg-pink-50 shadow-[2px_2px_0px_#f472b6]'
    }
  },

  'traditional-adat': {
    global: {
      bgContainer: 'bg-[#f0eadd] text-[#3e2723]',
      sectionBg: 'bg-[#f0eadd]',
      sectionAltBg: 'bg-[#e4dcc8]',
      borderClass: 'border-[#5d4037]/30 border-double border-4',
      textPrimary: 'text-[#3e2723]',
      textSecondary: 'text-[#5d4037]',
      textMuted: 'text-[#8d6e63]',
      rounded: 'rounded-lg',
      shadow: 'shadow-xl',
      labelClass: 'text-[10px] font-bold tracking-[0.4em] uppercase mb-4 text-[#795548] border-y-2 border-[#8d6e63] py-1 inline-block',
      headingClass: 'font-serif text-3xl font-bold tracking-wide text-[#4e342e]',
    },
    hero: {
      bgClass: 'bg-[#f0eadd]',
      brideGroomClass: 'font-serif text-5xl font-bold tracking-wider text-center text-[#4e342e]',
      ampersandClass: 'font-script text-4xl text-center text-[#795548]',
      dateClass: 'tracking-[0.2em] text-xs uppercase font-bold mt-6 text-center text-[#5d4037]',
      buttonClass: 'rounded-md px-10 border-2 border-[#5d4037] text-[#f0eadd] bg-[#5d4037] font-bold tracking-widest uppercase text-xs hover:bg-[#4e342e]'
    },
    couple: {
      cardClass: 'bg-[#e4dcc8] p-8 text-center border-double border-4 border-[#8d6e63]/40 rounded-lg shadow-lg relative',
      photoClass: 'rounded-3xl border-double border-8 border-[#5d4037]/50',
      nameClass: 'font-serif text-2xl font-bold mb-4 text-[#4e342e]',
    },
    events: {
      cardClass: 'bg-[#e4dcc8] p-8 border-double border-4 border-[#8d6e63]/40 rounded-lg shadow-lg',
      tabClass: 'text-[10px] font-bold tracking-[0.2em] uppercase pb-2',
      titleClass: 'font-serif text-2xl font-bold mb-2 text-[#4e342e]',
    },
    story: {
      cardClass: 'bg-[#e4dcc8] p-5 border-double border-4 border-[#8d6e63]/40 rounded-lg shadow-md',
      dotClass: 'border-4 border-double border-[#5d4037] bg-[#e4dcc8] rounded-sm rotate-45',
      lineClass: 'bg-[#8d6e63]/50'
    },
    gallery: {
      itemClass: 'rounded-lg overflow-hidden border-4 border-double border-[#8d6e63]/50 hover:brightness-110 transition-all'
    },
    rsvp: {
      formClass: 'bg-[#e4dcc8] p-6 border-double border-4 border-[#8d6e63]/40 rounded-lg shadow-lg',
      inputClass: 'w-full rounded-md px-4 py-3 text-xs border-2 border-[#8d6e63]/50 bg-[#f0eadd] focus:border-[#5d4037]',
      buttonClass: 'rounded-md tracking-widest uppercase font-bold transition-all text-[#f0eadd] bg-[#5d4037]',
      cardClass: 'p-4 bg-[#e4dcc8] border-2 border-dashed border-[#8d6e63]/40 rounded-lg',
      avatarClass: 'rounded-lg border-2 border-[#8d6e63] bg-[#f0eadd]'
    },
    gift: {
      cardClass: 'bg-[#e4dcc8] p-5 border-double border-4 border-[#8d6e63]/40 rounded-lg shadow-lg',
      iconClass: 'rounded-lg bg-[#f0eadd] border-2 border-[#8d6e63]/50',
      buttonClass: 'rounded-md uppercase font-bold tracking-widest text-[10px] border-2 border-[#5d4037] text-[#5d4037] hover:bg-[#5d4037] hover:text-[#f0eadd]'
    }
  },

  'special-001': {
    global: {
      bgContainer: 'bg-transparent text-special-olive',
      sectionBg: 'bg-transparent',
      sectionAltBg: 'bg-transparent',
      borderClass: 'border-special-sage/20',
      textPrimary: 'text-special-sage',
      textSecondary: 'text-special-olive',
      textMuted: 'text-special-muted',
      rounded: 'rounded-3xl',
      shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
      labelClass: 'text-[10px] font-bold tracking-[0.4em] uppercase mb-4 text-special-olive',
      headingClass: 'font-playball text-[30px] tracking-wide text-special-sage',
      isSpecial: true,
      desktopBg: 'radial-gradient(circle, #fefae0 0%, #685952 100%)',
      primaryButtonColor: '#685952',
      secondaryButtonColor: '#588157',
      saveDateLabel: 'Simpan Tanggal',
      venueLabel: 'Lokasi Acara',
      openInvitationLabel: 'Buka Undangan',
      tapToOpenLabel: 'Ketuk untuk membuka',
    },
    hero: {
      bgClass: 'bg-transparent bg-no-repeat bg-center bg-cover',
      brideGroomClass: 'font-playball text-[65px] text-center text-special-sage leading-tight',
      ampersandClass: 'font-playball text-[40px] text-center text-special-sage',
      dateClass: 'tracking-widest text-xs uppercase font-medium mt-6 text-center text-special-olive',
      buttonClass: 'rounded-full px-10 bg-special-sage text-white font-bold tracking-widest uppercase text-xs hover:bg-special-darkSage shadow-lg transition-transform hover:scale-105'
    },
    couple: {
      cardClass: 'bg-white/60 backdrop-blur-sm p-8 text-center border border-special-sage/15 rounded-3xl shadow-sm relative overflow-hidden',
      photoClass: 'rounded-t-[5rem] rounded-b-[5rem] border-4 border-white shadow-md',
      nameClass: 'font-playball text-[30px] mb-4 text-special-sage',
    },
    events: {
      cardClass: 'bg-white/60 backdrop-blur-sm p-8 border border-special-sage/15 rounded-3xl shadow-sm',
      tabClass: 'text-[10px] font-bold tracking-[0.25em] uppercase pb-2',
      titleClass: 'font-playball text-[30px] mb-2 text-special-sage',
      calendarStyle: true,
    },
    story: {
      cardClass: 'bg-white/60 p-5 border border-special-sage/15 shadow-sm rounded-3xl',
      dotClass: 'border-2 border-special-sage bg-white rounded-full',
      lineClass: 'bg-special-sage/20'
    },
    gallery: {
      itemClass: 'rounded-3xl overflow-hidden border border-special-sage/15 shadow-sm hover:scale-[1.03] transition-transform duration-500'
    },
    rsvp: {
      formClass: 'bg-white/60 p-6 border border-special-sage/15 shadow-sm rounded-3xl',
      inputClass: 'w-full rounded-xl px-4 py-3 text-xs border border-special-sage/20 bg-white focus:border-special-sage',
      buttonClass: 'rounded-xl tracking-widest uppercase font-bold transition-all text-white bg-special-sage hover:bg-special-darkSage',
      cardClass: 'p-4 bg-white/60 border border-special-sage/15 rounded-2xl',
      avatarClass: 'rounded-full border border-special-sage/15 bg-white'
    },
    gift: {
      cardClass: 'bg-white/60 p-5 border border-special-sage/15 shadow-sm rounded-3xl',
      iconClass: 'rounded-full bg-white border border-special-sage/15 text-special-sage',
      buttonClass: 'rounded-xl uppercase font-bold tracking-wider text-[10px] border border-special-sage text-special-sage hover:bg-special-sage hover:text-white'
    },
    ornaments: {
      bg: '/themes/Special/theme-7/bg.png',
      frame: '/themes/Special/theme-7/frame-ornament.png',
      frameSize: 'w-64 h-64',
      photoSize: 'w-[184px] h-[184px]',
      photoOffset: 'translate(2.4px, -15px)',
      fallingLeaves: true,
      fallingLeafImage: '/themes/Special/theme-7/special-leaf.png',
      leaves: {
        topLeft: '/themes/Special/theme-7/leaf-top-left.png',
        topRight: '/themes/Special/theme-7/leaf-top-right.png',
        bottomLeft: '/themes/Special/theme-7/leaf-bottom-Left.png',
        bottomRight: '/themes/Special/theme-7/leaf-bottom-right.png',
      }
    }
  },

  'special-002': {
    global: {
      bgContainer: 'bg-transparent text-gray-600',
      sectionBg: 'bg-transparent',
      sectionAltBg: 'bg-transparent',
      borderClass: 'border-gray-300',
      textPrimary: 'text-gray-800',
      textSecondary: 'text-gray-600',
      textMuted: 'text-gray-400',
      rounded: 'rounded-3xl',
      shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
      labelClass: 'text-[10px] font-bold tracking-[0.4em] uppercase mb-4 text-gray-500',
      headingClass: 'font-playball text-[30px] tracking-wide text-gray-800',
      isSpecial: true,
      desktopBg: 'radial-gradient(circle, #f9fafb 0%, #9ca3af 100%)',
      primaryButtonColor: '#4b5563',
      secondaryButtonColor: '#6b7280',
      saveDateLabel: 'Simpan Tanggal',
      venueLabel: 'Lokasi Acara',
      openInvitationLabel: 'Buka Undangan',
      tapToOpenLabel: 'Ketuk untuk membuka',
    },
    hero: {
      bgClass: 'bg-transparent bg-no-repeat bg-center bg-cover',
      brideGroomClass: 'font-playball text-[65px] text-center text-gray-800 leading-tight',
      ampersandClass: 'font-playball text-[40px] text-center text-gray-800',
      dateClass: 'tracking-widest text-xs uppercase font-medium mt-6 text-center text-gray-600',
      buttonClass: 'rounded-full px-10 bg-gray-800 text-white font-bold tracking-widest uppercase text-xs hover:bg-gray-900 shadow-lg transition-transform hover:scale-105'
    },
    couple: {
      cardClass: 'bg-white/60 backdrop-blur-sm p-8 text-center border border-gray-200 rounded-3xl shadow-sm relative overflow-hidden',
      photoSize: 'w-32 h-44',
      photoClass: 'rounded-full border-[6px] border-white shadow-md',
      photoMargin: 'mb-4',
      nameClass: 'font-playball text-[26px] mb-1 text-gray-800',
      infoClass: 'text-[10px] space-y-0',
    },
    events: {
      cardClass: 'bg-white/60 backdrop-blur-sm p-8 border border-gray-200 rounded-3xl shadow-sm',
      tabClass: 'text-[10px] font-bold tracking-[0.25em] uppercase pb-2',
      titleClass: 'font-playball text-[30px] mb-2 text-gray-800',
      calendarStyle: true,
    },
    story: {
      cardClass: 'bg-white/60 p-5 border border-gray-200 shadow-sm rounded-3xl',
      dotClass: 'border-2 border-gray-400 bg-white rounded-full',
      lineClass: 'bg-gray-300'
    },
    gallery: {
      itemClass: 'rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:scale-[1.03] transition-transform duration-500'
    },
    rsvp: {
      formClass: 'bg-white/60 p-6 border border-gray-200 shadow-sm rounded-3xl',
      inputClass: 'w-full rounded-xl px-4 py-3 text-xs border border-gray-200 bg-white focus:border-gray-400',
      buttonClass: 'rounded-xl tracking-widest uppercase font-bold transition-all text-white bg-gray-800 hover:bg-gray-900',
      cardClass: 'p-4 bg-white/60 border border-gray-200 rounded-2xl',
      avatarClass: 'rounded-full border border-gray-200 bg-white'
    },
    gift: {
      cardClass: 'bg-white/60 p-5 border border-gray-200 shadow-sm rounded-3xl',
      iconClass: 'rounded-full bg-white border border-gray-200 text-gray-600',
      buttonClass: 'rounded-xl uppercase font-bold tracking-wider text-[10px] border border-gray-400 text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800'
    },
    ornaments: {
      bg: '/themes/Special/theme-8/bg.png',
      frame: '/themes/Special/theme-8/frame-ornament.png',
      frameSize: 'w-64 h-64',
      photoSize: 'w-[240px] h-[240px]',
      photoOffset: 'translate(0px, 0px)',
      photoShapeClass: 'rounded-none',
      photoStyle: { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
      fallingLeaves: true,
      fallingLeafImage: '/themes/Special/theme-8/special-leaf.png',
      leaves: {
        topLeft: '/themes/Special/theme-8/leaf-top-left.png',
        bottomRight: '/themes/Special/theme-8/leaf-buttom-right.png',
      }
    },
    footer: {
      photoClass: 'rounded-full border-[6px] border-white'
    }
  },

  'special-003': {
    global: {
      bgContainer: 'bg-transparent text-special-olive',
      sectionBg: 'bg-transparent',
      sectionAltBg: 'bg-transparent',
      borderClass: 'border-special-sage/20',
      textPrimary: 'text-special-sage',
      textSecondary: 'text-special-olive',
      textMuted: 'text-special-muted',
      rounded: 'rounded-3xl',
      shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
      labelClass: 'text-[10px] font-bold tracking-[0.4em] uppercase mb-4 text-special-olive',
      headingClass: 'font-playball text-[30px] tracking-wide text-special-sage',
      isSpecial: true,
    },
    hero: {
      bgClass: 'bg-transparent bg-no-repeat bg-center bg-cover',
      brideGroomClass: 'font-playball text-[65px] text-center text-special-sage leading-tight',
      ampersandClass: 'font-playball text-[40px] text-center text-special-olive',
      dateClass: 'tracking-widest text-xs uppercase font-medium mt-6 text-center text-special-muted',
      buttonClass: 'rounded-full px-10 bg-special-sage text-white font-bold tracking-widest uppercase text-xs hover:bg-special-darkSage shadow-lg transition-transform hover:scale-105'
    },
    couple: {
      cardClass: 'bg-white/60 backdrop-blur-sm p-8 text-center border border-special-sage/15 rounded-3xl shadow-sm relative overflow-hidden',
      frame: '/themes/Special/theme-9/person.png',
      frameSize: 'w-80 h-80',
      photoSize: 'w-[180px] h-[235px]',
      photoOffset: 'translate(7px, -15px)',
      photoShapeClass: 'rounded-[50%]',
      photoClass: 'rounded-[50%] border-[3px] border-white shadow-md',
      photoMargin: 'mb-4',
      nameClass: 'font-playball text-[30px] mb-4 text-special-sage',
    },
    events: {
      cardClass: 'bg-white/60 backdrop-blur-sm p-8 border border-special-sage/15 rounded-3xl shadow-sm',
      tabClass: 'text-[10px] font-bold tracking-[0.25em] uppercase pb-2',
      titleClass: 'font-playball text-[30px] mb-2 text-special-sage',
      calendarStyle: true,
    },
    story: {
      cardClass: 'bg-white/60 p-5 border border-special-sage/15 shadow-sm rounded-3xl',
      dotClass: 'border-2 border-special-sage bg-white rounded-full',
      lineClass: 'bg-special-sage/20'
    },
    gallery: {
      itemClass: 'rounded-3xl overflow-hidden border border-special-sage/15 shadow-sm hover:scale-[1.03] transition-transform duration-500'
    },
    rsvp: {
      formClass: 'bg-white/60 p-6 border border-special-sage/15 shadow-sm rounded-3xl',
      inputClass: 'w-full rounded-xl px-4 py-3 text-xs border border-special-sage/20 bg-white focus:border-special-sage',
      buttonClass: 'rounded-xl tracking-widest uppercase font-bold transition-all text-white bg-special-sage hover:bg-special-darkSage',
      cardClass: 'p-4 bg-white/60 border border-special-sage/15 rounded-2xl',
      avatarClass: 'rounded-full border border-special-sage/15 bg-white'
    },
    gift: {
      cardClass: 'bg-white/60 p-5 border border-special-sage/15 shadow-sm rounded-3xl',
      iconClass: 'rounded-full bg-white border border-special-sage/15 text-special-sage',
      buttonClass: 'rounded-xl uppercase font-bold tracking-wider text-[10px] border border-special-sage text-special-sage hover:bg-special-sage hover:text-white'
    },
    ornaments: {
      bg: '/themes/Special/theme-9/bg.png',
      frame: '/themes/Special/theme-9/frame.png',
      frameSize: 'w-96 h-96',
      photoSize: 'w-[169px] h-[165px]',
      photoOffset: 'translate(8px, -6px)',
      fallingLeaves: false,
      leaves: {
        topRight: '/themes/Special/theme-9/top-right.png',
        bottomRight: '/themes/Special/theme-9/buttom-right.png',
      }
    }
  }
}
