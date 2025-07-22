export function isAudioSupported(): boolean {
  if (typeof window === 'undefined') return false
  const audio = document.createElement('audio')
  return !!(audio.canPlayType && audio.canPlayType('audio/mpeg'))
}

export async function playAudioWithRetry(
  audioElement: HTMLAudioElement,
  maxRetries: number = 3
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await audioElement.play()
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        throw new Error('Audio playback requires user interaction')
      }
      if (attempt === maxRetries) {
        throw new Error(`Audio playback failed: ${(error as Error).message}`)
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function getProgressPercentage(currentTime: number, duration: number): number {
  if (!duration || duration === 0) return 0
  return Math.min((currentTime / duration) * 100, 100)
}

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