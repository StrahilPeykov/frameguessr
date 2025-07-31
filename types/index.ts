export interface GameState {
  currentDate: string
  attempts: number
  maxAttempts: number
  guesses: Guess[]
  allAttempts: Attempt[] // Chronological list of all attempts
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

// Attempt type that tracks all attempts chronologically
export interface Attempt {
  id: string
  type: 'guess' | 'skip'
  correct?: boolean // Only meaningful for guesses
  title?: string // Only for guesses
  tmdbId?: number // Only for guesses
  mediaType?: 'movie' | 'tv' // Only for guesses
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
  details: MovieDetails
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
    data: string
  }
  level2: {
    type: 'tagline'
    data: {
      image: string
      tagline?: string
    }
  }
  level3: {
    type: 'metadata'
    data: {
      image: string
      tagline?: string
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
    level1: number
    level2: number  
    level3: number
  }
}

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'consent',
      targetId: string,
      config?: {
        [key: string]: any;
      }
    ) => void;
  }
}