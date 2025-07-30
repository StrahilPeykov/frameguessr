import { useState, useEffect } from 'react'
import { GameState, Guess, SearchResult } from '@/types'
import { gameStorage } from '@/lib/gameStorage'

interface UseGameStateOptions {
  initialDate: string
  maxAttempts?: number
}

export function useGameState({ initialDate, maxAttempts = 3 }: UseGameStateOptions) {
  const [gameState, setGameState] = useState<GameState>({
    currentDate: initialDate,
    attempts: 0,
    maxAttempts,
    guesses: [],
    completed: false,
    won: false,
    currentHintLevel: 1,
  })

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle')

  // Load game state on mount or date change
  useEffect(() => {
    const loadGameState = async () => {
      const savedState = await gameStorage.loadGameState(initialDate)
      if (savedState) {
        setGameState(savedState)
      } else {
        setGameState({
          currentDate: initialDate,
          attempts: 0,
          maxAttempts,
          guesses: [],
          completed: false,
          won: false,
          currentHintLevel: 1,
        })
      }
    }

    loadGameState()
  }, [initialDate, maxAttempts])

  // Save game state when it changes
  useEffect(() => {
    const saveGameState = async () => {
      if (gameState.attempts > 0 || gameState.completed) {
        setSyncStatus('syncing')
        try {
          await gameStorage.saveGameState(initialDate, gameState)
          setSyncStatus('synced')
          setTimeout(() => setSyncStatus('idle'), 2000)
        } catch (error) {
          console.error('Failed to save game state:', error)
          setSyncStatus('error')
          setTimeout(() => setSyncStatus('idle'), 3000)
        }
      }
    }

    saveGameState()
  }, [gameState, initialDate])

  const makeGuess = async (result: SearchResult, correctMovieId: number, correctMediaType: string) => {
    if (gameState.completed || gameState.attempts >= gameState.maxAttempts) {
      return
    }

    const isCorrect = correctMovieId === result.id && correctMediaType === result.mediaType

    const newGuess: Guess = {
      id: `${Date.now()}`,
      title: result.title,
      tmdbId: result.id,
      mediaType: result.mediaType,
      correct: isCorrect,
      timestamp: Date.now(),
    }

    const newAttempts = gameState.attempts + 1
    const newHintLevel = Math.min(newAttempts + 1, 3)

    const newGameState = {
      ...gameState,
      attempts: newAttempts,
      guesses: [...gameState.guesses, newGuess],
      completed: isCorrect || newAttempts >= gameState.maxAttempts,
      won: isCorrect,
      currentHintLevel: newHintLevel,
    }

    setGameState(newGameState)

    // Log guess to API
    try {
      await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          guess: newGuess, 
          gameState: newGameState
        }),
      })
    } catch (error) {
      console.error('Failed to log guess:', error)
    }

    return { isCorrect, newGameState }
  }

  const skipHint = () => {
    if (gameState.completed) {
      return
    }

    const newAttempts = gameState.attempts + 1
    const newHintLevel = Math.min(newAttempts + 1, 3)

    setGameState(prev => ({
      ...prev,
      attempts: newAttempts,
      currentHintLevel: newHintLevel,
      completed: newAttempts >= gameState.maxAttempts,
    }))
  }

  const resetGame = (date?: string) => {
    const targetDate = date || initialDate
    setGameState({
      currentDate: targetDate,
      attempts: 0,
      maxAttempts,
      guesses: [],
      completed: false,
      won: false,
      currentHintLevel: 1,
    })
  }

  return {
    gameState,
    syncStatus,
    makeGuess,
    skipHint,
    resetGame,
  }
}

export default useGameState