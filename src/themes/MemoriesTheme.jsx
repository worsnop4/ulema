import { useState, useRef, useEffect } from 'react'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { THEMES } from '../config/constants'

// ═══════════════════════════════════════════════════════════════════
//  MEMORIES — kategori Motion (MOT-004)
//
//  Tema pertama yang tidak menggulir ke bawah sebagai satu halaman
//  panjang. Undangannya sebuah "story deck": sembilan babak, satu layar
//  penuh masing-masing, dikunci scroll-snap, dengan bilah progres di atas
//  seperti Stories dan pil navigasi di bawah.
//
//  Dua hal yang membuat bentuk ini berdiri, dan keduanya tidak kelihatan
//  dari tampilannya:
//
//  1. Deck-nya scroller milik tema sendiri, bukan scroller milik shell.
//     Tema tidak memiliki div scroller di InvitationLayout, jadi menaruh
//     scroll-snap di sana berarti menata elemen milik orang lain dari jauh.
//     Karena tinggi akar tema di sini persis satu layar, scroller shell
//     tidak pernah punya sesuatu untuk digulir dan tidak pernah bertengkar
//     dengan deck.
//
//  2. Tiap babak menyatakan perilaku luapannya. Empat hal di undangan
//     nyata tidak punya batas atas — ucapan, foto galeri, nama turut
//     mengundang, dan jumlah acara — dan layar berukuran tetap diam-diam
//     mengandaikan isinya muat. Babak yang isinya bisa tumbuh memakai
//     min-height (boleh memanjang), babak yang tingginya dikunci memberi
//     gulir internal pada daftarnya. Deck tanpa keduanya akan memotong
//     ucapan ke-empat tanpa ada yang tahu.
//
//  Latarnya vektor sepenuhnya: dua gumpalan cahaya yang hanyut, kabut mawar
//  di atas, cahaya emas yang bernapas di bawah, dan tiga belas kelopak
//  jatuh. Nol byte aset, tajam di DPI berapa pun, dan punya alpha asli —
//  hal yang justru tidak dimiliki video generatif. Bila kelak sebuah klip
//  sinematik ditambahkan, tempatnya di Panggung sebagai lapisan paling
//  bawah dengan pola poster → intro → loop di GildedPalaceTheme.jsx; sisa
//  gerak di halaman ini tetap vektor dan tidak perlu diubah.
// ═══════════════════════════════════════════════════════════════════

