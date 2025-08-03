import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { tmdb } from '@/lib/tmdb'

// Cache for TMDB data to avoid rate limits
const tmdbCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 1000 * 60 * 60 * 2 // 2 hours

async function getCachedTMDBData(tmdbId: number, mediaType: 'movie' | 'tv') {
  const cacheKey = `${mediaType}-${tmdbId}`
  const cached = tmdbCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  try {
    const data = mediaType === 'movie' 
      ? await tmdb.getMovieDetails(tmdbId)
      : await tmdb.getTVDetails(tmdbId)
    
    tmdbCache.set(cacheKey, { data, timestamp: Date.now() })
    return data
  } catch (error) {
    console.error(`Failed to fetch ${mediaType} details for ${tmdbId}:`, error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if a specific date is requested
    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get('date')
    
    // Use provided date or default to current server date
    let targetDate: string
    if (dateParam) {
      // Accept any valid date string
      const requestedDate = new Date(dateParam + 'T00:00:00.000Z')
      if (!isNaN(requestedDate.getTime())) {
        targetDate = dateParam // Use the date as-is since it's already in YYYY-MM-DD format
      } else {
        return NextResponse.json(
          { error: 'Invalid date format. Use YYYY-MM-DD' },
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
    
    console.log(`[Daily API] Fetching challenge for date: ${targetDate}`)
    const { data: dailyMovie, error } = await supabase
      .from('daily_movies')
      .select('*')
      .eq('date', targetDate)
      .single()

    if (error || !dailyMovie) {
      console.log(`[Daily API] No movie found for date: ${targetDate}`)
      return NextResponse.json(
        { 
          error: 'No challenge available for this date',
          date: targetDate 
        },
        { status: 404 }
      )
    }

    console.log(`[Daily API] Found movie: ${dailyMovie.title} (${dailyMovie.media_type})`)

    // Fetch fresh TMDB data
    const tmdbData = await getCachedTMDBData(dailyMovie.tmdb_id, dailyMovie.media_type)
    
    // Create fallback data in case TMDB fails
    const fallbackData = {
      title: dailyMovie.title,
      name: dailyMovie.title,
      tagline: 'A cinematic experience awaits',
      genres: [],
      overview: '',
      credits: { cast: [], crew: [] },
      created_by: [],
      runtime: null,
      vote_average: null,
      release_date: dailyMovie.year ? `${dailyMovie.year}-01-01` : null,
      first_air_date: dailyMovie.year ? `${dailyMovie.year}-01-01` : null
    }

    // Use TMDB data with fallbacks
    const movieData = tmdbData || fallbackData
    
    // Extract data for hint generation
    const isMovie = dailyMovie.media_type === 'movie'
    const releaseYear = isMovie 
      ? (movieData.release_date ? new Date(movieData.release_date).getFullYear() : dailyMovie.year)
      : (movieData.first_air_date ? new Date(movieData.first_air_date).getFullYear() : dailyMovie.year)

    const genre = movieData.genres?.[0]?.name || 'Unknown'
    const tagline = movieData.tagline || 'A cinematic experience awaits'
    const title = isMovie ? (movieData.title || dailyMovie.title) : (movieData.name || dailyMovie.title)

    // Generate hints dynamically
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
          year: releaseYear,
          genre: genre
        }
      }
    }

    // Generate movie details for completion screen
    const director = isMovie 
      ? movieData.credits?.crew?.find((c: any) => c.job === 'Director')?.name || ''
      : movieData.created_by?.[0]?.name || ''

    const actors = movieData.credits?.cast
      ?.slice(0, 3)
      ?.map((c: any) => c.name) || []

    const movieDetails = {
      director: director,
      actors: actors,
      tagline: tagline,
      genre: genre,
      overview: movieData.overview || '',
      runtime: movieData.runtime || null,
      rating: movieData.vote_average || null
    }
    
    console.log(`[Daily API] Successfully generated hints for: ${title}`)
    
    // Return the daily challenge with dynamically generated hints
    return NextResponse.json({
      date: dailyMovie.date,
      movieId: dailyMovie.tmdb_id,
      mediaType: dailyMovie.media_type,
      title: title,
      year: releaseYear,
      imageUrl: dailyMovie.image_url,
      hints: dynamicHints,
      details: movieDetails,
      deezerTrackId: dailyMovie.deezer_track_id || null,
    }, {
      headers: {
        // Cache the response for 1 hour since it's dynamically generated
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'CDN-Cache-Control': 'public, max-age=3600',
      }
    })

  } catch (error) {
    console.error('[Daily API] Error:', error)
    
    // Provide specific error messages for debugging
    let errorMessage = 'Failed to fetch daily challenge'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        errorMessage = 'Movie database temporarily unavailable. Please try again in a moment.'
        statusCode = 503
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error while fetching movie data. Please check your connection.'
        statusCode = 503
      } else if (error.message.includes('TMDB')) {
        errorMessage = 'Movie database error. Please try again later.'
        statusCode = 503
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
        date: request.nextUrl.searchParams.get('date') || 'today'
      },
      { status: statusCode }
    )
  }
}

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of tmdbCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      tmdbCache.delete(key)
    }
  }
}, CACHE_DURATION) // Clean up every 2 hours