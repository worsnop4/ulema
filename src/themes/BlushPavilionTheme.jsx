import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import InvitationLayout from './components/InvitationLayout'
import { MUSIC_URLS } from '../pages/InvitationTemplate'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { THEMES } from '../config/constants'

// ═══════════════════════════════════════════════════════════════════
//  BLUSH PAVILION — kategori Motion (MOT-001)
//
//  Menggantikan Senja Diorama sepenuhnya, memakai slot id 22 yang sama.
//  Senja dibangun dari bentuk SVG tanpa satu pun aset, dan justru itu yang
//  membuatnya tidak pernah terasa "Motion". Tidak ada undangan yang memakai
//  id 22 saat penggantian ini dibuat, jadi tidak ada yang perlu dimigrasikan.
//
//  Taman pastel: paviliun mawar dengan air mancur, lampu kristal, dan tirai
//  yang menggantung. Undangan dibuka pada aula gelap berlampu kristal, lalu
//  seluruh layar mekar jadi taman.
//
//  Tiga babak, semuanya 810x1440:
//    poster.jpg  latar sebelum dibuka — karya tersendiri, bukan frame video
//    intro.mp4   5,7 dtk, diputar sekali saat dibuka
//    loop.mp4    3,7 dtk ping-pong, berputar terus sesudahnya
//
//  INTRO BERHENTI DI 5,7 DETIK, BUKAN 6. Mulai sekitar detik 6 video ini
//  memunculkan tulisannya sendiri — "The Wedding of" lengkap dengan nama di
//  bawahnya — yang pada detik 8 sudah terbaca jelas. Dijadikan latar, tulisan
//  itu akan bertabrakan langsung dengan kartu mempelai undangan ini.
//
//  LOOP-NYA PING-PONG, seperti Rose Sanctuary dan karena alasan yang sama:
//  adegan ini tidak pernah diam. Dua frame BERSEBELAHAN di rentang ini hanya
//  mirip 22,3 dB, jadi potongan mana pun yang disambung akan menyentak.
//  Mundur 5,7→3,8 lalu maju lagi adalah satu-satunya konstruksi yang bermula
//  dan berakhir di frame yang sama dengan ujung intro. Terukur: sambungan
//  intro 35,0 dB, titik putaran 29,1 dB, titik balik 22,5 dB — ketiganya
//  sama baik atau lebih baik daripada laju gerak alami rekamannya sendiri.
//
//  Rentang ping-pongnya sengaja 1,9 detik, bukan lebih lebar. Adegannya
//  menerang terus (luminansi 152 di detik 3 sampai 224 di detik 5,7), jadi
//  ayunan yang lebih lebar akan terbaca sebagai denyut terang-gelap alih-alih
//  napas.
// ═══════════════════════════════════════════════════════════════════

const A = {
  poster: '/themes/Motion/theme-4/poster.jpg',
  intro:  '/themes/Motion/theme-4/intro.mp4',
  loop:   '/themes/Motion/theme-4/loop.mp4',
}

// Detik ke berapa kartu "The Wedding Of" terbit. Pada detik 4,5 tamannya
// sudah utuh dan kameranya tinggal menghela napas.
const HERO_AT = 4.5

// ─── PALET ───────────────────────────────────────────────────────
// Diambil dari posternya lewat palettegen: blush #BB958C / #CEABA1 / #DDBFB5,
// krem #EEE3DA, dan langit-sage #B9C9CA. Warna sejuk itulah yang membedakan
// tema ini dari Rose Sanctuary yang seluruhnya hangat.
//
// Kontras terukur (di kartu / video-median / video-tergelap):
//   ink      11,52 / 5,96 / 3,00  → aman di kartu, dan cukup besar di video
//   roseDeep  7,45 / 3,86 / 1,94  → judul dan label, di atas kartu/kabut
//   muted     6,09 / 3,15 / 1,59  → teks sekunder, hanya di kartu
//   skyDeep   4,94 / 2,56 / 1,29  → aksen sejuk, hanya di kartu
//   rose      3,97 / 2,05 / 1,04  → hanya ukuran besar
//   sky       1,71                → ornamen saja, tidak pernah teks
// Aturan yang lahir dari angka itu: teks kecil tidak pernah berdiri langsung
// di atas video, dan label di atas kabut memakai roseDeep (6,68) bukan
// skyDeep (4,43, di bawah ambang).
const c = {
  paper:    '#FBF6F2',
  blush:    '#E8D2C9',
  sky:      '#A9C4CB',
  skyDeep:  '#4E7178',
  rose:     '#A96A63',
  roseDeep: '#7A403C',
  ink:      '#3E322D',
  muted:    '#6B5A53',
  faint:    'rgba(62,50,45,.55)',
}

