'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Play, Pause, Volume2, VolumeX, Music2, AlertCircle, Radio, Headphones } from 'lucide-react'

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

    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const progress = Math.min((playbackTime / duration) * 100, 100)

  if (audioError) {
    return (
      <div className="bg-gradient-to-r from-red-900/90 to-rose-800/90 cinema-glass-dark rounded-2xl p-6 text-white border border-red-500/30 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-red-300" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold mb-1">Soundtrack Unavailable</h4>
            <p className="text-sm text-red-200 opacity-90">The film's audio reel couldn't be loaded</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-amber-900/95 via-orange-900/95 to-red-900/95 cinema-glass-dark rounded-2xl p-6 text-white border border-amber-500/30 shadow-2xl">
      <audio
        ref={audioRef}
        src={previewUrl}
        preload="metadata"
        muted={isMuted}
      />
      
      <div className="flex items-center gap-6">
        {/* Soundtrack Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Music2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              {gameCompleted ? (
                <>
                  <h4 className="font-bold text-lg truncate text-amber-100">{trackTitle}</h4>
                  <p className="text-sm text-amber-200/80 truncate">{artistName}</p>
                </>
              ) : (
                <>
                  <h4 className="font-bold text-lg text-amber-100">Soundtrack Preview</h4>
                  <p className="text-sm text-amber-200/80">Audio hint for this film</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-4">
          {/* Volume Control (hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 cinema-touch"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-amber-200" />
              ) : (
                <Volume2 className="w-5 h-5 text-amber-200" />
              )}
            </button>
            
            <div className="relative">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="cinema-slider w-20 h-2 bg-gradient-to-r from-amber-800 to-orange-800 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    #D4A574 0%, 
                    #D4A574 ${volume * 100}%, 
                    #8B1538 ${volume * 100}%, 
                    #8B1538 100%)`
                }}
              />
            </div>
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={isBuffering}
            className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:via-orange-500 hover:to-red-500 disabled:from-amber-800 disabled:via-orange-800 disabled:to-red-800 rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl cinema-btn disabled:opacity-50 disabled:cursor-not-allowed group"
            aria-label={isPlaying ? 'Pause soundtrack' : 'Play soundtrack'}
          >
            {isBuffering ? (
              <div className="cinema-spinner w-6 h-6" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            ) : (
              <Play className="w-6 h-6 ml-1 text-white group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>
      </div>

      {/* Cinema Progress Bar */}
      <div className="mt-6">
        <div className="w-full bg-gradient-to-r from-red-900/40 to-amber-900/40 rounded-full h-3 overflow-hidden shadow-inner border border-amber-700/30">
          <div
            className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 h-3 rounded-full transition-all duration-200 ease-out shadow-lg relative"
            style={{ width: `${progress}%` }}
          >
            {/* Film strip effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/10 rounded-full" />
          </div>
        </div>
        
        {/* Time Display - Simple seconds */}
        <div className="flex justify-between items-center text-sm text-amber-200/80 mt-3">
          <span className="font-mono">{Math.floor(playbackTime)}s</span>
          <span className="font-mono">{duration}s</span>
        </div>
        
        {/* Audio Waveform Visual */}
        {isPlaying && (
          <div className="flex justify-center items-center gap-1 mt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="cinema-waveform-bar"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Theater Ambiance when Playing */}
      {isPlaying && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/5 via-orange-400/5 to-red-400/5 pointer-events-none cinema-glow" />
      )}
    </div>
  )
})

AudioHint.displayName = 'AudioHint'

export default AudioHint