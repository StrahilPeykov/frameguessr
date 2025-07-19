import { format } from 'date-fns'

// Archive utility functions

export interface ArchiveStats {
  totalAvailable: number
  totalPlayed: number
  totalWon: number
  winRate: number
  firstDate: Date | null
  lastDate: Date | null
  currentStreak: number
  bestStreak: number
}

/**
 * Calculate archive statistics from game data
 */
export function calculateArchiveStats(
  availableDates: Set<string>,
  playedGames: Map<string, { completed: boolean; won: boolean; attempts: number }>
): ArchiveStats {
  const totalAvailable = availableDates.size
  const totalPlayed = playedGames.size
  const gamesArray = Array.from(playedGames.entries())
  const totalWon = gamesArray.filter(([_, game]) => game.won).length
  const winRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0

  // Get date range
  const sortedDates = Array.from(availableDates).sort()
  const firstDate = sortedDates.length > 0 ? new Date(sortedDates[0]) : null
  const lastDate = sortedDates.length > 0 ? new Date(sortedDates[sortedDates.length - 1]) : null

  // Calculate streaks
  const sortedPlayedDates = gamesArray
    .filter(([_, game]) => game.won)
    .map(([date]) => date)
    .sort()

  let currentStreak = 0
  let bestStreak = 0
  let tempStreak = 0
  let lastProcessedDate: Date | null = null

  for (let i = sortedPlayedDates.length - 1; i >= 0; i--) {
    const currentDate = new Date(sortedPlayedDates[i])
    
    if (!lastProcessedDate) {
      tempStreak = 1
      if (i === sortedPlayedDates.length - 1) {
        // Check if this is today or yesterday for current streak
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        
        if (
          format(currentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') ||
          format(currentDate, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')
        ) {
          currentStreak = 1
        }
      }
    } else {
      const dayDiff = Math.floor((lastProcessedDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (dayDiff === 1) {
        tempStreak++
        if (i === sortedPlayedDates.length - 1) {
          currentStreak = tempStreak
        }
      } else {
        bestStreak = Math.max(bestStreak, tempStreak)
        tempStreak = 1
      }
    }
    
    lastProcessedDate = currentDate
  }
  
  bestStreak = Math.max(bestStreak, tempStreak)

  return {
    totalAvailable,
    totalPlayed,
    totalWon,
    winRate,
    firstDate,
    lastDate,
    currentStreak,
    bestStreak
  }
}

/**
 * Get calendar display data for a month
 */
export function getCalendarMonth(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // Get the first Sunday of the calendar
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - startDate.getDay())
  
  // Get the last Saturday of the calendar
  const endDate = new Date(lastDay)
  const daysToAdd = 6 - endDate.getDay()
  endDate.setDate(endDate.getDate() + daysToAdd)
  
  const days: Date[] = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

/**
 * Format a date for display in the archive
 */
export function formatArchiveDate(date: Date | string, formatStr: string = 'MMMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr)
}

/**
 * Check if a date has a game available
 */
export function isDateAvailable(date: Date, availableDates: Set<string>): boolean {
  const dateStr = format(date, 'yyyy-MM-dd')
  return availableDates.has(dateStr)
}

/**
 * Check if a date is in the future
 */
export function isDateFuture(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return date > today
}

/**
 * Check if a date is today
 */
export function isDateToday(date: Date): boolean {
  const today = new Date()
  return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
}

/**
 * Get achievement badges based on stats
 */
export interface Achievement {
  id: string
  name: string
  description: string
  earned: boolean
  icon: string
  color: string
}

export function getAchievements(stats: ArchiveStats): Achievement[] {
  return [
    {
      id: 'first_solve',
      name: 'Opening Night',
      description: 'Solve your first puzzle',
      earned: stats.totalWon >= 1,
      icon: '🎬',
      color: 'amber'
    },
    {
      id: 'week_streak',
      name: 'Week at the Cinema',
      description: '7-day win streak',
      earned: stats.bestStreak >= 7,
      icon: '🏆',
      color: 'gold'
    },
    {
      id: 'month_streak',
      name: 'Season Pass',
      description: '30-day win streak',
      earned: stats.bestStreak >= 30,
      icon: '⭐',
      color: 'purple'
    },
    {
      id: 'perfect_month',
      name: 'Critics\' Choice',
      description: '100% success rate (10+ games)',
      earned: stats.winRate === 100 && stats.totalPlayed >= 10,
      icon: '🌟',
      color: 'blue'
    },
    {
      id: 'film_buff',
      name: 'Film Buff',
      description: 'Play 50 games',
      earned: stats.totalPlayed >= 50,
      icon: '🎭',
      color: 'green'
    },
    {
      id: 'centurion',
      name: 'Century Club',
      description: 'Play 100 games',
      earned: stats.totalPlayed >= 100,
      icon: '💯',
      color: 'red'
    }
  ]
}

/**
 * Group dates by month for archive display
 */
export function groupDatesByMonth(dates: string[]): Map<string, string[]> {
  const grouped = new Map<string, string[]>()
  
  dates.forEach(dateStr => {
    const date = new Date(dateStr)
    const monthKey = format(date, 'yyyy-MM')
    
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, [])
    }
    
    grouped.get(monthKey)!.push(dateStr)
  })
  
  return grouped
}

/**
 * Export game history for backup
 */
export function exportGameHistory(
  playedGames: Map<string, { completed: boolean; won: boolean; attempts: number }>
): string {
  const history = {
    version: 1,
    exportDate: new Date().toISOString(),
    games: Array.from(playedGames.entries()).map(([date, game]) => ({
      date,
      ...game
    }))
  }
  
  return JSON.stringify(history, null, 2)
}

/**
 * Import game history from backup
 */
export function importGameHistory(jsonStr: string): Map<string, { completed: boolean; won: boolean; attempts: number }> | null {
  try {
    const history = JSON.parse(jsonStr)
    
    if (history.version !== 1 || !Array.isArray(history.games)) {
      throw new Error('Invalid history format')
    }
    
    const games = new Map()
    
    history.games.forEach((game: any) => {
      if (game.date && typeof game.completed === 'boolean') {
        games.set(game.date, {
          completed: game.completed,
          won: game.won || false,
          attempts: game.attempts || 0
        })
      }
    })
    
    return games
  } catch (error) {
    console.error('Failed to import game history:', error)
    return null
  }
}