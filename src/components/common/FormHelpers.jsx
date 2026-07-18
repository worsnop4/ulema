import { useState, useRef } from 'react'
import { Upload, X, Save, Check, ChevronDown, ChevronRight, Crop } from 'lucide-react'
import ImageCropperModal from './ImageCropperModal'
import { supabase } from '../../lib/supabase'

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

export async function uploadMedia(blob, pathPrefix = 'uploads') {
  const fileName = `${pathPrefix}_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
  
  const { error } = await supabase.storage
    .from('invitation-media')
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: false
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('invitation-media')
    .getPublicUrl(fileName)

  return publicUrl
}

export function PhotoUploadBox({ label, value, onChange, accept = 'image/*' }) {
  const inputRef = useRef()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cropFileUrl, setCropFileUrl] = useState(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Foto terlalu besar. Maks. 10MB sebelum kompresi.')
      return
    }
    setError(null)
    const url = URL.createObjectURL(file)
    setCropFileUrl(url)
    e.target.value = '' // reset input
  }

  const handleCropComplete = async (croppedBase64) => {
    setCropFileUrl(null)
    setLoading(true)
    try {
      const res = await fetch(croppedBase64)
      const blob = await res.blob()
      
      // Compress first — used by love-story photos & the OG/meta image,
      // which want decent resolution (OG previews render ~1200px wide).
      const compressedBase64 = await compressImage(blob, 1200, 0.72)
      const finalRes = await fetch(compressedBase64)
      const finalBlob = await finalRes.blob()
      
      // Upload to Supabase Storage
      const publicUrl = await uploadMedia(finalBlob, 'photo')
      
      onChange(publicUrl)
    } catch (err) {
      setError('Gagal mengunggah foto: ' + err.message)
    } finally {
      setLoading(false)
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
            <div className="absolute inset-0 rounded-xl bg-black/0 hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
              <button 
                onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}
                className="text-white text-[10px] font-bold bg-slate-800/80 hover:bg-brand-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Upload size={12} /> Ganti
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setCropFileUrl(value); }}
                className="text-white text-[10px] font-bold bg-slate-800/80 hover:bg-brand-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Crop size={12} /> Edit
              </button>
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
      
      {cropFileUrl && (
        <ImageCropperModal 
          imageSrc={cropFileUrl} 
          onComplete={handleCropComplete} 
          onCancel={() => setCropFileUrl(null)} 
        />
      )}
    </div>
  )
}

export async function uploadVideo(file, pathPrefix = 'video') {
  const fileName = `${pathPrefix}_${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`
  
  const { error } = await supabase.storage
    .from('invitation-media')
    .upload(fileName, file, {
      contentType: 'video/mp4',
      upsert: false
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('invitation-media')
    .getPublicUrl(fileName)

  return publicUrl
}

export function VideoUploadBox({ label, value, onChange, helperText }) {
  const inputRef = useRef()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Video terlalu besar. Maks. 5MB.')
      return
    }
    setError(null)
    setLoading(true)
    
    try {
      const publicUrl = await uploadVideo(file)
      onChange(publicUrl)
    } catch (err) {
      setError('Gagal mengunggah video: ' + err.message)
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-3">
      {label && <label className="form-label text-slate-700 font-semibold mb-1.5">{label}</label>}
      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
      
      {value ? (
        <div className="relative aspect-[9/16] w-32 rounded-2xl overflow-hidden border-2 border-slate-200 group bg-slate-900 mx-auto sm:mx-0">
          <video src={value} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
            <button
              onClick={() => onChange('')}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold tracking-wider uppercase rounded-xl transition-transform hover:scale-105"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !loading && inputRef.current.click()}
          className="aspect-[9/16] w-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 transition-all mx-auto sm:mx-0 group"
        >
          {loading ? (
            <div className="w-8 h-8 border-3 border-brand-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Upload size={18} className="text-brand-500" />
              </div>
              <span className="text-xs font-semibold text-slate-600">Pilih Video</span>
              <span className="text-[10px] text-slate-400 mt-1">MP4 (Maks 5MB)</span>
            </>
          )}
        </div>
      )}
      {error && <p className="text-[11px] text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
      <input ref={inputRef} type="file" accept="video/mp4" className="hidden" onChange={handleFile} />
    </div>
  )
}

export function PremiumPhotoUploadBox({ label, value, onChange, helperText }) {
  const inputRef = useRef()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cropFileUrl, setCropFileUrl] = useState(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Foto terlalu besar. Maksimal 10MB.')
      return
    }
    setError(null)
    const url = URL.createObjectURL(file)
    setCropFileUrl(url)
    e.target.value = ''
  }

  const handleCropComplete = async (croppedBase64) => {
    setCropFileUrl(null)
    setLoading(true)
    try {
      const res = await fetch(croppedBase64)
      const blob = await res.blob()
      
      // Compress first — full-bleed photos (cover, slide, couple, footer)
      // need enough resolution for full-screen + Ken Burns, so keep this high.
      const compressedBase64 = await compressImage(blob, 1280, 0.72)
      const finalRes = await fetch(compressedBase64)
      const finalBlob = await finalRes.blob()
      
      // Upload to Supabase Storage
      const publicUrl = await uploadMedia(finalBlob, 'premium_cover')
      
      onChange(publicUrl)
    } catch (err) {
      setError('Gagal mengunggah foto: ' + err.message)
    } finally {
      setLoading(false)
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
            <div className="relative w-32 h-24 rounded-xl overflow-hidden shadow-md border border-slate-100 group">
              <img src={value} alt="preview" className="w-full h-full object-cover" />
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setCropFileUrl(value); }}
                  className="text-white text-[9px] font-bold bg-brand-600 hover:bg-brand-500 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Crop size={10} /> Re-crop
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(null); }}
                  className="text-white text-[9px] font-bold bg-red-600 hover:bg-red-500 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <X size={10} /> Hapus
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current.click()}
              className="bg-[#009688] hover:bg-[#00897b] text-white font-semibold px-5 py-2 rounded-xl text-xs transition-all shadow-sm active:scale-95"
            >
              Ganti File
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
      
      {cropFileUrl && (
        <ImageCropperModal 
          imageSrc={cropFileUrl} 
          onComplete={handleCropComplete} 
          onCancel={() => setCropFileUrl(null)} 
        />
      )}
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
