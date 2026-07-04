import { useState, useEffect, useRef } from 'react'

export function useAudioPlayer() {
  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    if (!audioRef.current) return
    if (musicPlaying) {
      audioRef.current.play().catch(() => {
        // Browser blocked autoplay (common until the user interacts with the page) — not an error to surface.
        setMusicPlaying(false)
      })
    } else {
      audioRef.current.pause()
    }
  }, [musicPlaying])

  return { musicPlaying, setMusicPlaying, audioRef }
}
