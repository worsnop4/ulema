import React, { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Music, Save, AlertCircle, Play, Pause } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminMusic() {
  const [musics, setMusics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
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

  const togglePlay = (id, url) => {
    const audio = audioRef.current
    if (playingId === id) {
      audio.pause()
      setPlayingId(null)
    } else {
      audio.src = url
      audio.play().catch(e => alert('Gagal memutar audio: ' + e.message))
      setPlayingId(id)
    }
  }
  
  const [isAdding, setIsAdding] = useState(false)
  const [file, setFile] = useState(null)
  const [newTrack, setNewTrack] = useState({
    title: '',
    genre: '',
    duration: '',
    emoji: '🎵',
    url: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchMusics()
  }, [])

  const fetchMusics = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('musics')
      .select('*')
      .order('id', { ascending: true })
      
    if (error) {
      setError(error.message)
    } else {
      setMusics(data || [])
    }
    setLoading(false)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newTrack.title || !file) {
      alert('Judul dan file musik harus diisi!')
      return
    }

    // Validasi ukuran (Maks 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal 10MB!')
      return
    }
    
    setSaving(true)

    try {
      // 1. Upload ke Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `admin-music/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('invitation-media')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      // 2. Dapatkan URL Publik
      const { data: publicUrlData } = supabase.storage
        .from('invitation-media')
        .getPublicUrl(fileName)

      const trackToSave = { ...newTrack, url: publicUrlData.publicUrl }

      // 3. Simpan ke database
      const { data, error } = await supabase
        .from('musics')
        .insert([trackToSave])
        .select()
        
      if (error) throw error

      setMusics([...musics, data[0]])
      setNewTrack({ title: '', genre: '', duration: '', emoji: '🎵', url: '' })
      setFile(null)
      setIsAdding(false)
    } catch (err) {
      alert('Gagal menambah musik: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, url) => {
    if (!confirm('Hapus trek musik ini? File juga akan dihapus permanen dari storage.')) return
    
    try {
      // Hapus dari tabel
      const { error } = await supabase
        .from('musics')
        .delete()
        .eq('id', id)
        
      if (error) throw error

      // Hapus file dari storage jika ada path-nya
      if (url && url.includes('/invitation-media/')) {
        const path = url.split('/invitation-media/')[1]
        // Jika path tidak mengandung admin-music/, mungkin ini file lain, tapi ini fitur admin jadi aman.
        await supabase.storage.from('invitation-media').remove([path])
      }

      setMusics(musics.filter(m => m.id !== id))
    } catch (err) {
      alert('Gagal menghapus musik: ' + err.message)
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat data musik...</div>

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Koleksi Musik Utama</h2>
          <p className="text-xs text-slate-500 mt-1">Lagu-lagu yang muncul di daftar pilihan pengguna.</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors">
            <Plus size={16} /> Tambah Musik
          </button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
              <Music size={18} />
            </div>
            <h3 className="font-semibold text-slate-800">Tambah Musik Baru</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Judul Lagu</label>
              <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-brand-500 outline-none"
                value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})}
                placeholder="Contoh: Perfect - Ed Sheeran" required />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">File Audio (MP3/WAV)</label>
              <input type="file" accept="audio/mp3,audio/mpeg,audio/wav"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-brand-500 outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100"
                onChange={e => setFile(e.target.files[0])}
                required />
              <p className="text-[10px] text-slate-400 mt-1">Maksimal 10MB.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Emoji</label>
                <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-brand-500 outline-none"
                  value={newTrack.emoji} onChange={e => setNewTrack({...newTrack, emoji: e.target.value})}
                  placeholder="🎵" />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Genre</label>
                <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-brand-500 outline-none"
                  value={newTrack.genre} onChange={e => setNewTrack({...newTrack, genre: e.target.value})}
                  placeholder="Contoh: Pop / Akustik" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Durasi</label>
              <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-brand-500 outline-none"
                value={newTrack.duration} onChange={e => setNewTrack({...newTrack, duration: e.target.value})}
                placeholder="Contoh: 3:45" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50">
              <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Musik'}
            </button>
          </div>
        </form>
      )}

      {/* Music List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider">
                <th className="p-4 font-semibold">Trek Musik</th>
                <th className="p-4 font-semibold">Genre</th>
                <th className="p-4 font-semibold">Durasi</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {musics.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500 text-sm">
                    Belum ada musik di database.
                  </td>
                </tr>
              ) : musics.map(track => (
                <tr key={track.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shadow-sm relative overflow-hidden">
                        {playingId === track.id ? (
                          <div className="absolute inset-0 bg-brand-600/10 flex items-center justify-center">
                            <Music size={18} className="text-brand-600 animate-pulse" />
                          </div>
                        ) : (
                          track.emoji || '🎵'
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-800">{track.title}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate max-w-[200px]" title={track.url}>{track.url}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{track.genre || '-'}</td>
                  <td className="p-4 text-sm text-slate-600">{track.duration || '-'}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => togglePlay(track.id, track.url)}
                        className={`p-2 rounded-xl transition-colors ${playingId === track.id ? 'text-brand-600 bg-brand-50' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                        title={playingId === track.id ? "Jeda" : "Putar"}>
                        {playingId === track.id ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button onClick={() => handleDelete(track.id, track.url)}
                        className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                        title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
