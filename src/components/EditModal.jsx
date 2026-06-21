import { useState, useEffect, useRef } from 'react'
import { X, Save, Plus, Trash2, Upload, Check, Music, Palette, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react'
import { MODULES } from './ModuleGrid'
import { useSharedInvitation, getThemes } from '../hooks/useSharedInvitation'
import { useAuth } from '../App'

import { ToggleSwitch, compressImage, PhotoUploadBox, PremiumPhotoUploadBox, AccordionItem, SaveButton } from './common/FormHelpers'
import MetaTagForm from './modules/MetaTagForm'
import MempelaiForm from './modules/MempelaiForm'
import AcaraForm from './modules/AcaraForm'
import CountdownForm from './modules/CountdownForm'
import QuotesForm from './modules/QuotesForm'
import FotoVideoForm from './modules/FotoVideoForm'
import RekeningForm from './modules/RekeningForm'
import DresscodeForm from './modules/DresscodeForm'
import LiveStreamForm from './modules/LiveStreamForm'
import LoveStoryForm from './modules/LoveStoryForm'
import TurutMengundangForm from './modules/TurutMengundangForm'
import MusicForm from './modules/MusicForm'
import GantiTemaForm from './modules/GantiTemaForm'
import UcapanRsvpForm from './modules/UcapanRsvpForm'
import FontForm from './modules/FontForm'
import EditTeksForm from './modules/EditTeksForm'










// ─────────────────────────────────────────────────────────────
//  Modal Router
// ─────────────────────────────────────────────────────────────
const FORM_MAP = {
  meta_tag: { component: MetaTagForm },
  mempelai: { component: MempelaiForm },
  acara: { component: AcaraForm },
  countdown: { component: CountdownForm },
  quotes: { component: QuotesForm },
  foto_video: { component: FotoVideoForm },
  rekening: { component: RekeningForm },
  dresscode: { component: DresscodeForm },
  livestream: { component: LiveStreamForm },
  love_story: { component: LoveStoryForm },
  turut_mengundang: { component: TurutMengundangForm },
  musik: { component: MusicForm },
  ganti_tema: { component: GantiTemaForm },
  ucapan_rsvp: { component: UcapanRsvpForm },
  font: { component: FontForm },
  edit_teks: { component: EditTeksForm },
}

export default function EditModal({ moduleId, onClose }) {
  const mod = MODULES.find(m => m.id === moduleId)
  const FormComponent = FORM_MAP[moduleId]?.component

  // EditModal-level hook: digunakan untuk track loading state
  // Saat data belum siap (loading=true), tampilkan spinner agar user tidak bisa
  // berinteraksi sebelum data.id tersedia — mencegah race condition upload foto
  const [sharedData, , isLoading] = useSharedInvitation()

  // Save status: 'idle' | 'saving' | 'saved' | 'error'
  const [saveStatus, setSaveStatus] = useState('idle')

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Listen for save events from child form components
  useEffect(() => {
    const handleSaving = () => setSaveStatus('saving')
    const handleSaved = () => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    }
    const handleSaveError = () => {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 4000)
    }
    window.addEventListener('INVITATION_SAVING', handleSaving)
    window.addEventListener('INVITATION_SAVED', handleSaved)
    window.addEventListener('INVITATION_SAVE_ERROR', handleSaveError)
    return () => {
      window.removeEventListener('INVITATION_SAVING', handleSaving)
      window.removeEventListener('INVITATION_SAVED', handleSaved)
      window.removeEventListener('INVITATION_SAVE_ERROR', handleSaveError)
    }
  }, [])

  if (!mod || !FormComponent) return null

  const Icon = mod.icon

  const saveIndicator = {
    idle: { color: 'text-green-600 bg-green-50 border-green-100', dot: 'bg-green-500', text: 'Perubahan tersimpan otomatis ke undangan' },
    saving: { color: 'text-blue-600 bg-blue-50 border-blue-100', dot: 'bg-blue-500', text: 'Menyimpan...' },
    saved: { color: 'text-green-600 bg-green-50 border-green-100', dot: 'bg-green-500', text: '✓ Tersimpan!' },
    error: { color: 'text-red-600 bg-red-50 border-red-100', dot: 'bg-red-500', text: '✗ Gagal menyimpan. Coba lagi.' },
  }[saveStatus]

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-panel">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center gap-3 rounded-t-3xl sm:rounded-t-2xl z-10">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${mod.color}`}>
            <Icon size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-serif font-bold text-slate-900 text-base leading-tight">{mod.label}</h2>
            <p className="text-[11px] text-slate-400 truncate">{mod.desc}</p>
          </div>
          <button onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Save indicator */}
        <div className="px-5 pt-3 pb-0">
          <div className={`flex items-center gap-1.5 text-[11px] font-semibold border rounded-xl px-3 py-1.5 w-fit transition-all ${saveIndicator.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${saveIndicator.dot} ${saveStatus === 'saving' ? 'animate-pulse' : ''}`} />
            {saveIndicator.text}
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-5 py-5">
          {isLoading ? (
            /* Tampilkan loading agar user tidak upload foto sebelum data.id siap */
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Memuat data...</p>
            </div>
          ) : (
            <FormComponent />
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-4 flex items-center justify-between gap-3">
          <button onClick={onClose} className="btn-secondary">Tutup</button>
          <SaveButton onClick={onClose} />
        </div>
      </div>
    </div>
  )
}

