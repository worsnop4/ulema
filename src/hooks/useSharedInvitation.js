import { useState, useEffect, useCallback, useRef } from 'react'
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

  // Ref untuk track data terkini tanpa trigger re-render
  // Ini memungkinkan updateData mengakses data terbaru tanpa closure stale
  const dataRef = useRef(defaultInvitationData)
  const broadcastChannelRef = useRef(null)

  const pathParts = window.location.pathname.split('/')
  const inviteIdx = pathParts.indexOf('invite')
  const isPublicInvite = inviteIdx !== -1 && pathParts[inviteIdx + 1]
  const publicSlug = isPublicInvite ? pathParts[inviteIdx + 1] : null

  // adminDemo sebagai state reaktif — dibaca ulang ketika storage berubah
  const [adminDemo, setAdminDemo] = useState(() =>
    storageService.getItem('inviter_admin_demo_mode')
  )

  // Sinkronisasi data helper
  const applyData = useCallback((newData) => {
    dataRef.current = newData
    setData(newData)
  }, [])

  // Listener adminDemo — HANYA untuk key 'inviter_admin_demo_mode'
  // Tidak memakai 'local-storage-update' karena itu fire untuk semua key
  useEffect(() => {
    const syncAdminDemo = (e) => {
      // Untuk event 'storage' (cross-tab), filter hanya key yang relevan
      if (e.type === 'storage' && e.key && e.key !== 'inviter_admin_demo_mode') return
      const val = storageService.getItem('inviter_admin_demo_mode')
      setAdminDemo(prev => prev === val ? prev : val)
    }
    window.addEventListener('storage', syncAdminDemo)
    // Custom event khusus untuk admin demo mode change
    window.addEventListener('admin-demo-changed', syncAdminDemo)
    return () => {
      window.removeEventListener('storage', syncAdminDemo)
      window.removeEventListener('admin-demo-changed', syncAdminDemo)
    }
  }, [])

  // Fetch data dari Supabase berdasarkan konteks (admin demo / pengguna / publik)
  useEffect(() => {
    let mounted = true
    async function fetchData() {
      setLoading(true)

      let fetchedData = null

      if (isPublicInvite && publicSlug && publicSlug !== 'demo') {
        // ── Undangan publik milik pengguna ──────────────────────────
        const { data: inviteRow } = await supabase
          .from('invitations').select('*')
          .eq('data->>slug', publicSlug)
          .maybeSingle()
        if (inviteRow) {
          fetchedData = { ...defaultInvitationData, ...inviteRow.data, id: inviteRow.id }
        }

      } else if (publicSlug === 'demo') {
        // ── Pengunjung landing page: preview tema publik ─────────────
        const queryThemeId = new URLSearchParams(window.location.search).get('theme') || '1'
        const targetSlug = `demo-theme-${queryThemeId}`
        const { data: inviteRow } = await supabase
          .from('invitations').select('*')
          .eq('data->>slug', targetSlug)
          .maybeSingle()
        fetchedData = inviteRow
          ? { ...defaultInvitationData, ...inviteRow.data, id: inviteRow.id }
          : { ...defaultInvitationData, themeId: parseInt(queryThemeId, 10), slug: targetSlug }

      } else if (user) {
        // ── Pengguna yang login (User biasa / Admin) ─────────────────
        let query = supabase.from('invitations').select('*').eq('user_id', user.id)

        // Jika Admin sedang mode edit tema demo, spesifikkan berdasarkan slug demo-nya
        if (user.role === 'admin' && adminDemo) {
          query = query.eq('data->>slug', `demo-theme-${adminDemo}`)
        }

        const { data: inviteRow } = await query.maybeSingle()
        if (inviteRow) {
          fetchedData = { ...defaultInvitationData, ...inviteRow.data, id: inviteRow.id }
        } else {
          // Buat row jika belum ada
          const payload = {
            user_id: user.id,
            theme_id: 1,
            data: { ...defaultInvitationData }
          }
          if (user.role === 'admin' && adminDemo) {
            payload.theme_id = parseInt(adminDemo, 10)
            payload.data.themeId = payload.theme_id
            payload.data.slug = `demo-theme-${adminDemo}`
          }
          
          const { data: newRow, error } = await supabase
            .from('invitations').insert(payload).select().single()
            
          if (error) {
            console.error('[fetchData] Gagal membuat row baru:', error)
          }
            
          if (!error && newRow) {
            fetchedData = { ...defaultInvitationData, ...newRow.data, id: newRow.id }
          }
        }
      }

      if (mounted && fetchedData) {
        // Guard: jangan timpa data yang sudah diupdate oleh user SETELAH fetch dimulai.
        // Jika dataRef sudah punya id yang sama dengan fetchedData, bandingkan _v (version).
        // Data dari user update selalu punya _v lebih tinggi dari data DB.
        const currentVersion = dataRef.current?._v || 0
        const fetchedVersion = fetchedData?._v || 0
        if (currentVersion <= fetchedVersion || !dataRef.current?.id) {
          applyData(fetchedData)
          // Broadcast ke instance lain yang sudah mounted (misal form components)
          // sehingga mereka tidak perlu fetch sendiri
          window.dispatchEvent(new CustomEvent('INVITATION_DATA_SYNC', { detail: fetchedData }))
          if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage(fetchedData)
          }
        }
      }

      if (mounted) setLoading(false)
    }

    fetchData()
    return () => { mounted = false }
  }, [user, isPublicInvite, publicSlug, adminDemo, applyData])


  // Cross-tab / cross-component sync via BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel('inviter_sync')
    broadcastChannelRef.current = channel
    channel.onmessage = (e) => {
      if (e.data) {
        // Hanya apply jika data yang masuk lebih baru (versi lebih tinggi)
        const incomingV = e.data._v || 0
        const currentV = dataRef.current?._v || 0
        if (incomingV >= currentV) applyData(e.data)
      }
    }
    const handleLocalSync = (e) => {
      if (e.detail) {
        const incomingV = e.detail._v || 0
        const currentV = dataRef.current?._v || 0
        if (incomingV >= currentV) applyData(e.detail)
      }
    }
    window.addEventListener('INVITATION_DATA_SYNC', handleLocalSync)
    return () => {
      channel.close()
      broadcastChannelRef.current = null
      window.removeEventListener('INVITATION_DATA_SYNC', handleLocalSync)
    }
  }, [applyData])


  // ── updateData ─────────────────────────────────────────────────
  // PERBAIKAN: semua operasi async (Supabase) dilakukan DI LUAR setState callback
  // untuk mencegah: double-call di React Strict Mode, stale closure, dan memory leak
  const updateData = useCallback(async (updater, onError, skipSave = false) => {
    // 1. Hitung next state dari current data (gunakan ref untuk nilai terkini)
    const prev = dataRef.current
    const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }

    // Tandai dengan version timestamp — fetchData guard akan membandingkan ini
    // untuk memastikan data DB tidak menimpa perubahan user yang lebih baru
    next._v = Date.now()

    // 2. Kunci slug agar tidak berubah akibat edit field lain
    if (adminDemo) {
      next.slug = `demo-theme-${adminDemo}`
    } else if (next.groom?.nickname && next.bride?.nickname) {
      next.slug = `${next.groom.nickname}-${next.bride.nickname}`
        .toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
    }

    // 3. Update state dan ref secara sinkron
    applyData(next)

    // 4. Broadcast ke komponen/tab lain
    if (!skipSave) {
      // Broadcast via event (same tab, komponen lain)
      window.dispatchEvent(new CustomEvent('INVITATION_DATA_SYNC', { detail: next }))
      // Broadcast via BroadcastChannel (cross-tab)
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage(next)
      }
    }

    // 5. Simpan ke Supabase secara async, DI LUAR setState
    if (!skipSave) {
      window.dispatchEvent(new Event('INVITATION_SAVING'))
      
      if (next.id && (!isPublicInvite || publicSlug !== 'demo')) {
        const { error } = await supabase.from('invitations').update({
          data: next,
          groom_name: next.groom?.nickname,
          bride_name: next.bride?.nickname,
          theme_id: next.themeId,
        }).eq('id', next.id)

        if (error) {
          console.error('[updateData] Gagal menyimpan:', error)
          window.dispatchEvent(new Event('INVITATION_SAVE_ERROR'))
          if (onError) onError(error)
        } else {
          window.dispatchEvent(new Event('INVITATION_SAVED'))
        }
      } else {
        window.dispatchEvent(new Event('INVITATION_SAVED'))
      }
    }
  }, [user, adminDemo, isPublicInvite, publicSlug, applyData])


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
