import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface DailyMovie {
  id: number
  date: string
  tmdb_id: number
  media_type: 'movie' | 'tv'
  title: string
  year?: number
  image_url: string
  blur_levels?: {
    level1: string // Most blurred/cropped
    level2: string // Medium blur
    level3: string // Least blur
  }
  hints?: {
    actors?: string[]
    tagline?: string
    genre?: string
    director?: string
  }
  created_at: string
}

export interface UserProgress {
  id: number
  user_id: string
  date: string
  attempts: number
  completed: boolean
  guesses: string[]
  created_at: string
}