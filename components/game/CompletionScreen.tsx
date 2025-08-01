'use client'

import { useState, useEffect } from 'react'
import { Trophy, X, Film, Tv, Star, User, Clock } from 'lucide-react'
import { useGameContext } from '@/contexts/GameContext'
import { getTodayLocal } from '@/utils/dateUtils'

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const difference = tomorrow.getTime() - now.getTime()
      
      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
      
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    setTimeLeft(calculateTimeLeft())

    return () => clearInterval(timer)
  }, [])

  return <span className="font-mono text-amber-600 dark:text-amber-400">{timeLeft}</span>
}

interface CompletionScreenProps {
  currentDate: string
}

export default function CompletionScreen({ currentDate }: CompletionScreenProps) {
  const { gameState, dailyChallenge } = useGameContext()
  
  if (!gameState.completed || !dailyChallenge) {
    return null
  }

  const today = getTodayLocal()
  const isToday = currentDate === today

  return (
    <div className="max-w-3xl mx-auto">
      <div className="cinema-glass rounded-2xl p-6 md:p-8 text-center shadow-xl border border-stone-200/50 dark:border-stone-800/50">
        {gameState.won ? (
          <>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Trophy className="w-8 h-8 text-white animate-cinema-trophy" />
            </div>
            <h3 className="text-2xl font-bold mb-2 cinema-gradient-text">Bravo!</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-1">
              You identified <span className="font-bold text-stone-900 dark:text-stone-100">"{dailyChallenge.title}"</span>
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-500">
              Solved in {gameState.attempts} {gameState.attempts === 1 ? 'guess' : 'guesses'}
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-stone-900 dark:text-stone-100">Final Credits</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-3">The answer was:</p>
            <div className="inline-block cinema-glass bg-stone-100 dark:bg-stone-800 rounded-xl px-5 py-3">
              <p className="text-xl font-bold text-stone-900 dark:text-stone-100">{dailyChallenge.title}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400 flex items-center justify-center gap-2 mt-1">
                {dailyChallenge.mediaType === 'tv' ? <Tv className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
                {dailyChallenge.year}
              </p>
            </div>
          </>
        )}

        {dailyChallenge.details && (
          <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-700">
            <div className="space-y-4">
              {dailyChallenge.details.tagline && (
                <div className="text-center">
                  <p className="text-stone-600 dark:text-stone-400 italic text-sm">
                    "{dailyChallenge.details.tagline}"
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                {dailyChallenge.details.director && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-stone-500 dark:text-stone-500 mb-1">
                      <Star className="w-3.5 h-3.5" />
                      <span className="text-xs">Director</span>
                    </div>
                    <p className="font-medium text-stone-700 dark:text-stone-300">
                      {dailyChallenge.details.director}
                    </p>
                  </div>
                )}
                
                {dailyChallenge.details.genre && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-stone-500 dark:text-stone-500 mb-1">
                      <Film className="w-3.5 h-3.5" />
                      <span className="text-xs">Genre</span>
                    </div>
                    <p className="font-medium text-stone-700 dark:text-stone-300">
                      {dailyChallenge.details.genre}
                    </p>
                  </div>
                )}
              </div>

              {dailyChallenge.details.actors && dailyChallenge.details.actors.length > 0 && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-stone-500 dark:text-stone-500 mb-1">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-xs">Cast</span>
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    {dailyChallenge.details.actors.slice(0, 3).join(', ')}
                  </p>
                </div>
              )}

              {dailyChallenge.details.overview && (
                <div className="text-center mt-4">
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    {dailyChallenge.details.overview}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {isToday && (
          <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-700">
            <div className="text-sm text-stone-500 dark:text-stone-400 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Next show starts in: <CountdownTimer />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}