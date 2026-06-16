import React, { useState, useEffect } from 'react'
import { ToggleSwitch } from '../common/FormHelpers'
import { useSharedInvitation } from '../../hooks/useSharedInvitation'

export default function CountdownForm() {
  const [data, updateData] = useSharedInvitation()
  const enabled = data.countdownEnabled !== false

  // Derive countdown target from the first event date (same as template)
  const firstEvent = (data.events || []).find(ev => ev.date && ev.date.length === 10)
  const targetDate = firstEvent ? `${firstEvent.date}T${firstEvent.start || '08:00'}:00` : null
  const isPast = targetDate && new Date(targetDate) <= new Date()

  // Live preview countdown
  const [preview, setPreview] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    if (!targetDate || isPast) return
    const calc = () => {
      const diff = new Date(targetDate) - new Date()
      if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 }
      const total = Math.floor(diff / 1000)
      return {
        d: Math.floor(total / 86400),
        h: Math.floor(total / 3600) % 24,
        m: Math.floor(total / 60) % 60,
        s: total % 60,
      }
    }
    setPreview(calc())
    const id = setInterval(() => setPreview(calc()), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between bg-brand-50 rounded-xl p-4 border border-brand-100">
        <div>
          <h4 className="font-semibold text-brand-900 text-sm">Aktifkan Hitung Mundur</h4>
          <p className="text-xs text-brand-700/80 mt-0.5">Tampilkan timer ke acara pertama</p>
        </div>
        <ToggleSwitch checked={enabled} onChange={val => updateData({ countdownEnabled: val })} />
      </div>

      {enabled && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Preview Live</p>
          {targetDate ? (
            isPast ? (
              <p className="text-brand-600 font-bold">Acara telah berlangsung!</p>
            ) : (
              <div className="flex justify-center gap-3">
                {[
                  { label: 'Hari', val: preview.d },
                  { label: 'Jam', val: preview.h },
                  { label: 'Menit', val: preview.m },
                  { label: 'Detik', val: preview.s },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-lg">
                      {item.val.toString().padStart(2, '0')}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1.5 uppercase font-semibold">{item.label}</span>
                  </div>
                ))}
              </div>
            )
          ) : (
            <p className="text-xs text-slate-400">Silakan atur tanggal Acara terlebih dahulu.</p>
          )}
        </div>
      )}
    </div>
  )
}
