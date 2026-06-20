import React, { useState, useEffect } from 'react'
import { Check, Music } from 'lucide-react'
import { useSharedInvitation } from '../../hooks/useSharedInvitation'
import { supabase } from '../../lib/supabase'

export default function MusicForm() {
  const [data, updateData] = useSharedInvitation()
  const [musicLibrary, setMusicLibrary] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMusic = async () => {
      const { data, error } = await supabase.from('musics').select('*').order('id', { ascending: true })
      if (!error && data) {
        setMusicLibrary(data)
      }
      setLoading(false)
    }
    fetchMusic()
  }, [])

  const selectedId = data.musicId || 1
  const customMusic = data.customMusic || false

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => updateData({ customMusic: false })}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${!customMusic ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}>
          Dari Perpustakaan
        </button>
        <button onClick={() => updateData({ customMusic: true })}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${customMusic ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}>
          Upload Custom
        </button>
      </div>

      {!customMusic ? (
        <div className="space-y-2">
          {loading ? (
            <div className="text-center text-xs text-slate-500 py-4">Memuat daftar musik...</div>
          ) : musicLibrary.map(track => (
            <button key={track.id} onClick={() => updateData({ musicId: track.id, musicUrl: track.url })}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedId === track.id ? 'border-brand-400 bg-brand-50' : 'border-slate-200 bg-slate-50 hover:border-brand-200'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedId === track.id ? 'bg-brand-500 text-white' : 'bg-white border border-slate-200'}`}>
                {selectedId === track.id ? <Music size={14} /> : <span className="text-base">{track.emoji}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{track.title}</p>
                <p className="text-[11px] text-slate-500">{track.genre} · {track.duration}</p>
              </div>
              {selectedId === track.id && <Check size={14} className="text-brand-600 flex-shrink-0" />}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            💡 Upload file MP3 maksimal 2MB. File disimpan sementara di browser.
          </p>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-brand-400 transition-all text-center">
            <Music size={22} className="text-slate-400" />
            <p className="text-sm text-slate-500 font-medium">Klik untuk upload MP3</p>
            <p className="text-xs text-slate-400">Format: MP3 · Maks. 2MB</p>
          </div>
        </div>
      )}
    </div>
  )
}
