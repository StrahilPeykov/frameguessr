'use client'

import { useGameContext } from '@/contexts/GameContext'
import SearchBox from './SearchBox'

export default function GameControls() {
  const { gameState, dailyChallenge, makeGuess, stopAudio } = useGameContext()

  const handleGuess = async (result: any) => {
    if (gameState.completed || !dailyChallenge) return
    
    // Stop audio when making a guess
    stopAudio()
    
    await makeGuess(result, dailyChallenge.movieId, dailyChallenge.mediaType)
  }

  if (gameState.completed) {
    return null
  }

  return (
    <SearchBox 
      onSelect={handleGuess} 
      disabled={gameState.completed}
      placeholder="Search for the movie or show..."
    />
  )
}