import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check if a specific date is requested
    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get('date')
    
    // Use provided date or default to user's local date (no server-side validation)
    let targetDate: string
    if (dateParam) {
      // Accept any valid date string - let users play when it's their local midnight
      const requestedDate = new Date(dateParam + 'T00:00:00.000Z')
      if (!isNaN(requestedDate.getTime())) {
        targetDate = dateParam // Use the date as-is since it's already in YYYY-MM-DD format
      } else {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        )
      }
    } else {
      // Default to current server date if no date specified
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      targetDate = `${year}-${month}-${day}`
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
    
    // Generate hints dynamically (no more database hints!)
    // Extract genre from old hints structure if exists, otherwise use fallback
    const genre = dailyMovie.hints?.level2?.data?.genre || 
                  dailyMovie.hints?.level3?.data?.genre || 
                  dailyMovie.genre || 
                  'Unknown'
    
    const tagline = dailyMovie.hints?.level2?.data?.tagline || 
                    dailyMovie.hints?.level3?.data?.tagline || 
                    dailyMovie.tagline || 
                    'A cinematic experience awaits'

    const dynamicHints = {
      level1: {
        type: 'image',
        data: dailyMovie.image_url
      },
      level2: {
        type: 'tagline',
        data: {
          image: dailyMovie.image_url,
          tagline: tagline
        }
      },
      level3: {
        type: 'metadata',
        data: {
          image: dailyMovie.image_url,
          tagline: tagline, // Keep tagline visible
          year: dailyMovie.year,
          genre: genre
        }
      }
    }

    // Create movie details object for completion screen
    const movieDetails = {
      director: dailyMovie.hints?.level3?.data?.director || dailyMovie.director || '',
      actors: dailyMovie.hints?.level3?.data?.actors || dailyMovie.actors || [],
      tagline: tagline,
      genre: genre,
      overview: dailyMovie.overview || '',
      runtime: dailyMovie.runtime || null,
      rating: dailyMovie.rating || null
    }
    
    // Return the daily challenge with dynamically generated hints
    return NextResponse.json({
      date: dailyMovie.date,
      movieId: dailyMovie.tmdb_id,
      mediaType: dailyMovie.media_type,
      title: dailyMovie.title,
      year: dailyMovie.year,
      imageUrl: dailyMovie.image_url,
      hints: dynamicHints,
      details: movieDetails,
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