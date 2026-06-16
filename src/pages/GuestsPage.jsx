import { useState, useEffect, useMemo, useRef } from 'react'
import { useSharedInvitation } from '../hooks/useSharedInvitation'
import {
  Users, UserPlus, FileSpreadsheet, Smartphone, Send, Trash2, Edit3, Search,
  Check, Save, Clipboard, Info, CheckSquare, Square, RefreshCw, X, MessageSquare, AlertCircle
} from 'lucide-react'

// Helper to clean and format Indonesian phone numbers to E.164 format for WhatsApp API
const cleanAndFormatPhone = (phone) => {
  if (!phone) return ''
  let cleaned = phone.replace(/\D/g, '') // strip all non-digits
  
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1)
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned
  }
  return cleaned
}

export default function GuestsPage() {
  const [invitationData, updateInvitationData] = useSharedInvitation()
  const guests = invitationData.guests || []
  const template = invitationData.blastMessageTemplate || ''
  
  // Page Local State
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState('all') // 'all', 'pending', 'sent'
  const [toast, setToast] = useState(null)
  
  // Single Guest Input Form (Collapsible / Inline Modal)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')

  // Multi-select bulk state
  const [selectedIds, setSelectedIds] = useState([])

  // Contact Picker support verification
  const [isContactPickerSupported, setIsContactPickerSupported] = useState(false)

  // File Input Ref for CSV Upload
  const fileInputRef = useRef(null)

  useEffect(() => {
    setIsContactPickerSupported(
      typeof window !== 'undefined' &&
      'contacts' in navigator &&
      'ContactsManager' in window
    )
  }, [])

  // Toast effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Get Invitation Dynamic URL based on current host & slug
  const getInvitationUrl = (guestName) => {
    const origin = window.location.origin
    const slug = invitationData.slug || 'doni-rizka'
    return `${origin}/invite/${slug}?to=${encodeURIComponent(guestName)}`
  }

  // Handle Toast helper
  const showToast = (type, message) => {
    setToast({ type, message })
  }

  // Handle template message save
  const handleSaveTemplate = (newVal) => {
    updateInvitationData({ blastMessageTemplate: newVal })
  }

  // Clean guest list input and save
  const handleAddOrEditGuest = (e) => {
    e.preventDefault()
    
    const nameVal = (formName || '').trim()
    const phoneVal = (formPhone || '').trim()

    if (!nameVal || !phoneVal) {
      showToast('error', 'Nama dan Nomor Telepon wajib diisi.')
      return
    }

    const cleanedPhone = cleanAndFormatPhone(phoneVal)
    if (cleanedPhone.length < 9) {
      showToast('error', 'Nomor telepon tidak valid.')
      return
    }

    if (editingId) {
      // Edit mode with non-strict comparison for ID safety
      updateInvitationData(prev => {
        const updated = (prev.guests || []).map(g => {
          if (g.id == editingId) {
            return { ...g, name: nameVal, phone: phoneVal }
          }
          return g
        })
        return { ...prev, guests: updated }
      })
      showToast('success', 'Data tamu berhasil diperbarui!')
    } else {
      // Add mode
      const newGuest = {
        id: Date.now() + Math.random(),
        name: nameVal,
        phone: phoneVal,
        status: 'pending'
      }
      updateInvitationData(prev => ({
        ...prev,
        guests: [...(prev.guests || []), newGuest]
      }))
      showToast('success', 'Tamu berhasil ditambahkan!')
    }

    // Reset Form
    setFormName('')
    setFormPhone('')
    setEditingId(null)
    setIsFormOpen(false)
  }

  const handleEditClick = (guest) => {
    setEditingId(guest.id)
    setFormName(guest.name || '')
    setFormPhone(guest.phone || '')
    setIsFormOpen(true)
  }

  const handleDeleteGuest = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tamu ini?')) {
      updateInvitationData(prev => ({
        ...prev,
        guests: (prev.guests || []).filter(g => g.id !== id)
      }))
      setSelectedIds(prev => prev.filter(x => x !== id))
      showToast('success', 'Tamu berhasil dihapus.')
    }
  }

  // CSV Reader
  const handleCSVUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      const lines = text.split(/\r?\n/)
      const newGuests = []

      lines.forEach((line, index) => {
        const trimmed = line.trim()
        if (!trimmed) return

        const cols = trimmed.split(/[,;\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''))
        if (cols.length >= 2) {
          const name = cols[0]
          const phone = cols[1]

          // Detect header row and skip it
          if (index === 0 && (
            name.toLowerCase().includes('nama') || 
            phone.toLowerCase().includes('telp') || 
            phone.toLowerCase().includes('phone') || 
            phone.toLowerCase().includes('phone number') || 
            phone.toLowerCase().includes('wa')
          )) {
            return
          }

          if (name && phone) {
            newGuests.push({
              id: Date.now() + Math.random() + index,
              name,
              phone,
              status: 'pending'
            })
          }
        }
      })

      if (newGuests.length > 0) {
        updateInvitationData(prev => ({
          ...prev,
          guests: [...(prev.guests || []), ...newGuests]
        }))
        showToast('success', `Berhasil mengimpor ${newGuests.length} tamu!`)
      } else {
        showToast('error', 'Tidak menemukan format tamu yang valid. Format: Nama, NoTelepon')
      }
    }
    reader.readAsText(file)
    e.target.value = '' // reset
  }

  // Mobile Contact Picker API
  const handleContactPicker = async () => {
    if (!isContactPickerSupported) {
      showToast('error', 'Browser Anda tidak mendukung akses Kontak HP langsung.')
      return
    }

    try {
      const props = ['name', 'tel']
      const opts = { multiple: true }
      const contacts = await navigator.contacts.select(props, opts)
      
      if (!contacts || contacts.length === 0) return

      const newGuests = []
      contacts.forEach((contact, idx) => {
        const name = contact.name && contact.name[0] ? contact.name[0] : ''
        const phone = contact.tel && contact.tel[0] ? contact.tel[0] : ''
        
        if (name && phone) {
          newGuests.push({
            id: Date.now() + Math.random() + idx,
            name,
            phone,
            status: 'pending'
          })
        }
      })

      if (newGuests.length > 0) {
        updateInvitationData(prev => ({
          ...prev,
          guests: [...(prev.guests || []), ...newGuests]
        }))
        showToast('success', `Berhasil mengimpor ${newGuests.length} tamu dari Kontak HP!`)
      }
    } catch (err) {
      console.warn('Contact selection failed:', err)
    }
  }

  // Individual WhatsApp Sender
  const handleSendWA = (guest) => {
    const formatted = cleanAndFormatPhone(guest.phone)
    if (!formatted) {
      showToast('error', `Nomor HP "${guest.phone}" untuk ${guest.name} tidak valid.`)
      return
    }

    const invitationUrl = getInvitationUrl(guest.name)
    const customizedMessage = template
      .replace(/{nama}/g, guest.name)
      .replace(/{link}/g, invitationUrl)

    const waLink = `https://api.whatsapp.com/send?phone=${formatted}&text=${encodeURIComponent(customizedMessage)}`

    // Update status to 'sent'
    updateInvitationData(prev => {
      const updated = (prev.guests || []).map(g => {
        if (g.id === guest.id) {
          return { ...g, status: 'sent' }
        }
        return g
      })
      return { ...prev, guests: updated }
    })

    window.open(waLink, '_blank')
    showToast('success', `Membuka WhatsApp untuk ${guest.name}`)
  }

  // Filter and Search Lists
  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      // Filter by Search Query
      const query = search.toLowerCase().trim()
      const matchesSearch = 
        guest.name.toLowerCase().includes(query) || 
        guest.phone.includes(query)

      // Filter by Status Tab
      if (filterTab === 'pending') {
        return matchesSearch && guest.status === 'pending'
      }
      if (filterTab === 'sent') {
        return matchesSearch && guest.status === 'sent'
      }
      return matchesSearch
    })
  }, [guests, search, filterTab])

  // Count metrics
  const counts = useMemo(() => {
    const total = guests.length
    const pending = guests.filter(g => g.status === 'pending').length
    const sent = guests.filter(g => g.status === 'sent').length
    return { total, pending, sent }
  }, [guests])

  // Bulk Actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const visibleIds = filteredGuests.map(g => g.id)
      setSelectedIds(visibleIds)
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = () => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} tamu terpilih?`)) {
      updateInvitationData(prev => ({
        ...prev,
        guests: (prev.guests || []).filter(g => !selectedIds.includes(g.id))
      }))
      setSelectedIds([])
      showToast('success', 'Tamu terpilih berhasil dihapus.')
    }
  }

  const handleBulkStatus = (newStatus) => {
    updateInvitationData(prev => {
      const updated = (prev.guests || []).map(g => {
        if (selectedIds.includes(g.id)) {
          return { ...g, status: newStatus }
        }
        return g
      })
      return { ...prev, guests: updated }
    })
    setSelectedIds([])
    showToast('success', `Tamu terpilih berhasil ditandai sebagai ${newStatus === 'sent' ? 'Sudah Dikirim' : 'Belum Dikirim'}.`)
  }

  // Live preview text for template editor
  const previewText = useMemo(() => {
    const exampleName = guests[0]?.name || 'Budi Santoso'
    const exampleUrl = getInvitationUrl(exampleName)
    return template
      .replace(/{nama}/g, exampleName)
      .replace(/{link}/g, exampleUrl)
  }, [template, guests])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Dashboard</p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Daftar Tamu & Blast</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola daftar undangan, personalkan link, dan bagikan undangan melalui WhatsApp.</p>
        </div>
        
        {/* Importer tools */}
        <div className="flex flex-wrap items-center gap-2">
          {isContactPickerSupported && (
            <button
              onClick={handleContactPicker}
              className="btn-secondary text-xs py-2 px-3 bg-brand-50 hover:bg-brand-100 border-brand-200 text-brand-700"
            >
              <Smartphone size={14} className="text-brand-600" />
              Kontak HP
            </button>
          )}

          <button
            onClick={() => fileInputRef.current.click()}
            className="btn-secondary text-xs py-2 px-3 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700"
          >
            <FileSpreadsheet size={14} className="text-indigo-600" />
            Upload CSV
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCSVUpload}
            accept=".csv"
            className="hidden"
          />

          <button
            onClick={() => {
              setEditingId(null)
              setFormName('')
              setFormPhone('')
              setIsFormOpen(!isFormOpen)
            }}
            className="btn-primary text-xs py-2 px-3 flex-shrink-0"
          >
            <UserPlus size={14} />
            {isFormOpen && !editingId ? 'Tutup Form' : 'Tambah Manual'}
          </button>
        </div>
      </div>

      {/* ── Stats Summary ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Tamu', value: counts.total, icon: Users, color: 'text-slate-600 bg-slate-50 border-slate-100' },
          { label: 'Belum Dikirim', value: counts.pending, icon: MessageSquare, color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { label: 'Sudah Dikirim', value: counts.sent, icon: Check, color: 'text-green-600 bg-green-50 border-green-100' },
        ].map(s => (
          <div key={s.label} className={`border rounded-2xl p-4 flex flex-col items-center text-center shadow-card bg-white relative overflow-hidden`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 ${s.color}`}>
              <s.icon size={15} />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-serif text-slate-800">{s.value}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Modal Tambah / Edit Tamu (Overlay) ── */}
      {isFormOpen && (
        <div className="modal-overlay z-50">
          <div className="modal-backdrop" onClick={() => { setIsFormOpen(false); setEditingId(null); }} />
          <div className="modal-panel max-w-md w-full animate-slide-up z-10">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="font-serif font-bold text-slate-900 text-base flex items-center gap-1.5">
                <span>{editingId ? '📝' : '👤'}</span>
                {editingId ? 'Edit Data Tamu' : 'Tambah Tamu Baru'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false)
                  setEditingId(null)
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={handleAddOrEditGuest} className="p-5 space-y-4">
              <div>
                <label className="form-label mb-1.5 text-xs text-slate-600 font-semibold">Nama Lengkap Tamu</label>
                <input
                  type="text"
                  className="form-input bg-white"
                  placeholder="cth. Bapak Budi Santoso"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label mb-1.5 text-xs text-slate-600 font-semibold">Nomor WhatsApp</label>
                <input
                  type="text"
                  className="form-input bg-white"
                  placeholder="cth. 081234567890"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  required
                />
              </div>
              
              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false)
                    setEditingId(null)
                  }}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm">
                  <Check size={14} />
                  {editingId ? 'Simpan Perubahan' : 'Simpan Tamu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Template WhatsApp & Live Preview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Template Editor */}
        <div className="bg-white rounded-2xl border border-surface-border shadow-card p-5 lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">Template Pesan WhatsApp</h2>
              <p className="text-xs text-slate-400 mt-0.5">Edit template isi pesan undangan otomatis</p>
            </div>
            <MessageSquare size={16} className="text-slate-400" />
          </div>

          <textarea
            className="form-textarea flex-1 text-slate-700 text-sm leading-relaxed"
            rows={8}
            value={template}
            onChange={e => handleSaveTemplate(e.target.value)}
            placeholder="Tulis pesan..."
          />

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Info size={11} /> Kode Tag Dinamis (Klik untuk menyalin)
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText('{nama}')
                  showToast('success', 'Kode {nama} disalin!')
                }}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono rounded-lg border border-slate-200 transition-colors"
                title="Tag nama penerima"
              >
                {"{nama}"} <span className="text-[10px] text-slate-400 ml-1">Nama Tamu</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('{link}')
                  showToast('success', 'Kode {link} disalin!')
                }}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono rounded-lg border border-slate-200 transition-colors"
                title="Link undangan personal tamu"
              >
                {"{link}"} <span className="text-[10px] text-slate-400 ml-1">Link Undangan</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Teks di dalam bintang cth: <code>*teks*</code> akan tebal (bold) di WhatsApp.
            </p>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-2xl border border-surface-border shadow-card p-5 lg:col-span-5 flex flex-col space-y-4">
          <div>
            <h2 className="font-semibold text-slate-800 text-sm">Live Preview Chat WA</h2>
            <p className="text-xs text-slate-400 mt-0.5">Tampilan simulasi pesan di aplikasi WhatsApp</p>
          </div>
          
          <div className="flex-1 bg-[#efeae2] border border-[#e2dbd0] rounded-2xl p-4 relative flex flex-col justify-end min-h-[200px]"
               style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 0)', backgroundSize: '16px 16px' }}>
            
            {/* WhatsApp Bubble */}
            <div className="bg-white text-slate-800 rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[85%] self-start relative text-xs leading-relaxed space-y-2 border border-slate-200/50">
              {/* Message tail */}
              <div className="absolute top-0 -left-2 w-2 h-2.5 bg-white" 
                   style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
              
              <div className="whitespace-pre-wrap font-sans text-slate-700">
                {previewText.split('\n').map((line, idx) => {
                  // Basic client-side bold conversion for preview (*bold* -> <strong>)
                  let parts = []
                  let temp = line
                  const regex = /\*(.*?)\*/g
                  let match
                  let lastIdx = 0
                  
                  while ((match = regex.exec(temp)) !== null) {
                    if (match.index > lastIdx) {
                      parts.push(temp.substring(lastIdx, match.index))
                    }
                    parts.push(<strong key={match.index} className="font-bold text-slate-900">{match[1]}</strong>)
                    lastIdx = regex.lastIndex
                  }
                  if (lastIdx < temp.length) {
                    parts.push(temp.substring(lastIdx))
                  }
                  
                  return <div key={idx}>{parts.length > 0 ? parts : line || <br />}</div>
                })}
              </div>
              
              <div className="text-[9px] text-slate-400 text-right">08:00</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Guest Database Table ── */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
        
        {/* Table header & filters */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200/60 rounded-xl w-fit">
            {[
              { id: 'all', label: 'Semua', count: counts.total },
              { id: 'pending', label: 'Belum Kirim', count: counts.pending },
              { id: 'sent', label: 'Terkirim', count: counts.sent },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setFilterTab(tab.id)
                  setSelectedIds([])
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filterTab === tab.id
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative max-w-xs w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              className="form-input pl-9 py-2 text-xs"
              placeholder="Cari nama atau no. telepon..."
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setSelectedIds([])
              }}
            />
          </div>
        </div>

        {/* Bulk Actions Panel (Shows only when rows selected) */}
        {selectedIds.length > 0 && (
          <div className="px-5 py-3.5 bg-brand-50/50 border-b border-brand-100 flex items-center justify-between gap-3 animate-slide-up">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-800">
              <CheckSquare size={14} className="text-brand-600" />
              <span>{selectedIds.length} tamu terpilih</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatus('sent')}
                className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all"
              >
                Tandai Terkirim
              </button>
              <button
                onClick={() => handleBulkStatus('pending')}
                className="px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all"
              >
                Tandai Pending
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all flex items-center gap-1"
              >
                <Trash2 size={12} /> Hapus
              </button>
            </div>
          </div>
        )}

        {/* Database List */}
        {filteredGuests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100">
              <Users size={20} />
            </div>
            <div>
              <p className="text-slate-700 text-sm font-semibold">Tidak Ada Daftar Tamu</p>
              <p className="text-slate-400 text-xs mt-0.5 max-w-sm">
                {search ? 'Tamu tidak ditemukan berdasarkan pencarian Anda.' : 'Mulailah dengan menambahkan tamu secara manual, kontak HP, atau impor file CSV.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-100">
                    <th className="py-3.5 px-5 w-10">
                      <input
                        type="checkbox"
                        className="rounded accent-brand-600 focus:ring-brand-500 cursor-pointer"
                        onChange={handleSelectAll}
                        checked={filteredGuests.length > 0 && selectedIds.length === filteredGuests.length}
                      />
                    </th>
                    <th className="py-3.5 px-5">Nama Tamu</th>
                    <th className="py-3.5 px-5">No. WhatsApp</th>
                    <th className="py-3.5 px-5">Status Link</th>
                    <th className="py-3.5 px-5">Status Kirim</th>
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGuests.map(guest => {
                    const isSelected = selectedIds.includes(guest.id)
                    const formattedPhone = cleanAndFormatPhone(guest.phone)
                    const invitationUrl = getInvitationUrl(guest.name)
                    return (
                      <tr key={guest.id} className={`hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-brand-50/10' : ''}`}>
                        <td className="py-3.5 px-5">
                          <input
                            type="checkbox"
                            className="rounded accent-brand-600 cursor-pointer"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(guest.id)}
                          />
                        </td>
                        <td className="py-3.5 px-5">
                          <p className="font-semibold text-slate-800 text-sm">{guest.name}</p>
                        </td>
                        <td className="py-3.5 px-5">
                          <p className="text-slate-500 text-xs font-mono">{guest.phone}</p>
                        </td>
                        <td className="py-3.5 px-5 max-w-[200px]">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(invitationUrl)
                              showToast('success', `Link untuk ${guest.name} disalin!`)
                            }}
                            className="text-[10px] text-slate-400 font-mono hover:text-brand-600 transition-colors truncate block w-full text-left"
                            title="Salin Link"
                          >
                            {invitationUrl}
                          </button>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`badge text-[10px] ${
                            guest.status === 'sent' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {guest.status === 'sent' ? '✓ Terkirim' : '⏳ Pending'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSendWA(guest)}
                              className="btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 border-none flex items-center gap-1 shadow-sm"
                              title="Kirim WA"
                            >
                              <Send size={11} /> Kirim WA
                            </button>
                            <button
                              onClick={() => handleEditClick(guest)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Edit"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteGuest(guest.id)}
                              className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View Card List */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredGuests.map(guest => {
                const isSelected = selectedIds.includes(guest.id)
                const formattedPhone = cleanAndFormatPhone(guest.phone)
                return (
                  <div key={guest.id} className={`p-4 flex gap-3 ${isSelected ? 'bg-brand-50/10' : ''}`}>
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        className="rounded accent-brand-600"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(guest.id)}
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-800 text-sm truncate">{guest.name}</p>
                        <span className={`badge text-[9px] ${
                          guest.status === 'sent' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {guest.status === 'sent' ? '✓ Terkirim' : '⏳ Pending'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs font-mono">{guest.phone}</p>
                      
                      {/* Mobile Action buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <button
                          onClick={() => {
                            const invitationUrl = getInvitationUrl(guest.name)
                            navigator.clipboard.writeText(invitationUrl)
                            showToast('success', `Link untuk ${guest.name} disalin!`)
                          }}
                          className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                        >
                          <Clipboard size={10} /> Salin Link
                        </button>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditClick(guest)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(guest.id)}
                            className="p-1.5 text-red-400 hover:text-red-600 rounded-lg"
                          >
                            <Trash2 size={13} />
                          </button>
                          <button
                            onClick={() => handleSendWA(guest)}
                            className="btn-primary text-[10px] py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 border-none flex items-center gap-0.5 shadow-sm"
                          >
                            <Send size={10} /> Kirim
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Toast Alert Component ── */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold flex items-center gap-2 animate-bounce ${
          toast.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <Check size={16} className="text-green-600" /> : <AlertCircle size={16} className="text-red-600" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}
