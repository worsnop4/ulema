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
import { storageService } from './services/storageService'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(() => storageService.getItem('inviter_user'))

  // Watch for local storage updates to sync auth user details (e.g. package upgrades)
  useEffect(() => {
    const syncUser = () => {
      const stored = storageService.getItem('inviter_user')
      if (stored) {
        setUser(stored)
      }
    }
    window.addEventListener('storage', syncUser)
    window.addEventListener('local-storage-update', syncUser)
    return () => {
      window.removeEventListener('storage', syncUser)
      window.removeEventListener('local-storage-update', syncUser)
    }
  }, [])

  const login = (userData) => {
    storageService.setItem('inviter_user', userData)
    setUser(userData)
  }

  const logout = () => {
    storageService.removeItem('inviter_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="illustrations" element={<IllustrationsPage />} />
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
