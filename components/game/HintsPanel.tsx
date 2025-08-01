'use client'

import { useGameContext } from '@/contexts/GameContext'

export default function HintsPanel() {
  const { gameState, dailyChallenge } = useGameContext()

  // Always render container to prevent layout shift
  if (!dailyChallenge || gameState.completed) {
    return <div className="h-0" /> // Invisible placeholder
  }

  const hasTagline = gameState.currentHintLevel >= 2 && dailyChallenge.hints.level2.data.tagline
  const hasMetadata = gameState.currentHintLevel >= 3

  return (
    <div 
      className="overflow-hidden transition-all duration-500 ease-in-out"
      style={{
        // Dynamically set height based on content
        height: gameState.currentHintLevel === 1 ? '0px' : 
                gameState.currentHintLevel === 2 ? '2.5rem' : 
                '4.5rem'
      }}
    >
      <div className="flex flex-col items-center justify-start gap-2 text-sm py-2">
        {/* Tagline */}
        <div 
          className={`w-full text-center transition-all duration-300 ${
            hasTagline 
              ? 'opacity-100 transform translate-y-0' 
              : 'opacity-0 transform -translate-y-2'
          }`}
        >
          {dailyChallenge.hints.level2.data.tagline && (
            <p className="text-stone-600 dark:text-stone-400 italic px-4 text-sm">
              "{dailyChallenge.hints.level2.data.tagline}"
            </p>
          )}
        </div>

        {/* Year & Genre */}
        <div 
          className={`flex items-center gap-2 transition-all duration-300 delay-150 ${
            hasMetadata 
              ? 'opacity-100 transform translate-y-0' 
              : 'opacity-0 transform -translate-y-2'
          }`}
        >
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
      </div>
    </div>
  )
}