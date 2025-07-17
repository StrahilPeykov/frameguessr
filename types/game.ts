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
  blurLevels: BlurLevels
}

export interface HintData {
  level1: {
    type: 'image'
    data: string // Heavily blurred/cropped image URL
  }
  level2: {
    type: 'mixed'
    data: {
      image: string // Less blurred image
      year?: number
      genre?: string
    }
  }
  level3: {
    type: 'full'
    data: {
      image: string // Slightly blurred image
      actors?: string[]
      tagline?: string
      director?: string
    }
  }
}

export interface BlurLevels {
  heavy: string
  medium: string
  light: string
}

export interface SearchResult {
  id: number
  title: string
  year?: number
  mediaType: 'movie' | 'tv'
  posterUrl?: string
}