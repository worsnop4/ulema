import React, { useState, useEffect, useRef } from 'react'
import { Check, Music, Play, Pause } from 'lucide-react'
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

  const [playingId, setPlayingId] = useState(null)
  const audioRef = useRef(new Audio())

  // Handle audio end
  useEffect(() => {
    const audio = audioRef.current
    const handleEnded = () => setPlayingId(null)
    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.pause()
    }
  }, [])

  const togglePlay = (e, id, url) => {
    e.stopPropagation() // Prevent row click
    const audio = audioRef.current
    if (playingId === id) {
      audio.pause()
      setPlayingId(null)
    } else {
      audio.src = url
      audio.play().catch(err => alert('Gagal memutar audio: ' + err.message))
      setPlayingId(id)
    }
  }

  const selectedId = data.musicId || 1

  return (
    <div className="space-y-4">
      {/* Fitur Upload Custom dinonaktifkan sementara untuk menghemat storage
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
      */}

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
            <button onClick={(e) => togglePlay(e, track.id, track.url)}
              className={`p-2 rounded-full transition-colors flex-shrink-0 ${playingId === track.id ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}
              title={playingId === track.id ? "Jeda" : "Putar"}>
              {playingId === track.id ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
            </button>
            {selectedId === track.id && <Check size={16} className="text-brand-600 flex-shrink-0 ml-1" />}
          </button>
        ))}
      </div>
    </div>
  )
}
