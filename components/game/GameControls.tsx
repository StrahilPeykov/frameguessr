'use client'

import { SkipForward } from 'lucide-react'
import { useGameContext } from '@/contexts/GameContext'
import SearchBox from './SearchBox'

export default function GameControls() {
  const { gameState, dailyChallenge, makeGuess, skipHint, stopAudio } = useGameContext()

  const handleGuess = async (result: any) => {
    if (gameState.completed || !dailyChallenge) return
    
    // Stop audio when making a guess
    stopAudio()
    
    await makeGuess(result, dailyChallenge.movieId, dailyChallenge.mediaType)
  }

  const handleSkip = () => {
    if (gameState.completed) return
    
    // Stop audio when skipping
    stopAudio()
    
    skipHint()
  }

  if (gameState.completed) {
    return null
  }

  return (
    <div className="space-y-3 mb-6">
      <SearchBox 
        onSelect={handleGuess} 
        disabled={gameState.completed}
        placeholder="Search for the movie or show..."
      />
      
      <button
        onClick={handleSkip}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 cinema-glass hover:bg-stone-100/80 dark:hover:bg-stone-800/80 text-stone-700 dark:text-stone-200 rounded-xl transition-all duration-300 border border-stone-200/50 dark:border-amber-700/50 font-medium cinema-btn group"
      >
        <SkipForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        Skip to Next Scene
      </button>
    </div>
  )
}