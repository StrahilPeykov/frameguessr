'use client'

import { useEffect, useState } from 'react'
import { X, TrendingUp } from 'lucide-react'
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-stone-900 max-w-md w-full rounded-xl shadow-xl border border-stone-200 dark:border-stone-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              Statistics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {isAuthenticated && (
          <div className="flex border-b border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === 'stats'
                  ? 'text-amber-600 border-b-2 border-amber-600'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Your Stats
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === 'leaderboard'
                  ? 'text-amber-600 border-b-2 border-amber-600'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
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
                <div className="text-center p-3 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <div className="text-xl font-bold text-stone-900 dark:text-stone-100">{stats.gamesPlayed}</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">Games Played</div>
                </div>
                <div className="text-center p-3 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <div className="text-xl font-bold text-stone-900 dark:text-stone-100">{stats.winPercentage}%</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">Win Rate</div>
                </div>
                <div className="text-center p-3 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <div className="text-xl font-bold text-stone-900 dark:text-stone-100">{stats.currentStreak}</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">Current Streak</div>
                </div>
                <div className="text-center p-3 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <div className="text-xl font-bold text-stone-900 dark:text-stone-100">{stats.averageAttempts}</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">Avg. Attempts</div>
                </div>
              </div>

              {/* Guess Distribution */}
              <div>
                <h3 className="font-medium mb-2 text-stone-900 dark:text-stone-100">
                  Guess Distribution
                </h3>
                <div className="space-y-2">
                  {stats.guessDistribution.map((count, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-4 text-sm font-medium text-stone-700 dark:text-stone-300">{index + 1}</div>
                      <div className="flex-1 relative bg-stone-200 dark:bg-stone-700 h-4 rounded">
                        <div
                          className="absolute inset-y-0 left-0 bg-amber-500 rounded"
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
                <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-lg">
                  <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
                    Sign in to sync your progress across devices.
                  </p>
                  <button className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm font-medium">
                    Sign In
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaderboard' && isAuthenticated && (
            <div className="space-y-3">
              <h3 className="font-medium text-stone-900 dark:text-stone-100">Current Streaks</h3>
              
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-stone-100 dark:bg-stone-800 rounded">
                      <div className="w-6 h-6 bg-stone-200 dark:bg-stone-700 rounded" />
                      <div className="flex-1 h-3 bg-stone-200 dark:bg-stone-700 rounded" />
                      <div className="w-8 h-3 bg-stone-200 dark:bg-stone-700 rounded" />
                    </div>
                  ))}
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-1">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div
                      key={entry.user_id}
                      className="flex items-center gap-3 p-2 bg-stone-100 dark:bg-stone-800 rounded"
                    >
                      <div className="w-6 h-6 rounded-full bg-stone-300 dark:bg-stone-600 flex items-center justify-center text-xs font-bold">
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
                <div className="text-center py-6 text-stone-500 dark:text-stone-400">
                  <p className="text-sm">No leaderboard data available yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}