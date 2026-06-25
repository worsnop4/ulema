/**
 * Storage Service
 * Centralized service to manage localStorage calls with built-in JSON parsing,
 * error handling, and event dispatching.
 */

class StorageService {
  /**
   * Get parsed JSON data from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist or on error
   * @returns {any}
   */
  getItem(key, defaultValue = null) {
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return defaultValue
      try {
        return JSON.parse(stored)
      } catch (e) {
        // Not a JSON string, return as raw string
        return stored
      }
    } catch (e) {
      console.error(`[StorageService] Error getting key "${key}":`, e)
      return defaultValue
    }
  }

  /**
   * Set data into localStorage as JSON and optionally dispatch an event
   * @param {string} key - Storage key
   * @param {any} value - Value to stringify and store
   * @param {boolean} dispatchEvent - Whether to dispatch 'local-storage-update' event
   * @throws Will throw if localStorage is full (QuotaExceededError)
   */
  setItem(key, value, dispatchEvent = true) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      if (dispatchEvent) {
        window.dispatchEvent(new Event('local-storage-update'))
      }
    } catch (e) {
      console.error(`[StorageService] Error setting key "${key}":`, e)
      if (e.name === 'QuotaExceededError') {
        window.dispatchEvent(new CustomEvent('local-storage-error', { detail: 'Storage quota exceeded' }))
      }
      throw e
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error(`[StorageService] Error removing key "${key}":`, e)
    }
  }

  /**
   * Clear all localStorage
   */
  clear() {
    try {
      localStorage.clear()
    } catch (e) {
      console.error('[StorageService] Error clearing storage:', e)
    }
  }
}

export const storageService = new StorageService()

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
