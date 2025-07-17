import { GameState } from '@/types/game'

const STORAGE_PREFIX = 'frameguessr'
const SETTINGS_KEY = `${STORAGE_PREFIX}-settings`
const STATS_KEY = `${STORAGE_PREFIX}-stats`

export interface UserSettings {
  darkMode?: boolean
  reducedMotion?: boolean
  highContrast?: boolean
}

export interface GameStats {
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  maxStreak: number
  lastPlayedDate: string
}

// Game state functions
export const saveGameState = (date: string, state: GameState): void => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}-${date}`, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save game state:', error)
  }
}

export const loadGameState = (date: string): GameState | null => {
  try {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}-${date}`)
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error('Failed to load game state:', error)
    return null
  }
}

// Settings functions
export const saveSettings = (settings: UserSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

export const loadSettings = (): UserSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch (error) {
    console.error('Failed to load settings:', error)
    return {}
  }
}

// Stats functions
export const updateStats = (won: boolean, date: string): void => {
  try {
    const stats = loadStats()
    const lastDate = stats.lastPlayedDate
    const today = date
    
    // Check if this is a new day
    const isNewDay = lastDate !== today
    
    if (isNewDay) {
      stats.gamesPlayed++
      
      if (won) {
        stats.gamesWon++
        
        // Update streak
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        
        if (lastDate === yesterdayStr) {
          stats.currentStreak++
        } else {
          stats.currentStreak = 1
        }
        
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak)
      } else {
        stats.currentStreak = 0
      }
      
      stats.lastPlayedDate = today
      
      localStorage.setItem(STATS_KEY, JSON.stringify(stats))
    }
  } catch (error) {
    console.error('Failed to update stats:', error)
  }
}

export const loadStats = (): GameStats => {
  try {
    const saved = localStorage.getItem(STATS_KEY)
    return saved ? JSON.parse(saved) : {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastPlayedDate: '',
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastPlayedDate: '',
    }
  }
}

// Clean up old game states (keep last 30 days)
export const cleanupOldGames = (): void => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(`${STORAGE_PREFIX}-`) && key !== SETTINGS_KEY && key !== STATS_KEY) {
        const dateStr = key.replace(`${STORAGE_PREFIX}-`, '')
        const date = new Date(dateStr)
        
        if (date < thirtyDaysAgo) {
          localStorage.removeItem(key)
        }
      }
    })
  } catch (error) {
    console.error('Failed to cleanup old games:', error)
  }
}

// Export/import game data
export const exportGameData = (): string => {
  const data: Record<string, any> = {}
  
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        const value = localStorage.getItem(key)
        if (value) {
          data[key] = JSON.parse(value)
        }
      }
    })
    
    return JSON.stringify(data, null, 2)
  } catch (error) {
    console.error('Failed to export game data:', error)
    return '{}'
  }
}

export const importGameData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData)
    
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.setItem(key, JSON.stringify(value))
      }
    })
    
    return true
  } catch (error) {
    console.error('Failed to import game data:', error)
    return false
  }
}