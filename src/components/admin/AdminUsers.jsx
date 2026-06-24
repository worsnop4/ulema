import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Shield, User as UserIcon, X, Save, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' or 'edit'
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    package: 'none',
    slug: ''
  })
  
  // Track original email for editing to avoid creating duplicate if email is unchanged
  const [editingEmail, setEditingEmail] = useState(null)
  const [error, setError] = useState('')

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (data) setUsers(data)
    setIsLoading(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini? Mengingat ini adalah Supabase Auth, penghapusan terbaik dilakukan via Supabase Dashboard. Fungsi ini hanya menghapus dari tabel profiles.')) {
      await supabase.from('profiles').delete().eq('id', id)
      loadUsers()
    }
  }

  const openAddModal = () => {
    setModalMode('add')
    setFormData({ name: '', email: '', phone: '', password: '', role: 'user', package: 'free', slug: '' })
    setError('')
    setIsModalOpen(true)
  }

  const openEditModal = (user) => {
    setModalMode('edit')
    setEditingEmail(user.email)
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: user.password || '',
      role: user.role || 'user',
      package: user.package_type || 'free',
      slug: user.slug || ''
    })
    setError('')
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.name || !formData.email) {
      setError('Nama dan Email wajib diisi!')
      return
    }

    if (modalMode === 'add') {
      setError('Penambahan User Baru via Admin dinonaktifkan. Silakan arahkan User untuk Sign Up langsung di halaman Login, atau gunakan Supabase Dashboard.')
      return
    } else {
      // Edit mode
      const { error } = await supabase.from('profiles').update({
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        package_type: formData.package
      }).eq('email', editingEmail)
      
      if (error) {
        setError('Gagal mengupdate profil: ' + error.message)
        return
      }
    }

    loadUsers()
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kelola Pengguna</h2>
          <p className="text-sm text-slate-500 mt-1">Total {users.length} akun terdaftar dalam sistem.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
          <Plus size={16} /> Tambah Pengguna
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider">
                <th className="p-4 font-semibold rounded-tl-3xl">Pengguna</th>
                <th className="p-4 font-semibold">Kontak</th>
                <th className="p-4 font-semibold">Role & Paket</th>
                <th className="p-4 font-semibold text-right rounded-tr-3xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        {user.role === 'admin' ? <Shield size={18} className="text-brand-600" /> : <UserIcon size={18} />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{user.name || 'Tanpa Nama'}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">Supabase Auth</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-slate-600 font-medium">{user.email}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{user.phone || user.whatsapp || 'No WA belum diatur'}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${user.role === 'admin' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'}`}>
                        {user.role}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${user.package_type && user.package_type !== 'none' && user.package_type !== 'free' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                        {user.package_type === 'none' || user.package_type === 'free' || !user.package_type ? 'Belum Bayar' : user.package_type}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(user)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                    Belum ada pengguna terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">
                {modalMode === 'add' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 outline-none transition-colors"
                       value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Contoh: Doni Firmansyah" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Email Akses</label>
                  <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 outline-none transition-colors"
                         value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="user@email.com" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">No WhatsApp</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 outline-none transition-colors"
                         value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="08..." />
                </div>
              </div>

              {modalMode === 'add' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
                    <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 outline-none transition-colors"
                           value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Katasandi" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Role Akses</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 outline-none transition-colors"
                          value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="user">User Biasa</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Paket (Package)</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 outline-none transition-colors"
                          value={formData.package} onChange={e => setFormData({...formData, package: e.target.value})}>
                    <option value="free">Belum Bayar (free)</option>
                    <option value="Special">Special</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Motion">Motion</option>
                    <option value="Adat">Adat</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 shadow-sm rounded-xl transition-colors flex items-center gap-2">
                  <Save size={16} /> Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
