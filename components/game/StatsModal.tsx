'use client'

import { useEffect, useState } from 'react'
import { X, TrendingUp, Trophy, Target, Zap, BarChart } from 'lucide-react'
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
}

interface LeaderboardEntry {
  user_id: string
  username?: string
  display_name?: string
  score: number
  rank: number
}

export default function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const [stats, setStats] = useState<UserStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    winPercentage: 0,
    currentStreak: 0,
    averageAttempts: 0,
    guessDistribution: [0, 0, 0],
  })
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [activeTab, setActiveTab] = useState<'stats' | 'leaderboard'>('stats')
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadStats()
      setIsAuthenticated(gameStorage.isAuthenticated())
      if (gameStorage.isAuthenticated()) {
        loadLeaderboard()
      }
    }
  }, [isOpen])

  const loadStats = async () => {
    setLoading(true)
    try {
      const userStats = await gameStorage.getUserStats()
      setStats(userStats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLeaderboard = async () => {
    try {
      const leaderboardData = await gameStorage.getLeaderboard('streak')
      setLeaderboard(leaderboardData)
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    }
  }

  if (!isOpen) return null

  const maxDistribution = Math.max(...stats.guessDistribution, 1)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-stone-900 max-w-md w-full rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              Statistics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-stone-500 dark:text-stone-400" />
          </button>
        </div>

        {/* Tabs */}
        {isAuthenticated && (
          <div className="flex border-b border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/50'
              }`}
            >
              Your Stats
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'leaderboard'
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/50'
              }`}
            >
              Leaderboard
            </button>
          </div>
        )}

        <div className="p-4">
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {/* Main Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-4 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center justify-center mb-2">
                    <BarChart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.gamesPlayed}</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">Games Played</div>
                </div>
                <div className="text-center p-4 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.winPercentage}%</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">Win Rate</div>
                </div>
                <div className="text-center p-4 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.currentStreak}</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">Current Streak</div>
                </div>
                <div className="text-center p-4 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.averageAttempts}</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">Avg. Attempts</div>
                </div>
              </div>

              {/* Guess Distribution */}
              <div className="pt-4">
                <h3 className="font-medium mb-3 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Guess Distribution
                </h3>
                <div className="space-y-2">
                  {stats.guessDistribution.map((count, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-4 text-sm font-medium text-stone-700 dark:text-stone-300">{index + 1}</div>
                      <div className="flex-1 relative bg-stone-200 dark:bg-stone-700 h-5 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${maxDistribution > 0 ? (count / maxDistribution) * 100 : 0}%`,
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-end pr-2">
                          <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sign In CTA */}
              {!isAuthenticated && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                  <p className="text-sm text-stone-700 dark:text-stone-300 mb-2">
                    Sign in to sync your progress across devices and compete on leaderboards.
                  </p>
                  <button className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-[1.02]">
                    Sign In
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaderboard' && isAuthenticated && (
            <div className="space-y-3">
              <h3 className="font-medium text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Current Streaks
              </h3>
              
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse">
                      <div className="w-8 h-8 bg-stone-200 dark:bg-stone-700 rounded-full" />
                      <div className="flex-1 h-4 bg-stone-200 dark:bg-stone-700 rounded" />
                      <div className="w-12 h-4 bg-stone-200 dark:bg-stone-700 rounded" />
                    </div>
                  ))}
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div
                      key={entry.user_id}
                      className="flex items-center gap-3 p-3 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index < 3 
                          ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' 
                          : 'bg-stone-300 dark:bg-stone-600 text-stone-700 dark:text-stone-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                        {entry.display_name || entry.username || 'Anonymous'}
                      </div>
                      <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {entry.score}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-stone-500 dark:text-stone-400">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No leaderboard data available yet.</p>
                  <p className="text-xs mt-1">Start playing to appear here!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}