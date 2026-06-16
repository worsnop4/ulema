import { useState } from 'react'
import { Shield, Eye, EyeOff, Check, Save, AlertCircle } from 'lucide-react'
import { useAuth } from '../App'
import { storageService } from '../services/storageService'

export default function SecurityPage() {
  const { user, login } = useAuth()
  
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setError('')
    setSaved(false)
    
    if (!user) return
    
    // Validation
    if (oldPassword !== user.password) {
      setError('Password lama yang Anda masukkan salah.')
      return
    }
    
    if (newPassword.length < 8) {
      setError('Password baru harus minimal 8 karakter.')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.')
      return
    }

    // Sync to admin user list
    const users = storageService.getItem('inviter_registered_users') || []
    const updatedUsers = users.map(u => {
      if (u.email === user.email) {
        return { ...u, password: newPassword }
      }
      return u
    })
    storageService.setItem('inviter_registered_users', updatedUsers)
    
    // Sync active session
    const updatedUser = { ...user, password: newPassword }
    login(updatedUser) // this updates 'inviter_user' and state
    window.dispatchEvent(new Event('local-storage-update'))
    
    setSaved(true)
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Akun</p>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Pengaturan Keamanan</h1>
      </div>

      <div className="bg-white rounded-2xl border border-surface-border shadow-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <Shield size={18} className="text-brand-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800 text-sm">Ganti Password</h2>
            <p className="text-xs text-slate-500">Gunakan password yang kuat dan unik.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {[
            { label: 'Password Lama', show: showOld, toggle: () => setShowOld(v => !v), value: oldPassword, setter: setOldPassword },
            { label: 'Password Baru', show: showNew, toggle: () => setShowNew(v => !v), value: newPassword, setter: setNewPassword },
            { label: 'Konfirmasi Password Baru', show: showConfirm, toggle: () => setShowConfirm(v => !v), value: confirmPassword, setter: setConfirmPassword },
          ].map(({ label, show, toggle, value, setter }) => (
            <div key={label}>
              <label className="form-label">{label}</label>
              <div className="relative">
                <input 
                  type={show ? 'text' : 'password'} 
                  className="form-input pr-11" 
                  placeholder="••••••••" 
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  required
                />
                <button type="button" onClick={toggle}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-semibold">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-600 mb-2">Syarat Password:</p>
            {['Minimal 8 karakter', 'Mengandung huruf besar & kecil', 'Mengandung angka atau simbol'].map(s => (
              <div key={s} className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <div className="w-3 h-3 rounded-full bg-slate-200 flex-shrink-0" />
                {s}
              </div>
            ))}
          </div>

          <button type="submit" className={`btn-primary w-full justify-center ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}>
            {saved ? <><Check size={14} /> Password Berhasil Diubah!</> : <><Save size={14} /> Simpan Password</>}
          </button>
        </form>
      </div>
    </div>
  )
}
