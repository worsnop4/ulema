import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Shared "copy to clipboard + show confirmation" logic.
 * Clears its own timeout on unmount so it never sets state on an unmounted component.
 * @param {number} resetDelay - ms before the "copied" indicator resets
 */
export function useCopyToClipboard(resetDelay = 2000) {
  const [copiedKey, setCopiedKey] = useState(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const copy = useCallback((text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setCopiedKey(null), resetDelay)
  }, [resetDelay])

  return { copiedKey, copy }
}
