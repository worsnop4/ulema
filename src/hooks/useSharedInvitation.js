import { useState, useEffect, useCallback, useRef } from 'react'
import { storageService } from '../services/storageService'
import { defaultInvitationData, DEFAULT_THEMES, DEFAULT_ILLUSTRATIONS } from '../data/defaultData'
import { useAuth } from '../App'
import { STORAGE_KEYS, SYNC_EVENTS } from '../config/constants'

import { useInvitationData } from './useInvitationData'
import { useInvitationSync } from './useInvitationSync'
import { useInvitationSave } from './useInvitationSave'

export { defaultInvitationData, DEFAULT_THEMES, DEFAULT_ILLUSTRATIONS }

export function getThemes() {
  const stored = storageService.getItem(STORAGE_KEYS.THEMES)
  if (stored) {
    // Find missing themes that are in DEFAULT_THEMES but not in stored
    const missingThemes = DEFAULT_THEMES.filter(dt => !stored.some(st => st.id === dt.id))
    
    const merged = [...stored, ...missingThemes].map(t => {
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

    if (missingThemes.length > 0) {
      storageService.setItem(STORAGE_KEYS.THEMES, merged, false)
    }

    return merged
  }
  storageService.setItem(STORAGE_KEYS.THEMES, DEFAULT_THEMES, false)
  return DEFAULT_THEMES
}

export function saveThemes(themesList) {
  storageService.setItem(STORAGE_KEYS.THEMES, themesList)
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

  const pathParts = window.location.pathname.split('/')
  const inviteIdx = pathParts.indexOf('invite')
  const isPublicInvite = inviteIdx !== -1 && pathParts[inviteIdx + 1]
  const publicSlug = isPublicInvite ? pathParts[inviteIdx + 1] : null

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

  // Apply fetched data
  useEffect(() => {
    if (fetchedData) {
      const currentVersion = dataRef.current?._v || 0
      const fetchedVersion = fetchedData?._v || 0
      if (currentVersion <= fetchedVersion || !dataRef.current?.id) {
        applyData(fetchedData)
        broadcastUpdate(fetchedData)
      }
    }
  }, [fetchedData, applyData, broadcastUpdate])

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
