import { GameState, Guess } from '@/types/game'
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
    // Check for existing session
    const { data: { user } } = await supabase.auth.getUser()
    this.user = user
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.user = session?.user || null
      
      if (event === 'SIGNED_IN') {
        this.syncLocalToDatabase()
      }
    })
  }

  // Save game state (hybrid approach)
  async saveGameState(date: string, state: GameState): Promise<void> {
    // Always save to localStorage first (for offline support)
    this.saveToLocalStorage(date, state)
    
    // Sync to database if user is authenticated
    if (this.user) {
      await this.saveToDatabaseWithRetry(date, state)
    }
  }

  // Load game state (prioritize database if available)
  async loadGameState(date: string): Promise<GameState | null> {
    if (this.user) {
      try {
        const dbState = await this.loadFromDatabase(date)
        if (dbState) {
          // Update localStorage with latest from database
          this.saveToLocalStorage(date, dbState)
          return dbState
        }
      } catch (error) {
        console.warn('Failed to load from database, falling back to localStorage:', error)
      }
    }
    
    // Fallback to localStorage
    return this.loadFromLocalStorage(date)
  }

  // Private methods
  private saveToLocalStorage(date: string, state: GameState): void {
    try {
      localStorage.setItem(`frameguessr-${date}`, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  private loadFromLocalStorage(date: string): GameState | null {
    try {
      const saved = localStorage.getItem(`frameguessr-${date}`)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return null
    }
  }

  private async saveToDatabaseWithRetry(date: string, state: GameState, retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.saveToDatabase(date, state)
        return
      } catch (error) {
        console.warn(`Database save attempt ${i + 1} failed:`, error)
        if (i === retries - 1) throw error
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
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
        // No data found - this is normal for new dates
        return null
      }
      throw new Error(`Database load failed: ${error.message}`)
    }

    // Convert database row to GameState
    return {
      currentDate: date,
      attempts: data.attempts,
      maxAttempts: 3, // This should probably be configurable
      guesses: data.guesses || [],
      completed: data.completed,
      won: data.won || false,
      currentHintLevel: data.current_hint_level || 1
    }
  }

  // Sync all localStorage data to database (called when user signs in)
  async syncLocalToDatabase(): Promise<void> {
    if (!this.user) return

    try {
      console.log('Syncing local game data to database...')
      
      const localKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('frameguessr-') && 
                      !key.includes('settings') && 
                      !key.includes('stats'))

      for (const key of localKeys) {
        const date = key.replace('frameguessr-', '')
        const localState = this.loadFromLocalStorage(date)
        
        if (localState && localState.attempts > 0) {
          // Check if database already has this data
          const dbState = await this.loadFromDatabase(date)
          
          // Only sync if database doesn't have data or local is more recent
          if (!dbState || localState.attempts >= dbState.attempts) {
            await this.saveToDatabase(date, localState)
            console.log(`Synced ${date} to database`)
          }
        }
      }
      
      console.log('Local sync completed')
    } catch (error) {
      console.error('Failed to sync local data:', error)
    }
  }

  // Get user statistics
  async getUserStats(): Promise<{
    gamesPlayed: number
    gamesWon: number
    winPercentage: number
    currentStreak: number
    averageAttempts: number
    guessDistribution: number[]
  }> {
    if (!this.user) {
      // Fallback to localStorage stats
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

      // Calculate current streak
      let currentStreak = 0
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].won) {
          currentStreak++
        } else {
          break
        }
      }

      // Calculate average attempts for won games
      const wonGames = data.filter(game => game.won)
      const averageAttempts = wonGames.length > 0 
        ? wonGames.reduce((sum, game) => sum + game.attempts, 0) / wonGames.length 
        : 0

      // Calculate guess distribution
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
    // Fallback to localStorage-based stats (existing implementation)
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
    // Simple streak calculation for localStorage
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

  // Get leaderboard data (new feature!)
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
        // Fastest solvers (lowest attempts for won games)
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

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.user
  }

  // Get current user
  getCurrentUser() {
    return this.user
  }
}

// Singleton instance
export const gameStorage = GameStorage.getInstance()