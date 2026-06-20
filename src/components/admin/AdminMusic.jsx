import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Music, Save, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminMusic() {
  const [musics, setMusics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [isAdding, setIsAdding] = useState(false)
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
    if (!newTrack.title || !newTrack.url) return
    
    setSaving(true)
    const { data, error } = await supabase
      .from('musics')
      .insert([newTrack])
      .select()
      
    setSaving(false)
    if (error) {
      alert('Gagal menambah musik: ' + error.message)
    } else {
      setMusics([...musics, data[0]])
      setNewTrack({ title: '', genre: '', duration: '', emoji: '🎵', url: '' })
      setIsAdding(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus trek musik ini?')) return
    
    const { error } = await supabase
      .from('musics')
      .delete()
      .eq('id', id)
      
    if (error) {
      alert('Gagal menghapus musik: ' + error.message)
    } else {
      setMusics(musics.filter(m => m.id !== id))
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
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">URL / Link File MP3</label>
              <input type="url" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-brand-500 outline-none"
                value={newTrack.url} onChange={e => setNewTrack({...newTrack, url: e.target.value})}
                placeholder="https://.../lagu.mp3 atau /music/lagu.mp3" required />
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
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shadow-sm">
                        {track.emoji || '🎵'}
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
                    <button onClick={() => handleDelete(track.id)}
                      className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
                      <Trash2 size={16} />
                    </button>
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