const F = {
  display: "'Prata', serif",
  script:  "'Sacramento', cursive",
  sans:    "'Questrial', sans-serif",
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
const pad2 = (n) => String(n ?? 0).padStart(2, '0')

// AcaraForm membiarkan pasangan menambah sesi sebanyak yang mereka mau, dan
// kolom namanya boleh dikosongkan.
const eventTitle = (ev, i) => ev?.name || ['Akad Nikah', 'Resepsi'][i] || `Acara ${i + 1}`

// ═══════════════════════════════════════════════════════════════════
//  PANGGUNG — latar taman
// ═══════════════════════════════════════════════════════════════════

// Fixed dan dijangkarkan ke kolom undangan, bukan sticky: sticky di dalam
// scroller ini sudah gagal dua kali dengan cara yang sama, bertahan beberapa
// bagian lalu lepas di tengah jalan.
const Panggung = ({ phase, introRef, loopRef, introMounted, still }) => (
  <div className="fixed pointer-events-none" style={{
    top: 0, left: '50%', transform: 'translateX(-50%)',
    width: 'var(--inv-w)', height: 'var(--inv-h)', zIndex: 0,
  }}>
    <div className="absolute inset-0 overflow-hidden" style={{ background: c.blush }}>

      {/* Poster ini karya tersendiri, bukan frame dari videonya. Ia taman
          yang terang benderang, sementara video ini justru MULAI dari aula
          gelap berlampu kristal — terukur hanya 9,1 dB satu sama lain, jarak
          terjauh di antara semua tema Motion.

          Maka larutnya dibuat panjang, 1,6 detik. Perlahan begitu, turunnya
          cahaya terbaca sebagai lampu yang diredupkan sebelum pertunjukan —
          sesuatu yang disengaja. Dengan larut cepat, layar yang mendadak
          gelap hanya akan terbaca sebagai kedip atau gambar yang gagal
          dimuat. */}
      <img src={A.poster} alt="" className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'cover' }} />

      {!still && (
        <>
          {/* Tanpa atribut poster pada kedua video: atribut itu memasang
              gambar diam sampai frame pertama ter-decode, dan karena poster
              di sini bukan frame pertama video, hasilnya dua pergantian
              beruntun alih-alih satu. Gambar diamnya sudah dipegang <img>
              di belakang keduanya.

              Unduhan loop ditunda sampai intro berjalan — membuka halaman
              seharusnya hanya menarik poster 210KB. */}
          <video ref={loopRef} muted loop playsInline
            preload={phase === 'poster' ? 'none' : 'auto'}
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: 'cover', opacity: phase === 'loop' ? 1 : 0, transition: 'opacity .5s ease' }}>
            <source src={A.loop} type="video/mp4" />
          </video>

          {introMounted && (
            <video ref={introRef} muted playsInline preload="auto"
              className="absolute inset-0 w-full h-full"
              style={{ objectFit: 'cover', opacity: phase === 'intro' ? 1 : 0, transition: 'opacity 1.6s ease' }}>
              <source src={A.intro} type="video/mp4" />
            </video>
          )}
        </>
      )}

      {/* Rekamannya sudah membingkai dirinya sendiri dengan tirai dan bunga;
          ini hanya menegaskan tepi atas-bawah supaya kartu terbaca sebagai
          benda yang berdiri di depannya. */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(180deg, rgba(62,50,45,.18) 0%, rgba(62,50,45,0) 26%, rgba(62,50,45,0) 76%, rgba(62,50,45,.22) 100%)`,
      }} />
    </div>
  </div>
)

// ═══════════════════════════════════════════════════════════════════
//  PRIMITIF
// ═══════════════════════════════════════════════════════════════════

// Tepi bergigi paviliun taman — tiga lengkung kecil dengan tetes air di
// tengahnya. Sengaja bukan lengkung Romawi Gilded Palace maupun kubah bawang
// Rose Sanctuary: tiga tema Motion ini tidak boleh terbaca sebagai satu
// tema yang diwarnai ulang.
const Scallop = ({ w = 54, style = {} }) => (
  <svg viewBox="0 0 54 20" width={w} height={w * 20 / 54} fill="none" style={style}>
    <path d="M2 16 C2 9, 8 9, 11 16 C11 9, 17 9, 20 16" stroke={c.sky} strokeWidth="1.1" strokeLinecap="round" />
    <path d="M34 16 C34 9, 40 9, 43 16 C43 9, 49 9, 52 16" stroke={c.sky} strokeWidth="1.1" strokeLinecap="round" />
    <circle cx="27" cy="10" r="3.2" stroke={c.rose} strokeWidth="1.1" />
    <path d="M27 13.5 L27 18" stroke={c.rose} strokeWidth="1.1" strokeLinecap="round" />
  </svg>
)

const Kicker = ({ children, style = {} }) => (
  <p className="uppercase" style={{ margin: 0, fontFamily: F.sans, fontSize: 10, letterSpacing: '.34em', color: c.roseDeep, ...style }}>{children}</p>
)

const Title = ({ children, style = {} }) => (
  <h2 style={{ margin: '10px 0 0', fontFamily: F.display, fontSize: 27, lineHeight: 1.28, color: c.ink, textWrap: 'balance', ...style }}>{children}</h2>
)

// Garis rambut dengan tetes di tengah, mengulang motif air mancur.
const Rule = ({ width = 72, style = {} }) => (
  <div className="flex items-center justify-center" style={{ width, gap: 7, ...style }}>
    <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${c.sky})` }} />
    <span style={{ width: 4, height: 4, borderRadius: '50%', background: c.rose }} />
    <span style={{ flex: 1, height: 1, background: `linear-gradient(270deg, transparent, ${c.sky})` }} />
  </div>
)

const Section = ({ id, children, style = {} }) => (
  <section id={id} className="relative" style={{ zIndex: 1, padding: '82px 24px', ...style }}>
    {children}
  </section>
)

const Reveal = ({ children, delay = 0, y = 20, className = '', style = {} }) => (
  <motion.div className={className} style={style}
    initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.8, delay, ease: [0.2, 0.7, 0.2, 1] }}>
    {children}
  </motion.div>
)

// Alpha 0,92 menjaga angka kontras di kepala berkas ini tetap berlaku. Latar
// tema ini punya bagian yang lebih gelap daripada dua tema Motion lain
// (luminansi terendah 125, bukan 150), jadi kartunya sedikit lebih pekat.
const cardStyle = {
  borderRadius: 16, padding: 22,
  background: 'rgba(251,246,242,.92)',
  border: `1px solid rgba(169,196,203,.6)`,
  backdropFilter: 'blur(8px) saturate(1.05)',
  WebkitBackdropFilter: 'blur(8px) saturate(1.05)',
  boxShadow: '0 14px 34px rgba(62,50,45,.16)',
}

// Kabut kertas di belakang kepala bagian, yang berdiri langsung di atas
// video. Alpha 0,9 menaikkan label dari 1,94:1 ke 6,68:1 di frame tergelap.
const haloStyle = {
  padding: '16px 22px 20px',
  background: 'radial-gradient(ellipse at center, rgba(251,246,242,.9) 0%, rgba(251,246,242,.82) 54%, rgba(251,246,242,0) 80%)',
}

// Potret bundar penuh — medali taman. Bentuk inilah penanda tema ini, dipakai
// di sampul, hero, mempelai, kisah, dan galeri.
const Medallion = ({ src, alt = '', w = 168, pan = true, ring = true, style = {} }) => (
  <div className="relative overflow-hidden" style={{
    width: w, height: w, borderRadius: '50%',
    border: ring ? `1px solid rgba(169,196,203,.9)` : 'none',
    boxShadow: '0 14px 30px rgba(62,50,45,.2), inset 0 0 0 5px rgba(251,246,242,.7)',
    background: c.blush, ...style,
  }}>
    {src
      ? <img src={src} alt={alt} className="absolute object-cover bp-pan"
          style={{ width: '114%', height: '114%', left: '-7%', top: '-7%', maxWidth: 'none', animation: pan ? 'bp-pan 26s ease-in-out infinite alternate' : 'none' }} />
      : <span className="absolute inset-0 flex items-center justify-center" style={{ fontFamily: F.sans, fontSize: 11, color: c.faint }}>Foto</span>}
  </div>
)

const SectionHead = ({ kicker, title, children }) => (
  <Reveal className="flex flex-col items-center text-center" style={{ marginBottom: 26, ...haloStyle }}>
    <Scallop style={{ marginBottom: 12 }} />
    {kicker && <Kicker>{kicker}</Kicker>}
    <Title>{title}</Title>
    <Rule style={{ marginTop: 14 }} />
    {children}
  </Reveal>
)

