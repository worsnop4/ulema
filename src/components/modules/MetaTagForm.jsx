import React from 'react'
import { useSharedInvitation } from '../../hooks/useSharedInvitation'
import { PhotoUploadBox } from '../common/FormHelpers'

export default function MetaTagForm() {
  const [data, updateData] = useSharedInvitation()
  const meta = data.meta || {}

  return (
    <div className="space-y-4">
      {/* Preview Tautan */}
      <div>
        <label className="form-label">Preview Tautan</label>
        <div className="bg-[#1c1d1f] text-white rounded-2xl p-4 flex items-center gap-4 border border-slate-800">
          <div className="w-20 h-20 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
            {meta.ogImage ? (
              <img src={meta.ogImage} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">👩‍❤️‍👨</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-slate-200 truncate">{meta.title || 'Doni & Rizka'}</h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{meta.desc || 'Rabu, 26 November 2025'}</p>
            <p className="text-[10px] text-slate-500 mt-1.5 truncate">
              https://ulema.id/invite/{data.slug || 'doni-rizka'}
            </p>
          </div>
        </div>
      </div>

      {/* Judul Undangan */}
      <div>
        <label className="form-label">Judul Undangan</label>
        <input
          className="form-input"
          value={meta.title || ''}
          onChange={e => updateData({ meta: { ...meta, title: e.target.value } })}
          placeholder="Doni & Rizka"
        />
        <p className="text-[11px] text-slate-400 mt-1.5">Judul di WA / media sosail</p>
      </div>

      {/* Deskripsi Undangan */}
      <div>
        <label className="form-label">Deskripsi Undangan</label>
        <input
          className="form-input"
          value={meta.desc || ''}
          onChange={e => updateData({ meta: { ...meta, desc: e.target.value } })}
          placeholder="Rabu, 26 November 2025"
        />
      </div>

      {/* Foto Cover Meta Tag (OG Image) */}
      <div>
        <PhotoUploadBox
          label="Foto Cover Meta Tag"
          value={meta.ogImage || ''}
          onChange={val => updateData({ meta: { ...meta, ogImage: val } })}
        />
        <p className="text-[11px] text-slate-400 mt-1.5">
          Foto yang muncul saat link undangan dibagikan ke WhatsApp / media sosial. Terpisah dari foto cover &amp; foto slide awal undangan.
        </p>
      </div>
    </div>
  )
}
