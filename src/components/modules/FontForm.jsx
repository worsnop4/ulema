import React from 'react'
import { Check } from 'lucide-react'
import { useSharedInvitation } from '../../hooks/useSharedInvitation'

const FONTS = [
  { name: 'Playfair Display', category: 'Serif', sample: 'Doni & Rizka' },
  { name: 'Cormorant Garamond', category: 'Serif', sample: 'Doni & Rizka' },
  { name: 'Libre Baskerville', category: 'Serif', sample: 'Doni & Rizka' },
  { name: 'Great Vibes', category: 'Script', sample: 'Doni & Rizka' },
  { name: 'Dancing Script', category: 'Script', sample: 'Doni & Rizka' },
  { name: 'Lato', category: 'Sans-serif', sample: 'Doni & Rizka' },
]

export default function FontForm() {
  const [data, updateData] = useSharedInvitation()
  const fontConfig = data.fontConfig || { headingIndex: 0, bodyIndex: 5, headingSize: 36, bodySize: 14 }
  const update = (key, val) => updateData({ fontConfig: { ...fontConfig, [key]: val } })

  return (
    <div className="space-y-5">
      <div>
        <label className="form-label">Font Heading (Judul)</label>
        <div className="space-y-2">
          {FONTS.filter(f => f.category !== 'Sans-serif').map((f, i) => (
            <button key={f.name} type="button" onClick={() => update('headingIndex', i)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${fontConfig.headingIndex === i ? 'border-brand-400 bg-brand-50' : 'border-slate-200 bg-slate-50 hover:border-brand-200'}`}>
              <div>
                <p className="text-xs text-slate-500 font-semibold">{f.name} · {f.category}</p>
                <p className="text-lg text-slate-800 mt-0.5" style={{ fontFamily: f.name }}>{f.sample}</p>
              </div>
              {fontConfig.headingIndex === i && <Check size={14} className="text-brand-600 flex-shrink-0" />}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label className="form-label">Ukuran Heading: {fontConfig.headingSize}px</label>
          <input type="range" min={24} max={72} value={fontConfig.headingSize} onChange={e => update('headingSize', +e.target.value)} className="w-full accent-brand-600" />
        </div>
      </div>
      <div>
        <label className="form-label">Font Body (Konten)</label>
        <select className="form-select" value={fontConfig.bodyIndex} onChange={e => update('bodyIndex', +e.target.value)}>
          {FONTS.map((f, i) => <option key={f.name} value={i}>{f.name} ({f.category})</option>)}
        </select>
        <div className="mt-3">
          <label className="form-label">Ukuran Body: {fontConfig.bodySize}px</label>
          <input type="range" min={10} max={20} value={fontConfig.bodySize} onChange={e => update('bodySize', +e.target.value)} className="w-full accent-brand-600" />
        </div>
      </div>
    </div>
  )
}
