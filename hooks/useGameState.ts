// hooks/useGameState.ts - Updated to reduce sync notifications
import { useState, useEffect } from 'react'
import { GameState, Guess, SearchResult, Attempt } from '@/types'
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
    allAttempts: [],
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
        // Handle backward compatibility
        const modernState: GameState = {
          ...savedState,
          allAttempts: savedState.allAttempts || savedState.guesses.map(guess => ({
            id: guess.id,
            type: 'guess' as const,
            correct: guess.correct,
            title: guess.title,
            tmdbId: guess.tmdbId,
            mediaType: guess.mediaType,
            timestamp: guess.timestamp,
          }))
        }
        setGameState(modernState)
      } else {
        setGameState({
          currentDate: initialDate,
          attempts: 0,
          maxAttempts,
          allAttempts: [],
          guesses: [],
          completed: false,
          won: false,
          currentHintLevel: 1,
        })
      }
    }

    loadGameState()
  }, [initialDate, maxAttempts])

  // Save game state when it changes - silent saves only
  useEffect(() => {
    const saveGameState = async () => {
      if (gameState.attempts > 0 || gameState.completed) {
        try {
          await gameStorage.saveGameState(initialDate, gameState)
          // No UI feedback for saves - they should be silent
        } catch (error) {
          console.error('Failed to save game state:', error)
          // Only show errors that actually matter
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

    const newAttempt: Attempt = {
      id: `${Date.now()}`,
      type: 'guess',
      correct: isCorrect,
      title: result.title,
      tmdbId: result.id,
      mediaType: result.mediaType,
      timestamp: Date.now(),
    }

    const newAttempts = gameState.attempts + 1
    const newHintLevel = isCorrect 
      ? gameState.currentHintLevel
      : Math.min(newAttempts + 1, 3)

    const newGameState = {
      ...gameState,
      attempts: newAttempts,
      allAttempts: [...gameState.allAttempts, newAttempt],
      guesses: [...gameState.guesses, newGuess],
      completed: isCorrect || newAttempts >= gameState.maxAttempts,
      won: isCorrect,
      currentHintLevel: newHintLevel,
    }

    setGameState(newGameState)

    // Show brief sync confirmation only for actual wins
    if (isCorrect) {
      setSyncStatus('synced')
      setTimeout(() => setSyncStatus('idle'), 1500)
    }

    // Log guess to API (no UI feedback needed)
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

    const skipAttempt: Attempt = {
      id: `skip-${Date.now()}`,
      type: 'skip',
      correct: false,
      timestamp: Date.now(),
    }

    setGameState(prev => ({
      ...prev,
      attempts: newAttempts,
      allAttempts: [...prev.allAttempts, skipAttempt],
      currentHintLevel: newHintLevel,
      completed: newAttempts >= prev.maxAttempts,
      won: false,
    }))
  }

  const resetGame = (date?: string) => {
    const targetDate = date || initialDate
    setGameState({
      currentDate: targetDate,
      attempts: 0,
      maxAttempts,
      allAttempts: [],
      guesses: [],
      completed: false,
      won: false,
      currentHintLevel: 1,
    })
    setSyncStatus('idle')
  }

  return {
    gameState,
    syncStatus,
    makeGuess,
    skipHint,
    resetGame,
  }
}