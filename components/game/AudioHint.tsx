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
      <div className="cinema-glass rounded-xl p-4 border border-red-200/50 dark:border-red-700/30 bg-red-50/30 dark:bg-red-900/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h4 className="font-medium text-red-800 dark:text-red-200 text-sm">Audio Unavailable</h4>
            <p className="text-red-600 dark:text-red-400 text-xs">Soundtrack couldn't be loaded</p>
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

      {/* Cinema Media Player */}
      <div className="cinema-glass rounded-xl overflow-hidden border border-stone-200/30 dark:border-amber-700/30">
        
        {/* Main Player Row */}
        <div className="flex items-center gap-4 p-4">
          
          {/* Audio Icon with Play Status */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-600/30 dark:to-orange-600/30 flex items-center justify-center border border-amber-300/30 dark:border-amber-600/30">
              <Music2 className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            </div>
            {isPlaying && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
            )}
          </div>

          {/* Track Info & Progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="min-w-0">
                <h4 className="font-medium text-stone-900 dark:text-stone-100 text-sm truncate">
                  {gameCompleted ? trackTitle : 'Mystery Soundtrack'}
                </h4>
                <p className="text-stone-600 dark:text-stone-400 text-xs truncate">
                  {gameCompleted ? `by ${artistName}` : `Level ${hintLevel} • ${duration}s preview`}
                </p>
              </div>
              
              <div className="text-xs text-stone-500 dark:text-stone-400 ml-2 tabular-nums">
                {Math.floor(Math.max(0, playbackTime))}s/{duration}s
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Volume Control (Desktop) */}
          <div className="hidden sm:flex items-center">
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cinema-touch"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              )}
            </button>
          </div>

          {/* Play Button */}
          <button
            onClick={togglePlay}
            disabled={isBuffering}
            className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-amber-800 disabled:to-orange-800 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl cinema-btn disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center"
            aria-label={isPlaying ? 'Pause soundtrack' : 'Play soundtrack'}
          >
            {isBuffering ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            ) : (
              <Play className="w-5 h-5 ml-0.5 text-white group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>

        {/* Bottom Bar with Visualizer */}
        <div className="flex items-center justify-center px-4 pb-3 border-t border-stone-200/20 dark:border-stone-700/20 h-12">
          {/* Mini Visualizer - Fixed container */}
          <div className="flex items-end gap-0.5 h-6 justify-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`w-0.5 rounded-full transition-all duration-300 ${
                  isPlaying 
                    ? 'bg-gradient-to-t from-amber-500 to-orange-500' 
                    : 'bg-stone-300 dark:bg-stone-600 opacity-30'
                }`}
                style={{
                  height: isPlaying 
                    ? `${Math.random() * 16 + 8}px` 
                    : '4px',
                  maxHeight: '24px',
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
})

AudioHint.displayName = 'AudioHint'

export default AudioHint