import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import { supabase } from '../lib/supabase'
import { User, Mail, Phone, Save, Check, AlertCircle, Landmark } from 'lucide-react'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  // Nilai awal diambil sekali saat halaman dibuka. Kalau dibaca tiap render,
  // penyegaran konteks setelah menyimpan akan menimpa apa yang sedang diketik.
  const [form, setForm] = useState(() => ({
    name: user?.name || '',
    phone: user?.phone || '',
    bank_name: user?.bank_name || '',
    bank_account_number: user?.bank_account_number || '',
    bank_account_name: user?.bank_account_name || '',
  }))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return
    setError('')

    const name = form.name.trim()
    if (!name) { setError('Nama tidak boleh kosong.'); return }

    setSaving(true)
    const { error: err } = await supabase
      .from('profiles')
      .update({
        name,
        phone: form.phone.trim(),
        // Rekening tujuan komisi. Disimpan di profil supaya admin tidak perlu
        // menanyakannya tiap penarikan, dan vendor tidak mengetiknya ulang.
        bank_name: form.bank_name.trim() || null,
        bank_account_number: form.bank_account_number.trim() || null,
        bank_account_name: form.bank_account_name.trim() || null,
      })
      .eq('id', user.id)
    setSaving(false)

    if (err) {
      setError(`Gagal menyimpan: ${err.message}`)
      return
    }

    await refreshUser()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Akun</p>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Informasi Profil</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-surface-border shadow-card p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-serif font-bold text-white text-2xl flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #002147, #D4C4A8)' }}>
            {(user?.name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-sm text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div>
            <label className="form-label" htmlFor="pf-name">Nama Lengkap</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input id="pf-name" className="form-input pl-9" value={form.name}
                onChange={set('name')} autoComplete="name" />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="pf-email">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              {/* Email adalah identitas masuk, bukan sekadar kolom profil:
                  mengubahnya perlu verifikasi ke alamat baru. Ditampilkan
                  terkunci ketimbang berpura-pura bisa diubah di sini. */}
              <input id="pf-email" type="email" className="form-input pl-9 bg-slate-50 text-slate-500"
                value={user?.email || ''} readOnly />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Email dipakai untuk masuk. Hubungi admin kalau perlu diganti.
            </p>
          </div>

          <div>
            <label className="form-label" htmlFor="pf-phone">Nomor WhatsApp</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input id="pf-phone" type="tel" className="form-input pl-9" value={form.phone}
                onChange={set('phone')} placeholder="08xxxxxxxxxx" autoComplete="tel" />
            </div>
          </div>
        </div>

        {/* ── Rekening penerimaan komisi ─────────────────────────────── */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div className="flex items-center gap-2">
            <Landmark size={15} className="text-brand-600" />
            <h2 className="font-semibold text-slate-800 text-sm">Rekening Penerimaan Komisi</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed -mt-1">
            Ke sinilah admin mentransfer komisimu. Isi sekarang supaya penarikan
            tidak tertahan hanya karena rekeningnya belum diketahui.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-44 flex-shrink-0">
              <label className="form-label" htmlFor="pf-bank">Bank / e-wallet</label>
              <input id="pf-bank" className="form-input" value={form.bank_name}
                onChange={set('bank_name')} placeholder="BCA" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="form-label" htmlFor="pf-accnum">Nomor rekening</label>
              <input id="pf-accnum" className="form-input font-mono" value={form.bank_account_number}
                onChange={set('bank_account_number')} placeholder="1234567890" inputMode="numeric" />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="pf-accname">Nama pemilik rekening</label>
            <input id="pf-accname" className="form-input" value={form.bank_account_name}
              onChange={set('bank_account_name')} placeholder="Muhammad Fazri" />
            {/* Bank mencocokkan nama pemilik rekening, bukan nama profil, dan
                keduanya sering berbeda. Dipisah supaya transfernya tidak
                tertolak karena menebak. */}
            <p className="text-[11px] text-slate-400 mt-1.5">
              Tulis persis seperti yang tertera di rekening, walau berbeda dari nama profilmu.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 font-semibold flex items-start gap-1.5">
            <AlertCircle size={13} className="mt-px flex-shrink-0" /> {error}
          </p>
        )}

        <button type="submit" disabled={saving}
          className={`btn-primary w-full justify-center ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}>
          {saved ? <><Check size={14} /> Tersimpan!</>
            : saving ? 'Menyimpan…'
            : <><Save size={14} /> Simpan Profil</>}
        </button>
      </form>

      {/* Vendor tidak membeli paket undangan, jadi blok ini tidak relevan
          untuknya. */}
      {!user?.vendor && (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5">
          <h3 className="font-semibold text-brand-800 text-sm mb-1">
            Paket Aktif: {user?.package === 'none' ? 'Belum aktif' : user?.package}
          </h3>
          {user?.package_expiry && (
            <p className="text-xs text-brand-600">
              Aktif hingga <strong>
                {new Date(user.package_expiry).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </strong>
            </p>
          )}
          <Link to="/dashboard/transactions" className="btn-primary mt-3 text-xs py-2 inline-flex">
            Perpanjang / Upgrade Paket
          </Link>
        </div>
      )}
    </div>
  )
}
