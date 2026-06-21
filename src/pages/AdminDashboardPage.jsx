import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Palette, Image as ImageIcon, Settings } from 'lucide-react'

// Import extracted admin modules
import AdminTransactions from '../components/admin/AdminTransactions'
import AdminThemes from '../components/admin/AdminThemes'
import AdminIllustrations from '../components/admin/AdminIllustrations'
import AdminFinance from '../components/admin/AdminFinance'
import AdminUsers from '../components/admin/AdminUsers'
import AdminMusic from '../components/admin/AdminMusic'
import { storageService } from '../services/storageService'
import { Users as UsersIcon, Music } from 'lucide-react'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')

  // Sync state changes across tabs/windows
  useEffect(() => {
    // Always clear admin demo mode when returning to admin dashboard
    storageService.removeItem('inviter_admin_demo_mode')
    window.dispatchEvent(new Event('admin-demo-changed'))
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 mb-1">Dashboard Admin</h1>
          <p className="text-slate-500 text-sm">Kelola keuangan, promosi kupon, harga paket, dan performa tema aktif.</p>
        </div>
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {[
            { id: 'dashboard', label: 'Analitik & Pembayaran', icon: CreditCard },
            { id: 'users', label: 'Kelola Pengguna', icon: UsersIcon },
            { id: 'themes', label: 'Daftar Tema', icon: Palette },
            { id: 'illustrations', label: 'Kelola Ilustrasi', icon: ImageIcon },
            { id: 'music', label: 'Kelola Musik', icon: Music },
            { id: 'finance', label: 'Keuangan & Kupon', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon size={14} /> {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Render Active Tab Component */}
      {activeTab === 'dashboard' && <AdminTransactions />}
      {activeTab === 'users' && <AdminUsers />}
      {activeTab === 'themes' && <AdminThemes />}
      {activeTab === 'illustrations' && <AdminIllustrations />}
      {activeTab === 'music' && <AdminMusic />}
      {activeTab === 'finance' && <AdminFinance />}
    </div>
  )
}
