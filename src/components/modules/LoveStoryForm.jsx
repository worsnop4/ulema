import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { PhotoUploadBox } from '../common/FormHelpers'
import { useSharedInvitation } from '../../hooks/useSharedInvitation'

export default function LoveStoryForm() {
  const [data, updateData] = useSharedInvitation()
  const items = data.loveStory || []

  const add = () => updateData({
    loveStory: [...items, { id: Date.now(), year: '', title: '', desc: '', emoji: '💕' }]
  })
  const remove = (id) => updateData({ loveStory: items.filter(x => x.id !== id) })
  const update = (id, key, val) => updateData({
    loveStory: items.map(x => x.id === id ? { ...x, [key]: val } : x)
  })

  return (
    <div className="space-y-4">
      <div className="relative pl-5">
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-brand-100" />
        {items.map((item, i) => (
          <div key={item.id} className="relative mb-4">
            <div className="absolute -left-3 w-3 h-3 rounded-full bg-brand-500 border-2 border-white shadow" style={{ top: '18px' }} />
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 ml-4">
              <div className="flex items-center gap-2 mb-3 justify-between">
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">Milestone {i + 1}</span>
                {items.length > 1 && (
                  <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600 p-0.5">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="form-label">Emoji</label>
                  <input className="form-input text-center text-xl" value={item.emoji} onChange={e => update(item.id, 'emoji', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Tahun</label>
                  <input className="form-input" value={item.year} onChange={e => update(item.id, 'year', e.target.value)} placeholder="2024" />
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="form-label">Judul</label>
                  <input className="form-input" value={item.title} onChange={e => update(item.id, 'title', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Deskripsi</label>
                  <textarea className="form-textarea" rows={2} value={item.desc} onChange={e => update(item.id, 'desc', e.target.value)} />
                </div>
                <div>
                  <PhotoUploadBox
                    label="Foto Pendukung"
                    value={item.photo}
                    onChange={val => update(item.id, 'photo', val)}
                  />
                  {item.photo && (
                    <button
                      type="button"
                      onClick={() => update(item.id, 'photo', null)}
                      className="mt-1.5 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={12} /> Hapus Foto
                    </button>
                  )}
                </div>
              </div></div>
          </div>
        ))}
      </div>
      <button onClick={add} className="btn-secondary w-full justify-center">
        <Plus size={14} /> Tambah Milestone
      </button>
    </div>
  )
}