// ─── DATE HELPERS ────────────────────────────────────────────────
const ID_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const ID_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const fmtDate = (s) => {
  if (!s) return ''
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return `${ID_DAYS[d.getDay()]}, ${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
const dateOf = (ev) => ev?.dateLabel || fmtDate(ev?.date)
const timeOf = (ev) => {
  const range = [ev?.start, ev?.end].filter(Boolean).join(' – ')
  return range ? `${range}${ev?.tz ? ' ' + ev.tz : ''}` : ''
}
const initialOf = (s) => (s || '').trim().charAt(0).toUpperCase() || '·'

// Kelopak di-seed sekali lewat LCG, bukan Math.random() saat render:
// react-hooks/purity melarang pembacaan tak-murni di badan komponen, dan
// posisi yang diacak ulang tiap render akan membuat kelopaknya meloncat
// setiap kali ada yang mengetik di form RSVP.
const seedPetals = () => {
  let s = 20261126
  const r = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 }
  return Array.from({ length: 13 }, (_, i) => ({
    key: `p${i}`,
    size: 9 + r() * 12,
    dur: 12 + r() * 12,
    delay: r() * 14,
    left: r() * 100,
    op: 0.35 + r() * 0.4,
  }))
}

// ═══════════════════════════════════════════════════════════════════
//  PANGGUNG — latar vektor, dijangkarkan ke kolom
// ═══════════════════════════════════════════════════════════════════

// Fixed, bukan sticky. Sticky di dalam scroller undangan sudah gagal dua
// kali dengan gejala yang sama: lapisannya bertahan beberapa babak lalu
// ikut tergulir pergi. Trio left/transform/--inv-w yang menjangkarkannya ke
// kolom undangan, bukan ke jendela — di desktop kolomnya hanya 480px di
// tengah layar yang bisa 1920px.
const Panggung = ({ petals }) => (
  <div className="fixed pointer-events-none" style={{
    top: 0, left: '50%', transform: 'translateX(-50%)',
    width: 'var(--inv-w)', height: 'var(--inv-h)', zIndex: 0, overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--mm-ivory)' }} />

    <div className="mm-blob" style={{
      position: 'absolute', top: '-18%', left: '-24%', width: '86%', height: '46%',
      borderRadius: '50%', filter: 'blur(58px)', opacity: 0.85,
      background: 'radial-gradient(circle, rgba(217,160,164,.62), rgba(217,160,164,0) 70%)',
      animation: 'mm-drift-a 26s ease-in-out infinite',
    }} />
    <div className="mm-blob" style={{
      position: 'absolute', bottom: '-14%', right: '-22%', width: '80%', height: '42%',
      borderRadius: '50%', filter: 'blur(64px)', opacity: 0.7,
      background: 'radial-gradient(circle, rgba(198,163,116,.5), rgba(198,163,116,0) 70%)',
      animation: 'mm-drift-b 32s ease-in-out infinite',
    }} />

    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(120% 70% at 50% -10%, rgba(251,247,244,.20) 0%, rgba(251,247,244,.86) 58%, var(--mm-ivory) 100%)',
    }} />
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: '34%',
      background: 'linear-gradient(180deg, rgba(217,160,164,.42) 0%, rgba(247,228,227,.16) 62%, transparent 100%)',
    }} />
    <div className="mm-glow" style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: '16%',
      background: 'linear-gradient(0deg, rgba(198,163,116,.18) 0%, transparent 100%)',
      animation: 'mm-breathe 9s ease-in-out infinite',
    }} />

    {petals.map(p => (
      <div key={p.key} className="mm-petal" style={{
        position: 'absolute', top: '-6%', left: `${p.left}%`,
        width: p.size, height: p.size * 0.72, opacity: p.op,
        borderRadius: '60% 40% 55% 45% / 55% 62% 38% 45%',
        background: 'linear-gradient(140deg, #FBE9E8, var(--mm-rose))',
        animation: `mm-fall ${p.dur.toFixed(1)}s linear ${p.delay.toFixed(1)}s infinite`,
      }} />
    ))}
  </div>
)

// ═══════════════════════════════════════════════════════════════════
//  POTONGAN KECIL
// ═══════════════════════════════════════════════════════════════════

const Cap = ({ children, style = {} }) => (
  <div style={{
    fontFamily: 'var(--mm-mono)', fontSize: 'var(--mm-fs-cap)', letterSpacing: '.3em',
    textTransform: 'uppercase', color: 'var(--mm-ink-soft)', ...style,
  }}>{children}</div>
)

const Rule = ({ w = 36, style = {} }) => (
  <div style={{ height: 1, width: w, background: 'var(--mm-gold)', ...style }} />
)

const CardTitle = ({ children }) => (
  <div style={{ fontFamily: 'var(--mm-display)', fontSize: 'var(--mm-fs-h2)', lineHeight: 1.25, color: 'var(--mm-rose-deep)' }}>
    {children}
  </div>
)

const cardStyle = {
  background: 'rgba(255,255,255,.66)',
  border: '1px solid rgba(198,163,116,.26)',
  borderRadius: 'var(--mm-r-card)',
  padding: 18,
}

// Foto tanpa scale(): men-scale raster melembekkan foto berapa pun
// resolusinya. Kalau pasangan belum mengunggah fotonya, yang tampil bukan
// kotak kosong melainkan inisialnya di atas gradasi blush — tamu tidak
// pernah melihat placeholder yang terlihat rusak.
const Portrait = ({ src, alt, initial, w, h, radius }) => (
  <div style={{
    width: w, height: h, flex: '0 0 auto', borderRadius: radius, overflow: 'hidden',
    background: 'linear-gradient(150deg, var(--mm-blush), #F0D7D6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    {src
      ? <img src={src} alt={alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      : <span style={{ fontFamily: 'var(--mm-display)', fontSize: Math.round(w * 0.42), color: 'var(--mm-rose-deep)', opacity: 0.55 }}>{initial}</span>}
  </div>
)

// (a) tinggi dikunci satu layar — isinya harus muat, atau punya gulir sendiri.
const ScreenFixed = ({ id, children, pad = '92px 26px' }) => (
  <section id={id} style={{
    height: 'var(--inv-h)', scrollSnapAlign: 'start', scrollSnapStop: 'always',
    boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', padding: pad, overflowY: 'auto',
  }}>{children}</section>
)

// (b) boleh tumbuh — dipakai babak yang jumlah isinya ditentukan pasangan.
const ScreenGrow = ({ id, children, pad = '92px 26px' }) => (
  <section id={id} style={{
    minHeight: 'var(--inv-h)', scrollSnapAlign: 'start',
    boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', padding: pad,
  }}>{children}</section>
)

// ═══════════════════════════════════════════════════════════════════
//  BABAK
// ═══════════════════════════════════════════════════════════════════

const Hero = ({ groomNick, brideNick, dateLabel, guestName, countdown, countdownEnabled, onNext }) => (
  <ScreenFixed id="mm-home" pad="92px 28px">
    <div className="mm-rise" style={{ margin: 'auto 0', width: '100%', textAlign: 'center' }}>
      <Cap>The Wedding Of</Cap>
      <Rule w={44} style={{ margin: '16px auto 22px' }} />
      <h1 style={{ fontFamily: 'var(--mm-display)', fontSize: 'var(--mm-fs-display)', lineHeight: 1.05, margin: 0, color: 'var(--mm-ink)' }}>
        {groomNick}
      </h1>
      <div style={{ fontStyle: 'italic', fontSize: 19, color: 'var(--mm-rose)', margin: '6px 0' }}>dan</div>
      <h1 style={{ fontFamily: 'var(--mm-display)', fontSize: 'var(--mm-fs-display)', lineHeight: 1.05, margin: 0, color: 'var(--mm-ink)' }}>
        {brideNick}
      </h1>

      {dateLabel && (
        <div style={{ marginTop: 26, fontSize: 'var(--mm-fs-body)', letterSpacing: '.06em', color: 'var(--mm-ink-soft)' }}>
          {dateLabel}
        </div>
      )}

      {countdownEnabled && (
        <div className="flex" style={{ gap: 8, justifyContent: 'center', marginTop: 24 }}>
          {[['Hari', countdown?.d], ['Jam', countdown?.h], ['Menit', countdown?.m], ['Detik', countdown?.s]].map(([label, v]) => (
            <div key={label} style={{
              flex: 1, maxWidth: 74, padding: '12px 0', textAlign: 'center',
              background: 'rgba(255,255,255,.66)', border: '1px solid rgba(198,163,116,.34)',
              borderRadius: 'var(--mm-r-card)',
            }}>
              <div style={{ fontFamily: 'var(--mm-display)', fontSize: 24, lineHeight: 1, color: 'var(--mm-rose-deep)' }}>{v ?? 0}</div>
              <div style={{ fontFamily: 'var(--mm-mono)', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--mm-ink-soft)', marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {guestName && (
        <div style={{ marginTop: 30, fontSize: 13, color: 'var(--mm-ink-soft)' }}>
          Kepada Yth. <span style={{ color: 'var(--mm-ink)' }}>{guestName}</span>
        </div>
      )}
    </div>

    <button onClick={onNext} style={{
      background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px 0',
      fontFamily: 'var(--mm-mono)', fontSize: 9, letterSpacing: '.2em',
      textTransform: 'uppercase', color: 'var(--mm-ink-soft)',
    }}>geser ke atas ↑</button>
  </ScreenFixed>
)

const Quote = ({ quote }) => (
  <ScreenFixed id="mm-quote" pad="92px 34px">
    <div style={{ margin: 'auto 0', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--mm-display)', fontSize: 40, color: 'var(--mm-blush)', lineHeight: 0.6 }}>&ldquo;</div>
      <p style={{ fontSize: 19, fontStyle: 'italic', lineHeight: 1.75, color: 'var(--mm-ink)', margin: '14px 0 0', textWrap: 'pretty' }}>
        {quote}
      </p>
      <Rule style={{ margin: '26px auto 0' }} />
    </div>
  </ScreenFixed>
)

const PersonCard = ({ person, label }) => {
  const parents = [person?.father, person?.mother].filter(Boolean).join(' & ')
  return (
    <div style={{ ...cardStyle, display: 'flex', gap: 16, alignItems: 'center', background: 'rgba(255,255,255,.62)', padding: 16 }}>
      <Portrait src={person?.photo} alt={person?.name || label}
        initial={initialOf(person?.nickname || person?.name)}
        w={92} h={118} radius="48px 48px 12px 12px" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--mm-display)', fontSize: 'var(--mm-fs-h2)', lineHeight: 1.25, color: 'var(--mm-ink)', textWrap: 'pretty' }}>
          {person?.name || person?.nickname || label}
        </div>
        {parents && (
          <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--mm-ink-soft)', marginTop: 8 }}>
            Putra/Putri dari {parents}
          </div>
        )}
        {person?.instagram && (
          <a href={`https://instagram.com/${person.instagram}`} target="_blank" rel="noreferrer"
            style={{ display: 'inline-block', marginTop: 10, fontFamily: 'var(--mm-mono)', fontSize: 9.5, letterSpacing: '.08em', color: 'var(--mm-rose-deep)' }}>
            @{person.instagram}
          </a>
        )}
      </div>
    </div>
  )
}

