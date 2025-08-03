// lib/gameStorage.ts - Complete implementation with all sync scenarios
import { GameState, Guess, getGameStatus, hasProgress } from '@/types'
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
  cloudData?: GameState
  type: 'local-only' | 'cloud-only' | 'local-newer' | 'cloud-newer' | 'different-progress'
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
    
    // Load saved sync decision
    const savedDecision = localStorage.getItem('frameguessr-sync-decision')
    if (savedDecision && this.user) {
      try {
        this.syncDecision = JSON.parse(savedDecision)
      } catch (e) {
        console.error('Failed to parse sync decision:', e)
      }
    }
    
    supabase.auth.onAuthStateChange((event, session) => {
      const wasLoggedOut = !this.user
      this.user = session?.user || null
      
      if (event === 'SIGNED_IN' && wasLoggedOut) {
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
      // No conflicts, nothing to merge
      return
    }

    // Check if account is empty (all conflicts are local-only)
    const isAccountEmpty = conflicts.every(c => c.type === 'local-only')
    
    // Dispatch event to show data merge modal
    window.dispatchEvent(new CustomEvent('show-data-merge-modal', {
      detail: { 
        conflicts,
        isAccountEmpty 
      }
    }))
  }

  private async handleSignOut() {
    if (this.syncDecision?.clearLocalOnLogout) {
      // Clear local storage as promised when they chose to import data
      this.clearAllLocalData()
    }
    // Clear sync decision on logout
    this.syncDecision = null
    localStorage.removeItem('frameguessr-sync-decision')
  }

  setSyncDecision(decision: SyncDecision) {
    this.syncDecision = decision
    // Persist the decision
    if (this.user) {
      localStorage.setItem('frameguessr-sync-decision', JSON.stringify(decision))
    }
    this.executeSyncDecision(decision)
  }

  getSyncDecision(): SyncDecision | null {
    return this.syncDecision
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
        // Don't import local data, just use account data
        break
    }
  }

  private async analyzeDataConflicts(): Promise<DataConflict[]> {
    if (!this.user) return []

    const conflicts: DataConflict[] = []
    const localDates = this.getAllLocalDates()
    
    // Get all cloud data for this user
    const { data: cloudData, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', this.user.id)

    if (error) {
      console.error('Failed to fetch cloud data:', error)
      return []
    }

    const cloudDateMap = new Map(cloudData?.map(item => [item.date, item]) || [])

    // Check each local date
    for (const date of localDates) {
      const localData = this.getLocalDataWithMetadata(date)
      if (!localData || !hasProgress(localData)) continue // Skip unplayed games

      const cloudItem = cloudDateMap.get(date)

      if (!cloudItem) {
        // Local-only data (not in cloud)
        conflicts.push({
          date,
          localData,
          type: 'local-only'
        })
      } else {
        // Both have data - compare them
        const cloudGameState = this.cloudRowToGameState(cloudItem, date)
        
        // Check if they're different
        if (this.hasSignificantDifference(localData, cloudGameState)) {
          // Determine which is newer/better
          if (this.shouldPreferLocal(localData, cloudGameState)) {
            conflicts.push({
              date,
              localData,
              cloudData: cloudGameState,
              type: 'local-newer'
            })
          } else if (this.shouldPreferCloud(localData, cloudGameState)) {
            conflicts.push({
              date,
              localData,
              cloudData: cloudGameState,
              type: 'cloud-newer'
            })
          } else {
            // Different progress, let user choose
            conflicts.push({
              date,
              localData,
              cloudData: cloudGameState,
              type: 'different-progress'
            })
          }
        }
      }
    }

    // Check for cloud-only data (games played on other devices)
    cloudDateMap.forEach((cloudItem, date) => {
      if (!localDates.includes(date)) {
        const cloudGameState = this.cloudRowToGameState(cloudItem, date)
        if (hasProgress(cloudGameState)) {
          // Don't add cloud-only as conflicts - these will sync down automatically
          // Only conflicts are when local has data that cloud doesn't or differs
        }
      }
    })

    return conflicts
  }

  private shouldPreferLocal(localData: LocalGameData, cloudData: GameState): boolean {
    // Prefer local if it has more progress
    if (localData.completed && !cloudData.completed) return true
    if (localData.won && !cloudData.won) return true
    if (localData.attempts > cloudData.attempts) return true
    if (localData.currentHintLevel > cloudData.currentHintLevel) return true
    
    // Prefer local if it's newer (played in last 24 hours)
    if (localData.lastModified > Date.now() - 24 * 60 * 60 * 1000) {
      return true
    }
    
    return false
  }

  private shouldPreferCloud(localData: LocalGameData, cloudData: GameState): boolean {
    // Prefer cloud if it has more progress
    if (cloudData.completed && !localData.completed) return true
    if (cloudData.won && !localData.won) return true
    if (cloudData.attempts > localData.attempts) return true
    if (cloudData.currentHintLevel > localData.currentHintLevel) return true
    
    return false
  }

  private hasSignificantDifference(localData: GameState, cloudData: GameState): boolean {
    return localData.attempts !== cloudData.attempts ||
           localData.completed !== cloudData.completed ||
           localData.won !== cloudData.won ||
           localData.currentHintLevel !== cloudData.currentHintLevel ||
           localData.guesses.length !== cloudData.guesses.length
  }

  private getAllLocalDates(): string[] {
    const dates: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('frameguessr-') && 
          !key.includes('settings') && 
          !key.includes('stats') &&
          !key.includes('cookie') &&
          !key.includes('theme') &&
          !key.includes('sync-decision')) {
        dates.push(key.replace('frameguessr-', ''))
      }
    }
    return dates
  }

  private getLocalDataWithMetadata(date: string): LocalGameData | null {
    try {
      const saved = localStorage.getItem(`frameguessr-${date}`)
      if (!saved) return null
      
      const parsed = JSON.parse(saved)
      // Handle old format that might not have metadata
      if (!parsed.lastModified) {
        return {
          ...parsed,
          lastModified: Date.now() - 30 * 24 * 60 * 60 * 1000, // Assume old
          syncStatus: 'local-only'
        }
      }
      return parsed as LocalGameData
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
    const datesToImport = localDates.filter(date => {
      const localData = this.loadFromLocalStorage(date)
      return localData && hasProgress(localData)
    })
    
    await this.importSelectedDates(datesToImport)
  }

  private async importSelectedDates(dates: string[]) {
    const importPromises: Promise<void>[] = []
    
    for (const date of dates) {
      const localData = this.loadFromLocalStorage(date)
      if (localData && hasProgress(localData)) {
        importPromises.push(this.saveToDatabase(date, localData).then(() => {
          // Mark as synced in local storage
          const localDataFull = this.getLocalDataWithMetadata(date)
          if (localDataFull) {
            localDataFull.syncStatus = 'synced'
            this.saveToLocalStorage(date, localDataFull)
          }
        }).catch(error => {
          console.error(`Failed to import data for ${date}:`, error)
        }))
      }
    }
    
    await Promise.all(importPromises)
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
    // If logged in and should load from cloud
    if (this.user && this.shouldLoadFromCloud()) {
      try {
        const dbState = await this.loadFromDatabase(date)
        if (dbState) {
          // Update local storage with cloud data
          this.saveToLocalStorage(date, dbState)
          return dbState
        }
      } catch (error) {
        console.warn('Failed to load from database, trying local:', error)
      }
    }
    
    // Load from local storage (either as fallback or primary source)
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
        syncStatus: this.user && this.shouldSyncToCloud() ? 'synced' : 'local-only'
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
      
      const data = JSON.parse(saved)
      
      // Extract game state without metadata
      const { createdWhileLoggedOut, lastModified, syncStatus, ...gameState } = data
      
      // Ensure we have all required fields
      return {
        currentDate: date,
        attempts: gameState.attempts || 0,
        maxAttempts: gameState.maxAttempts || 3,
        guesses: gameState.guesses || [],
        allAttempts: gameState.allAttempts || gameState.guesses || [],
        completed: gameState.completed || false,
        won: gameState.won || false,
        currentHintLevel: gameState.currentHintLevel || 1,
        ...gameState
      } as GameState
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
        return null // No data found
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
      if (data && hasProgress(data)) {
        if (data.completed) {
          localCompleted++
        } else {
          localInProgress++
        }
      }
    })

    let cloudGames = 0
    if (this.user) {
      const { data: cloudData } = await supabase
        .from('user_progress')
        .select('id, completed')
        .eq('user_id', this.user.id)
      cloudGames = cloudData?.filter(item => item.completed || item.attempts > 0).length || 0
    }

    const conflicts = await this.analyzeDataConflicts()

    return {
      localGames: localCompleted + localInProgress,
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
    gamesInProgress: number
  }> {
    if (!this.user || this.syncDecision?.type === 'clean-start') {
      return this.getLocalStorageStats()
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', this.user.id)
        .order('date', { ascending: true })

      if (error) throw error

      const completedGames = data.filter(game => game.completed)
      const gamesPlayed = completedGames.length
      const gamesWon = completedGames.filter(game => game.won).length
      const gamesInProgress = data.filter(game => !game.completed && game.attempts > 0).length
      const winPercentage = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0

      // Calculate current streak
      let currentStreak = 0
      for (let i = completedGames.length - 1; i >= 0; i--) {
        if (completedGames[i].won) {
          currentStreak++
        } else {
          break
        }
      }

      const wonGames = completedGames.filter(game => game.won)
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
        guessDistribution,
        gamesInProgress
      }
    } catch (error) {
      console.error('Failed to get database stats:', error)
      return this.getLocalStorageStats()
    }
  }

  private getLocalStorageStats() {
    const allGames: LocalGameData[] = []
    
    for (const date of this.getAllLocalDates()) {
      const gameData = this.getLocalDataWithMetadata(date)
      if (gameData && hasProgress(gameData)) {
        allGames.push(gameData)
      }
    }

    const completedGames = allGames.filter(g => g.completed)
    const gamesPlayed = completedGames.length
    const gamesWon = completedGames.filter(g => g.won).length
    const gamesInProgress = allGames.filter(g => !g.completed).length
    const winPercentage = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0

    const distribution = [0, 0, 0]
    completedGames.forEach(game => {
      if (game.won && game.attempts > 0 && game.attempts <= 3) {
        distribution[game.attempts - 1]++
      }
    })

    // Calculate current streak
    let currentStreak = 0
    const sortedGames = completedGames.sort((a, b) => 
      a.currentDate.localeCompare(b.currentDate)
    )
    for (let i = sortedGames.length - 1; i >= 0; i--) {
      if (sortedGames[i].won) {
        currentStreak++
      } else {
        break
      }
    }

    const wonGames = completedGames.filter(g => g.won)
    const averageAttempts = wonGames.length > 0 
      ? wonGames.reduce((sum, game) => sum + game.attempts, 0) / wonGames.length 
      : 0

    return {
      gamesPlayed,
      gamesWon,
      winPercentage,
      currentStreak,
      averageAttempts: Math.round(averageAttempts * 10) / 10,
      guessDistribution: distribution,
      gamesInProgress
    }
  }

  // Force sync all local data (for manual sync button)
  async forceSyncAllData() {
    if (!this.user) {
      throw new Error('Must be authenticated to sync data')
    }
    
    const conflicts = await this.analyzeDataConflicts()
    const localOnlyDates = conflicts
      .filter(c => c.type === 'local-only')
      .map(c => c.date)
    
    if (localOnlyDates.length > 0) {
      await this.importSelectedDates(localOnlyDates)
    }
    
    return { 
      success: true, 
      syncedCount: localOnlyDates.length 
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