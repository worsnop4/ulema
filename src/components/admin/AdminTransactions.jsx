import React, { useState, useEffect } from 'react'
import { Users, DollarSign, Award, CheckCircle2, History, AlertTriangle, CheckSquare } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PACKAGE_NAMES, PACKAGE_DURATION_MONTHS } from '../../config/constants'

// Payments are automatic via Midtrans now, so this screen is a monitoring
// dashboard — not an approval queue. It shows analytics, a read-only
// transaction history, recent signups, and a small safety net to manually
// activate a Midtrans payment that got stuck 'pending' (e.g. a missed webhook).
const STUCK_THRESHOLD_MS = 60 * 60 * 1000 // 1 hour

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [message, setMessage] = useState('')

  // Pure loader — returns data instead of calling setState, so the effect can
  // use the .then(setter) pattern (react-hooks/set-state-in-effect).
  async function loadData() {
    const [txRes, usersRes] = await Promise.all([
      supabase.from('transactions').select('*, profiles(email, name)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, name, email, package_type, package_expiry, created_at')
    ])
    const txs = (txRes.data || []).map(t => ({
      ...t,
      userEmail: t.profiles?.email || 'Unknown',
      date: new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      desc: `Kategori ${t.package_name}`,
      finalAmount: t.amount,
      voucherCode: t.voucher_code,
      discount: t.discount_amount || 0,
    }))
    return { txs, profiles: usersRes.data || [] }
  }

  const applyData = ({ txs, profiles }) => {
    setTransactions(txs)
    setUsers(profiles)
    setIsLoading(false)
  }

  useEffect(() => { loadData().then(applyData) }, [])

  // Safety net: activate a stuck Midtrans payment manually (sets the package +
  // a fresh expiry and releases any referral commission), same effect the
  // notification webhook would have had.
  const handleActivate = async (tx) => {
    const packageName = PACKAGE_NAMES.find(p => p === tx.package_name) || 'Special'

    const { error: txError } = await supabase.from('transactions').update({ status: 'approved' }).eq('id', tx.id)
    if (txError) {
      alert('Gagal mengaktifkan transaksi (Cek RLS): ' + txError.message)
      return
    }

    const expiry = new Date()
    expiry.setMonth(expiry.getMonth() + PACKAGE_DURATION_MONTHS)
    const { error: profileError } = await supabase.from('profiles')
      .update({ package_type: packageName, package_expiry: expiry.toISOString() })
      .eq('id', tx.user_id)
    if (profileError) {
      alert('Transaksi diaktifkan tapi gagal update paket user: ' + profileError.message)
      return
    }

    // Release referral commission if this transaction had a pending one.
    try {
      const { data: refHistory } = await supabase.from('referral_history')
        .select('id, referrer_id, commission_amount')
        .eq('transaction_id', tx.id)
        .eq('status', 'pending')
        .single()

      if (refHistory) {
        await supabase.from('referral_history').update({ status: 'available' }).eq('id', refHistory.id)
        await supabase.rpc('increment_wallet_balance', {
          user_id_input: refHistory.referrer_id,
          amount_input: refHistory.commission_amount
        })
      }
    } catch (err) {
      console.error('Error memproses komisi referral:', err)
    }

    loadData().then(applyData)
    setMessage(`🎉 Paket ${packageName} berhasil diaktifkan untuk ${tx.userEmail}.`)
    setTimeout(() => setMessage(''), 4000)
  }

  // ── Analytics ────────────────────────────────────────────────────
  // Snapshot "now" once (lazy init) — react-hooks/purity forbids Date.now()
  // during render, and a mount-time value is fine for these comparisons.
  const [now] = useState(() => Date.now())

  const totalRevenue = transactions
    .filter(t => t.status === 'approved')
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  const totalUsers = users.length

  // Active invitations = paid tier that hasn't lapsed (mirrors is_user_active).
  const activeInvitations = users.filter(u => {
    const pkg = u.package_type
    if (!pkg || pkg === 'none' || pkg === 'free') return false
    if (u.package_expiry && new Date(u.package_expiry).getTime() <= now) return false
    return true
  }).length

  // Most popular active package.
  let topTheme = 'Belum Ada'
  let topThemePercentage = 0
  if (users.length > 0) {
    const packageCounts = users.reduce((acc, user) => {
      const pkg = (user.package_type === 'free' ? 'none' : user.package_type) || 'none'
      acc[pkg] = (acc[pkg] || 0) + 1
      return acc
    }, {})
    let maxPkg = 'none'
    let maxCount = 0
    Object.keys(packageCounts).forEach(pkg => {
      if (pkg !== 'none' && packageCounts[pkg] > maxCount) {
        maxCount = packageCounts[pkg]
        maxPkg = pkg
      }
    })
    if (maxCount > 0) {
      topTheme = maxPkg
      topThemePercentage = Math.round((maxCount / users.length) * 100)
    }
  }

  const recentTransactions = transactions.slice(0, 15)
  const stuckPending = transactions.filter(t => t.status === 'pending' && (now - new Date(t.created_at).getTime()) > STUCK_THRESHOLD_MS)
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  const statusBadge = (s) => {
    if (s === 'approved') return { label: 'Lunas', cls: 'bg-green-50 text-green-700' }
    if (s === 'rejected') return { label: 'Gagal', cls: 'bg-red-50 text-red-600' }
    return { label: 'Menunggu', cls: 'bg-amber-50 text-amber-700' }
  }

  const statCards = [
    { icon: Users, tint: 'bg-blue-50 text-blue-600', label: 'Total Pengguna', value: totalUsers },
    { icon: DollarSign, tint: 'bg-emerald-50 text-emerald-600', label: 'Pendapatan Bersih', value: `Rp ${(totalRevenue / 1000).toLocaleString('id-ID')}k` },
    { icon: CheckCircle2, tint: 'bg-teal-50 text-teal-600', label: 'Undangan Aktif', value: activeInvitations },
    { icon: Award, tint: 'bg-amber-50 text-amber-600', label: 'Paket Terlaris', value: topTheme === 'Belum Ada' ? 'Belum Ada' : `Paket ${topTheme}`, sub: topTheme === 'Belum Ada' ? null : `${topThemePercentage}% pengguna` },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {message && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 text-sm rounded-2xl px-5 py-4">
          <p className="font-semibold">{message}</p>
        </div>
      )}

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.tint}`}>
                <Icon size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{card.label}</p>
                <p className="text-xl font-bold text-slate-800 font-serif mt-0.5 truncate">{card.value}</p>
                {card.sub && <span className="text-[10px] text-slate-400 font-medium">{card.sub}</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Safety net: stuck Midtrans payments (only shown when any exist) */}
      {stuckPending.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="text-amber-500" size={20} />
            <h2 className="font-semibold text-slate-800 text-base">Perlu Perhatian — Pembayaran Tertunda ({stuckPending.length})</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">Transaksi ini berstatus menunggu &gt; 1 jam. Jika pelanggan sudah membayar tetapi belum aktif (webhook gagal), aktifkan manual.</p>
          <div className="space-y-3">
            {stuckPending.map(tx => {
              const hours = Math.floor((now - new Date(tx.created_at).getTime()) / STUCK_THRESHOLD_MS)
              return (
                <div key={tx.id} className="bg-white border border-amber-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm">{tx.desc}</p>
                    <p className="text-xs text-slate-500">User: <strong>{tx.userEmail}</strong></p>
                    <p className="text-[10px] text-slate-400">ID: <span className="font-mono">{tx.id}</span> • {tx.date} • menunggu ~{hours} jam</p>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-3">
                    <span className="font-bold font-mono text-sm text-slate-900">Rp {(tx.finalAmount || 0).toLocaleString('id-ID')}</span>
                    <button onClick={() => handleActivate(tx)} className="flex items-center gap-1 bg-green-600 text-white hover:bg-green-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-sm shadow-green-200">
                      <CheckSquare size={13} /> Aktifkan Manual
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction history (read-only) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b pb-3">
            <History className="text-slate-500" size={20} />
            <h2 className="font-semibold text-slate-800 text-base">Riwayat Transaksi</h2>
          </div>

          <div className="space-y-3">
            {isLoading && (
              <div className="text-center py-12 text-slate-400 text-sm">Memuat transaksi…</div>
            )}
            {!isLoading && recentTransactions.map(tx => {
              const badge = statusBadge(tx.status)
              return (
                <div key={tx.id} className="border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/50">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 text-sm">{tx.desc}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">User: <strong>{tx.userEmail}</strong></p>
                    <p className="text-[10px] text-slate-400">{tx.date}
                      {tx.voucherCode && <span className="text-teal-600 font-semibold"> • Voucher {tx.voucherCode} (-Rp {(tx.discount || 0).toLocaleString('id-ID')})</span>}
                    </p>
                  </div>
                  <div className="text-left md:text-right flex-shrink-0">
                    <span className="text-[10px] text-slate-400 block">Nominal</span>
                    <span className="font-bold font-mono text-sm text-slate-900">Rp {(tx.finalAmount || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )
            })}
            {!isLoading && recentTransactions.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">Belum ada transaksi.</div>
            )}
          </div>
        </div>

        {/* Recent user registrations */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 text-sm mb-4 border-b pb-2">Registrasi Pengguna Baru</h2>
          <div className="space-y-3">
            {recentUsers.map((u, i) => {
              const active = u.package_type && u.package_type !== 'none' && u.package_type !== 'free'
              return (
                <div key={i} className="border border-slate-100 rounded-xl p-3 flex flex-col gap-1.5 bg-slate-50/50">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-slate-800 text-xs">{u.name}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {active ? 'Aktif' : 'Non-aktif'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="truncate">{u.email}</span>
                    <span className="font-bold text-slate-700 flex-shrink-0">{active ? u.package_type : 'Belum Bayar'}</span>
                  </div>
                </div>
              )
            })}
            {recentUsers.length === 0 && (
              <div className="text-center py-4 text-slate-400 text-xs">Belum ada pengguna.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
