import { useState, useEffect } from 'react'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { THEMES } from '../config/constants'

// ═══════════════════════════════════════════════════════════════════
//  MEMORIES — kategori Motion (MOT-004)
//
//  Undangan yang mengalir menyambung, dengan panggung video yang diam di
//  belakangnya dan kelopak vektor jatuh di depannya.
//
//  Bentuk pertamanya bukan ini. Tema ini lahir sebagai "story deck": sembilan
//  babak, satu layar penuh masing-masing, dikunci scroll-snap di dalam
//  scroller milik tema sendiri. Rapi di prototipe, dan salah di tangan tamu —
//  yang terlihat hanya satu hal pada satu waktu, dan hitung mundur, doa, serta
//  mempelai tidak pernah bisa muncul bersama dalam satu bingkai seperti di
//  tema-tema lain. Undangan dibaca mengalir, bukan ditelusuri satu per satu.
//
//  Jadi babaknya sekarang setinggi isinya dan bergulir di scroller milik
//  shell, sama seperti tema lain; hanya pembuka dan penutup yang mengambil
//  satu layar penuh. Yang tersisa dari bentuk lama justru bagian terbaiknya:
//  bilah progres yang bisa ditekan di atas dan pil navigasi di bawah, yang
//  membuat tamu bisa melompat ke bagian mana pun tanpa menggulir jauh.
//
//  Babak aktif dilacak dengan IntersectionObserver, bukan scrollTop: yang
//  menggulir bukan elemen milik tema, dan IntersectionObserver melaporkan apa
//  yang benar-benar terlihat tanpa perlu tahu siapa yang menggulir.
// ═══════════════════════════════════════════════════════════════════

// Satu berkas video saja, bukan pasangan intro + loop. Footage-nya cuma 5
// detik dolly maju tanpa babak "kedatangan", jadi tidak ada yang bisa
// diceritakan sebuah intro; momen pembukaannya sudah dipegang cover.
//
// Loop-nya ping-pong: maju lalu mundur, 240 frame / 10 detik. Untuk gerakan
// dolly ini itu satu-satunya cara yang benar — melarutkan ekor ke kepala yang
// dibalik (cara Gilded Palace) mempertemukan dua frame dengan skala yang jauh
// berbeda dan akan terbaca sebagai bayangan ganda. Ping-pong justru mengubah
// dolly-nya jadi tarikan napas: masuk, keluar, terus begitu.
//
// Ketiga sambungannya diukur terhadap baseline footage-nya sendiri, bukan
// terhadap ambang tetap. Dua frame bersebelahan di tengah adegan ini mencetak
// 40,8 dB; titik baliknya 45,8 dB dan titik putarannya 37,9 dB. Keduanya
// setara gerak frame-ke-frame biasa, jadi tidak ada sentakan di mana pun.
//
// 784x1112 pada CRF 24 veryslow: 2,03 MB, VMAF 91,8 diukur pada ukuran tampil.
// Sumbernya 784x1176 dan tidak di-downscale — di kolom 480px pada layar 3x
// video ini sudah di bawah kerapatan tampilan, jadi memperkecilnya hanya
// merusak tanpa menghemat yang berarti. 64 baris terbawah dipotong: di situ
// letak watermark generatornya. Trek audio bawaannya dibuang — tema ini punya
// pemutar musiknya sendiri, dan video ber-audio bisa membuat autoplay ditolak.
const A = {
  poster: '/themes/Motion/theme-5/poster.jpg',
  loop:   '/themes/Motion/theme-5/loop.mp4',
}

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

