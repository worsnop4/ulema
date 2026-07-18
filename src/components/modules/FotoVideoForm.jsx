import React, { useState, useRef, useEffect } from 'react'
import { HelpCircle, X, Plus } from 'lucide-react'
import { useSharedInvitation, getThemes } from '../../hooks/useSharedInvitation'
import { AccordionItem, PremiumPhotoUploadBox, VideoUploadBox, compressImage, uploadMedia } from '../common/FormHelpers'

export default function FotoVideoForm() {
  const [data, updateData] = useSharedInvitation()
  const gallery = data.gallery || []
  const videoUrl = data.videoUrl || ''
  const meta = data.meta || {}
  const groom = data.groom || {}
  const bride = data.bride || {}
  
  // Ambil data theme untuk cek apakah ini tema video
  const themes = getThemes()
  const activeTheme = themes.find(t => t.id === data.themeId)
  const isVideoTheme = activeTheme?.themeType === 'video'

  const [activeSection, setActiveSection] = useState('cover')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef()

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section)
  }

  useEffect(() => {
    const handler = (e) => setError('Penyimpanan browser penuh. Hapus beberapa foto dulu, atau gunakan foto yang lebih kecil.')
    window.addEventListener('local-storage-error', handler)
    return () => window.removeEventListener('local-storage-error', handler)
  }, [])

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files)
    if (gallery.length + files.length > 10) {
      setError('Maksimal 10 foto.')
      return
    }
    setError(null)
    setLoading(true)
    const results = []
    for (const file of files) {
      try {
        const compressedBase64 = await compressImage(file, 900, 0.7)
        
        // Convert compressed base64 back to Blob
        const res = await fetch(compressedBase64)
        const blob = await res.blob()
        
        // Upload to Supabase Storage
        const publicUrl = await uploadMedia(blob, 'gallery')
        
        results.push({ id: Date.now() + Math.random(), src: publicUrl, name: file.name })
      } catch (err) {
        setError(`Gagal memproses "${file.name}": ${err.message}`)
      }
    }
    setLoading(false)
    e.target.value = ''

    if (results.length === 0) return

    updateData(
      { gallery: [...gallery, ...results] },
      (err) => setError('Gagal menyimpan foto ke database: ' + (err?.message || 'Error tidak diketahui'))
    )
  }


  const removePhoto = (id) => {
    setError(null)
    updateData({ gallery: gallery.filter(p => p.id !== id) })
  }

  return (
    <div className="space-y-5">
      {/* Tips Box */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 text-slate-600 text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
          <HelpCircle size={14} className="text-slate-500" />
          <span>Tips:</span>
        </div>
        <hr className="border-slate-200 my-2" />
        <ul className="list-disc list-inside space-y-1.5 leading-relaxed text-slate-500">
          <li>Ketika upload foto, tunggu hingga 100% (indikator proses upload menghilang), kemudian baru klik simpan.</li>
          <li>Cara croping foto dan menyesuaikan ukuran foto klik tombol Atur Foto.</li>
          <li>Cara mengubah susunan urutan foto, klik dan tahan icon <span className="inline-block px-1 bg-teal-100 text-teal-600 rounded">⇅</span> pada foto yang telah diupload, kemudian geser foto.</li>
          <li>Cara menghapus foto, klik icon <span className="inline-block px-1 bg-red-100 text-red-600 rounded">X</span> pada foto yang telah diupload.</li>
        </ul>
      </div>

      <div className="text-center py-2 border-b border-slate-100">
        <h3 className="font-serif text-lg font-bold text-[#1a2e2b]">Foto</h3>
      </div>

      <div className="space-y-3">
        {/* 1. Foto Cover */}
        <AccordionItem
          title="Cover (Depan)"
          isOpen={activeSection === 'cover'}
          onToggle={() => toggleSection('cover')}
        >
          <div className="space-y-4">
            {isVideoTheme ? (
              <VideoUploadBox
                value={meta.coverVideo || null}
                onChange={val => updateData(prev => ({ ...prev, meta: { ...(prev.meta || {}), coverVideo: val } }))}
                helperText="Unggah video MP4 (maks 5MB) untuk cover sinematik Anda."
              />
            ) : (
              <PremiumPhotoUploadBox
                value={meta.coverPhoto || null}
                onChange={val => updateData(prev => ({ ...prev, meta: { ...(prev.meta || {}), coverPhoto: val } }))}
                helperText="Foto yang akan muncul di halaman pembuka (cover) undangan."
              />
            )}
            <div className="border-t border-slate-100 pt-3">
              <label className="form-label mb-2 text-slate-500 font-medium">Gaya Tampilan Foto Cover</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateData(prev => ({ ...prev, meta: { ...(prev.meta || {}), coverStyle: 'circle' } }))}
                  className={`py-2.5 px-4 rounded-xl text-xs font-semibold border-2 transition-all ${
                    (meta.coverStyle || 'circle') === 'circle'
                      ? 'bg-teal-50 border-teal-500 text-teal-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  ⭕ Lingkaran (Circle)
                </button>
                <button
                  type="button"
                  onClick={() => updateData(prev => ({ ...prev, meta: { ...(prev.meta || {}), coverStyle: 'fade' } }))}
                  className={`py-2.5 px-4 rounded-xl text-xs font-semibold border-2 transition-all ${
                    meta.coverStyle === 'fade'
                      ? 'bg-teal-50 border-teal-500 text-teal-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  🌁 Gradasi (Fade)
                </button>
              </div>
            </div>
          </div>
        </AccordionItem>

        {/* 2. Foto Slide Awal */}
        <AccordionItem
          title="Foto Slide Awal"
          isOpen={activeSection === 'slide'}
          onToggle={() => toggleSection('slide')}
        >
          <PremiumPhotoUploadBox
            value={meta.photo || null}
            onChange={val => updateData({ meta: { ...meta, photo: val } })}
            helperText="Foto utama pasangan yang akan muncul setelah undangan dibuka (Hero)."
          />
        </AccordionItem>

        {/* 3. Foto Mempelai */}
        <AccordionItem
          title="Foto Mempelai"
          isOpen={activeSection === 'mempelai'}
          onToggle={() => toggleSection('mempelai')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-slate-500 mb-1.5 font-medium">Mempelai Pria</label>
              <PremiumPhotoUploadBox
                value={groom.photo || null}
                onChange={val => updateData({ groom: { ...groom, photo: val } })}
              />
            </div>
            <div>
              <label className="form-label text-slate-500 mb-1.5 font-medium">Mempelai Wanita</label>
              <PremiumPhotoUploadBox
                value={bride.photo || null}
                onChange={val => updateData({ bride: { ...bride, photo: val } })}
              />
            </div>
          </div>
        </AccordionItem>

        {/* 4. Foto Galeri */}
        <AccordionItem
          title="Foto Galeri"
          isOpen={activeSection === 'gallery'}
          onToggle={() => toggleSection('gallery')}
        >
          <div className="grid grid-cols-3 gap-2 mb-3">
            {gallery.map(photo => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200">
                <img src={photo.src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-colors shadow"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {gallery.length < 10 && (
              <div
                onClick={() => !loading && inputRef.current.click()}
                className="aspect-square bg-white rounded-xl flex flex-col items-center justify-center border border-dashed border-slate-200 cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-all gap-1"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus size={20} className="text-slate-400" />
                    <span className="text-[10px] text-slate-400 font-medium">Tambah</span>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400">Maks. 10 foto · JPG, PNG, WEBP · Disarankan di bawah 1MB</p>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        </AccordionItem>

        {/* 5. Foto Penutup */}
        <AccordionItem
          title="Foto Penutup"
          isOpen={activeSection === 'footer'}
          onToggle={() => toggleSection('footer')}
        >
          <PremiumPhotoUploadBox
            value={meta.footerPhoto || null}
            onChange={val => updateData(prev => ({ ...prev, meta: { ...(prev.meta || {}), footerPhoto: val } }))}
            helperText="Foto pasangan yang akan muncul di bagian penutup (footer) undangan."
          />
        </AccordionItem>
      </div>

      {/* Video URL section */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mt-4">
        <label className="form-label text-slate-700 font-semibold mb-1.5">Link Video Prewedding (YouTube/Vimeo)</label>
        <input
          className="form-input bg-white"
          value={videoUrl}
          onChange={e => updateData({ videoUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  )
}
