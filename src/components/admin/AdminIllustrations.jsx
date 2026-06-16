import React, { useState, useEffect } from 'react'
import { getIllustrations, saveIllustrations } from '../../hooks/useSharedInvitation'
import { Image, Plus, Upload, Trash2 } from 'lucide-react'

function compressPngImage(file, maxWidth = 240) {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Gagal memuat gambar')) }
    img.src = url
  })
}

export default function AdminIllustrations() {
  const [illustrations, setIllustrations] = useState(() => getIllustrations())
  const [message, setMessage] = useState('')

  // Illustration Form States
  const [illName, setIllName] = useState('')
  const [illFilename, setIllFilename] = useState('')
  const [illCategory, setIllCategory] = useState('Hijab')
  const [illTags, setIllTags] = useState('')
  const [illLocked, setIllLocked] = useState(false)
  const [illUploadLoading, setIllUploadLoading] = useState(false)
  const [illUploadError, setIllUploadError] = useState(null)

  useEffect(() => {
    const handleUpdate = () => {
      setIllustrations(getIllustrations())
    }
    window.addEventListener('local-storage-update', handleUpdate)
    return () => window.removeEventListener('local-storage-update', handleUpdate)
  }, [])

  const handleIllFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.includes('png')) {
      setIllUploadError('Format berkas harus PNG transparan.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setIllUploadError('Gambar terlalu besar. Maks. 8MB.')
      return
    }

    setIllUploadLoading(true)
    setIllUploadError(null)

    try {
      const base64 = await compressPngImage(file)
      setIllFilename(base64)
    } catch (err) {
      setIllUploadError(err.message || 'Gagal memproses gambar.')
    } finally {
      setIllUploadLoading(false)
    }
  }

  const handleSaveIllustration = (e) => {
    e.preventDefault()
    if (!illName.trim() || !illFilename.trim()) return

    const newIll = {
      id: Date.now(),
      name: illName.trim(),
      filename: illFilename.trim(),
      category: illCategory,
      tags: illTags.split(',').map(t => t.trim()).filter(Boolean),
      locked: illLocked
    }

    const updated = [...illustrations, newIll]
    try {
      saveIllustrations(updated)
      setIllustrations(updated)

      setIllName('')
      setIllFilename('')
      setIllCategory('Hijab')
      setIllTags('')
      setIllLocked(false)
      setMessage('🎉 Ilustrasi baru berhasil ditambahkan!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error(err)
      setMessage('❌ Gagal menyimpan: Penyimpanan lokal browser penuh. Silakan gunakan gambar PNG dengan resolusi lebih kecil.')
      setTimeout(() => setMessage(''), 6000)
    }
  }

  const handleDeleteIllustration = (id) => {
    const updated = illustrations.filter(i => i.id !== id)
    saveIllustrations(updated)
    setIllustrations(updated)
    setMessage('🗑️ Ilustrasi berhasil dihapus.')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 text-sm rounded-2xl px-5 py-4 animate-fade-in">
          <p className="font-semibold">{message}</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        
        {/* Left Column: Form to Add Illustration */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-4 border-b pb-3">
            <Plus className="text-brand-500" size={20} />
            <h2 className="font-semibold text-slate-800 text-base">Tambah Avatar Baru</h2>
          </div>

          <form onSubmit={handleSaveIllustration} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Avatar / Ilustrasi</label>
              <input type="text" className="form-input text-sm" placeholder="Contoh: Jawa Pria Beskap" value={illName} onChange={e => setIllName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Kategori</label>
                <select className="form-input text-sm bg-white" value={illCategory} onChange={e => setIllCategory(e.target.value)}>
                  <option value="Hijab">Hijab</option>
                  <option value="Tanpa Hijab">Tanpa Hijab</option>
                  <option value="Pria">Pria</option>
                  <option value="Adat">Adat</option>
                  <option value="Pasangan">Pasangan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Status Premium</label>
                <div className="flex items-center justify-between p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 h-[38px]">
                  <span className="text-[10px] text-slate-400 font-semibold">Terkunci</span>
                  <input type="checkbox" className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-slate-300 rounded cursor-pointer animate-fade-in" checked={illLocked} onChange={e => setIllLocked(e.target.checked)} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Unggah PNG Avatar</label>
              <div onClick={() => document.getElementById('ill-file-input').click()} className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all text-center">
                {illUploadLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-slate-500">Memproses gambar...</p>
                  </>
                ) : illFilename ? (
                  <div className="relative">
                    <img src={illFilename} alt="Preview" className="h-20 w-20 object-contain mx-auto" />
                    <span className="text-[10px] text-emerald-600 font-semibold block mt-1">✓ Berhasil diunggah (Base64)</span>
                  </div>
                ) : (
                  <>
                    <Upload size={20} className="text-slate-400" />
                    <p className="text-xs text-slate-500 font-medium">Klik untuk upload PNG</p>
                    <p className="text-[9px] text-slate-400">Harus file PNG transparan · Kompres otomatis</p>
                  </>
                )}
              </div>
              {illUploadError && (
                <p className="text-[10px] text-red-500 mt-1 font-semibold">{illUploadError}</p>
              )}
              <input id="ill-file-input" type="file" accept="image/png" className="hidden" onChange={handleIllFileChange} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tags (Pisahkan dengan koma)</label>
              <input type="text" className="form-input text-sm" placeholder="Contoh: Kebaya, Pink, Anggun" value={illTags} onChange={e => setIllTags(e.target.value)} />
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-2.5 text-sm rounded-xl">
              <Plus size={15} /> Simpan Avatar
            </button>
          </form>
        </div>

        {/* Right Column: Illustrations Grid List */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <div className="flex items-center gap-2">
              <Image className="text-blue-500" size={20} />
              <h2 className="font-semibold text-slate-800 text-base">Seluruh Avatar Aktif ({illustrations.length})</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {illustrations.map(ill => (
              <div key={ill.id} className="border border-slate-150 rounded-xl p-4 flex flex-col justify-between hover:border-slate-350 hover:shadow-sm transition-all bg-slate-50/20 relative group">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full uppercase font-mono">
                      {ill.category}
                    </span>
                    <button onClick={() => handleDeleteIllustration(ill.id)} className="text-red-400 hover:text-red-650 p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Hapus Ilustrasi">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 overflow-hidden">
                      <img src={ill.filename.startsWith('data:') ? ill.filename : `/avatars/${ill.category}/${ill.filename}`} alt="" onError={(e) => { e.target.src = '/avatars/placeholder.svg' }} className="h-8 w-8 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-xs truncate">{ill.name}</p>
                      <p className="text-[9px] text-slate-400 truncate">{ill.filename}</p>
                      {ill.locked && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-amber-700 bg-amber-50 px-1 rounded-sm mt-0.5">
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-1 border-t border-slate-100/50 pt-2">
                  {ill.tags?.map(t => (
                    <span key={t} className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded-sm">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
