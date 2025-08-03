// Single source of truth for ALL game state validation and status checking

import { GameState, Attempt, Guess, GameStatus } from '@/types'

export interface ValidationResult {
  isValid: boolean
  wasFixed: boolean
  validatedState: GameState
  issues: string[]
}

export interface ValidationOptions {
  strict?: boolean // If true, throw on invalid state instead of fixing
  logIssues?: boolean // If true, console.log validation issues
}

/**
 * Centralized game state validation utility
 * This is the SINGLE source of truth for game state validation
 * Used by storage layer, game logic, and UI components
 */
export function validateGameState(
  state: GameState | null, 
  options: ValidationOptions = {}
): ValidationResult {
  const { strict = false, logIssues = false } = options
  
  if (!state) {
    const result = {
      isValid: false,
      wasFixed: false,
      validatedState: createDefaultGameState(),
      issues: ['Game state is null or undefined']
    }
    
    if (strict) {
      throw new Error('Invalid game state: ' + result.issues.join(', '))
    }
    
    return result
  }

  const issues: string[] = []
  let wasFixed = false
  
  // Deep clone to avoid mutations
  let validatedState = JSON.parse(JSON.stringify(state)) as GameState

  // 1. Ensure required fields exist
  if (!validatedState.currentDate) {
    issues.push('Missing currentDate')
    validatedState.currentDate = new Date().toISOString().split('T')[0]
    wasFixed = true
  }

  // 2. Ensure arrays exist
  if (!Array.isArray(validatedState.guesses)) {
    issues.push('Missing or invalid guesses array')
    validatedState.guesses = []
    wasFixed = true
  }

  if (!Array.isArray(validatedState.allAttempts)) {
    // Migrate from old format
    if (validatedState.guesses.length > 0) {
      validatedState.allAttempts = validatedState.guesses.map(guess => ({
        id: guess.id,
        type: 'guess' as const,
        correct: guess.correct,
        title: guess.title,
        tmdbId: guess.tmdbId,
        mediaType: guess.mediaType,
        timestamp: guess.timestamp,
      }))
      issues.push('Migrated guesses to allAttempts format')
      wasFixed = true
    } else {
      validatedState.allAttempts = []
      wasFixed = true
    }
  }

  // 3. Validate and fix maxAttempts
  if (!validatedState.maxAttempts || validatedState.maxAttempts < 1) {
    validatedState.maxAttempts = 3
    issues.push('Set default maxAttempts to 3')
    wasFixed = true
  }

  // 4. Calculate actual attempts from all sources
  const actualAttempts = calculateActualAttempts(validatedState)
  
  if (validatedState.attempts !== actualAttempts) {
    issues.push(`Fixed attempt count: ${validatedState.attempts} → ${actualAttempts}`)
    validatedState.attempts = actualAttempts
    wasFixed = true
  }

  // 5. Determine winning status
  const hasWinningGuess = checkForWinningGuess(validatedState)
  
  if (validatedState.won !== hasWinningGuess) {
    issues.push(`Fixed won status: ${validatedState.won} → ${hasWinningGuess}`)
    validatedState.won = hasWinningGuess
    wasFixed = true
  }

  // 6. Determine completion status
  const shouldBeCompleted = hasWinningGuess || actualAttempts >= validatedState.maxAttempts
  
  if (validatedState.completed !== shouldBeCompleted) {
    issues.push(`Fixed completion status: ${validatedState.completed} → ${shouldBeCompleted}`)
    validatedState.completed = shouldBeCompleted
    wasFixed = true
  }

  // 7. Validate and fix hint level
  const correctHintLevel = calculateCorrectHintLevel(validatedState, shouldBeCompleted, actualAttempts)
  
  if (validatedState.currentHintLevel !== correctHintLevel) {
    issues.push(`Fixed hint level: ${validatedState.currentHintLevel} → ${correctHintLevel}`)
    validatedState.currentHintLevel = correctHintLevel
    wasFixed = true
  }

  // 8. Ensure consistency between guesses and allAttempts
  const { consistent, fixedGuesses } = ensureGuessConsistency(validatedState)
  if (!consistent) {
    validatedState.guesses = fixedGuesses
    issues.push('Fixed inconsistency between guesses and allAttempts')
    wasFixed = true
  }

  // 9. Validate attempt types and structure
  const validatedAttempts = validateAttempts(validatedState.allAttempts)
  if (validatedAttempts.wasFixed) {
    validatedState.allAttempts = validatedAttempts.attempts
    issues.push(...validatedAttempts.issues)
    wasFixed = true
  }

  // Log issues if requested
  if (logIssues && issues.length > 0) {
    console.log(`[Validation] Fixed ${issues.length} issues in game state for ${validatedState.currentDate}:`, issues)
  }

  // Throw in strict mode if validation failed
  if (strict && issues.length > 0) {
    throw new Error(`Game state validation failed: ${issues.join(', ')}`)
  }

  return {
    isValid: issues.length === 0,
    wasFixed,
    validatedState,
    issues
  }
}

