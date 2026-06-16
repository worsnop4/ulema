import React from 'react'
import { Trash2 } from 'lucide-react'
import { useSharedInvitation } from '../../hooks/useSharedInvitation'

export default function UcapanRsvpForm() {
  const [data, updateData] = useSharedInvitation()
  const entries = data.rsvps || []
  const remove = (id) => updateData(prev => ({
    ...prev,
    rsvps: (prev.rsvps || []).filter(x => x.id !== id)
  }))
  const total = entries.length
  const hadir = entries.filter(e => e.rsvp === 'hadir').reduce((s, e) => s + (Number(e.guests) || 1), 0)
  const tidakHadir = entries.filter(e => e.rsvp === 'tidak_hadir').length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[['Total Tamu', total, 'bg-slate-50 text-slate-700'], ['Hadir', `${hadir} org`, 'bg-green-50 text-green-700'], ['Tidak Hadir', tidakHadir, 'bg-red-50 text-red-600']].map(([l, v, cls]) => (
          <div key={l} className={`${cls} rounded-2xl p-3 text-center`}>
            <p className="text-xl font-bold font-serif">{v}</p>
            <p className="text-[11px] font-medium opacity-80 mt-0.5">{l}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            📭 Belum ada konfirmasi kehadiran dari tamu.
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {entry.name ? entry.name.charAt(0) : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-800 text-sm">{entry.name}</p>
                  <span className={`badge ${entry.rsvp === 'hadir' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'} text-[10px]`}>
                    {entry.rsvp === 'hadir' ? `✓ Hadir (${Number(entry.guests) || 1})` : '✗ Tidak Hadir'}
                  </span>
                </div>
                {entry.wish && <p className="text-[11px] text-slate-500 mt-0.5">"{entry.wish}"</p>}
                <p className="text-[10px] text-slate-400 mt-0.5">{entry.time}</p>
              </div>
              <button onClick={() => remove(entry.id)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
      <button className="btn-secondary w-full justify-center text-xs">Export ke CSV / Excel</button>
    </div>
  )
}
