import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import InvitationTemplate from './pages/InvitationTemplate'

// Lazy Load Heavy Dashboard Pages
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))
const InvitationEdit = lazy(() => import('./pages/InvitationEdit'))
const IllustrationsPage = lazy(() => import('./pages/IllustrationsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SecurityPage = lazy(() => import('./pages/SecurityPage'))
const TransactionPage = lazy(() => import('./pages/TransactionPage'))
const ReferralPage = lazy(() => import('./pages/ReferralPage'))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))
const GuestsPage = lazy(() => import('./pages/GuestsPage'))
const VendorPage = lazy(() => import('./pages/VendorPage'))
const VendorDashboardPage = lazy(() => import('./pages/VendorDashboardPage'))
const VendorContentPage = lazy(() => import('./pages/VendorContentPage'))


// Simple auth context
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { AuthContext, useAuth } from './hooks/useAuth'
import { dashboardHome } from './config/nav'
import { refreshThemes } from './hooks/useSharedInvitation'

// Re-export useAuth so legacy imports from App.jsx still work
export { useAuth }

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

// Vendor tetap pengguna biasa: perannya tidak berubah, yang membedakan hanya
// punya baris di tabel vendors atau tidak. Dompet, komisi, dan penarikan
// menempel di profiles, jadi tidak ada yang perlu dipikir ulang. Dua kueri ini
// berjalan bersamaan supaya tidak menambah waktu tunggu bagi mayoritas
// pengguna yang bukan vendor.
async function loadUser(session) {
  if (!session) return null
  const [{ data: profile }, { data: vendor }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', session.user.id).single(),
    supabase.from('vendors').select('id, slug, name, category, visible').eq('user_id', session.user.id).maybeSingle(),
  ])
  const mappedPackage = (profile?.package_type === 'free' ? 'none' : profile?.package_type) || 'none'
  return {
    ...session.user,
    ...(profile || { role: 'user' }),
    package: mappedPackage,
    vendor: vendor || null,
  }
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Dipanggil layar yang mengubah profil, supaya sidebar dan seluruh aplikasi
  // ikut memakai data baru tanpa perlu memuat ulang halaman.
  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(await loadUser(session))
  }

  useEffect(() => {
    let mounted = true

    const fetchProfile = async (session) => {
      const next = await loadUser(session)
      if (mounted) {
        setUser(next)
        setLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Pull the shared theme presets from Supabase so admin edits/deletions are
  // visible to everyone (not just the browser that made them).
  useEffect(() => { refreshThemes() }, [])

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      <BrowserRouter>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
              <p className="font-serif text-sm text-slate-500 animate-pulse">Menyiapkan Halaman...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            {/* Public invitation page — no auth needed, guests open this */}
            <Route path="/invite/:slug" element={<InvitationTemplate />} />
            <Route path="/vendor/:slug" element={<VendorPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardLayout /></ProtectedRoute>
            }>
              <Route index element={<Navigate to={dashboardHome(user)} replace />} />
              <Route path="invitation/edit" element={<InvitationEdit />} />
              <Route path="guests" element={<GuestsPage />} />
              <Route path="admin" element={
                <AdminRoute><AdminDashboardPage /></AdminRoute>
              } />
              <Route path="illustrations" element={
                <AdminRoute><IllustrationsPage /></AdminRoute>
              } />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="security" element={<SecurityPage />} />
              <Route path="transactions" element={<TransactionPage />} />
              <Route path="referrals" element={<ReferralPage />} />
              <Route path="vendor" element={<VendorDashboardPage />} />
              <Route path="vendor/content" element={<VendorContentPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
