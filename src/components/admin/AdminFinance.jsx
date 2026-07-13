import React, { useState, useEffect } from 'react'
import { fetchPricing, savePricingDB, fetchVouchers, createVoucherDB, deleteVoucherDB } from '../../services/billingService'
import { Settings, Percent, Plus, Trash2 } from 'lucide-react'

export default function AdminFinance() {
  const [vouchers, setVouchers] = useState([])
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

  useEffect(() => {
    fetchPricing().then(setPricing)
    fetchVouchers().then(setVouchers)
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
    </div>
  )
}
