import React, { useState, useEffect } from 'react'
import { fetchPricing, savePricingDB, fetchVouchers, createVoucherDB, deleteVoucherDB, fetchAllWithdrawals, setWithdrawalStatus } from '../../services/billingService'
import { Settings, Percent, Plus, Trash2, Wallet } from 'lucide-react'

const ADMIN_WD_STATUS = {
  pending:    { label: 'Menunggu',   cls: 'bg-amber-100 text-amber-700' },
  processing: { label: 'Diproses',   cls: 'bg-blue-100 text-blue-700' },
  paid:       { label: 'Ditransfer', cls: 'bg-green-100 text-green-700' },
  rejected:   { label: 'Ditolak',    cls: 'bg-red-100 text-red-700' },
}

export default function AdminFinance() {
  const [vouchers, setVouchers] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [message, setMessage] = useState('')

  // Pricing Form State (single object → direct setter, DB-backed)
  const [pricing, setPricing] = useState({ Special: 99000, Adat: 110000, Motion: 140000, Luxury: 175000 })
  const setPrice = (cat, val) => setPricing(p => ({ ...p, [cat]: val }))

  // Voucher Form States
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherDiscount, setVoucherDiscount] = useState(10)
  const [voucherType, setVoucherType] = useState('percent')
  const [voucherMaxUse, setVoucherMaxUse] = useState(100)

  const reloadVouchers = async () => setVouchers(await fetchVouchers())
  const reloadWithdrawals = async () => setWithdrawals(await fetchAllWithdrawals())

  useEffect(() => {
    fetchPricing().then(setPricing)
    fetchVouchers().then(setVouchers)
    fetchAllWithdrawals().then(setWithdrawals)
  }, [])

  const handleSavePricing = async (e) => {
    e.preventDefault()
    const newPricing = {
      Special: Number(pricing.Special),
      Adat: Number(pricing.Adat),
      Motion: Number(pricing.Motion),
      Luxury: Number(pricing.Luxury)
    }
    const { error } = await savePricingDB(newPricing)
    if (error) { setMessage('❌ Gagal menyimpan harga: ' + error.message); setTimeout(() => setMessage(''), 4000); return }
    setMessage('🎉 Harga paket berhasil diperbarui!')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleCreateVoucher = async (e) => {
    e.preventDefault()
    if (!voucherCode.trim()) return

    const { error } = await createVoucherDB({
      code: voucherCode.trim().toUpperCase(),
      discount: Number(voucherDiscount),
      type: voucherType,
      maxUse: Number(voucherMaxUse),
    })
    if (error) { setMessage('❌ Gagal membuat voucher: ' + error.message); setTimeout(() => setMessage(''), 4000); return }
    await reloadVouchers()

    setVoucherCode('')
    setVoucherDiscount(10)
    setVoucherType('percent')
    setVoucherMaxUse(100)
    setMessage('🎉 Voucher diskon baru berhasil dibuat!')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDeleteVoucher = async (id) => {
    await deleteVoucherDB(id)
    await reloadVouchers()
  }

  // Saldo sudah dipotong saat vendor mengajukan, jadi tombol-tombol ini hanya
  // menggerakkan status — bukan memindahkan uang. Transfernya tetap manual.
  const handleWithdrawStatus = async (id, status) => {
    const { error } = await setWithdrawalStatus(id, status)
    if (error) { setMessage('❌ Gagal memperbarui status: ' + error.message); setTimeout(() => setMessage(''), 4000); return }
    await reloadWithdrawals()
    setMessage('✅ Status penarikan diperbarui.')
    setTimeout(() => setMessage(''), 3000)
  }

  const pendingCount = withdrawals.filter(w => w.status === 'pending' || w.status === 'processing').length

  return (
    <div className="space-y-6">
      {message && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 text-sm rounded-2xl px-5 py-4 animate-fade-in">
          <p className="font-semibold">{message}</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Package Pricing Setup Form */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-4 border-b pb-3">
            <Settings className="text-slate-700" size={20} />
            <h2 className="font-semibold text-slate-800 text-base">Atur Harga Paket Global</h2>
          </div>
          <form onSubmit={handleSavePricing} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Paket Special (Rupiah)</label>
              <input type="number" className="form-input text-sm font-mono" value={pricing.Special} onChange={e => setPrice('Special', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Paket Adat (Rupiah)</label>
              <input type="number" className="form-input text-sm font-mono" value={pricing.Adat} onChange={e => setPrice('Adat', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Paket Motion (Rupiah)</label>
              <input type="number" className="form-input text-sm font-mono" value={pricing.Motion} onChange={e => setPrice('Motion', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Paket Luxury (Rupiah)</label>
              <input type="number" className="form-input text-sm font-mono" value={pricing.Luxury} onChange={e => setPrice('Luxury', e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-2.5 text-sm rounded-xl">
              Simpan Konfigurasi Harga
            </button>
          </form>
        </div>

        {/* Voucher discount creator */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-4 border-b pb-3">
            <Percent className="text-teal-600" size={20} />
            <h2 className="font-semibold text-slate-800 text-base">Buat Voucher Diskon Baru</h2>
          </div>
          <form onSubmit={handleCreateVoucher} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Kode Voucher (Kapital)</label>
              <input type="text" className="form-input text-sm uppercase font-mono" placeholder="Contoh: PROMOAWAL" value={voucherCode} onChange={e => setVoucherCode(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tipe Diskon</label>
                <select className="form-input text-sm bg-white" value={voucherType} onChange={e => setVoucherType(e.target.value)}>
                  <option value="percent">Persentase (%)</option>
                  <option value="flat">Nominal Flat (Rp)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nilai Potongan</label>
                <input type="number" className="form-input text-sm font-mono" value={voucherDiscount} onChange={e => setVoucherDiscount(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Kuota Batas Penggunaan</label>
              <input type="number" className="form-input text-sm font-mono" value={voucherMaxUse} onChange={e => setVoucherMaxUse(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-2.5 text-sm rounded-xl">
              <Plus size={15} /> Buat Kode Voucher
            </button>
          </form>
        </div>

        {/* Vouchers List */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm h-fit">
          <h2 className="font-semibold text-slate-800 text-sm mb-4 border-b pb-2">Daftar Voucher Aktif ({vouchers.length})</h2>
          <div className="space-y-3">
            {vouchers.map(v => (
              <div key={v.id} className="border border-slate-100 rounded-xl p-3 flex flex-col gap-1.5 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-800 text-xs px-2 py-0.5 bg-slate-200/50 rounded">{v.code}</span>
                  <button onClick={() => handleDeleteVoucher(v.id)} className="text-red-400 hover:text-red-650 p-1">
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Diskon: <strong>{v.type === 'percent' ? `${v.discount}%` : `Rp ${v.discount.toLocaleString('id-ID')}`}</strong></span>
                  <span>Kuota: <strong>{v.used} / {v.maxUse}</strong></span>
                </div>
              </div>
            ))}
            {vouchers.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                📭 Belum ada kupon voucher promo.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Antrean Penarikan Komisi */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Wallet size={15} className="text-brand-600" />
          <h2 className="font-semibold text-slate-800 text-sm">Penarikan Komisi</h2>
          {pendingCount > 0 && (
            <span className="badge text-[10px] bg-amber-100 text-amber-700">{pendingCount} menunggu</span>
          )}
        </div>
        <div className="divide-y divide-slate-100">
          {withdrawals.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">📭 Belum ada permintaan penarikan.</div>
          ) : withdrawals.map(w => (
            <div key={w.id} className="px-5 py-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <p className="font-semibold text-slate-800 text-sm">
                  Rp {Number(w.amount).toLocaleString('id-ID')}
                  <span className="font-normal text-slate-400 text-xs"> · {w.profiles?.name || w.profiles?.email || w.user_id}</span>
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {w.payment_method} {w.account_number} a.n. {w.account_name}
                </p>
                <p className="text-[11px] text-slate-400">
                  {new Date(w.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <span className={`badge text-[10px] ${ADMIN_WD_STATUS[w.status]?.cls || 'bg-slate-100 text-slate-600'}`}>
                {ADMIN_WD_STATUS[w.status]?.label || w.status}
              </span>
              {w.status !== 'paid' && w.status !== 'rejected' && (
                <div className="flex gap-2">
                  <button onClick={() => handleWithdrawStatus(w.id, 'paid')} className="btn-primary py-1.5 text-xs">
                    Tandai Ditransfer
                  </button>
                  <button onClick={() => handleWithdrawStatus(w.id, 'rejected')} className="btn-secondary py-1.5 text-xs">
                    Tolak
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
