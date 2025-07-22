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
      this.user = session?.user || null
      
      if (event === 'SIGNED_IN') {
        this.syncLocalToDatabase()
      }
    })
  }

  async saveGameState(date: string, state: GameState): Promise<void> {
    this.saveToLocalStorage(date, state)
    
    if (this.user) {
      await this.saveToDatabaseWithRetry(date, state)
    }
  }

  async loadGameState(date: string): Promise<GameState | null> {
    if (this.user) {
      try {
        const dbState = await this.loadFromDatabase(date)
        if (dbState) {
          this.saveToLocalStorage(date, dbState)
          return dbState
        }
      } catch (error) {
        console.warn('Failed to load from database, falling back to localStorage:', error)
      }
    }
    
    return this.loadFromLocalStorage(date)
  }

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
        return null
      }
      throw new Error(`Database load failed: ${error.message}`)
    }

    return {
      currentDate: date,
      attempts: data.attempts,
      maxAttempts: 3,
      guesses: data.guesses || [],
      completed: data.completed,
      won: data.won || false,
      currentHintLevel: data.current_hint_level || 1
    }
  }

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
          const dbState = await this.loadFromDatabase(date)
          
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