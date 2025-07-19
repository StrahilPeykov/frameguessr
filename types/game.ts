export interface GameState {
  currentDate: string
  attempts: number
  maxAttempts: number
  guesses: Guess[]
  completed: boolean
  won: boolean
  currentHintLevel: number
}

export interface Guess {
  id: string
  title: string
  tmdbId: number
  mediaType: 'movie' | 'tv'
  correct: boolean
  timestamp: number
}

export interface DailyChallenge {
  date: string
  movieId: number
  mediaType: 'movie' | 'tv'
  title: string
  year?: number
  imageUrl: string
  hints: HintData
  details: MovieDetails // Full details shown at completion
  deezerTrackId?: number | null
}

export interface MovieDetails {
  director?: string
  actors?: string[]
  tagline?: string
  genre?: string
  overview?: string
  runtime?: number
  rating?: string
}

export interface HintData {
  level1: {
    type: 'image'
    data: string // Image URL - blur applied via CSS
  }
  level2: {
    type: 'tagline'
    data: {
      image: string // Same image URL - less blur
      tagline?: string
    }
  }
  level3: {
    type: 'metadata'
    data: {
      image: string // Same image URL - no blur
      tagline?: string // Keep tagline visible
      year?: number
      genre?: string
    }
  }
}

export interface SearchResult {
  id: number
  title: string
  year?: number
  mediaType: 'movie' | 'tv'
  posterUrl?: string
  overview?: string
  popularity?: number
  backdropUrl?: string
}

// Simple audio data from API
export interface AudioHintData {
  track: {
    id: number
    title: string
    artist: string
    previewUrl: string
    streamUrl: string
    duration?: number
  }
  durations: {
    level1: number // 5 seconds
    level2: number // 10 seconds  
    level3: number // 15 seconds
  }
}