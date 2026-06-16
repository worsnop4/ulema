import React from 'react'
import { useSharedInvitation } from '../../hooks/useSharedInvitation'

export default function MempelaiForm() {
  const [data, updateData] = useSharedInvitation()
  return (
    <div className="space-y-6">
      {['Mempelai Pria', 'Mempelai Wanita'].map((label, i) => {
        const key = i === 0 ? 'groom' : 'bride'
        const person = data[key] || {}
        const update = (field, val) => updateData({ [key]: { ...person, [field]: val } })
        return (
          <div key={label} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <h4 className="font-semibold text-slate-700 text-sm mb-4 flex items-center gap-2">
              <span>{i === 0 ? '🤵' : '👰'}</span> {label}
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Nama Lengkap</label>
                  <input className="form-input" value={person.name || ''} onChange={e => update('name', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Nama Panggilan</label>
                  <input className="form-input" value={person.nickname || ''} onChange={e => update('nickname', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Nama Ayah</label>
                  <input className="form-input" value={person.father || ''} onChange={e => update('father', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Nama Ibu</label>
                  <input className="form-input" value={person.mother || ''} onChange={e => update('mother', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="form-label">Instagram</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                  <input className="form-input pl-7" value={person.instagram || ''} onChange={e => update('instagram', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
