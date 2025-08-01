'use client'

import { Trophy, Clapperboard } from 'lucide-react'
import { useGameContext } from '@/contexts/GameContext'

export default function GameProgress() {
  const { gameState } = useGameContext()

  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center gap-4 cinema-glass rounded-full px-6 py-3 bg-white/60 dark:bg-stone-900/60">
        {/* Attempts dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: gameState.maxAttempts }).map((_, i) => {
            // Get the attempt at this chronological position
            const attempt = gameState.allAttempts[i]
            
            if (attempt) {
              // Show the actual attempt result
              if (attempt.type === 'guess') {
                return (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-500 ${
                      attempt.correct
                        ? 'cinema-status-correct animate-cinema-success'
                        : 'cinema-status-incorrect animate-cinema-error'
                    }`}
                  />
                )
              } else {
                // Skip attempt - always red
                return (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full cinema-status-incorrect transition-all duration-500"
                  />
                )
              }
            }
            
            // No attempt made yet - show as pending
            return (
              <div
                key={i}
                className="w-3 h-3 rounded-full cinema-status-pending transition-all duration-500"
              />
            )
          })}
        </div>
        
        {/* Divider */}
        <div className="w-px h-6 bg-stone-300 dark:bg-stone-600" />
        
        {/* Status */}
        <div className="flex items-center gap-2">
          {!gameState.completed ? (
            <>
              <Clapperboard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Scene {gameState.currentHintLevel}
              </span>
            </>
          ) : gameState.won ? (
            <>
              <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Won!
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              Game Over
            </span>
          )}
        </div>
      </div>
    </div>
  )
}