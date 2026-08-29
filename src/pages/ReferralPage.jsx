import { useState, useEffect } from 'react'
import { Share2, Copy, Check, Users, TrendingUp, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'
import { ADMIN_WHATSAPP, REFERRAL_MIN_WITHDRAWAL, REFERRAL_COMMISSION_RATE } from '../config/constants'
import { requestWithdrawal, fetchMyWithdrawals } from '../services/billingService'

const WITHDRAW_STATUS = {
  pending:    { label: 'Menunggu diproses', cls: 'bg-amber-100 text-amber-700' },
  processing: { label: 'Sedang ditransfer', cls: 'bg-blue-100 text-blue-700' },
  paid:       { label: 'Sudah ditransfer',  cls: 'bg-green-100 text-green-700' },
  rejected:   { label: 'Ditolak',           cls: 'bg-red-100 text-red-700' },
}

export default function ReferralPage() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [walletBalance, setWalletBalance] = useState(0)
  // Tarif akun ini, bukan tarif global — vendor memakai angkanya sendiri.
  const [commissionRate, setCommissionRate] = useState(REFERRAL_COMMISSION_RATE)
  const [orders, setOrders] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)

  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({ method: 'BCA', accNumber: '', accName: '' })
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchReferralData()
    }
  }, [user])

  const fetchReferralData = async () => {
    setLoading(true)
    
    // 1. Dapatkan kode referral dan saldo dari profile
    const { data: profile } = await supabase.from('profiles').select('referral_code, wallet_balance, name, commission_rate').eq('id', user.id).single()
    
    let currentCode = profile?.referral_code
    if (!currentCode) {
      // Jika user lama belum punya kode, buatkan
      const baseName = (profile?.name || 'USER').split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '')
      currentCode = `${baseName}${Math.floor(100 + Math.random() * 900)}`
      await supabase.from('profiles').update({ referral_code: currentCode }).eq('id', user.id)
    }
    
    setReferralCode(currentCode)
    setWalletBalance(profile?.wallet_balance || 0)
    setCommissionRate(Number(profile?.commission_rate ?? REFERRAL_COMMISSION_RATE))

    // 2. Dapatkan riwayat referral
    const { data: history } = await supabase.from('referral_history')
      .select(`
        commission_amount, status, created_at,
        referred_user:referred_user_id (name, email)
      `)
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false })

    if (history) {
      const mapped = history.map(h => ({
        name: h.referred_user?.name || 'User Baru',
        email: h.referred_user?.email || 'N/A',
        commission: h.commission_amount,
        date: new Date(h.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: h.status
      }))
      setOrders(mapped)
    }

    // Riwayat penarikan. Tanpa ini saldo yang dipotong tidak punya jejak
    // apa pun di layar, dan vendor cuma melihat angkanya hilang.
    setWithdrawals(await fetchMyWithdrawals())

    setLoading(false)
  }

  const handleCopy = () => {
    const link = `https://ulema.id/r/${referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()
    if (walletBalance < REFERRAL_MIN_WITHDRAWAL) {
      alert(`Minimal penarikan adalah Rp ${REFERRAL_MIN_WITHDRAWAL.toLocaleString('id-ID')}`)
      return
    }
    
    setWithdrawing(true)
    const amount = walletBalance

    // Satu panggilan: potong saldo dan catat permintaannya sekaligus. Versi
    // lama melakukannya sebagai dua panggilan terpisah dari browser, jadi
    // kegagalan di antara keduanya meninggalkan saldo dan catatan yang
    // bertentangan soal uang sungguhan.
    const { error } = await requestWithdrawal({
      amount,
      method: withdrawForm.method,
      accountNumber: withdrawForm.accNumber,
      accountName: withdrawForm.accName,
    })

    if (!error) {
      setWalletBalance(0)
      setWithdrawals(await fetchMyWithdrawals())

      const message = `Halo Admin Ulema! Saya ingin menarik komisi referral saya sebesar Rp ${amount.toLocaleString('id-ID')} ke rekening ${withdrawForm.method} - ${withdrawForm.accNumber} a.n. ${withdrawForm.accName}. Mohon diproses ya.`
      window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank')

      setShowWithdraw(false)
      alert('Permintaan penarikan tercatat! Statusnya bisa kamu pantau di daftar Penarikan Komisi.')
    } else {
      alert('Gagal memproses penarikan: ' + error.message)
    }
    setWithdrawing(false)
  }

  const pendingWithdrawTotal = withdrawals
    .filter(w => w.status === 'pending' || w.status === 'processing')
    .reduce((sum, w) => sum + Number(w.amount || 0), 0)

  const referralLink = `https://ulema.id/r/${referralCode}`
  const totalCommission = orders.filter(o => o.status !== 'pending').reduce((sum, o) => sum + o.commission, 0)
  const pendingCommission = orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + o.commission, 0)

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat data referral...</div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Akun</p>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Referrals</h1>
        <p className="text-slate-500 text-sm mt-1">Ajak temanmu, dapatkan komisi menarik!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Referral', value: orders.length.toString(), icon: Users, color: 'text-brand-600 bg-brand-50' },
          { label: 'Total Komisi', value: `Rp ${totalCommission.toLocaleString('id-ID')}`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Saldo Aktif', value: `Rp ${walletBalance.toLocaleString('id-ID')}`, icon: Share2, color: 'text-amber-600 bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="stat-card text-center items-center">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={16} />
            </div>
            <p className="text-xl font-bold text-slate-900 font-serif">{s.value}</p>
            <p className="text-[11px] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {walletBalance >= 50000 && !showWithdraw && (
        <button onClick={() => setShowWithdraw(true)} className="w-full btn-primary py-3 flex justify-center shadow-md shadow-brand-500/20 animate-fade-in">
          Tarik Saldo Komisi (Rp {walletBalance.toLocaleString('id-ID')})
        </button>
      )}

      {showWithdraw && (
        <form onSubmit={handleWithdraw} className="bg-white rounded-2xl border border-surface-border shadow-card p-6 animate-fade-in space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-slate-800">Tarik Saldo Komisi</h2>
            <button type="button" onClick={() => setShowWithdraw(false)} className="text-slate-400 hover:text-slate-600">Batal</button>
          </div>
          <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-xs flex gap-2">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <p>Setelah menekan tombol konfirmasi, Anda akan diarahkan ke WhatsApp Admin untuk validasi penarikan secara manual.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Metode</label>
              <select value={withdrawForm.method} onChange={e => setWithdrawForm({...withdrawForm, method: e.target.value})} className="w-full input-field py-2 text-sm">
                <option>BCA</option>
                <option>Mandiri</option>
                <option>BRI</option>
                <option>BNI</option>
                <option>GoPay</option>
                <option>OVO</option>
                <option>Dana</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nomor Rekening / HP</label>
              <input required value={withdrawForm.accNumber} onChange={e => setWithdrawForm({...withdrawForm, accNumber: e.target.value})} type="text" className="w-full input-field py-2 text-sm" placeholder="Contoh: 1234567890" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Pemilik Rekening</label>
            <input required value={withdrawForm.accName} onChange={e => setWithdrawForm({...withdrawForm, accName: e.target.value})} type="text" className="w-full input-field py-2 text-sm" placeholder="Sesuai buku tabungan" />
          </div>
          <button type="submit" disabled={withdrawing} className="w-full btn-primary py-2.5 flex justify-center shadow-md mt-2 disabled:opacity-50">
            {withdrawing ? 'Memproses...' : 'Lanjut ke WhatsApp Admin'}
          </button>
        </form>
      )}

      {/* Referral Code */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card p-6">
        <h2 className="font-semibold text-slate-800 text-sm mb-1">Kode Referralmu</h2>
        <p className="text-xs text-slate-500 mb-4">Bagikan kode atau link di bawah ini kepada temanmu.</p>
        <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-3">
          <span className="font-mono font-bold text-brand-700 text-lg flex-1">{referralCode}</span>
          <button onClick={handleCopy} className="btn-primary py-1.5 text-xs">
            {copied ? <><Check size={12} /> Disalin!</> : <><Copy size={12} /> Salin Link</>}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 font-mono break-all">{referralLink}</p>
        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-amber-700">💰 Komisi: {Math.round(commissionRate * 100)}% untuk setiap pembelian</p>
          <p className="text-[11px] text-amber-600 mt-0.5">Komisi langsung masuk ke saldo akunmu setelah pesanan temanmu disetujui (lunas). Temanmu juga mendapat diskon Rp 10.000!</p>
        </div>
      </div>

      {/* Referral Orders Table */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 text-sm">Riwayat Referral Order</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Belum ada riwayat referral. Ajak temanmu sekarang!</div>
          ) : orders.map((r, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {r.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{r.name}</p>
                <p className="text-[11px] text-slate-400">{r.email} · {r.date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-sm text-brand-700">Rp {r.commission.toLocaleString('id-ID')}</p>
                <span className={`badge text-[10px] ${r.status !== 'pending' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {r.status !== 'pending' ? 'Selesai' : 'Menunggu'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Penarikan Komisi — inilah jejak yang dulu tidak ada. Saldo dipotong
          begitu permintaan dibuat, jadi tanpa daftar ini uangnya seolah
          menghilang sampai admin selesai mentransfer. */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-800 text-sm">Penarikan Komisi</h2>
          {pendingWithdrawTotal > 0 && (
            <span className="badge text-[10px] bg-amber-100 text-amber-700">
              Rp {pendingWithdrawTotal.toLocaleString('id-ID')} sedang diproses
            </span>
          )}
        </div>
        <div className="divide-y divide-slate-100">
          {withdrawals.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Belum ada penarikan.</div>
          ) : withdrawals.map(w => {
            const s = WITHDRAW_STATUS[w.status] || WITHDRAW_STATUS.pending
            return (
              <div key={w.id} className="px-5 py-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">
                    Rp {Number(w.amount).toLocaleString('id-ID')}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {w.payment_method} · {w.account_number} a.n. {w.account_name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Diminta {new Date(w.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {w.processed_at && ` · Diproses ${new Date(w.processed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </p>
                </div>
                <span className={`badge text-[10px] flex-shrink-0 ${s.cls}`}>{s.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
