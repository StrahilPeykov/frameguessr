export interface GameState {
  currentDate: string
  attempts: number
  maxAttempts: number
  guesses: Guess[]
  allAttempts: Attempt[] // Chronological list of all attempts (guesses + skips)
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

// Game status enum for better type safety
export type GameStatus = 'unplayed' | 'in-progress' | 'completed-won' | 'completed-lost'

// Enhanced helper function to determine game status with robust fallback logic
export function getGameStatus(gameState: GameState | null): GameStatus {
  if (!gameState) {
    return 'unplayed'
  }

  // Check if no attempts have been made
  const actualAttempts = Math.max(
    gameState.attempts || 0,
    gameState.allAttempts?.length || 0,
    gameState.guesses?.length || 0
  )

  if (actualAttempts === 0) {
    return 'unplayed'
  }

  // Check for winning condition
  const hasWinningGuess = Boolean(
    gameState.won || 
    gameState.allAttempts?.some(attempt => attempt.type === 'guess' && attempt.correct) ||
    gameState.guesses?.some(guess => guess.correct)
  )

  if (hasWinningGuess) {
    return 'completed-won'
  }

  // Check if game should be completed (3+ attempts OR explicitly marked completed)
  const shouldBeCompleted = gameState.completed || actualAttempts >= (gameState.maxAttempts || 3)

  if (shouldBeCompleted) {
    return 'completed-lost'
  }

  return 'in-progress'
}

// Helper to check if a game has meaningful progress
export function hasProgress(gameState: GameState | null): boolean {
  if (!gameState) return false
  
  const actualAttempts = Math.max(
    gameState.attempts || 0,
    gameState.allAttempts?.length || 0,
    gameState.guesses?.length || 0
  )
  
  return actualAttempts > 0
}

// Helper to check if a game is worth saving/syncing
export function isWorthSaving(gameState: GameState | null): boolean {
  return hasProgress(gameState) // Save if any attempts were made
}

// Helper to check if a game is truly completed (for UI decisions)
export function isGameCompleted(gameState: GameState | null): boolean {
  if (!gameState) return false
  
  const status = getGameStatus(gameState)
  return status === 'completed-won' || status === 'completed-lost'
}

// Helper to check if a game was won
export function isGameWon(gameState: GameState | null): boolean {
  return getGameStatus(gameState) === 'completed-won'
}

// Helper to get attempts count reliably
export function getAttemptCount(gameState: GameState | null): number {
  if (!gameState) return 0
  
  return Math.max(
    gameState.attempts || 0,
    gameState.allAttempts?.length || 0,
    gameState.guesses?.length || 0
  )
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

// Data sync types for handling conflicts between local and cloud data
export interface DataConflict {
  date: string
  localData: LocalGameData
  cloudData: GameState
  type: 'local-only' | 'cloud-newer' | 'local-newer' | 'different-progress'
}

export interface LocalGameData extends GameState {
  createdWhileLoggedOut?: boolean
  lastModified: number
  syncStatus?: 'local-only' | 'synced' | 'conflict'
}

export interface SyncDecision {
  type: 'import-all' | 'clean-start' | 'merge-selected' | 'keep-account-only'
  selectedDates?: string[]
  clearLocalOnLogout?: boolean
}

// Statistics types
export interface UserStats {
  gamesPlayed: number
  gamesWon: number
  winPercentage: number
  currentStreak: number
  averageAttempts: number
  guessDistribution: number[]
  gamesInProgress?: number // New field for tracking incomplete games
}

// Archive types
export interface ArchiveEntry {
  date: string
  status: GameStatus
  title?: string // Only available if game was played
  mediaType?: 'movie' | 'tv'
  attempts?: number
  won?: boolean
  lastPlayed?: number // Timestamp
}

// Data summary for merge modal
export interface DataSummary {
  localGames: number
  localCompleted: number
  localInProgress: number
  cloudGames: number
  conflicts: number
}

// Game context types
export interface GameContextValue {
  // Game State
  gameState: GameState
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error'
  makeGuess: (result: SearchResult, correctMovieId: number, correctMediaType: string) => Promise<{ isCorrect: boolean; newGameState: GameState } | undefined>
  skipHint: () => void
  resetGame: (date?: string) => void
  
  // Daily Challenge
  dailyChallenge: DailyChallenge | null
  isChallengeLoading: boolean
  challengeError: string | null
  imageLoaded: boolean
  imageError: boolean
  retryChallenge: () => void
  
  // Audio
  audioHints: AudioHintData | null
  audioLoading: boolean
  audioError: boolean
  stopAudio: () => void
  setAudioRef: (ref: { stopAudio: () => void } | null) => void
  
  // Auth
  isAuthenticated: boolean
  currentUser: any
  authLoading: boolean
}

// Leaderboard types
export interface LeaderboardEntry {
  user_id: string
  username?: string
  display_name?: string
  score: number
  rank: number
  streak?: number
  averageAttempts?: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface GuessResponse {
  success: boolean
  validated: boolean
  correct: boolean
  corrected?: boolean
  correctAnswer?: {
    title: string
    tmdbId: number
    mediaType: 'movie' | 'tv'
  }
  message: string
  timestamp: string
}

// Error types
export interface GameError {
  type: 'network' | 'validation' | 'auth' | 'storage' | 'unknown'
  message: string
  code?: string
  retry?: boolean
}

// Global window extensions
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
  
  interface WindowEventMap {
    'show-data-merge-modal': CustomEvent<{
      conflicts: DataConflict[]
    }>
  }
}

// Utility type for making properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Utility type for picking required properties
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>

export type { }; // Ensure this is treated as a module