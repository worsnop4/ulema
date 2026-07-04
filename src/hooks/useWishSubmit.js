import { useState, useCallback } from 'react'

/**
 * Shared logic for submitting a guest wish/RSVP into invitation data.
 * Used by every theme (standard and custom) so persistence, id generation,
 * and double-submit guarding only need to be correct in one place.
 * @param {Function} updateData - updater from useSharedInvitation
 */
export function useWishSubmit(updateData) {
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

      await updateData(prev => ({
        ...prev,
        rsvps: [newWish, ...(prev.rsvps || [])]
      }))
    } finally {
      setIsSubmitting(false)
    }
  }, [updateData, isSubmitting])

  return { submitWish, isSubmitting }
}
