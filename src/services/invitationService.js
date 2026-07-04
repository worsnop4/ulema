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
   * Mengambil undangan milik user tertentu, opsional dipersempit ke slug tertentu
   * (dipakai untuk mode admin demo, lihat useInvitationData)
   * @param {string} userId
   * @param {{slug?: string}} [options]
   * @returns {Promise<{data: InvitationRecord | null, error: any}>}
   */
  async getInvitationForUser(userId, { slug } = {}) {
    try {
      let query = supabase.from('invitations').select('*').eq('user_id', userId)
      if (slug) query = query.eq('data->>slug', slug)
      const { data, error } = await query.maybeSingle()
      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  },

  /**
   * Increment atomik untuk views di dalam JSONB `data`, lewat RPC Postgres
   * (bukan lewat updateInvitation, supaya tidak menimpa seluruh row saat tamu buka undangan).
   * Butuh function `increment_invitation_views` di Supabase — lihat supabase/migrations/.
   * @param {string} id
   * @returns {Promise<{error: any}>}
   */
  async incrementViews(id) {
    try {
      const { error } = await supabase.rpc('increment_invitation_views', { p_id: id })
      return { error }
    } catch (err) {
      return { error: err }
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
