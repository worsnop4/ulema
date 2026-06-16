import { useState, useEffect, useRef } from 'react'

export function useAudioPlayer() {
  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    if (!audioRef.current) return
    if (musicPlaying) {
      audioRef.current.play().catch(err => {
        console.log('Autoplay was prevented or audio failed to play:', err)
        setMusicPlaying(false)
      })
    } else {
      audioRef.current.pause()
    }
  }, [musicPlaying])

  return { musicPlaying, setMusicPlaying, audioRef }
}
