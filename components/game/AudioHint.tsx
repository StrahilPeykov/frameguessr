'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Play, Pause, Volume2, VolumeX, Music2, AlertCircle, Headphones } from 'lucide-react'

interface AudioHintProps {
  previewUrl: string
  duration: number // seconds based on hint level
  trackTitle: string
  artistName: string
  hintLevel: number
  gameCompleted?: boolean
  onPlayStart?: () => void
  onPlayEnd?: () => void
}

interface AudioHintRef {
  stopAudio: () => void
}

const AudioHint = forwardRef<AudioHintRef, AudioHintProps>(({
  previewUrl,
  duration,
  trackTitle,
  artistName,
  hintLevel,
  gameCompleted = false,
  onPlayStart,
  onPlayEnd
}, ref) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [playbackTime, setPlaybackTime] = useState(0) // Time within our duration window
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(8) // Start from 8 seconds by default
  const isSeekingRef = useRef<boolean>(false) // Track if we're currently seeking

  // Expose stop function to parent
  useImperativeHandle(ref, () => ({
    stopAudio: handleStop
  }))

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedData = () => {
      // Start from the most engaging part (around 8-12 seconds in)
      const startTime = Math.min(8, Math.max(0, audio.duration - duration - 2))
      startTimeRef.current = startTime
      
      // Don't set currentTime here, do it when play is clicked
      setCurrentTime(startTime)
      setPlaybackTime(0)
      setIsBuffering(false)
      setAudioError(false)
    }

    const handleEnded = () => {
      handleStop()
    }

    const handleError = () => {
      setAudioError(true)
      setIsBuffering(false)
      setIsPlaying(false)
      console.error('Audio failed to load:', previewUrl)
    }

    const handleWaiting = () => setIsBuffering(true)
    const handleCanPlay = () => setIsBuffering(false)

    // Handle seek completion
    const handleSeeked = () => {
      isSeekingRef.current = false
      console.log('Seek completed, currentTime:', audio.currentTime)
    }

    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('seeked', handleSeeked)
    
    // Apply initial muted state
    audio.muted = isMuted

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('seeked', handleSeeked)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [previewUrl, duration, hintLevel])

  // Separate effect for muted changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.muted = isMuted
  }, [isMuted])

  // Clean stop function
  const handleStop = () => {
    const audio = audioRef.current
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    if (!audio) return

    audio.pause()
    setIsPlaying(false)
    
    // Reset to start position
    isSeekingRef.current = true
    audio.currentTime = startTimeRef.current
    setCurrentTime(startTimeRef.current)
    setPlaybackTime(0)
    
    onPlayEnd?.()
  }

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio || audioError) return

    try {
      if (isPlaying) {
        handleStop()
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }

        // Ensure we're at the start position before playing
        isSeekingRef.current = true
        audio.currentTime = startTimeRef.current
        
        // Wait a bit for the seek to complete
        await new Promise(resolve => setTimeout(resolve, 100))
        
        setCurrentTime(startTimeRef.current)
        setPlaybackTime(0)

        setIsBuffering(true)
        await audio.play()
        setIsPlaying(true)
        setIsBuffering(false)
        onPlayStart?.()

        intervalRef.current = setInterval(() => {
          if (!audio || audio.paused || audio.ended || audio.error) {
            if (audio?.error) {
              console.error('Audio error detected in interval:', audio.error)
              setAudioError(true)
            }
            handleStop()
            return
          }

          // Skip updates while seeking to avoid negative values
          if (isSeekingRef.current) {
            return
          }

          try {
            const currentAudioTime = audio.currentTime
            const elapsed = Math.max(0, currentAudioTime - startTimeRef.current) // Ensure non-negative
            
            console.log('Audio time:', currentAudioTime, 'Start:', startTimeRef.current, 'Elapsed:', elapsed)
            
            if (elapsed >= duration) {
              handleStop()
              return
            }

            setCurrentTime(currentAudioTime)
            setPlaybackTime(elapsed)
          } catch (error) {
            console.error('Error in audio interval:', error)
            handleStop()
          }
        }, 100)
      }
    } catch (error) {
      console.error('Audio play failed:', error)
      setIsPlaying(false)
      setIsBuffering(false)
      setAudioError(true)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const progress = Math.min((playbackTime / duration) * 100, 100)

  if (audioError) {
    return (
      <div className="cinema-glass rounded-lg p-3 border border-red-200/50 dark:border-red-700/30 bg-red-50/30 dark:bg-red-900/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-xs">
            <span className="font-medium text-red-800 dark:text-red-200">Audio unavailable</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {!audioError && (
        <audio
          ref={audioRef}
          src={previewUrl}
          preload="metadata"
          muted={isMuted}
        />
      )}

      {/* Compact Cinema Media Player */}
      <div className="cinema-glass rounded-lg overflow-hidden border border-stone-200/20 dark:border-amber-700/20 bg-stone-50/50 dark:bg-stone-900/50">
        
        {/* Compact Player Row */}
        <div className="flex items-center gap-3 p-3">
          
          {/* Play Button First for Better UX */}
          <button
            onClick={togglePlay}
            disabled={isBuffering}
            className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-amber-800 disabled:to-orange-800 rounded-full transition-all duration-300 shadow-md hover:shadow-lg cinema-btn disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center flex-shrink-0"
            aria-label={isPlaying ? 'Pause soundtrack' : 'Play soundtrack'}
          >
            {isBuffering ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            ) : (
              <Play className="w-4 h-4 ml-0.5 text-white group-hover:scale-110 transition-transform" />
            )}
          </button>

          {/* Track Info & Progress - More Compact */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Music2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <h4 className="font-medium text-stone-900 dark:text-stone-100 text-sm truncate">
                {gameCompleted ? trackTitle : 'Audio Hint'}
              </h4>
              {isPlaying && (
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0" />
              )}
            </div>
            
            {/* Progress Bar - Slimmer */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 tabular-nums flex-shrink-0">
                {Math.floor(Math.max(0, playbackTime))}s
              </div>
            </div>
          </div>

          {/* Volume Control - Compact */}
          <button
            onClick={toggleMute}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cinema-touch flex-shrink-0"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            )}
          </button>
        </div>

        {/* Optional: Tiny info bar */}
        {!gameCompleted && (
          <div className="px-3 pb-2 -mt-1">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Level {hintLevel} • {duration}s preview
            </p>
          </div>
        )}
      </div>
    </>
  )
})

AudioHint.displayName = 'AudioHint'

export default AudioHint