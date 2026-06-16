import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useSharedInvitation } from '../../hooks/useSharedInvitation'

const EVENT_EMOJIS = ['🕌', '🏛️', '⛪', '🌿', '🎊', '💍']

export default function AcaraForm() {
  const [data, updateData] = useSharedInvitation()
  const events = data.events || []

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    } catch { return dateStr }
  }

  const addEvent = () => updateData({
    events: [...events, { id: Date.now(), name: '', date: '', dateLabel: '', start: '', end: '', tz: 'WIB', venue: '', address: '', maps: '', emoji: '🎊' }]
  })
  const removeEvent = (id) => updateData({ events: events.filter(ev => ev.id !== id) })
  const update = (id, key, val) => {
    const updated = events.map(ev => {
      if (ev.id !== id) return ev
      const next = { ...ev, [key]: val }
      if (key === 'date') next.dateLabel = formatDateLabel(val)
      return next
    })
    updateData({ events: updated })
  }

  return (
    <div className="space-y-4">
      {events.map((ev, i) => (
        <div key={ev.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-700 text-sm">Sesi {i + 1}</h4>
            {events.length > 1 && (
              <button onClick={() => removeEvent(ev.id)} className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Nama Sesi</label>
                <input className="form-input" value={ev.name} onChange={e => update(ev.id, 'name', e.target.value)} placeholder="cth. Akad Nikah" />
              </div>
              <div>
                <label className="form-label">Emoji</label>
                <div className="flex gap-1 flex-wrap">
                  {EVENT_EMOJIS.map(emoji => (
                    <button key={emoji} type="button"
                      onClick={() => update(ev.id, 'emoji', emoji)}
                      className={`w-9 h-9 rounded-xl border-2 text-lg transition-all ${ev.emoji === emoji ? 'border-brand-400 bg-brand-50' : 'border-slate-200 hover:border-brand-200'}`}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Tanggal</label>
                <input type="date" className="form-input" value={ev.date} onChange={e => update(ev.id, 'date', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Zona Waktu</label>
                <select className="form-select" value={ev.tz} onChange={e => update(ev.id, 'tz', e.target.value)}>
                  <option>WIB</option><option>WITA</option><option>WIT</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Mulai</label>
                <input type="time" className="form-input" value={ev.start} onChange={e => update(ev.id, 'start', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Selesai</label>
                <input type="time" className="form-input" value={ev.end} onChange={e => update(ev.id, 'end', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="form-label">Nama Venue</label>
              <input className="form-input" value={ev.venue} onChange={e => update(ev.id, 'venue', e.target.value)} placeholder="Nama gedung / tempat" />
            </div>
            <div>
              <label className="form-label">Alamat Lengkap</label>
              <input className="form-input" value={ev.address || ''} onChange={e => update(ev.id, 'address', e.target.value)} placeholder="Jl. ... No. ..." />
            </div>
            <div>
              <label className="form-label">Google Maps URL</label>
              <input className="form-input" value={ev.maps} onChange={e => update(ev.id, 'maps', e.target.value)} placeholder="https://maps.google.com/..." />
            </div>
          </div>
        </div>
      ))}
      <button onClick={addEvent} className="btn-secondary w-full justify-center">
        <Plus size={14} /> Tambah Sesi Acara
      </button>
    </div>
  )
}
