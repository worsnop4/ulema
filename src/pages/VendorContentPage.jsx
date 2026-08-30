import { useState, useEffect } from 'react'
import {
  Plus, Trash2, Save, Check, AlertCircle, ExternalLink, BarChart3, Quote,
} from 'lucide-react'
import { useAuth } from '../App'
import { fetchMyVendorContent, updateVendorContent } from '../services/vendorService'
import {
  MAX_STATS, MAX_TESTI, LEN, STAT_FIELDS, TESTI_FIELDS, keyed, bare, newKey,
} from '../config/vendorContent'

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-surface-border shadow-card ${className}`}>{children}</div>
)

function Field({ label, value, onChange, max, textarea, placeholder }) {
  const over = value.length > max
  const Tag = textarea ? 'textarea' : 'input'
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <label className="form-label mb-0">{label}</label>
        <span className={`text-[10px] tabular-nums ${over ? 'text-red-500 font-semibold' : 'text-slate-300'}`}>
          {value.length}/{max}
        </span>
      </div>
      <Tag
        className={`form-input ${textarea ? 'min-h-[92px] py-2.5 leading-relaxed' : ''} ${over ? 'border-red-300' : ''}`}
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      />
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

export default function VendorContentPage() {
  const { user } = useAuth()
  const vendorId = user?.vendor?.id

  const [stats, setStats] = useState([])
  const [testi, setTesti] = useState([])
  const [row, setRow] = useState(null)      // baris vendor apa adanya dari server
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const applyRow = (v) => {
    setRow(v)
    setStats(keyed(v?.stats, STAT_FIELDS))
    setTesti(keyed(v?.testimonials, TESTI_FIELDS))
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

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await updateVendorContent({
        stats: bare(stats, STAT_FIELDS),
        testimonials: bare(testi, TESTI_FIELDS),
      })
      // Dibaca ulang dari server, bukan dipercaya dari layar: fungsinya
      // memangkas spasi dan memotong teks yang kelewat panjang, jadi yang
      // tersimpan bisa berbeda tipis dari yang barusan diketik. Yang tampil
      // setelah simpan harus yang benar-benar tersimpan.
      applyRow(await fetchMyVendorContent(vendorId))
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

  return (
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

      {/* ── Statistik profil ──────────────────────────────────────────── */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-brand-600" />
          <h2 className="font-semibold text-slate-800 text-sm">Statistik Profil</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed -mt-1">
          Angka yang tampil besar di halamanmu, seperti <em>240+ pernikahan terdokumentasi</em>.
          Ini berbeda dari menu <strong>Statistik</strong> — yang itu menghitung pengunjung dan
          tidak bisa diubah. Yang di sini klaim tentang pengalamanmu, jadi tulis angka
          yang benar; calon klien memakainya untuk menilai.
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
              style={{
                background: '#0D0B0A',
                gridTemplateColumns: `repeat(${Math.min(preview.length, 4)}, 1fr)`,
              }}>
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

      {/* ── Testimoni ─────────────────────────────────────────────────── */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Quote size={16} className="text-brand-600" />
          <h2 className="font-semibold text-slate-800 text-sm">Testimoni</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed -mt-1">
          Ulasan dari klien yang pernah kamu garap. Pakai kata-kata mereka sendiri, dan
          pastikan mereka tidak keberatan namanya dipajang — ini tampil di halaman
          yang terbuka untuk siapa saja.
        </p>

        <div className="space-y-3">
          {testi.map(t => (
            <RowShell key={t._k} onRemove={drop(setTesti)(t._k)}>
              <div className="space-y-3">
                <Field label="Ulasan" value={t.quote} max={LEN.quote} textarea
                  onChange={setTest(t._k, 'quote')}
                  placeholder="Hasil fotonya melebihi bayangan kami…" />
                <Field label="Nama & acara" value={t.author} max={LEN.author}
                  onChange={setTest(t._k, 'author')}
                  placeholder="Anindya & Reza — Banjar, 2025" />
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
          onClick={() => setTesti(r => [...r, { _k: newKey(), quote: '', author: '' }])}
          disabled={testi.length >= MAX_TESTI}
          hint={testi.length >= MAX_TESTI ? `Maksimal ${MAX_TESTI}.` : `${testi.length} dari ${MAX_TESTI}`}>
          Tambah testimoni
        </AddButton>
      </Card>

      {error && (
        <p className="text-xs text-red-600 font-semibold flex items-start gap-1.5">
          <AlertCircle size={13} className="mt-px flex-shrink-0" /> {error}
        </p>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button type="submit" disabled={saving}
          className={`btn-primary inline-flex items-center gap-1.5 ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}>
          {saved ? <><Check size={14} /> Tersimpan!</>
            : saving ? 'Menyimpan…'
            : <><Save size={14} /> Simpan Konten</>}
        </button>
        <span className="text-[11px] text-slate-400">
          Baris yang kotaknya masih kosong tidak ikut disimpan.
        </span>
      </div>
    </form>
  )
}
