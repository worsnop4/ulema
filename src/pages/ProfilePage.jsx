import { useState } from 'react'
import { useAuth } from '../App'
import { User, Mail, Phone, Save, Check } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Akun</p>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Informasi Profil</h1>
      </div>

      <div className="bg-white rounded-2xl border border-surface-border shadow-card p-6 space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-serif font-bold text-white text-2xl flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #002147, #D4C4A8)' }}>
            {user?.name?.charAt(0) || 'D'}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <button className="text-xs text-brand-600 hover:text-brand-700 font-semibold mt-1">Ganti Foto Profil</button>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div>
            <label className="form-label">Nama Lengkap</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="form-input pl-9" defaultValue={user?.name} />
            </div>
          </div>
          <div>
            <label className="form-label">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" className="form-input pl-9" defaultValue={user?.email} />
            </div>
          </div>
          <div>
            <label className="form-label">Nomor WhatsApp</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="tel" className="form-input pl-9" defaultValue="+62 812 3456 7890" />
            </div>
          </div>
        </div>

        <button onClick={handleSave} className={`btn-primary w-full justify-center ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}>
          {saved ? <><Check size={14} /> Tersimpan!</> : <><Save size={14} /> Simpan Profil</>}
        </button>
      </div>

      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5">
        <h3 className="font-semibold text-brand-800 text-sm mb-1">Paket Aktif: {user?.package}</h3>
        <p className="text-xs text-brand-600">Aktif hingga <strong>{user?.expiry}</strong></p>
        <button className="btn-primary mt-3 text-xs py-2">Perpanjang / Upgrade Paket</button>
      </div>
    </div>
  )
}
