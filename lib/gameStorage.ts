import { GameState, Guess, Attempt } from '@/types'
import {
  getValidatedGameState,
  hasProgress,
  hasMeaningfulProgress,
  getGameStatus
} from '@/utils/gameStateValidation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface UserProgressRow {
  id?: number
  user_id?: string | null
  date: string
  attempts: number
  completed: boolean
  guesses: Guess[]
  all_attempts?: Attempt[]
  won?: boolean
  current_hint_level?: number
  max_attempts?: number
  last_modified?: string
  created_at?: string
  hint_levels_viewed?: number[]
}

export interface LocalGameData extends GameState {
  lastModified: number
  version?: number
  userId?: string | null
}

export interface DataConflict {
  date: string
  localData: LocalGameData
  cloudData?: GameState
  type: 'mergeable' | 'not-mergeable'
}

export interface SyncDecision {
  type: 'merge-selected'
  selectedDates: string[]
}

export class GameStorage {
  private static instance: GameStorage
    private user: User | null = null
  
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
    })
  }

  async getMergeableConflicts(): Promise<DataConflict[]> {
    if (!this.user) return []

    const conflicts: DataConflict[] = []
    const localDates = this.getAllLocalDates()
    
    const { data: cloudData, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', this.user.id)

    if (error) {
      console.error('Failed to fetch cloud data:', error)
      return []
    }

    const cloudDateMap = new Map(cloudData?.map(item => [item.date, item]) || [])

    for (const date of localDates) {
      const localData = this.getLocalDataWithMetadata(date)
      if (!localData || !hasProgress(localData)) continue

      const cloudItem = cloudDateMap.get(date)

      if (!cloudItem || cloudItem.attempts === 0) {
        conflicts.push({
          date,
          localData,
          type: 'mergeable'
        })
      } else {
        const cloudGameState = this.cloudRowToGameState(cloudItem, date)
        conflicts.push({
          date,
          localData,
          cloudData: cloudGameState,
          type: 'not-mergeable'
        })
      }
    }

    return conflicts
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
      
      if (!parsed.lastModified) {
        return {
          ...parsed,
          lastModified: Date.now() - 30 * 24 * 60 * 60 * 1000,
          version: 1,
          userId: parsed.userId ?? null
        }
      }
      
      if (parsed.version === 1 && (!parsed.allAttempts || parsed.allAttempts.length === 0)) {
        if (parsed.guesses && parsed.guesses.length > 0) {
          parsed.allAttempts = parsed.guesses.map((guess: Guess) => ({
            id: guess.id,
            type: 'guess' as const,
            correct: guess.correct,
            title: guess.title,
            tmdbId: guess.tmdbId,
            mediaType: guess.mediaType,
            timestamp: guess.timestamp,
          }))
          parsed.version = 2

          this.saveToLocalStorage(date, parsed)
        }
      }

      if (parsed.userId === undefined) {
        parsed.userId = null
      }

      return parsed as LocalGameData
    } catch (error) {
      console.error('Failed to load local data with metadata:', error)
      return null
    }
  }

  private cloudRowToGameState(row: UserProgressRow, date: string): GameState {
    const guesses = row.guesses || []
    
    let allAttempts = row.all_attempts || []
    
    if (allAttempts.length === 0 && guesses.length > 0) {
        allAttempts = guesses.map((guess: Guess) => ({
          id: guess.id,
          type: 'guess' as const,
          correct: guess.correct,
          title: guess.title,
        tmdbId: guess.tmdbId,
        mediaType: guess.mediaType,
        timestamp: guess.timestamp,
      }))
    }

    const rawState: GameState = {
      currentDate: date,
      attempts: row.attempts || 0,
      maxAttempts: row.max_attempts || 3,
      guesses: guesses,
      allAttempts: allAttempts,
      completed: row.completed || false,
      won: row.won || false,
      currentHintLevel: row.current_hint_level || 1
    }

    return getValidatedGameState(rawState)
  }

  async mergeSelectedDates(dates: string[]) {
    const mergePromises: Promise<void>[] = []
    
    for (const date of dates) {
      const localData = this.loadFromLocalStorage(date)
      if (localData && hasMeaningfulProgress(localData)) {
        mergePromises.push(this.saveToDatabase(date, localData).then(() => {
          // Update local storage to mark data as belonging to this user
          this.saveToLocalStorage(date, localData)
          console.log(`Merged data for ${date}`)
        }).catch(error => {
          console.error(`Failed to merge data for ${date}:`, error)
        }))
      }
    }
    
    await Promise.all(mergePromises)
    
    window.dispatchEvent(new Event('game-data-imported'))
  }

  async saveGameState(date: string, state: GameState): Promise<void> {
    const validatedState = getValidatedGameState(state)
    
    this.saveToLocalStorage(date, validatedState)
    
    if (this.user) {
      await this.saveToDatabaseQuietly(date, validatedState)
    }
    
    window.dispatchEvent(new CustomEvent('game-data-changed', {
      detail: { date, state: validatedState }
    }))
  }

  async loadGameState(date: string): Promise<GameState | null> {
    if (this.user) {
      try {
        const dbState = await this.loadFromDatabase(date)
        if (dbState) {
          return dbState
        }
      } catch (error) {
        console.warn('Failed to load from database, trying local:', error)
      }

      const localData = this.getLocalDataWithMetadata(date)
      if (localData && localData.userId === this.user.id) {
        const { lastModified: _lm, version: _v, userId: _uid, ...gameState } = localData
        return getValidatedGameState(gameState)
      }

      return null
    }

    return this.loadFromLocalStorage(date)
  }

  private saveToLocalStorage(date: string, state: GameState | LocalGameData): void {
    try {
      const localData: LocalGameData = {
        ...state,
        lastModified: Date.now(),
        version: 2,
        userId:
          (state as LocalGameData).userId !== undefined
            ? (state as LocalGameData).userId
            : this.user?.id || null
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

      const { lastModified: _lm, version: _v, userId: _uid, ...gameState } = data

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

    const validatedState = getValidatedGameState(state)

    const progressData: Omit<UserProgressRow, 'id' | 'created_at'> = {
      user_id: this.user.id,
      date,
      attempts: validatedState.attempts,
      completed: validatedState.completed,
      guesses: validatedState.guesses,
      all_attempts: validatedState.allAttempts,
      won: validatedState.won,
      current_hint_level: validatedState.currentHintLevel,
      max_attempts: validatedState.maxAttempts
    }

    const { error } = await supabase
      .from('user_progress')
      .upsert(progressData, {
        onConflict: 'user_id,date'
      })

    if (error) {
      if (error.code === '23505') {
        console.warn(`Unique constraint violation for ${date}, retrying...`)
        
        const { error: updateError } = await supabase
          .from('user_progress')
          .update(progressData)
          .eq('user_id', this.user.id)
          .eq('date', date)
        
        if (updateError) {
          throw new Error(`Database update failed: ${updateError.message}`)
        }
      } else {
        throw new Error(`Database save failed: ${error.message}`)
      }
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

  async getDataSummary(): Promise<{
    localGames: number
    localCompleted: number
    localInProgress: number
    cloudGames: number
    mergeableGames: number
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

    const conflicts = await this.getMergeableConflicts()
    const mergeableGames = conflicts.filter(c => c.type === 'mergeable').length

    return {
      localGames: localCompleted + localInProgress,
      localCompleted,
      localInProgress,
      cloudGames,
      mergeableGames
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
    if (!this.user) {
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

    let currentStreak = 0
    const sortedGames = completedGames.sort((a, b) => a.date.localeCompare(b.date))
    for (let i = sortedGames.length - 1; i >= 0; i--) {
      if (sortedGames[i].state.won) {
        currentStreak++
      } else {
        break
      }
    }

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

  async saveHintLevelViewed(date: string, hintLevel: number): Promise<void> {
    if (!this.user) return
    
    try {
      const { data: currentData } = await supabase
        .from('user_progress')
        .select('hint_levels_viewed')
        .eq('user_id', this.user.id)
        .eq('date', date)
        .single()
      
      const currentLevels = currentData?.hint_levels_viewed || [1]
      
      if (!currentLevels.includes(hintLevel)) {
        const updatedLevels = [...currentLevels, hintLevel].sort((a, b) => a - b)
        
        await supabase
          .from('user_progress')
          .update({ hint_levels_viewed: updatedLevels })
          .eq('user_id', this.user.id)
          .eq('date', date)
      }
    } catch (error) {
      console.warn('Failed to track hint level viewed:', error)
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