import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Updated types for our database tables to match the migrated schema
export interface DailyMovie {
  id: number
  date: string
  tmdb_id: number
  media_type: 'movie' | 'tv'
  title: string
  year?: number
  image_url: string
  deezer_track_id?: number
  created_at: string
}

export interface UserProgress {
  id: number
  user_id: string
  date: string
  attempts: number
  completed: boolean
  guesses: any[] // JSON array of guess objects
  all_attempts?: any[] // JSON array of attempt objects (new field)
  won?: boolean
  current_hint_level?: number
  max_attempts?: number // New field
  last_modified?: string // New field for conflict resolution
  hint_levels_viewed?: number[] // New field for tracking viewed hints
  created_at: string
}

// Type for the user_stats view created in migration
export interface UserStatsView {
  user_id: string
  games_played: number
  games_completed: number
  games_won: number
  win_percentage: number
  avg_attempts_when_won: number
}