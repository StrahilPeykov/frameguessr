'use client'

import { Trophy } from 'lucide-react'
import { useGameContext } from '@/contexts/GameContext'

export default function GameProgress() {
  const { gameState } = useGameContext()

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-6">
        {/* Show dots in chronological order using allAttempts */}
        <div className="flex gap-3">
          {Array.from({ length: gameState.maxAttempts }).map((_, i) => {
            // Get the attempt at this chronological position
            const attempt = gameState.allAttempts[i]
            
            if (attempt) {
              // Show the actual attempt result
              if (attempt.type === 'guess') {
                return (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full transition-all duration-500 ${
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
                    className="w-4 h-4 rounded-full cinema-status-incorrect transition-all duration-500"
                  />
                )
              }
            }
            
            // No attempt made yet - show as pending
            return (
              <div
                key={i}
                className="w-4 h-4 rounded-full cinema-status-pending transition-all duration-500"
              />
            )
          })}
        </div>
        
        {/* Only show scene indicator if game is not completed */}
        {!gameState.completed && (
          <div className="px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700">
            Scene {gameState.currentHintLevel}/3
          </div>
        )}
      </div>
      
      {gameState.completed && (
        <div className="text-right">
          {gameState.won ? (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
              <Trophy className="w-5 h-5" />
              <span className="hidden sm:inline">Standing Ovation!</span>
              <span className="sm:hidden">Won!</span>
            </div>
          ) : (
            <div className="text-red-600 dark:text-red-400 font-medium">
              <span className="hidden sm:inline">The Credits Roll</span>
              <span className="sm:hidden">Game Over</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}