const Mempelai = ({ data }) => (
  <ScreenFixed id="mm-mempelai">
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: 26 }}>
      <Cap style={{ textAlign: 'center' }}>Mempelai</Cap>
      {(data?.groom?.name || data?.groom?.nickname) && <PersonCard person={data.groom} label="Mempelai Pria" />}
      {(data?.bride?.name || data?.bride?.nickname) && <PersonCard person={data.bride} label="Mempelai Wanita" />}
    </div>
  </ScreenFixed>
)

// Seluruh array dipetakan, bukan events[0] dan events[1]: sudah ada
// undangan yang menyimpan tiga sesi, dan yang ketiga hilang tanpa jejak.
const Acara = ({ events }) => (
  <ScreenGrow id="mm-acara">
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Cap style={{ textAlign: 'center' }}>Acara</Cap>
      {events.map((ev, i) => (
        <div key={i} style={{ ...cardStyle, background: 'rgba(255,255,255,.7)', border: '1px solid rgba(198,163,116,.3)', padding: '22px 20px', textAlign: 'center' }}>
          <CardTitle>{ev?.name || (i === 0 ? 'Akad Nikah' : i === 1 ? 'Resepsi' : `Acara ${i + 1}`)}</CardTitle>
          {dateOf(ev) && <div style={{ marginTop: 10, fontSize: 'var(--mm-fs-body)', color: 'var(--mm-ink)' }}>{dateOf(ev)}</div>}
          {timeOf(ev) && <div style={{ marginTop: 4, fontSize: 13.5, color: 'var(--mm-ink-soft)' }}>{timeOf(ev)}</div>}
          <Rule w={28} style={{ margin: '14px auto' }} />
          {ev?.venue && <div style={{ fontSize: 'var(--mm-fs-body)', color: 'var(--mm-ink)' }}>{ev.venue}</div>}
          {ev?.address && <div style={{ marginTop: 5, fontSize: 13, lineHeight: 1.6, color: 'var(--mm-ink-soft)', textWrap: 'pretty' }}>{ev.address}</div>}
          {ev?.maps && (
            <a href={ev.maps} target="_blank" rel="noreferrer" className="mm-outline"
              style={{ display: 'inline-block', marginTop: 16, padding: '10px 20px' }}>
              Lihat Peta
            </a>
          )}
        </div>
      ))}
    </div>
  </ScreenGrow>
)

