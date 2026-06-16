import { useState, useEffect } from 'react'
import { getTransactions, saveTransactions, getPricing, getVouchers, getThemes } from '../hooks/useSharedInvitation'
import { CreditCard, CheckCircle2, AlertCircle, Clock, Percent, ShieldCheck, Upload, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../App'

export default function TransactionPage() {
  const { user } = useAuth()
  
  // States for dynamic data
  const [transactions, setTransactions] = useState(() => getTransactions())
  const [pricing, setPricing] = useState(() => getPricing())
  const [vouchers, setVouchers] = useState(() => getVouchers())
  const [themes] = useState(() => getThemes())

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
  const [paymentProofFile, setPaymentProofFile] = useState(null) // Base64 string
  
  // Sync changes
  useEffect(() => {
    const handleUpdate = () => {
      setTransactions(getTransactions())
      setPricing(getPricing())
      setVouchers(getVouchers())
    }
    window.addEventListener('local-storage-update', handleUpdate)
    return () => window.removeEventListener('local-storage-update', handleUpdate)
  }, [])

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

  // Apply Voucher
  const handleApplyVoucher = () => {
    setVoucherError('')
    setAppliedVoucher(null)
    const code = voucherCode.trim().toUpperCase()
    
    if (!code) return

    const v = vouchers.find(x => x.code === code)
    if (!v) {
      setVoucherError('Kode voucher tidak valid.')
      return
    }

    if (v.used >= v.maxUse) {
      setVoucherError('Kode voucher sudah habis digunakan.')
      return
    }

    setAppliedVoucher(v)
  }

  // Handle Payment Submission
  const handlePay = (e) => {
    e.preventDefault()
    
    const newTx = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      desc: `Kategori ${selectedPlan}`,
      themeName: selectedThemeName,
      amount: basePrice,
      discount: discountAmount,
      finalAmount: finalPrice,
      status: 'pending',
      userEmail: user?.email || 'demo@ulema.id',
      voucherCode: appliedVoucher ? appliedVoucher.code : '',
      paymentProof: paymentProofFile || ''
    }

    const updated = [newTx, ...transactions]
    saveTransactions(updated)
    setTransactions(updated)

    // Clear form
    setVoucherCode('')
    setAppliedVoucher(null)
    setPaymentSuccess('🎉 Konfirmasi transfer berhasil dikirim! Silakan tunggu verifikasi admin.')
    setTimeout(() => setPaymentSuccess(''), 6000)
  }

  // Filter transactions for this user only
  const myTransactions = transactions.filter(t => t.userEmail === (user?.email || 'demo@ulema.id'))
  
  // Check if there is already a pending transaction for the currently selected plan
  const hasPendingTransaction = myTransactions.some(t => t.status === 'pending' && t.desc === `Kategori ${selectedPlan}`)

  // Available themes for the selected plan
  const availableThemes = themes.filter(t => t.category === selectedPlan)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPaymentProofFile(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Keuangan</p>
        <h1 className="font-serif text-3xl font-bold text-slate-900">Transaksi & Upgrade</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola transaksi, upgrade paket undangan, dan gunakan kode promo.</p>
      </div>

      {/* Unpaid Warning Banner */}
      {user && user.role !== 'admin' && user.package === 'none' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-2xl p-5 space-y-2 flex items-start gap-3 shadow-sm">
          <AlertCircle size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-base text-amber-900">Akun Anda Belum Aktif</p>
            <p className="text-xs text-amber-700 leading-relaxed mt-1">
              Anda telah mendaftar dengan pilihan kategori awal <strong className="text-amber-900">{user?.selectedCategory || 'Special'}</strong>. 
              Silakan selesaikan pembayaran di bawah ini dan unggah bukti transfer. 
              Setelah pembayaran diverifikasi oleh administrator, Anda akan mendapatkan akses penuh untuk menyesuaikan undangan digital Anda.
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Checkout/Upgrade */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-slate-800 text-base mb-4 border-b pb-2">
              {user?.package === 'none' ? 'Selesaikan Pembayaran Kategori' : 'Upgrade Kategori Undangan'}
            </h2>
            
            <form onSubmit={handlePay} className="space-y-5">
              {/* Plan selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Kategori</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(pricing).map(plan => {
                    const price = pricing[plan]
                    const isActive = selectedPlan === plan
                    return (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => {
                          setSelectedPlan(plan)
                          setAppliedVoucher(null)
                          setVoucherCode('')
                        }}
                        className={`text-left p-3 rounded-xl border-2 transition-all flex flex-col justify-between ${
                          isActive ? 'border-brand-500 bg-brand-50/10' : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <span className="font-bold text-[10px] text-slate-400 uppercase truncate">{plan}</span>
                        <span className="font-serif text-xs font-bold text-slate-800 mt-2">
                          Rp {(price / 1000).toFixed(0)}k
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

              {/* Payment Details */}
              <div className="border border-amber-100 rounded-xl p-4 bg-amber-50/50 text-xs text-amber-800 space-y-1.5">
                <p className="font-bold">🏦 Informasi Rekening Pembayaran:</p>
                <p>Transfer Bank Mandiri: <strong>123-456-789-0</strong>01 a/n <strong>PT Ulema Digital</strong></p>
                <p>Silakan transfer nominal pas ke nomor rekening di atas, kemudian klik konfirmasi di bawah.</p>
              </div>

              {/* File Upload for Payment Proof */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Unggah Bukti Transfer</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required
                  />
                  <div className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-xl transition-colors ${paymentProofFile ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-300 hover:bg-slate-50'}`}>
                    {paymentProofFile ? (
                      <>
                        <ImageIcon size={18} className="text-brand-600" />
                        <span className="text-sm font-semibold text-brand-700 truncate">Foto Bukti Terunggah</span>
                      </>
                    ) : (
                      <>
                        <Upload size={18} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-500">Klik untuk memilih foto struk...</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={hasPendingTransaction}
                className={`w-full flex justify-center items-center gap-2 py-3 text-sm rounded-xl font-bold transition-all shadow-sm ${
                  hasPendingTransaction 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-md'
                }`}
              >
                {hasPendingTransaction ? (
                  <>
                    <Clock size={16} /> Menunggu Konfirmasi Admin
                  </>
                ) : (
                  <>
                    <CreditCard size={16} /> Konfirmasi & Kirim Bukti Transfer
                  </>
                )}
              </button>
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
                    {tx.status === 'paid' ? (
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
    </div>
  )
}
