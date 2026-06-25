import { supabase } from '../lib/supabase'

/**
 * @typedef {import('../types/invitation').InvitationRecord} InvitationRecord
 * @typedef {import('../types/invitation').InvitationData} InvitationData
 */

export const invitationService = {
  /**
   * Mengambil data undangan berdasarkan kolom pencocokan
   * @param {string} matchColumn - Kolom untuk pencarian (contoh: 'id' atau 'slug')
   * @param {string} matchValue - Nilai untuk dicari
   * @returns {Promise<{data: InvitationRecord | null, error: any}>}
   */
  async getInvitation(matchColumn, matchValue) {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq(matchColumn, matchValue)
        .maybeSingle()
      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  },

  /**
   * Membuat undangan baru
   * @param {Partial<InvitationRecord>} payload - Data undangan awal (minimal user_id, theme_id, data)
   * @returns {Promise<{data: InvitationRecord | null, error: any}>}
   */
  async createInvitation(payload) {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .insert(payload)
        .select()
        .single()
      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  },

  /**
   * Memperbarui undangan yang ada
   * @param {string} id - ID undangan
   * @param {Partial<InvitationRecord>} payload - Field yang diperbarui
   * @returns {Promise<{data: InvitationRecord | null, error: any}>}
   */
  async updateInvitation(id, payload) {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  },

  /**
   * Menghapus undangan
   * @param {string} id - ID undangan
   * @returns {Promise<{data: InvitationRecord | null, error: any}>}
   */
  async deleteInvitation(id) {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', id)
      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  }
}
