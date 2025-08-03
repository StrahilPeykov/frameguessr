'use client'

import { useState, useEffect } from 'react'
import { X, Trophy, Target, BarChart, TrendingUp, Clock } from 'lucide-react'
import { gameStorage } from '@/lib/gameStorage'

interface StatsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface UserStats {
  gamesPlayed: number
  gamesWon: number
  winPercentage: number
  currentStreak: number
  averageAttempts: number
  guessDistribution: number[]
  gamesInProgress: number
}

export default function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const [stats, setStats] = useState<UserStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    winPercentage: 0,
    currentStreak: 0,
    averageAttempts: 0,
    guessDistribution: [0, 0, 0],
    gamesInProgress: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadStats()
    }
  }, [isOpen])

  const loadStats = async () => {
    try {
      setLoading(true)
      const userStats = await gameStorage.getUserStats()
      setStats(userStats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const maxDistribution = Math.max(...stats.guessDistribution, 1)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            Your Statistics
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-stone-500 dark:text-stone-400" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="cinema-spinner mx-auto mb-4" />
              <p className="text-stone-600 dark:text-stone-400">Loading stats...</p>
            </div>
          ) : (
            <>
              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <div className="text-3xl font-bold text-stone-900 dark:text-stone-100">
                    {stats.gamesPlayed}
                  </div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">
                    Played
                  </div>
                </div>
                
                <div className="text-center p-4 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <div className="text-3xl font-bold text-stone-900 dark:text-stone-100">
                    {stats.winPercentage}%
                  </div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">
                    Win Rate
                  </div>
                </div>
                
                <div className="text-center p-4 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <div className="text-3xl font-bold text-stone-900 dark:text-stone-100 flex items-center justify-center gap-1">
                    {stats.currentStreak}
                    {stats.currentStreak >= 5 && (
                      <span className="text-amber-500" aria-label="Hot streak!">🔥</span>
                    )}
                  </div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">
                    Current Streak
                  </div>
                </div>
                
                <div className="text-center p-4 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <div className="text-3xl font-bold text-stone-900 dark:text-stone-100">
                    {stats.averageAttempts}
                  </div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">
                    Avg. Guesses
                  </div>
                </div>
              </div>

              {/* In Progress Games */}
              {stats.gamesInProgress > 0 && (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        {stats.gamesInProgress} game{stats.gamesInProgress !== 1 ? 's' : ''} in progress
                      </div>
                      <div className="text-xs text-amber-700 dark:text-amber-300">
                        Check the archive to continue playing
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Guess Distribution */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Guess Distribution
                </h3>
                
                {stats.gamesWon === 0 ? (
                  <div className="text-center py-8 text-stone-500 dark:text-stone-400">
                    Play more games to see your distribution
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[1, 2, 3].map((attempts) => {
                      const count = stats.guessDistribution[attempts - 1]
                      const percentage = maxDistribution > 0 ? (count / maxDistribution) * 100 : 0
                      
                      return (
                        <div key={attempts} className="flex items-center gap-2">
                          <div className="w-4 text-sm font-medium text-stone-600 dark:text-stone-400">
                            {attempts}
                          </div>
                          <div className="flex-1 h-8 bg-stone-200 dark:bg-stone-700 rounded overflow-hidden relative">
                            <div
                              className="h-full bg-gradient-to-r from-amber-600 to-orange-600 transition-all duration-500 flex items-center justify-end pr-2"
                              style={{ width: `${Math.max(percentage, count > 0 ? 10 : 0)}%` }}
                            >
                              {count > 0 && (
                                <span className="text-xs font-medium text-white">
                                  {count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Summary Messages */}
              {stats.gamesPlayed > 0 && (
                <div className="mt-6 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-center">
                  {stats.winPercentage >= 80 && stats.gamesPlayed >= 5 && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                      🏆 Outstanding performance!
                    </p>
                  )}
                  {stats.currentStreak >= 10 && (
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                      🔥 Incredible {stats.currentStreak} game winning streak!
                    </p>
                  )}
                  {stats.averageAttempts <= 1.5 && stats.gamesWon >= 5 && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      🎯 Movie expert! Average of {stats.averageAttempts} guesses
                    </p>
                  )}
                  {stats.gamesPlayed === 1 && (
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      Keep playing to build your stats!
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}