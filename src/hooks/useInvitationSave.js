import { useCallback, useState, useRef } from 'react'
import { invitationService } from '../services/invitationService'
import { SYNC_EVENTS } from '../config/constants'

export function useInvitationSave() {
  const [isSaving, setIsSaving] = useState(false)
  // Tracks whether a save is currently in flight, and the most recent call
  // that arrived while waiting — so overlapping saves never run concurrently
  // (which could let an older network response overwrite a newer one).
  const inFlightRef = useRef(false)
  const pendingRef = useRef(null)

  const save = useCallback(async (next, isPublicInvite, publicSlug, onError) => {
    if (inFlightRef.current) {
      pendingRef.current = [next, isPublicInvite, publicSlug, onError]
      return
    }

    inFlightRef.current = true
    setIsSaving(true)
    window.dispatchEvent(new Event(SYNC_EVENTS.SAVING))

    let args = [next, isPublicInvite, publicSlug, onError]
    while (args) {
      const [curNext, curIsPublicInvite, curPublicSlug, curOnError] = args

      if (curNext.id && (!curIsPublicInvite || curPublicSlug !== 'demo')) {
        const payload = {
          data: curNext,
          groom_name: curNext.groom?.nickname,
          bride_name: curNext.bride?.nickname,
          theme_id: curNext.themeId,
        }
        const { error } = await invitationService.updateInvitation(curNext.id, payload)

        if (error) {
          console.error('[updateData] Gagal menyimpan:', error)
          window.dispatchEvent(new Event(SYNC_EVENTS.SAVE_ERROR))
          if (curOnError) curOnError(error)
        } else {
          window.dispatchEvent(new Event(SYNC_EVENTS.SAVED))
        }
      } else {
        window.dispatchEvent(new Event(SYNC_EVENTS.SAVED))
      }

      args = pendingRef.current
      pendingRef.current = null
    }

    inFlightRef.current = false
    setIsSaving(false)
  }, [])

  return { save, isSaving }
}
