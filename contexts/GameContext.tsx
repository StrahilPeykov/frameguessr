// contexts/GameContext.tsx - Updated with reactive auth
'use client'

import { createContext, useContext, ReactNode } from 'react'
import { GameState, DailyChallenge, AudioHintData, SearchResult } from '@/types'
import { useGameState } from '@/hooks/useGameState'
import { useDailyChallenge } from '@/hooks/useDailyChallenge'
import { useAudioHints } from '@/hooks/useAudioHints'
import { useAuth } from '@/hooks/useAuth'

interface GameContextValue {
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

const GameContext = createContext<GameContextValue | undefined>(undefined)

interface GameProviderProps {
  children: ReactNode
  initialDate: string
}

export function GameProvider({ children, initialDate }: GameProviderProps) {
  // Hooks
  const gameState = useGameState({ initialDate })
  const dailyChallenge = useDailyChallenge(initialDate)
  const audioHints = useAudioHints(dailyChallenge.dailyChallenge?.deezerTrackId)
  const auth = useAuth()

  const value: GameContextValue = {
    // Game State
    gameState: gameState.gameState,
    syncStatus: gameState.syncStatus,
    makeGuess: (result, correctMovieId, correctMediaType) => 
      gameState.makeGuess(result, correctMovieId, correctMediaType),
    skipHint: gameState.skipHint,
    resetGame: gameState.resetGame,
    
    // Daily Challenge
    dailyChallenge: dailyChallenge.dailyChallenge,
    isChallengeLoading: dailyChallenge.isLoading,
    challengeError: dailyChallenge.error,
    imageLoaded: dailyChallenge.imageLoaded,
    imageError: dailyChallenge.imageError,
    retryChallenge: dailyChallenge.retry,
    
    // Audio
    audioHints: audioHints.audioHints,
    audioLoading: audioHints.audioLoading,
    audioError: audioHints.audioError,
    stopAudio: audioHints.stopAudio,
    setAudioRef: audioHints.setAudioRef,
    
    // Auth
    isAuthenticated: auth.isAuthenticated,
    currentUser: auth.currentUser,
    authLoading: auth.loading,
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

export function useGameContext() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider')
  }
  return context
}