// giftAddress itu OBJEK { enabled, recipient, phone, address }, bukan string.
// Ia punya sakelarnya sendiri di RekeningForm, jadi keberadaan objeknya tidak
// berarti pasangan ingin menampilkannya — objek kosong tetap truthy.
const giftAddrOf = (data) => {
  const ga = data?.giftAddress
  return ga?.enabled && (ga.address || ga.recipient || ga.phone) ? ga : null
}

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
const Panggung = ({ petals, stageOn, still }) => (
  <div className="fixed pointer-events-none" style={{
    top: 0, left: '50%', transform: 'translateX(-50%)',
    width: 'var(--inv-w)', height: 'var(--inv-h)', zIndex: 0, overflow: 'hidden',
  }}>
    {/* Poster selalu terpasang, videonya baru menyusul. Frame pertama loop
        diambil dari poster ini, jadi saat video mengambil alih tidak ada yang
        berubah di layar — dan tamu yang tidak pernah membuka undangannya tidak
        pernah mengunduh 2 MB-nya. */}
    <div style={{ position: 'absolute', inset: 0, background: `center/cover no-repeat url('${A.poster}')` }} />

    {stageOn && !still && (
      <video className="me-stage-video" autoPlay muted loop playsInline preload="auto" poster={A.poster}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}>
        <source src={A.loop} type="video/mp4" />
      </video>
    )}

    {/* Tabir ivory, dan ketebalannya dihitung bukan dikira. Teks undangan
        berdiri langsung di atas gambar ini, dan videonya sendiri jatuh di
        kontras 2,60–4,18 untuk warna teks utama — gagal AA di seluruh pita.
        Tabirnya bergradasi karena rata membuat aulanya hambar: tipis di 18%
        teratas supaya kanopi bunganya tetap hidup (di sana tidak ada teks yang
        berdiri), lalu menebal ke .80 dari 34% ke bawah, tempat semua konten
        yang di-tengah-kan sebenarnya duduk. Pada .80 di pita tergelap: teks
        utama 8,19 dan teks sekunder 5,2 — keduanya lolos AA. */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, rgba(251,247,244,.46) 0%, rgba(251,247,244,.54) 18%, rgba(251,247,244,.80) 34%, rgba(251,247,244,.82) 100%)',
    }} />

    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: '16%',
      background: 'linear-gradient(0deg, rgba(198,163,116,.18) 0%, transparent 100%)',
      animation: 'me-breathe 9s ease-in-out infinite',
    }} />

    {/* Kelopak tetap vektor, tidak ikut ke dalam video: alpha-nya asli, tajam
        di DPI berapa pun, dan warnanya ikut palet tema. */}
    {petals.map(p => (
      <div key={p.key} style={{
        position: 'absolute', top: '-6%', left: `${p.left}%`,
        width: p.size, height: p.size * 0.72, opacity: p.op,
        borderRadius: '60% 40% 55% 45% / 55% 62% 38% 45%',
        background: 'linear-gradient(140deg, #FBE9E8, var(--me-rose))',
        animation: `me-fall ${p.dur.toFixed(1)}s linear ${p.delay.toFixed(1)}s infinite`,
      }} />
    ))}
  </div>
)

// ═══════════════════════════════════════════════════════════════════
//  POTONGAN KECIL
// ═══════════════════════════════════════════════════════════════════

const Cap = ({ children, style = {} }) => (
  <div style={{
    fontFamily: 'var(--me-mono)', fontSize: 'var(--me-fs-cap)', letterSpacing: '.3em',
    textTransform: 'uppercase', color: 'var(--me-ink-soft)', ...style,
  }}>{children}</div>
)

const Rule = ({ w = 36, style = {} }) => (
  <div style={{ height: 1, width: w, background: 'var(--me-gold)', ...style }} />
)

const CardTitle = ({ children }) => (
  <div style={{ fontFamily: 'var(--me-display)', fontSize: 'var(--me-fs-h2)', lineHeight: 1.25, color: 'var(--me-rose-deep)' }}>
    {children}
  </div>
)

const cardStyle = {
  background: 'rgba(255,255,255,.66)',
  border: '1px solid rgba(198,163,116,.26)',
  borderRadius: 'var(--me-r-card)',
  padding: 18,
}