const LoveStory = ({ loveStory }) => (
  <ScreenGrow id="mm-story">
    <div style={{ margin: 'auto 0' }}>
      <Cap style={{ textAlign: 'center', marginBottom: 22 }}>Cerita Kami</Cap>
      <div style={{ position: 'relative', paddingLeft: 26, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ position: 'absolute', left: 5, top: 6, bottom: 6, width: 1, background: 'linear-gradient(180deg, var(--mm-gold), rgba(198,163,116,0))' }} />
        {loveStory.map((s, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: -26, top: 5, width: 11, height: 11, borderRadius: 999, background: 'var(--mm-blush)', border: '1px solid var(--mm-gold)' }} />
            {s?.year && <div style={{ fontFamily: 'var(--mm-mono)', fontSize: 9.5, letterSpacing: '.16em', color: 'var(--mm-gold)' }}>{s.year}</div>}
            {s?.title && <div style={{ fontFamily: 'var(--mm-display)', fontSize: 'var(--mm-fs-h2)', color: 'var(--mm-ink)', marginTop: 4 }}>{s.title}</div>}
            {s?.desc && <p style={{ margin: '6px 0 0', fontSize: 14.5, lineHeight: 1.7, color: 'var(--mm-ink-soft)', textWrap: 'pretty' }}>{s.desc}</p>}
          </div>
        ))}
      </div>
    </div>
  </ScreenGrow>
)

