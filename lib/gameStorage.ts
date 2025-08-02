// lib/gameStorage.ts - Updated with better sync logic
import { GameState, Guess } from '@/types'
import { supabase } from '@/lib/supabase'

export interface UserProgressRow {
  id?: number
  user_id?: string | null
  date: string
  attempts: number
  completed: boolean
  guesses: Guess[]
  won?: boolean
  current_hint_level?: number
  created_at?: string
}

export interface LocalGameData extends GameState {
  createdWhileLoggedOut?: boolean
  lastModified: number
}

export class GameStorage {
  private static instance: GameStorage
  private user: any = null
  
  static getInstance(): GameStorage {
    if (!GameStorage.instance) {
      GameStorage.instance = new GameStorage()
    }
    return GameStorage.instance
  }

  async init() {
    const { data: { user } } = await supabase.auth.getUser()
    this.user = user
    
    supabase.auth.onAuthStateChange((event, session) => {
      const wasLoggedOut = !this.user
      this.user = session?.user || null
      
      if (event === 'SIGNED_IN' && wasLoggedOut) {
        // Only sync legitimate data when signing in
        this.syncLegitimateDataToDatabase()
      } else if (event === 'SIGNED_OUT') {
        // Mark future local data as created while logged out
        this.markFutureDataAsLoggedOut()
      }
    })
  }

  async saveGameState(date: string, state: GameState): Promise<void> {
    // Always save to local storage
    this.saveToLocalStorage(date, state)
    
    // Only save to database if user is logged in
    if (this.user) {
      await this.saveToDatabaseQuietly(date, state)
    }
  }

  async loadGameState(date: string): Promise<GameState | null> {
    if (this.user) {
      try {
        const dbState = await this.loadFromDatabase(date)
        if (dbState) {
          // Update local storage with DB data
          this.saveToLocalStorage(date, dbState)
          return dbState
        }
      } catch (error) {
        console.warn('Failed to load from database, using local data:', error)
      }
    }
    
    return this.loadFromLocalStorage(date)
  }

