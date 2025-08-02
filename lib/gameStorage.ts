// lib/gameStorage.ts - Enhanced with sophisticated data sync logic
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
  syncStatus?: 'local-only' | 'synced' | 'conflict'
}

export interface DataConflict {
  date: string
  localData: LocalGameData
  cloudData: GameState
  type: 'local-only' | 'cloud-newer' | 'local-newer' | 'different-progress'
}

export interface SyncDecision {
  type: 'import-all' | 'clean-start' | 'merge-selected' | 'keep-account-only'
  selectedDates?: string[]
  clearLocalOnLogout?: boolean
}

export class GameStorage {
  private static instance: GameStorage
  private user: any = null
  private syncDecision: SyncDecision | null = null
  
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
        // Don't auto-sync - wait for user decision
        this.handleSignIn()
      } else if (event === 'SIGNED_OUT') {
        this.handleSignOut()
      }
    })
  }

  private async handleSignIn() {
    // Check for conflicts and present options to user
    const conflicts = await this.analyzeDataConflicts()
    
    if (conflicts.length === 0) {
      // No local data to worry about
      return
    }

    // This will trigger UI to show data merge modal
    // The decision will be stored via setSyncDecision()
    window.dispatchEvent(new CustomEvent('show-data-merge-modal', {
      detail: { conflicts }
    }))
  }

  private async handleSignOut() {
    if (this.syncDecision?.clearLocalOnLogout) {
      // Clear local storage as promised when they chose to import data
      this.clearAllLocalData()
    }
    this.syncDecision = null
  }

  setSyncDecision(decision: SyncDecision) {
    this.syncDecision = decision
    this.executeSyncDecision(decision)
  }

  private async executeSyncDecision(decision: SyncDecision) {
    switch (decision.type) {
      case 'import-all':
        await this.importAllLocalData()
        break
      case 'merge-selected':
        if (decision.selectedDates) {
          await this.importSelectedDates(decision.selectedDates)
        }
        break
      case 'clean-start':
        // Keep local data for guest play, don't sync anything
        break
      case 'keep-account-only':
        // Optionally clear local data conflicts
        break
    }
  }

  private async analyzeDataConflicts(): Promise<DataConflict[]> {
    if (!this.user) return []

    const conflicts: DataConflict[] = []
    const localDates = this.getAllLocalDates()
    
    // Get all cloud data for this user
    const { data: cloudData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', this.user.id)

    const cloudDateMap = new Map(cloudData?.map(item => [item.date, item]) || [])

    for (const date of localDates) {
      const localData = this.loadFromLocalStorage(date)
      if (!localData) continue

      const localDataFull = this.getLocalDataWithMetadata(date)
      if (!localDataFull) continue

      const cloudItem = cloudDateMap.get(date)

      if (!cloudItem) {
        // Local-only data
        conflicts.push({
          date,
          localData: localDataFull,
          cloudData: localData, // Use as placeholder
          type: 'local-only'
        })
      } else {
        // Compare data
        const cloudGameState = this.cloudRowToGameState(cloudItem, date)
        
        if (this.shouldPreferLocal(localDataFull, cloudGameState)) {
          conflicts.push({
            date,
            localData: localDataFull,
            cloudData: cloudGameState,
            type: 'local-newer'
          })
        } else if (this.hasSignificantDifference(localData, cloudGameState)) {
          conflicts.push({
            date,
            localData: localDataFull,
            cloudData: cloudGameState,
            type: 'different-progress'
          })
        }
      }
    }

    return conflicts
  }

  private shouldPreferLocal(localData: LocalGameData, cloudData: GameState): boolean {
    // Prefer local if it has more progress
    if (localData.completed && !cloudData.completed) return true
    if (localData.won && !cloudData.won) return true
    if (localData.attempts > cloudData.attempts) return true
    
    // Prefer local if it's newer and has progress
    if (localData.attempts > 0 && localData.lastModified > Date.now() - 24 * 60 * 60 * 1000) {
      return true
    }
    
    return false
  }

  private hasSignificantDifference(localData: GameState, cloudData: GameState): boolean {
    return localData.attempts !== cloudData.attempts ||
           localData.completed !== cloudData.completed ||
           localData.won !== cloudData.won ||
           localData.currentHintLevel !== cloudData.currentHintLevel
  }

  private getAllLocalDates(): string[] {
    const dates: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('frameguessr-') && 
          !key.includes('settings') && 
          !key.includes('stats') &&
          !key.includes('cookie')) {
        dates.push(key.replace('frameguessr-', ''))
      }
    }
    return dates
  }

  private getLocalDataWithMetadata(date: string): LocalGameData | null {
    try {
      const saved = localStorage.getItem(`frameguessr-${date}`)
      if (!saved) return null
      return JSON.parse(saved) as LocalGameData
    } catch (error) {
      console.error('Failed to load local data with metadata:', error)
      return null
    }
  }

  private cloudRowToGameState(row: UserProgressRow, date: string): GameState {
    const guesses = row.guesses || []
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
      attempts: row.attempts,
      maxAttempts: 3,
      guesses: guesses,
      allAttempts: allAttempts,
      completed: row.completed,
      won: row.won || false,
      currentHintLevel: row.current_hint_level || 1
    }
  }

  private async importAllLocalData() {
    const localDates = this.getAllLocalDates()
    await this.importSelectedDates(localDates)
  }

  private async importSelectedDates(dates: string[]) {
    for (const date of dates) {
      const localData = this.loadFromLocalStorage(date)
      if (localData && (localData.attempts > 0 || localData.completed)) {
        try {
          await this.saveToDatabase(date, localData)
          // Mark as synced
          const localDataFull = this.getLocalDataWithMetadata(date)
          if (localDataFull) {
            localDataFull.syncStatus = 'synced'
            this.saveToLocalStorage(date, localDataFull)
          }
        } catch (error) {
          console.error(`Failed to import data for ${date}:`, error)
        }
      }
    }
  }

  private clearAllLocalData() {
    const dates = this.getAllLocalDates()
    dates.forEach(date => {
      localStorage.removeItem(`frameguessr-${date}`)
    })
  }

  async saveGameState(date: string, state: GameState): Promise<void> {
    // Always save to local storage
    this.saveToLocalStorage(date, state)
    
    // Only save to database if user is logged in and decision allows it
    if (this.user && this.shouldSyncToCloud()) {
      await this.saveToDatabaseQuietly(date, state)
    }
  }

  private shouldSyncToCloud(): boolean {
    if (!this.syncDecision) return true // Default behavior
    return this.syncDecision.type !== 'clean-start'
  }

  async loadGameState(date: string): Promise<GameState | null> {
    if (this.user && this.shouldLoadFromCloud()) {
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

  private shouldLoadFromCloud(): boolean {
    if (!this.syncDecision) return true // Default behavior
    return this.syncDecision.type !== 'clean-start'
  }

  private saveToLocalStorage(date: string, state: GameState): void {
    try {
      const localData: LocalGameData = {
        ...state,
        createdWhileLoggedOut: !this.user,
        lastModified: Date.now(),
        syncStatus: this.user ? 'synced' : 'local-only'
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
      const { createdWhileLoggedOut, lastModified, syncStatus, ...gameState } = data
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

    return this.cloudRowToGameState(data, date)
  }

  // Get summary of local vs cloud data for UI
  async getDataSummary(): Promise<{
    localGames: number
    localCompleted: number
    localInProgress: number
    cloudGames: number
    conflicts: number
  }> {
    const localDates = this.getAllLocalDates()
    let localCompleted = 0
    let localInProgress = 0

    localDates.forEach(date => {
      const data = this.loadFromLocalStorage(date)
      if (data) {
        if (data.completed) {
          localCompleted++
        } else if (data.attempts > 0) {
          localInProgress++
        }
      }
    })

    let cloudGames = 0
    if (this.user) {
      const { data: cloudData } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', this.user.id)
      cloudGames = cloudData?.length || 0
    }

    const conflicts = await this.analyzeDataConflicts()

    return {
      localGames: localDates.length,
      localCompleted,
      localInProgress,
      cloudGames,
      conflicts: conflicts.length
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
    if (!this.user || this.syncDecision?.type === 'clean-start') {
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

  getSyncDecision(): SyncDecision | null {
    return this.syncDecision
  }
}

export const gameStorage = GameStorage.getInstance()