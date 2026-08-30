import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Eye, MessageCircle, Copy, ExternalLink, Wallet, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'
import { fetchVendorEvents } from '../services/vendorService'

const DAYS = 30

const KINDS = [
  ['view',          'Pengunjung',    Eye,           'Halaman portofolio dibuka'],
  ['wa_click',      'Klik WhatsApp', MessageCircle, 'Calon klien menghubungi kamu'],
  ['code_copy',     'Salin kode',    Copy,          'Kode voucher disalin'],
  ['catalog_click', 'Klik katalog',  ExternalLink,  'Lanjut ke katalog undangan'],
]

const dayKey = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

/** Deret DAYS hari terakhir yang berakhir di `now`, tanpa lubang tanggal.
 *  `now` diberikan dari luar, bukan dibaca di dalam: jam tidak boleh dibaca
 *  saat render, dan jendelanya tidak boleh bergeser selagi halaman terbuka. */
const buildSeries = (events, now) => {
  const counts = {}
  events.forEach(e => {
    if (e.kind !== 'view') return
    const k = dayKey(e.created_at)
    counts[k] = (counts[k] || 0) + 1
  })
  const out = []
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    out.push({ date: d, key: dayKey(d), n: counts[dayKey(d)] || 0 })
  }
  return out
}

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-surface-border shadow-card ${className}`}>{children}</div>
)

export default function VendorDashboardPage() {
  const { user } = useAuth()
  const vendor = user?.vendor
  const [events, setEvents] = useState([])
  const [wallet, setWallet] = useState(0)
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  // Dibaca sekali saat halaman dibuka, bukan tiap render.
  const [now] = useState(() => Date.now())

  useEffect(() => {
    if (!user) return
    let alive = true
    ;(async () => {
      const [evts, { data: profile }, { data: history }] = await Promise.all([
        fetchVendorEvents(vendor?.id, 90),
        supabase.from('profiles').select('wallet_balance, referral_code').eq('id', user.id).single(),
        supabase.from('referral_history')
          .select('commission_amount, status, created_at')
          .eq('referrer_id', user.id)
          .order('created_at', { ascending: false }),
      ])
      if (!alive) return
      setEvents(evts)
      setWallet(profile?.wallet_balance || 0)
      setSales(history || [])
      setLoading(false)
    })()
    return () => { alive = false }
  }, [user, vendor?.id])

  if (!vendor) {
    return (
      <Card className="p-8 text-center text-slate-500 text-sm">
        Halaman ini untuk akun vendor. Akunmu belum terhubung ke portofolio vendor mana pun.
      </Card>
    )
  }

  if (loading) return <div className="p-8 text-center text-slate-500 text-sm">Memuat statistik…</div>

  const since = now - DAYS * 86400000
  const recent = events.filter(e => new Date(e.created_at).getTime() >= since)
  const countOf = (list, kind) => list.filter(e => e.kind === kind).length
  const series = buildSeries(recent, now)
  const peak = Math.max(1, ...series.map(s => s.n))

  const views = countOf(recent, 'view')
  const waClicks = countOf(recent, 'wa_click')
  const leadRate = views ? Math.round((waClicks / views) * 100) : 0

  const paidSales = sales.filter(s => s.status !== 'pending')
  const earned = paidSales.reduce((sum, s) => sum + (s.commission_amount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Kepala */}
      <Card className="p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-semibold text-slate-800">{vendor.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {vendor.category}
            {vendor.visible
              ? <span className="ml-2 badge text-[10px] bg-green-100 text-green-700">Tayang</span>
              : <span className="ml-2 badge text-[10px] bg-amber-100 text-amber-700">Belum tayang</span>}
          </p>
        </div>
        <a href={`/vendor/${vendor.slug}`} target="_blank" rel="noopener noreferrer"
          className="btn-secondary text-xs inline-flex items-center gap-1.5">
          <ExternalLink size={13} /> Lihat halaman
        </a>
      </Card>

      {/* Angka utama */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))' }}>
        {KINDS.map(([kind, label, Icon, hint]) => (
          <Card key={kind} className="p-5">
            <div className="flex items-center gap-2 text-slate-400 mb-3">
              <Icon size={15} />
              <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-3xl font-bold text-slate-800 tabular-nums">{countOf(recent, kind)}</p>
            <p className="text-[11px] text-slate-400 mt-1.5">{hint}</p>
          </Card>
        ))}
      </div>

      {/* Grafik kunjungan */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-800 text-sm">Kunjungan {DAYS} hari terakhir</h2>
          <span className="text-[11px] text-slate-400">
            {waClicks} dari {views} pengunjung menghubungi kamu · {leadRate}%
          </span>
        </div>
        <div className="flex items-end gap-[3px]" style={{ height: 120 }}>
          {series.map(s => (
            <div key={s.key} className="flex-1 rounded-t transition-colors"
              title={`${s.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · ${s.n} kunjungan`}
              style={{
                height: `${Math.max(2, (s.n / peak) * 100)}%`,
                background: s.n ? 'var(--brand-500, #0d9488)' : '#E9EDF2',
                minHeight: 3,
              }} />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-2">
          <span>{series[0]?.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
          <span>Hari ini</span>
        </div>
      </Card>

      {/* Komisi */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={15} className="text-brand-600" />
          <h2 className="font-semibold text-slate-800 text-sm">Komisi</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Saldo</p>
            <p className="text-2xl font-bold text-brand-700 tabular-nums mt-1">
              Rp {wallet.toLocaleString('id-ID')}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Undangan terjual</p>
            <p className="text-2xl font-bold text-slate-800 tabular-nums mt-1">{paidSales.length}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total komisi</p>
            <p className="text-2xl font-bold text-slate-800 tabular-nums mt-1">
              Rp {earned.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {paidSales.length === 0 && (
          <p className="text-xs text-slate-400 mt-4 flex items-start gap-1.5">
            <TrendingUp size={13} className="mt-0.5 flex-shrink-0" />
            Belum ada undangan yang terjual lewat kodemu. Kode itu dipakai klien
            saat pembayaran, dan komisinya masuk otomatis setelah lunas.
          </p>
        )}

        <Link to="/dashboard/referrals" className="btn-secondary text-xs mt-5 inline-block">
          Kode &amp; penarikan komisi
        </Link>
      </Card>
    </div>
  )
}
