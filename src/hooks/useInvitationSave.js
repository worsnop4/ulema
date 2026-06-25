import { useCallback, useState } from 'react'
import { invitationService } from '../services/invitationService'
import { SYNC_EVENTS } from '../config/constants'

export function useInvitationSave() {
  const [isSaving, setIsSaving] = useState(false)

  const save = useCallback(async (next, isPublicInvite, publicSlug, onError) => {
    setIsSaving(true)
    window.dispatchEvent(new Event(SYNC_EVENTS.SAVING))
      
    if (next.id && (!isPublicInvite || publicSlug !== 'demo')) {
      const payload = {
        data: next,
        groom_name: next.groom?.nickname,
        bride_name: next.bride?.nickname,
        theme_id: next.themeId,
      }
      const { error } = await invitationService.updateInvitation(next.id, payload)

      if (error) {
        console.error('[updateData] Gagal menyimpan:', error)
        window.dispatchEvent(new Event(SYNC_EVENTS.SAVE_ERROR))
        if (onError) onError(error)
      } else {
        window.dispatchEvent(new Event(SYNC_EVENTS.SAVED))
      }
    } else {
      window.dispatchEvent(new Event(SYNC_EVENTS.SAVED))
    }
    setIsSaving(false)
  }, [])

  return { save, isSaving }
}
