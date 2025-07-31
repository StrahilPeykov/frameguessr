'use client'

import { useGameContext } from '@/contexts/GameContext'

export default function HintsPanel() {
  const { gameState, dailyChallenge } = useGameContext()

  // Hide hints when game is completed since we show full details in CompletionScreen
  if (!dailyChallenge || gameState.currentHintLevel < 2 || gameState.completed) {
    return null
  }

  return (
    <div className="mb-3">
      <div className="flex flex-wrap gap-2 text-sm">
        {/* Tagline */}
        {gameState.currentHintLevel >= 2 && dailyChallenge.hints.level2.data.tagline && (
          <div className="cinema-glass rounded-lg px-3 py-1.5 border border-stone-200/30 dark:border-amber-700/30">
            <span className="text-stone-500 dark:text-stone-400 text-xs">Tagline:</span>
            <span className="text-stone-700 dark:text-stone-300 italic ml-2">
              {dailyChallenge.hints.level2.data.tagline}
            </span>
          </div>
        )}

        {/* Year & Genre - Inline */}
        {gameState.currentHintLevel >= 3 && (
          <div className="flex gap-2">
            {dailyChallenge.hints.level3.data.year && (
              <div className="cinema-glass rounded-lg px-3 py-1.5 border border-stone-200/30 dark:border-amber-700/30">
                <span className="text-stone-500 dark:text-stone-400 text-xs mr-1">Year:</span>
                <span className="text-stone-700 dark:text-stone-300 font-medium">
                  {dailyChallenge.hints.level3.data.year}
                </span>
              </div>
            )}
            
            {dailyChallenge.hints.level3.data.genre && (
              <div className="cinema-glass rounded-lg px-3 py-1.5 border border-stone-200/30 dark:border-amber-700/30">
                <span className="text-stone-500 dark:text-stone-400 text-xs mr-1">Genre:</span>
                <span className="text-stone-700 dark:text-stone-300 font-medium">
                  {dailyChallenge.hints.level3.data.genre}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}