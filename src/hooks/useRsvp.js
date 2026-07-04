import { useState } from 'react'
import { useWishSubmit } from './useWishSubmit'

export function useRsvp(updateData) {
  const [rsvpName, setRsvpName] = useState('')
  const [rsvpWish, setRsvpWish] = useState('')
  const [rsvpStatus, setRsvpStatus] = useState('hadir')
  const [rsvpSent, setRsvpSent] = useState(false)

  const { submitWish, isSubmitting } = useWishSubmit(updateData)

  const handleRsvpSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting || !rsvpName.trim()) return

    await submitWish({ name: rsvpName, message: rsvpWish, attendance: rsvpStatus })

    setRsvpSent(true)
    setRsvpName('')
    setRsvpWish('')
  }

  return {
    rsvpName, setRsvpName,
    rsvpWish, setRsvpWish,
    rsvpStatus, setRsvpStatus,
    rsvpSent, setRsvpSent,
    handleRsvpSubmit,
    isSubmitting
  }
}