/**
 * Calculate actual attempt count from all sources
 */
function calculateActualAttempts(state: GameState): number {
  // Count from allAttempts (preferred source)
  const allAttemptsCount = state.allAttempts?.length || 0
  
  // Count from guesses (fallback for old data)
  const guessesCount = state.guesses?.length || 0
  
  // Use the stored attempts value as another reference
  const storedAttempts = state.attempts || 0
  
  // Return the maximum to ensure we don't lose data
  return Math.max(allAttemptsCount, guessesCount, storedAttempts)
}

/**
 * Check if there's a winning guess in the game state
 */
function checkForWinningGuess(state: GameState): boolean {
  // Check allAttempts first (preferred)
  const hasWinningAttempt = state.allAttempts?.some(attempt => 
    attempt.type === 'guess' && attempt.correct === true
  ) || false
  
  // Also check guesses array for backwards compatibility
  const hasWinningGuess = state.guesses?.some(guess => 
    guess.correct === true
  ) || false
  
  // Also respect the stored won value if true (trust previous validation)
  return hasWinningAttempt || hasWinningGuess || state.won === true
}

/**
 * Calculate the correct hint level based on game state
 */
function calculateCorrectHintLevel(
  state: GameState, 
  isCompleted: boolean, 
  attemptCount: number
): number {
  if (isCompleted) {
    // For completed games, preserve the hint level they finished on
    // But ensure it's at least the minimum based on attempts
    const minLevel = Math.min(attemptCount + 1, 3)
    return Math.max(state.currentHintLevel || minLevel, minLevel)
  } else {
    // For in-progress games, hint level = attempts + 1 (capped at 3)
    return Math.max(1, Math.min(attemptCount + 1, 3))
  }
}

/**
 * Ensure consistency between guesses array and allAttempts
 */
function ensureGuessConsistency(state: GameState): {
  consistent: boolean
  fixedGuesses: Guess[]
} {
  // Extract guesses from allAttempts
  const guessesFromAttempts = state.allAttempts
    .filter(attempt => attempt.type === 'guess')
    .map(attempt => ({
      id: attempt.id,
      title: attempt.title!,
      tmdbId: attempt.tmdbId!,
      mediaType: attempt.mediaType!,
      correct: attempt.correct!,
      timestamp: attempt.timestamp
    }))
  
  // Check if they match
  const consistent = JSON.stringify(state.guesses) === JSON.stringify(guessesFromAttempts)
  
  return {
    consistent,
    fixedGuesses: consistent ? state.guesses : guessesFromAttempts
  }
}

/**
 * Validate attempts array structure and content
 */
function validateAttempts(attempts: Attempt[]): {
  wasFixed: boolean
  attempts: Attempt[]
  issues: string[]
} {
  const issues: string[] = []
  let wasFixed = false
  
  const validatedAttempts = attempts.map((attempt, index) => {
    const validatedAttempt = { ...attempt }
    
    // Ensure required fields
    if (!validatedAttempt.id) {
      validatedAttempt.id = `attempt-${Date.now()}-${index}`
      issues.push(`Generated missing ID for attempt ${index}`)
      wasFixed = true
    }
    
    if (!validatedAttempt.type || !['guess', 'skip'].includes(validatedAttempt.type)) {
      validatedAttempt.type = 'guess' // Default to guess
      issues.push(`Fixed invalid type for attempt ${index}`)
      wasFixed = true
    }
    
    if (!validatedAttempt.timestamp) {
      validatedAttempt.timestamp = Date.now()
      issues.push(`Added missing timestamp for attempt ${index}`)
      wasFixed = true
    }
    
    // Validate guess-specific fields
    if (validatedAttempt.type === 'guess') {
      if (typeof validatedAttempt.correct !== 'boolean') {
        validatedAttempt.correct = false
        issues.push(`Fixed missing correct flag for guess ${index}`)
        wasFixed = true
      }
    }
    
    return validatedAttempt
  })
  
  return { wasFixed, attempts: validatedAttempts, issues }
}

/**
 * Create a default game state for a given date
 */
export function createDefaultGameState(date?: string, maxAttempts: number = 3): GameState {
  return {
    currentDate: date || new Date().toISOString().split('T')[0],
    attempts: 0,
    maxAttempts: maxAttempts,
    guesses: [],
    allAttempts: [],
    completed: false,
    won: false,
    currentHintLevel: 1
  }
}

/**
 * Quick validation check without returning full details
 */
export function isGameStateValid(state: GameState | null): boolean {
  if (!state) return false
  return validateGameState(state).isValid
}

/**
 * Validate and return only the validated state
 * Use this when you just need the clean state
 */
export function getValidatedGameState(state: GameState | null): GameState {
  return validateGameState(state).validatedState
}

/**
 * Check if two game states are logically equivalent
 */
