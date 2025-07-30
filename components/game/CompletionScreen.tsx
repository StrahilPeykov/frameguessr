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
    <div className="cinema-glass rounded-3xl p-8 text-center mb-8 shadow-xl border border-stone-200/50 dark:border-stone-800/50">
      {gameState.won ? (
        <>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Trophy className="w-10 h-10 text-white animate-cinema-trophy" />
          </div>
          <h3 className="text-3xl font-bold mb-3 cinema-gradient-text">Bravo!</h3>
          <p className="text-stone-600 dark:text-stone-400 text-lg mb-2">
            You identified <span className="font-bold text-stone-900 dark:text-stone-100">"{dailyChallenge.title}"</span>
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-500">
            Solved in {gameState.attempts} {gameState.attempts === 1 ? 'guess' : 'guesses'}
          </p>
        </>
      ) : (
        <>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-bold mb-3 text-stone-900 dark:text-stone-100">Final Credits</h3>
          <p className="text-stone-600 dark:text-stone-400 text-lg mb-4">The answer was:</p>
          <div className="cinema-glass bg-stone-100 dark:bg-stone-800 rounded-2xl px-6 py-4 inline-block">
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{dailyChallenge.title}</p>
            <p className="text-sm text-stone-500 dark:text-stone-400 flex items-center justify-center gap-2 mt-2">
              {dailyChallenge.mediaType === 'tv' ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />}
              {dailyChallenge.year}
            </p>
          </div>
        </>
      )}

      {dailyChallenge.details && (
        <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-700">
          <div className="text-left space-y-4">
            {dailyChallenge.details.tagline && (
              <div>
                <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-1">Tagline</h4>
                <p className="text-stone-600 dark:text-stone-400 italic">"{dailyChallenge.details.tagline}"</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyChallenge.details.director && (
                <div>
                  <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Director
                  </h4>
                  <p className="text-stone-600 dark:text-stone-400">{dailyChallenge.details.director}</p>
                </div>
              )}
              
              {dailyChallenge.details.genre && (
                <div>
                  <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                    <Film className="w-4 h-4" />
                    Genre
                  </h4>
                  <p className="text-stone-600 dark:text-stone-400">{dailyChallenge.details.genre}</p>
                </div>
              )}
            </div>

            {dailyChallenge.details.actors && dailyChallenge.details.actors.length > 0 && (
              <div>
                <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Cast
                </h4>
                <p className="text-stone-600 dark:text-stone-400">
                  {dailyChallenge.details.actors.slice(0, 3).join(', ')}
                </p>
              </div>
            )}

            {dailyChallenge.details.overview && (
              <div>
                <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-1">Overview</h4>
                <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                  {dailyChallenge.details.overview}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {isToday && (
        <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-700">
          <div className="text-sm text-stone-500 dark:text-stone-400 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Next show starts in: <CountdownTimer />
          </div>
        </div>
      )}
    </div>
  )
}