import { useState, useEffect, useRef } from 'react'
import {
  Plus, Trash2, Save, Check, AlertCircle, ExternalLink, BarChart3,
  MessageSquare, Upload, ShieldAlert,
} from 'lucide-react'
import { useAuth } from '../App'
import ImageCropperModal from '../components/common/ImageCropperModal'
import { compressImage } from '../components/common/FormHelpers'
import {
  fetchMyVendorContent, updateVendorContent, uploadVendorMedia, removeVendorMedia,
} from '../services/vendorService'
import {
  MAX_STATS, MAX_TESTI, LEN, STAT_FIELDS, TESTI_FIELDS, TESTI_OPTIONAL,
  keyed, bare, newKey, formatEventDate,
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
function ShotBox({ value, thumb, busy, onPick }) {
  const ref = useRef()
  return (
    <div className="flex-shrink-0">
      <label className="form-label">Tangkapan layar</label>
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

  const applyRow = (v) => {
    setRow(v)
    setStats(keyed(v?.stats, STAT_FIELDS))
    setTesti(keyed(v?.testimonials, [...TESTI_FIELDS, ...TESTI_OPTIONAL]))
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

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      // Kedua ukuran ikut dihitung: melewatkan thumb berarti separuh berkas
      // yang dibuang tetap tertinggal di bucket selamanya.
      const filesOf = (list) => (list || []).flatMap(t => [t?.image, t?.thumb]).filter(Boolean)
      const before = filesOf(row?.testimonials)
      await updateVendorContent({
        stats: bare(stats, STAT_FIELDS),
        testimonials: bare(testi, TESTI_FIELDS, TESTI_OPTIONAL),
      })
      // Dibaca ulang dari server, bukan dipercaya dari layar: fungsinya
      // memangkas spasi dan membuang baris yang tidak lengkap, jadi yang
      // tampil setelah simpan harus yang benar-benar tersimpan.
      const fresh = await fetchMyVendorContent(vendorId)
      applyRow(fresh)

      // Berkas yang sudah tidak dirujuk baris mana pun dibuang, supaya bucket
      // tidak menumpuk tangkapan layar yang tidak tampil di mana-mana.
      const after = new Set(filesOf(fresh?.testimonials))
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
          <button type="submit" disabled={saving || busyRow !== null}
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
