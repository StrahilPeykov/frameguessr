// components/game/GameProgress.tsx - Enhanced with in-progress game awareness
'use client'

import { Trophy, Clapperboard, Clock, RotateCcw, Target } from 'lucide-react'
import { useGameContext } from '@/contexts/GameContext'
import { getGameStatus } from '@/types'

export default function GameProgress() {
  const { gameState } = useGameContext()
  const gameStatus = getGameStatus(gameState)
  const isInProgress = gameStatus === 'in-progress'
  const hasGuesses = gameState.guesses.length > 0

  // Calculate remaining attempts
  const remainingAttempts = gameState.maxAttempts - gameState.attempts

  const getStatusIcon = () => {
    if (gameState.completed) {
      return gameState.won ? (
        <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      ) : (
        <Target className="w-4 h-4 text-red-600 dark:text-red-400" />
      )
    }
    
    if (isInProgress) {
      return <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
    }
    
    return <Clapperboard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
  }

  const getStatusText = () => {
    if (gameState.completed) {
      return gameState.won ? 'Won!' : 'Game Over'
    }
    
    if (isInProgress) {
      return hasGuesses ? 'Continue Guessing' : 'In Progress'
    }
    
    return `Scene ${gameState.currentHintLevel}`
  }

  const getDetailText = () => {
    if (gameState.completed) {
      return gameState.won 
        ? `Solved in ${gameState.attempts} ${gameState.attempts === 1 ? 'attempt' : 'attempts'}`
        : `Used all ${gameState.maxAttempts} attempts`
    }
    
    if (isInProgress) {
      const plural = remainingAttempts === 1 ? '' : 's'
      return `${remainingAttempts} attempt${plural} left`
    }
    
    return 'Ready to start'
  }

  return (
    <div className="flex items-center justify-center mb-6">
      <div className={`flex items-center gap-4 cinema-glass rounded-full px-6 py-3 transition-all duration-300 ${
        gameState.completed 
          ? gameState.won 
            ? 'bg-green-50/60 dark:bg-green-900/20 border-green-200/50 dark:border-green-700/50'
            : 'bg-red-50/60 dark:bg-red-900/20 border-red-200/50 dark:border-red-700/50'
          : isInProgress
            ? 'bg-amber-50/60 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-700/50'
            : 'bg-white/60 dark:bg-stone-900/60'
      }`}>
        
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
                    title={attempt.correct ? `Correct: ${attempt.title}` : `Incorrect: ${attempt.title}`}
                  />
                )
              } else {
                // Skip attempt - always red
                return (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full cinema-status-incorrect transition-all duration-500"
                    title="Skipped to next scene"
                  />
                )
              }
            }
            
            // No attempt made yet - show as pending with different styles
            return (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  isInProgress && i === gameState.attempts
                    ? 'cinema-status-pending ring-2 ring-amber-300 dark:ring-amber-600 animate-pulse'
                    : 'cinema-status-pending'
                }`}
                title={isInProgress && i === gameState.attempts ? 'Current attempt' : 'Available attempt'}
              />
            )
          })}
        </div>
        
        {/* Divider */}
        <div className="w-px h-6 bg-stone-300 dark:bg-stone-600" />
        
        {/* Status with enhanced info */}
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div className="text-center">
            <span className={`text-sm font-medium ${
              gameState.completed
                ? gameState.won
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-600 dark:text-red-400'
                : isInProgress
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-stone-700 dark:text-stone-300'
            }`}>
              {getStatusText()}
            </span>
            <div className="text-xs text-stone-500 dark:text-stone-400">
              {getDetailText()}
            </div>
          </div>
        </div>

        {/* Progress indicator for in-progress games */}
        {isInProgress && (
          <>
            <div className="w-px h-6 bg-stone-300 dark:bg-stone-600" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <div className="text-center">
                <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Scene {gameState.currentHintLevel}/3
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  {gameState.currentHintLevel === 1 && 'Heavily blurred'}
                  {gameState.currentHintLevel === 2 && 'With tagline'}
                  {gameState.currentHintLevel === 3 && 'Year & genre'}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}