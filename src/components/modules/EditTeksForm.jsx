import React from 'react'
import { useSharedInvitation } from '../../hooks/useSharedInvitation'

const DEFAULT_TEXTS = [
  { key: 'hero_title', label: 'Judul Utama', default: 'Bersama Merayakan Pernikahan' },
  { key: 'rsvp_button', label: 'Tombol RSVP', default: 'Konfirmasi Kehadiran' },
  { key: 'gift_title', label: 'Judul Hadiah', default: 'Kirim Hadiah Digital' },
  { key: 'stream_button', label: 'Tombol Live', default: 'Saksikan Siaran Langsung' },
  { key: 'wish_placeholder', label: 'Placeholder Ucapan', default: 'Tulis ucapan dan doamu...' },
  { key: 'attend_yes', label: 'Label Hadir', default: 'Saya akan hadir' },
  { key: 'attend_no', label: 'Label Tidak Hadir', default: 'Maaf, saya tidak bisa hadir' },
]

export default function EditTeksForm() {
  const [data, updateData] = useSharedInvitation()
  const customTexts = data.customTexts || {}

  const getValue = (key) => customTexts[key] ?? DEFAULT_TEXTS.find(t => t.key === key)?.default ?? ''
  const update = (key, val) => updateData({ customTexts: { ...customTexts, [key]: val } })
  const reset = (key, defaultVal) => updateData({ customTexts: { ...customTexts, [key]: defaultVal } })

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
        💡 Kustomisasi teks bawaan sistem agar sesuai dengan dialek atau gaya bahasa yang kamu inginkan.
      </p>
      {DEFAULT_TEXTS.map(t => (
        <div key={t.key}>
          <label className="form-label">{t.label}</label>
          <div className="flex gap-2">
            <input className="form-input flex-1" value={getValue(t.key)} onChange={e => update(t.key, e.target.value)} />
            <button onClick={() => reset(t.key, t.default)}
                    className="btn-ghost text-xs flex-shrink-0 text-slate-400 hover:text-slate-600 px-2">
              Reset
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
