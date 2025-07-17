import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { tmdb } from '@/lib/tmdb'
import { format } from 'date-fns'

export async function GET() {
  try {
    const today = format(new Date(), 'yyyy-MM-dd')
    
    // Check if we already have today's movie
    const { data: existingDaily, error } = await supabase
      .from('daily_movies')
      .select('*')
      .eq('date', today)
      .single()

    if (existingDaily && !error) {
      // Return existing daily challenge
      return NextResponse.json({
        date: existingDaily.date,
        movieId: existingDaily.tmdb_id,
        mediaType: existingDaily.media_type,
        title: existingDaily.title,
        year: existingDaily.year,
        imageUrl: existingDaily.image_url,
        hints: existingDaily.hints,
        blurLevels: existingDaily.blur_levels,
      })
    }

    // If no daily movie exists, create one (this should be done by a cron job)
    // For now, we'll just return a placeholder
    return NextResponse.json({
      error: 'No daily challenge found. Please set up the cron job.',
      date: today,
    }, { status: 404 })

  } catch (error) {
    console.error('Error fetching daily challenge:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily challenge' },
      { status: 500 }
    )
  }
}