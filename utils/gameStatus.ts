// utils/gameStatus.ts - Utilities for managing game status and states
import { GameState } from '@/types'
import { gameStorage } from '@/lib/gameStorage'

export type GameStatus = 'unplayed' | 'partial' | 'completed'
export type CompletionStatus = 'won' | 'lost' | 'incomplete'

export interface GameStatusInfo {
  status: GameStatus
  completion: CompletionStatus
  attempts: number
  canResume: boolean
  displayText: string
  displayColor: string
  icon: 'play' | 'clock' | 'trophy' | 'x'
}

/**
 * Get comprehensive game status information
 */
export function getGameStatusInfo(gameState: GameState | null): GameStatusInfo {
  if (!gameState || gameState.attempts === 0) {
    return {
      status: 'unplayed',
      completion: 'incomplete',
      attempts: 0,
      canResume: false,
      displayText: 'Not started',
      displayColor: 'text-stone-500 dark:text-stone-400',
      icon: 'play'
    }
  }

  if (gameState.completed) {
    if (gameState.won) {
      return {
        status: 'completed',
        completion: 'won',
        attempts: gameState.attempts,
        canResume: false,
        displayText: `Won in ${gameState.attempts}`,
        displayColor: 'text-green-600 dark:text-green-400',
        icon: 'trophy'
      }
    } else {
      return {
        status: 'completed',
        completion: 'lost',
        attempts: gameState.attempts,
        canResume: false,
        displayText: 'Lost',
        displayColor: 'text-red-600 dark:text-red-400',
        icon: 'x'
      }
    }
  }

  // Game is in progress (partial)
  return {
    status: 'partial',
    completion: 'incomplete',
    attempts: gameState.attempts,
    canResume: true,
    displayText: `${gameState.attempts} attempt${gameState.attempts !== 1 ? 's' : ''}`,
    displayColor: 'text-amber-600 dark:text-amber-400',
    icon: 'clock'
  }
}

/**
 * Get game status for a specific date
 */
export async function getGameStatusForDate(date: string): Promise<GameStatusInfo> {
  const gameState = await gameStorage.loadGameState(date)
  return getGameStatusInfo(gameState)
}

/**
 * Check if a game can be resumed
 */
export function canResumeGame(gameState: GameState | null): boolean {
  return !!(gameState && !gameState.completed && gameState.attempts > 0)
}

/**
 * Get resumption message for partial games
 */
export function getResumptionMessage(gameState: GameState): string {
  if (!canResumeGame(gameState)) {
    return ''
  }

  const scenesRemaining = 3 - gameState.currentHintLevel + 1
  const attemptsRemaining = gameState.maxAttempts - gameState.attempts

  if (attemptsRemaining === 0) {
    return 'Last chance! View the final clues to make your guess.'
  }

  return `Continue from scene ${gameState.currentHintLevel}. ${attemptsRemaining} ${attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining.`
}

/**
 * Get progress percentage for a game
 */
export function getGameProgress(gameState: GameState | null): number {
  if (!gameState) return 0
  
  if (gameState.completed) return 100
  
  // Base progress on hint level and attempts
  const hintProgress = ((gameState.currentHintLevel - 1) / 2) * 60 // 60% for reaching final hint
  const attemptProgress = (gameState.attempts / gameState.maxAttempts) * 40 // 40% for making attempts
  
  return Math.min(hintProgress + attemptProgress, 95) // Cap at 95% for incomplete games
}

/**
 * Determine if game data should be imported based on game status
 */
export function shouldImportGameData(localState: GameState, accountState?: GameState): boolean {
  if (!accountState) {
    // No account data exists - import if there's progress
    return localState.attempts > 0
  }

  const localInfo = getGameStatusInfo(localState)
  const accountInfo = getGameStatusInfo(accountState)

  // Import if local is completed but account isn't
  if (localInfo.completion === 'won' && accountInfo.completion !== 'won') {
    return true
  }

  // Import if local has more progress
  if (localInfo.attempts > accountInfo.attempts) {
    return true
  }

  // Import if both partial but local is further ahead
  if (localInfo.status === 'partial' && accountInfo.status === 'partial') {
    return localState.currentHintLevel > (accountState.currentHintLevel || 1)
  }

  return false
}

/**
 * Format game state for display in UI
 */
export function formatGameStateForDisplay(gameState: GameState | null): {
  primary: string
  secondary?: string
  badge?: {
    text: string
    color: string
  }
} {
  const info = getGameStatusInfo(gameState)

  switch (info.status) {
    case 'unplayed':
      return {
        primary: 'Ready to play',
        secondary: 'Start your first guess'
      }

    case 'partial':
      return {
        primary: 'In Progress',
        secondary: getResumptionMessage(gameState!),
        badge: {
          text: `${info.attempts}/${gameState!.maxAttempts}`,
          color: 'amber'
        }
      }

    case 'completed':
      if (info.completion === 'won') {
        return {
          primary: 'Completed',
          secondary: `Solved in ${info.attempts} attempt${info.attempts !== 1 ? 's' : ''}`,
          badge: {
            text: 'Won',
            color: 'green'
          }
        }
      } else {
        return {
          primary: 'Completed',
          secondary: 'Better luck next time!',
          badge: {
            text: 'Lost',
            color: 'red'
          }
        }
      }

    default:
      return {
        primary: 'Unknown status'
      }
  }
}

/**
 * Get streak information from multiple game states
 */
export function calculateStreak(gameStates: { date: string; state: GameState | null }[]): {
  current: number
  longest: number
  lastWin?: string
} {
  const sortedStates = gameStates
    .filter(({ state }) => state?.completed)
    .sort((a, b) => b.date.localeCompare(a.date)) // Most recent first

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let lastWinDate: string | undefined

  for (const { date, state } of sortedStates) {
    if (state?.won) {
      if (!lastWinDate) {
        lastWinDate = date
      }
      tempStreak++
      if (currentStreak === 0) {
        currentStreak = tempStreak
      }
    } else {
      if (currentStreak > 0) {
        currentStreak = 0 // Break current streak
      }
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 0
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak)

  return {
    current: currentStreak,
    longest: longestStreak,
    lastWin: lastWinDate
  }
}

/**
 * Export helper for analytics/sharing
 */
export function getGameSummaryForSharing(gameState: GameState, movieTitle?: string): {
  status: string
  attempts: number
  title?: string
  shareEmoji: string
} {
  const info = getGameStatusInfo(gameState)
  
  let shareEmoji = '⬜'
  if (info.completion === 'won') {
    shareEmoji = '🟩'
  } else if (info.completion === 'lost') {
    shareEmoji = '🟥'
  } else if (info.status === 'partial') {
    shareEmoji = '🟨'
  }

  return {
    status: info.displayText,
    attempts: info.attempts,
    title: movieTitle,
    shareEmoji
  }
}