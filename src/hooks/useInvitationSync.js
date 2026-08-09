import { useEffect, useRef, useCallback, useState } from 'react'
import { SYNC_EVENTS } from '../config/constants'

export function useInvitationSync(dataRef, onRemoteUpdate) {
  const broadcastChannelRef = useRef(null)
  // Unique per hook instance. BroadcastChannel already never delivers a message
  // back to the tab that sent it, but the window DATA_SYNC event exists to sync
  // multiple useSharedInvitation instances within the *same* tab, so it fires for
  // its own sender too — tag each broadcast with its origin so an instance can
  // skip re-applying the update it just sent itself.
  const [originId] = useState(() => crypto.randomUUID())

  useEffect(() => {
    const channel = new BroadcastChannel(SYNC_EVENTS.BROADCAST_CHANNEL)
    broadcastChannelRef.current = channel

    // A BroadcastChannel is shared by every tab on the origin, and `_v`
    // timestamps are not comparable across different invitations. Without an
    // identity check, a dashboard tab that fetches its own invitation
    // broadcasts it and overwrites whatever a guest tab is showing — the
    // guest's wishes appear to vanish, and a later save from that tab would
    // write to the wrong row. Only accept updates for the same record; when
    // either side has no id yet (first load, unsaved demo) fall through to the
    // version check as before rather than blocking legitimate sync.
    const isSameRecord = (incoming) => {
      const currentId = dataRef.current?.id
      return !(incoming?.id && currentId && incoming.id !== currentId)
    }

    channel.onmessage = (e) => {
      if (e.data && isSameRecord(e.data)) {
        const incomingV = e.data._v || 0
        const currentV = dataRef.current?._v || 0
        if (incomingV >= currentV) onRemoteUpdate(e.data)
      }
    }

    const handleLocalSync = (e) => {
      if (e.detail && e.detail.origin !== originId) {
        const incomingData = e.detail.data
        if (!isSameRecord(incomingData)) return
        const incomingV = incomingData?._v || 0
        const currentV = dataRef.current?._v || 0
        if (incomingV >= currentV) onRemoteUpdate(incomingData)
      }
    }

    window.addEventListener(SYNC_EVENTS.DATA_SYNC, handleLocalSync)

    return () => {
      channel.close()
      broadcastChannelRef.current = null
      window.removeEventListener(SYNC_EVENTS.DATA_SYNC, handleLocalSync)
    }
  }, [dataRef, onRemoteUpdate, originId])

  const broadcastUpdate = useCallback((nextData) => {
    window.dispatchEvent(new CustomEvent(SYNC_EVENTS.DATA_SYNC, {
      detail: { data: nextData, origin: originId }
    }))
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage(nextData)
    }
  }, [originId])

  return { broadcastUpdate }
}