  private saveToLocalStorage(date: string, state: GameState): void {
    try {
      const localData: LocalGameData = {
        ...state,
        createdWhileLoggedOut: !this.user,
        lastModified: Date.now()
      }
      localStorage.setItem(`frameguessr-${date}`, JSON.stringify(localData))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  loadFromLocalStorage(date: string): GameState | null {
    try {
      const saved = localStorage.getItem(`frameguessr-${date}`)
      if (!saved) return null
      
      const data: LocalGameData = JSON.parse(saved)
      
      // Return game state without the tracking metadata
      const { createdWhileLoggedOut, lastModified, ...gameState } = data
      return gameState as GameState
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return null
    }
  }

  private async saveToDatabaseQuietly(date: string, state: GameState): Promise<void> {
    try {
      await this.saveToDatabase(date, state)
    } catch (error) {
      // Fail silently - no UI notifications for routine saves
      console.warn('Database save failed (silent):', error)
    }
  }

  private async saveToDatabase(date: string, state: GameState): Promise<void> {
    if (!this.user) return

    const progressData: Omit<UserProgressRow, 'id' | 'created_at'> = {
      user_id: this.user.id,
      date,
      attempts: state.attempts,
      completed: state.completed,
      guesses: state.guesses,
      won: state.won,
      current_hint_level: state.currentHintLevel
    }

    const { error } = await supabase
      .from('user_progress')
      .upsert(progressData, {
        onConflict: 'user_id,date'
      })

    if (error) {
      throw new Error(`Database save failed: ${error.message}`)
    }
  }

  private async loadFromDatabase(date: string): Promise<GameState | null> {
    if (!this.user) return null

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', this.user.id)
      .eq('date', date)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Database load failed: ${error.message}`)
    }

    const guesses = data.guesses || []
    const allAttempts = guesses.map((guess: any) => ({
      id: guess.id,
      type: 'guess' as const,
      correct: guess.correct,
      title: guess.title,
      tmdbId: guess.tmdbId,
      mediaType: guess.mediaType,
      timestamp: guess.timestamp,
    }))

    return {
      currentDate: date,
      attempts: data.attempts,
      maxAttempts: 3,
      guesses: guesses,
      allAttempts: allAttempts,
      completed: data.completed,
      won: data.won || false,
      currentHintLevel: data.current_hint_level || 1
    }
  }

  async syncLegitimateDataToDatabase(): Promise<void> {
    if (!this.user) return

    try {
      console.log('Syncing legitimate local data to database...')
      
      const localKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('frameguessr-') && 
                      !key.includes('settings') && 
                      !key.includes('stats'))

      let syncedCount = 0

      for (const key of localKeys) {
        const date = key.replace('frameguessr-', '')
        const savedData = localStorage.getItem(key)
        
        if (!savedData) continue

        try {
          const localData: LocalGameData = JSON.parse(savedData)
          
          // Skip data that was created while logged out
          if (localData.createdWhileLoggedOut) {
            console.log(`Skipping ${date} - created while logged out`)
            continue
          }

          // Only sync if there's actual progress
          if (localData.attempts > 0) {
            const dbState = await this.loadFromDatabase(date)
            
            // Only sync if DB doesn't have better data
            if (!dbState || localData.attempts >= dbState.attempts) {
              const { createdWhileLoggedOut, lastModified, ...gameState } = localData
              await this.saveToDatabase(date, gameState as GameState)
              syncedCount++
              console.log(`Synced ${date} to database`)
            }
          }
        } catch (parseError) {
          console.warn(`Failed to parse data for ${date}:`, parseError)
        }
      }
      
      if (syncedCount > 0) {
        console.log(`Successfully synced ${syncedCount} games to your account`)
      } else {
        console.log('No legitimate local data to sync')
      }
    } catch (error) {
      console.error('Failed to sync local data:', error)
    }
  }

  private markFutureDataAsLoggedOut(): void {
    // This is handled automatically in saveToLocalStorage by checking this.user
    console.log('Future game data will be marked as created while logged out')
  }

  async getUserStats(): Promise<{
    gamesPlayed: number
    gamesWon: number
    winPercentage: number
    currentStreak: number
    averageAttempts: number
    guessDistribution: number[]
  }> {
    if (!this.user) {
      return this.getLocalStorageStats()
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', this.user.id)
        .eq('completed', true)
        .order('date', { ascending: true })

      if (error) throw error

      const gamesPlayed = data.length
      const gamesWon = data.filter(game => game.won).length
      const winPercentage = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0

      let currentStreak = 0
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].won) {
          currentStreak++
        } else {
          break
        }
      }

      const wonGames = data.filter(game => game.won)
      const averageAttempts = wonGames.length > 0 
        ? wonGames.reduce((sum, game) => sum + game.attempts, 0) / wonGames.length 
        : 0

      const guessDistribution = [0, 0, 0]
      wonGames.forEach(game => {
        if (game.attempts >= 1 && game.attempts <= 3) {
          guessDistribution[game.attempts - 1]++
        }
      })

      return {
        gamesPlayed,
        gamesWon,
        winPercentage,
        currentStreak,
        averageAttempts: Math.round(averageAttempts * 10) / 10,
        guessDistribution
      }
    } catch (error) {
      console.error('Failed to get database stats:', error)
      return this.getLocalStorageStats()
    }
  }

  private getLocalStorageStats() {
    const allGames: any[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('frameguessr-') && 
          !key.includes('settings') && 
          !key.includes('stats')) {
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

    const gamesPlayed = allGames.filter(g => g.completed).length
    const gamesWon = allGames.filter(g => g.won).length
    const winPercentage = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0

    const distribution = [0, 0, 0]
    allGames.forEach(game => {
      if (game.won && game.attempts > 0 && game.attempts <= 3) {
        distribution[game.attempts - 1]++
      }
    })

    let currentStreak = 0
    allGames.sort((a, b) => a.date.localeCompare(b.date))
    for (let i = allGames.length - 1; i >= 0; i--) {
      if (allGames[i].won) {
        currentStreak++
      } else if (allGames[i].completed) {
        break
      }
    }

    const wonGames = allGames.filter(g => g.won)
    const averageAttempts = wonGames.length > 0 
      ? wonGames.reduce((sum, game) => sum + game.attempts, 0) / wonGames.length 
      : 0

    return {
      gamesPlayed,
      gamesWon,
      winPercentage,
      currentStreak,
      averageAttempts: Math.round(averageAttempts * 10) / 10,
      guessDistribution: distribution
    }
  }

  async getLeaderboard(type: 'streak' | 'speed' | 'accuracy' = 'streak'): Promise<any[]> {
    if (!this.user) return []

    try {
      let query = supabase
        .from('user_progress')
        .select(`
          user_id,
          attempts,
          won,
          date,
          profiles:user_id (
            username,
            display_name
          )
        `)
        .eq('completed', true)

      if (type === 'speed') {
        query = query
          .eq('won', true)
          .order('attempts', { ascending: true })
          .order('created_at', { ascending: true })
          .limit(10)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to get leaderboard:', error)
      return []
    }
  }

  isAuthenticated(): boolean {
    return !!this.user
  }

  getCurrentUser() {
    return this.user
  }
}

export const gameStorage = GameStorage.getInstance()