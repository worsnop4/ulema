import { useEffect, useRef, useCallback } from 'react'
import { SYNC_EVENTS } from '../config/constants'

export function useInvitationSync(dataRef, onRemoteUpdate) {
  const broadcastChannelRef = useRef(null)

  useEffect(() => {
    const channel = new BroadcastChannel(SYNC_EVENTS.BROADCAST_CHANNEL)
    broadcastChannelRef.current = channel

    channel.onmessage = (e) => {
      if (e.data) {
        const incomingV = e.data._v || 0
        const currentV = dataRef.current?._v || 0
        if (incomingV >= currentV) onRemoteUpdate(e.data)
      }
    }

    const handleLocalSync = (e) => {
      if (e.detail) {
        const incomingV = e.detail._v || 0
        const currentV = dataRef.current?._v || 0
        if (incomingV >= currentV) onRemoteUpdate(e.detail)
      }
    }

    window.addEventListener(SYNC_EVENTS.DATA_SYNC, handleLocalSync)

    return () => {
      channel.close()
      broadcastChannelRef.current = null
      window.removeEventListener(SYNC_EVENTS.DATA_SYNC, handleLocalSync)
    }
  }, [dataRef, onRemoteUpdate])

  const broadcastUpdate = useCallback((nextData) => {
    window.dispatchEvent(new CustomEvent(SYNC_EVENTS.DATA_SYNC, { detail: nextData }))
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage(nextData)
    }
  }, [])

  return { broadcastUpdate }
}
