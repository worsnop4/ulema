import React, { useState, useEffect } from 'react'
import { getPricing, savePricing, getVouchers, saveVouchers } from '../../hooks/useSharedInvitation'
import { Settings, Percent, Plus, Trash2 } from 'lucide-react'

export default function AdminFinance() {
  const [pricing, setPricing] = useState(() => getPricing())
  const [vouchers, setVouchers] = useState(() => getVouchers())
  const [message, setMessage] = useState('')

  // Pricing Form States
  const [priceSpecial, setPriceSpecial] = useState(pricing.Special || 99000)
  const [priceAdat, setPriceAdat] = useState(pricing.Adat || 110000)
  const [priceMotion, setPriceMotion] = useState(pricing.Motion || 140000)
  const [priceLuxury, setPriceLuxury] = useState(pricing.Luxury || 175000)

  // Voucher Form States
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherDiscount, setVoucherDiscount] = useState(10)
  const [voucherType, setVoucherType] = useState('percent')
  const [voucherMaxUse, setVoucherMaxUse] = useState(100)

  useEffect(() => {
    const handleUpdate = () => {
      setPricing(getPricing())
      setVouchers(getVouchers())
    }
    window.addEventListener('local-storage-update', handleUpdate)
    return () => window.removeEventListener('local-storage-update', handleUpdate)
  }, [])

  const handleSavePricing = (e) => {
    e.preventDefault()
    const newPricing = {
      Special: Number(priceSpecial),
      Adat: Number(priceAdat),
      Motion: Number(priceMotion),
      Luxury: Number(priceLuxury)
    }
    savePricing(newPricing)
    setPricing(newPricing)
    setMessage('🎉 Harga paket berhasil diperbarui!')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleCreateVoucher = (e) => {
    e.preventDefault()
    if (!voucherCode.trim()) return

    const newVoucher = {
      id: Date.now(),
      code: voucherCode.trim().toUpperCase(),
      discount: Number(voucherDiscount),
      type: voucherType,
      maxUse: Number(voucherMaxUse),
      used: 0
    }

    const updated = [...vouchers, newVoucher]
    saveVouchers(updated)
    setVouchers(updated)
    
    setVoucherCode('')
    setVoucherDiscount(10)
    setVoucherType('percent')
    setVoucherMaxUse(100)
    setMessage('🎉 Voucher diskon baru berhasil dibuat!')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDeleteVoucher = (id) => {
    const updated = vouchers.filter(v => v.id !== id)
    saveVouchers(updated)
    setVouchers(updated)
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
              <input type="number" className="form-input text-sm font-mono" value={priceSpecial} onChange={e => setPriceSpecial(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Paket Adat (Rupiah)</label>
              <input type="number" className="form-input text-sm font-mono" value={priceAdat} onChange={e => setPriceAdat(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Paket Motion (Rupiah)</label>
              <input type="number" className="form-input text-sm font-mono" value={priceMotion} onChange={e => setPriceMotion(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Paket Luxury (Rupiah)</label>
              <input type="number" className="form-input text-sm font-mono" value={priceLuxury} onChange={e => setPriceLuxury(e.target.value)} required />
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