// ─── 1. COVER ────────────────────────────────────────────────────
// Fixed dan dijangkarkan ke kolom, bukan absolute inset-0: begitu tombol
// ditekan isi undangan ikut ter-mount dan tinggi akar melonjak, lalu cover
// absolute ikut memanjang dan isinya yang ter-center melompat jauh ke bawah.
const Cover = ({ data, groomNick, brideNick, heroDate, guestName, handleOpen, animateClose }) => {
  const coverPhoto = data?.meta?.coverPhoto || data?.meta?.photo || data?.bride?.photo || data?.groom?.photo || null
  return (
    <div className="fixed" style={{
      top: 0, left: '50%', transform: 'translateX(-50%)',
      width: 'var(--inv-w)', height: 'var(--inv-h)', zIndex: 80,
      pointerEvents: animateClose ? 'none' : 'auto',
    }}>
      <motion.div className="relative w-full h-full flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ padding: '48px 28px' }}
        animate={animateClose ? { opacity: 0, scale: 1.03 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}>

        <img src={A.poster} alt="" className="absolute inset-0 w-full h-full" style={{ objectFit: 'cover' }} />
        <div className="absolute inset-0" style={{
          background: `linear-gradient(180deg, rgba(62,50,45,.20) 0%, rgba(62,50,45,.04) 38%, rgba(62,50,45,.24) 100%)`,
        }} />

        {/* Satu kartu digantung di depan taman. Pusat taman ini terang
            (luminansi median 180), jadi tulisan terang di atasnya tidak akan
            terbaca, sementara menggelapkan latarnya berarti memadamkan
            gambar yang justru dibeli tamu. */}
        <motion.div className="relative flex flex-col items-center"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.9 }}>

          <Medallion src={coverPhoto} w={150} style={{ marginBottom: -46, zIndex: 1 }} />

          <div style={{ ...cardStyle, padding: '58px 26px 24px', width: 'min(324px, 100%)' }}>
            <div className="flex flex-col items-center text-center">
              <Kicker style={{ fontSize: 9, letterSpacing: '.3em' }}>The Wedding Of</Kicker>

              <h1 style={{ margin: '8px 0 0', fontFamily: F.script, fontSize: 48, lineHeight: 1.1, color: c.roseDeep }}>
                {groomNick} &amp; {brideNick}
              </h1>
              <Rule style={{ margin: '12px 0' }} />
              <p style={{ margin: 0, fontFamily: F.display, fontSize: 13, letterSpacing: '.12em', color: c.skyDeep }}>
                {heroDate}
              </p>

              <div style={{
                marginTop: 18, padding: '13px 22px', borderRadius: 12, alignSelf: 'stretch',
                background: 'rgba(232,210,201,.6)', border: `1px solid rgba(169,196,203,.55)`,
              }}>
                <Kicker style={{ fontSize: 8.5, letterSpacing: '.26em', color: c.faint }}>Kepada Yth.</Kicker>
                <p style={{ margin: '6px 0 0', fontFamily: F.display, fontSize: 17, color: c.ink }}>{guestName}</p>
              </div>

              <motion.button onClick={handleOpen} whileTap={{ scale: 0.96 }}
                style={{
                  marginTop: 18, alignSelf: 'stretch', padding: '14px 32px', borderRadius: 999,
                  border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${c.roseDeep}, ${c.rose})`,
                  color: c.paper,
                  fontFamily: F.sans, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase',
                  boxShadow: '0 12px 26px rgba(122,64,60,.32)',
                }}>
                Buka Undangan
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─── 2. HERO ─────────────────────────────────────────────────────
// Muncul di detik 4,5 video, bukan begitu undangan dibuka: sebelum itu
// tamannya masih mekar dari aula gelap, dan menaruh kartu di atasnya berarti
// menutupi satu-satunya bagian yang bergerak.
const Hero = ({ data, groomNick, brideNick, heroDate, countdown, countdownEnabled, ready }) => {
  const parts = [['Hari', countdown?.d], ['Jam', countdown?.h], ['Menit', countdown?.m], ['Detik', countdown?.s]]
  const heroPhoto = data?.meta?.photo || data?.meta?.coverPhoto || data?.groom?.photo || data?.bride?.photo || null
  // justify-center, bukan justify-end. Dengan justify-end seluruh isi menempel
  // ke dasar layar dan sepertiga atas dibiarkan kosong, padahal di situlah
  // paviliun dan lampu kristalnya berada. Sekarang foto dan kartu ditimbang
  // sebagai satu kelompok di tengah, sehingga fotonya naik mengisi ruang itu.
  return (
    <section id="bp-home" className="relative flex flex-col items-center justify-center text-center"
      style={{ zIndex: 1, minHeight: 'var(--inv-h)', boxSizing: 'border-box', padding: '80px 24px 96px' }}>
      <motion.div className="flex flex-col items-center"
        initial={{ opacity: 0, y: 18 }}
        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
        style={{ pointerEvents: ready ? 'auto' : 'none' }}>

        {/* Berdiri sendiri di atas kartu, tidak lagi menumpanginya. Bingkainya
            cincin ganda: garis rambut di luar, sela kertas, lalu tepi
            medalinya sendiri — jadi ia terbaca sebagai potret berbingkai,
            bukan foto yang ditempel ke kartu. */}
        {heroPhoto && (
          <div style={{
            marginBottom: 26, padding: 8, borderRadius: '50%',
            border: `1px solid rgba(169,196,203,.9)`,
            background: 'rgba(251,246,242,.55)',
            backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)',
            boxShadow: '0 16px 34px rgba(62,50,45,.2)',
          }}>
            <Medallion src={heroPhoto} w={178} />
          </div>
        )}

        <div style={{ ...cardStyle, padding: '24px 22px 22px', width: 'min(332px, 100%)' }}>
          <div className="flex flex-col items-center">
            <Kicker>The Wedding Of</Kicker>
            <h1 style={{ margin: '8px 0 0', fontFamily: F.script, fontSize: 52, lineHeight: 1.1, color: c.roseDeep }}>
              {groomNick} &amp; {brideNick}
            </h1>
            <Rule style={{ margin: '12px 0' }} />
            <p style={{ margin: 0, fontFamily: F.display, fontSize: 13.5, letterSpacing: '.11em', color: c.skyDeep }}>{heroDate}</p>
          </div>

          {countdownEnabled && (
            <div className="grid grid-cols-4" style={{ gap: 7, marginTop: 18 }}>
              {parts.map(([label, val]) => (
                <div key={label} style={{
                  borderRadius: 999, padding: '13px 3px 11px',
                  background: 'rgba(232,210,201,.6)', border: `1px solid rgba(169,196,203,.5)`,
                }}>
                  <div style={{ fontFamily: F.display, fontSize: 21, lineHeight: 1, color: c.roseDeep, fontVariantNumeric: 'tabular-nums' }}>{pad2(val)}</div>
                  <div className="uppercase" style={{ marginTop: 5, fontFamily: F.sans, fontSize: 8, letterSpacing: '.14em', color: c.skyDeep }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  )
}

// ─── 3. QUOTE / DOA ──────────────────────────────────────────────
const Quote = ({ data }) => {
  const quote = data?.quote
  if (!quote) return null
  return (
    <Section id="bp-quote">
      <Reveal className="flex flex-col items-center text-center" style={cardStyle}>
        <Scallop w={44} style={{ marginBottom: 14 }} />
        <p style={{
          margin: 0, fontFamily: F.display, fontSize: 16.5, lineHeight: 2,
          color: c.ink, textWrap: 'pretty', maxWidth: 310,
        }}>{quote}</p>
        <Rule width={52} style={{ marginTop: 16 }} />
      </Reveal>
    </Section>
  )
}

// ─── 4. MEMPELAI ─────────────────────────────────────────────────
// Kedua mempelai berbagi SATU kartu, berdampingan dengan pemisah di
// tengahnya — bukan dua kartu bertumpuk (Gilded Palace) dan bukan potret
// berselang sisi (Rose Sanctuary). Bentuknya sendiri yang bercerita: mereka
// satu halaman, bukan dua.
//
// Nama ayah dan ibu diletakkan di paruh masing-masing dan dibiarkan
// membungkus; di lebar 390px tiap paruh sekitar 150px, jadi nama panjang
// memang akan turun ke baris berikutnya, dan itu wajar untuk daftar nama.
const Half = ({ person, label }) => (
  <div className="flex flex-col items-center text-center" style={{ flex: 1, minWidth: 0 }}>
    <Medallion src={person?.photo} alt={person?.nickname || ''} w={118} pan={false} />
    <p className="uppercase" style={{ margin: '12px 0 0', fontFamily: F.sans, fontSize: 8.5, letterSpacing: '.26em', color: c.skyDeep }}>{label}</p>
    <h3 style={{ margin: '5px 0 0', fontFamily: F.script, fontSize: 32, lineHeight: 1.05, color: c.roseDeep }}>
      {person?.nickname || '—'}
    </h3>
    <p style={{ margin: '3px 0 0', fontFamily: F.display, fontSize: 13.5, lineHeight: 1.35, color: c.ink }}>
      {person?.name || person?.nickname || '—'}
    </p>
    <p style={{ margin: '9px 0 0', fontFamily: F.sans, fontSize: 11.5, lineHeight: 1.65, color: c.muted }}>
      {person?.father || '—'}<br />&amp; {person?.mother || '—'}
    </p>
    {person?.instagram && (
      <a href={`https://instagram.com/${person.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
        style={{ marginTop: 8, fontFamily: F.sans, fontSize: 11, color: c.rose }}>
        @{person.instagram.replace('@', '')}
      </a>
    )}
  </div>
)

