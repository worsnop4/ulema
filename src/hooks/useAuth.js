/**
 * useAuth Hook
 * Central auth context and hook for the application.
 * Import this in ALL components instead of importing directly from App.jsx.
 */
import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthContext.Provider')
  }
  return context
}
