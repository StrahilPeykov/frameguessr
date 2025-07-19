'use client'

import { useEffect, useState } from 'react'
import { X, TrendingUp, Award, Calendar } from 'lucide-react'

interface StatsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Stats {
  gamesPlayed: number
  gamesWon: number
  winPercentage: number
  currentStreak: number
  maxStreak: number
  guessDistribution: number[]
}

export default function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const [stats, setStats] = useState<Stats>({
    gamesPlayed: 0,
    gamesWon: 0,
    winPercentage: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0],
  })

  useEffect(() => {
    if (isOpen) {
      calculateStats()
    }
  }, [isOpen])

  const calculateStats = () => {
    const allGames: any[] = []
    
    // Get all game data from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('frameguessr-')) {
        const gameData = localStorage.getItem(key)
        if (gameData) {
          try {
            const parsed = JSON.parse(gameData)
            allGames.push({
              date: key.replace('frameguessr-', ''),
              ...parsed
            })
          } catch (e) {
            console.error('Error parsing game data:', e)
          }
        }
      }
    }

    // Sort by date
    allGames.sort((a, b) => a.date.localeCompare(b.date))

    // Calculate stats
    const gamesPlayed = allGames.filter(g => g.completed).length
    const gamesWon = allGames.filter(g => g.won).length
    const winPercentage = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0

    // Calculate guess distribution
    const distribution = [0, 0, 0]
    allGames.forEach(game => {
      if (game.won && game.attempts > 0 && game.attempts <= 3) {
        distribution[game.attempts - 1]++
      }
    })

    // Calculate streaks
    let currentStreak = 0
    let maxStreak = 0
    let tempStreak = 0
    
    for (let i = allGames.length - 1; i >= 0; i--) {
      if (allGames[i].won) {
        tempStreak++
        if (i === allGames.length - 1) {
          currentStreak = tempStreak
        }
      } else if (allGames[i].completed) {
        maxStreak = Math.max(maxStreak, tempStreak)
        tempStreak = 0
        if (i === allGames.length - 1) {
          currentStreak = 0
        }
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak, currentStreak)

    setStats({
      gamesPlayed,
      gamesWon,
      winPercentage,
      currentStreak,
      maxStreak,
      guessDistribution: distribution,
    })
  }

  if (!isOpen) return null

  const maxDistribution = Math.max(...stats.guessDistribution, 1)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-sm w-full p-6 relative border border-yellow-200/20 dark:border-yellow-700/20">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Your Statistics</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.gamesPlayed}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Played</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.winPercentage}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Win %</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.currentStreak}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.maxStreak}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Max Streak</div>
          </div>
        </div>

        {/* Guess Distribution */}
        <div className="mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Award className="w-4 h-4 text-yellow-600" />
            Guess Distribution
          </h3>
          <div className="space-y-2">
            {stats.guessDistribution.map((count, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-4 text-sm font-medium text-gray-700 dark:text-gray-300">{index + 1}</div>
                <div className="flex-1 relative bg-gray-200 dark:bg-gray-700 h-6 rounded">
                  <div
                    className="absolute inset-y-0 left-0 bg-yellow-500 rounded transition-all duration-500"
                    style={{
                      width: `${maxDistribution > 0 ? (count / maxDistribution) * 100 : 0}%`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-end pr-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="border-t dark:border-gray-700 pt-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <TrendingUp className="w-4 h-4 text-yellow-600" />
            Achievements
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {stats.currentStreak >= 3 && (
              <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                🔥 Hot Streak!
              </div>
            )}
            {stats.winPercentage >= 80 && stats.gamesPlayed >= 5 && (
              <div className="bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 px-2 py-1 rounded">
                🎯 Sharpshooter
              </div>
            )}
            {stats.gamesPlayed >= 10 && (
              <div className="bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                🎬 Regular
              </div>
            )}
            {stats.guessDistribution[0] >= 5 && (
              <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                ⚡ Quick Eye
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}