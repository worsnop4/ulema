import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import DashboardLayout from './layouts/DashboardLayout'
import InvitationEdit from './pages/InvitationEdit'
import IllustrationsPage from './pages/IllustrationsPage'
import ProfilePage from './pages/ProfilePage'
import SecurityPage from './pages/SecurityPage'
import TransactionPage from './pages/TransactionPage'
import ReferralPage from './pages/ReferralPage'
import InvitationTemplate from './pages/InvitationTemplate'
import AdminDashboardPage from './pages/AdminDashboardPage'
import GuestsPage from './pages/GuestsPage'


// Simple auth context
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

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

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchProfile = async (session) => {
      if (!session) {
        if (mounted) { setUser(null); setLoading(false); }
        return
      }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (mounted) {
        if (profile) {
          setUser({ ...session.user, ...profile, package: profile.package_type })
        } else {
          setUser(session.user)
        }
        setLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true)
      fetchProfile(session)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Public invitation page — no auth needed, guests open this */}
          <Route path="/invite/:slug" element={<InvitationTemplate />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardLayout /></ProtectedRoute>
          }>
            <Route index element={
              user?.role === 'admin' 
                ? <Navigate to="/dashboard/admin" replace /> 
                : user?.package === 'none'
                  ? <Navigate to="/dashboard/transactions" replace />
                  : <Navigate to="/dashboard/invitation/edit" replace />
            } />
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
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