// Foto tanpa scale(): men-scale raster melembekkan foto berapa pun
// resolusinya. Kalau pasangan belum mengunggah fotonya, yang tampil bukan
// kotak kosong melainkan inisialnya di atas gradasi blush — tamu tidak
// pernah melihat placeholder yang terlihat rusak.
const Portrait = ({ src, alt, initial, w, h, radius }) => (
  <div style={{
    width: w, height: h, flex: '0 0 auto', borderRadius: radius, overflow: 'hidden',
    background: 'linear-gradient(150deg, var(--me-blush), #F0D7D6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    {src
      ? <img src={src} alt={alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      : <span style={{ fontFamily: 'var(--me-display)', fontSize: Math.round(w * 0.42), color: 'var(--me-rose-deep)', opacity: 0.55 }}>{initial}</span>}
  </div>
)

// Bagian mengalir mengikuti tinggi isinya, dan itu disengaja.
//
// Versi pertama tema ini mengunci satu babak = satu layar penuh dengan
// scroll-snap. Bentuknya rapi tapi salah untuk undangan: tamu hanya pernah
// melihat satu hal pada satu waktu, dan hitung mundur, doa, serta mempelai
// tidak pernah bisa muncul bersama dalam satu bingkai seperti di tema-tema
// lain. Aliran yang menyambung juga yang membuat undangan terasa dibaca,
// bukan ditelusuri satu per satu.
const Section = ({ id, children, pad = '86px 26px' }) => (
  <section id={id} style={{
    position: 'relative', zIndex: 1, boxSizing: 'border-box', padding: pad,
  }}>{children}</section>
)

// Hanya pembuka dan penutup yang mengambil satu layar penuh — keduanya memang
// momen berdiri sendiri, bukan bacaan yang bersambung.
const ScreenFull = ({ id, children, pad = '86px 26px' }) => (
  <section id={id} style={{
    position: 'relative', zIndex: 1, minHeight: 'var(--inv-h)', boxSizing: 'border-box',
    display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: pad,
  }}>{children}</section>
)

// ═══════════════════════════════════════════════════════════════════
//  BABAK
// ═══════════════════════════════════════════════════════════════════

const Hero = ({ groomNick, brideNick, dateLabel, guestName, countdown, countdownEnabled, onNext }) => (
  <ScreenFull id="me-home" pad="86px 28px">
    <div className="me-rise" style={{ margin: 'auto 0', width: '100%', textAlign: 'center' }}>
      <Cap>The Wedding Of</Cap>
      <Rule w={44} style={{ margin: '16px auto 22px' }} />
      <h1 style={{ fontFamily: 'var(--me-display)', fontSize: 'var(--me-fs-display)', lineHeight: 1.05, margin: 0, color: 'var(--me-ink)' }}>
        {groomNick}
      </h1>
      <div style={{ fontStyle: 'italic', fontSize: 19, color: 'var(--me-rose)', margin: '6px 0' }}>dan</div>
      <h1 style={{ fontFamily: 'var(--me-display)', fontSize: 'var(--me-fs-display)', lineHeight: 1.05, margin: 0, color: 'var(--me-ink)' }}>
        {brideNick}
      </h1>

      {dateLabel && (
        <div style={{ marginTop: 26, fontSize: 'var(--me-fs-body)', letterSpacing: '.06em', color: 'var(--me-ink-soft)' }}>
          {dateLabel}
        </div>
      )}

      {countdownEnabled && (
        <div className="flex" style={{ gap: 8, justifyContent: 'center', marginTop: 24 }}>
          {[['Hari', countdown?.d], ['Jam', countdown?.h], ['Menit', countdown?.m], ['Detik', countdown?.s]].map(([label, v]) => (
            <div key={label} style={{
              flex: 1, maxWidth: 74, padding: '12px 0', textAlign: 'center',
              background: 'rgba(255,255,255,.66)', border: '1px solid rgba(198,163,116,.34)',
              borderRadius: 'var(--me-r-card)',
            }}>
              <div style={{ fontFamily: 'var(--me-display)', fontSize: 24, lineHeight: 1, color: 'var(--me-rose-deep)' }}>{v ?? 0}</div>
              <div style={{ fontFamily: 'var(--me-mono)', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--me-ink-soft)', marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {guestName && (
        <div style={{ marginTop: 30, fontSize: 13, color: 'var(--me-ink-soft)' }}>
          Kepada Yth. <span style={{ color: 'var(--me-ink)' }}>{guestName}</span>
        </div>
      )}
    </div>

    <button onClick={onNext} style={{
      background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px 0',
      fontFamily: 'var(--me-mono)', fontSize: 9, letterSpacing: '.2em',
      textTransform: 'uppercase', color: 'var(--me-ink-soft)',
    }}>geser ke atas ↑</button>
  </ScreenFull>
)

const Quote = ({ quote }) => (
  <Section id="me-quote" pad="86px 34px">
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--me-display)', fontSize: 40, color: 'var(--me-blush)', lineHeight: 0.6 }}>&ldquo;</div>
      <p style={{ fontSize: 19, fontStyle: 'italic', lineHeight: 1.75, color: 'var(--me-ink)', margin: '14px 0 0', textWrap: 'pretty' }}>
        {quote}
      </p>
      <Rule style={{ margin: '26px auto 0' }} />
    </div>
  </Section>
)

const PersonCard = ({ person, label }) => {
  const parents = [person?.father, person?.mother].filter(Boolean).join(' & ')
  return (
    <div style={{ ...cardStyle, display: 'flex', gap: 16, alignItems: 'center', background: 'rgba(255,255,255,.62)', padding: 16 }}>
      <Portrait src={person?.photo} alt={person?.name || label}
        initial={initialOf(person?.nickname || person?.name)}
        w={92} h={118} radius="48px 48px 12px 12px" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--me-display)', fontSize: 'var(--me-fs-h2)', lineHeight: 1.25, color: 'var(--me-ink)', textWrap: 'pretty' }}>
          {person?.name || person?.nickname || label}
        </div>
        {parents && (
          <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--me-ink-soft)', marginTop: 8 }}>
            Putra/Putri dari {parents}
          </div>
        )}
        {person?.instagram && (
          <a href={`https://instagram.com/${person.instagram}`} target="_blank" rel="noreferrer"
            style={{ display: 'inline-block', marginTop: 10, fontFamily: 'var(--me-mono)', fontSize: 9.5, letterSpacing: '.08em', color: 'var(--me-rose-deep)' }}>
            @{person.instagram}
          </a>
        )}
      </div>
    </div>
  )
}

const Mempelai = ({ data }) => (
  <Section id="me-mempelai">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <Cap style={{ textAlign: 'center' }}>Mempelai</Cap>
      {(data?.groom?.name || data?.groom?.nickname) && <PersonCard person={data.groom} label="Mempelai Pria" />}
      {(data?.bride?.name || data?.bride?.nickname) && <PersonCard person={data.bride} label="Mempelai Wanita" />}
    </div>
  </Section>
)

// Seluruh array dipetakan, bukan events[0] dan events[1]: sudah ada
// undangan yang menyimpan tiga sesi, dan yang ketiga hilang tanpa jejak.
const Acara = ({ events }) => (
  <Section id="me-acara">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Cap style={{ textAlign: 'center' }}>Acara</Cap>
      {events.map((ev, i) => (
        <div key={i} style={{ ...cardStyle, background: 'rgba(255,255,255,.7)', border: '1px solid rgba(198,163,116,.3)', padding: '22px 20px', textAlign: 'center' }}>
          <CardTitle>{ev?.name || (i === 0 ? 'Akad Nikah' : i === 1 ? 'Resepsi' : `Acara ${i + 1}`)}</CardTitle>
          {dateOf(ev) && <div style={{ marginTop: 10, fontSize: 'var(--me-fs-body)', color: 'var(--me-ink)' }}>{dateOf(ev)}</div>}
          {timeOf(ev) && <div style={{ marginTop: 4, fontSize: 13.5, color: 'var(--me-ink-soft)' }}>{timeOf(ev)}</div>}
          <Rule w={28} style={{ margin: '14px auto' }} />
          {ev?.venue && <div style={{ fontSize: 'var(--me-fs-body)', color: 'var(--me-ink)' }}>{ev.venue}</div>}
          {ev?.address && <div style={{ marginTop: 5, fontSize: 13, lineHeight: 1.6, color: 'var(--me-ink-soft)', textWrap: 'pretty' }}>{ev.address}</div>}
          {ev?.maps && (
            <a href={ev.maps} target="_blank" rel="noreferrer" className="me-outline"
              style={{ display: 'inline-block', marginTop: 16, padding: '10px 20px' }}>
              Lihat Peta
            </a>
          )}
        </div>
      ))}
    </div>
  </Section>
)

const LoveStory = ({ loveStory }) => (
  <Section id="me-story">
    <div>
      <Cap style={{ textAlign: 'center', marginBottom: 22 }}>Cerita Kami</Cap>
      <div style={{ position: 'relative', paddingLeft: 26, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ position: 'absolute', left: 5, top: 6, bottom: 6, width: 1, background: 'linear-gradient(180deg, var(--me-gold), rgba(198,163,116,0))' }} />
        {loveStory.map((s, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: -26, top: 5, width: 11, height: 11, borderRadius: 999, background: 'var(--me-blush)', border: '1px solid var(--me-gold)' }} />
            {s?.year && <div style={{ fontFamily: 'var(--me-mono)', fontSize: 9.5, letterSpacing: '.16em', color: 'var(--me-gold)' }}>{s.year}</div>}
            {s?.title && <div style={{ fontFamily: 'var(--me-display)', fontSize: 'var(--me-fs-h2)', color: 'var(--me-ink)', marginTop: 4 }}>{s.title}</div>}
            {s?.desc && <p style={{ margin: '6px 0 0', fontSize: 14.5, lineHeight: 1.7, color: 'var(--me-ink-soft)', textWrap: 'pretty' }}>{s.desc}</p>}
          </div>
        ))}
      </div>
    </div>
  </Section>
)

const Galeri = ({ gallery }) => (
  <Section id="me-galeri" pad="86px 22px">
    <div>
      <Cap style={{ textAlign: 'center', marginBottom: 18 }}>Galeri</Cap>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {gallery.map((g, i) => (
          <div key={g?.id || i} style={{ aspectRatio: '3 / 4', borderRadius: 14, overflow: 'hidden', background: 'linear-gradient(150deg, var(--me-blush), #F0D7D6)' }}>
            {g?.src && <img src={g.src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
          </div>
        ))}
      </div>
    </div>
  </Section>
)

// Informasi tamu selalu sebelum RSVP. Alasannya perilaku, bukan estetika:
// tamu yang sudah mengirim ucapan menganggap undangannya selesai, dan apa
// pun yang datang sesudah itu tidak terbaca.
const Informasi = ({ data, copiedKey, copy }) => {
  const dresscode = data?.dresscode || {}
  const hasDresscode = Boolean(dresscode.name || dresscode.notes)
  const live = data?.livestreamEnabled === true ? (data?.livestreamPlatforms || []).filter(l => l?.url) : []
  const accounts = (data?.accounts || []).filter(Boolean)
  const giftAddr = giftAddrOf(data)
  const families = data?.turutMengundangEnabled === true
    ? (data?.families || []).filter(f => (f?.members || []).some(Boolean))
    : []

  return (
    <Section id="me-info">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Cap style={{ textAlign: 'center' }}>Informasi Tamu</Cap>

        {hasDresscode && (
          <div style={cardStyle}>
            <CardTitle>Dresscode</CardTitle>
            {dresscode.name && (
              <div className="flex" style={{ alignItems: 'center', gap: 10, marginTop: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: 999, border: '1px solid rgba(75,58,60,.18)', background: dresscode.color || 'var(--me-blush)' }} />
                <span style={{ fontSize: 'var(--me-fs-body)', color: 'var(--me-ink)' }}>{dresscode.name}</span>
              </div>
            )}
            {dresscode.notes && <p style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.65, color: 'var(--me-ink-soft)' }}>{dresscode.notes}</p>}
          </div>
        )}

        {live.length > 0 && (
          <div style={cardStyle}>
            <CardTitle>Live Streaming</CardTitle>
            <div className="flex" style={{ flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {live.map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noreferrer" className="me-outline" style={{ padding: '9px 16px' }}>
                  {l.type || 'Tonton Live'}
                </a>
              ))}
            </div>
          </div>
        )}

        {(accounts.length > 0 || giftAddr) && (
          <div style={cardStyle}>
            <CardTitle>Hadiah</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {accounts.map((a, i) => (
                <div key={i} style={{ border: '1px dashed rgba(198,163,116,.5)', borderRadius: 'var(--me-r-input)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--me-mono)', fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--me-gold)' }}>{a.bank}</div>
                    <div style={{ fontSize: 16, letterSpacing: '.06em', color: 'var(--me-ink)', marginTop: 4, wordBreak: 'break-all' }}>{a.number}</div>
                    {a.holder && <div style={{ fontSize: 13, color: 'var(--me-ink-soft)' }}>a.n. {a.holder}</div>}
                  </div>
                  <button onClick={() => copy(String(a.number || ''), i)} style={{
                    cursor: 'pointer', padding: '8px 14px', borderRadius: 999, border: 'none',
                    background: 'var(--me-blush)', color: 'var(--me-rose-deep)',
                    fontFamily: 'var(--me-mono)', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
                  }}>{copiedKey === i ? 'Tersalin' : 'Salin'}</button>
                </div>
              ))}
              {giftAddr && (
                <div style={{ border: '1px dashed rgba(198,163,116,.5)', borderRadius: 'var(--me-r-input)', padding: '12px 14px' }}>
                  <div style={{ fontFamily: 'var(--me-mono)', fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--me-gold)' }}>Kirim Hadiah</div>
                  {giftAddr.recipient && (
                    <div style={{ fontSize: 13.5, color: 'var(--me-ink)', marginTop: 6 }}>Penerima: {giftAddr.recipient}</div>
                  )}
                  {giftAddr.phone && (
                    <div style={{ fontSize: 13, color: 'var(--me-ink-soft)', marginTop: 2 }}>No. HP: {giftAddr.phone}</div>
                  )}
                  {giftAddr.address && (
                    <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--me-ink)', marginTop: 5, whiteSpace: 'pre-line' }}>{giftAddr.address}</div>
                  )}
                  {giftAddr.address && (
                    <button onClick={() => copy(String(giftAddr.address), 'addr')} style={{
                      marginTop: 10, cursor: 'pointer', padding: '8px 14px', borderRadius: 999, border: 'none',
                      background: 'var(--me-blush)', color: 'var(--me-rose-deep)',
                      fontFamily: 'var(--me-mono)', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
                    }}>{copiedKey === 'addr' ? 'Tersalin' : 'Salin Alamat'}</button>
                  )}
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
                  {f?.side && <div style={{ fontFamily: 'var(--me-mono)', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--me-gold)' }}>{f.side}</div>}
                  <div style={{ fontSize: 13.5, lineHeight: 1.75, color: 'var(--me-ink-soft)', marginTop: 5 }}>
                    {(f?.members || []).filter(Boolean).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}

const fieldStyle = {
  width: '100%', boxSizing: 'border-box', padding: '13px 14px',
  fontFamily: 'var(--me-body)', fontSize: 15, color: 'var(--me-ink)',
  background: 'var(--me-ivory)', border: '1px solid rgba(198,163,116,.34)',
  borderRadius: 'var(--me-r-input)', outline: 'none',
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
    <Section id="me-rsvp">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Cap style={{ textAlign: 'center' }}>Ucapan &amp; RSVP</Cap>

        <form onSubmit={submit} style={{ ...cardStyle, background: 'rgba(255,255,255,.72)', border: '1px solid rgba(198,163,116,.28)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama kamu" style={fieldStyle} />

          <div className="flex" style={{ gap: 8 }}>
            {[['hadir', 'Hadir'], ['tidak_hadir', 'Berhalangan']].map(([val, label]) => {
              const on = attendance === val
              return (
                <button key={val} type="button" onClick={() => setAttendance(val)} style={{
                  flex: 1, textAlign: 'center', cursor: 'pointer', padding: '12px 0', borderRadius: 999,
                  fontFamily: 'var(--me-mono)', fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase',
                  border: `1px solid ${on ? 'var(--me-rose-deep)' : 'rgba(198,163,116,.4)'}`,
                  background: on ? 'var(--me-blush)' : 'transparent',
                  color: on ? 'var(--me-rose-deep)' : 'var(--me-ink-soft)',
                  transition: 'all var(--me-dur) var(--me-ease)',
                }}>{label}</button>
              )
            })}
          </div>

          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
            placeholder="Tulis ucapan &amp; doa" style={{ ...fieldStyle, resize: 'none' }} />

          <button type="submit" disabled={!canSend} style={{
            cursor: canSend ? 'pointer' : 'not-allowed', textAlign: 'center', padding: 14,
            borderRadius: 999, border: 'none', background: 'var(--me-rose-deep)', color: '#FFF6F4',
            fontFamily: 'var(--me-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase',
            opacity: canSend ? 1 : 0.55,
          }}>{busy ? 'Mengirim…' : sent ? 'Terkirim' : 'Kirim'}</button>
        </form>

        {/* Gulir internal, bukan babak yang memanjang tanpa ujung: daftar ini
            bisa berisi puluhan ucapan dan akan menelan seluruh deck. */}
        <div style={{ maxHeight: 230, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 2 }}>
          {list.map((w, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,.55)', borderLeft: '1px solid var(--me-blush)',
              borderRadius: '0 var(--me-r-input) var(--me-r-input) 0', padding: '12px 14px',
            }}>
              <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--me-display)', fontSize: 16, color: 'var(--me-ink)' }}>{w?.name}</span>
                {w?.time && <span style={{ fontFamily: 'var(--me-mono)', fontSize: 8.5, letterSpacing: '.1em', color: 'var(--me-ink-soft)' }}>{w.time}</span>}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--me-ink-soft)', marginTop: 5, textWrap: 'pretty' }}>{w?.wish}</div>
              <div style={{ fontFamily: 'var(--me-mono)', fontSize: 8.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--me-gold)', marginTop: 7 }}>
                {w?.rsvp === 'tidak_hadir' ? 'Berhalangan' : 'Hadir'}
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <div style={{ textAlign: 'center', fontSize: 13.5, fontStyle: 'italic', color: 'var(--me-ink-soft)', padding: '10px 0' }}>
              Jadi yang pertama mengirim ucapan.
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

const Penutup = ({ data, groomNick, brideNick, onHome }) => (
  <ScreenFull id="me-penutup" pad="86px 30px 116px">
    <div style={{ margin: 'auto 0', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 26 }}>
        <Portrait src={data?.meta?.footerPhoto} alt="" initial={initialOf(groomNick)}
          w={132} h={172} radius="80px 80px 14px 14px" />
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--me-ink-soft)', margin: 0, textWrap: 'pretty' }}>
        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara berkenan hadir
        untuk memberikan doa restu.
      </p>
      <Rule style={{ margin: '24px auto' }} />
      <div style={{ fontFamily: 'var(--me-display)', fontSize: 30, color: 'var(--me-ink)' }}>
        {groomNick} &amp; {brideNick}
      </div>
      <button onClick={onHome} className="me-outline" style={{ marginTop: 30, padding: '11px 22px' }}>
        Kembali ke awal
      </button>
    </div>
  </ScreenFull>
)

// ═══════════════════════════════════════════════════════════════════
//  COVER
// ═══════════════════════════════════════════════════════════════════

const Cover = ({ data, groomNick, brideNick, dateLabel, guestName, onOpen, animateClose }) => (
  <div style={{
    position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
    width: 'var(--inv-w)', height: 'var(--inv-h)', zIndex: 12,
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    padding: '64px 30px', boxSizing: 'border-box', overflow: 'hidden', background: 'var(--me-ivory)',
    animation: animateClose ? 'me-cover-out 780ms var(--me-ease) forwards' : 'me-in 500ms var(--me-ease) both',
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: data?.meta?.coverPhoto
        ? `center/cover no-repeat url('${data.meta.coverPhoto}')`
        : `center/cover no-repeat url('${A.poster}')`,
    }} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(156,96,104,.34) 0%, rgba(251,247,244,.72) 62%, var(--me-ivory) 100%)' }} />

    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, overflow: 'hidden' }}>
      <div className="me-shimmer" style={{
        width: '40%', height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(198,163,116,.8), transparent)',
        animation: 'me-shimmer 4.5s var(--me-ease) infinite',
      }} />
    </div>

    <div className="me-rise" style={{ position: 'relative', zIndex: 1, margin: 'auto 0', textAlign: 'center' }}>
      <Cap style={{ letterSpacing: '.32em' }}>Undangan Pernikahan</Cap>
      <Rule w={40} style={{ margin: '18px auto 24px' }} />
      <div style={{ fontFamily: 'var(--me-display)', fontSize: 42, lineHeight: 1.08, color: 'var(--me-ink)' }}>{groomNick}</div>
      <div style={{ fontStyle: 'italic', fontSize: 18, color: 'var(--me-rose)', margin: '4px 0' }}>&amp;</div>
      <div style={{ fontFamily: 'var(--me-display)', fontSize: 42, lineHeight: 1.08, color: 'var(--me-ink)' }}>{brideNick}</div>
      {dateLabel && <div style={{ marginTop: 22, fontSize: 14, letterSpacing: '.08em', color: 'var(--me-ink-soft)' }}>{dateLabel}</div>}
      {guestName && (
        <>
          <div style={{ marginTop: 34, fontSize: 12.5, color: 'var(--me-ink-soft)' }}>Kepada Yth.</div>
          <div style={{ fontFamily: 'var(--me-display)', fontSize: 23, color: 'var(--me-ink)', marginTop: 3 }}>{guestName}</div>
        </>
      )}
      <button onClick={onOpen} style={{
        marginTop: 34, cursor: 'pointer', padding: '15px 34px', borderRadius: 999, border: 'none',
        background: 'var(--me-rose-deep)', color: '#FFF6F4',
        fontFamily: 'var(--me-mono)', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase',
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
        background: i <= active ? 'var(--me-gold)' : 'rgba(198,163,116,.26)',
        transition: 'background var(--me-dur) var(--me-ease)',
      }} />
    ))}
  </div>
)

const NAV_IDS = ['me-home', 'me-mempelai', 'me-acara', 'me-galeri', 'me-rsvp']

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
              fontFamily: 'var(--me-mono)', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
              color: on ? '#FFF6F4' : 'var(--me-ink-soft)',
              background: on ? 'var(--me-rose-deep)' : 'transparent',
              transition: 'all var(--me-dur) var(--me-ease)',
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
        background: musicPlaying ? 'var(--me-rose-deep)' : 'var(--me-ink-soft)',
        transformOrigin: 'bottom',
        transform: musicPlaying ? undefined : 'scaleY(.35)',
        animation: musicPlaying ? `me-eq ${0.62 + i * 0.15}s ease-in-out infinite` : 'none',
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
  const [active, setActive] = useState(0)
  const [coverGone, setCoverGone] = useState(false)
  const [petals] = useState(seedPetals)

  // Videonya baru dipasang setelah undangan dibuka: sebelum itu yang tampil
  // poster 149 KB, bukan loop 2 MB.
  const [stageOn, setStageOn] = useState(false)

  // Dibaca lewat lazy initializer, bukan saat render: membaca matchMedia di
  // badan komponen adalah pembacaan tak-murni yang dilarang react-hooks/purity.
  const [reduceMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
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
    (data?.accounts || []).length > 0 || giftAddrOf(data) ||
    (data?.turutMengundangEnabled === true && (data?.families || []).some(f => (f?.members || []).some(Boolean)))
  )

  // Daftar babak yang benar-benar tampil. Bilah progres dan pil navigasi
  // dibangun dari daftar yang sama, jadi keduanya tidak pernah menunjuk ke
  // babak yang tidak ada.
  const chapters = [
    ['me-home', 'Home', true],
    ['me-quote', 'Quote', hasQuote],
    ['me-mempelai', 'Mempelai', hasMempelai],
    ['me-acara', 'Acara', events.length > 0],
    ['me-story', 'Story', loveStory.length > 0],
    ['me-galeri', 'Galeri', gallery.length > 0],
    ['me-info', 'Info', hasInfo],
    ['me-rsvp', 'RSVP', true],
    ['me-penutup', 'Penutup', true],
  ].filter(x => x[2]).map(x => [x[0], x[1]])

  const activeId = chapters[active]?.[0]

  // scrollIntoView, bukan window.scrollTo: yang menggulir di sini deck milik
  // tema, dan window tidak pernah punya scroll untuk digeser.
  const go = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Babak aktif dilacak lewat IntersectionObserver, bukan lewat scrollTop.
  // Yang menggulir sekarang div milik shell, bukan elemen milik tema, dan
  // membaca scrollTop dari elemen yang bukan miliknya adalah cara yang rapuh.
  // IntersectionObserver tidak peduli siapa yang menggulir — ia melaporkan
  // apa yang benar-benar terlihat, termasuk lewat kliping induk.
  const chapterKey = chapters.map(ch => ch[0]).join(',')
  useEffect(() => {
    const ids = chapterKey.split(',')
    const els = ids.map(id => document.getElementById(id)).filter(Boolean)
    if (!els.length) return
    // rootMargin -50%/-50% meruntuhkan layar jadi satu garis di tengahnya,
    // sehingga persis satu bagian yang pernah berpotongan: yang benar-benar
    // sedang dibaca. Pola yang sama dipakai Velour Olive.
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        const i = ids.indexOf(e.target.id)
        if (i >= 0) setActive(i)
      })
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [chapterKey])

  // Cover dilepas lewat state sendiri, bukan digantung pada !opened: kalau
  // digantung, ia lepas di commit yang sama dengan setOpened dan animasi
  // keluarnya tidak pernah sempat berjalan.
  const handleOpen = () => {
    setAnimateClose?.(true)
    setOpened?.(true)
    setStageOn(true)
    if (musicEnabled) setMusicPlaying?.(true)
    setTimeout(() => setCoverGone(true), 820)
  }


  return (
    <InvitationLayout layout={THEMES.MEMORIES} data={data}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Italiana&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=IBM+Plex+Mono:wght@400&display=swap');

        .me-root {
          --me-ivory: #FBF7F4;
          --me-blush: #F7E4E3;
          --me-rose: #D9A0A4;
          --me-rose-deep: #9C6068;
          --me-gold: #C6A374;
          --me-ink: #4B3A3C;
          /* Digelapkan dari #836F71 milik prototipe. Warna itu sudah hanya
             mencapai kontras 4,40 di atas ivory polos — di bawah ambang AA
             sebelum ada video sama sekali — dan di atas panggung bertabir ia
             turun ke 3,8. #645154 mencetak 4,91 di pita tergelap dan 6,28 di
             atas kartu, dan tetap terbaca lebih ringan dari --me-ink. */
          --me-ink-soft: #645154;

          --me-display: 'Italiana', serif;
          --me-body: 'Cormorant Garamond', serif;
          --me-mono: 'IBM Plex Mono', monospace;
          --me-fs-display: 46px;
          --me-fs-h2: 21px;
          --me-fs-body: 15.5px;
          --me-fs-cap: 10.5px;

          --me-r-card: 20px;
          --me-r-input: 12px;

          --me-dur: 520ms;
          --me-dur-slow: 900ms;
          --me-ease: cubic-bezier(.22,.61,.36,1);
        }

        .me-outline {
          border-radius: 999px;
          border: 1px solid var(--me-rose);
          /* Bukan transparan. Sebagian besar tombol ini duduk di atas kartu,
             tapi "Kembali ke awal" di penutup berdiri langsung di atas
             panggung, dan rose-deep di sana hanya 3,9 — kurang untuk teks
             sekecil 9,5px. Isi tipis ini mengangkatnya tanpa mengubah bentuk. */
          background: rgba(255,255,255,.55);
          color: var(--me-rose-deep);
          font-family: var(--me-mono);
          font-size: 9.5px;
          letter-spacing: .14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background var(--me-dur) var(--me-ease);
        }
        .me-outline:hover { background: var(--me-blush); }

        .me-stage-video { animation: me-in 900ms var(--me-ease) both; }

        .me-root button:focus-visible,
        .me-root a:focus-visible,
        .me-root input:focus-visible,
        .me-root textarea:focus-visible {
          outline: 2px solid var(--me-rose-deep);
          outline-offset: 2px;
        }

        @keyframes me-up { from { opacity: 0; transform: translate3d(0, 16px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
        @keyframes me-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes me-cover-out { to { opacity: 0; transform: translate3d(0, -4%, 0); } }
        @keyframes me-shimmer { 0% { transform: translate3d(-60%, 0, 0); } 100% { transform: translate3d(160%, 0, 0); } }
        @keyframes me-breathe { 0%, 100% { opacity: .55; } 50% { opacity: .9; } }
        @keyframes me-eq { 0%, 100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
        @keyframes me-fall {
          0%   { transform: translate3d(0, -10%, 0) rotate(0deg); }
          100% { transform: translate3d(26px, calc(var(--inv-h) + 60px), 0) rotate(260deg); }
        }
        .me-rise { animation: me-up var(--me-dur-slow) var(--me-ease) both; }

        /* Tamu yang meminta gerak dikurangi tetap mendapat halaman yang utuh:
           tidak ada satu pun gaya dasar di tema ini yang dimulai dari
           opacity 0, jadi mematikan animasinya tidak menyembunyikan apa pun. */
        @media (prefers-reduced-motion: reduce) {
          .me-root *, .me-root *::before, .me-root *::after {
            animation: none !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>

      <div className="me-root relative w-full flex flex-col" style={{
        minHeight: 'var(--inv-h)',
        fontFamily: 'var(--me-body)', color: 'var(--me-ink)', background: 'var(--me-ivory)',
      }}>
        {musicEnabled && (
          <audio ref={audioRef} src={data?.musicUrl || MUSIC_URLS[data?.musicId || 1] || MUSIC_URLS[1]} loop />
        )}

        <Panggung petals={petals} stageOn={stageOn} still={reduceMotion} />

        <Progress chapters={chapters} active={active} visible={opened} go={go} />

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

        <Penutup data={data} groomNick={groomNick} brideNick={brideNick} onHome={() => go('me-home')} />

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
