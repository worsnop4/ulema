import { useState } from 'react'
import { useAuth } from '../App'
import {
  Users, MessageSquare, CalendarCheck, Copy, Check, ExternalLink,
  Share2, Eye, CalendarDays
} from 'lucide-react'
import ModuleGrid from '../components/ModuleGrid'
import EditModal from '../components/EditModal'
import { storageService } from '../services/storageService'
import { useSharedInvitation } from '../hooks/useSharedInvitation'

export default function InvitationEdit() {
  const { user } = useAuth()
  const [data] = useSharedInvitation()
  
  let BASE_URL = '/invite/doni-rizka'
  const adminDemo = storageService.getItem('inviter_admin_demo_mode')
  if (adminDemo) {
    // Dynamically use the active themeId from data, fallback to adminDemo
    BASE_URL = `/invite/demo?theme=${data.themeId || adminDemo}`
  } else if (user?.slug) {
    BASE_URL = `/invite/${user.slug}`
  }
  const [copied, setCopied] = useState(false)
  const [guestParam, setGuestParam] = useState('Tamu Undangan')
  const [activeModule, setActiveModule] = useState(null)

  const fullUrl = BASE_URL.includes('?') 
    ? `${window.location.origin}${BASE_URL}&to=${encodeURIComponent(guestParam)}`
    : `${window.location.origin}${BASE_URL}?to=${encodeURIComponent(guestParam)}`

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const stats = [
    { label: 'Pengunjung', value: '1,284', icon: Users, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Ucapan', value: '347', icon: MessageSquare, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'RSVP', value: '218', icon: CalendarCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Dashboard</p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Edit Undangan</h1>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="badge bg-[#F4E8CD] text-[#1C232E]">
            <span className="w-1.5 h-1.5 bg-[#DDC497] rounded-full inline-block" />
            Aktif
          </span>
        </div>
      </div>

      {/* ── Invitation Meta Card ── */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Thumbnail */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex-shrink-0 overflow-hidden border-2 border-brand-100"
                 style={{ background: 'linear-gradient(135deg, #00152f, #002147)' }}>
              <div className="w-full h-full flex flex-col items-center justify-center text-white">
                <span className="text-2xl">💍</span>
                <span className="font-serif text-[10px] font-semibold mt-1 opacity-80">Ulema</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-xl font-bold text-slate-900 truncate">
                {user?.name || 'Doni & Rizka'}
              </h2>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarDays size={12} className="text-slate-400" />
                  <span>Dibuat: <strong className="text-slate-700">15 Jan 2025</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarDays size={12} className="text-amber-400" />
                  <span>Kadaluarsa: <strong className="text-amber-600">{user?.expiry || '15 Mar 2026'}</strong></span>
                </div>
              </div>
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => setActiveModule('ucapan_rsvp')}
                        className="btn-secondary text-xs py-1.5 px-3">
                  <CalendarCheck size={13} /> RSVP
                </button>
                <button className="btn-secondary text-xs py-1.5 px-3">
                  <Share2 size={13} /> Bagikan
                </button>
                <a href={BASE_URL} target="_blank" rel="noopener noreferrer"
                   className="btn-primary text-xs py-1.5 px-3">
                  <Eye size={13} /> Buka Undangan
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="border-t border-slate-100 grid grid-cols-3">
          {stats.map((s, i) => (
            <div key={s.label}
                 className={`p-4 sm:p-5 flex flex-col items-center text-center ${i < 2 ? 'border-r border-slate-100' : ''}`}>
              <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
                <s.icon size={15} className={s.color} />
              </div>
              <p className={`text-xl sm:text-2xl font-bold font-serif ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Link Generator ── */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Link Undangan</h3>
            <p className="text-xs text-slate-500 mt-0.5">Salin link dengan nama tamu yang dipersonalisasi</p>
          </div>
          <Copy size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-0 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
            <span className="text-xs text-slate-400 px-3 py-2.5 bg-slate-100 border-r border-slate-200 whitespace-nowrap flex-shrink-0">
              {BASE_URL.includes('?') ? `${BASE_URL}&to=` : `${BASE_URL}?to=`}
            </span>
            <input
              type="text"
              className="flex-1 bg-transparent text-sm text-slate-700 px-3 py-2.5 focus:outline-none min-w-0"
              value={guestParam}
              onChange={e => setGuestParam(e.target.value)}
              placeholder="Nama Tamu"
            />
          </div>
          <button onClick={handleCopy}
                  className={`btn-primary flex-shrink-0 ${copied ? 'bg-[#DDC497] hover:bg-[#DDC497] text-[#1C232E]' : ''}`}>
            {copied ? <><Check size={14} /> Tersalin!</> : <><Copy size={14} /> Salin URL</>}
          </button>
        </div>
        {guestParam && (
          <p className="text-[11px] text-slate-400 mt-2 font-mono break-all">{fullUrl}</p>
        )}
      </div>

      {/* ── 16 Module Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Konfigurasi Undangan</h3>
          <span className="text-xs text-slate-400">16 modul</span>
        </div>
        <ModuleGrid onSelectModule={setActiveModule} />
      </div>

      {/* ── Edit Modal ── */}
      {activeModule && (
        <EditModal moduleId={activeModule} onClose={() => setActiveModule(null)} />
      )}
    </div>
  )
}
