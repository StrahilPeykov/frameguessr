// Single source of truth for game state validation

import { GameState, Attempt } from '@/types'

export interface ValidationResult {
  isValid: boolean
  wasFixed: boolean
  validatedState: GameState
  issues: string[]
}

/**
 * Centralized game state validation utility
 * This is the SINGLE source of truth for game state validation
 * Used by both storage layer and game logic
 */
export function validateGameState(state: GameState): ValidationResult {
  if (!state) {
    return {
      isValid: false,
      wasFixed: false,
      validatedState: state,
      issues: ['Game state is null or undefined']
    }
  }

  const issues: string[] = []
  let wasFixed = false
  
  // Start with the input state
  let validatedState = { ...state }

  // 1. Ensure allAttempts exists and is consistent with guesses
  let allAttempts = validatedState.allAttempts || []
  if (allAttempts.length === 0 && validatedState.guesses && validatedState.guesses.length > 0) {
    // Migrate from old format
    allAttempts = validatedState.guesses.map(guess => ({
      id: guess.id,
      type: 'guess' as const,
      correct: guess.correct,
      title: guess.title,
      tmdbId: guess.tmdbId,
      mediaType: guess.mediaType,
      timestamp: guess.timestamp,
    }))
    validatedState.allAttempts = allAttempts
    issues.push('Migrated guesses to allAttempts format')
    wasFixed = true
  }

  // 2. Calculate the actual attempt count
  const actualAttempts = Math.max(
    validatedState.attempts || 0,
    allAttempts.length
  )

  if (validatedState.attempts !== actualAttempts) {
    validatedState.attempts = actualAttempts
    issues.push(`Fixed attempt count: ${state.attempts} → ${actualAttempts}`)
    wasFixed = true
  }

  // 3. Determine if there's a winning guess
  const hasWinningGuess = allAttempts.some(attempt => 
    attempt.type === 'guess' && attempt.correct
  )

  if (validatedState.won !== hasWinningGuess) {
    validatedState.won = hasWinningGuess
    issues.push(`Fixed won status: ${state.won} → ${hasWinningGuess}`)
    wasFixed = true
  }

  // 4. Determine completion status
  // Game is completed if: player won OR used all attempts
  const maxAttempts = validatedState.maxAttempts || 3
  const shouldBeCompleted = hasWinningGuess || actualAttempts >= maxAttempts

  if (validatedState.completed !== shouldBeCompleted) {
    validatedState.completed = shouldBeCompleted
    issues.push(`Fixed completion status: ${state.completed} → ${shouldBeCompleted}`)
    wasFixed = true
  }

  // 5. Calculate appropriate hint level
  let correctHintLevel: number
  if (shouldBeCompleted) {
    // For completed games, keep the current hint level as-is
    // (represents the level they were on when they finished)
    correctHintLevel = validatedState.currentHintLevel || Math.min(actualAttempts + 1, 3)
  } else {
    // For in-progress games, hint level should be attempts + 1 (capped at 3)
    correctHintLevel = Math.min(actualAttempts + 1, 3)
  }

  if (validatedState.currentHintLevel !== correctHintLevel) {
    validatedState.currentHintLevel = correctHintLevel
    issues.push(`Fixed hint level: ${state.currentHintLevel} → ${correctHintLevel}`)
    wasFixed = true
  }

  // 6. Ensure maxAttempts is set
  if (!validatedState.maxAttempts) {
    validatedState.maxAttempts = 3
    issues.push('Set default maxAttempts to 3')
    wasFixed = true
  }

  return {
    isValid: issues.length === 0,
    wasFixed,
    validatedState,
    issues
  }
}

/**
 * Quick validation check without returning full details
 */
export function isGameStateValid(state: GameState): boolean {
  return validateGameState(state).isValid
}

/**
 * Validate and return only the validated state
 * Use this when you just need the clean state
 */
export function getValidatedGameState(state: GameState): GameState {
  return validateGameState(state).validatedState
}

/**
 * Check if two game states are logically equivalent
 * (ignoring minor differences like timestamp precision)
 */
export function areGameStatesEquivalent(state1: GameState, state2: GameState): boolean {
  if (!state1 || !state2) return state1 === state2

  const validated1 = getValidatedGameState(state1)
  const validated2 = getValidatedGameState(state2)

  return (
    validated1.attempts === validated2.attempts &&
    validated1.completed === validated2.completed &&
    validated1.won === validated2.won &&
    validated1.currentHintLevel === validated2.currentHintLevel &&
    validated1.guesses.length === validated2.guesses.length
  )
}