import { useState, useEffect } from 'react'
import { GameState, Guess, SearchResult, Attempt, getGameStatus, isWorthSaving } from '@/types'
import { validateGameState, getValidatedGameState } from '@/utils/gameStateValidation'
import { gameStorage } from '@/lib/gameStorage'
import { useAuth } from '@/hooks/useAuth'

interface UseGameStateOptions {
  initialDate: string
  maxAttempts?: number
}

export function useGameState({ initialDate, maxAttempts = 3 }: UseGameStateOptions) {
  const { isAuthenticated, syncDecision } = useAuth()
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
  const [isLoading, setIsLoading] = useState(true)

  // Load game state on mount, date change, OR auth state change
  useEffect(() => {
    const loadGameState = async () => {
      try {
        setIsLoading(true)
        console.log(`[GameState] Loading state for ${initialDate}, auth: ${isAuthenticated}`)
        
        const savedState = await gameStorage.loadGameState(initialDate)
        if (savedState) {
          // GameStorage already returns validated data, but ensure it matches our date
          const validatedState = getValidatedGameState({
            ...savedState,
            currentDate: initialDate, // Ensure date matches
          })
          
          console.log(`[GameState] Loaded validated state:`, validatedState)
          setGameState(validatedState)
        } else {
          // No saved state, start fresh
          console.log(`[GameState] No saved state, starting fresh`)
          const freshState = {
            currentDate: initialDate,
            attempts: 0,
            maxAttempts,
            allAttempts: [],
            guesses: [],
            completed: false,
            won: false,
            currentHintLevel: 1,
          }
          setGameState(freshState)
        }
      } catch (error) {
        console.error('Failed to load game state:', error)
        // Fall back to fresh state on error
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
      } finally {
        setIsLoading(false)
      }
    }

    loadGameState()
  }, [initialDate, maxAttempts, isAuthenticated, syncDecision])

  // Listen for data changes from GameStorage
  useEffect(() => {
    const handleDataChange = () => {
      console.log('[GameState] Data change event received, reloading...')
      // Reload the current game state
      const loadGameState = async () => {
        try {
          const savedState = await gameStorage.loadGameState(initialDate)
          if (savedState) {
            const validatedState = getValidatedGameState(savedState)
            setGameState(validatedState)
          } else {
            // Reset to fresh state if no data
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
        } catch (error) {
          console.error('Failed to reload game state after data change:', error)
        }
      }
      loadGameState()
    }

    // Listen for custom events from GameStorage
    window.addEventListener('game-data-changed', handleDataChange)
    window.addEventListener('auth-data-cleared', handleDataChange)
    
    return () => {
      window.removeEventListener('game-data-changed', handleDataChange)
      window.removeEventListener('auth-data-cleared', handleDataChange)
    }
  }, [initialDate, maxAttempts])

  // Save game state when it changes - intelligent sync strategy
  useEffect(() => {
    const saveGameState = async () => {
      // Skip saving during initial load
      if (isLoading) return
      
      // Only save if there's meaningful progress or completion
      if (!isWorthSaving(gameState)) {
        return
      }

      try {
        setSyncStatus('syncing')
        
        // Validate before saving (defensive programming)
        const validationResult = validateGameState(gameState)
        const stateToSave = validationResult.validatedState

        if (validationResult.wasFixed) {
          console.log(`[GameState] Fixed state before saving:`, validationResult.issues)
          // Update our local state with the fixed version
          setGameState(stateToSave)
        }

        await gameStorage.saveGameState(initialDate, stateToSave)
        
        // Show sync confirmation only for significant milestones
        if (gameState.completed && gameState.won) {
          setSyncStatus('synced')
          setTimeout(() => setSyncStatus('idle'), 2000)
        } else {
          // Silent success for routine saves
          setSyncStatus('idle')
        }
      } catch (error) {
        console.error('Failed to save game state:', error)
        setSyncStatus('error')
        setTimeout(() => setSyncStatus('idle'), 3000)
      }
    }

    saveGameState()
  }, [gameState, initialDate, isLoading])

  const makeGuess = async (result: SearchResult, correctMovieId: number, correctMediaType: string) => {
    if (gameState.completed || gameState.attempts >= gameState.maxAttempts) {
      return
    }

    const isCorrect = correctMovieId === result.id && correctMediaType === result.mediaType

    const newGuess: Guess = {
      id: `guess-${Date.now()}`,
      title: result.title,
      tmdbId: result.id,
      mediaType: result.mediaType,
      correct: isCorrect,
      timestamp: Date.now(),
    }

    const newAttempt: Attempt = {
      id: `attempt-${Date.now()}`,
      type: 'guess',
      correct: isCorrect,
      title: result.title,
      tmdbId: result.id,
      mediaType: result.mediaType,
      timestamp: Date.now(),
    }

    // Create new state with the guess/attempt
    const updatedState: GameState = {
      ...gameState,
      allAttempts: [...gameState.allAttempts, newAttempt],
      guesses: [...gameState.guesses, newGuess],
    }

    // Use centralized validation to determine the final state
    const validatedState = getValidatedGameState(updatedState)

    setGameState(validatedState)

    // Log guess to API for analytics (no UI feedback needed)
    try {
      await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          guess: newGuess, 
          gameState: validatedState
        }),
      })
    } catch (error) {
      console.warn('Failed to log guess to API:', error)
      // Don't show error to user for analytics failure
    }

    return { isCorrect, newGameState: validatedState }
  }

  const skipHint = () => {
    if (gameState.completed || gameState.attempts >= gameState.maxAttempts) {
      return
    }

    const skipAttempt: Attempt = {
      id: `skip-${Date.now()}`,
      type: 'skip',
      correct: false,
      timestamp: Date.now(),
    }

    // Create new state with the skip attempt
    const updatedState: GameState = {
      ...gameState,
      allAttempts: [...gameState.allAttempts, skipAttempt],
    }

    // Use centralized validation to determine the final state
    const validatedState = getValidatedGameState(updatedState)

    setGameState(validatedState)
  }

  const resetGame = (date?: string) => {
    const targetDate = date || initialDate
    const freshState: GameState = {
      currentDate: targetDate,
      attempts: 0,
      maxAttempts,
      allAttempts: [],
      guesses: [],
      completed: false,
      won: false,
      currentHintLevel: 1,
    }
    
    setGameState(freshState)
    setSyncStatus('idle')
  }

  // Get current game status
  const getCurrentGameStatus = () => {
    return getGameStatus(gameState)
  }

  // Check if the current game is in progress
  const isGameInProgress = () => {
    return getCurrentGameStatus() === 'in-progress'
  }

  // Get summary of current game
  const getGameSummary = () => {
    const status = getCurrentGameStatus()
    return {
      status,
      isInProgress: status === 'in-progress',
      hasGuesses: gameState.guesses.length > 0,
      remainingAttempts: gameState.maxAttempts - gameState.attempts,
      currentScene: gameState.currentHintLevel,
      lastGuess: gameState.guesses[gameState.guesses.length - 1] || null,
      canContinue: !gameState.completed && gameState.attempts < gameState.maxAttempts,
    }
  }

  return {
    gameState,
    syncStatus,
    isLoading,
    makeGuess,
    skipHint,
    resetGame,
    getCurrentGameStatus,
    isGameInProgress,
    getGameSummary,
  }
}