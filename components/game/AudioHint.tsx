'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Play, Pause, Volume2, VolumeX, Music2, AlertCircle, Disc3, Headphones } from 'lucide-react'

interface AudioHintProps {
  previewUrl: string
  duration: number // 5, 10, or 15 seconds based on hint level (or 15 when completed)
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
  const [volume, setVolume] = useState(0.7)
  const [isBuffering, setIsBuffering] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [playbackTime, setPlaybackTime] = useState(0) // Time within our duration window
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(8) // Start from 8 seconds by default

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
      audio.currentTime = startTime
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

    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('canplay', handleCanPlay)
    audio.volume = volume

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('canplay', handleCanPlay)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [previewUrl, volume, duration, hintLevel])

  // Clean stop function - properly resets everything
  const handleStop = () => {
    const audio = audioRef.current
    if (!audio) return

    // Stop the audio
    audio.pause()
    setIsPlaying(false)
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    // Reset to start position
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
        // Pause/Stop
        handleStop()
      } else {
        // Play from start
        audio.currentTime = startTimeRef.current
        setCurrentTime(startTimeRef.current)
        setPlaybackTime(0)

        setIsBuffering(true)
        await audio.play()
        setIsPlaying(true)
        setIsBuffering(false)
        onPlayStart?.()

        // Set up timer to track progress and stop after specified duration
        intervalRef.current = setInterval(() => {
          const elapsed = audio.currentTime - startTimeRef.current
          setCurrentTime(audio.currentTime)
          setPlaybackTime(elapsed)

          // Stop exactly at duration limit
          if (elapsed >= duration) {
            handleStop()
          }
        }, 100)
      }
    } catch (error) {
      console.error('Audio play failed:', error)
      setIsPlaying(false)
      setIsBuffering(false)
      setAudioError(true)
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.muted = false
      setIsMuted(false)
    } else {
      audio.muted = true
      setIsMuted(true)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
      audioRef.current.muted = newVolume === 0
    }
  }

  const progress = Math.min((playbackTime / duration) * 100, 100)

  return (
    <div className="space-y-3">
      {/* Main Player Card - Fixed dimensions to prevent layout shift */}
      <div className="cinema-glass rounded-2xl overflow-hidden border border-stone-200/30 dark:border-amber-700/30 shadow-xl transition-shadow duration-300 hover:shadow-2xl">
        {!audioError && (
          <audio
            ref={audioRef}
            src={previewUrl}
            preload="metadata"
            muted={isMuted}
          />
        )}
        
        {/* Header Section - Fixed height */}
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 p-4 border-b border-stone-200/30 dark:border-stone-700/50 min-h-[80px]">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex-shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ${
                audioError 
                  ? 'bg-gradient-to-br from-red-500 to-red-600' 
                  : 'bg-gradient-to-br from-amber-500 to-red-600'
                } ${isPlaying && !audioError ? 'scale-110' : ''}`}>
                {audioError ? (
                  <AlertCircle className="w-6 h-6 text-white" />
                ) : (
                  <Music2 className="w-6 h-6 text-white" />
                )}
              </div>
              {isPlaying && !audioError && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 to-red-600 animate-ping opacity-30" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-stone-800 dark:text-stone-100 text-sm">
                {audioError ? 'Audio Unavailable' : gameCompleted ? 'Soundtrack' : 'Audio Hint'}
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {audioError ? 'Unable to load soundtrack' : `${duration} second preview`}
              </p>
            </div>
          </div>
        </div>

        {/* Main Player Section - Fixed height */}
        <div className="p-6 bg-white/50 dark:bg-stone-950/50" style={{ minHeight: '280px' }}>
          {audioError ? (
            /* Error State - Centered in fixed space */
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="font-bold text-red-800 dark:text-red-200 mb-2">Audio Unavailable</h4>
              <p className="text-xs text-red-600 dark:text-red-300 opacity-80">The film's audio reel couldn't be loaded</p>
            </div>
          ) : (
            <>
              {/* Vinyl Record Visualization - Fixed dimensions */}
              <div className="relative w-32 h-32 mx-auto mb-6 flex-shrink-0">
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 shadow-2xl transition-transform duration-1000 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
                  {/* Vinyl grooves */}
                  <div className="absolute inset-2 rounded-full border border-stone-700/30" />
                  <div className="absolute inset-4 rounded-full border border-stone-700/30" />
                  <div className="absolute inset-6 rounded-full border border-stone-700/30" />
                  <div className="absolute inset-8 rounded-full border border-stone-700/30" />
                  
                  {/* Center label */}
                  <div className="absolute inset-10 rounded-full bg-gradient-to-br from-amber-600 to-red-600 flex items-center justify-center">
                    <Disc3 className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                {/* Play/Pause Button Overlay - Fixed size */}
                <button
                  onClick={togglePlay}
                  disabled={isBuffering || audioError}
                  className="absolute inset-0 w-full h-full rounded-full flex items-center justify-center group disabled:cursor-not-allowed"
                  aria-label={isPlaying ? 'Pause soundtrack' : 'Play soundtrack'}
                >
                  <div className={`w-20 h-20 rounded-full bg-white/90 dark:bg-stone-900/90 shadow-2xl flex items-center justify-center transition-transform duration-300 ${!audioError && !isBuffering ? 'group-hover:scale-110' : ''} ${isBuffering ? 'opacity-50' : ''}`}>
                    {isBuffering ? (
                      <div className="cinema-spinner w-8 h-8" />
                    ) : isPlaying ? (
                      <Pause className="w-8 h-8 text-stone-800 dark:text-stone-200" />
                    ) : (
                      <Play className="w-8 h-8 ml-1 text-stone-800 dark:text-stone-200" />
                    )}
                  </div>
                </button>
              </div>

              {/* Track Info - Fixed height space */}
              <div className="text-center mb-4" style={{ minHeight: gameCompleted ? '48px' : '0px' }}>
                {gameCompleted && (
                  <>
                    <h5 className="font-bold text-stone-900 dark:text-stone-100 text-sm truncate px-2">
                      {trackTitle}
                    </h5>
                    <p className="text-xs text-stone-600 dark:text-stone-400 truncate px-2">
                      {artistName}
                    </p>
                  </>
                )}
              </div>

              {/* Progress Bar - Fixed height */}
              <div className="mb-4">
                <div className="relative w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                  {/* Progress indicator dot */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-amber-500 rounded-full shadow-lg transition-all duration-200"
                    style={{ left: `calc(${progress}% - 8px)` }}
                  />
                </div>
                
                {/* Time Display */}
                <div className="flex justify-between items-center text-xs text-stone-600 dark:text-stone-400 mt-2 font-mono">
                  <span>{Math.floor(playbackTime)}s</span>
                  <span>{duration}s</span>
                </div>
              </div>

              {/* Visual Feedback - Fixed height container */}
              <div className="flex justify-center items-center gap-1" style={{ height: '24px' }}>
                {isPlaying && Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-amber-500 to-red-500 rounded-full transition-all duration-300"
                    style={{
                      height: `${Math.random() * 16 + 8}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Volume Control - Fixed dimensions */}
      <div className="cinema-glass rounded-xl p-4 border border-stone-200/30 dark:border-amber-700/30" style={{ minHeight: '64px' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            onMouseEnter={() => setShowVolumeSlider(true)}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors duration-300 cinema-touch flex-shrink-0"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            disabled={audioError}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            )}
          </button>
          
          <div 
            className="flex-1"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              disabled={audioError}
              className={`cinema-slider w-full h-2 bg-gradient-to-r from-stone-300 to-stone-400 dark:from-stone-700 dark:to-stone-600 rounded-lg appearance-none cursor-pointer transition-opacity duration-300 ${showVolumeSlider ? 'opacity-100' : 'opacity-50'} disabled:opacity-30 disabled:cursor-not-allowed`}
              style={{
                background: `linear-gradient(to right, 
                  #D4A574 0%, 
                  #D4A574 ${(isMuted ? 0 : volume) * 100}%, 
                  #e5e5e5 ${(isMuted ? 0 : volume) * 100}%, 
                  #e5e5e5 100%)`
              }}
            />
          </div>
          
          <span className={`text-xs text-stone-500 dark:text-stone-400 w-10 text-right font-mono transition-opacity duration-300 ${showVolumeSlider ? 'opacity-100' : 'opacity-50'} flex-shrink-0`}>
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>
      </div>
    </div>
  )
})

AudioHint.displayName = 'AudioHint'

export default AudioHint