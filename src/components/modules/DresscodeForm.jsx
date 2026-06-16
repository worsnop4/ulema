import React from 'react'
import { useSharedInvitation } from '../../hooks/useSharedInvitation'

const DRESS_COLORS = [
  { name: 'Sage Green', hex: '#87ae8a' },
  { name: 'Dusty Rose', hex: '#d4a0a0' },
  { name: 'Navy Blue', hex: '#2c3e6b' },
  { name: 'Ivory White', hex: '#f5f0e8' },
  { name: 'Terracotta', hex: '#c07c5c' },
  { name: 'Lavender', hex: '#b09abf' },
  { name: 'Dusty Blue', hex: '#7a9cb0' },
  { name: 'Champagne', hex: '#d4b896' },
]

export default function DresscodeForm() {
  const [data, updateData] = useSharedInvitation()
  const dresscode = data.dresscode || { color: DRESS_COLORS[0].hex, name: DRESS_COLORS[0].name, notes: '' }

  const selectedIndex = DRESS_COLORS.findIndex(c => c.hex === dresscode.color)
  const currentColor = DRESS_COLORS[selectedIndex >= 0 ? selectedIndex : 0]

  const selectColor = (i) => {
    updateData({ dresscode: { ...dresscode, color: DRESS_COLORS[i].hex, name: DRESS_COLORS[i].name } })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="form-label">Pilih Warna Tema</label>
        <div className="grid grid-cols-4 gap-2.5">
          {DRESS_COLORS.map((c, i) => (
            <button key={c.name} type="button" onClick={() => selectColor(i)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${selectedIndex === i ? 'border-brand-400 bg-brand-50' : 'border-transparent hover:border-slate-200'}`}>
              <div className="w-10 h-10 rounded-xl shadow-sm border border-black/10" style={{ background: c.hex }} />
              <span className="text-[10px] text-slate-600 font-medium text-center leading-tight">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="form-label">Keterangan Tambahan</label>
        <textarea className="form-textarea" rows={3}
          value={dresscode.notes || ''}
          onChange={e => updateData({ dresscode: { ...dresscode, notes: e.target.value } })}
          placeholder="Contoh: Mohon menggunakan pakaian formal bernuansa pastel sage green." />
      </div>
      <div className="p-4 rounded-2xl flex items-center gap-4" style={{ background: currentColor.hex + '30', border: `2px solid ${currentColor.hex}40` }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: currentColor.hex }}>👗</div>
        <div>
          <p className="font-semibold text-slate-800 text-sm">Dresscode Preview</p>
          <p className="text-xs text-slate-600 font-medium">{currentColor.name}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{(dresscode.notes || '').slice(0, 60)}</p>
        </div>
      </div>
    </div>
  )
}
