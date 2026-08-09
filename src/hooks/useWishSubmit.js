import { useState, useCallback } from 'react'
import { invitationService } from '../services/invitationService'
import { getInviteRoute } from '../lib/inviteRoute'

/**
 * Shared logic for submitting a guest wish/RSVP into invitation data.
 * Used by every theme (standard and custom) so persistence, id generation,
 * and double-submit guarding only need to be correct in one place.
 * @param {Function} updateData - updater from useSharedInvitation
 * @param {string} [invitationId] - row id to append to; when absent the wish
 *   is only reflected locally (nothing to persist against)
 */
export function useWishSubmit(updateData, invitationId) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitWish = useCallback(async ({ name, message, attendance = 'hadir', guests = 1 }) => {
    if (isSubmitting) return
    if (!name?.trim() || !message?.trim()) return

    setIsSubmitting(true)
    try {
      const newWish = {
        id: crypto.randomUUID(),
        name: name.trim(),
        wish: message.trim(),
        rsvp: attendance,
        guests: attendance === 'hadir' ? guests : 0,
        time: 'Baru saja',
        timestamp: Date.now(),
      }

      // Persist through the atomic RPC rather than updateData's full-row save:
      // writing back the whole invitation would let two guests submitting
      // seconds apart erase each other, and could revert edits the couple made
      // after this page was loaded.
      //
      // The shared /invite/demo preview deliberately keeps wishes local — it is
      // public, so test submissions would pile up on it permanently.
      const { isDemo } = getInviteRoute()
      let persisted = false

      if (invitationId && !isDemo) {
        const { error } = await invitationService.appendWish(invitationId, newWish)
        if (!error) {
          persisted = true
        } else if (error.code === 'PGRST202') {
          // Migration not applied yet. Fall through to the legacy full-row
          // save so wishes keep working in the window between this deploy and
          // the migration being run, instead of silently failing.
          console.warn('[useWishSubmit] RPC append_invitation_wish belum ada, memakai simpan lama')
        } else {
          console.error('[useWishSubmit] Gagal menyimpan ucapan:', error)
          return
        }
      }

      // When the RPC already wrote the row, skip the save — repeating it here
      // is what reintroduces the whole-row overwrite. Otherwise let the old
      // path run; it also applies the demo rule (useInvitationSave skips demo).
      await updateData(prev => ({
        ...prev,
        rsvps: [newWish, ...(prev.rsvps || [])]
      }), undefined, persisted)
    } finally {
      setIsSubmitting(false)
    }
  }, [updateData, invitationId, isSubmitting])

  return { submitWish, isSubmitting }
}
