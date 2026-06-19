import React, { useState, useEffect } from 'react'
import { getPricing } from '../../hooks/useSharedInvitation'
import { Users, DollarSign, Award, AlertTriangle, CreditCard, XSquare, CheckSquare, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pricing, setPricing] = useState(() => getPricing())
  const [users, setUsers] = useState([])
  const [message, setMessage] = useState('')
  const [viewProofImage, setViewProofImage] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)
    const [txRes, usersRes] = await Promise.all([
      supabase.from('transactions').select('*, profiles(email)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*')
    ])
    
    if (txRes.data) {
      const mappedTx = txRes.data.map(t => ({
        ...t,
        userEmail: t.profiles?.email || 'Unknown',
        date: new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        desc: `Kategori ${t.package_name}`,
        finalAmount: t.amount,
        paymentProof: t.payment_proof_url
      }))
      setTransactions(mappedTx)
    }
    
    if (usersRes.data) {
      setUsers(usersRes.data)
    }
    setIsLoading(false)
  }

  const handleApprovePayment = async (txId, userId, packageDesc, userEmail) => {
    let packageName = 'Special'
    if (packageDesc.includes('Luxury')) packageName = 'Luxury'
    else if (packageDesc.includes('Motion')) packageName = 'Motion'
    else if (packageDesc.includes('Adat')) packageName = 'Adat'

    // Update Transaction
    const { error: txError } = await supabase.from('transactions').update({ status: 'paid' }).eq('id', txId)
    if (txError) {
      alert('Gagal menyetujui transaksi (Cek RLS): ' + txError.message)
      return
    }

    // Update User Profile
    const { error: profileError } = await supabase.from('profiles').update({ package_type: packageName }).eq('id', userId)
    if (profileError) {
      alert('Transaksi disetujui tapi gagal update paket user: ' + profileError.message)
      return
    }

    fetchData() // Refresh

    setMessage(`🎉 Pembayaran disetujui! Kategori ${packageName} berhasil diaktifkan untuk ${userEmail}.`)
    setTimeout(() => setMessage(''), 4000)
  }

  const handleRejectPayment = async (txId) => {
    const { error } = await supabase.from('transactions').update({ status: 'rejected' }).eq('id', txId)
    if (error) {
      alert('Gagal menolak transaksi: ' + error.message)
      return
    }
    fetchData() // Refresh

    setMessage(`❌ Pembayaran telah ditolak.`)
    setTimeout(() => setMessage(''), 3000)
  }

  const totalRevenue = users.reduce((sum, user) => {
    const pkg = (user.package_type === 'free' ? 'none' : user.package_type) || 'none'
    if (pkg && pkg !== 'none') {
      return sum + (pricing[pkg] || 0)
    }
    return sum
  }, 0)

  const pendingPayments = transactions.filter(t => t.status === 'pending')

  // Compute analytics
  const totalUsers = users.length

  // Find most popular theme logic
  let topTheme = 'Belum Ada'
  let topThemePercentage = 0
  if (users.length > 0) {
    const packageCounts = users.reduce((acc, user) => {
      const pkg = (user.package_type === 'free' ? 'none' : user.package_type) || 'none'
      acc[pkg] = (acc[pkg] || 0) + 1
      return acc
    }, {})
    
    // Find highest count package
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

  const recentUsers = [...users].reverse().slice(0, 5)

  return (
    <div className="space-y-8 animate-fade-in">
      {message && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 text-sm rounded-2xl px-5 py-4">
          <p className="font-semibold">{message}</p>
        </div>
      )}
      
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Pengguna</p>
            <p className="text-2xl font-bold text-slate-800 font-serif mt-0.5">{totalUsers}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pendapatan Bersih</p>
            <p className="text-2xl font-bold text-slate-800 font-serif mt-0.5">
              Rp {(totalRevenue / 1000).toLocaleString('id-ID')}k
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Award size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tema Terlaris</p>
            <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{topTheme === 'Belum Ada' ? 'Belum Ada' : `🌿 Paket ${topTheme}`}</p>
            <span className="text-[10px] text-slate-400 font-medium">({topThemePercentage}% pengguna)</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Antrean Pembayaran</p>
            <p className="text-2xl font-bold text-slate-800 font-serif mt-0.5">{pendingPayments.length} Pending</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Payments Verification Queue */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b pb-3">
            <CreditCard className="text-amber-500" size={20} />
            <h2 className="font-semibold text-slate-800 text-base">Antrean Konfirmasi Pembayaran ({pendingPayments.length})</h2>
          </div>

          <div className="space-y-4">
            {pendingPayments.map(tx => (
              <div key={tx.id} className="border border-slate-150 rounded-xl p-4 space-y-3 bg-slate-50/50 flex flex-col justify-between md:flex-row md:items-center md:gap-4 md:space-y-0">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800 text-sm">{tx.desc} {tx.themeName ? `(${tx.themeName})` : ''}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">Pending</span>
                  </div>
                  <p className="text-xs text-slate-500">User: <strong>{tx.userEmail}</strong></p>
                  <p className="text-[10px] text-slate-400">ID: <span className="font-mono">{tx.id}</span> • Tanggal: {tx.date}</p>
                  {tx.voucherCode && (
                    <p className="text-[10px] text-teal-600 font-semibold">Voucher: `{tx.voucherCode}` (-Rp {tx.discount.toLocaleString('id-ID')})</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 block">Total Transfer</span>
                    <span className="font-bold font-mono text-sm text-slate-900">Rp {tx.finalAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {tx.paymentProof && (tx.paymentProof.startsWith('data:image') || tx.paymentProof.startsWith('http')) && (
                      <button onClick={() => setViewProofImage(tx.paymentProof)} className="flex items-center gap-1 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors">
                        <ImageIcon size={13} /> Cek Bukti
                      </button>
                    )}
                    <button onClick={() => handleRejectPayment(tx.id)} className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors">
                      <XSquare size={13} /> Tolak
                    </button>
                    <button onClick={() => handleApprovePayment(tx.id, tx.user_id, tx.desc, tx.userEmail)} className="flex items-center gap-1 bg-green-600 text-white hover:bg-green-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-sm shadow-green-200">
                      <CheckSquare size={13} /> Setujui
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {pendingPayments.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">
                ✨ Tidak ada antrean konfirmasi pembayaran saat ini. Semua transaksi sudah lunas diverifikasi!
              </div>
            )}
          </div>
        </div>

        {/* Recent users registrations */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 text-sm mb-4 border-b pb-2">Registrasi Pengguna Baru</h2>
          <div className="space-y-3">
            {recentUsers.map((u, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-3 flex flex-col gap-1.5 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-slate-800 text-xs">{u.name}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${u.package_type && u.package_type !== 'none' && u.package_type !== 'free' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {u.package_type && u.package_type !== 'none' && u.package_type !== 'free' ? 'Aktif' : 'Non-aktif'}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{u.email}</span>
                  <span className="font-bold text-slate-700">{!u.package_type || u.package_type === 'none' || u.package_type === 'free' ? 'Belum Bayar' : u.package_type}</span>
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <div className="text-center py-4 text-slate-400 text-xs">Belum ada pengguna.</div>
            )}
          </div>
        </div>
      </div>

      {/* Modal View Payment Proof */}
      {viewProofImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <ImageIcon size={20} className="text-brand-600" /> Bukti Transfer
              </h3>
              <button onClick={() => setViewProofImage(null)} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 bg-slate-50 flex justify-center items-center max-h-[70vh] overflow-auto">
              <img src={viewProofImage} alt="Bukti Transfer" className="max-w-full rounded-lg shadow-sm" />
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setViewProofImage(null)} className="btn-secondary px-6 py-2 text-sm">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
