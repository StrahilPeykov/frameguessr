'use client'

import { useEffect, useState } from 'react'
import { X, TrendingUp, Award, Calendar, Trophy, Film, Zap, Target, Star, Flame } from 'lucide-react'

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

  // Achievement logic
  const achievements = [
    {
      id: 'hot_streak',
      name: 'Hot Streak',
      description: '3+ wins in a row',
      icon: Flame,
      earned: stats.currentStreak >= 3,
      color: 'from-red-500 to-orange-600'
    },
    {
      id: 'sharpshooter',
      name: 'Film Critic',
      description: '80%+ accuracy (5+ games)',
      icon: Target,
      earned: stats.winPercentage >= 80 && stats.gamesPlayed >= 5,
      color: 'from-amber-500 to-yellow-600'
    },
    {
      id: 'regular',
      name: 'Regular Patron',
      description: '10+ shows attended',
      icon: Film,
      earned: stats.gamesPlayed >= 10,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'quick_eye',
      name: 'Eagle Eye',
      description: '5+ first-scene wins',
      icon: Zap,
      earned: stats.guessDistribution[0] >= 5,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'perfectionist',
      name: 'Director\'s Choice',
      description: '10+ scene streak',
      icon: Star,
      earned: stats.maxStreak >= 10,
      color: 'from-purple-500 to-pink-600'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="cinema-glass max-w-lg w-full rounded-3xl shadow-2xl border border-amber-200/30 dark:border-amber-700/30 overflow-hidden max-h-[90vh] overflow-y-auto cinema-scrollbar">
        {/* Theater Marquee Header */}
        <div className="bg-gradient-to-r from-amber-900 via-red-900 to-amber-900 p-6 relative overflow-hidden">
          <div className="absolute inset-0 cinema-pattern opacity-20" />
          
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-amber-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 cinema-touch"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Box Office Stats</h2>
              <p className="text-amber-200 text-sm">Your cinema performance record</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Main Stats Display */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Games Played */}
            <div className="text-center p-4 cinema-glass rounded-2xl border border-stone-200/50 dark:border-stone-700/50">
              <div className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-1">
                {stats.gamesPlayed}
              </div>
              <div className="text-sm text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1">
                <Film className="w-3 h-3" />
                Shows Attended
              </div>
            </div>

            {/* Win Percentage */}
            <div className="text-center p-4 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl border border-amber-200/50 dark:border-amber-700/50">
              <div className="text-3xl font-bold text-amber-700 dark:text-amber-300 mb-1">
                {stats.winPercentage}%
              </div>
              <div className="text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                <Target className="w-3 h-3" />
                Success Rate
              </div>
            </div>

            {/* Current Streak */}
            <div className={`text-center p-4 rounded-2xl border ${
              stats.currentStreak >= 3 
                ? 'bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 border-red-200/50 dark:border-red-700/50' 
                : 'cinema-glass border-stone-200/50 dark:border-stone-700/50'
            }`}>
              <div className={`text-3xl font-bold mb-1 ${
                stats.currentStreak >= 3 
                  ? 'text-red-700 dark:text-red-300' 
                  : 'text-stone-900 dark:text-stone-100'
              }`}>
                {stats.currentStreak}
              </div>
              <div className={`text-sm flex items-center justify-center gap-1 ${
                stats.currentStreak >= 3 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-stone-500 dark:text-stone-400'
              }`}>
                {stats.currentStreak >= 3 ? <Flame className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                Current Streak
              </div>
            </div>

            {/* Max Streak */}
            <div className="text-center p-4 cinema-glass rounded-2xl border border-stone-200/50 dark:border-stone-700/50">
              <div className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-1">
                {stats.maxStreak}
              </div>
              <div className="text-sm text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3" />
                Best Streak
              </div>
            </div>
          </div>

          {/* Scene Performance Chart */}
          <div className="mb-8">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-stone-900 dark:text-stone-100">
              <Award className="w-5 h-5 text-amber-600" />
              Scene Performance
            </h3>
            <div className="space-y-3">
              {stats.guessDistribution.map((count, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 text-sm font-bold text-stone-700 dark:text-stone-300 flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="flex-1 relative bg-stone-200 dark:bg-stone-700 h-8 rounded-lg overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ${
                        index === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                        index === 1 ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                        'bg-gradient-to-r from-red-500 to-rose-600'
                      }`}
                      style={{
                        width: `${maxDistribution > 0 ? (count / maxDistribution) * 100 : 0}%`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-3">
                      <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                        Scene {index + 1}
                      </span>
                      <span className="text-sm font-bold text-stone-700 dark:text-stone-200">
                        {count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievement Gallery */}
          <div className="border-t border-stone-200 dark:border-stone-700 pt-6">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-stone-900 dark:text-stone-100">
              <Star className="w-5 h-5 text-amber-600" />
              Cinema Achievements
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {achievements.map((achievement) => {
                const IconComponent = achievement.icon
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      achievement.earned
                        ? `bg-gradient-to-r ${achievement.color} text-white shadow-lg`
                        : 'cinema-glass border-stone-200/50 dark:border-stone-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.earned
                          ? 'bg-white/20'
                          : 'bg-stone-200 dark:bg-stone-700'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          achievement.earned ? 'text-white' : 'text-stone-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold text-sm ${
                          achievement.earned ? 'text-white' : 'text-stone-900 dark:text-stone-100'
                        }`}>
                          {achievement.name}
                        </div>
                        <div className={`text-xs ${
                          achievement.earned ? 'text-white/80' : 'text-stone-500 dark:text-stone-400'
                        }`}>
                          {achievement.description}
                        </div>
                      </div>
                      {achievement.earned && (
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Theater Footer */}
        <div className="bg-gradient-to-r from-stone-100 to-amber-50 dark:from-stone-800 dark:to-amber-900/20 p-4 text-center border-t border-stone-200/50 dark:border-stone-700/50">
          <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center justify-center gap-2">
            <Film className="w-3 h-3" />
            Keep watching to unlock more achievements
            <Star className="w-3 h-3" />
          </p>
        </div>
      </div>
    </div>
  )
}