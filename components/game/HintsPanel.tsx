'use client'

import { useGameContext } from '@/contexts/GameContext'

export default function HintsPanel() {
  const { gameState, dailyChallenge } = useGameContext()

  // Hide hints when game is completed since we show full details in CompletionScreen
  if (!dailyChallenge || gameState.currentHintLevel < 2 || gameState.completed) {
    return null
  }

  const hasTagline = gameState.currentHintLevel >= 2 && dailyChallenge.hints.level2.data.tagline
  const hasMetadata = gameState.currentHintLevel >= 3

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
      {/* Tagline - Emphasized */}
      {hasTagline && (
        <div className="w-full text-center mb-1">
          <p className="text-stone-600 dark:text-stone-400 italic px-4">
            "{dailyChallenge.hints.level2.data.tagline}"
          </p>
        </div>
      )}

      {/* Year & Genre - Inline Pills */}
      {hasMetadata && (
        <div className="flex items-center gap-2">
          {dailyChallenge.hints.level3.data.year && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 dark:bg-stone-800 rounded-full text-xs font-medium text-stone-700 dark:text-stone-300">
              <span className="text-stone-500 dark:text-stone-500">Year:</span>
              {dailyChallenge.hints.level3.data.year}
            </span>
          )}
          
          {dailyChallenge.hints.level3.data.genre && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 dark:bg-stone-800 rounded-full text-xs font-medium text-stone-700 dark:text-stone-300">
              <span className="text-stone-500 dark:text-stone-500">Genre:</span>
              {dailyChallenge.hints.level3.data.genre}
            </span>
          )}
        </div>
      )}
    </div>
  )
}