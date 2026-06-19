import { useState, useEffect, useCallback } from 'react'
import { storageService } from '../services/storageService'
import { defaultInvitationData, DEFAULT_THEMES, DEFAULT_ILLUSTRATIONS } from '../data/defaultData'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'

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

export function useSharedInvitation() {
  const { user } = useAuth() || {}
  const [data, setData] = useState(defaultInvitationData)
  const [loading, setLoading] = useState(true)

  const pathParts = window.location.pathname.split('/')
  const inviteIdx = pathParts.indexOf('invite')
  const isPublicInvite = inviteIdx !== -1 && pathParts[inviteIdx + 1]
  const publicSlug = isPublicInvite ? pathParts[inviteIdx + 1] : null
  const adminDemo = storageService.getItem('inviter_admin_demo_mode')

  useEffect(() => {
    let mounted = true
    async function fetchData() {
      setLoading(true)
      
      if (isPublicInvite && publicSlug !== 'demo') {
        const { data: inviteRow } = await supabase.from('invitations').select('*').eq('data->>slug', publicSlug).single()
        if (mounted && inviteRow) {
           setData({ ...defaultInvitationData, ...inviteRow.data, id: inviteRow.id })
        }
      } else if (user && user.role !== 'admin') {
        const { data: inviteRow } = await supabase.from('invitations').select('*').eq('user_id', user.id).single()
        if (mounted && inviteRow) {
           setData({ ...defaultInvitationData, ...inviteRow.data, id: inviteRow.id })
        }
      } else if (adminDemo || publicSlug === 'demo') {
        const themeId = adminDemo || new URLSearchParams(window.location.search).get('theme') || '1'
        if (mounted) {
          setData({ ...defaultInvitationData, themeId: parseInt(themeId, 10) })
        }
      }
      
      if (mounted) setLoading(false)
    }
    
    fetchData()
    return () => { mounted = false }
  }, [user, isPublicInvite, publicSlug, adminDemo])

  // Handle cross-component and cross-tab sync
  useEffect(() => {
    const channel = new BroadcastChannel('inviter_sync')
    channel.onmessage = (e) => {
      if (e.data) setData(e.data)
    }
    const handleLocalSync = (e) => {
      if (e.detail) setData(e.detail)
    }
    window.addEventListener('INVITATION_DATA_SYNC', handleLocalSync)
    
    return () => {
      channel.close()
      window.removeEventListener('INVITATION_DATA_SYNC', handleLocalSync)
    }
  }, [])

  const updateData = useCallback(async (updater, onError, skipSave = false) => {
    let nextState;
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      
      // Auto-generate slug
      if (next.groom?.nickname && next.bride?.nickname) {
        next.slug = `${next.groom.nickname}-${next.bride.nickname}`.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
      }

      nextState = next;
      
      if (!skipSave && next.id && !adminDemo && (!isPublicInvite || publicSlug !== 'demo')) {
         supabase.from('invitations').update({ 
           data: next,
           groom_name: next.groom?.nickname,
           bride_name: next.bride?.nickname,
           theme_id: next.themeId
         }).eq('id', next.id).then(({error}) => {
           if (error && onError) onError(error)
         })
      }
      return next
    })

    if (!skipSave && nextState) {
      // Small timeout to allow React to flush the synchronous state update
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('INVITATION_DATA_SYNC', { detail: nextState }))
        new BroadcastChannel('inviter_sync').postMessage(nextState)
      }, 0)
    }
  }, [adminDemo, isPublicInvite, publicSlug])

  return [data, updateData, loading, setData]
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
