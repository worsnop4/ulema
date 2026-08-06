import { motion, AnimatePresence } from 'framer-motion'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { THEMES } from '../config/constants'

// ─── "Tema Draft" — bare-bones structural scaffold ────────────────
// Not a final design. Neutral palette/typography so it's presentable while
// still clearly a placeholder — every section here is meant to be restyled
// once a real visual direction (e.g. from a reference video) is chosen.
// Built section-by-section per docs/THEME_DESIGN_GUIDE.md §9.
const c = {
  ivory: '#F7F5F1',
  ivoryDeep: '#EFEBE3',
  ink: '#2A2A28',
  muted: 'rgba(42,42,40,0.62)',
  gold: '#B99A6B',
  goldDeep: '#8C7148',
}

const F = {
  display: "'Cormorant Garamond', serif",
  sans: "'Jost', sans-serif",
}

const ID_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const ID_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const fmtDate = (s) => {
  if (!s) return ''
  try {
    const d = new Date(s)
    if (isNaN(d)) return s
    return `${ID_DAYS[d.getDay()]}, ${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`
  } catch { return s }
}

const Eyebrow = ({ children, style = {} }) => (
  <p style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: c.gold, margin: 0, ...style }}>
    {children}
  </p>
)

// ─── 0. COVER ──────────────────────────────────────────────────────
const Cover = ({ data, brideNick, groomNick, heroDate, guestName, handleOpen, animateClose }) => {
  const coverPhoto = data?.meta?.coverPhoto
  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ padding: '48px 32px', background: c.ivory, color: c.ink }}
      animate={animateClose ? { y: '-100%', opacity: 0 } : { y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}>
      <motion.div className="relative z-10 flex flex-col items-center w-full"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
        <Eyebrow style={{ marginBottom: 22 }}>The Wedding Of</Eyebrow>

        <div className="mb-6 overflow-hidden flex items-center justify-center"
          style={{ width: 168, height: 216, borderRadius: '84px 84px 16px 16px', border: `1px solid ${c.gold}`, background: c.ivoryDeep }}>
          {coverPhoto
            ? <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            : <span style={{ fontFamily: F.sans, fontSize: 11, color: c.muted }}>Foto Cover</span>}
        </div>

        <h1 style={{ fontFamily: F.display, fontWeight: 500, fontSize: '2.3rem', lineHeight: 1.15, color: c.ink, margin: 0 }}>{brideNick}</h1>
        <span style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: '1.4rem', color: c.gold, margin: '4px 0' }}>&amp;</span>
        <h1 style={{ fontFamily: F.display, fontWeight: 500, fontSize: '2.3rem', lineHeight: 1.15, color: c.ink, margin: '0 0 18px' }}>{groomNick}</h1>

        <div style={{ width: 56, height: 1, background: c.gold, opacity: 0.7, marginBottom: 16 }} />
        <p style={{ fontFamily: F.sans, fontSize: 13, letterSpacing: '0.1em', color: c.muted, margin: '0 0 28px' }}>{heroDate}</p>

        <div style={{ width: '100%', maxWidth: 280, padding: '14px 18px', border: `1px solid rgba(185,154,107,0.4)`, marginBottom: 26 }}>
          <p style={{ fontFamily: F.sans, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: c.muted, margin: '0 0 6px' }}>Kepada Yth. Bapak/Ibu/Saudara/i</p>
          <p style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 500, margin: 0, color: c.ink }}>{guestName || 'Tamu Undangan'}</p>
        </div>

        <motion.button onClick={handleOpen}
          style={{ fontFamily: F.sans, background: c.gold, color: '#fff', border: 'none', padding: '14px 40px', fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 600, borderRadius: 30, cursor: 'pointer' }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Buka Undangan
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ─── 1. HERO / SLIDE AWAL ────────────────────────────────────────────
const Hero = ({ data, brideNick, groomNick, heroDate, countdown }) => {
  const photo = data?.meta?.photo
  const countdownEnabled = data?.countdownEnabled ?? true
  const blocks = [
    { label: 'Hari', v: countdown?.d ?? 0 },
    { label: 'Jam', v: countdown?.h ?? 0 },
    { label: 'Menit', v: countdown?.m ?? 0 },
    { label: 'Detik', v: countdown?.s ?? 0 },
  ]
  return (
    <section className="relative overflow-hidden" style={{ height: 560, color: '#fff' }}>
      <div className="absolute" style={{ inset: '-8%', animation: 'draft-pan 18s ease-in-out infinite alternate' }}>
        {photo
          ? <img src={photo} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full" style={{ background: c.ivoryDeep }} />}
      </div>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(42,42,40,0.15), rgba(42,42,40,0.65))' }} />

      <div className="relative z-10 h-full flex flex-col items-center justify-end text-center" style={{ padding: '0 28px 40px' }}>
        <Eyebrow style={{ color: '#fff', opacity: 0.85, marginBottom: 10 }}>Save The Date</Eyebrow>
        <h2 style={{ fontFamily: F.display, fontWeight: 500, fontSize: '2rem', margin: '0 0 6px' }}>{brideNick} &amp; {groomNick}</h2>
        <p style={{ fontFamily: F.sans, fontSize: 13, letterSpacing: '0.08em', opacity: 0.9, margin: '0 0 24px' }}>{heroDate}</p>

        {countdownEnabled && (
          <div className="flex gap-2.5">
            {blocks.map(b => (
              <div key={b.label} className="flex flex-col items-center justify-center" style={{ width: 60, padding: '10px 0', border: '1px solid rgba(255,255,255,0.4)' }}>
                <span style={{ fontFamily: F.display, fontSize: '1.5rem', fontWeight: 600, lineHeight: 1 }}>{b.v.toString().padStart(2, '0')}</span>
                <span style={{ fontFamily: F.sans, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.8 }}>{b.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── 2. QUOTE / DOA ──────────────────────────────────────────────────
const Quote = ({ data }) => {
  const quote = data?.quote || 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup agar kamu cenderung dan merasa tenteram kepadanya.'
  return (
    <section style={{ background: c.ivory, padding: '56px 30px', textAlign: 'center' }}>
      <div style={{ width: 7, height: 7, background: c.gold, transform: 'rotate(45deg)', margin: '0 auto 22px' }} />
      <p style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: '1.2rem', lineHeight: 1.75, color: c.ink, maxWidth: 340, margin: '0 auto 14px' }}>
        &ldquo;{quote}&rdquo;
      </p>
      <Eyebrow style={{ color: c.muted, letterSpacing: '0.2em' }}>Q.S. Ar-Rum : 21</Eyebrow>
    </section>
  )
}

// ─── 3. COUPLE / DATA MEMPELAI ───────────────────────────────────────
const PersonCard = ({ person }) => (
  <div className="flex flex-col items-center text-center">
    <div className="overflow-hidden mb-4 flex items-center justify-center"
      style={{ width: 148, height: 148, borderRadius: '50%', border: `2px solid ${c.gold}`, background: c.ivoryDeep }}>
      {person?.photo
        ? <img src={person.photo} alt={person?.nickname} className="w-full h-full object-cover" />
        : <span style={{ fontFamily: F.sans, fontSize: 11, color: c.muted }}>Foto</span>}
    </div>
    <h3 style={{ fontFamily: F.display, fontWeight: 500, fontSize: '1.5rem', color: c.ink, margin: '0 0 4px' }}>{person?.name || person?.nickname || '—'}</h3>
    <p style={{ fontFamily: F.sans, fontSize: 13, lineHeight: 1.6, color: c.muted, maxWidth: 240, margin: '0 0 10px' }}>
      Putra/Putri dari<br />Bpk. {person?.father || '—'} &amp; Ibu {person?.mother || '—'}
    </p>
    {person?.instagram && (
      <a href={`https://instagram.com/${person.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
        style={{ fontFamily: F.sans, fontSize: 12, letterSpacing: '0.05em', color: c.goldDeep, fontWeight: 600 }}>
        @{person.instagram.replace('@', '')}
      </a>
    )}
  </div>
)

const Couple = ({ data }) => (
  <section id="mempelai" style={{ background: c.ivoryDeep, padding: '56px 28px' }}>
    <p className="text-center" style={{ marginBottom: 34 }}><Eyebrow>Bride &amp; Groom</Eyebrow></p>
    <div style={{ marginBottom: 32 }}><PersonCard person={data?.bride} /></div>
    <div className="flex items-center justify-center gap-3" style={{ marginBottom: 32 }}>
      <div style={{ width: 40, height: 1, background: c.gold, opacity: 0.6 }} />
      <span style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: '1.3rem', color: c.gold }}>&amp;</span>
      <div style={{ width: 40, height: 1, background: c.gold, opacity: 0.6 }} />
    </div>
    <PersonCard person={data?.groom} />
  </section>
)

// ─── MAIN EXPORT ────────────────────────────────────────────────────
export default function DraftTheme({
  data, countdown, opened, setOpened,
  animateClose, setAnimateClose,
  setMusicPlaying, audioRef,
  wishes, guestName,
}) {
  const brideNick = data?.bride?.nickname || 'Mempelai Wanita'
  const groomNick = data?.groom?.nickname || 'Mempelai Pria'
  const primaryEvent = data?.events?.[0]
  const heroDate = primaryEvent?.dateLabel || fmtDate(primaryEvent?.date)
  const musicEnabled = data?.music !== false

  const handleOpen = () => {
    setAnimateClose(true)
    setTimeout(() => {
      setOpened(true)
      if (audioRef?.current) setMusicPlaying(true)
    }, 900)
  }

  return (
    <InvitationLayout layout={THEMES.DRAFT} data={data}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Jost:wght@300;400;500;600&display=swap');
        @keyframes draft-pan { from { transform: translate(0,0); } to { transform: translate(-3%, -3%); } }
      `}</style>

      <div id="top" className="w-full relative h-full flex flex-col overflow-x-hidden"
        style={{ fontFamily: F.sans, background: c.ivory, color: c.ink }}>

        {musicEnabled && (
          <audio ref={audioRef} src={data?.musicUrl || MUSIC_URLS[data?.musicId || 1] || MUSIC_URLS[1]} loop />
        )}

        <AnimatePresence>
          {!opened && (
            <Cover key="cover" data={data} brideNick={brideNick} groomNick={groomNick}
              heroDate={heroDate} guestName={guestName} handleOpen={handleOpen} animateClose={animateClose} />
          )}
        </AnimatePresence>

        {opened && (
          <motion.div className="flex flex-col w-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}>
            <Hero data={data} brideNick={brideNick} groomNick={groomNick} heroDate={heroDate} countdown={countdown} />
            <Quote data={data} />
            <Couple data={data} />
            {/* Acara, RSVP & Ucapan, Footer, nav — added in the following
                build parts (see TodoWrite / conversation). */}
            <div style={{ padding: '40px 28px', textAlign: 'center', color: c.muted, fontFamily: F.sans, fontSize: 13 }}>
              wishes: {wishes?.length ?? 0}
            </div>
          </motion.div>
        )}
      </div>
    </InvitationLayout>
  )
}
