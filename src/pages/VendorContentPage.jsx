import { useState, useEffect, useRef } from 'react'
import {
  Plus, Trash2, Save, Check, AlertCircle, ExternalLink, BarChart3,
  MessageSquare, Upload, ShieldAlert, Images, ChevronLeft, ChevronRight, Star, User, Link2,
  Tag, ChevronDown, ChevronUp, Sparkles, Heading, SlidersHorizontal, ListChecks,
} from 'lucide-react'
import { useAuth } from '../App'
import ImageCropperModal from '../components/common/ImageCropperModal'
import { compressImage } from '../components/common/FormHelpers'
import {
  fetchMyVendorContent, updateVendorContent, uploadVendorMedia, removeVendorMedia,
} from '../services/vendorService'
import {
  MAX_STATS, MAX_TESTI, MAX_PHOTOS, MOSAIC_FROM, LEN,
  MAX_GROUPS, MAX_ITEMS, MAX_FEATURES, MAX_BEFORE_AFTER, MAX_SERVICES,
  STAT_FIELDS, TESTI_FIELDS, TESTI_OPTIONAL,
  keyed, bare, keyedPhotos, barePhotos, newKey, formatEventDate,
  keyedPackages, barePackages, countPackages,
  keyedPairs, barePairs, keyedServices, bareServices,
} from '../config/vendorContent'

// Tangkapan layar itu teks, bukan foto. Mutunya dijaga lebih tinggi daripada
// foto galeri (0,72) karena huruf kecil yang dikompresi terlalu keras jadi
// berbayang dan justru tidak terbaca -- padahal terbacanya itu seluruh isinya.
const SHOT_WIDTH = 900
const SHOT_QUALITY = 0.85

// Ukuran kedua untuk ubin di dinding testimoni. Ubinnya paling lebar 260px,
// jadi 480px masih tajam di layar rapat sambil tinggal seperlima berkasnya.
// Tanpa ini dinding berisi 24 ubin kecil tetap mengunduh 24 gambar 900px.
const THUMB_WIDTH = 480
const THUMB_QUALITY = 0.72