const Mempelai = ({ data }) => (
  <Section id="bp-mempelai">
    <SectionHead kicker="Assalamualaikum Wr. Wb." title="Mempelai">
      <p style={{ margin: '14px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.85, color: c.muted, maxWidth: 300 }}>
        Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.
      </p>
    </SectionHead>

    <Reveal style={{ ...cardStyle, padding: '22px 14px' }}>
      <div className="flex items-start" style={{ gap: 6 }}>
        <Half person={data?.groom} label="Mempelai Pria" />

        {/* Pemisah dengan "&" di tengahnya: satu-satunya bagian kartu ini
            yang tidak sejajar, jadi ia jatuh tepat di titik pandang. */}
        <div className="flex flex-col items-center self-stretch" style={{ paddingTop: 44, gap: 8 }}>
          <span style={{ flex: 1, width: 1, background: `linear-gradient(180deg, transparent, ${c.sky})`, minHeight: 14 }} />
          <span style={{ fontFamily: F.script, fontSize: 30, lineHeight: 1, color: c.rose }}>&amp;</span>
          <span style={{ flex: 1, width: 1, background: `linear-gradient(0deg, transparent, ${c.sky})`, minHeight: 14 }} />
        </div>

        <Half person={data?.bride} label="Mempelai Wanita" />
      </div>
    </Reveal>
  </Section>
)

// ─── 5. ACARA ────────────────────────────────────────────────────
// Nama field mengikuti modul editor, bukan src/types/invitation.js:
// name / date / dateLabel / start / end / tz / venue / address / maps.
// Seluruh data.events di-map; tidak ada indeks yang dipasang mati.
//
// Kartunya berkepala pita bergigi — bentuk atap paviliun di rekamannya —
// dengan nama acara di dalam pita itu, bukan judul tengah biasa.
const EventCard = ({ ev, i, delay }) => {
  if (!ev) return null
  const dateLabel = ev.dateLabel || fmtDate(ev.date)
  const hours = [ev.start, ev.end].filter(Boolean).join(' – ')
  return (
    <Reveal delay={delay} style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
      <div className="text-center" style={{
        padding: '13px 16px',
        background: `linear-gradient(180deg, rgba(169,196,203,.42), rgba(232,210,201,.5))`,
        borderBottom: `1px solid rgba(169,196,203,.6)`,
      }}>
        <p className="uppercase" style={{ margin: 0, fontFamily: F.sans, fontSize: 10.5, letterSpacing: '.28em', color: c.roseDeep }}>
          {eventTitle(ev, i)}
        </p>
      </div>

      <div className="text-center" style={{ padding: '20px 18px 22px' }}>
        {dateLabel && (
          <p style={{ margin: 0, fontFamily: F.display, fontSize: 18.5, lineHeight: 1.35, color: c.ink }}>{dateLabel}</p>
        )}
        {hours && (
          <p style={{ margin: '8px 0 0', fontFamily: F.display, fontSize: 15.5, letterSpacing: '.04em', color: c.skyDeep, fontVariantNumeric: 'tabular-nums' }}>
            {hours}{ev.tz ? ` ${ev.tz}` : ''}
          </p>
        )}

        <Rule width="60%" style={{ margin: '16px auto' }} />

        {ev.venue && (
          <p style={{ margin: 0, fontFamily: F.sans, fontSize: 14, lineHeight: 1.4, color: c.ink }}>{ev.venue}</p>
        )}
        {ev.address && (
          <p style={{ margin: '6px auto 0', maxWidth: 250, fontFamily: F.sans, fontSize: 12, lineHeight: 1.7, color: c.muted }}>{ev.address}</p>
        )}

        {ev.maps && (
          <a href={ev.maps} target="_blank" rel="noreferrer" className="inline-block"
            style={{
              marginTop: 16, padding: '10px 22px', borderRadius: 999,
              border: `1px solid ${c.rose}`, color: c.roseDeep,
              fontFamily: F.sans, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase',
            }}>
            Petunjuk Arah
          </a>
        )}
      </div>
    </Reveal>
  )
}

const Acara = ({ data }) => {
  const events = data?.events || []
  if (!events.length) return null
  return (
    <Section id="bp-acara">
      <SectionHead kicker="Save The Date" title="Rangkaian Acara" />
      <div className="flex flex-col" style={{ gap: 15 }}>
        {events.map((ev, i) => <EventCard key={ev?.id || i} ev={ev} i={i} delay={i * 0.07} />)}
      </div>
    </Section>
  )
}

// ─── 6. LOVE STORY (opsional) — sulur bertitik ───────────────────
// Medali kecil menempel di sulur bertitik yang turun di tengah, berpindah
// sisi tiap babak. `year` teks bebas dan ditampilkan apa adanya: melewatkan
// "Awal 2024" ke new Date() akan mengubahnya jadi 1 Januari 2024.
const LoveStory = ({ data }) => {
  const stories = data?.loveStory || []
  if (!stories.length) return null
  return (
    <Section id="bp-story">
      <SectionHead kicker="Perjalanan Kami" title="Love Story" />

      <div className="relative">
        <div className="absolute" style={{
          left: '50%', top: 6, bottom: 6, width: 0, transform: 'translateX(-50%)',
          borderLeft: `1px dashed rgba(169,196,203,.9)`,
        }} />
        <div className="flex flex-col" style={{ gap: 18 }}>
          {stories.map((s, i) => {
            const flip = i % 2 === 1
            return (
              <Reveal key={s.id || i} delay={i * 0.06} className="relative flex items-center"
                style={{ gap: 12, flexDirection: flip ? 'row-reverse' : 'row' }}>
                <div style={{ flex: 1, minWidth: 0, textAlign: flip ? 'left' : 'right', ...cardStyle, padding: 14 }}>
                  {s.year && (
                    <p style={{ margin: 0, fontFamily: F.script, fontSize: 26, lineHeight: 1, color: c.rose }}>{s.year}</p>
                  )}
                  {s.title && <p style={{ margin: '5px 0 0', fontFamily: F.display, fontSize: 15, lineHeight: 1.35, color: c.roseDeep }}>{s.title}</p>}
                  {s.desc && <p style={{ margin: '6px 0 0', fontFamily: F.sans, fontSize: 12, lineHeight: 1.7, color: c.muted }}>{s.desc}</p>}
                </div>

                {/* Medali kecil duduk tepat di sulur; bila babak ini tidak
                    berfoto, tetap ada titik supaya sulurnya tidak terputus. */}
                <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 74 }}>
                  {s.photo
                    ? <Medallion src={s.photo} w={68} pan={false} />
                    : <span style={{ width: 11, height: 11, borderRadius: '50%', background: c.rose, boxShadow: `0 0 0 4px ${c.paper}` }} />}
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

// ─── 7. GALERI (opsional) — medali taman ─────────────────────────
// Dua kolom bundar, kolom kanan diturunkan setengah sel sehingga terjalin
// seperti susunan bata. Bukan grid rapi (Gilded Palace) dan bukan album
// tempelan (Rose Sanctuary).
const Galeri = ({ data }) => {
  const photos = (data?.gallery || []).map(g => (typeof g === 'string' ? g : g?.src)).filter(Boolean)
  if (!photos.length) return null
  return (
    <Section id="bp-galeri">
      <SectionHead kicker="Momen" title="Galeri" />
      <div className="grid" style={{ gridTemplateColumns: photos.length > 1 ? '1fr 1fr' : '1fr', gap: 14 }}>
        {photos.map((src, i) => (
          <Reveal key={src} delay={(i % 4) * 0.05}
            style={{ marginTop: photos.length > 1 && i % 2 === 1 ? 30 : 0 }}>
            <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
              <div className="absolute inset-0 overflow-hidden" style={{
                borderRadius: '50%',
                border: `1px solid rgba(169,196,203,.85)`,
                boxShadow: '0 10px 24px rgba(62,50,45,.18), inset 0 0 0 4px rgba(251,246,242,.7)',
                background: c.blush,
              }}>
                <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

// ─── 8. INFORMASI (dresscode / live / hadiah / turut mengundang) ──
const InfoCard = ({ label, children, delay }) => (
  <Reveal delay={delay} style={cardStyle}>
    <Kicker style={{ fontSize: 9.5, letterSpacing: '.24em' }}>{label}</Kicker>
    <Rule width={36} style={{ margin: '10px 0 14px' }} />
    <div>{children}</div>
  </Reveal>
)

// Satu warna, karena editor menyimpan satu warna.
const Dresscode = ({ dresscode }) => (
  <div className="flex items-center" style={{ gap: 14 }}>
    {dresscode.color && (
      <span className="flex-shrink-0" style={{
        width: 42, height: 42, borderRadius: '50%',
        background: dresscode.color,
        border: `1px solid rgba(169,196,203,.8)`,
        boxShadow: `0 0 0 4px rgba(251,246,242,.7), 0 6px 14px rgba(62,50,45,.16)`,
      }} />
    )}
    <div style={{ minWidth: 0 }}>
      {dresscode.name && <p style={{ margin: 0, fontFamily: F.display, fontSize: 16, color: c.roseDeep }}>{dresscode.name}</p>}
      {dresscode.notes && <p style={{ margin: '4px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.7, color: c.muted }}>{dresscode.notes}</p>}
    </div>
  </div>
)

const giftBox = {
  padding: '14px 16px', borderRadius: 12,
  background: 'rgba(232,210,201,.55)', border: `1px solid rgba(169,196,203,.6)`,
}

const copyBtn = {
  marginTop: 12, padding: '8px 18px', borderRadius: 999, cursor: 'pointer',
  background: 'transparent', border: `1px solid ${c.rose}`, color: c.roseDeep,
  fontFamily: F.sans, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase',
}

const Gift = ({ accounts, giftAddr, copiedKey, copy }) => (
  <div className="flex flex-col" style={{ gap: 12 }}>
    <p style={{ margin: 0, fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.7, color: c.muted }}>
      Doa restu Anda adalah hadiah terindah. Bila berkenan memberi tanda kasih, berikut informasinya.
    </p>

    {accounts.map((acc, i) => (
      <div key={acc.id || i} style={giftBox}>
        {/* `bank` juga menyimpan nama e-wallet ketika type-nya 'ewallet' —
            satu field untuk keduanya. Nomornya di `number`, pemiliknya di
            `holder`. */}
        <p className="uppercase" style={{ margin: 0, fontFamily: F.sans, fontSize: 10.5, letterSpacing: '.14em', color: c.skyDeep }}>
          {acc.bank || (acc.type === 'ewallet' ? 'E-Wallet' : 'Bank')}
        </p>
        <p style={{ margin: '8px 0 0', fontFamily: F.display, fontSize: 18, letterSpacing: '.05em', color: c.ink, fontVariantNumeric: 'tabular-nums' }}>{acc.number || '—'}</p>
        {acc.holder && <p style={{ margin: '4px 0 0', fontFamily: F.sans, fontSize: 12.5, color: c.muted }}>a.n. {acc.holder}</p>}
        {acc.number && (
          <button onClick={() => copy(acc.number, acc.id || i)} style={copyBtn}>
            {copiedKey === (acc.id || i) ? 'Tersalin' : 'Salin'}
          </button>
        )}
      </div>
    ))}

    {/* Alamat pengiriman kado. Toggle-nya berdiri sendiri di editor, terpisah
        dari daftar rekening. */}
    {giftAddr && (
      <div style={giftBox}>
        <p className="uppercase" style={{ margin: 0, fontFamily: F.sans, fontSize: 10.5, letterSpacing: '.14em', color: c.skyDeep }}>Kirim Kado</p>
        {giftAddr.recipient && <p style={{ margin: '8px 0 0', fontFamily: F.display, fontSize: 16, color: c.ink }}>{giftAddr.recipient}</p>}
        {giftAddr.phone && <p style={{ margin: '4px 0 0', fontFamily: F.sans, fontSize: 12.5, color: c.muted }}>{giftAddr.phone}</p>}
        {giftAddr.address && <p style={{ margin: '10px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.75, color: c.muted, whiteSpace: 'pre-line' }}>{giftAddr.address}</p>}
        {giftAddr.address && (
          <button onClick={() => copy(giftAddr.address, 'bp-gift-address')} style={copyBtn}>
            {copiedKey === 'bp-gift-address' ? 'Tersalin' : 'Salin Alamat'}
          </button>
        )}
      </div>
    )}
  </div>
)

const Informasi = ({ data }) => {
  const { copiedKey, copy } = useCopyToClipboard()
  const dresscode = data?.dresscode || {}
  const hasDresscode = Boolean(dresscode.name || dresscode.color || dresscode.notes)
  const live = Boolean(data?.livestreamEnabled) && (data?.livestreamPlatforms || []).filter(p => p?.url)
  const hasLive = Boolean(live && live.length)
  const accounts = data?.accounts || []
  const ga = data?.giftAddress
  const giftAddr = ga?.enabled && (ga.address || ga.recipient || ga.phone) ? ga : null
  const families = (data?.families || [])
    .map(f => ({ ...f, members: (f.members || []).filter(m => m && m.trim()) }))
    .filter(f => f.members.length)
  const hasFamilies = Boolean(data?.turutMengundangEnabled) && families.length > 0

  if (!hasDresscode && !hasLive && !accounts.length && !giftAddr && !hasFamilies) return null

  return (
    <Section id="bp-info">
      <SectionHead kicker="Untuk Tamu" title="Informasi" />

      <div className="flex flex-col" style={{ gap: 14 }}>
        {hasDresscode && (
          <InfoCard label="Dresscode" delay={0}><Dresscode dresscode={dresscode} /></InfoCard>
        )}

        {hasLive && (
          <InfoCard label="Live Streaming" delay={0.05}>
            <div className="flex flex-col" style={{ gap: 10 }}>
              {live.map((p, i) => (
                <a key={i} href={p.url} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between" style={{ ...giftBox, padding: '12px 16px' }}>
                  <span style={{ fontFamily: F.sans, fontSize: 13, color: c.ink }}>{p.type || 'Siaran Langsung'}</span>
                  <span className="uppercase" style={{ fontFamily: F.sans, fontSize: 10, letterSpacing: '.14em', color: c.roseDeep }}>Tonton</span>
                </a>
              ))}
            </div>
          </InfoCard>
        )}

        {(accounts.length > 0 || giftAddr) && (
          <InfoCard label="Hadiah" delay={0.1}>
            <Gift accounts={accounts} giftAddr={giftAddr} copiedKey={copiedKey} copy={copy} />
          </InfoCard>
        )}

        {hasFamilies && (
          <InfoCard label="Turut Mengundang" delay={0.15}>
            <div className="flex flex-col" style={{ gap: 14 }}>
              {families.map((fam, i) => (
                <div key={i}>
                  {fam.side && <p style={{ margin: 0, fontFamily: F.display, fontSize: 15, color: c.roseDeep }}>{fam.side}</p>}
                  {fam.members.map((m, j) => (
                    <p key={j} style={{ margin: '4px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.8, color: c.muted }}>{m}</p>
                  ))}
                </div>
              ))}
            </div>
          </InfoCard>
        )}
      </div>
    </Section>
  )
}

// ─── 9. RSVP & UCAPAN ────────────────────────────────────────────
// Bentuk ucapan tersimpan: { name, wish, rsvp, guests, time }. `rsvp`
// bernilai 'hadir' atau 'tidak_hadir' — perhatikan garis bawahnya.
const fieldStyle = {
  width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 11,
  background: 'rgba(255,253,251,.85)', border: `1px solid rgba(169,196,203,.75)`,
  color: c.ink, fontFamily: F.sans, fontSize: 13.5, outline: 'none',
}

const RsvpUcapan = ({ wishes, onSubmitWish }) => {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [attendance, setAttendance] = useState('hadir')
  const [guests, setGuests] = useState(1)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const list = wishes || []
  const canSend = name.trim() && message.trim() && !busy

  const submit = async (e) => {
    e.preventDefault()
    if (!canSend) return
    setBusy(true)
    try {
      if (onSubmitWish) await onSubmitWish({ name, message, attendance, guests })
      setName(''); setMessage(''); setAttendance('hadir'); setGuests(1)
      setSent(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section id="bp-rsvp">
      <SectionHead kicker="Konfirmasi Kehadiran" title="RSVP & Ucapan" />

      <Reveal style={cardStyle}>
        <form onSubmit={submit} className="flex flex-col" style={{ gap: 11 }}>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Nama Anda" style={fieldStyle} />

          <div className="flex" style={{ gap: 8 }}>
            {[['hadir', 'Hadir'], ['tidak_hadir', 'Berhalangan']].map(([val, label]) => {
              const on = attendance === val
              return (
                <button key={val} type="button" onClick={() => setAttendance(val)}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 999, cursor: 'pointer',
                    fontFamily: F.sans, fontSize: 12, letterSpacing: '.05em',
                    background: on ? `linear-gradient(135deg, ${c.roseDeep}, ${c.rose})` : 'transparent',
                    color: on ? c.paper : c.muted,
                    border: `1px solid ${on ? 'transparent' : 'rgba(169,196,203,.8)'}`,
                  }}>
                  {label}
                </button>
              )
            })}
          </div>

          {attendance === 'hadir' && (
            <select value={guests} onChange={e => setGuests(Number(e.target.value))}
              style={{ ...fieldStyle, appearance: 'none' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n} orang{n === 5 ? ' atau lebih' : ''}</option>
              ))}
            </select>
          )}

          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
            placeholder="Tulis doa & ucapan…" style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.7 }} />

          <button type="submit" disabled={!canSend}
            style={{
              padding: '13px 0', borderRadius: 999, border: 'none',
              cursor: canSend ? 'pointer' : 'not-allowed', opacity: canSend ? 1 : 0.45,
              background: `linear-gradient(135deg, ${c.roseDeep}, ${c.rose})`,
              color: c.paper,
              fontFamily: F.sans, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase',
            }}>
            {busy ? 'Mengirim…' : 'Kirim Ucapan'}
          </button>

          {sent && (
            <p style={{ margin: 0, textAlign: 'center', fontFamily: F.sans, fontSize: 12, color: c.roseDeep }}>
              Terima kasih atas doa dan ucapannya.
            </p>
          )}
        </form>
      </Reveal>

      {list.length > 0 && (
        <div className="flex flex-col" style={{ gap: 11, marginTop: 18, maxHeight: 360, overflowY: 'auto', paddingRight: 2 }}>
          {list.map((w, i) => (
            <div key={w.id || i} style={{ ...cardStyle, padding: 16 }}>
              <div className="flex items-center justify-between" style={{ gap: 10 }}>
                <p style={{ margin: 0, fontFamily: F.display, fontSize: 14.5, color: c.roseDeep }}>{w.name}</p>
                <span className="uppercase" style={{
                  flexShrink: 0, padding: '4px 11px', borderRadius: 999,
                  fontFamily: F.sans, fontSize: 9, letterSpacing: '.08em',
                  background: w.rsvp === 'hadir' ? 'rgba(169,106,99,.16)' : 'rgba(62,50,45,.07)',
                  color: w.rsvp === 'hadir' ? c.roseDeep : c.faint,
                }}>
                  {w.rsvp === 'hadir' ? 'Hadir' : 'Berhalangan'}
                </span>
              </div>
              {w.wish && <p style={{ margin: '8px 0 0', fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.75, color: c.muted }}>{w.wish}</p>}
              {w.time && <p style={{ margin: '8px 0 0', fontFamily: F.sans, fontSize: 10.5, color: c.faint }}>{w.time}</p>}
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

// ─── 10. PENUTUP ─────────────────────────────────────────────────
const Penutup = ({ data, groomNick, brideNick, heroDate }) => {
  const photo = data?.meta?.footerPhoto || data?.meta?.photo || null
  return (
    <section id="bp-penutup" className="relative flex flex-col items-center justify-center text-center"
      style={{ zIndex: 1, minHeight: 'var(--inv-h)', boxSizing: 'border-box', padding: '86px 24px 146px' }}>
      <Reveal className="flex flex-col items-center" style={{ width: 'min(338px, 100%)' }}>
        {photo && <Medallion src={photo} w={136} style={{ marginBottom: -42, zIndex: 1 }} />}
        <div style={{ ...cardStyle, padding: photo ? '54px 22px 24px' : '26px 22px 24px', width: '100%' }}>
          <div className="flex flex-col items-center">
            <p style={{ margin: 0, fontFamily: F.sans, fontSize: 12.5, lineHeight: 1.9, color: c.muted, maxWidth: 290 }}>
              Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir
              untuk memberikan doa restu.
            </p>
            <Rule width={56} style={{ margin: '20px 0' }} />
            <Kicker>Wassalamualaikum Wr. Wb.</Kicker>
            <h2 style={{ margin: '12px 0 0', fontFamily: F.script, fontSize: 44, lineHeight: 1.1, color: c.roseDeep }}>
              {groomNick} &amp; {brideNick}
            </h2>
            <p style={{ margin: '8px 0 0', fontFamily: F.display, fontSize: 13, letterSpacing: '.1em', color: c.skyDeep }}>{heroDate}</p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

// ─── NAV & MUSIK ─────────────────────────────────────────────────
// Fixed murni, tanpa `md:absolute`: di layar >= 768px varian absolute yang
// menang dan navigasi berlabuh ke dasar dokumen, bukan ke layar.
const NAV = [['Home', 'bp-home'], ['Mempelai', 'bp-mempelai'], ['Acara', 'bp-acara'], ['Galeri', 'bp-galeri'], ['RSVP', 'bp-rsvp']]

const scrollToId = (id) => {
  // Yang menggulir itu div bagian dalam InvitationLayout, bukan jendela.
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const BottomNav = ({ visible }) => (
  <nav className="fixed flex" style={{
    bottom: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
    width: 'min(420px, calc(var(--inv-w) - 28px))', gap: 2, padding: '7px 9px', borderRadius: 999,
    background: 'rgba(251,246,242,.9)', border: `1px solid rgba(169,196,203,.8)`,
    backdropFilter: 'blur(18px) saturate(1.25)', WebkitBackdropFilter: 'blur(18px) saturate(1.25)',
    boxShadow: '0 12px 30px rgba(62,50,45,.2)',
    opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none', transition: 'opacity .7s ease .3s',
  }}>
    {NAV.map(([label, id]) => (
      <button key={id} className="bp-nav-btn" onClick={() => scrollToId(id)}
        style={{
          flex: 1, padding: '8px 2px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: 'transparent', color: c.roseDeep,
          fontFamily: F.sans, fontSize: 9.5, letterSpacing: '.05em', textTransform: 'uppercase',
        }}>
        {label}
      </button>
    ))}
  </nav>
)

const MusicButton = ({ musicPlaying, setMusicPlaying, visible }) => (
  <button onClick={() => setMusicPlaying(!musicPlaying)} title="Musik"
    className="fixed flex items-end justify-center"
    style={{
      bottom: 84, right: 'max(16px, calc(50vw - var(--inv-w) / 2 + 16px))', zIndex: 60,
      width: 46, height: 46, borderRadius: '50%', cursor: 'pointer', gap: 3, paddingBottom: 15,
      background: 'rgba(251,246,242,.9)', border: `1px solid rgba(169,196,203,.85)`,
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '0 10px 22px rgba(62,50,45,.18)',
      opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none', transition: 'opacity .7s ease .3s',
    }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        display: 'block', width: 3, height: 14, borderRadius: 2, background: c.rose,
        transformOrigin: 'bottom',
        transform: musicPlaying ? undefined : 'scaleY(.35)',
        animation: musicPlaying ? `bp-eq ${0.62 + i * 0.15}s ease-in-out infinite` : 'none',
      }} />
    ))}
  </button>
)

// ═══════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════
export default function BlushPavilionTheme({
  data, countdown, opened, setOpened,
  animateClose, setAnimateClose,
  musicPlaying, setMusicPlaying, audioRef,
  wishes, onSubmitWish, guestName,
}) {
  const introRef = useRef(null)
  const loopRef = useRef(null)

  // 'poster' → 'intro' → 'loop'. Satu arah, tidak pernah kembali.
  const [phase, setPhase] = useState('poster')
  const [introMounted, setIntroMounted] = useState(true)
  const [heroReady, setHeroReady] = useState(false)

  // Terpisah dari `opened` dengan sengaja: isi undangan ter-mount seketika,
  // tapi cover harus tetap terpasang sepanjang fade-nya sendiri.
  const [coverGone, setCoverGone] = useState(false)

  // Dibaca sekali lewat lazy initializer: membaca matchMedia di badan
  // komponen adalah pembacaan tak-murni yang dilarang react-hooks/purity.
  const [reduceMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )

  const groomNick = data?.groom?.nickname || 'Mempelai Pria'
  const brideNick = data?.bride?.nickname || 'Mempelai Wanita'
  const heroDate = data?.events?.[0]?.dateLabel || fmtDate(data?.events?.[0]?.date)
  const guest = guestName || 'Bapak/Ibu/Saudara/i'
  const musicEnabled = data?.music !== false

  useEffect(() => {
    const v = introRef.current
    if (!v) return
    const onTime = () => { if (v.currentTime >= HERO_AT) setHeroReady(true) }
    const onEnd = () => {
      // Juga di sini, bukan hanya di timeupdate: bila tamu menyeret videonya
      // atau timeupdate dilewati saat tab di latar belakang, kartunya tetap
      // harus terbit.
      setHeroReady(true)
      const l = loopRef.current
      if (l) { l.currentTime = 0; l.play().catch(() => {}) }
      setPhase('loop')
      setTimeout(() => setIntroMounted(false), 800)
    }
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', onEnd)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('ended', onEnd)
    }
  }, [introMounted])

  const handleOpen = () => {
    if (animateClose) return
    setAnimateClose(true)
    // Isi undangan dipasang seketika, di bawah cover yang masih pekat.
    setOpened(true)
    if (audioRef?.current) setMusicPlaying(true)

    if (reduceMotion) {
      setHeroReady(true)
    } else {
      const v = introRef.current
      if (v) {
        v.currentTime = 0
        // Muted + playsInline, dan dipicu oleh ketukan tamu. Kalau tetap
        // gagal, latar diam di poster, bukan jadi kosong.
        v.play().then(() => setPhase('intro')).catch(() => {
          setPhase('poster')
          setHeroReady(true)
        })
        // Jaring pengaman: video yang mogok tidak boleh meninggalkan undangan
        // kosong selamanya. Ambangnya jauh di atas 4,5 detik supaya jalur
        // normal selalu menang lebih dulu.
        setTimeout(() => setHeroReady(true), 12000)
      } else {
        setHeroReady(true)
      }
    }
    setTimeout(() => setCoverGone(true), 1200)
  }

  return (
    <InvitationLayout layout={THEMES.BLUSH_PAVILION} data={data}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prata&family=Questrial&family=Sacramento&display=swap');

        /* Geser saja, jangan pernah scale: men-scale raster melembekkan foto. */
        @keyframes bp-pan {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-2.5%, -2%, 0); }
        }
        @keyframes bp-eq { 0%, 100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }

        .bp-nav-btn:focus-visible {
          outline: 2px solid ${c.roseDeep};
          outline-offset: 2px;
        }

        /* Tamu yang meminta gerak dikurangi tetap mendapat tamannya sebagai
           gambar diam: videonya tidak pernah dipasang (lihat prop still di
           Panggung), dan geseran foto ikut berhenti. !important karena
           animasinya dipasang lewat style inline. */
        @media (prefers-reduced-motion: reduce) {
          .bp-pan { animation: none !important; }
        }
      `}</style>

      <div id="top" className="w-full relative flex flex-col"
        style={{ fontFamily: F.sans, color: c.ink, background: c.blush, minHeight: 'var(--inv-h)' }}>

        {musicEnabled && (
          <audio ref={audioRef} src={data?.musicUrl || MUSIC_URLS[data?.musicId || 1] || MUSIC_URLS[1]} loop />
        )}

        <Panggung phase={phase} introRef={introRef} loopRef={loopRef}
          introMounted={introMounted} still={reduceMotion} />

        {opened && (
          <div className="relative flex flex-col w-full" style={{ zIndex: 1 }}>
            <Hero data={data} groomNick={groomNick} brideNick={brideNick} heroDate={heroDate}
              countdown={countdown} countdownEnabled={data?.countdownEnabled ?? true}
              ready={heroReady} />

            <Quote data={data} />
            <Mempelai data={data} />
            <Acara data={data} />
            <LoveStory data={data} />
            <Galeri data={data} />
            <Informasi data={data} />
            <RsvpUcapan wishes={wishes} onSubmitWish={onSubmitWish} />
            <Penutup data={data} groomNick={groomNick} brideNick={brideNick} heroDate={heroDate} />
          </div>
        )}

        <BottomNav visible={opened} />
        {musicEnabled && <MusicButton musicPlaying={musicPlaying} setMusicPlaying={setMusicPlaying} visible={opened} />}

        {!coverGone && (
          <Cover data={data} groomNick={groomNick} brideNick={brideNick} heroDate={heroDate}
            guestName={guest} handleOpen={handleOpen} animateClose={animateClose} />
        )}
      </div>
    </InvitationLayout>
  )
}