const Galeri = ({ gallery }) => (
  <ScreenGrow id="mm-galeri" pad="92px 22px">
    <div style={{ margin: 'auto 0' }}>
      <Cap style={{ textAlign: 'center', marginBottom: 18 }}>Galeri</Cap>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {gallery.map((g, i) => (
          <div key={g?.id || i} style={{ aspectRatio: '3 / 4', borderRadius: 14, overflow: 'hidden', background: 'linear-gradient(150deg, var(--mm-blush), #F0D7D6)' }}>
            {g?.src && <img src={g.src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
          </div>
        ))}
      </div>
    </div>
  </ScreenGrow>
)

// Informasi tamu selalu sebelum RSVP. Alasannya perilaku, bukan estetika:
// tamu yang sudah mengirim ucapan menganggap undangannya selesai, dan apa
// pun yang datang sesudah itu tidak terbaca.
const Informasi = ({ data, copiedKey, copy }) => {
  const dresscode = data?.dresscode || {}
  const hasDresscode = Boolean(dresscode.name || dresscode.notes)
  const live = data?.livestreamEnabled === true ? (data?.livestreamPlatforms || []).filter(l => l?.url) : []
  const accounts = (data?.accounts || []).filter(Boolean)
  const giftAddress = data?.giftAddress || ''
  const families = data?.turutMengundangEnabled === true
    ? (data?.families || []).filter(f => (f?.members || []).some(Boolean))
    : []

  return (
    <ScreenGrow id="mm-info">
      <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Cap style={{ textAlign: 'center' }}>Informasi Tamu</Cap>

        {hasDresscode && (
          <div style={cardStyle}>
            <CardTitle>Dresscode</CardTitle>
            {dresscode.name && (
              <div className="flex" style={{ alignItems: 'center', gap: 10, marginTop: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: 999, border: '1px solid rgba(75,58,60,.18)', background: dresscode.color || 'var(--mm-blush)' }} />
                <span style={{ fontSize: 'var(--mm-fs-body)', color: 'var(--mm-ink)' }}>{dresscode.name}</span>
              </div>
            )}
            {dresscode.notes && <p style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.65, color: 'var(--mm-ink-soft)' }}>{dresscode.notes}</p>}
          </div>
        )}

        {live.length > 0 && (
          <div style={cardStyle}>
            <CardTitle>Live Streaming</CardTitle>
            <div className="flex" style={{ flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {live.map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noreferrer" className="mm-outline" style={{ padding: '9px 16px' }}>
                  {l.type || 'Tonton Live'}
                </a>
              ))}
            </div>
          </div>
        )}

        {(accounts.length > 0 || giftAddress) && (
          <div style={cardStyle}>
            <CardTitle>Hadiah</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {accounts.map((a, i) => (
                <div key={i} style={{ border: '1px dashed rgba(198,163,116,.5)', borderRadius: 'var(--mm-r-input)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--mm-mono)', fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--mm-gold)' }}>{a.bank}</div>
                    <div style={{ fontSize: 16, letterSpacing: '.06em', color: 'var(--mm-ink)', marginTop: 4, wordBreak: 'break-all' }}>{a.number}</div>
                    {a.holder && <div style={{ fontSize: 13, color: 'var(--mm-ink-soft)' }}>a.n. {a.holder}</div>}
                  </div>
                  <button onClick={() => copy(String(a.number || ''), i)} style={{
                    cursor: 'pointer', padding: '8px 14px', borderRadius: 999, border: 'none',
                    background: 'var(--mm-blush)', color: 'var(--mm-rose-deep)',
                    fontFamily: 'var(--mm-mono)', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
                  }}>{copiedKey === i ? 'Tersalin' : 'Salin'}</button>
                </div>
              ))}
              {giftAddress && (
                <div style={{ border: '1px dashed rgba(198,163,116,.5)', borderRadius: 'var(--mm-r-input)', padding: '12px 14px' }}>
                  <div style={{ fontFamily: 'var(--mm-mono)', fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--mm-gold)' }}>Kirim Hadiah</div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--mm-ink)', marginTop: 5 }}>{giftAddress}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {families.length > 0 && (
          <div style={cardStyle}>
            <CardTitle>Turut Mengundang</CardTitle>
            {/* Gulir internal: satu keluarga bisa mendaftarkan puluhan nama,
                dan tanpa ini sisanya terpotong di bawah lipatan babak. */}
            <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {families.map((f, i) => (
                <div key={i}>
                  {f?.side && <div style={{ fontFamily: 'var(--mm-mono)', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--mm-gold)' }}>{f.side}</div>}
                  <div style={{ fontSize: 13.5, lineHeight: 1.75, color: 'var(--mm-ink-soft)', marginTop: 5 }}>
                    {(f?.members || []).filter(Boolean).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScreenGrow>
  )
}

const fieldStyle = {
  width: '100%', boxSizing: 'border-box', padding: '13px 14px',
  fontFamily: 'var(--mm-body)', fontSize: 15, color: 'var(--mm-ink)',
  background: 'var(--mm-ivory)', border: '1px solid rgba(198,163,116,.34)',
  borderRadius: 'var(--mm-r-input)', outline: 'none',
}

const RsvpUcapan = ({ wishes, onSubmitWish }) => {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [attendance, setAttendance] = useState('hadir')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const list = wishes || []
  const canSend = name.trim() && message.trim() && !busy

  const submit = async (e) => {
    e.preventDefault()
    if (!canSend) return
    setBusy(true)
    try {
      if (onSubmitWish) await onSubmitWish({ name, message, attendance })
      setName(''); setMessage(''); setAttendance('hadir')
      setSent(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <ScreenGrow id="mm-rsvp">
      <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Cap style={{ textAlign: 'center' }}>Ucapan &amp; RSVP</Cap>

        <form onSubmit={submit} style={{ ...cardStyle, background: 'rgba(255,255,255,.72)', border: '1px solid rgba(198,163,116,.28)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama kamu" style={fieldStyle} />

          <div className="flex" style={{ gap: 8 }}>
            {[['hadir', 'Hadir'], ['tidak_hadir', 'Berhalangan']].map(([val, label]) => {
              const on = attendance === val
              return (
                <button key={val} type="button" onClick={() => setAttendance(val)} style={{
                  flex: 1, textAlign: 'center', cursor: 'pointer', padding: '12px 0', borderRadius: 999,
                  fontFamily: 'var(--mm-mono)', fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase',
                  border: `1px solid ${on ? 'var(--mm-rose-deep)' : 'rgba(198,163,116,.4)'}`,
                  background: on ? 'var(--mm-blush)' : 'transparent',
                  color: on ? 'var(--mm-rose-deep)' : 'var(--mm-ink-soft)',
                  transition: 'all var(--mm-dur) var(--mm-ease)',
                }}>{label}</button>
              )
            })}
          </div>

          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
            placeholder="Tulis ucapan &amp; doa" style={{ ...fieldStyle, resize: 'none' }} />

          <button type="submit" disabled={!canSend} style={{
            cursor: canSend ? 'pointer' : 'not-allowed', textAlign: 'center', padding: 14,
            borderRadius: 999, border: 'none', background: 'var(--mm-rose-deep)', color: '#FFF6F4',
            fontFamily: 'var(--mm-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase',
            opacity: canSend ? 1 : 0.55,
          }}>{busy ? 'Mengirim…' : sent ? 'Terkirim' : 'Kirim'}</button>
        </form>

        {/* Gulir internal, bukan babak yang memanjang tanpa ujung: daftar ini
            bisa berisi puluhan ucapan dan akan menelan seluruh deck. */}
        <div style={{ maxHeight: 230, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 2 }}>
          {list.map((w, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,.55)', borderLeft: '1px solid var(--mm-blush)',
              borderRadius: '0 var(--mm-r-input) var(--mm-r-input) 0', padding: '12px 14px',
            }}>
              <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--mm-display)', fontSize: 16, color: 'var(--mm-ink)' }}>{w?.name}</span>
                {w?.time && <span style={{ fontFamily: 'var(--mm-mono)', fontSize: 8.5, letterSpacing: '.1em', color: 'var(--mm-ink-soft)' }}>{w.time}</span>}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--mm-ink-soft)', marginTop: 5, textWrap: 'pretty' }}>{w?.wish}</div>
              <div style={{ fontFamily: 'var(--mm-mono)', fontSize: 8.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--mm-gold)', marginTop: 7 }}>
                {w?.rsvp === 'tidak_hadir' ? 'Berhalangan' : 'Hadir'}
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <div style={{ textAlign: 'center', fontSize: 13.5, fontStyle: 'italic', color: 'var(--mm-ink-soft)', padding: '10px 0' }}>
              Jadi yang pertama mengirim ucapan.
            </div>
          )}
        </div>
      </div>
    </ScreenGrow>
  )
}

const Penutup = ({ data, groomNick, brideNick, onHome }) => (
  <ScreenFixed id="mm-penutup" pad="92px 30px">
    <div style={{ margin: 'auto 0', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 26 }}>
        <Portrait src={data?.meta?.footerPhoto} alt="" initial={initialOf(groomNick)}
          w={132} h={172} radius="80px 80px 14px 14px" />
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--mm-ink-soft)', margin: 0, textWrap: 'pretty' }}>
        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara berkenan hadir
        untuk memberikan doa restu.
      </p>
      <Rule style={{ margin: '24px auto' }} />
      <div style={{ fontFamily: 'var(--mm-display)', fontSize: 30, color: 'var(--mm-ink)' }}>
        {groomNick} &amp; {brideNick}
      </div>
      <button onClick={onHome} className="mm-outline" style={{ marginTop: 30, padding: '11px 22px' }}>
        Kembali ke awal
      </button>
    </div>
  </ScreenFixed>
)

// ═══════════════════════════════════════════════════════════════════
//  COVER
// ═══════════════════════════════════════════════════════════════════

const Cover = ({ data, groomNick, brideNick, dateLabel, guestName, onOpen, animateClose }) => (
  <div style={{
    position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
    width: 'var(--inv-w)', height: 'var(--inv-h)', zIndex: 12,
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    padding: '92px 30px', boxSizing: 'border-box', overflow: 'hidden', background: 'var(--mm-ivory)',
    animation: animateClose ? 'mm-cover-out 780ms var(--mm-ease) forwards' : 'mm-in 500ms var(--mm-ease) both',
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: data?.meta?.coverPhoto
        ? `center/cover no-repeat url('${data.meta.coverPhoto}')`
        : 'linear-gradient(160deg, #F0D7D6, #EACFCE)',
    }} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(156,96,104,.34) 0%, rgba(251,247,244,.72) 62%, var(--mm-ivory) 100%)' }} />

    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, overflow: 'hidden' }}>
      <div className="mm-shimmer" style={{
        width: '40%', height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(198,163,116,.8), transparent)',
        animation: 'mm-shimmer 4.5s var(--mm-ease) infinite',
      }} />
    </div>

    <div className="mm-rise" style={{ position: 'relative', zIndex: 1, margin: 'auto 0', textAlign: 'center' }}>
      <Cap style={{ letterSpacing: '.32em' }}>Undangan Pernikahan</Cap>
      <Rule w={40} style={{ margin: '18px auto 24px' }} />
      <div style={{ fontFamily: 'var(--mm-display)', fontSize: 42, lineHeight: 1.08, color: 'var(--mm-ink)' }}>{groomNick}</div>
      <div style={{ fontStyle: 'italic', fontSize: 18, color: 'var(--mm-rose)', margin: '4px 0' }}>&amp;</div>
      <div style={{ fontFamily: 'var(--mm-display)', fontSize: 42, lineHeight: 1.08, color: 'var(--mm-ink)' }}>{brideNick}</div>
      {dateLabel && <div style={{ marginTop: 22, fontSize: 14, letterSpacing: '.08em', color: 'var(--mm-ink-soft)' }}>{dateLabel}</div>}
      {guestName && (
        <>
          <div style={{ marginTop: 34, fontSize: 12.5, color: 'var(--mm-ink-soft)' }}>Kepada Yth.</div>
          <div style={{ fontFamily: 'var(--mm-display)', fontSize: 23, color: 'var(--mm-ink)', marginTop: 3 }}>{guestName}</div>
        </>
      )}
      <button onClick={onOpen} style={{
        marginTop: 34, cursor: 'pointer', padding: '15px 34px', borderRadius: 999, border: 'none',
        background: 'var(--mm-rose-deep)', color: '#FFF6F4',
        fontFamily: 'var(--mm-mono)', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase',
      }}>Buka Undangan</button>
    </div>
  </div>
)

// ═══════════════════════════════════════════════════════════════════
//  CHROME — progres, navigasi, musik
// ═══════════════════════════════════════════════════════════════════

// Tiap segmen bisa ditekan, bukan hanya penunjuk posisi. Tamu yang datang
// hanya untuk melihat alamat gedung tidak boleh dipaksa melewati sembilan
// babak untuk sampai ke sana.
const Progress = ({ chapters, active, visible, go }) => (
  <div className="fixed flex" style={{
    top: 0, left: '50%', transform: 'translateX(-50%)', width: 'var(--inv-w)',
    zIndex: 6, gap: 4, padding: '12px 14px 0', boxSizing: 'border-box',
    opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none',
    transition: 'opacity .7s ease .3s',
  }}>
    {chapters.map(([id, label], i) => (
      <button key={id} title={label} onClick={() => go(id)} style={{
        flex: 1, height: 2, borderRadius: 2, border: 'none', padding: 0, cursor: 'pointer',
        background: i <= active ? 'var(--mm-gold)' : 'rgba(198,163,116,.26)',
        transition: 'background var(--mm-dur) var(--mm-ease)',
      }} />
    ))}
  </div>
)

const NAV_IDS = ['mm-home', 'mm-mempelai', 'mm-acara', 'mm-galeri', 'mm-rsvp']

const BottomNav = ({ chapters, activeId, visible, go }) => {
  const items = chapters.filter(([id]) => NAV_IDS.includes(id))
  return (
    <div className="fixed flex" style={{
      bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 'var(--inv-w)',
      zIndex: 5, justifyContent: 'center', padding: '0 14px 14px', boxSizing: 'border-box',
      pointerEvents: 'none',
      opacity: visible ? 1 : 0, transition: 'opacity .7s ease .3s',
    }}>
      <div className="flex" style={{
        pointerEvents: visible ? 'auto' : 'none', gap: 2, padding: 5, borderRadius: 999,
        background: 'rgba(251,247,244,.9)', border: '1px solid rgba(198,163,116,.3)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      }}>
        {items.map(([id, label]) => {
          const on = activeId === id
          return (
            <button key={id} onClick={() => go(id)} style={{
              cursor: 'pointer', padding: '8px 13px', borderRadius: 999, border: 'none', whiteSpace: 'nowrap',
              fontFamily: 'var(--mm-mono)', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
              color: on ? '#FFF6F4' : 'var(--mm-ink-soft)',
              background: on ? 'var(--mm-rose-deep)' : 'transparent',
              transition: 'all var(--mm-dur) var(--mm-ease)',
            }}>{label}</button>
          )
        })}
      </div>
    </div>
  )
}

const MusicButton = ({ musicPlaying, setMusicPlaying, visible }) => (
  <button onClick={() => setMusicPlaying(!musicPlaying)} title="Musik" className="fixed flex items-end justify-center"
    style={{
      top: 26, right: 'max(16px, calc(50vw - var(--inv-w) / 2 + 16px))', zIndex: 7,
      width: 40, height: 40, borderRadius: 999, cursor: 'pointer', gap: 3, paddingBottom: 13,
      background: 'rgba(251,247,244,.9)', border: '1px solid rgba(198,163,116,.34)',
      opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none',
      transition: 'opacity .7s ease .3s',
    }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        display: 'block', width: 3, height: 12, borderRadius: 2,
        background: musicPlaying ? 'var(--mm-rose-deep)' : 'var(--mm-ink-soft)',
        transformOrigin: 'bottom',
        transform: musicPlaying ? undefined : 'scaleY(.35)',
        animation: musicPlaying ? `mm-eq ${0.62 + i * 0.15}s ease-in-out infinite` : 'none',
      }} />
    ))}
  </button>
)

// ═══════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════

export default function MemoriesTheme({
  data, countdown, opened, setOpened,
  animateClose, setAnimateClose,
  musicPlaying, setMusicPlaying, audioRef,
  wishes, onSubmitWish, guestName,
}) {
  const deckRef = useRef(null)
  const [active, setActive] = useState(0)
  const [coverGone, setCoverGone] = useState(false)
  const [petals] = useState(seedPetals)
  const { copiedKey, copy } = useCopyToClipboard()

  const groomNick = data?.groom?.nickname || data?.groom?.name || 'Mempelai Pria'
  const brideNick = data?.bride?.nickname || data?.bride?.name || 'Mempelai Wanita'
  const events = (data?.events || []).filter(Boolean)
  const loveStory = (data?.loveStory || []).filter(s => s?.title || s?.desc || s?.year)
  const gallery = (data?.gallery || []).filter(g => g?.src)
  const dateLabel = dateOf(events[0])
  const musicEnabled = data?.music !== false

  const hasQuote = Boolean(data?.quote)
  const hasMempelai = Boolean(data?.groom?.name || data?.groom?.nickname || data?.bride?.name || data?.bride?.nickname)
  const hasInfo = Boolean(
    data?.dresscode?.name || data?.dresscode?.notes ||
    (data?.livestreamEnabled === true && (data?.livestreamPlatforms || []).some(l => l?.url)) ||
    (data?.accounts || []).length > 0 || data?.giftAddress ||
    (data?.turutMengundangEnabled === true && (data?.families || []).some(f => (f?.members || []).some(Boolean)))
  )

  // Daftar babak yang benar-benar tampil. Bilah progres dan pil navigasi
  // dibangun dari daftar yang sama, jadi keduanya tidak pernah menunjuk ke
  // babak yang tidak ada.
  const chapters = [
    ['mm-home', 'Home', true],
    ['mm-quote', 'Quote', hasQuote],
    ['mm-mempelai', 'Mempelai', hasMempelai],
    ['mm-acara', 'Acara', events.length > 0],
    ['mm-story', 'Story', loveStory.length > 0],
    ['mm-galeri', 'Galeri', gallery.length > 0],
    ['mm-info', 'Info', hasInfo],
    ['mm-rsvp', 'RSVP', true],
    ['mm-penutup', 'Penutup', true],
  ].filter(x => x[2]).map(x => [x[0], x[1]])

  const activeId = chapters[active]?.[0]

  // scrollIntoView, bukan window.scrollTo: yang menggulir di sini deck milik
  // tema, dan window tidak pernah punya scroll untuk digeser.
  const go = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const onScroll = (e) => {
    const deck = e.currentTarget
    const kids = Array.from(deck.children).filter(k => k.id)
    let a = 0
    kids.forEach((k, i) => { if (k.offsetTop <= deck.scrollTop + 8) a = i })
    if (a !== active) setActive(a)
  }

  // Cover dilepas lewat state sendiri, bukan digantung pada !opened: kalau
  // digantung, ia lepas di commit yang sama dengan setOpened dan animasi
  // keluarnya tidak pernah sempat berjalan.
  const handleOpen = () => {
    setAnimateClose?.(true)
    setOpened?.(true)
    if (musicEnabled) setMusicPlaying?.(true)
    setTimeout(() => setCoverGone(true), 820)
  }

  // Deck dikunci selama cover masih terpasang, supaya gulir yang tidak
  // sengaja tidak memindahkan babak di balik cover.
  useEffect(() => {
    if (!coverGone && deckRef.current) deckRef.current.scrollTop = 0
  }, [coverGone])

  return (
    <InvitationLayout layout={THEMES.MEMORIES} data={data}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Italiana&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=IBM+Plex+Mono:wght@400&display=swap');

        .mm-root {
          --mm-ivory: #FBF7F4;
          --mm-blush: #F7E4E3;
          --mm-rose: #D9A0A4;
          --mm-rose-deep: #9C6068;
          --mm-gold: #C6A374;
          --mm-ink: #4B3A3C;
          --mm-ink-soft: #836F71;

          --mm-display: 'Italiana', serif;
          --mm-body: 'Cormorant Garamond', serif;
          --mm-mono: 'IBM Plex Mono', monospace;
          --mm-fs-display: 46px;
          --mm-fs-h2: 21px;
          --mm-fs-body: 15.5px;
          --mm-fs-cap: 10.5px;

          --mm-r-card: 20px;
          --mm-r-input: 12px;

          --mm-dur: 520ms;
          --mm-dur-slow: 900ms;
          --mm-ease: cubic-bezier(.22,.61,.36,1);
        }

        .mm-deck { scrollbar-width: none; }
        .mm-deck::-webkit-scrollbar { display: none; }

        .mm-outline {
          border-radius: 999px;
          border: 1px solid var(--mm-rose);
          background: transparent;
          color: var(--mm-rose-deep);
          font-family: var(--mm-mono);
          font-size: 9.5px;
          letter-spacing: .14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background var(--mm-dur) var(--mm-ease);
        }
        .mm-outline:hover { background: var(--mm-blush); }

        .mm-root button:focus-visible,
        .mm-root a:focus-visible,
        .mm-root input:focus-visible,
        .mm-root textarea:focus-visible {
          outline: 2px solid var(--mm-rose-deep);
          outline-offset: 2px;
        }

        @keyframes mm-up { from { opacity: 0; transform: translate3d(0, 16px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
        @keyframes mm-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mm-cover-out { to { opacity: 0; transform: translate3d(0, -4%, 0); } }
        @keyframes mm-shimmer { 0% { transform: translate3d(-60%, 0, 0); } 100% { transform: translate3d(160%, 0, 0); } }
        @keyframes mm-breathe { 0%, 100% { opacity: .55; } 50% { opacity: .9; } }
        @keyframes mm-eq { 0%, 100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
        @keyframes mm-fall {
          0%   { transform: translate3d(0, -10%, 0) rotate(0deg); }
          100% { transform: translate3d(26px, calc(var(--inv-h) + 60px), 0) rotate(260deg); }
        }
        @keyframes mm-drift-a {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50%      { transform: translate3d(9%, 5%, 0); }
        }
        @keyframes mm-drift-b {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50%      { transform: translate3d(-8%, -6%, 0); }
        }

        .mm-rise { animation: mm-up var(--mm-dur-slow) var(--mm-ease) both; }

        /* Tamu yang meminta gerak dikurangi tetap mendapat halaman yang utuh:
           tidak ada satu pun gaya dasar di tema ini yang dimulai dari
           opacity 0, jadi mematikan animasinya tidak menyembunyikan apa pun. */
        @media (prefers-reduced-motion: reduce) {
          .mm-root *, .mm-root *::before, .mm-root *::after {
            animation: none !important;
            transition-duration: 1ms !important;
          }
          .mm-root .mm-deck { scroll-behavior: auto; }
        }
      `}</style>

      <div className="mm-root relative" style={{
        height: 'var(--inv-h)', flexShrink: 0, overflow: 'hidden',
        fontFamily: 'var(--mm-body)', color: 'var(--mm-ink)', background: 'var(--mm-ivory)',
      }}>
        {musicEnabled && (
          <audio ref={audioRef} src={data?.musicUrl || MUSIC_URLS[data?.musicId || 1] || MUSIC_URLS[1]} loop />
        )}

        <Panggung petals={petals} />

        <Progress chapters={chapters} active={active} visible={opened} go={go} />

        {/* proximity, bukan mandatory. Snap wajib mengunci ke awal babak
            setiap gulir berhenti, dan babak yang boleh tumbuh — Acara dengan
            tiga sesi, RSVP dengan form plus daftar ucapan — lebih tinggi dari
            satu layar. Bagian bawahnya jadi tidak pernah bisa dicapai: tamu
            menggulir turun, jarinya lepas, dan halaman memantul kembali ke
            atas babak yang sama. Dengan proximity babak setinggi satu layar
            tetap mengunci dan yang lebih panjang bisa digulir sampai habis. */}
        <div ref={deckRef} className="mm-deck" onScroll={onScroll} style={{
          height: 'var(--inv-h)', overflowY: 'auto', overflowX: 'hidden',
          scrollSnapType: 'y proximity', position: 'relative', zIndex: 1,
        }}>
          <Hero groomNick={groomNick} brideNick={brideNick} dateLabel={dateLabel}
            guestName={guestName} countdown={countdown}
            countdownEnabled={(data?.countdownEnabled ?? true) && events.length > 0}
            onNext={() => go(chapters[Math.min(active + 1, chapters.length - 1)][0])} />

          {hasQuote && <Quote quote={data.quote} />}
          {hasMempelai && <Mempelai data={data} />}
          {events.length > 0 && <Acara events={events} />}
          {loveStory.length > 0 && <LoveStory loveStory={loveStory} />}
          {gallery.length > 0 && <Galeri gallery={gallery} />}
          {hasInfo && <Informasi data={data} copiedKey={copiedKey} copy={copy} />}

          <RsvpUcapan wishes={wishes} onSubmitWish={onSubmitWish} />

          <Penutup data={data} groomNick={groomNick} brideNick={brideNick} onHome={() => go('mm-home')} />

          <div style={{ height: 74 }} />
        </div>

        <BottomNav chapters={chapters} activeId={activeId} visible={opened} go={go} />
        {musicEnabled && <MusicButton musicPlaying={musicPlaying} setMusicPlaying={setMusicPlaying} visible={opened} />}

        {!coverGone && (
          <Cover data={data} groomNick={groomNick} brideNick={brideNick} dateLabel={dateLabel}
            guestName={guestName} onOpen={handleOpen} animateClose={animateClose} />
        )}
      </div>
    </InvitationLayout>
  )
}
