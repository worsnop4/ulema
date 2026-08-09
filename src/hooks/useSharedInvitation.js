import { useState, useEffect, useCallback, useRef } from 'react'
import { storageService } from '../services/storageService'
import { defaultInvitationData, DEFAULT_THEMES, DEFAULT_ILLUSTRATIONS } from '../data/defaultData'
import { useAuth } from '../App'
import { STORAGE_KEYS, SYNC_EVENTS } from '../config/constants'
import { fetchThemesDB } from '../services/themesService'
import { getInviteRoute } from '../lib/inviteRoute'

import { useInvitationData } from './useInvitationData'
import { useInvitationSync } from './useInvitationSync'
import { useInvitationSave } from './useInvitationSave'

export { defaultInvitationData, DEFAULT_THEMES, DEFAULT_ILLUSTRATIONS }

// Cache the parsed/merged theme list so repeated getThemes() calls during
// render (e.g. every countdown tick, or from every theme component) don't
// re-read + re-parse localStorage and rebuild new array/object references
// each time. Invalidated on any local-storage-update (own tab writes go
// through saveThemes below; other tabs' writes are picked up via the event).
let themesCache = null
// Once the Supabase `themes` table has been read successfully, it becomes the
// source of truth: getThemes() returns the stored DB list verbatim (no
// DEFAULT_THEMES merge / tombstones — those are only the offline fallback).
let dbAuthoritative = false
if (typeof window !== 'undefined') {
  window.addEventListener('local-storage-update', () => { themesCache = null })
}

// Ids of DEFAULT_THEMES the admin has explicitly deleted. Kept as a tombstone
// list so the merge below never resurrects them on the next load/login.
export function getDeletedThemeIds() {
  return storageService.getItem(STORAGE_KEYS.DELETED_THEMES) || []
}

export function getThemes() {
  if (themesCache) return themesCache

  // DB mode: the Supabase list (persisted to localStorage on refresh) is
  // authoritative — return it as-is, no DEFAULT_THEMES merge or tombstones.
  if (dbAuthoritative) {
    const dbStored = storageService.getItem(STORAGE_KEYS.THEMES)
    if (dbStored) { themesCache = dbStored; return themesCache }
  }

  const deleted = getDeletedThemeIds()
  const stored = storageService.getItem(STORAGE_KEYS.THEMES)
  if (stored) {
    // Re-add DEFAULT_THEMES missing from storage — but NOT ones the admin
    // deleted (otherwise a deleted default reappears every session).
    const missingThemes = DEFAULT_THEMES.filter(dt => !deleted.includes(dt.id) && !stored.some(st => st.id === dt.id))

    const merged = [...stored, ...missingThemes]
      .filter(t => !deleted.includes(t.id))
      .map(t => {
        const matched = DEFAULT_THEMES.find(d => d.id === t.id)
        if (matched) {
          return {
            ...t,
            name: t.name || matched.name,
            code: t.code || matched.code,
            thumbnail: t.thumbnail || matched.thumbnail,
            layout: t.layout || matched.layout || 'watercolor-floral',
            category: t.category || matched.category || 'Special'
          }
        }
        return t
      })

    // Persist whenever the merge changed what's stored (missing added or a
    // tombstoned theme pruned) so the cleanup sticks.
    if (missingThemes.length > 0 || merged.length !== stored.length) {
      storageService.setItem(STORAGE_KEYS.THEMES, merged, false)
    }

    themesCache = merged
    return themesCache
  }
  const seeded = DEFAULT_THEMES.filter(dt => !deleted.includes(dt.id))
  storageService.setItem(STORAGE_KEYS.THEMES, seeded, false)
  themesCache = seeded
  return themesCache
}

export function saveThemes(themesList) {
  storageService.setItem(STORAGE_KEYS.THEMES, themesList)
  themesCache = themesList
}

// Delete a theme AND remember it (tombstone) so the DEFAULT_THEMES merge in
// getThemes() doesn't bring it back after re-login. Returns the new list.
export function deleteTheme(id) {
  const deleted = getDeletedThemeIds()
  if (!deleted.includes(id)) {
    storageService.setItem(STORAGE_KEYS.DELETED_THEMES, [...deleted, id])
  }
  const remaining = getThemes().filter(t => t.id !== id)
  saveThemes(remaining)
  return remaining
}

// Pull the authoritative theme list from Supabase into the sync cache +
// localStorage, then notify listeners (landing catalog, editor) to re-render.
// Falls back silently to the local list if the table isn't reachable yet
// (pre-migration / offline). Call on app mount and after admin writes.
export async function refreshThemes() {
  const { data, error } = await fetchThemesDB()
  if (error || !data || data.length === 0) return themesCache || getThemes()
  dbAuthoritative = true
  themesCache = data
  storageService.setItem(STORAGE_KEYS.THEMES, data, false)
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('local-storage-update'))
  return data
}

export function getPricing() {
  const stored = storageService.getItem(STORAGE_KEYS.PRICING)
  return stored || { Special: 99000, Adat: 110000, Motion: 140000, Luxury: 175000 }
}

export function savePricing(pricing) {
  storageService.setItem(STORAGE_KEYS.PRICING, pricing)
}

export function getVouchers() {
  const stored = storageService.getItem(STORAGE_KEYS.VOUCHERS)
  if (stored) return stored
  const defaults = [
    { id: 1, code: 'HAPPYWEDDING', discount: 10, type: 'percent', maxUse: 100, used: 12 },
    { id: 2, code: 'DISKON50', discount: 50000, type: 'flat', maxUse: 50, used: 8 },
  ]
  storageService.setItem(STORAGE_KEYS.VOUCHERS, defaults, false)
  return defaults
}

