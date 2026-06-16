import React, { useState, useEffect } from 'react'
import { getTransactions, saveTransactions } from '../../hooks/useSharedInvitation'
import { storageService } from '../../services/storageService'
import { Users, DollarSign, Award, AlertTriangle, CreditCard, XSquare, CheckSquare } from 'lucide-react'

const DUMMY_USERS = [
  { id: 1, name: 'Adi & Dinda', email: 'adi.dinda@gmail.com', package: 'Luxury', status: 'Aktif', date: '2026-05-28' },
  { id: 2, name: 'Rian & Susi', email: 'rian.susi@yahoo.com', package: 'Premium', status: 'Aktif', date: '2026-05-27' },
  { id: 3, name: 'Bimo & Clara', email: 'bimo.clara@outlook.com', package: 'Basic', status: 'Non-aktif', date: '2026-05-25' },
]

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState(() => getTransactions())
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleUpdate = () => {
      setTransactions(getTransactions())
    }
    window.addEventListener('local-storage-update', handleUpdate)
    return () => window.removeEventListener('local-storage-update', handleUpdate)
  }, [])

  const handleApprovePayment = (txId, userEmail, packageDesc) => {
    const updated = transactions.map(tx => {
      if (tx.id === txId) {
        return { ...tx, status: 'paid' }
      }
      return tx
    })
    saveTransactions(updated)
    setTransactions(updated)

    try {
      let packageName = 'Special'
      if (packageDesc.includes('Luxury')) packageName = 'Luxury'
      else if (packageDesc.includes('Motion')) packageName = 'Motion'
      else if (packageDesc.includes('Adat')) packageName = 'Adat'

      const oneYear = new Date()
      oneYear.setFullYear(oneYear.getFullYear() + 1)
      const expiryStr = oneYear.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

      const usersStored = storageService.getItem('inviter_registered_users')
      if (usersStored) {
        const users = usersStored
        const updatedUsers = users.map(u => {
          if (u.email.toLowerCase() === userEmail.toLowerCase()) {
            return { ...u, package: packageName, expiry: expiryStr }
          }
          return u
        })
        storageService.setItem('inviter_registered_users', updatedUsers)
      }

      const stored = storageService.getItem('inviter_user')
      if (stored) {
        const u = stored
        if (u.email.toLowerCase() === userEmail.toLowerCase()) {
          const updatedUser = { ...u, package: packageName, expiry: expiryStr }
          storageService.setItem('inviter_user', updatedUser)
          window.dispatchEvent(new Event('storage'))
        }
      }
    } catch (e) {
      console.error(e)
    }

    setMessage(`🎉 Pembayaran ${txId} disetujui! Kategori ${packageDesc.replace('Kategori ', '')} berhasil diaktifkan untuk ${userEmail}.`)
    setTimeout(() => setMessage(''), 4000)
  }

  const handleRejectPayment = (txId) => {
    const updated = transactions.map(tx => {
      if (tx.id === txId) {
        return { ...tx, status: 'rejected' }
      }
      return tx
    })
    saveTransactions(updated)
    setTransactions(updated)
    setMessage(`❌ Pembayaran ${txId} telah ditolak.`)
    setTimeout(() => setMessage(''), 3000)
  }

  const totalRevenue = transactions
    .filter(t => t.status === 'paid')
    .reduce((s, t) => s + (t.finalAmount || t.amount), 0)

  const pendingPayments = transactions.filter(t => t.status === 'pending')

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
            <p className="text-2xl font-bold text-slate-800 font-serif mt-0.5">1,240</p>
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
            <p className="text-sm font-bold text-slate-800 truncate mt-0.5">🌿 Classic Elegance</p>
            <span className="text-[10px] text-slate-400 font-medium">(42% pengguna)</span>
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
                    <span className="font-bold text-slate-800 text-sm">{tx.desc}</span>
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
                  <div className="flex gap-1.5">
                    <button onClick={() => handleRejectPayment(tx.id)} className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors">
                      <XSquare size={13} /> Tolak
                    </button>
                    <button onClick={() => handleApprovePayment(tx.id, tx.userEmail, tx.desc)} className="flex items-center gap-1 bg-green-600 text-white hover:bg-green-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-sm shadow-green-200">
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
            {DUMMY_USERS.map(u => (
              <div key={u.id} className="border border-slate-100 rounded-xl p-3 flex flex-col gap-1.5 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-slate-800 text-xs">{u.name}</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-50 text-green-700 rounded-full">{u.status}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{u.email}</span>
                  <span className="font-bold text-slate-700">{u.package}</span>
                </div>
                <p className="text-[9px] text-slate-400">Terdaftar: {u.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
