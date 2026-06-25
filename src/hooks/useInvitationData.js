import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { defaultInvitationData } from '../data/defaultData'

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
          const { data: inviteRow, error: fetchErr } = await supabase
            .from('invitations').select('*')
            .eq('data->>slug', publicSlug)
            .maybeSingle()
            
          if (fetchErr) throw fetchErr
          if (inviteRow) {
            dataResult = { ...defaultInvitationData, ...inviteRow.data, id: inviteRow.id }
          }
        } else if (publicSlug === 'demo') {
          const queryThemeId = new URLSearchParams(window.location.search).get('theme') || '1'
          const targetSlug = `demo-theme-${queryThemeId}`
          const { data: inviteRow, error: fetchErr } = await supabase
            .from('invitations').select('*')
            .eq('data->>slug', targetSlug)
            .maybeSingle()
            
          if (fetchErr) throw fetchErr
          dataResult = inviteRow
            ? { ...defaultInvitationData, ...inviteRow.data, id: inviteRow.id }
            : { ...defaultInvitationData, themeId: parseInt(queryThemeId, 10), slug: targetSlug }
        } else if (user) {
          let query = supabase.from('invitations').select('*').eq('user_id', user.id)

          if (user.role === 'admin' && adminDemo) {
            query = query.eq('data->>slug', `demo-theme-${adminDemo}`)
          }

          const { data: inviteRow, error: fetchErr } = await query.maybeSingle()
          if (fetchErr) throw fetchErr
          
          if (inviteRow) {
            dataResult = { ...defaultInvitationData, ...inviteRow.data, id: inviteRow.id }
          } else {
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
            
            const { data: newRow, error: insertErr } = await supabase
              .from('invitations').insert(payload).select().single()
              
            if (insertErr) {
              console.error('[useInvitationData] Gagal membuat row baru:', insertErr)
              throw insertErr
            }
              
            if (newRow) {
              dataResult = { ...defaultInvitationData, ...newRow.data, id: newRow.id }
            }
          }
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
