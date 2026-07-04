/**
 * Supabase Storage Service
 * Wraps Supabase Storage bucket operations (file upload/delete/public URL).
 * Not related to localStorage — see storageService.js for that.
 */
import { supabase } from '../lib/supabase'

export const supabaseStorageService = {
  async uploadImage(bucket, path, file, options = {}) {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, options)
      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  },

  async deleteFile(bucket, paths) {
    try {
      const { data, error } = await supabase.storage.from(bucket).remove(paths)
      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  },

  getPublicUrl(bucket, path) {
    try {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }
}