export function areGameStatesEquivalent(state1: GameState | null, state2: GameState | null): boolean {
  if (!state1 || !state2) return state1 === state2

  const validated1 = getValidatedGameState(state1)
  const validated2 = getValidatedGameState(state2)

  return (
    validated1.currentDate === validated2.currentDate &&
    validated1.attempts === validated2.attempts &&
    validated1.completed === validated2.completed &&
    validated1.won === validated2.won &&
    validated1.currentHintLevel === validated2.currentHintLevel &&
    validated1.guesses.length === validated2.guesses.length &&
    JSON.stringify(validated1.allAttempts) === JSON.stringify(validated2.allAttempts)
  )
}

/**
 * Game status helpers - moved here from types/index.ts
 */
export function getGameStatus(gameState: GameState | null): GameStatus {
  if (!gameState) return 'unplayed'
  
  const validated = getValidatedGameState(gameState)
  
  if (validated.attempts === 0) return 'unplayed'
  if (validated.won) return 'completed-won'
  if (validated.completed) return 'completed-lost'
  
  return 'in-progress'
}

export function hasProgress(gameState: GameState | null): boolean {
  if (!gameState) return false
  const validated = getValidatedGameState(gameState)
  return validated.attempts > 0
}

export function isWorthSaving(gameState: GameState | null): boolean {
  return hasProgress(gameState)
}

export function isGameCompleted(gameState: GameState | null): boolean {
  if (!gameState) return false
  const validated = getValidatedGameState(gameState)
  return validated.completed
}

export function isGameWon(gameState: GameState | null): boolean {
  if (!gameState) return false
  const validated = getValidatedGameState(gameState)
  return validated.won
}

export function getAttemptCount(gameState: GameState | null): number {
  if (!gameState) return 0
  const validated = getValidatedGameState(gameState)
  return validated.attempts
}

/**
 * Create a new game state after a guess
 */
export function createStateAfterGuess(
  currentState: GameState,
  guess: Guess,
  isCorrect: boolean
): GameState {
  const newAttempt: Attempt = {
    id: `attempt-${Date.now()}`,
    type: 'guess',
    correct: isCorrect,
    title: guess.title,
    tmdbId: guess.tmdbId,
    mediaType: guess.mediaType,
    timestamp: Date.now()
  }
  
  const updatedState: GameState = {
    ...currentState,
    allAttempts: [...currentState.allAttempts, newAttempt],
    guesses: [...currentState.guesses, guess]
  }
  
  // Validate and return the new state
  return getValidatedGameState(updatedState)
}

/**
 * Create a new game state after skipping
 */
export function createStateAfterSkip(currentState: GameState): GameState {
  const skipAttempt: Attempt = {
    id: `skip-${Date.now()}`,
    type: 'skip',
    correct: false,
    timestamp: Date.now()
  }
  
  const updatedState: GameState = {
    ...currentState,
    allAttempts: [...currentState.allAttempts, skipAttempt]
  }
  
  // Validate and return the new state
  return getValidatedGameState(updatedState)
}

/**
 * Merge two game states intelligently
 */
export function mergeGameStates(
  localState: GameState | null,
  cloudState: GameState | null
): GameState {
  if (!localState) return cloudState ? getValidatedGameState(cloudState) : createDefaultGameState()
  if (!cloudState) return getValidatedGameState(localState)
  
  const validatedLocal = getValidatedGameState(localState)
  const validatedCloud = getValidatedGameState(cloudState)
  
  // If one is completed and won, prefer that
  if (validatedLocal.won && !validatedCloud.won) return validatedLocal
  if (validatedCloud.won && !validatedLocal.won) return validatedCloud
  
  // If one has more progress, prefer that
  if (validatedLocal.attempts > validatedCloud.attempts) return validatedLocal
  if (validatedCloud.attempts > validatedLocal.attempts) return validatedCloud
  
  // If same progress, prefer the one with higher hint level
  if (validatedLocal.currentHintLevel > validatedCloud.currentHintLevel) return validatedLocal
  if (validatedCloud.currentHintLevel > validatedLocal.currentHintLevel) return validatedCloud
  
  // Default to cloud if everything else is equal
  return validatedCloud
}

/**
 * Check if a game state represents meaningful progress
 */
export function hasMeaningfulProgress(gameState: GameState | null): boolean {
  if (!hasProgress(gameState)) return false
  
  const validated = getValidatedGameState(gameState)
  
  // Has meaningful progress if:
  // 1. Game is completed
  // 2. Has made actual guesses (not just skips)
  // 3. Has reached at least hint level 2
  return (
    validated.completed ||
    validated.guesses.length > 0 ||
    validated.currentHintLevel >= 2
  )
}

/**
 * Export all validation utilities
 */
export const GameValidation = {
  validate: validateGameState,
  isValid: isGameStateValid,
  getValidated: getValidatedGameState,
  areEquivalent: areGameStatesEquivalent,
  createDefault: createDefaultGameState,
  getStatus: getGameStatus,
  hasProgress,
  isWorthSaving,
  isCompleted: isGameCompleted,
  isWon: isGameWon,
  getAttempts: getAttemptCount,
  afterGuess: createStateAfterGuess,
  afterSkip: createStateAfterSkip,
  merge: mergeGameStates,
  hasMeaningfulProgress
}