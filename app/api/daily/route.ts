import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    // Check if a specific date is requested
    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get('date')
    
    // Validate date parameter if provided
    let targetDate = format(new Date(), 'yyyy-MM-dd')
    if (dateParam) {
      // Validate date format and ensure it's not in the future
      const requestedDate = new Date(dateParam)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (!isNaN(requestedDate.getTime()) && requestedDate <= today) {
        targetDate = format(requestedDate, 'yyyy-MM-dd')
      } else {
        return NextResponse.json(
          { error: 'Invalid date or date is in the future' },
          { status: 400 }
        )
      }
    }
    
    // Get the movie for the target date
    const { data: dailyMovie, error } = await supabase
      .from('daily_movies')
      .select('*')
      .eq('date', targetDate)
      .single()

    if (error || !dailyMovie) {
      return NextResponse.json(
        { 
          error: 'No challenge available for this date',
          date: targetDate 
        },
        { status: 404 }
      )
    }
    
    // Return the daily challenge with proper formatting
    return NextResponse.json({
      date: dailyMovie.date,
      movieId: dailyMovie.tmdb_id,
      mediaType: dailyMovie.media_type,
      title: dailyMovie.title,
      year: dailyMovie.year,
      imageUrl: dailyMovie.image_url,
      hints: dailyMovie.hints || createDefaultHints(dailyMovie),
      blurLevels: dailyMovie.blur_levels || {
        heavy: dailyMovie.image_url,
        medium: dailyMovie.image_url,
        light: dailyMovie.image_url,
      },
    })

  } catch (error) {
    console.error('Error in daily API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch daily challenge',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to create default hints if missing
function createDefaultHints(movie: any) {
  return {
    level1: { type: 'image', data: movie.image_url },
    level2: { 
      type: 'mixed', 
      data: {
        image: movie.image_url,
        year: movie.year,
        genre: 'Unknown'
      }
    },
    level3: {
      type: 'full',
      data: {
        image: movie.image_url,
        actors: [],
        tagline: '',
        director: ''
      }
    }
  }
}