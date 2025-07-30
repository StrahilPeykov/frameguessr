'use client'

import { Trophy } from 'lucide-react'
import { useGameContext } from '@/contexts/GameContext'

export default function GameProgress() {
  const { gameState } = useGameContext()

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-6">
        <div className="flex gap-3">
          {Array.from({ length: gameState.maxAttempts }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-500 ${
                i < gameState.attempts
                  ? gameState.guesses[i]?.correct
                    ? 'cinema-status-correct animate-cinema-success'
                    : 'cinema-status-incorrect animate-cinema-error'
                  : 'cinema-status-pending'
              }`}
            />
          ))}
        </div>
        
        <div className="px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700">
          Scene {gameState.currentHintLevel}/3
        </div>
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