// Foto galeri, bukan tangkapan layar: mutunya boleh lebih rendah karena
// isinya gambar, bukan huruf kecil yang harus terbaca. Yang kecil dipakai
// ubin mosaik, yang penuh baru diunduh saat foto dibuka di lightbox.
const PHOTO_FULL_WIDTH = 1400
const PHOTO_FULL_QUALITY = 0.72
const PHOTO_THUMB_WIDTH = 600
const PHOTO_THUMB_QUALITY = 0.68

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-surface-border shadow-card ${className}`}>{children}</div>
)

function Field({ label, value, onChange, max, type = 'text', placeholder }) {
  const over = max != null && value.length > max
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <label className="form-label mb-0">{label}</label>
        {max != null && (
          <span className={`text-[10px] tabular-nums ${over ? 'text-red-500 font-semibold' : 'text-slate-300'}`}>
            {value.length}/{max}
          </span>
        )}
      </div>
      <input type={type} className={`form-input ${over ? 'border-red-300' : ''}`}
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

const RowShell = ({ children, onRemove }) => (
  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
    <div className="flex-1 min-w-0">{children}</div>
    <button type="button" onClick={onRemove} title="Hapus baris"
      className="mt-6 flex-shrink-0 p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
      <Trash2 size={15} />
    </button>
  </div>
)

const Nudge = ({ onUp, onDown, first, last, vertical = false }) => {
  const Up = vertical ? ChevronUp : ChevronLeft
  const Down = vertical ? ChevronDown : ChevronRight
  const cls = 'p-1 text-slate-300 hover:text-slate-700 disabled:opacity-25 disabled:cursor-not-allowed'
  return (
    <span className="flex flex-shrink-0">
      <button type="button" onClick={onUp} disabled={first} title="Naikkan" className={cls}><Up size={13} /></button>
      <button type="button" onClick={onDown} disabled={last} title="Turunkan" className={cls}><Down size={13} /></button>
    </span>
  )
}

const AddButton = ({ onClick, disabled, children, hint }) => (
  <div className="flex items-center gap-3 flex-wrap">
    <button type="button" onClick={onClick} disabled={disabled}
      className="btn-secondary text-xs inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
      <Plus size={13} /> {children}
    </button>
    {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
  </div>
)

/** Kotak tangkapan layar: kosong -> tombol unggah, terisi -> pratinjau tegak. */
function ShotBox({ value, thumb, busy, onPick, label = 'Tangkapan layar' }) {
  const ref = useRef()
  return (
    <div className="flex-shrink-0">
      <label className="form-label">{label}</label>
      <button type="button" onClick={() => ref.current?.click()} disabled={busy}
        className="block w-[104px] rounded-lg overflow-hidden border border-slate-200 bg-white hover:border-brand-400 transition-colors disabled:opacity-50"
        style={{ aspectRatio: '9 / 14' }}>
        {busy ? (
          <span className="flex h-full items-center justify-center text-[10px] text-slate-400">Mengunggah…</span>
        ) : value ? (
          <img src={thumb || value} alt="" className="w-full h-full object-cover" style={{ objectPosition: 'top' }} />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-1.5 text-slate-400">
            <Upload size={16} />
            <span className="text-[10px] leading-tight">Pilih<br />gambar</span>
          </span>
        )}
      </button>
      {value && !busy && (
        <button type="button" onClick={() => ref.current?.click()}
          className="mt-1.5 text-[10px] text-brand-600 hover:underline">Ganti gambar</button>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onPick} />
    </div>
  )
}

export default function VendorContentPage() {
  const { user } = useAuth()
  const vendorId = user?.vendor?.id

  const [stats, setStats] = useState([])
  const [testi, setTesti] = useState([])
  const [row, setRow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [crop, setCrop] = useState(null)     // { k, url } saat memotong gambar
  const [busyRow, setBusyRow] = useState(null)

  const [photos, setPhotos] = useState([])
  const [heroKey, setHeroKey] = useState(null)
  const [aboutKey, setAboutKey] = useState(null)
  const [coverKey, setCoverKey] = useState(null)
  const [uploading, setUploading] = useState(null)   // { done, total }

  const [groups, setGroups] = useState([])
  const [pkgNote, setPkgNote] = useState('')
  const [pkgFootnote, setPkgFootnote] = useState('')
  const [openGroup, setOpenGroup] = useState(null)

  const [pairs, setPairs] = useState([])
  const [services, setServices] = useState([])
  const [busyPair, setBusyPair] = useState(null)   // `${_k}:${side}`

  const applyRow = (v) => {
    setRow(v)
    setStats(keyed(v?.stats, STAT_FIELDS))
    setTesti(keyed(v?.testimonials, [...TESTI_FIELDS, ...TESTI_OPTIONAL]))

    const rows = keyedPhotos(v?.gallery)
    setPhotos(rows)
    // Kolomnya menyimpan URL, sedangkan form bekerja dengan kunci baris.
    // Dicocokkan sekali di sini supaya penanda "hero" ikut berpindah kalau
    // fotonya digeser, dan hilang sendiri kalau fotonya dihapus.
    const firstOf = (v2) => (Array.isArray(v2) ? v2 : []).find(x => typeof x === 'string' && x)
    const keyFor = (url) => rows.find(r => r.full === url || r.thumb === url)?._k || null
    setHeroKey(keyFor(firstOf(v?.hero_photos)))
    setAboutKey(keyFor(firstOf(v?.about_photos)))
    setCoverKey(keyFor(v?.cover_url))

    setGroups(keyedPackages(v?.packages))
    setPkgNote(v?.package_note || '')
    setPkgFootnote(v?.package_footnote || '')
    setPairs(keyedPairs(v?.before_after))
    setServices(keyedServices(v?.service_types))
    setLoading(false)
  }

  useEffect(() => {
    if (!vendorId) return
    let alive = true
    ;(async () => {
      const v = await fetchMyVendorContent(vendorId)
      if (alive) applyRow(v)
    })()
    return () => { alive = false }
  }, [vendorId])

  const patch = (setter) => (k, field) => (val) =>
    setter(rows => rows.map(r => (r._k === k ? { ...r, [field]: val } : r)))
  const drop = (setter) => (k) => () => setter(rows => rows.filter(r => r._k !== k))
  const setStat = patch(setStats)
  const setTest = patch(setTesti)

  const pickShot = (k) => (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Gambar terlalu besar. Maksimal 10MB.')
      return
    }
    setError('')
    setCrop({ k, url: URL.createObjectURL(file) })
  }

  const finishCrop = async (croppedBase64) => {
    const k = crop?.k
    URL.revokeObjectURL(crop?.url)
    setCrop(null)
    if (!k) return
    setBusyRow(k)
    try {
      const src = await (await fetch(croppedBase64)).blob()
      const asBlob = async (dataUrl) => (await fetch(dataUrl)).blob()
      const [full, thumb] = await Promise.all([
        compressImage(src, SHOT_WIDTH, SHOT_QUALITY).then(asBlob),
        compressImage(src, THUMB_WIDTH, THUMB_QUALITY).then(asBlob),
      ])
      const [image, thumbUrl] = await Promise.all([
        uploadVendorMedia(full, user.id),
        uploadVendorMedia(thumb, user.id, 'testimoni-kecil'),
      ])
      setTesti(rows => rows.map(r => (r._k === k ? { ...r, image, thumb: thumbUrl } : r)))
    } catch (err) {
      setError(err.message || 'Gagal mengunggah gambar.')
    } finally {
      setBusyRow(null)
    }
  }

  const pickPhotos = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    setError('')

    const room = MAX_PHOTOS - photos.length
    if (room <= 0) { setError(`Galeri sudah penuh (maksimal ${MAX_PHOTOS} foto).`); return }
    const batch = files.slice(0, room)
    if (files.length > room) {
      setError(`Hanya ${room} foto pertama yang diambil — galeri maksimal ${MAX_PHOTOS} foto.`)
    }

    setUploading({ done: 0, total: batch.length })
    // Berurutan, bukan serentak: mengunggah dua puluh foto sekaligus dari
    // koneksi seluler membuat semuanya melambat bersamaan dan sebagian gagal.
    for (let i = 0; i < batch.length; i++) {
      try {
        const asBlob = async (dataUrl) => (await fetch(dataUrl)).blob()
        const [full, thumb] = await Promise.all([
          compressImage(batch[i], PHOTO_FULL_WIDTH, PHOTO_FULL_QUALITY).then(asBlob),
          compressImage(batch[i], PHOTO_THUMB_WIDTH, PHOTO_THUMB_QUALITY).then(asBlob),
        ])
        const [fullUrl, thumbUrl] = await Promise.all([
          uploadVendorMedia(full, user.id, 'galeri'),
          uploadVendorMedia(thumb, user.id, 'galeri-kecil'),
        ])
        setPhotos(rows => [...rows, { _k: newKey(), full: fullUrl, thumb: thumbUrl, caption: '' }])
      } catch (err) {
        setError(`Gagal mengunggah ${batch[i].name}: ${err.message}`)
      }
      setUploading({ done: i + 1, total: batch.length })
    }
    setUploading(null)
  }

  const movePhoto = (k, dir) => setPhotos(rows => {
    const i = rows.findIndex(r => r._k === k)
    const j = i + dir
    if (i < 0 || j < 0 || j >= rows.length) return rows
    const next = [...rows]
    ;[next[i], next[j]] = [next[j], next[i]]
    return next
  })

  const dropPhoto = (k) => {
    setPhotos(rows => rows.filter(r => r._k !== k))
    // Penanda ikut dilepas, kalau tidak halaman kehilangan foto hero-nya
    // tanpa ada yang memberi tahu.
    if (heroKey === k) setHeroKey(null)
    if (aboutKey === k) setAboutKey(null)
    if (coverKey === k) setCoverKey(null)
  }

  // Satu penolong untuk ketiga tingkat: geser satu langkah di dalam daftarnya
  // sendiri. Tanpa ini ada tiga salinan logika yang sama persis, dan yang
  // ketiga selalu jadi yang lupa diperbaiki.
  const shift = (list, k, dir) => {
    const a = list.findIndex(x => x._k === k)
    const b = a + dir
    if (a < 0 || b < 0 || b >= list.length) return list
    const next = [...list]
    ;[next[a], next[b]] = [next[b], next[a]]
    return next
  }

  const editGroup = (gk, patchObj) =>
    setGroups(gs => gs.map(g => (g._k === gk ? { ...g, ...patchObj } : g)))
  const editItem = (gk, ik, patchObj) =>
    setGroups(gs => gs.map(g => (g._k !== gk ? g
      : { ...g, items: g.items.map(i => (i._k === ik ? { ...i, ...patchObj } : i)) })))
  const editFeature = (gk, ik, fk, patchObj) =>
    setGroups(gs => gs.map(g => (g._k !== gk ? g
      : { ...g, items: g.items.map(i => (i._k !== ik ? i
        : { ...i, features: i.features.map(f => (f._k === fk ? { ...f, ...patchObj } : f)) })) })))

  const addGroup = () => {
    const k = newKey()
    setGroups(gs => [...gs, { _k: k, group: '', note: '', items: [] }])
    setOpenGroup(k)
  }
  const addItem = (gk) => setGroups(gs => gs.map(g => (g._k !== gk ? g
    : { ...g, items: [...g.items, { _k: newKey(), name: '', price: '', note: '', highlight: false, features: [] }] })))
  const addFeature = (gk, ik) => setGroups(gs => gs.map(g => (g._k !== gk ? g
    : { ...g, items: g.items.map(i => (i._k !== ik ? i
      : { ...i, features: [...i.features, { _k: newKey(), text: '', heading: false }] })) })))

  const dropGroup = (gk) => setGroups(gs => gs.filter(g => g._k !== gk))
  const dropItem = (gk, ik) => setGroups(gs => gs.map(g => (g._k !== gk ? g
    : { ...g, items: g.items.filter(i => i._k !== ik) })))
  const dropFeature = (gk, ik, fk) => setGroups(gs => gs.map(g => (g._k !== gk ? g
    : { ...g, items: g.items.map(i => (i._k !== ik ? i
      : { ...i, features: i.features.filter(f => f._k !== fk) })) })))

  const moveGroup = (gk, dir) => setGroups(gs => shift(gs, gk, dir))
  const moveItem = (gk, ik, dir) => setGroups(gs => gs.map(g => (g._k !== gk ? g
    : { ...g, items: shift(g.items, ik, dir) })))
  const moveFeature = (gk, ik, fk, dir) => setGroups(gs => gs.map(g => (g._k !== gk ? g
    : { ...g, items: g.items.map(i => (i._k !== ik ? i
      : { ...i, features: shift(i.features, fk, dir) })) })))

  const pickPair = (k, side) => async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('Gambar terlalu besar. Maksimal 10MB.'); return }
    setError('')
    setBusyPair(`${k}:${side}`)
    try {
      // Ukuran penuh saja: pasangan ini dilihat besar dan digeser, jadi tidak
      // ada tempat yang memakai versi kecilnya.
      const shrunk = await compressImage(file, PHOTO_FULL_WIDTH, PHOTO_FULL_QUALITY)
      const blob = await (await fetch(shrunk)).blob()
      const url = await uploadVendorMedia(blob, user.id, `sebelum-sesudah-${side}`)
      setPairs(rows => rows.map(r => (r._k === k ? { ...r, [side]: url } : r)))
    } catch (err) {
      setError(err.message || 'Gagal mengunggah gambar.')
    } finally {
      setBusyPair(null)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      // Kedua ukuran ikut dihitung: melewatkan thumb berarti separuh berkas
      // yang dibuang tetap tertinggal di bucket selamanya.
      const filesOf = (list) => (list || []).flatMap(t => [t?.image, t?.thumb]).filter(Boolean)
      const photoFilesOf = (list) => (Array.isArray(list) ? list : [])
        .flatMap(g => (typeof g === 'string' ? [g] : [g?.full, g?.thumb]))
        .filter(Boolean)
      const pairFilesOf = (list) => (Array.isArray(list) ? list : [])
        .flatMap(p2 => [p2?.before, p2?.after]).filter(Boolean)
      const before = [...filesOf(row?.testimonials), ...photoFilesOf(row?.gallery),
        ...pairFilesOf(row?.before_after)]

      const nextPhotos = barePhotos(photos)
      if (nextPhotos.length === 0) {
        throw new Error('Galeri tidak boleh kosong — halaman portofolio tanpa foto tidak ada gunanya.')
      }
      const urlOf = (k) => photos.find(r => r._k === k)?.full || null

      await updateVendorContent({
        stats: bare(stats, STAT_FIELDS),
        testimonials: bare(testi, TESTI_FIELDS, TESTI_OPTIONAL),
        gallery: nextPhotos,
        heroPhoto: urlOf(heroKey),
        aboutPhoto: urlOf(aboutKey),
        coverPhoto: urlOf(coverKey),
        packages: barePackages(groups),
        packageNote: pkgNote,
        packageFootnote: pkgFootnote,
        beforeAfter: barePairs(pairs),
        services: bareServices(services),
      })
      // Dibaca ulang dari server, bukan dipercaya dari layar: fungsinya
      // memangkas spasi dan membuang baris yang tidak lengkap, jadi yang
      // tampil setelah simpan harus yang benar-benar tersimpan.
      const fresh = await fetchMyVendorContent(vendorId)
      applyRow(fresh)

      // Berkas yang sudah tidak dirujuk baris mana pun dibuang, supaya bucket
      // tidak menumpuk tangkapan layar yang tidak tampil di mana-mana.
      const after = new Set([...filesOf(fresh?.testimonials), ...photoFilesOf(fresh?.gallery),
        ...pairFilesOf(fresh?.before_after)])
      await removeVendorMedia(before.filter(u => !after.has(u)), user.id)

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message || 'Gagal menyimpan.')
    } finally {
      setSaving(false)
    }
  }

  if (!vendorId) {
    return (
      <Card className="p-8 text-center text-slate-500 text-sm">
        Halaman ini untuk akun vendor. Akunmu belum terhubung ke portofolio vendor mana pun.
      </Card>
    )
  }
  if (loading) return <div className="p-8 text-center text-slate-500 text-sm">Memuat konten…</div>

  const preview = bare(stats, STAT_FIELDS)
  const readyTesti = bare(testi, TESTI_FIELDS, TESTI_OPTIONAL).length

  return (
    <>
      <form onSubmit={handleSave} className="space-y-6 pb-24">
        {/* Kepala */}
        <Card className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-semibold text-slate-800">Konten Portofolio</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Yang kamu isi di sini langsung tampil di halaman publikmu.
            </p>
          </div>
          {row?.slug && (
            <a href={`/vendor/${row.slug}`} target="_blank" rel="noopener noreferrer"
              className="btn-secondary text-xs inline-flex items-center gap-1.5">
              <ExternalLink size={13} /> Lihat halaman
            </a>
          )}
        </Card>

        {/* ── Statistik profil ────────────────────────────────────────── */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-brand-600" />
            <h2 className="font-semibold text-slate-800 text-sm">Statistik Profil</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed -mt-1">
            Angka yang tampil besar di halamanmu. Ini berbeda dari menu <strong>Statistik</strong> —
            yang itu menghitung pengunjung dan tidak bisa diubah. Yang di sini klaim tentang
            pengalamanmu, jadi tulis angka yang benar; calon klien memakainya untuk menilai.
          </p>

          <div className="space-y-3">
            {stats.map(s => (
              <RowShell key={s._k} onRemove={drop(setStats)(s._k)}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="sm:w-40 flex-shrink-0">
                    <Field label="Angka" value={s.value} max={LEN.value}
                      onChange={setStat(s._k, 'value')} placeholder="240+" />
                  </div>
                  <Field label="Keterangan" value={s.label} max={LEN.label}
                    onChange={setStat(s._k, 'label')} placeholder="Pernikahan terdokumentasi" />
                </div>
              </RowShell>
            ))}
            {stats.length === 0 && (
              <p className="text-xs text-slate-400 italic py-2">
                Belum ada statistik — bagian ini tidak muncul di halamanmu.
              </p>
            )}
          </div>

          <AddButton
            onClick={() => setStats(r => [...r, { _k: newKey(), value: '', label: '' }])}
            disabled={stats.length >= MAX_STATS}
            hint={stats.length >= MAX_STATS
              ? `Maksimal ${MAX_STATS} — lebih dari itu barisnya pecah di halaman.`
              : `${stats.length} dari ${MAX_STATS}`}>
            Tambah statistik
          </AddButton>

          {preview.length > 0 && (
            <div>
              <p className="text-[11px] text-slate-400 mb-2">Tampilan di halamanmu:</p>
              <div className="rounded-xl p-4 grid gap-2.5"
                style={{ background: '#0D0B0A', gridTemplateColumns: `repeat(${Math.min(preview.length, 4)}, 1fr)` }}>
                {preview.map((s, i) => (
                  <div key={i} className="rounded-lg px-3 py-3"
                    style={{ border: '1px solid rgba(201,169,124,0.22)', background: 'rgba(255,255,255,0.02)' }}>
                    <p className="text-lg font-light truncate" style={{ color: '#D8BC93', letterSpacing: '0.03em' }}>
                      {s.value}
                    </p>
                    <p className="text-[10px] uppercase mt-1 leading-snug"
                      style={{ color: 'rgba(240,232,221,0.55)', letterSpacing: '0.14em' }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* ── Daftar harga ────────────────────────────────────────────── */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-brand-600" />
          <h2 className="font-semibold text-slate-800 text-sm">Daftar Harga</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed -mt-1">
          Paketmu, dikelompokkan seperti di halaman. Kelompoknya jadi tab yang bisa
          digeser calon klien. Ini satu-satunya isi halamanmu yang mengikat secara
          komersial — pastikan harganya benar sebelum menyimpan.
        </p>

        <div className="space-y-2.5">
          {groups.map((g, gi) => {
            const open = openGroup === g._k
            return (
              <div key={g._k} className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5">
                  <button type="button" onClick={() => setOpenGroup(open ? null : g._k)}
                    className="flex-1 min-w-0 flex items-center gap-2 text-left">
                    {open ? <ChevronUp size={14} className="text-slate-400 flex-shrink-0" />
                      : <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />}
                    <span className="font-semibold text-slate-800 text-sm truncate">
                      {g.group.trim() || <em className="text-slate-400 font-normal">Tanpa nama kelompok</em>}
                    </span>
                    <span className="badge text-[10px] bg-white text-slate-500 flex-shrink-0">
                      {g.items.length} paket
                    </span>
                  </button>
                  <Nudge onUp={() => moveGroup(g._k, -1)} onDown={() => moveGroup(g._k, 1)}
                    first={gi === 0} last={gi === groups.length - 1} vertical />
                  <button type="button" onClick={() => dropGroup(g._k)} title="Hapus kelompok"
                    className="p-1 text-slate-300 hover:text-red-500 flex-shrink-0"><Trash2 size={13} /></button>
                </div>

                {open && (
                  <div className="p-3 space-y-3 bg-white">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="sm:w-52 flex-shrink-0">
                        <Field label="Nama kelompok" value={g.group} max={LEN.group}
                          onChange={v => editGroup(g._k, { group: v })} placeholder="Prewedding" />
                      </div>
                      <Field label="Catatan kelompok (opsional)" value={g.note} max={LEN.groupNote}
                        onChange={v => editGroup(g._k, { note: v })}
                        placeholder="Luar kota dikenakan transport" />
                    </div>

                    {g.items.map((it, ii) => (
                      <div key={it._k} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Field label="Nama paket" value={it.name} max={LEN.pkgName}
                                onChange={v => editItem(g._k, it._k, { name: v })} placeholder="Paket 1" />
                              <div className="sm:w-44 flex-shrink-0">
                                <Field label="Harga" value={it.price} max={LEN.pkgPrice}
                                  onChange={v => editItem(g._k, it._k, { price: v })} placeholder="Rp 1.100.000" />
                              </div>
                            </div>
                            <Field label="Label kecil (opsional)" value={it.note} max={LEN.pkgNote}
                              onChange={v => editItem(g._k, it._k, { note: v })} placeholder="paling dipilih" />
                          </div>
                          <div className="flex flex-col items-center gap-1 pt-6">
                            <Nudge onUp={() => moveItem(g._k, it._k, -1)} onDown={() => moveItem(g._k, it._k, 1)}
                              first={ii === 0} last={ii === g.items.length - 1} vertical />
                            <button type="button" onClick={() => dropItem(g._k, it._k)} title="Hapus paket"
                              className="p-1 text-slate-300 hover:text-red-500"><Trash2 size={13} /></button>
                          </div>
                        </div>

                        <button type="button"
                          onClick={() => editItem(g._k, it._k, { highlight: !it.highlight })}
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-lg px-2.5 py-1.5 border transition-colors ${
                            it.highlight
                              ? 'bg-brand-50 border-brand-200 text-brand-700'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'}`}>
                          <Sparkles size={12} /> {it.highlight ? 'Disorot di halaman' : 'Sorot paket ini'}
                        </button>

                        <div className="space-y-1.5">
                          <label className="form-label">Rincian paket</label>
                          {it.features.map((f, fi) => (
                            <div key={f._k} className="flex items-center gap-1.5">
                              {/* Baris judul membagi daftar yang panjang jadi
                                  bagian ("DEKORASI", "BONUS"). Tanpa itu dua
                                  puluh peluru beruntun tidak bisa dibedakan
                                  mana yang termasuk apa. */}
                              <button type="button"
                                onClick={() => editFeature(g._k, it._k, f._k, { heading: !f.heading })}
                                title={f.heading ? 'Jadikan rincian biasa' : 'Jadikan judul bagian'}
                                className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${
                                  f.heading ? 'bg-brand-50 text-brand-600' : 'text-slate-300 hover:text-slate-600'}`}>
                                <Heading size={12} />
                              </button>
                              <input
                                className={`form-input flex-1 min-w-0 py-1.5 text-xs ${
                                  f.heading ? 'font-semibold uppercase tracking-wider bg-brand-50/40' : ''}`}
                                value={f.text}
                                onChange={e => editFeature(g._k, it._k, f._k, { text: e.target.value })}
                                placeholder={f.heading ? 'DEKORASI' : '1 hari (4 jam)'}
                                maxLength={LEN.feature} />
                              <Nudge onUp={() => moveFeature(g._k, it._k, f._k, -1)}
                                onDown={() => moveFeature(g._k, it._k, f._k, 1)}
                                first={fi === 0} last={fi === it.features.length - 1} vertical />
                              <button type="button" onClick={() => dropFeature(g._k, it._k, f._k)}
                                title="Hapus rincian"
                                className="p-1 text-slate-300 hover:text-red-500 flex-shrink-0"><Trash2 size={12} /></button>
                            </div>
                          ))}
                          <button type="button" onClick={() => addFeature(g._k, it._k)}
                            disabled={it.features.length >= MAX_FEATURES}
                            className="text-[11px] text-brand-600 hover:underline inline-flex items-center gap-1 disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed">
                            <Plus size={11} /> Tambah rincian
                            {it.features.length >= MAX_FEATURES && ` (maksimal ${MAX_FEATURES})`}
                          </button>
                        </div>
                      </div>
                    ))}

                    <AddButton onClick={() => addItem(g._k)} disabled={g.items.length >= MAX_ITEMS}
                      hint={g.items.length >= MAX_ITEMS ? `Maksimal ${MAX_ITEMS} paket per kelompok.` : null}>
                      Tambah paket
                    </AddButton>
                  </div>
                )}
              </div>
            )
          })}

          {groups.length === 0 && (
            <p className="text-xs text-slate-400 italic py-2">
              Belum ada paket — bagian daftar harga tidak muncul di halamanmu.
            </p>
          )}
        </div>

        <AddButton onClick={addGroup} disabled={groups.length >= MAX_GROUPS}
          hint={groups.length >= MAX_GROUPS
            ? `Maksimal ${MAX_GROUPS} kelompok.`
            : `${groups.length} kelompok · ${countPackages(groups)} paket`}>
          Tambah kelompok
        </AddButton>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <Field label="Catatan di atas daftar harga" value={pkgNote} max={LEN.pkgIntro}
            onChange={setPkgNote} placeholder="Harga berlaku untuk Kota Banjar dan sekitarnya." />
          <Field label="Catatan kaki" value={pkgFootnote} max={LEN.pkgFootnote}
            onChange={setPkgFootnote} placeholder="Daftar harga 2025. Ketersediaan tanggal bisa ditanyakan lewat WhatsApp." />
          {/* Dikosongkan berarti dihapus, bukan diabaikan -- catatan harga yang
              sudah tidak berlaku harus bisa dibuang, bukan cuma diganti. */}
          <p className="text-[11px] text-slate-400">
            Dikosongkan berarti catatannya dihapus dari halaman.
          </p>
        </div>
      </Card>

      {/* ── Galeri ──────────────────────────────────────────────────── */}
      <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Images size={16} className="text-brand-600" />
            <h2 className="font-semibold text-slate-800 text-sm">Galeri</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed -mt-1">
            Foto karyamu. Urutannya menentukan tampilan di halaman, dan dari sini juga
            kamu menandai foto mana yang dipakai untuk header, bagian &ldquo;Tentang&rdquo;,
            dan pratinjau tautan. Tidak perlu memotong — ukurannya diatur otomatis.
          </p>

          {photos.length > 0 && photos.length < MOSAIC_FROM && (
            <p className="text-[11px] text-amber-600 flex items-start gap-1.5">
              <AlertCircle size={12} className="mt-px flex-shrink-0" />
              Di bawah {MOSAIC_FROM} foto, galeri tampil sebagai kisi biasa. Mulai {MOSAIC_FROM} foto
              ia berubah jadi mosaik besar yang jauh lebih berkesan.
            </p>
          )}

          <div className="grid gap-2.5"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))' }}>
            {photos.map((p, i) => (
              <div key={p._k} className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                <div className="relative bg-slate-100" style={{ aspectRatio: '3 / 4' }}>
                  <img src={p.thumb || p.full} alt="" className="w-full h-full object-cover" />
                  {(heroKey === p._k || aboutKey === p._k || coverKey === p._k) && (
                    <div className="absolute top-1 left-1 flex flex-wrap gap-1">
                      {heroKey === p._k && (
                        <span className="badge text-[9px] bg-brand-600 text-white">Header</span>
                      )}
                      {aboutKey === p._k && (
                        <span className="badge text-[9px] bg-slate-800 text-white">Tentang</span>
                      )}
                      {coverKey === p._k && (
                        <span className="badge text-[9px] bg-teal-600 text-white">Tautan</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-1 py-1 border-t border-slate-100">
                  <button type="button" onClick={() => movePhoto(p._k, -1)} disabled={i === 0}
                    title="Geser kiri"
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-25 disabled:cursor-not-allowed">
                    <ChevronLeft size={13} />
                  </button>
                  <span className="text-[10px] text-slate-400 tabular-nums">{i + 1}</span>
                  <button type="button" onClick={() => movePhoto(p._k, 1)} disabled={i === photos.length - 1}
                    title="Geser kanan"
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-25 disabled:cursor-not-allowed">
                    <ChevronRight size={13} />
                  </button>
                </div>

                <div className="flex items-center justify-between px-1 pb-1">
                  <button type="button" onClick={() => setHeroKey(p._k)} title="Jadikan foto header"
                    className={`p-1 ${heroKey === p._k ? 'text-brand-600' : 'text-slate-300 hover:text-brand-500'}`}>
                    <Star size={13} />
                  </button>
                  <button type="button" onClick={() => setAboutKey(p._k)} title="Jadikan foto Tentang"
                    className={`p-1 ${aboutKey === p._k ? 'text-slate-800' : 'text-slate-300 hover:text-slate-600'}`}>
                    <User size={13} />
                  </button>
                  <button type="button" onClick={() => setCoverKey(p._k)} title="Jadikan pratinjau tautan"
                    className={`p-1 ${coverKey === p._k ? 'text-teal-600' : 'text-slate-300 hover:text-teal-500'}`}>
                    <Link2 size={13} />
                  </button>
                  <button type="button" onClick={() => dropPhoto(p._k)} title="Hapus foto"
                    className="p-1 text-slate-300 hover:text-red-500">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            {photos.length < MAX_PHOTOS && (
              <label className="rounded-xl border border-dashed border-slate-300 hover:border-brand-400 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1.5 text-slate-400"
                style={{ aspectRatio: '3 / 4' }}>
                <Upload size={17} />
                <span className="text-[10px] text-center leading-tight px-2">Tambah<br />foto</span>
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={pickPhotos} disabled={uploading !== null} />
              </label>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {uploading ? (
              <span className="text-[11px] text-brand-600 font-semibold">
                Mengunggah {uploading.done} dari {uploading.total}…
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                {photos.length} dari {MAX_PHOTOS} foto
                {photos.length > 0 && !heroKey && ' · belum ada foto header yang dipilih'}
              </span>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 space-y-1.5">
            <p className="text-[11px] text-slate-600 flex items-start gap-2">
              <Star size={12} className="mt-px flex-shrink-0 text-brand-600" />
              <span><strong>Header</strong> — foto besar di bagian paling atas halamanmu.</span>
            </p>
            <p className="text-[11px] text-slate-600 flex items-start gap-2">
              <User size={12} className="mt-px flex-shrink-0 text-slate-800" />
              <span><strong>Tentang</strong> — foto yang menemani cerita tentang kamu.</span>
            </p>
            <p className="text-[11px] text-slate-600 flex items-start gap-2">
              <Link2 size={12} className="mt-px flex-shrink-0 text-teal-600" />
              <span>
                <strong>Tautan</strong> — tidak tampil di halaman. Ini gambar yang muncul
                saat alamat portofoliomu dibagikan di WhatsApp, jadi justru paling
                sering dilihat calon klien sebelum mereka membukanya.
              </span>
            </p>
          </div>
      </Card>

      {/* ── Sebelum & sesudah ───────────────────────────────────────── */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-brand-600" />
          <h2 className="font-semibold text-slate-800 text-sm">Sebelum &amp; Sesudah</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed -mt-1">
          Pasangan foto wajah yang sama, sebelum dan sesudah dirias. Pengunjung menggeser
          garis di tengahnya. Keduanya harus terisi — satu sisi saja bukan sebelum-sesudah.
        </p>

        <div className="space-y-3">
          {pairs.map(pr => (
            <RowShell key={pr._k} onRemove={() => setPairs(rs => rs.filter(r => r._k !== pr._k))}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-3 flex-shrink-0">
                  {['before', 'after'].map(side => (
                    <ShotBox key={side} value={pr[side]} busy={busyPair === `${pr._k}:${side}`}
                      onPick={pickPair(pr._k, side)}
                      label={side === 'before' ? 'Sebelum' : 'Sesudah'} />
                  ))}
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <Field label="Keterangan (opsional)" value={pr.label} max={LEN.baLabel}
                    onChange={v => setPairs(rs => rs.map(r => (r._k === pr._k ? { ...r, label: v } : r)))}
                    placeholder="Akad — Anindya" />
                  {(!pr.before || !pr.after) && (
                    <p className="text-[11px] text-amber-600 flex items-start gap-1.5">
                      <AlertCircle size={12} className="mt-px flex-shrink-0" />
                      Kedua foto harus ada — baris ini belum akan tersimpan.
                    </p>
                  )}
                </div>
              </div>
            </RowShell>
          ))}
          {pairs.length === 0 && (
            <p className="text-xs text-slate-400 italic py-2">
              Belum ada — bagian ini tidak muncul di halamanmu.
            </p>
          )}
        </div>

        <AddButton
          onClick={() => setPairs(rs => [...rs, { _k: newKey(), before: '', after: '', label: '' }])}
          disabled={pairs.length >= MAX_BEFORE_AFTER}
          hint={pairs.length >= MAX_BEFORE_AFTER
            ? `Maksimal ${MAX_BEFORE_AFTER} pasang.`
            : `${pairs.length} dari ${MAX_BEFORE_AFTER}`}>
          Tambah pasangan
        </AddButton>
      </Card>

      {/* ── Jenis layanan ───────────────────────────────────────────── */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ListChecks size={16} className="text-brand-600" />
          <h2 className="font-semibold text-slate-800 text-sm">Jenis Layanan</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed -mt-1">
          Label pendek yang tampil sebagai chip di bagian atas halaman, supaya pengunjung
          langsung tahu kamu melayani apa saja.
        </p>

        <div className="flex flex-wrap gap-2">
          {services.map(sv => (
            <div key={sv._k} className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 pl-3 pr-1 py-1">
              <input className="bg-transparent text-xs outline-none w-28 min-w-0" value={sv.text}
                maxLength={LEN.service} placeholder="Bridal akad"
                onChange={e => setServices(rs => rs.map(r => (r._k === sv._k ? { ...r, text: e.target.value } : r)))} />
              <button type="button" onClick={() => setServices(rs => rs.filter(r => r._k !== sv._k))}
                className="p-1 text-slate-300 hover:text-red-500"><Trash2 size={11} /></button>
            </div>
          ))}
          {services.length === 0 && (
            <p className="text-xs text-slate-400 italic">Belum ada — barisnya tidak muncul.</p>
          )}
        </div>

        <AddButton
          onClick={() => setServices(rs => [...rs, { _k: newKey(), text: '' }])}
          disabled={services.length >= MAX_SERVICES}
          hint={services.length >= MAX_SERVICES ? `Maksimal ${MAX_SERVICES}.` : `${services.length} dari ${MAX_SERVICES}`}>
          Tambah layanan
        </AddButton>
      </Card>

      {/* ── Testimoni ───────────────────────────────────────────────── */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-brand-600" />
            <h2 className="font-semibold text-slate-800 text-sm">Testimoni</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed -mt-1">
            Tangkapan layar chat WhatsApp atau DM dari klienmu. Kamu cukup menuliskan
            acaranya dan tanggalnya — isinya datang dari mereka, bukan dari kamu, dan
            justru itu yang membuatnya meyakinkan.
          </p>

          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-100 p-3.5">
            <ShieldAlert size={15} className="text-amber-600 flex-shrink-0 mt-px" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              <strong>Potong dulu nomor telepon klienmu.</strong> Halaman portofolio terbuka
              untuk siapa saja, dan nomor yang terlihat di tangkapan layar bisa dipanen orang
              lain. Setelah memilih gambar kamu bisa memotongnya — buang bagian atas yang
              memuat nomor, sisakan percakapannya. Pastikan juga klienmu tidak keberatan
              chat-nya dipajang.
            </p>
          </div>

          <div className="space-y-3">
            {testi.map(t => (
              <RowShell key={t._k} onRemove={drop(setTesti)(t._k)}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <ShotBox value={t.image} thumb={t.thumb} busy={busyRow === t._k} onPick={pickShot(t._k)} />
                  <div className="flex-1 min-w-0 space-y-3">
                    <Field label="Acara" value={t.event} max={LEN.event}
                      onChange={setTest(t._k, 'event')} placeholder="Wedding Anindya & Reza — Banjar" />
                    <Field label="Tanggal acara" value={t.date} type="date"
                      onChange={setTest(t._k, 'date')} />
                    {t.date && (
                      <p className="text-[11px] text-slate-400">
                        Tampil sebagai <strong className="text-slate-500">{formatEventDate(t.date)}</strong>
                      </p>
                    )}
                    {!t.image && (
                      <p className="text-[11px] text-amber-600 flex items-start gap-1.5">
                        <AlertCircle size={12} className="mt-px flex-shrink-0" />
                        Belum ada tangkapan layar — baris ini tidak akan tersimpan.
                      </p>
                    )}
                  </div>
                </div>
              </RowShell>
            ))}
            {testi.length === 0 && (
              <p className="text-xs text-slate-400 italic py-2">
                Belum ada testimoni — bagian ini tidak muncul di halamanmu.
              </p>
            )}
          </div>

          <AddButton
            onClick={() => setTesti(r => [...r, { _k: newKey(), image: '', thumb: '', event: '', date: '' }])}
            disabled={testi.length >= MAX_TESTI}
            hint={testi.length >= MAX_TESTI ? `Maksimal ${MAX_TESTI}.` : `${readyTesti} siap tayang dari ${testi.length} baris`}>
            Tambah testimoni
          </AddButton>
        </Card>

        {error && (
          <p className="text-xs text-red-600 font-semibold flex items-start gap-1.5">
            <AlertCircle size={13} className="mt-px flex-shrink-0" /> {error}
          </p>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <button type="submit" disabled={saving || busyRow !== null || uploading !== null}
            className={`btn-primary inline-flex items-center gap-1.5 ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}>
            {saved ? <><Check size={14} /> Tersimpan!</>
              : saving ? 'Menyimpan…'
              : <><Save size={14} /> Simpan Konten</>}
          </button>
          <span className="text-[11px] text-slate-400">
            Baris yang belum lengkap tidak ikut disimpan.
          </span>
        </div>
      </form>

      {crop && (
        <ImageCropperModal
          imageSrc={crop.url}
          onComplete={finishCrop}
          onCancel={() => { URL.revokeObjectURL(crop.url); setCrop(null) }}
        />
      )}
    </>
  )
}
