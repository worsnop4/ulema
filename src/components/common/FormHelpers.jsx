import { useState, useRef } from 'react'
import { Upload, X, Save, Check, ChevronDown, ChevronRight } from 'lucide-react'

export function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`toggle-switch ${checked ? 'bg-brand-500' : 'bg-slate-200'}`}
    >
      <span className={`toggle-thumb ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  )
}

export function compressImage(file, maxWidth = 550, quality = 0.5) {
  return new Promise((resolve, reject) => {
    const img = new Image()
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
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Gagal memuat gambar')) }
    img.src = url
  })
}

export function PhotoUploadBox({ label, value, onChange, accept = 'image/*' }) {
  const inputRef = useRef()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Foto terlalu besar. Maks. 10MB sebelum kompresi.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const compressed = await compressImage(file)
      onChange(compressed)
    } catch (err) {
      setError('Gagal memproses foto: ' + err.message)
    } finally {
      setLoading(false)
      e.target.value = '' // reset input
    }
  }

  return (
    <div>
      {label && <label className="form-label">{label}</label>}
      <div
        onClick={() => !loading && inputRef.current.click()}
        className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all"
      >
        {loading ? (
          <>
            <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Mengompresi foto...</p>
          </>
        ) : value ? (
          <div className="relative w-full">
            <img src={value} alt="preview" className="w-full h-32 object-cover rounded-xl" />
            <div className="absolute inset-0 rounded-xl bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center">
              <span className="text-white opacity-0 hover:opacity-100 text-xs font-bold bg-black/50 px-2 py-1 rounded-lg">Ganti Foto</span>
            </div>
          </div>
        ) : (
          <>
            <Upload size={22} className="text-slate-400" />
            <p className="text-sm text-slate-500 font-medium">Klik untuk upload foto</p>
            <p className="text-xs text-slate-400">JPG, PNG, WEBP · Akan dikompres otomatis</p>
          </>
        )}
      </div>
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
    </div>
  )
}

export function PremiumPhotoUploadBox({ value, onChange, helperText }) {
  const inputRef = useRef()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Foto terlalu besar. Maksimal 10MB.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const compressed = await compressImage(file, 550, 0.5)
      onChange(compressed)
    } catch (err) {
      setError('Gagal memproses foto: ' + err.message)
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <div className="border border-dashed border-teal-200/80 rounded-2xl p-5 flex flex-col items-center justify-center bg-teal-50/5 hover:bg-teal-50/20 hover:border-teal-400 transition-all relative">
        {loading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Memproses foto...</p>
          </div>
        ) : value ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-32 h-24 rounded-xl overflow-hidden shadow-md border border-slate-100">
              <img src={value} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(null)
                }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-all shadow"
                title="Hapus Foto"
              >
                <X size={12} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current.click()}
              className="bg-[#009688] hover:bg-[#00897b] text-white font-semibold px-5 py-2 rounded-xl text-xs transition-all shadow-sm active:scale-95"
            >
              Pilih File
            </button>
            <p className="text-[10px] text-slate-400">Maximum file size: 10 MB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <button
              type="button"
              onClick={() => inputRef.current.click()}
              className="bg-[#009688] hover:bg-[#00897b] text-white font-semibold px-5 py-2 rounded-xl text-xs transition-all shadow-sm active:scale-95"
            >
              Pilih File
            </button>
            <p className="text-[10px] text-slate-400">Maximum file size: 10 MB</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {error && <p className="text-xs text-red-500 mt-1 text-center">{error}</p>}
      {helperText && <p className="text-[11px] text-slate-400 mt-2 text-center">{helperText}</p>}
    </div>
  )
}

export function AccordionItem({ title, isOpen, onToggle, children }) {
  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <span className="font-semibold text-slate-800 text-sm">{title}</span>
        {isOpen ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-slate-100 bg-white">
          {children}
        </div>
      )}
    </div>
  )
}

export function SaveButton({ onClick }) {
  const [saved, setSaved] = useState(false)
  const handle = () => {
    setSaved(true)
    onClick?.()
    setTimeout(() => setSaved(false), 2000)
  }
  return (
    <button onClick={handle} className={`btn-primary ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}>
      {saved ? <><Check size={14} /> Tersimpan!</> : <><Save size={14} /> Simpan Perubahan</>}
    </button>
  )
}
