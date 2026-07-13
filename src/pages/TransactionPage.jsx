import { useState, useEffect } from 'react'
import { getThemes } from '../hooks/useSharedInvitation'
import { fetchPricing, validateVoucher, findReferrer } from '../services/billingService'
import { CreditCard, CheckCircle2, AlertCircle, Clock, Percent, ShieldCheck, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../App'
import { storageService } from '../services/storageService'
import { supabase } from '../lib/supabase'
import { REFERRAL_DISCOUNT_AMOUNT } from '../config/constants'

export default function TransactionPage() {
  const { user } = useAuth()
  
  const [transactions, setTransactions] = useState([])
  const [isLoadingTx, setIsLoadingTx] = useState(true)
  const [pricing, setPricing] = useState({ Special: 99000, Adat: 110000, Motion: 140000, Luxury: 175000 })
  const [themes] = useState(() => getThemes())

  const [showPaymentForm, setShowPaymentForm] = useState(false)

  useEffect(() => {
    async function fetchTx() {
      if (!user?.id) return
      setIsLoadingTx(true)
      const { data } = await supabase.from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setTransactions(data)
      
      const hasPending = data?.some(t => t.status === 'pending')
      setShowPaymentForm(user?.package === 'none' && !hasPending)
      setIsLoadingTx(false)
    }
    fetchTx()
  }, [user])

  // Form states
  const [selectedPlan, setSelectedPlan] = useState(() => {
    return user?.selectedCategory || 'Special'
  })
  
  // Initialize theme name based on user data or fallback to first theme of selected plan
  const initialThemeName = user?.selectedThemeName || themes.find(t => t.category === (user?.selectedCategory || 'Special'))?.name || ''
  const [selectedThemeName, setSelectedThemeName] = useState(initialThemeName)

  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(null)
  const [voucherError, setVoucherError] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState('')
  const [midtransBusy, setMidtransBusy] = useState(false)
  
  // Load authoritative prices from the DB (matches what the server charges).
  useEffect(() => {
    fetchPricing().then(setPricing)
  }, [])

  // Load Midtrans Snap.js once. Environment comes from an explicit flag
  // (VITE_MIDTRANS_IS_PRODUCTION="true" = production), defaulting to sandbox —
  // key prefixes aren't reliable across Midtrans accounts.
  const midtransClientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY
  useEffect(() => {
    if (!midtransClientKey || document.getElementById('midtrans-snap')) return
    const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
    const script = document.createElement('script')
    script.id = 'midtrans-snap'
    script.src = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', midtransClientKey)
    document.body.appendChild(script)
  }, [midtransClientKey])

  // Pay via Midtrans Snap: ask our serverless function for a Snap token
  // (server sets the price + creates the pending tx), then open the popup.
  // Activation happens automatically via the webhook — no admin needed.
  const handleMidtransPay = async () => {
    if (midtransBusy) return
    if (!window.snap) {
      alert('Gagal memuat pembayaran. Muat ulang halaman lalu coba lagi.')
      return
    }
    setMidtransBusy(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token
      if (!accessToken) {
        alert('Sesi Anda berakhir. Silakan login ulang.')
        return
      }
      const resp = await fetch('/api/midtrans/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageName: selectedPlan, voucherCode: appliedVoucher?.code || '', accessToken }),
      })
      const result = await resp.json()
      if (!resp.ok || !result.token) {
        alert('Gagal memulai pembayaran: ' + (result.error || 'coba lagi.'))
        return
      }
      window.snap.pay(result.token, {
        onSuccess: () => {
          setPaymentSuccess('🎉 Pembayaran berhasil! Undangan Anda sedang diaktifkan...')
          setTimeout(() => window.location.reload(), 3500)
        },
        onPending: () => {
          setPaymentSuccess('⏳ Menunggu pembayaran. Undangan aktif otomatis setelah pembayaran selesai.')
          setShowPaymentForm(false)
        },
        onError: () => alert('Pembayaran gagal. Silakan coba lagi.'),
        onClose: () => { /* user closed the popup without finishing */ },
      })
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message)
    } finally {
      setMidtransBusy(false)
    }
  }

  // Calculate prices
  const basePrice = pricing[selectedPlan] || 99000
  let discountAmount = 0
  if (appliedVoucher) {
    if (appliedVoucher.type === 'percent') {
      discountAmount = Math.round((basePrice * appliedVoucher.discount) / 100)
    } else {
      discountAmount = appliedVoucher.discount
    }
  }
  const finalPrice = Math.max(0, basePrice - discountAmount)

  // Apply Voucher or Referral Code (validated server-side via RPCs — the same
  // rules the payment server re-checks, so client & server always agree).
  const handleApplyVoucher = async () => {
    setVoucherError('')
    setAppliedVoucher(null)
    const code = voucherCode.trim().toUpperCase()
    if (!code) return

    // 1) Voucher (validate_voucher already excludes exhausted codes)
    const v = await validateVoucher(code)
    if (v) { setAppliedVoucher(v); return }

    // 2) Referral (find_referrer_by_code already excludes the caller's own code)
    const referrerId = await findReferrer(code)
    if (referrerId) {
      setAppliedVoucher({ type: 'referral', code, discount: REFERRAL_DISCOUNT_AMOUNT, referrer_id: referrerId })
    } else {
      setVoucherError('Kode promo atau referral tidak ditemukan atau kuota habis.')
    }
  }

  const myTransactions = transactions.map(t => ({
    id: t.id,
    date: new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    desc: `Kategori ${t.package_name}`,
    finalAmount: t.amount,
    status: t.status,
    paymentProof: t.payment_proof_url,
    rejectionReason: t.rejection_reason
  }))
  
  // Available themes for the selected plan
  const availableThemes = themes.filter(t => t.category === selectedPlan)

  // Handle instant theme change for active packages
  const handleInstantThemeChange = (themeName, themeId) => {
    if (!user) return
    const updatedUser = { ...user, selectedThemeName: themeName, themeId: themeId }
    storageService.setItem('inviter_user', updatedUser)
    window.dispatchEvent(new Event('local-storage-update'))
    
    // Also update registered users list if needed
    const usersList = storageService.getItem('inviter_registered_users') || []
    const updatedUsersList = usersList.map(u => u.email === user.email ? updatedUser : u)
    storageService.setItem('inviter_registered_users', updatedUsersList)
    
    setPaymentSuccess(`Desain tema berhasil diubah ke ${themeName}!`)
    setTimeout(() => setPaymentSuccess(''), 4000)
  }

  // Filter themes for the Dashboard Main View (Ganti Tema section)
  const dashboardThemes = user?.package === 'Luxury' 
    ? themes // Luxury gets all themes
    : themes.filter(t => t.category === user?.package) // Others get themes from their package

  // Build-first funnel: we no longer hard-lock the whole account while a
  // payment is pending. Users can keep preparing their invitation in the
  // editor; only publishing/sharing the live link is gated on payment.
  const hasPendingReview = user && user.role !== 'admin' && user.package === 'none' && myTransactions.some(t => t.status === 'pending')

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Keuangan</p>
        <h1 className="font-serif text-3xl font-bold text-slate-900">Transaksi & Upgrade</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola transaksi, upgrade paket undangan, dan gunakan kode promo.</p>
      </div>

      {/* Pending Banner — a payment was started but not completed yet */}
      {hasPendingReview && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-2xl p-5 space-y-2 flex items-start gap-3 shadow-sm">
          <Clock size={22} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-base text-blue-900">Pembayaran Belum Selesai</p>
            <p className="text-xs text-blue-700 leading-relaxed mt-1">
              Ada pembayaran yang belum tuntas. Selesaikan pembayaran untuk mengaktifkan undangan —
              begitu berhasil, undangan <strong>aktif otomatis</strong>. Sementara itu Anda tetap bisa menyiapkan undangan di menu Editor.
            </p>
          </div>
        </div>
      )}

      {/* Unpaid Warning Banner (no pending payment yet) */}
      {user && user.role !== 'admin' && user.package === 'none' && !hasPendingReview && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-2xl p-5 space-y-2 flex items-start gap-3 shadow-sm">
          <AlertCircle size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-base text-amber-900">Undangan Anda Belum Aktif</p>
            <p className="text-xs text-amber-700 leading-relaxed mt-1">
              Anda bisa <strong className="text-amber-900">mulai menyiapkan undangan sekarang</strong> di menu Editor.
              Untuk bisa <strong className="text-amber-900">membagikan link undangan ke tamu</strong>, selesaikan pembayaran kategori
              <strong className="text-amber-900"> {user?.selectedCategory || 'Special'}</strong> di bawah ini dan unggah bukti transfer.
              Setelah diverifikasi admin, undangan langsung aktif.
            </p>
          </div>
        </div>
      )}

      {paymentSuccess && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 text-sm rounded-2xl px-5 py-4 flex items-center gap-3">
          <ShieldCheck className="text-teal-600 flex-shrink-0" size={20} />
          <p className="font-medium">{paymentSuccess}</p>
        </div>
      )}

      {!showPaymentForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Active Package Info */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="font-semibold text-slate-800 text-base mb-4 border-b pb-2">Informasi Paket Anda</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Status Langganan</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase ${user?.package !== 'none' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {user?.package !== 'none' ? 'Aktif' : 'Belum Bayar'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Kategori Saat Ini</p>
                  <p className="text-xl font-serif font-bold text-slate-800">{user?.package !== 'none' ? user?.package : (user?.selectedCategory || '-')}</p>
                </div>
              </div>
            </div>
            
            {user?.package !== 'Luxury' ? (
              <button 
                onClick={() => setShowPaymentForm(true)}
                className="btn-primary w-full justify-center py-3 text-sm rounded-xl"
              >
                <CreditCard size={15} /> {user?.package === 'none' ? 'Bayar Tagihan Sekarang' : 'Upgrade Kategori Lain'}
              </button>
            ) : (
              <div className="bg-gradient-to-r from-amber-200 to-yellow-400 p-[2px] rounded-xl">
                <div className="bg-white rounded-[10px] p-3 text-center">
                  <p className="text-amber-700 font-bold text-sm flex items-center justify-center gap-1.5">
                    <Sparkles size={16} /> Paket Tertinggi Terbuka
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Anda bisa menggunakan seluruh desain tema.</p>
                </div>
              </div>
            )}
          </div>

          {/* Transaction History (Main View) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-slate-800 text-base mb-4 border-b pb-2">Riwayat Pembayaran</h2>
            {isLoadingTx ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-sm font-medium text-slate-500">Memuat riwayat transaksi...</p>
              </div>
            ) : myTransactions.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-slate-100">
                <CreditCard className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-slate-500 font-medium">Belum ada riwayat transaksi.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myTransactions.map(tx => (
                <div key={tx.id} className="border border-slate-100 rounded-xl p-4 space-y-2 bg-slate-50/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{tx.desc}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.id} • {tx.date}</p>
                    </div>
                    {tx.status === 'approved' ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-50 text-green-700 rounded-full flex items-center gap-0.5">
                        <CheckCircle2 size={9} /> Lunas
                      </span>
                    ) : tx.status === 'pending' ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-full flex items-center gap-0.5">
                        <Clock size={9} /> Pending
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-50 text-red-650 rounded-full flex items-center gap-0.5">
                        Ditolak
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100/50">
                    <span className="text-[10px] text-slate-400">Total Nominal</span>
                    <span className="font-bold text-sm text-slate-850 font-mono">
                      Rp {tx.finalAmount ? tx.finalAmount.toLocaleString('id-ID') : tx.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  {tx.status === 'rejected' && tx.rejectionReason && (
                    <p className="text-[10px] text-red-600 bg-red-50 rounded-lg px-2 py-1.5 leading-relaxed">
                      <strong>Alasan ditolak:</strong> {tx.rejectionReason}
                    </p>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>
          
          {/* Instant Theme Change Section (Only for active users) */}
          {user?.package !== 'none' && (
            <div className="md:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="font-semibold text-slate-800 text-base">Ganti Desain Tema</h2>
                {user?.package === 'Luxury' && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Sparkles size={10} /> Akses Semua Tema
                  </span>
                )}
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {dashboardThemes.map(theme => {
                  const isCurrent = user?.selectedThemeName === theme.name || user?.themeId === theme.id
                  return (
                    <div key={theme.id} className="relative flex-shrink-0 w-36 flex flex-col snap-start group">
                      <div className={`h-48 rounded-2xl overflow-hidden border-2 transition-all mb-2 ${isCurrent ? 'border-brand-500 shadow-md ring-2 ring-brand-100 ring-offset-2' : 'border-slate-100 hover:border-slate-300'}`}>
                        {theme.thumbnail ? (
                          <img src={theme.thumbnail} alt={theme.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-4xl">
                            {theme.emoji}
                          </div>
                        )}
                        {/* Category Badge for Luxury Users to know where it's from */}
                        {user?.package === 'Luxury' && (
                          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {theme.category}
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate px-1">{theme.name}</p>
                      <button
                        onClick={() => handleInstantThemeChange(theme.name, theme.id)}
                        disabled={isCurrent}
                        className={`mt-2 py-1.5 px-3 rounded-lg text-[10px] font-bold transition-colors ${
                          isCurrent 
                            ? 'bg-brand-50 text-brand-600 border border-brand-200' 
                            : 'bg-slate-800 text-white hover:bg-slate-700'
                        }`}
                      >
                        {isCurrent ? 'Sedang Dipakai' : 'Ganti ke Tema Ini'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Checkout/Upgrade */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="font-semibold text-slate-800 text-base">
                {user?.package === 'none' ? 'Selesaikan Pembayaran Kategori' : 'Upgrade Kategori Undangan'}
              </h2>
              <button onClick={() => setShowPaymentForm(false)} className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                Batal
              </button>
            </div>
            
            <form onSubmit={e => e.preventDefault()} className="space-y-5">
              {/* Plan selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Kategori</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(pricing).map(plan => {
                    const price = pricing[plan]
                    const isActive = selectedPlan === plan
                    const isAlreadyOwned = user?.package === plan
                    
                    return (
                      <button
                        key={plan}
                        type="button"
                        disabled={isAlreadyOwned}
                        onClick={() => {
                          setSelectedPlan(plan)
                          setAppliedVoucher(null)
                          setVoucherCode('')
                        }}
                        className={`text-left p-3 rounded-xl border-2 transition-all flex flex-col justify-between ${
                          isAlreadyOwned 
                            ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed' 
                            : isActive 
                              ? 'border-brand-500 bg-brand-50/10' 
                              : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <span className="font-bold text-[10px] text-slate-400 uppercase truncate">{plan}</span>
                        <span className="font-serif text-xs font-bold text-slate-800 mt-2">
                          {isAlreadyOwned ? <span className="text-slate-500 italic font-sans text-[10px]">Sedang Aktif</span> : `Rp ${(price / 1000).toFixed(0)}k`}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Theme Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Desain Tema</label>
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                  {availableThemes.map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedThemeName(theme.name)}
                      className={`relative flex-shrink-0 w-28 h-40 rounded-xl overflow-hidden border-2 transition-all snap-start ${
                        selectedThemeName === theme.name ? 'border-brand-500 shadow-md ring-2 ring-brand-100 ring-offset-1' : 'border-slate-100 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {theme.thumbnail ? (
                        <img src={theme.thumbnail} alt={theme.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-3xl">
                          {theme.emoji}
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                        <p className="text-white text-[10px] font-bold truncate">{theme.name}</p>
                      </div>
                      {selectedThemeName === theme.name && (
                        <div className="absolute top-2 right-2 bg-brand-500 text-white rounded-full p-0.5">
                          <CheckCircle2 size={12} />
                        </div>
                      )}
                    </button>
                  ))}
                  {availableThemes.length === 0 && (
                    <div className="text-xs text-slate-400 p-4 border rounded-xl w-full text-center bg-slate-50">
                      Belum ada tema di kategori ini.
                    </div>
                  )}
                </div>
              </div>

              {/* Voucher code */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kode Voucher</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="form-input text-sm uppercase"
                    placeholder="Contoh: HAPPYWEDDING"
                    value={voucherCode}
                    onChange={e => setVoucherCode(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    className="btn-secondary text-xs px-4"
                  >
                    Terapkan
                  </button>
                </div>
                {voucherError && <p className="text-red-500 text-[11px] mt-1 font-semibold">{voucherError}</p>}
                {appliedVoucher && (
                  <p className="text-teal-600 text-[11px] mt-1 font-semibold flex items-center gap-1">
                    <Percent size={12} /> Voucher berhasil diterapkan! Potongan: 
                    <strong>
                      {appliedVoucher.type === 'percent' 
                        ? `${appliedVoucher.discount}%` 
                        : `Rp ${appliedVoucher.discount.toLocaleString('id-ID')}`}
                    </strong>
                  </p>
                )}
              </div>

              {/* Invoice Breakdown */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Kategori {selectedPlan}</span>
                  <span className="font-mono">Rp {basePrice.toLocaleString('id-ID')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-teal-600 font-semibold">
                    <span>Diskon Voucher</span>
                    <span className="font-mono">- Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="border-t border-slate-200/50 pt-2 flex justify-between text-sm font-bold text-slate-800">
                  <span>Total Bayar</span>
                  <span className="font-mono text-brand-600">Rp {finalPrice.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Pembayaran via Midtrans — instant activation, no admin */}
              {midtransClientKey ? (
                <div className="rounded-xl border-2 border-brand-200 bg-brand-50/40 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-brand-600" />
                    <p className="text-sm font-bold text-brand-800">Pembayaran Aman</p>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    QRIS / Virtual Account / kartu / e-wallet. Undangan <strong>langsung aktif otomatis</strong> setelah pembayaran berhasil.
                  </p>
                  <button
                    type="button"
                    onClick={handleMidtransPay}
                    disabled={midtransBusy}
                    className={`w-full flex justify-center items-center gap-2 py-3 text-sm rounded-xl font-bold transition-all shadow-sm ${
                      midtransBusy ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-md'
                    }`}
                  >
                    {midtransBusy
                      ? <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                      : <><CreditCard size={16} /> Bayar Rp {finalPrice.toLocaleString('id-ID')} Sekarang</>}
                  </button>
                  {appliedVoucher && (
                    <p className="text-[10px] text-teal-600 text-center font-semibold">Diskon voucher/referral sudah termasuk di total di atas.</p>
                  )}
                </div>
              ) : (
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 text-xs text-amber-800">
                  Pembayaran online sedang tidak tersedia. Silakan hubungi admin.
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Transaction History */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-slate-800 text-sm mb-4 border-b pb-2">Riwayat Transaksi Saya</h2>
            <div className="space-y-3">
              {myTransactions.map(tx => (
                <div key={tx.id} className="border border-slate-100 rounded-xl p-3.5 space-y-2 bg-slate-50/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{tx.desc}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.id} • {tx.date}</p>
                    </div>
                    {tx.status === 'approved' ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-50 text-green-700 rounded-full flex items-center gap-0.5">
                        <CheckCircle2 size={9} /> Lunas
                      </span>
                    ) : tx.status === 'pending' ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-full flex items-center gap-0.5">
                        <Clock size={9} /> Pending
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-50 text-red-650 rounded-full flex items-center gap-0.5">
                        Ditolak
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-100/50">
                    <span className="text-[10px] text-slate-400">Total Nominal</span>
                    <span className="font-bold text-xs text-slate-850 font-mono">
                      Rp {tx.finalAmount ? tx.finalAmount.toLocaleString('id-ID') : tx.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  {tx.status === 'rejected' && tx.rejectionReason && (
                    <p className="text-[10px] text-red-600 bg-red-50 rounded-lg px-2 py-1.5 leading-relaxed">
                      <strong>Alasan ditolak:</strong> {tx.rejectionReason}
                    </p>
                  )}
                </div>
              ))}
              {myTransactions.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  📭 Belum ada riwayat transaksi.
                </div>
              )}
            </div>
          </div>
        </div>

        </div>
      )}
    </div>
  )
}
