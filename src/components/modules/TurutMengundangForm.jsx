import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useSharedInvitation } from '../../hooks/useSharedInvitation'
import { ToggleSwitch } from '../common/FormHelpers'

export default function TurutMengundangForm() {
  const [data, updateData] = useSharedInvitation()
  const families = data.families || [
    { id: 1, side: 'Keluarga Pria', members: [''] },
    { id: 2, side: 'Keluarga Wanita', members: [''] },
  ]

  const setFamilies = (next) => updateData({ families: next })
  const addMember = (id) => setFamilies(families.map(x => x.id === id ? { ...x, members: [...x.members, ''] } : x))
  const removeMember = (fid, mi) => setFamilies(families.map(x => x.id === fid ? { ...x, members: x.members.filter((_, i) => i !== mi) } : x))
  const updateMember = (fid, mi, val) => setFamilies(families.map(x => x.id === fid ? { ...x, members: x.members.map((m, i) => i === mi ? val : m) } : x))
  const updateSide = (fid, val) => setFamilies(families.map(x => x.id === fid ? { ...x, side: val } : x))

  return (
    <div className="space-y-4">
      {/* Toggle Section */}
      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Aktifkan Turut Mengundang</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Tampilkan daftar keluarga yang turut mengundang di undangan</p>
        </div>
        <ToggleSwitch
          checked={data.turutMengundangEnabled ?? false}
          onChange={(val) => updateData({ turutMengundangEnabled: val })}
        />
      </div>

      {data.turutMengundangEnabled && families.map(fam => (
        <div key={fam.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="mb-3">
            <label className="form-label">Nama Pihak</label>
            <input className="form-input" value={fam.side} onChange={e => updateSide(fam.id, e.target.value)} placeholder="Contoh: Keluarga Pria" />
          </div>
          <div className="space-y-2">
            {fam.members.map((m, i) => (
              <div key={i} className="flex gap-2">
                <input className="form-input flex-1" value={m} onChange={e => updateMember(fam.id, i, e.target.value)} placeholder="Nama anggota keluarga" />
                <button onClick={() => removeMember(fam.id, i)} className="text-red-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-colors flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => addMember(fam.id)} className="btn-ghost mt-2 text-xs">
            <Plus size={12} /> Tambah Anggota
          </button>
        </div>
      ))}
    </div>
  )
}