export function saveVouchers(vouchers) {
  storageService.setItem(STORAGE_KEYS.VOUCHERS, vouchers)
}

export function getTransactions() {
  const stored = storageService.getItem(STORAGE_KEYS.TRANSACTIONS)
  if (stored) return stored
  const defaults = [
    { id: 'INV-2026-001', date: '2026-05-28', desc: 'Kategori Luxury', amount: 175000, discount: 17500, finalAmount: 157500, status: 'paid', userEmail: 'demo@ulema.id', voucherCode: 'HAPPYWEDDING', paymentProof: 'receipt.png' },
    { id: 'INV-2026-002', date: '2026-05-29', desc: 'Kategori Adat', amount: 110000, discount: 0, finalAmount: 110000, status: 'pending', userEmail: 'demo@ulema.id', voucherCode: '', paymentProof: 'bukti_transfer.png' }
  ]
  storageService.setItem(STORAGE_KEYS.TRANSACTIONS, defaults, false)
  return defaults
}

export function saveTransactions(transactions) {
  storageService.setItem(STORAGE_KEYS.TRANSACTIONS, transactions)
}

/**
 * Derive the countdown target datetime from the first event with a valid date.
 * Returns a string like "2026-12-25T08:00:00" or null if no valid event date.
 */
export function getCountdownTarget(data) {
  const events = data?.events || []
  const first = events.find(ev => ev.date && ev.date.length === 10)
  if (!first) return null
  const start = first.start || '08:00'
  return `${first.date}T${start}:00`
}

export function useSharedInvitation() {
  const { user } = useAuth() || {}
  const [data, setData] = useState(defaultInvitationData)

  const dataRef = useRef(defaultInvitationData)

  const { isPublicInvite, publicSlug } = getInviteRoute()

  const [adminDemo, setAdminDemo] = useState(() =>
    storageService.getItem(STORAGE_KEYS.ADMIN_DEMO_MODE)
  )

  const applyData = useCallback((newData) => {
    dataRef.current = newData
    setData(newData)
  }, [])

  useEffect(() => {
    const syncAdminDemo = (e) => {
      if (e.type === 'storage' && e.key && e.key !== STORAGE_KEYS.ADMIN_DEMO_MODE) return
      const val = storageService.getItem(STORAGE_KEYS.ADMIN_DEMO_MODE)
      setAdminDemo(prev => prev === val ? prev : val)
    }
    window.addEventListener('storage', syncAdminDemo)
    window.addEventListener(SYNC_EVENTS.ADMIN_DEMO_CHANGED, syncAdminDemo)
    return () => {
      window.removeEventListener('storage', syncAdminDemo)
      window.removeEventListener(SYNC_EVENTS.ADMIN_DEMO_CHANGED, syncAdminDemo)
    }
  }, [])

  // 1. Compose Fetch Hook
  const { data: fetchedData, isLoading, error } = useInvitationData({
    user, isPublicInvite, publicSlug, adminDemo
  })

  // 2. Compose Sync Hook
  const { broadcastUpdate } = useInvitationSync(dataRef, applyData)

  // 3. Compose Save Hook
  const { save, isSaving } = useInvitationSave()

  // Apply fetched data. The version guard (`_v`) only protects against a
  // stale fetch clobbering newer local edits for the SAME record — it must
  // never block switching to a DIFFERENT record (e.g. an admin jumping from
  // editing one theme's demo content to another's), since `_v` timestamps
  // aren't comparable across unrelated invitations. Track the fetch target's
  // identity and always apply when it changes.
  const targetKeyRef = useRef(null)
  useEffect(() => {
    if (fetchedData) {
      const targetKey = `${user?.id || ''}|${isPublicInvite ? publicSlug : ''}|${adminDemo || ''}`
      const targetChanged = targetKeyRef.current !== null && targetKeyRef.current !== targetKey
      const currentVersion = dataRef.current?._v || 0
      const fetchedVersion = fetchedData?._v || 0
      if (targetChanged || currentVersion <= fetchedVersion || !dataRef.current?.id) {
        applyData(fetchedData)
        broadcastUpdate(fetchedData)
      }
      targetKeyRef.current = targetKey
    }
  }, [fetchedData, applyData, broadcastUpdate, user, isPublicInvite, publicSlug, adminDemo])

  const updateData = useCallback(async (updater, onError, skipSave = false) => {
    const prev = dataRef.current
    const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }

    next._v = Date.now()

    if (adminDemo) {
      next.slug = `demo-theme-${adminDemo}`
    } else if (next.groom?.nickname && next.bride?.nickname) {
      next.slug = `${next.groom.nickname}-${next.bride.nickname}`
        .toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
    }

    applyData(next)

    if (!skipSave) {
      broadcastUpdate(next)
      await save(next, isPublicInvite, publicSlug, onError)
    }
  }, [adminDemo, applyData, broadcastUpdate, save, isPublicInvite, publicSlug])

  return [data, updateData, isLoading, setData]
}



export function getIllustrations() {
  const stored = storageService.getItem(STORAGE_KEYS.ILLUSTRATIONS)
  if (stored) {
    // Reset if it contains the old format (emoji instead of filename)
    if (stored.length > 0 && stored[0].emoji !== undefined) {
      storageService.setItem(STORAGE_KEYS.ILLUSTRATIONS, DEFAULT_ILLUSTRATIONS, false)
      return DEFAULT_ILLUSTRATIONS
    }
    return stored
  }
  storageService.setItem(STORAGE_KEYS.ILLUSTRATIONS, DEFAULT_ILLUSTRATIONS, false)
  return DEFAULT_ILLUSTRATIONS
}

export function saveIllustrations(list) {
  storageService.setItem(STORAGE_KEYS.ILLUSTRATIONS, list)
  return true
}
