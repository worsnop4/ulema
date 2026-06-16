import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { ToggleSwitch } from '../common/FormHelpers'
import { useSharedInvitation } from '../../hooks/useSharedInvitation'

export default function LiveStreamForm() {
  const [data, updateData] = useSharedInvitation()
  const enabled = data.livestreamEnabled || false
  const platforms = data.livestreamPlatforms || [{ id: 1, type: 'YouTube Live', url: '' }]

  const add = () => updateData({ livestreamPlatforms: [...platforms, { id: Date.now(), type: 'YouTube Live', url: '' }] })
  const remove = (id) => updateData({ livestreamPlatforms: platforms.filter(x => x.id !== id) })
  const update = (id, key, val) => updateData({
    livestreamPlatforms: platforms.map(x => x.id === id ? { ...x, [key]: val } : x)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div>
          <p className="font-semibold text-slate-800 text-sm">Aktifkan Live Streaming</p>
          <p className="text-xs text-slate-500 mt-0.5">Tampilkan tombol siaran langsung di undangan</p>
        </div>
        <ToggleSwitch checked={enabled} onChange={val => updateData({ livestreamEnabled: val })} />
      </div>
      {enabled && (
        <div className="space-y-3">
          {platforms.map((p, i) => (
            <div key={p.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-700 text-sm">Platform {i + 1}</h4>
                {platforms.length > 1 && (
                  <button onClick={() => remove(p.id)} className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="form-label">Platform</label>
                  <select className="form-select" value={p.type} onChange={e => update(p.id, 'type', e.target.value)}>
                    {['YouTube Live', 'Zoom', 'Instagram Live', 'Facebook Live'].map(x => <option key={x}>{x}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">URL Streaming</label>
                  <input className="form-input" value={p.url} onChange={e => update(p.id, 'url', e.target.value)} placeholder="https://..." />
                </div>
              </div>
            </div>
          ))}
          <button onClick={add} className="btn-secondary w-full justify-center">
            <Plus size={14} /> Tambah Platform
          </button>
        </div>
      )}
    </div>
  )
}
