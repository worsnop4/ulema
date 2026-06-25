import { supabase } from '../lib/supabase'

export const authService = {
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  },

  async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      return { data: null, error }
    } catch (err) {
      return { data: null, error: err }
    }
  },

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession()
      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  },

  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser()
      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  }
}
