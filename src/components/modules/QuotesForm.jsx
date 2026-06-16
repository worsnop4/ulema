import React from 'react'
import { useSharedInvitation } from '../../hooks/useSharedInvitation'

const QUOTES_PRESETS = [
  { label: 'Al-Quran (Ar-Rum: 21)', text: '"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya…" — QS. Ar-Rum: 21' },
  { label: 'Alkitab (Kejadian 2:24)', text: '"Sebab itu seorang laki-laki akan meninggalkan ayahnya dan ibunya dan bersatu dengan isterinya, sehingga keduanya menjadi satu daging." — Kej. 2:24' },
  { label: 'Kutipan Romantis', text: '"Cinta bukan tentang menemukan seseorang yang sempurna, tapi tentang belajar melihat seseorang yang tidak sempurna dengan sempurna."' },
  { label: 'Custom', text: '' },
]

export default function QuotesForm() {
  const [data, updateData] = useSharedInvitation()
  const currentQuote = data.quote !== undefined ? data.quote : ''

  const selectedIndex = QUOTES_PRESETS.findIndex(q => q.text && q.text === currentQuote) !== -1
    ? QUOTES_PRESETS.findIndex(q => q.text && q.text === currentQuote)
    : 3 // custom

  return (
    <div className="space-y-4">
      <div>
        <label className="form-label">Pilih Template</label>
        <div className="space-y-2">
          {QUOTES_PRESETS.map((q, i) => (
            <button key={i} onClick={() => { if (q.text) updateData({ quote: q.text }) }}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${selectedIndex === i ? 'border-brand-400 bg-brand-50 text-brand-800' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-200'}`}>
              <p className="font-semibold text-xs mb-1">{q.label}</p>
              {q.text && <p className="text-[11px] opacity-70 line-clamp-2">{q.text}</p>}
              {!q.text && <p className="text-[11px] opacity-50 italic">Masukkan teks sendiri ↓</p>}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="form-label">Teks Kutipan (edit bebas)</label>
        <textarea className="form-textarea" rows={4}
          value={currentQuote}
          onChange={e => updateData({ quote: e.target.value })}
          placeholder="Masukkan kutipan atau ayat suci..." />
      </div>
    </div>
  )
}
