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
      // Accept any valid date string but block future dates
      const requestedDate = new Date(dateParam)
      if (!isNaN(requestedDate.getTime())) {
        const formatted = format(requestedDate, 'yyyy-MM-dd')
        const today = format(new Date(), 'yyyy-MM-dd')

        if (formatted > today) {
          return NextResponse.json(
            { error: 'Challenge not yet available', date: formatted },
            { status: 403 }
          )
        }

        targetDate = formatted
      } else {
        return NextResponse.json(
          { error: 'Invalid date format' },
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
    
    // Create hints with default structure
    let processedHints = dailyMovie.hints || createDefaultHints(dailyMovie)
    
    // Return the daily challenge with Deezer track ID
    return NextResponse.json({
      date: dailyMovie.date,
      movieId: dailyMovie.tmdb_id,
      mediaType: dailyMovie.media_type,
      title: dailyMovie.title,
      year: dailyMovie.year,
      imageUrl: dailyMovie.image_url,
      hints: processedHints,
      // Include Deezer track ID if available
      deezerTrackId: dailyMovie.deezer_track_id || null,
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