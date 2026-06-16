import {
  Tag, Users, CalendarDays, Timer, Quote, Image, Wallet, Shirt,
  Video, Heart, UserPlus, Music, Palette, MessageSquare, Type, FileEdit
} from 'lucide-react'
import { useSharedInvitation } from '../hooks/useSharedInvitation'

export const MODULES = [
  {
    id: 'meta_tag',
    label: 'Meta Tag',
    desc: 'SEO title, description & OG image',
    icon: Tag,
    color: 'bg-slate-100 text-slate-600',
    accent: '#64748b',
    status: 'done',
  },
  {
    id: 'mempelai',
    label: 'Data Mempelai',
    desc: 'Foto, nama & info pasangan',
    icon: Users,
    color: 'bg-rose-50 text-rose-600',
    accent: '#e11d48',
    status: 'done',
  },
  {
    id: 'acara',
    label: 'Data Acara',
    desc: 'Jadwal & lokasi acara',
    icon: CalendarDays,
    color: 'bg-blue-50 text-blue-600',
    accent: '#2563eb',
    status: 'done',
  },
  {
    id: 'countdown',
    label: 'Hitung Mundur',
    desc: 'Aktifkan countdown acara',
    icon: Timer,
    color: 'bg-orange-50 text-orange-500',
    accent: '#f97316',
    status: 'done',
  },
  {
    id: 'quotes',
    label: 'Ayat / Quotes',
    desc: 'Ayat suci atau kutipan romantis',
    icon: Quote,
    color: 'bg-purple-50 text-purple-600',
    accent: '#9333ea',
    status: 'empty',
  },
  {
    id: 'foto_video',
    label: 'Kelola Foto',
    desc: 'Foto sampul, mempelai & galeri',
    icon: Image,
    color: 'bg-pink-50 text-pink-600',
    accent: '#db2777',
    status: 'done',
  },
  {
    id: 'rekening',
    label: 'Rekening & Kado',
    desc: 'Dompet digital & rekening bank',
    icon: Wallet,
    color: 'bg-emerald-50 text-emerald-600',
    accent: '#059669',
    status: 'empty',
  },
  {
    id: 'dresscode',
    label: 'Dresscode',
    desc: 'Tema pakaian untuk tamu',
    icon: Shirt,
    color: 'bg-teal-50 text-teal-600',
    accent: '#0d9488',
    status: 'empty',
  },
  {
    id: 'livestream',
    label: 'Live Streaming',
    desc: 'Link siaran langsung acara',
    icon: Video,
    color: 'bg-red-50 text-red-600',
    accent: '#dc2626',
    status: 'empty',
  },
  {
    id: 'love_story',
    label: 'Love Story',
    desc: 'Perjalanan cerita cinta',
    icon: Heart,
    color: 'bg-rose-50 text-rose-500',
    accent: '#f43f5e',
    status: 'empty',
  },
  {
    id: 'turut_mengundang',
    label: 'Turut Mengundang',
    desc: 'Keluarga yang ikut mengundang',
    icon: UserPlus,
    color: 'bg-indigo-50 text-indigo-600',
    accent: '#4f46e5',
    status: 'empty',
  },
  {
    id: 'musik',
    label: 'Musik',
    desc: 'Musik latar undangan',
    icon: Music,
    color: 'bg-violet-50 text-violet-600',
    accent: '#7c3aed',
    status: 'done',
  },
  {
    id: 'ganti_tema',
    label: 'Ganti Tema',
    desc: 'Pilih desain & skin undangan',
    icon: Palette,
    color: 'bg-fuchsia-50 text-fuchsia-600',
    accent: '#a21caf',
    status: 'done',
  },
  {
    id: 'ucapan_rsvp',
    label: 'Ucapan & RSVP',
    desc: 'Moderasi tamu & buku tamu',
    icon: MessageSquare,
    color: 'bg-green-50 text-green-600',
    accent: '#16a34a',
    status: 'done',
  },
  {
    id: 'font',
    label: 'Pengaturan Font',
    desc: 'Tipografi & ukuran teks',
    icon: Type,
    color: 'bg-amber-50 text-amber-600',
    accent: '#d97706',
    status: 'empty',
  },
  {
    id: 'edit_teks',
    label: 'Edit Teks',
    desc: 'Kustomisasi teks sistem',
    icon: FileEdit,
    color: 'bg-cyan-50 text-cyan-600',
    accent: '#0891b2',
    status: 'empty',
  },
]

const statusLabels = {
  done: { label: 'Diisi', className: 'bg-[#F4E8CD] text-[#1C232E]' },
  empty: { label: 'Kosong', className: 'bg-slate-100 text-slate-500' },
}

export default function ModuleGrid({ onSelectModule }) {
  const [data] = useSharedInvitation()

  const getModuleStatus = (id, defaultStatus) => {
    if (!data) return defaultStatus;
    
    switch (id) {
      case 'meta_tag': return (data.meta?.title || data.meta?.desc) ? 'done' : 'empty';
      case 'mempelai': return (data.groom?.name || data.bride?.name) ? 'done' : 'empty';
      case 'acara': return (data.events && data.events.some(e => e.name || e.date)) ? 'done' : 'empty';
      case 'countdown': return data.countdownEnabled ? 'done' : 'empty';
      case 'quotes': return data.quote ? 'done' : 'empty';
      case 'foto_video': return (data.meta?.coverPhoto || data.gallery?.length > 0 || data.videoUrl || data.heroPhoto || data.groom?.photo || data.bride?.photo) ? 'done' : 'empty';
      case 'rekening': return (data.accounts?.length > 0 || data.giftAddress?.enabled) ? 'done' : 'empty';
      case 'dresscode': return data.dresscode?.name ? 'done' : 'empty';
      case 'livestream': return data.livestreamEnabled ? 'done' : 'empty';
      case 'love_story': return data.loveStory?.some(s => s.title) ? 'done' : 'empty';
      case 'turut_mengundang': return data.families?.some(f => f.members.some(m => m.trim() !== '')) ? 'done' : 'empty';
      case 'musik': return data.musicUrl ? 'done' : 'empty';
      case 'ganti_tema': return data.themeId ? 'done' : 'empty';
      case 'ucapan_rsvp': return (data.rsvps?.length > 0 || data.wishes?.length > 0) ? 'done' : 'empty';
      case 'font': return data.customFonts ? 'done' : 'empty';
      case 'edit_teks': return data.customLabels ? 'done' : 'empty';
      default: return defaultStatus;
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4">
      {MODULES.map(mod => {
        const Icon = mod.icon
        const currentStatusKey = getModuleStatus(mod.id, mod.status)
        const status = statusLabels[currentStatusKey]
        return (
          <button
            key={mod.id}
            onClick={() => onSelectModule(mod.id)}
            className="module-tile text-left"
          >
            <div className="flex items-start justify-between gap-2">
              <div className={`module-tile-icon ${mod.color}`}>
                <Icon size={18} />
              </div>
              <span className={`badge ${status.className} text-[10px] flex-shrink-0`}>
                {status.label}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-brand-700 transition-colors">
                {mod.label}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed hidden sm:block">
                {mod.desc}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
