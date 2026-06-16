import { useState } from 'react'

export function useRsvp(updateData) {
  const [rsvpName, setRsvpName] = useState('')
  const [rsvpWish, setRsvpWish] = useState('')
  const [rsvpStatus, setRsvpStatus] = useState('hadir')
  const [rsvpSent, setRsvpSent] = useState(false)

  const handleRsvpSubmit = (e) => {
    e.preventDefault()
    if (!rsvpName.trim()) return
    
    const newRsvp = {
      id: Date.now(),
      name: rsvpName,
      wish: rsvpWish,
      rsvp: rsvpStatus,
      guests: rsvpStatus === 'hadir' ? 1 : 0,
      time: 'Baru saja',
      timestamp: Date.now()
    }
    
    updateData(prev => ({
      ...prev,
      rsvps: [newRsvp, ...(prev.rsvps || [])]
    }))
    
    setRsvpSent(true)
    setRsvpName('')
    setRsvpWish('')
  }

  return {
    rsvpName, setRsvpName,
    rsvpWish, setRsvpWish,
    rsvpStatus, setRsvpStatus,
    rsvpSent, setRsvpSent,
    handleRsvpSubmit
  }
}
