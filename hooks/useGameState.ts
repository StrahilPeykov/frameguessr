import { useState, useEffect } from 'react'
import { GameState, Guess, SearchResult, Attempt, getGameStatus, isWorthSaving } from '@/types'
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
          // Handle backward compatibility and ensure data integrity
          const modernState: GameState = {
            ...savedState,
            currentDate: initialDate, // Ensure date matches
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
          
          // Validate and fix the loaded state
          const validatedState = validateAndFixGameState(modernState)
          console.log(`[GameState] Loaded and validated state:`, validatedState)
          setGameState(validatedState)
          
          // If we fixed the state, save it back to storage
          if (stateWasFixed(savedState, validatedState)) {
            console.log(`[GameState] State was fixed, saving back to storage`)
            try {
              await gameStorage.saveGameState(initialDate, validatedState)
            } catch (error) {
              console.warn('Failed to save fixed state:', error)
            }
          }
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
  }, [initialDate, maxAttempts, isAuthenticated, syncDecision]) // Added auth dependencies

  // Listen for data changes from GameStorage
  useEffect(() => {
    const handleDataChange = () => {
      console.log('[GameState] Data change event received, reloading...')
      // Reload the current game state
      const loadGameState = async () => {
        try {
          const savedState = await gameStorage.loadGameState(initialDate)
          if (savedState) {
            const validatedState = validateAndFixGameState(savedState)
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
        await gameStorage.saveGameState(initialDate, gameState)
        
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

  // Enhanced validation that fixes old data issues
  const validateAndFixGameState = (state: GameState): GameState => {
    // Ensure allAttempts exists and is populated from guesses if needed
    let allAttempts = state.allAttempts || []
    if (allAttempts.length === 0 && state.guesses.length > 0) {
      // Migrate from old format
      allAttempts = state.guesses.map(guess => ({
        id: guess.id,
        type: 'guess' as const,
        correct: guess.correct,
        title: guess.title,
        tmdbId: guess.tmdbId,
        mediaType: guess.mediaType,
        timestamp: guess.timestamp,
      }))
    }

    // Calculate actual state based on attempts
    const actualAttempts = allAttempts.length
    const hasWinningGuess = allAttempts.some(attempt => 
      attempt.type === 'guess' && attempt.correct
    )
    
    // CRITICAL FIX: Game should be completed if we have max attempts OR a winning guess
    const shouldBeCompleted = hasWinningGuess || actualAttempts >= state.maxAttempts
    
    // Calculate hint level - if won, keep current level, otherwise progress based on attempts
    let currentHintLevel = state.currentHintLevel || 1
    if (!hasWinningGuess && !shouldBeCompleted) {
      // Only update hint level if game is still in progress
      currentHintLevel = Math.min(actualAttempts + 1, 3)
    }
    // If game is completed (won or lost), keep the hint level as-is

    const fixedState: GameState = {
      ...state,
      allAttempts,
      attempts: actualAttempts,
      currentHintLevel,
      completed: shouldBeCompleted,
      won: hasWinningGuess,
    }

    // Log if we made significant fixes
    if (state.completed !== shouldBeCompleted) {
      console.log(`[GameState] Fixed completion status: ${state.completed} -> ${shouldBeCompleted} (attempts: ${actualAttempts}/${state.maxAttempts})`)
    }

    return fixedState
  }

  // Check if the state was significantly changed during validation
  const stateWasFixed = (original: GameState, fixed: GameState): boolean => {
    return original.completed !== fixed.completed || 
           original.won !== fixed.won ||
           original.attempts !== fixed.attempts ||
           (original.allAttempts?.length || 0) !== fixed.allAttempts.length
  }

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

    const newAttempts = gameState.attempts + 1
    const newHintLevel = isCorrect 
      ? gameState.currentHintLevel // Keep current level if won
      : Math.min(newAttempts + 1, 3)

    const newGameState: GameState = {
      ...gameState,
      attempts: newAttempts,
      allAttempts: [...gameState.allAttempts, newAttempt],
      guesses: [...gameState.guesses, newGuess],
      completed: isCorrect || newAttempts >= gameState.maxAttempts,
      won: isCorrect,
      currentHintLevel: newHintLevel,
    }

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

    const newAttempts = gameState.attempts + 1
    const newHintLevel = Math.min(newAttempts + 1, 3)

    const skipAttempt: Attempt = {
      id: `skip-${Date.now()}`,
      type: 'skip',
      correct: false,
      timestamp: Date.now(),
    }

    const newGameState: GameState = {
      ...gameState,
      attempts: newAttempts,
      allAttempts: [...gameState.allAttempts, skipAttempt],
      currentHintLevel: newHintLevel,
      completed: newAttempts >= gameState.maxAttempts,
      won: false,
    }

    setGameState(newGameState)
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