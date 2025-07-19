// Audio utility functions for FrameGuessr

export interface AudioError extends Error {
  code: string
  retryable: boolean
}

export class AudioPlaybackError extends Error implements AudioError {
  code: string
  retryable: boolean

  constructor(message: string, code: string, retryable: boolean = true) {
    super(message)
    this.name = 'AudioPlaybackError'
    this.code = code
    this.retryable = retryable
  }
}

// Check if audio is supported in the current browser
export function isAudioSupported(): boolean {
  if (typeof window === 'undefined') return false
  
  const audio = document.createElement('audio')
  return !!(audio.canPlayType && audio.canPlayType('audio/mpeg'))
}

// Check if autoplay is allowed (requires user interaction first)
export async function canAutoplay(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  try {
    const audio = new Audio()
    audio.muted = true
    audio.volume = 0
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp56hVFApGn+DyvmcdBzqZ3/LPfC'
    await audio.play()
    return true
  } catch {
    return false
  }
}

// Play audio with retry logic and error handling
export async function playAudioWithRetry(
  audioElement: HTMLAudioElement,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<void> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await audioElement.play()
      return // Success!
    } catch (error) {
      lastError = error as Error
      console.warn(`Audio play attempt ${attempt} failed:`, error)

      // Check if error is retryable
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            throw new AudioPlaybackError(
              'Audio playback blocked by browser. User interaction required.',
              'USER_INTERACTION_REQUIRED',
              false
            )
          case 'NotSupportedError':
            throw new AudioPlaybackError(
              'Audio format not supported',
              'FORMAT_NOT_SUPPORTED',
              false
            )
          case 'AbortError':
            // This is often temporary, retry
            break
          default:
            if (attempt === maxRetries) {
              throw new AudioPlaybackError(
                `Audio playback failed: ${error.message}`,
                'PLAYBACK_FAILED',
                true
              )
            }
        }
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
      }
    }
  }

  // If we get here, all retries failed
  throw new AudioPlaybackError(
    `Audio playback failed after ${maxRetries} attempts: ${lastError?.message}`,
    'MAX_RETRIES_EXCEEDED',
    false
  )
}

// Create audio with preloading and error handling
export function createAudioElement(src: string, preload: 'none' | 'metadata' | 'auto' = 'metadata'): HTMLAudioElement {
  const audio = new Audio()
  audio.src = src
  audio.preload = preload
  audio.crossOrigin = 'anonymous' // For CORS support
  
  // Set up error handling
  audio.addEventListener('error', (e) => {
    console.error('Audio loading error:', e)
  })

  return audio
}

// Format time duration (seconds to MM:SS)
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Convert seconds to progress percentage
export function getProgressPercentage(currentTime: number, duration: number): number {
  if (!duration || duration === 0) return 0
  return Math.min((currentTime / duration) * 100, 100)
}

// Fade audio in/out
export function fadeAudio(
  audioElement: HTMLAudioElement,
  direction: 'in' | 'out',
  duration: number = 1000,
  targetVolume: number = 1
): Promise<void> {
  return new Promise((resolve) => {
    const startVolume = direction === 'in' ? 0 : audioElement.volume
    const endVolume = direction === 'in' ? targetVolume : 0
    const steps = 20
    const stepDuration = duration / steps
    const volumeStep = (endVolume - startVolume) / steps

    let currentStep = 0

    if (direction === 'in') {
      audioElement.volume = startVolume
    }

    const interval = setInterval(() => {
      currentStep++
      const newVolume = startVolume + (volumeStep * currentStep)
      
      audioElement.volume = Math.max(0, Math.min(1, newVolume))

      if (currentStep >= steps) {
        clearInterval(interval)
        audioElement.volume = endVolume
        
        if (direction === 'out' && endVolume === 0) {
          audioElement.pause()
        }
        
        resolve()
      }
    }, stepDuration)
  })
}

