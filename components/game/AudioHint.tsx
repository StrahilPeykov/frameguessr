'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react'

interface AudioHintProps {
  previewUrl: string
  duration: number // How long to play (5, 15, or 30 seconds)
  trackTitle: string
  artistName: string
  hintLevel: number
  onPlayStart?: () => void
  onPlayEnd?: () => void
}

export default function AudioHint({
  previewUrl,
  duration,
  trackTitle,
  artistName,
  hintLevel,
  onPlayStart,
  onPlayEnd
}: AudioHintProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [isBuffering, setIsBuffering] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(8) // Start from 8 seconds by default

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedData = () => {
      // Start from the most engaging part (around 8-12 seconds in)
      const startTime = Math.min(8, Math.max(0, audio.duration - duration - 2))
      startTimeRef.current = startTime
      audio.currentTime = startTime
      setCurrentTime(startTime)
      setIsBuffering(false)
      setAudioError(false)
    }

    const handleEnded = () => {
      resetAudio()
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
      
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
    }
  }, [previewUrl, duration, volume])

  // Reset audio to beginning
  const resetAudio = () => {
    const audio = audioRef.current
    if (!audio) return

    setIsPlaying(false)
    setCurrentTime(startTimeRef.current)
    audio.currentTime = startTimeRef.current
    
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
    
    onPlayEnd?.()
  }

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio || audioError) return

    try {
      if (isPlaying) {
        audio.pause()
        resetAudio()
      } else {
        // Always reset to start position when playing
        audio.currentTime = startTimeRef.current
        setCurrentTime(startTimeRef.current)
        setHasStarted(true)

        setIsBuffering(true)
        await audio.play()
        setIsPlaying(true)
        setIsBuffering(false)
        onPlayStart?.()

        // Set up timer to track progress and stop after specified duration
        intervalRef.current = setInterval(() => {
          const elapsed = audio.currentTime - startTimeRef.current
          setCurrentTime(audio.currentTime)

          // Stop exactly at duration limit and reset
          if (elapsed >= duration) {
            resetAudio()
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

  const progress = hasStarted ? Math.min(((currentTime - startTimeRef.current) / duration) * 100, 100) : 0

  if (audioError) {
    return (
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 text-white border border-gray-600/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-300">Audio hint unavailable</p>
            <p className="text-xs text-gray-500">Could not load audio preview</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-sm rounded-xl p-4 text-white border border-purple-500/20">
      <audio
        ref={audioRef}
        src={previewUrl}
        preload="metadata"
        muted={isMuted}
      />
      
      <div className="flex items-center gap-4">
        {/* Music Icon (no album cover) */}
        <div className="flex-shrink-0 w-12 h-12 bg-purple-700/50 rounded-lg flex items-center justify-center">
          <Music className="w-6 h-6 text-purple-200" />
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{trackTitle}</p>
          <p className="text-xs text-gray-300 truncate">{artistName}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-purple-600 px-2 py-0.5 rounded-full">
              🎵 Audio Hint {hintLevel}
            </span>
            <span className="text-xs text-gray-400">
              {duration}s preview
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Volume Control (hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${volume * 100}%, #4B5563 ${volume * 100}%, #4B5563 100%)`
              }}
            />
          </div>

          {/* Play Button */}
          <button
            onClick={togglePlay}
            disabled={isBuffering}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full transition-all disabled:opacity-50 shadow-lg"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {hasStarted && !audioError && (
        <div className="mt-3">
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0s</span>
            <span>{duration}s</span>
          </div>
        </div>
      )}
    </div>
  )
}