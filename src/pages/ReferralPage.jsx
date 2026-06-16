import { useState } from 'react'
import { Share2, Copy, Check, Users, TrendingUp } from 'lucide-react'

const REFERRAL_CODE = 'DONI-RIZKA'
const REFERRAL_LINK = `https://ulema.id/r/${REFERRAL_CODE}`

const REFERRAL_ORDERS = [
  { name: 'Budi S.', email: 'b***i@gmail.com', pkg: 'Special', commission: 'Rp 15.000', date: '20 Mei 2025', status: 'paid' },
  { name: 'Maya P.', email: 'm***a@gmail.com', pkg: 'Luxury', commission: 'Rp 35.000', date: '12 Mei 2025', status: 'paid' },
  { name: 'Ahmad F.', email: 'a***d@gmail.com', pkg: 'Special', commission: 'Rp 15.000', date: '5 Apr 2025', status: 'pending' },
]

export default function ReferralPage() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(REFERRAL_LINK)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Akun</p>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Referrals</h1>
        <p className="text-slate-500 text-sm mt-1">Ajak temanmu, dapatkan komisi menarik!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Referral', value: '3', icon: Users, color: 'text-brand-600 bg-brand-50' },
          { label: 'Total Komisi', value: 'Rp 65rb', icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Menunggu', value: 'Rp 15rb', icon: Share2, color: 'text-amber-600 bg-amber-50' },
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

      {/* Referral Code */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card p-6">
        <h2 className="font-semibold text-slate-800 text-sm mb-1">Kode Referralmu</h2>
        <p className="text-xs text-slate-500 mb-4">Bagikan kode atau link di bawah ini kepada temanmu.</p>
        <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-3">
          <span className="font-mono font-bold text-brand-700 text-lg flex-1">{REFERRAL_CODE}</span>
          <button onClick={handleCopy} className="btn-primary py-1.5 text-xs">
            {copied ? <><Check size={12} /> Disalin!</> : <><Copy size={12} /> Salin Link</>}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 font-mono break-all">{REFERRAL_LINK}</p>
        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-amber-700">💰 Komisi: 20% untuk setiap pembelian</p>
          <p className="text-[11px] text-amber-600 mt-0.5">Komisi langsung masuk ke saldo akunmu setelah order dikonfirmasi.</p>
        </div>
      </div>

      {/* Referral Orders Table */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 text-sm">Riwayat Referral Order</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {REFERRAL_ORDERS.map((r, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {r.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{r.name}</p>
                <p className="text-[11px] text-slate-400">{r.email} · {r.pkg} · {r.date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-sm text-brand-700">{r.commission}</p>
                <span className={`badge text-[10px] ${r.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {r.status === 'paid' ? 'Dibayar' : 'Menunggu'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
