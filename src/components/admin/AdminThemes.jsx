import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getThemes, saveThemes } from '../../hooks/useSharedInvitation'
import { storageService } from '../../services/storageService'
import { Edit, Trash2, Check, Palette, Layout } from 'lucide-react'

export default function AdminThemes() {
  const navigate = useNavigate()
  const [themes, setThemes] = useState(() => getThemes())
  const [message, setMessage] = useState('')

  // Theme Form States
  const [editingThemeId, setEditingThemeId] = useState(null)
  const [themeName, setThemeName] = useState('')
  const [themeEmoji, setThemeEmoji] = useState('🌿')
  const [themeLayout, setThemeLayout] = useState('watercolor-floral')
  const [themeColor1, setThemeColor1] = useState('#134e4a')
  const [themeColor2, setThemeColor2] = useState('#d4a96a')
  const [themeColor3, setThemeColor3] = useState('#faf7f2')
  const [themeDesc, setThemeDesc] = useState('')
  const [themeCategory, setThemeCategory] = useState('Special')

  useEffect(() => {
    const handleUpdate = () => {
      setThemes(getThemes())
    }
    window.addEventListener('local-storage-update', handleUpdate)
    return () => window.removeEventListener('local-storage-update', handleUpdate)
  }, [])

  const handleSaveTheme = (e) => {
    e.preventDefault()
    if (!themeName.trim()) return

    const themeColors = [themeColor1, themeColor2, themeColor3]

    if (editingThemeId) {
      const updated = themes.map(t => {
        if (t.id === editingThemeId) {
          return {
            ...t,
            name: themeName.trim(),
            emoji: themeEmoji.trim(),
            layout: themeLayout,
            colors: themeColors,
            desc: themeDesc.trim(),
            category: themeCategory
          }
        }
        return t
      })
      saveThemes(updated)
      setThemes(updated)
      setMessage('🎉 Tema berhasil diperbarui!')
      setEditingThemeId(null)
    } else {
      const newTheme = {
        id: Date.now(),
        name: themeName.trim(),
        emoji: themeEmoji.trim(),
        layout: themeLayout,
        colors: themeColors,
        desc: themeDesc.trim(),
        category: themeCategory
      }
      const updated = [...themes, newTheme]
      saveThemes(updated)
      setThemes(updated)
      setMessage('🎉 Tema baru berhasil ditambahkan!')
    }

    setThemeName('')
    setThemeEmoji('🌿')
    setThemeLayout('watercolor-floral')
    setThemeColor1('#134e4a')
    setThemeColor2('#d4a96a')
    setThemeColor3('#faf7f2')
    setThemeDesc('')
    setThemeCategory('Special')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleEditThemeClick = (theme) => {
    setEditingThemeId(theme.id)
    setThemeName(theme.name)
    setThemeEmoji(theme.emoji || '🌿')
    setThemeLayout(theme.layout || 'watercolor-floral')
    setThemeColor1(theme.colors?.[0] || '#134e4a')
    setThemeColor2(theme.colors?.[1] || '#d4a96a')
    setThemeColor3(theme.colors?.[2] || '#faf7f2')
    setThemeDesc(theme.desc || '')
    setThemeCategory(theme.category || 'Special')
  }

  const handleDeleteTheme = (id) => {
    const updated = themes.filter(t => t.id !== id)
    saveThemes(updated)
    setThemes(updated)
    setMessage('🗑️ Tema berhasil dihapus.')
    setTimeout(() => setMessage(''), 3000)
    if (editingThemeId === id) {
      setEditingThemeId(null)
      setThemeName('')
      setThemeDesc('')
    }
  }

  const handleCancelThemeEdit = () => {
    setEditingThemeId(null)
    setThemeName('')
    setThemeEmoji('🌿')
    setThemeLayout('watercolor-floral')
    setThemeColor1('#134e4a')
    setThemeColor2('#d4a96a')
    setThemeColor3('#faf7f2')
    setThemeDesc('')
    setThemeCategory('Special')
  }

  const handleEditDemoClick = (themeId) => {
    storageService.setItem('inviter_admin_demo_mode', themeId)
    window.dispatchEvent(new Event('storage'))
    navigate('/dashboard/invitation/edit')
  }

  const themeUsageStats = useMemo(() => {
    const usersStored = storageService.getItem('inviter_registered_users')
    const registeredUsers = usersStored || []

    const realCounts = {}
    registeredUsers.forEach(u => {
      try {
        const parsed = storageService.getItem(`inviter_template_data_${u.email}`)
        if (parsed && parsed.themeId) {
          realCounts[parsed.themeId] = (realCounts[parsed.themeId] || 0) + 1
        }
      } catch (e) {}
    })

    const list = themes.map(t => {
      const realCount = realCounts[t.id] || 0
      return {
        id: t.id,
        name: t.name,
        emoji: t.emoji,
        colors: t.colors,
        count: realCount,
      }
    })

    const sortedList = [...list].sort((a, b) => b.count - a.count)
    const totalCount = sortedList.reduce((sum, item) => sum + item.count, 0)
    const highest = sortedList[0] || null
    const lowest = sortedList[sortedList.length - 1] || null

    return { list: sortedList, totalCount, highest, lowest }
  }, [themes])

  return (
    <div className="space-y-6">
      {message && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 text-sm rounded-2xl px-5 py-4">
          <p className="font-semibold">{message}</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        
        {/* Left Column */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-fit">
          {editingThemeId ? (
            <div>
              <div className="flex items-center gap-2 mb-4 border-b pb-3">
                <Edit className="text-brand-500" size={20} />
                <h2 className="font-semibold text-slate-800 text-base">Edit Tema Preset</h2>
              </div>

              <form onSubmit={handleSaveTheme} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Tema</label>
                  <input type="text" className="form-input text-sm" placeholder="Contoh: Classic Elegance" value={themeName} onChange={e => setThemeName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Emoji Ikon</label>
                    <input type="text" className="form-input text-sm text-center" placeholder="🌿" value={themeEmoji} onChange={e => setThemeEmoji(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Kategori / Paket</label>
                    <select className="form-input text-sm bg-white" value={themeCategory} onChange={e => setThemeCategory(e.target.value)}>
                      <option value="Special">Special</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Motion">Motion</option>
                      <option value="Adat">Adat</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tata Letak (Base Layout Style)</label>
                  <select className="form-input text-sm bg-white" value={themeLayout} onChange={e => setThemeLayout(e.target.value)}>
                    <option value="watercolor-floral">Watercolor Floral</option>
                    <option value="dark-luxury">Dark Luxury (Midnight)</option>
                    <option value="modern-minimalist">Modern Minimalist (Ivory)</option>
                    <option value="playful-illustrative">Playful Illustrative (Lavender)</option>
                    <option value="traditional-adat">Traditional Adat (Tropical)</option>
                    <option value="special-001">Special 001 (SPL-001)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Palet Warna Skema</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ label: 'Warna Utama', val: themeColor1, set: setThemeColor1 }, { label: 'Warna Aksen', val: themeColor2, set: setThemeColor2 }, { label: 'Background', val: themeColor3, set: setThemeColor3 }].map(c => (
                      <div key={c.label}>
                        <label className="block text-[10px] text-slate-400 mb-1 font-bold">{c.label}</label>
                        <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1.5 bg-slate-50">
                          <input type="color" className="w-6 h-6 rounded cursor-pointer border-none p-0" value={c.val} onChange={e => c.set(e.target.value)} />
                          <input type="text" className="w-full text-[10px] font-mono border-none p-0 bg-transparent focus:ring-0 focus:outline-none" value={c.val} onChange={e => c.set(e.target.value)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Deskripsi Tema</label>
                  <textarea className="form-input text-sm resize-none" rows={2} placeholder="Keterangan singkat gaya estetika tema ini..." value={themeDesc} onChange={e => setThemeDesc(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={handleCancelThemeEdit} className="flex-1 border border-slate-350 hover:bg-slate-50 text-slate-700 font-bold py-2.5 text-xs rounded-xl transition-all uppercase tracking-wider">
                    Batal
                  </button>
                  <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 text-xs rounded-xl transition-all uppercase tracking-wider shadow-sm flex items-center justify-center gap-1">
                    <Check size={14} /> Simpan
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4 border-b pb-3">
                <Palette className="text-brand-500" size={20} />
                <h2 className="font-semibold text-slate-800 text-base">Analitik Penggunaan</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block mb-1">Terpopuler 🔥</span>
                  {themeUsageStats.highest ? (
                    <>
                      <p className="text-xs font-bold text-slate-800 truncate">{themeUsageStats.highest.emoji} {themeUsageStats.highest.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5"><strong>{themeUsageStats.highest.count}</strong> pengguna</p>
                    </>
                  ) : <p className="text-xs text-slate-400">Belum ada data</p>}
                </div>
                <div className="p-3 bg-gradient-to-br from-slate-50 to-rose-50/30 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Kurang Diminati ❄️</span>
                  {themeUsageStats.lowest ? (
                    <>
                      <p className="text-xs font-bold text-slate-800 truncate">{themeUsageStats.lowest.emoji} {themeUsageStats.lowest.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5"><strong>{themeUsageStats.lowest.count}</strong> pengguna</p>
                    </>
                  ) : <p className="text-xs text-slate-400">Belum ada data</p>}
                </div>
              </div>
              <div className="space-y-3.5 pt-1">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Persentase Penggunaan</h3>
                <div className="space-y-3">
                  {themeUsageStats.list.map(item => {
                    const pct = themeUsageStats.totalCount > 0 ? Math.round((item.count / themeUsageStats.totalCount) * 100) : 0
                    return (
                      <div key={item.id} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-700 truncate max-w-[170px]" title={item.name}>{item.emoji} {item.name}</span>
                          <span className="font-mono text-slate-400 text-[10px]">{item.count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: item.colors?.[0] || '#0d9488' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-fit space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h2 className="font-semibold text-slate-800 text-base">Seluruh Preset Tema ({themes.length})</h2>
              <p className="text-xs text-slate-400">Konfigurasi di bawah ini ter-sync secara real-time ke editor pengguna.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themes.map(theme => (
              <div key={theme.id} className="border border-slate-150 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all bg-slate-50/20 relative group">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-mono uppercase tracking-wider">
                      {theme.category || 'Special'}
                    </span>
                    <div className="flex gap-1.5">
                      <button onClick={() => handleEditThemeClick(theme)} className="text-slate-400 hover:text-blue-600 p-0.5 transition-colors" title="Edit Tema">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => handleDeleteTheme(theme.id)} className="text-slate-400 hover:text-red-650 p-0.5 transition-colors" title="Hapus Tema">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{theme.emoji}</span>
                    <div>
                      <h3 className="font-bold text-slate-800 text-xs">{theme.name}</h3>
                      <span className="text-[8px] font-bold text-teal-650 bg-teal-50 px-1 rounded font-mono uppercase inline-block">
                        {theme.layout || 'watercolor-floral'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{theme.desc}</p>
                </div>
                <div className="space-y-2 pt-2.5 border-t border-slate-200/50">
                  <div className="flex gap-1 h-5 rounded overflow-hidden shadow-inner border border-slate-200/50 mb-2">
                    {theme.colors?.map((c, i) => (
                      <div key={i} className="flex-1" style={{ background: c }} title={c} />
                    ))}
                  </div>
                  <button onClick={() => handleEditDemoClick(theme.id)} className="w-full btn-secondary py-1.5 text-[11px] justify-center gap-1.5 bg-white border border-slate-200 shadow-sm">
                    <Layout size={12} className="text-brand-500" /> Edit Konten Demo Tema
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
