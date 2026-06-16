import React from 'react'
import { Check } from 'lucide-react'
import { useAuth } from '../../App'
import { useSharedInvitation, getThemes } from '../../hooks/useSharedInvitation'

export default function GantiTemaForm() {
  const { user } = useAuth()
  const [data, updateData] = useSharedInvitation()
  const themes = getThemes()
  const selected = data.themeId || 1
  const activeTheme = themes.find(t => t.id === selected) || themes[0]

  // Filter themes based on user package (Luxury gets all, others get their specific category)
  const availableThemes = user?.package === 'Luxury' 
    ? themes 
    : themes.filter(t => t.category === user?.package)

  // Admin sees all themes
  const displayThemes = user?.role === 'admin' ? themes : availableThemes

  const handleUpdateColor = (key, val) => {
    updateData({
      customColors: {
        ...(data.customColors || {
          primary: activeTheme?.colors?.[0] || '#134e4a',
          accent: activeTheme?.colors?.[1] || '#d4a96a',
          bg: activeTheme?.colors?.[2] || '#faf7f2'
        }),
        [key]: val
      }
    })
  }

  const handleResetColors = () => {
    updateData({ customColors: null })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {displayThemes.map(theme => {
          const isCurrent = selected === theme.id
          
          return (
            <div key={theme.id} className="relative flex flex-col">
              <button
                type="button"
                onClick={() => {
                  updateData({ themeId: theme.id })
                }}
                className={`text-left p-3 rounded-2xl border-2 transition-all flex-1 w-full ${
                  isCurrent 
                    ? 'border-brand-400 bg-brand-50/5' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex gap-1 mb-2.5">
                  {theme.colors.map((c, i) => (
                    <div key={i} className="h-8 rounded-lg flex-1" style={{ background: c }} />
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm">{theme.emoji}</span>
                  <p className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                    {theme.name}
                    {!allowed && <span className="text-[10px]">🔒</span>}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-2">{theme.desc}</p>
                <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 self-start">
                  {theme.category || 'Special'}
                </span>
                {isCurrent && (
                  <div className="mt-2 flex items-center gap-1 text-brand-600 text-[10px] font-bold">
                    <Check size={11} /> Dipilih
                  </div>
                )}
              </button>
            </div>
          )
        })}
        {displayThemes.length === 0 && (
          <div className="col-span-2 text-center py-6 text-slate-400 text-xs">
            Belum ada tema di kategori ini.
          </div>
        )}
      </div>

      {/* ── Kustomisasi Warna Tema ── */}
      <div className="border-t border-slate-100 pt-5 space-y-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Kustomisasi Warna Tema</h3>
          <p className="text-xs text-slate-400 mt-0.5">Ubah warna tombol, teks aksen, dan latar belakang undangan</p>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="form-label mb-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Warna Utama</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 h-10">
              <input 
                type="color" 
                value={data.customColors?.primary || activeTheme?.colors?.[0] || '#134e4a'}
                onChange={e => handleUpdateColor('primary', e.target.value)}
                className="w-6 h-6 rounded-lg cursor-pointer border-none bg-transparent"
              />
              <span className="text-[10px] text-slate-500 font-mono uppercase truncate">{data.customColors?.primary || activeTheme?.colors?.[0] || '#134e4a'}</span>
            </div>
          </div>
          
          <div>
            <label className="form-label mb-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Warna Aksen</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 h-10">
              <input 
                type="color" 
                value={data.customColors?.accent || activeTheme?.colors?.[1] || '#d4a96a'}
                onChange={e => handleUpdateColor('accent', e.target.value)}
                className="w-6 h-6 rounded-lg cursor-pointer border-none bg-transparent"
              />
              <span className="text-[10px] text-slate-500 font-mono uppercase truncate">{data.customColors?.accent || activeTheme?.colors?.[1] || '#d4a96a'}</span>
            </div>
          </div>
          
          <div>
            <label className="form-label mb-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Warna Latar</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 h-10">
              <input 
                type="color" 
                value={data.customColors?.bg || activeTheme?.colors?.[2] || '#faf7f2'}
                onChange={e => handleUpdateColor('bg', e.target.value)}
                className="w-6 h-6 rounded-lg cursor-pointer border-none bg-transparent"
              />
              <span className="text-[10px] text-slate-500 font-mono uppercase truncate">{data.customColors?.bg || activeTheme?.colors?.[2] || '#faf7f2'}</span>
            </div>
          </div>
        </div>
        
        {data.customColors && (
          <button
            type="button"
            onClick={handleResetColors}
            className="text-[11px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 mt-1 transition-colors"
          >
            Reset ke Warna Bawaan Tema
          </button>
        )}
      </div>
    </div>
  )
}