// Preload multiple audio files
export async function preloadAudio(urls: string[]): Promise<(HTMLAudioElement | null)[]> {
  const promises = urls.map(async (url) => {
    try {
      const audio = createAudioElement(url, 'metadata')
      
      return new Promise<HTMLAudioElement>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio preload timeout'))
        }, 10000) // 10 second timeout

        audio.addEventListener('loadeddata', () => {
          clearTimeout(timeout)
          resolve(audio)
        })

        audio.addEventListener('error', () => {
          clearTimeout(timeout)
          reject(new Error(`Failed to preload audio: ${url}`))
        })
      })
    } catch (error) {
      console.warn(`Failed to preload audio: ${url}`, error)
      return null
    }
  })

  const results = await Promise.allSettled(promises)
  
  return results.map(result => 
    result.status === 'fulfilled' ? result.value : null
  )
}

// Get optimal audio quality based on connection
export function getOptimalAudioQuality(): 'low' | 'medium' | 'high' {
  if (typeof navigator === 'undefined') return 'medium'
  
  // Check connection type if available
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  
  if (connection) {
    const effectiveType = connection.effectiveType
    
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'low'
      case '3g':
        return 'medium'
      case '4g':
      default:
        return 'high'
    }
  }
  
  return 'medium' // Default fallback
}

// Audio analytics tracking
export interface AudioAnalytics {
  trackTitle: string
  artistName: string
  movieTitle: string
  hintLevel: number
  playDuration: number
  totalDuration: number
  completionRate: number
  userAgent: string
  timestamp: number
}

export function trackAudioUsage(data: Omit<AudioAnalytics, 'userAgent' | 'timestamp'>): void {
  try {
    const analytics: AudioAnalytics = {
      ...data,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    }

    // Log to console for development
    console.log('Audio Analytics:', analytics)

    // Send to analytics service (implement based on your analytics provider)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'audio_hint_interaction', {
        custom_map: {
          track_title: analytics.trackTitle,
          artist_name: analytics.artistName,
          movie_title: analytics.movieTitle,
          hint_level: analytics.hintLevel,
          play_duration: analytics.playDuration,
          completion_rate: analytics.completionRate
        }
      })
    }

    // You can also send to your own analytics endpoint
    // fetch('/api/analytics/audio', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(analytics)
    // }).catch(console.error)

  } catch (error) {
    console.error('Failed to track audio usage:', error)
  }
}

// Audio accessibility helpers
export function createAudioDescription(trackTitle: string, artistName: string, movieTitle: string): string {
  return `Audio hint for ${movieTitle}: ${trackTitle} by ${artistName}. Use the play button to listen to a preview.`
}

// Check if user prefers reduced motion (affects audio visualizations)
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Volume level helpers
export const VOLUME_LEVELS = {
  MUTED: 0,
  LOW: 0.3,
  MEDIUM: 0.7,
  HIGH: 1.0
} as const

export function getVolumeLevel(volume: number): keyof typeof VOLUME_LEVELS {
  if (volume === 0) return 'MUTED'
  if (volume <= 0.3) return 'LOW'
  if (volume <= 0.7) return 'MEDIUM'
  return 'HIGH'
}

// Audio context utilities (for advanced audio processing if needed)
export function createAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    return new AudioContextClass()
  } catch (error) {
    console.warn('AudioContext not supported:', error)
    return null
  }
}

// Detect if user is on a mobile device (affects audio controls)
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Save/load user audio preferences
export interface AudioPreferences {
  volume: number
  autoplay: boolean
  showVisualizer: boolean
}

const AUDIO_PREFS_KEY = 'frameguessr-audio-prefs'

export function saveAudioPreferences(prefs: AudioPreferences): void {
  try {
    localStorage.setItem(AUDIO_PREFS_KEY, JSON.stringify(prefs))
  } catch (error) {
    console.error('Failed to save audio preferences:', error)
  }
}

export function loadAudioPreferences(): AudioPreferences {
  const defaults: AudioPreferences = {
    volume: 0.7,
    autoplay: false,
    showVisualizer: true
  }

  try {
    const saved = localStorage.getItem(AUDIO_PREFS_KEY)
    if (saved) {
      return { ...defaults, ...JSON.parse(saved) }
    }
  } catch (error) {
    console.error('Failed to load audio preferences:', error)
  }

  return defaults
}