'use client'

import { useState } from 'react'
import { Film, Tv, Check, X, ChevronDown } from 'lucide-react'
import { useGameContext } from '@/contexts/GameContext'

export default function GuessHistory() {
  const { gameState } = useGameContext()
  const [showGuesses, setShowGuesses] = useState(false)

  if (gameState.guesses.length === 0) {
    return null
  }

  return (
    <div className="max-w-xl mx-auto mt-6 cinema-glass rounded-xl p-4 border border-stone-200/30 dark:border-stone-800/30 bg-stone-50/50 dark:bg-stone-900/50">
      <button
        onClick={() => setShowGuesses(!showGuesses)}
        className="flex items-center justify-between w-full text-left group"
      >
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
          <Film className="w-4 h-4 text-amber-600" />
          Your Guesses
          <span className="text-stone-500 dark:text-stone-500 font-normal">
            ({gameState.guesses.length})
          </span>
        </h3>
        <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform duration-300 ${
          showGuesses ? 'rotate-180' : ''
        } group-hover:text-amber-600`} />
      </button>
      
      {showGuesses && (
        <div className="mt-3 space-y-2">
          {gameState.guesses.map((guess, index) => (
            <div
              key={guess.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                guess.correct 
                  ? 'bg-green-50/50 dark:bg-green-900/10 border-green-300/50 dark:border-green-700/50' 
                  : 'bg-red-50/50 dark:bg-red-900/10 border-red-300/50 dark:border-red-700/50'
              }`}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-900 dark:text-stone-100 truncate text-sm">
                  {guess.title}
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                  {guess.mediaType === 'tv' ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                  {guess.mediaType === 'tv' ? 'TV Series' : 'Film'}
                </p>
              </div>
              <div className={`p-1.5 rounded-full ${
                guess.correct ? 'bg-green-200 dark:bg-green-800' : 'bg-red-200 dark:bg-red-800'
              }`}>
                {guess.correct ? (
                  <Check className="w-3.5 h-3.5 text-green-700 dark:text-green-300" />
                ) : (
                  <X className="w-3.5 h-3.5 text-red-700 dark:text-red-300" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}