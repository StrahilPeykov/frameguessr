'use client'

import { useState } from 'react'
import { Film, Tv, Check, X } from 'lucide-react'
import { useGameContext } from '@/contexts/GameContext'

export default function GuessHistory() {
  const { gameState } = useGameContext()
  const [showGuesses, setShowGuesses] = useState(gameState.guesses.length > 0)

  if (gameState.guesses.length === 0) {
    return null
  }

  return (
    <div className="cinema-glass rounded-2xl p-6 border border-stone-200/50 dark:border-stone-800/50">
      <button
        onClick={() => setShowGuesses(!showGuesses)}
        className="flex items-center justify-between w-full text-left mb-4 group"
      >
        <h3 className="text-lg font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
          <Film className="w-5 h-5 text-amber-600" />
          Your Guesses ({gameState.guesses.length})
        </h3>
        <div className={`w-5 h-5 text-stone-500 transition-transform duration-300 ${showGuesses ? 'rotate-90' : ''} group-hover:text-amber-600`}>
          →
        </div>
      </button>
      
      {showGuesses && (
        <div className="space-y-3">
          {gameState.guesses.map((guess, index) => (
            <div
              key={guess.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cinema-touch ${
                guess.correct 
                  ? 'bg-amber-50/80 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' 
                  : 'bg-red-50/80 dark:bg-red-900/20 border-red-300 dark:border-red-700'
              } shadow-sm`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-700 text-sm font-bold text-stone-600 dark:text-stone-300">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-900 dark:text-stone-100 truncate text-base">
                  {guess.title}
                </p>
                <p className="text-sm text-stone-600 dark:text-stone-400 flex items-center gap-1.5 mt-1">
                  {guess.mediaType === 'tv' ? <Tv className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
                  {guess.mediaType === 'tv' ? 'TV Series' : 'Feature Film'}
                </p>
              </div>
              <div className={`p-2 rounded-full ${
                guess.correct ? 'bg-amber-200 dark:bg-amber-800' : 'bg-red-200 dark:bg-red-800'
              }`}>
                {guess.correct ? (
                  <Check className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                ) : (
                  <X className="w-5 h-5 text-red-700 dark:text-red-300" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}