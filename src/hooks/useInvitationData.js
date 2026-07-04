import { useState, useEffect } from 'react'
import { invitationService } from '../services/invitationService'
import { defaultInvitationData } from '../data/defaultData'

// Dedup concurrent fetch-or-create calls for the same user (e.g. AuthContext firing
// onAuthStateChange more than once before the first request resolves) so we never
// insert two invitation rows for the same user.
const inFlightCreations = new Map()

async function fetchOrCreateForUser(user, adminDemo) {
  const key = `${user.id}|${adminDemo || ''}`
  if (inFlightCreations.has(key)) return inFlightCreations.get(key)

  const promise = (async () => {
    const wantsDemo = user.role === 'admin' && adminDemo
    const { data: inviteRow, error: fetchErr } = await invitationService.getInvitationForUser(
      user.id,
      { slug: wantsDemo ? `demo-theme-${adminDemo}` : undefined }
    )
    if (fetchErr) throw fetchErr

    if (inviteRow) {
      return { ...defaultInvitationData, ...inviteRow.data, id: inviteRow.id }
    }

    const payload = {
      user_id: user.id,
      theme_id: 1,
      data: { ...defaultInvitationData }
    }
    if (wantsDemo) {
      payload.theme_id = parseInt(adminDemo, 10)
      payload.data.themeId = payload.theme_id
      payload.data.slug = `demo-theme-${adminDemo}`
    }

    const { data: newRow, error: insertErr } = await invitationService.createInvitation(payload)
    if (insertErr) {
      console.error('[useInvitationData] Gagal membuat row baru:', insertErr)
      throw insertErr
    }
    return newRow ? { ...defaultInvitationData, ...newRow.data, id: newRow.id } : null
  })()

  inFlightCreations.set(key, promise)
  try {
    return await promise
  } finally {
    inFlightCreations.delete(key)
  }
}

export function useInvitationData({ user, isPublicInvite, publicSlug, adminDemo }) {
  const [fetchedData, setFetchedData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      let dataResult = null

      try {
        if (isPublicInvite && publicSlug && publicSlug !== 'demo') {
          const { data: inviteRow, error: fetchErr } = await invitationService.getInvitation('data->>slug', publicSlug)
          if (fetchErr) throw fetchErr
          if (inviteRow) {
            dataResult = { ...defaultInvitationData, ...inviteRow.data, id: inviteRow.id }
          }
        } else if (publicSlug === 'demo') {
          const queryThemeId = new URLSearchParams(window.location.search).get('theme') || '1'
          const targetSlug = `demo-theme-${queryThemeId}`
          const { data: inviteRow, error: fetchErr } = await invitationService.getInvitation('data->>slug', targetSlug)
          if (fetchErr) throw fetchErr
          dataResult = inviteRow
            ? { ...defaultInvitationData, ...inviteRow.data, id: inviteRow.id }
            : { ...defaultInvitationData, themeId: parseInt(queryThemeId, 10), slug: targetSlug }
        } else if (user) {
          dataResult = await fetchOrCreateForUser(user, adminDemo)
        }

        if (mounted && dataResult) {
          setFetchedData(dataResult)
        }
      } catch (err) {
        if (mounted) setError(err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    fetchData()
    return () => { mounted = false }
  }, [user, isPublicInvite, publicSlug, adminDemo])

  return { data: fetchedData, isLoading, error }
}
