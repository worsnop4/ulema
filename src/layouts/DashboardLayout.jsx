import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import Logo from '../components/Logo'
import {
  LayoutDashboard, Image, User, Shield, CreditCard,
  Share2, LogOut, Menu, X, ChevronRight, Bell, Users, BarChart3
} from 'lucide-react'

const navGroups = [
  {
    label: 'Dashboard',
    items: [
      { label: 'Undangan', icon: LayoutDashboard, path: '/dashboard/invitation/edit' },
      { label: 'Daftar Tamu', icon: Users, path: '/dashboard/guests' },
      { label: 'Ilustrasi', icon: Image, path: '/dashboard/illustrations' },
    ],
  },
  {
    label: 'Akun',
    items: [
      { label: 'Informasi', icon: User, path: '/dashboard/profile' },
      { label: 'Pengaturan', icon: Shield, path: '/dashboard/security' },
      { label: 'Transaksi', icon: CreditCard, path: '/dashboard/transactions' },
      { label: 'Referrals', icon: Share2, path: '/dashboard/referrals' },
    ],
  },
]

// Vendor tidak membuat undangan -- untuk mendemokan ke kliennya cukup
// landing page Ulema. Jadi editor undangan, daftar tamu, ilustrasi, dan
// transaksi disembunyikan; yang tersisa hanya yang benar-benar dia pakai.
const vendorGroups = [
  {
    label: 'Vendor',
    items: [
      { label: 'Statistik', icon: BarChart3, path: '/dashboard/vendor' },
      { label: 'Komisi', icon: Share2, path: '/dashboard/referrals' },
    ],
  },
  {
    label: 'Akun',
    items: [
      { label: 'Informasi', icon: User, path: '/dashboard/profile' },
      { label: 'Pengaturan', icon: Shield, path: '/dashboard/security' },
    ],
  },
]

const adminGroups = [
  {
    label: 'Admin Panel',
    items: [
      { label: 'Dashboard Admin', icon: LayoutDashboard, path: '/dashboard/admin' },
    ],
  },
]

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Build-first: everyone (paid or not) gets the full editor nav. Publishing
  // the live invitation is what's gated on payment, not access to the tools.
  //
  // Menyembunyikan menu itu kosmetik, bukan kunci: tidak ada izin di belakang
  // daftar ini, jadi vendor yang mengetik alamatnya langsung tetap bisa masuk.
  // Itu disengaja -- vendor yang iseng membuat undangan tidak merugikan siapa
  // pun, dan menutupnya betulan adalah pekerjaan tersendiri.
  const activeGroups = user?.role === 'admin' ? adminGroups
    : user?.vendor ? vendorGroups
    : navGroups

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Logo className="h-10 w-auto" />
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* User badge */}
      <div className="mx-3 mt-4 mb-2 p-3 bg-gradient-to-br from-brand-50/50 to-gold-light/20 border border-brand-100/30 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-serif font-bold text-white text-sm"
               style={{ background: 'linear-gradient(135deg, #002147, #D4C4A8)' }}>
            {user?.name?.charAt(0) || 'D'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'Doni & Rizka'}</p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700">
              {user?.role === 'admin' ? 'Administrator'
                  : user?.vendor ? 'Vendor'
                  : (user?.package === 'none' ? 'Belum Aktif' : user?.package)}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {activeGroups.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <item.icon className="icon" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight size={13} className="text-slate-300 group-hover:text-brand-400" />
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-100">
        {user?.role !== 'admin' && user?.package !== 'none' && (
          <div className="mb-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-[10px] text-amber-700 font-semibold">Aktif hingga</p>
            <p className="text-xs text-amber-800 font-bold">{user?.expiry || '15 Maret 2026'}</p>
          </div>
        )}
        <button onClick={handleLogout}
                className="sidebar-link w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50">
          <LogOut className="icon" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-white border-r border-slate-100 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 flex flex-col w-72 bg-white shadow-2xl animate-slide-up">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="lg:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-slate-100 shadow-sm flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
            <Menu size={20} />
          </button>
          <Logo className="h-8 w-auto" />
          <button className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
