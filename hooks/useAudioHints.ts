import { useState, useEffect, useRef } from 'react'
import { AudioHintData } from '@/types'

export function useAudioHints(trackId?: number | null) {
  const [audioHints, setAudioHints] = useState<AudioHintData | null>(null)
  const [audioLoading, setAudioLoading] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const audioRef = useRef<{ stopAudio: () => void } | null>(null)

  useEffect(() => {
    const fetchAudioHints = async (id: number) => {
      try {
        setAudioLoading(true)
        setAudioError(false)
        console.log(`[AudioHints] Fetching audio for track ID: ${id}`)
        
        const response = await fetch(`/api/audio/${id}`)
        
        console.log(`[AudioHints] Audio API response status: ${response.status}`)
        
        if (response.ok) {
          const audioData = await response.json()
          setAudioHints(audioData)
          console.log('[AudioHints] Audio hints loaded:', audioData.track.title)
        } else {
          const errorData = await response.text()
          console.error(`[AudioHints] Audio API error ${response.status}:`, errorData)
          setAudioHints(null)
          setAudioError(true)
        }
      } catch (error) {
        console.error('[AudioHints] Failed to fetch audio hints:', error)
        setAudioHints(null)
        setAudioError(true)
      } finally {
        setAudioLoading(false)
      }
    }

    if (trackId) {
      fetchAudioHints(trackId)
    } else {
      setAudioHints(null)
      setAudioLoading(false)
      setAudioError(false)
    }
  }, [trackId])

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.stopAudio()
    }
  }

  const setAudioRef = (ref: { stopAudio: () => void } | null) => {
    audioRef.current = ref
  }

  return {
    audioHints,
    audioLoading,
    audioError,
    stopAudio,
    setAudioRef,
  }
}

export default useAudioHints