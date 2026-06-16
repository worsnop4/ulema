import { useState, useEffect } from 'react'
import { Lock, Download, Search, Sparkles } from 'lucide-react'
import { getIllustrations, useSharedInvitation } from '../hooks/useSharedInvitation'
import { useAuth } from '../App'

export default function IllustrationsPage() {
  const [illustrations, setIllustrations] = useState(() => getIllustrations())
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [invitationData, updateInvitationData] = useSharedInvitation()

  // Sync state changes across tabs/windows
  useEffect(() => {
    const handleUpdate = () => {
      setIllustrations(getIllustrations())
    }
    window.addEventListener('local-storage-update', handleUpdate)
    return () => window.removeEventListener('local-storage-update', handleUpdate)
  }, [])

  // Retrieve user pricing plan
  const { user } = useAuth()
  const isPaid = user && (user.package !== 'none' || user.role === 'admin')
  const isUser = user && user.role !== 'admin'

  const applyAsGroom = (src) => {
    if (!invitationData) return
    updateInvitationData({
      groom: {
        ...invitationData.groom,
        photo: src
      }
    })
  }

  const applyAsBride = (src) => {
    if (!invitationData) return
    updateInvitationData({
      bride: {
        ...invitationData.bride,
        photo: src
      }
    })
  }

  // Helper to fetch the static image and trigger a direct file download
  const downloadAvatar = async (url, filename) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch (e) {
      // Fallback direct download
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  // Filtering Logic
  const filtered = illustrations.filter(ill => {
    const matchesCategory = activeCategory === 'Semua' || ill.category === activeCategory
    const matchesSearch = ill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ill.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // Categories list
  const categories = ['Semua', 'Hijab', 'Tanpa Hijab', 'Pria', 'Adat', 'Pasangan']

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
        <div>
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Pustaka Aset</p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Aset Avatar Mempelai</h1>
          <p className="text-slate-500 text-sm mt-1">
            Pilih gambar avatar berkualitas tinggi (PNG transparan) dan pasang langsung ke profil mempelai pria atau wanita dengan satu klik mudah.
          </p>
        </div>
        <div className="bg-brand-50 text-brand-700 text-xs px-3 py-1.5 rounded-xl border border-brand-100 flex items-center gap-1.5 h-fit w-fit">
          <Sparkles size={13} /> {isPaid ? `Paket Aktif: ${user.package || 'Admin'}` : 'Gunakan Versi Free'}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Category Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
          {categories.map(cat => {
            const isActive = activeCategory === cat
            const count = cat === 'Semua'
              ? illustrations.length
              : illustrations.filter(i => i.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
                  isActive ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat} 
                <span className="bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-full text-[9px] font-bold">
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input pl-9 pr-4 py-2 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {filtered.map(ill => {
          // Locked if premium and the user has not paid (package is 'none')
          const isLocked = ill.locked && !isPaid
          const imageSrc = ill.filename.startsWith('data:') ? ill.filename : `/avatars/${ill.category}/${ill.filename}`
          
          const isSelectedGroom = invitationData?.groom?.photo === imageSrc
          const isSelectedBride = invitationData?.bride?.photo === imageSrc

          return (
            <div 
              key={ill.id} 
              className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all relative ${
                isLocked ? 'border-slate-150 opacity-80' : (isSelectedGroom || isSelectedBride ? 'border-teal-400 ring-2 ring-teal-400/20' : 'border-slate-200')
              }`}
            >
              {/* Preview Box */}
              <div 
                className="h-32 flex items-center justify-center relative select-none bg-slate-50"
              >
                <img 
                  src={imageSrc} 
                  alt={ill.name} 
                  onError={(e) => { e.target.src = '/avatars/placeholder.svg' }}
                  className="h-28 w-28 object-contain transform hover:scale-105 transition-transform" 
                />
                
                {/* Active Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                  {isSelectedGroom && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 bg-teal-650 text-white rounded-md shadow-sm">
                      Pria Aktif
                    </span>
                  )}
                  {isSelectedBride && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 bg-rose-500 text-white rounded-md shadow-sm">
                      Wanita Aktif
                    </span>
                  )}
                </div>

                {isLocked && (
                  <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-white/95 rounded-xl p-2.5 shadow-md flex items-center justify-center border border-slate-100">
                      <Lock size={16} className="text-amber-600" />
                    </div>
                  </div>
                )}
              </div>

              {/* Detail Info */}
              <div className="p-3.5 space-y-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs sm:text-sm truncate">{ill.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ill.tags?.map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded-sm">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {isLocked ? (
                  <div className="w-full bg-amber-50 border border-amber-100 text-amber-800 text-[10px] py-2 rounded-xl font-bold flex items-center justify-center gap-1 shadow-inner">
                    <Lock size={10} /> Premium (Terkunci)
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {isUser && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => applyAsGroom(imageSrc)}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all text-center flex items-center justify-center gap-0.5 cursor-pointer ${
                            isSelectedGroom 
                              ? 'bg-teal-50 text-teal-800 border border-teal-200' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          Gunakan Pria
                        </button>
                        <button
                          onClick={() => applyAsBride(imageSrc)}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all text-center flex items-center justify-center gap-0.5 cursor-pointer ${
                            isSelectedBride 
                              ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          Gunakan Wanita
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => downloadAvatar(imageSrc, ill.filename)}
                      className="w-full flex items-center justify-center gap-1 bg-brand-50 hover:bg-brand-100 text-brand-700 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                    >
                      <Download size={11} /> Unduh PNG
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 bg-slate-50 rounded-3xl border border-slate-150">
            <span className="text-4xl">🎨</span>
            <p className="text-sm font-semibold text-slate-600 mt-3">Tidak ada avatar ditemukan.</p>
            <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        )}
      </div>
    </div>
  )
}
