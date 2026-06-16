import { useState, useEffect } from 'react'
import { storageService } from '../services/storageService'
import { defaultInvitationData, DEFAULT_THEMES, DEFAULT_ILLUSTRATIONS } from '../data/defaultData'

const STORAGE_KEY = 'inviter_template_data'

export { defaultInvitationData, DEFAULT_THEMES, DEFAULT_ILLUSTRATIONS }

export function getThemes() {
  const stored = storageService.getItem('inviter_themes')
  if (stored) {
    // Find missing themes that are in DEFAULT_THEMES but not in stored
    const missingThemes = DEFAULT_THEMES.filter(dt => !stored.some(st => st.id === dt.id))
    
    const merged = [...stored, ...missingThemes].map(t => {
      const matched = DEFAULT_THEMES.find(d => d.id === t.id)
      if (matched) {
        return {
          ...t,
          name: matched.name,
          code: matched.code,
          thumbnail: matched.thumbnail,
          layout: matched.layout || t.layout || 'watercolor-floral',
          category: matched.category || t.category || 'Special'
        }
      }
      return t
    })

    if (missingThemes.length > 0) {
      storageService.setItem('inviter_themes', merged, false)
    }

    return merged
  }
  storageService.setItem('inviter_themes', DEFAULT_THEMES, false)
  return DEFAULT_THEMES
}

export function saveThemes(themesList) {
  storageService.setItem('inviter_themes', themesList)
}

export function getPricing() {
  const stored = storageService.getItem('inviter_pricing')
  return stored || { Special: 99000, Adat: 110000, Motion: 140000, Luxury: 175000 }
}

export function savePricing(pricing) {
  storageService.setItem('inviter_pricing', pricing)
}

export function getVouchers() {
  const stored = storageService.getItem('inviter_vouchers')
  if (stored) return stored
  const defaults = [
    { id: 1, code: 'HAPPYWEDDING', discount: 10, type: 'percent', maxUse: 100, used: 12 },
    { id: 2, code: 'DISKON50', discount: 50000, type: 'flat', maxUse: 50, used: 8 },
  ]
  storageService.setItem('inviter_vouchers', defaults, false)
  return defaults
}

export function saveVouchers(vouchers) {
  storageService.setItem('inviter_vouchers', vouchers)
}

export function getTransactions() {
  const stored = storageService.getItem('inviter_transactions')
  if (stored) return stored
  const defaults = [
    { id: 'INV-2026-001', date: '2026-05-28', desc: 'Kategori Luxury', amount: 175000, discount: 17500, finalAmount: 157500, status: 'paid', userEmail: 'demo@ulema.id', voucherCode: 'HAPPYWEDDING', paymentProof: 'receipt.png' },
    { id: 'INV-2026-002', date: '2026-05-29', desc: 'Kategori Adat', amount: 110000, discount: 0, finalAmount: 110000, status: 'pending', userEmail: 'demo@ulema.id', voucherCode: '', paymentProof: 'bukti_transfer.png' }
  ]
  storageService.setItem('inviter_transactions', defaults, false)
  return defaults
}

export function saveTransactions(transactions) {
  storageService.setItem('inviter_transactions', transactions)
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

const getStorageKey = () => {
  const adminDemo = storageService.getItem('inviter_admin_demo_mode')
  if (adminDemo) {
    return `inviter_demo_data_${adminDemo}`
  }

  const userStored = storageService.getItem('inviter_user')
  if (userStored && userStored.email && userStored.role !== 'admin') {
    return `inviter_template_data_${userStored.email}`
  }

  // Check if we are viewing a specific slug from URL path
  const pathParts = window.location.pathname.split('/')
  const inviteIdx = pathParts.indexOf('invite')
  if (inviteIdx !== -1 && pathParts[inviteIdx + 1]) {
    const slug = pathParts[inviteIdx + 1]
    
    if (slug === 'demo') {
      const params = new URLSearchParams(window.location.search)
      const themeId = params.get('theme') || '1'
      return `inviter_demo_data_${themeId}`
    }

    const users = storageService.getItem('inviter_registered_users')
    if (users && Array.isArray(users)) {
      const matchedUser = users.find(u => u.slug === slug)
      if (matchedUser) {
        return `inviter_template_data_${matchedUser.email}`
      }
    }
  }

  return 'inviter_template_data'
}

export function useSharedInvitation() {
  const [storageKey, setStorageKey] = useState(getStorageKey)

  const [data, setData] = useState(() => {
    const stored = storageService.getItem(storageKey)
    let parsedData = stored ? { ...defaultInvitationData, ...stored } : { ...defaultInvitationData }
    
    if (storageKey.startsWith('inviter_demo_data_')) {
      const tId = parseInt(storageKey.split('_').pop(), 10)
      if (!isNaN(tId)) {
        parsedData.themeId = tId
      }
    }
    return parsedData
  })

  useEffect(() => {
    const handleKeyChange = () => {
      const newKey = getStorageKey()
      if (newKey !== storageKey) {
        setStorageKey(newKey)
      }
    }
    window.addEventListener('storage', handleKeyChange)
    window.addEventListener('local-storage-update', handleKeyChange)
    return () => {
      window.removeEventListener('storage', handleKeyChange)
      window.removeEventListener('local-storage-update', handleKeyChange)
    }
  }, [storageKey])

  useEffect(() => {
    const stored = storageService.getItem(storageKey)
    let parsedData = stored ? { ...defaultInvitationData, ...stored } : { ...defaultInvitationData }
    
    if (storageKey.startsWith('inviter_demo_data_')) {
      const tId = parseInt(storageKey.split('_').pop(), 10)
      if (!isNaN(tId)) {
        parsedData.themeId = tId
      }
    }
    setData(parsedData)
  }, [storageKey])

  const updateData = (updater, onError) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      try {
        storageService.setItem(storageKey, next)
      } catch (e) {
        if (onError) onError(e)
        return prev
      }
      return next
    })
  }

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === storageKey && e.newValue) {
        try {
          setData({ ...defaultInvitationData, ...JSON.parse(e.newValue) })
        } catch { /* ignore */ }
      }
    }
    const handleCustomStorage = () => {
      const stored = storageService.getItem(storageKey)
      if (stored) {
        setData({ ...defaultInvitationData, ...stored })
      }
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('local-storage-update', handleCustomStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('local-storage-update', handleCustomStorage)
    }
  }, [storageKey])

  return [data, updateData]
}

export function getIllustrations() {
  const stored = storageService.getItem('inviter_illustrations')
  if (stored) {
    // Reset if it contains the old format (emoji instead of filename)
    if (stored.length > 0 && stored[0].emoji !== undefined) {
      storageService.setItem('inviter_illustrations', DEFAULT_ILLUSTRATIONS, false)
      return DEFAULT_ILLUSTRATIONS
    }
    return stored
  }
  storageService.setItem('inviter_illustrations', DEFAULT_ILLUSTRATIONS, false)
  return DEFAULT_ILLUSTRATIONS
}

export function saveIllustrations(list) {
  storageService.setItem('inviter_illustrations', list)
  return true
}
