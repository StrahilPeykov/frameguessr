import { GameState, Guess } from '@/types'
import { 
  getValidatedGameState, 
  hasProgress, 
  hasMeaningfulProgress,
  mergeGameStates,
  getGameStatus,
  createDefaultGameState
} from '@/utils/gameStateValidation'
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
      // Dispatch event to notify components
      window.dispatchEvent(new Event('auth-data-cleared'))
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
    
    // Dispatch event for components to react
    window.dispatchEvent(new CustomEvent('sync-decision-changed', {
      detail: { decision }
    }))
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

    return conflicts
  }

  private shouldPreferLocal(localData: LocalGameData, cloudData: GameState): boolean {
    // Use validation utils for consistent status checking
    const localStatus = getGameStatus(localData)
    const cloudStatus = getGameStatus(cloudData)
    
    // Prefer local if it's won and cloud isn't
    if (localStatus === 'completed-won' && cloudStatus !== 'completed-won') return true
    
    // Prefer local if it has more progress
    if (localData.attempts > cloudData.attempts) return true
    if (localData.currentHintLevel > cloudData.currentHintLevel) return true
    
    // Prefer local if it's newer (played in last 24 hours)
    if (localData.lastModified > Date.now() - 24 * 60 * 60 * 1000) {
      return true
    }
    
    return false
  }

  private shouldPreferCloud(localData: LocalGameData, cloudData: GameState): boolean {
    // Use validation utils for consistent status checking
    const localStatus = getGameStatus(localData)
    const cloudStatus = getGameStatus(cloudData)
    
    // Prefer cloud if it's won and local isn't
    if (cloudStatus === 'completed-won' && localStatus !== 'completed-won') return true
    
    // Prefer cloud if it has more progress
    if (cloudData.attempts > localData.attempts) return true
    if (cloudData.currentHintLevel > localData.currentHintLevel) return true
    
    return false
  }

  private hasSignificantDifference(localData: GameState, cloudData: GameState): boolean {
    // Use validation to ensure both states are normalized before comparison
    const validatedLocal = getValidatedGameState(localData)
    const validatedCloud = getValidatedGameState(cloudData)
    
    return (
      validatedLocal.attempts !== validatedCloud.attempts ||
      validatedLocal.completed !== validatedCloud.completed ||
      validatedLocal.won !== validatedCloud.won ||
      validatedLocal.currentHintLevel !== validatedCloud.currentHintLevel ||
      validatedLocal.guesses.length !== validatedCloud.guesses.length
    )
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

  // Use validation utils instead of custom conversion
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

    const rawState: GameState = {
      currentDate: date,
      attempts: row.attempts || 0,
      maxAttempts: 3,
      guesses: guesses,
      allAttempts: allAttempts,
      completed: row.completed || false,
      won: row.won || false,
      currentHintLevel: row.current_hint_level || 1
    }

    // Use validation to ensure consistent state
    return getValidatedGameState(rawState)
  }

  private async importAllLocalData() {
    const localDates = this.getAllLocalDates()
    const datesToImport = localDates.filter(date => {
      const localData = this.loadFromLocalStorage(date)
      return localData && hasMeaningfulProgress(localData)
    })
    
    await this.importSelectedDates(datesToImport)
  }

  private async importSelectedDates(dates: string[]) {
    const importPromises: Promise<void>[] = []
    
    for (const date of dates) {
      const localData = this.loadFromLocalStorage(date)
      if (localData && hasMeaningfulProgress(localData)) {
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
    
    // Dispatch event to notify components
    window.dispatchEvent(new Event('game-data-imported'))
  }

  private clearAllLocalData() {
    const dates = this.getAllLocalDates()
    dates.forEach(date => {
      localStorage.removeItem(`frameguessr-${date}`)
    })
  }

  async saveGameState(date: string, state: GameState): Promise<void> {
    // Validate state before saving
    const validatedState = getValidatedGameState(state)
    
    // Always save to local storage
    this.saveToLocalStorage(date, validatedState)
    
    // Only save to database if user is logged in and decision allows it
    if (this.user && this.shouldSyncToCloud()) {
      await this.saveToDatabaseQuietly(date, validatedState)
    }
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('game-data-changed', {
      detail: { date, state: validatedState }
    }))
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
      
      // Use validation utils to ensure valid state
      return getValidatedGameState(gameState)
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

    // Ensure state is validated
    const validatedState = getValidatedGameState(state)

    const progressData: Omit<UserProgressRow, 'id' | 'created_at'> = {
      user_id: this.user.id,
      date,
      attempts: validatedState.attempts,
      completed: validatedState.completed,
      guesses: validatedState.guesses,
      won: validatedState.won,
      current_hint_level: validatedState.currentHintLevel
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
        const status = getGameStatus(data)
        if (status === 'completed-won' || status === 'completed-lost') {
          localCompleted++
        } else if (status === 'in-progress') {
          localInProgress++
        }
      }
    })

    let cloudGames = 0
    if (this.user) {
      const { data: cloudData } = await supabase
        .from('user_progress')
        .select('id, completed, attempts')
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

      const validatedGames = data.map(row => ({
        date: row.date,
        state: this.cloudRowToGameState(row, row.date)
      }))

      return this.calculateStats(validatedGames)
    } catch (error) {
      console.error('Failed to get database stats:', error)
      return this.getLocalStorageStats()
    }
  }

  private getLocalStorageStats() {
    const allGames: { date: string; state: GameState }[] = []
    
    for (const date of this.getAllLocalDates()) {
      const gameState = this.loadFromLocalStorage(date)
      if (gameState && hasProgress(gameState)) {
        allGames.push({ date, state: gameState })
      }
    }

    return this.calculateStats(allGames)
  }

  private calculateStats(games: { date: string; state: GameState }[]) {
    const completedGames = games.filter(g => g.state.completed)
    const gamesPlayed = completedGames.length
    const gamesWon = completedGames.filter(g => g.state.won).length
    const gamesInProgress = games.filter(g => !g.state.completed).length
    const winPercentage = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0

    // Calculate current streak
    let currentStreak = 0
    const sortedGames = completedGames.sort((a, b) => a.date.localeCompare(b.date))
    for (let i = sortedGames.length - 1; i >= 0; i--) {
      if (sortedGames[i].state.won) {
        currentStreak++
      } else {
        break
      }
    }

    // Calculate average attempts and distribution
    const wonGames = completedGames.filter(g => g.state.won)
    const averageAttempts = wonGames.length > 0 
      ? wonGames.reduce((sum, game) => sum + game.state.attempts, 0) / wonGames.length 
      : 0

    const guessDistribution = [0, 0, 0]
    wonGames.forEach(game => {
      if (game.state.attempts >= 1 && game.state.attempts <= 3) {
        guessDistribution[game.state.attempts - 1]++
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