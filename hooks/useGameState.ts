import { useState, useEffect, useRef } from 'react'
import { GameState, Guess, SearchResult } from '@/types'
import { 
  getValidatedGameState,
  createDefaultGameState,
  createStateAfterGuess,
  createStateAfterSkip,
  getGameStatus,
  isWorthSaving,
  isGameCompleted,
  hasProgress
} from '@/utils/gameStateValidation'
import { gameStorage } from '@/lib/gameStorage'
import { useAuth } from '@/hooks/useAuth'

interface UseGameStateOptions {
  initialDate: string
  maxAttempts?: number
}

export function useGameState({ initialDate, maxAttempts = 3 }: UseGameStateOptions) {
  const { isAuthenticated } = useAuth()
  const [gameState, setGameState] = useState<GameState>(() => 
    createDefaultGameState(initialDate, maxAttempts)
  )
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle')
  const [isLoading, setIsLoading] = useState(true)

  // Keep a ref to the latest game state so event handlers can compare
  const gameStateRef = useRef<GameState>(gameState)
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  // Load game state on mount, date change, OR auth state change
  useEffect(() => {
    const loadGameState = async () => {
      try {
        setIsLoading(true)
        console.log(`[GameState] Loading state for ${initialDate}, auth: ${isAuthenticated}`)
        
        const savedState = await gameStorage.loadGameState(initialDate)
        if (savedState) {
          // GameStorage already returns validated data
          const validatedState = getValidatedGameState({
            ...savedState,
            currentDate: initialDate, // Ensure date matches
            maxAttempts // Ensure maxAttempts is set
          })
          
          console.log(`[GameState] Loaded validated state:`, validatedState)
          setGameState(validatedState)
        } else {
          // No saved state, start fresh
          console.log(`[GameState] No saved state, starting fresh`)
          setGameState(createDefaultGameState(initialDate, maxAttempts))
        }
      } catch (error) {
        console.error('Failed to load game state:', error)
        // Fall back to fresh state on error
        setGameState(createDefaultGameState(initialDate, maxAttempts))
      } finally {
        setIsLoading(false)
      }
    }

    loadGameState()
  }, [initialDate, maxAttempts, isAuthenticated])

  // Listen for data changes from GameStorage
  useEffect(() => {
    const handleDataChange = (event: CustomEvent) => {
      const { date, state } = event.detail || {}
      if (date === initialDate) {
        // If the incoming state matches the current one, ignore to prevent loops
        if (state && JSON.stringify(state) === JSON.stringify(gameStateRef.current)) {
          return
        }

        console.log('[GameState] Data change event received for current date, reloading...')
        // Reload the current game state
        const loadGameState = async () => {
          try {
            const savedState = await gameStorage.loadGameState(initialDate)
            if (savedState) {
              const validatedState = getValidatedGameState({
                ...savedState,
                maxAttempts
              })
              setGameState(validatedState)
            } else {
              // Reset to fresh state if no data
              setGameState(createDefaultGameState(initialDate, maxAttempts))
            }
          } catch (error) {
            console.error('Failed to reload game state after data change:', error)
          }
        }
        loadGameState()
      }
    }

    const handleDataCleared = () => {
      console.log('[GameState] Data cleared event received, resetting...')
      setGameState(createDefaultGameState(initialDate, maxAttempts))
    }

    // Listen for custom events from GameStorage
    window.addEventListener('game-data-changed', handleDataChange as EventListener)
    window.addEventListener('auth-data-cleared', handleDataCleared)
    window.addEventListener('game-data-imported', handleDataChange as EventListener)
    
    return () => {
      window.removeEventListener('game-data-changed', handleDataChange as EventListener)
      window.removeEventListener('auth-data-cleared', handleDataCleared)
      window.removeEventListener('game-data-imported', handleDataChange as EventListener)
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
        
        // GameStorage will handle validation internally
        await gameStorage.saveGameState(initialDate, gameState)
        
        // Show sync confirmation only for significant milestones
        if (isGameCompleted(gameState) && gameState.won) {
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

    // Use validation utility to create new state
    const newGameState = createStateAfterGuess(gameState, newGuess, isCorrect)
    setGameState(newGameState)

    // Log guess to API for analytics (no UI feedback needed)
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
      console.warn('Failed to log guess to API:', error)
      // Don't show error to user for analytics failure
    }

    return { isCorrect, newGameState }
  }

  const skipHint = () => {
    if (gameState.completed || gameState.attempts >= gameState.maxAttempts) {
      return
    }

    // Use validation utility to create new state
    const newGameState = createStateAfterSkip(gameState)
    setGameState(newGameState)
  }

  const resetGame = (date?: string) => {
    const targetDate = date || initialDate
    setGameState(createDefaultGameState(targetDate, maxAttempts))
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