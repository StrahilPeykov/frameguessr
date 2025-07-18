import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { tmdb } from '@/lib/tmdb'
import { format, subDays } from 'date-fns'

// Expanded list of popular movies and TV shows with high-quality backdrops
const POPULAR_SELECTIONS: Array<{
  tmdb_id: number
  media_type: 'movie' | 'tv'
  title: string
  year: number
  priority: 'high' | 'medium'
}> = [
  // Visually Stunning Movies
  { tmdb_id: 244786, media_type: 'movie', title: 'Whiplash', year: 2014, priority: 'high' },
  { tmdb_id: 155, media_type: 'movie', title: 'The Dark Knight', year: 2008, priority: 'high' },
  { tmdb_id: 49026, media_type: 'movie', title: 'The Dark Knight Rises', year: 2012, priority: 'high' },
  { tmdb_id: 1726, media_type: 'movie', title: 'Iron Man', year: 2008, priority: 'high' },
  { tmdb_id: 475557, media_type: 'movie', title: 'Joker', year: 2019, priority: 'high' },
  { tmdb_id: 329, media_type: 'movie', title: 'Jurassic Park', year: 1993, priority: 'high' },
  { tmdb_id: 597, media_type: 'movie', title: 'Titanic', year: 1997, priority: 'high' },
  { tmdb_id: 671, media_type: 'movie', title: "Harry Potter and the Philosopher's Stone", year: 2001, priority: 'high' },
  { tmdb_id: 414906, media_type: 'movie', title: 'The Batman', year: 2022, priority: 'high' },
  { tmdb_id: 76600, media_type: 'movie', title: 'Avatar: The Way of Water', year: 2022, priority: 'high' },
  { tmdb_id: 157336, media_type: 'movie', title: 'Interstellar', year: 2014, priority: 'high' },
  { tmdb_id: 27205, media_type: 'movie', title: 'Inception', year: 2010, priority: 'high' },
  { tmdb_id: 603, media_type: 'movie', title: 'The Matrix', year: 1999, priority: 'high' },
  { tmdb_id: 680, media_type: 'movie', title: 'Pulp Fiction', year: 1994, priority: 'high' },
  { tmdb_id: 13, media_type: 'movie', title: 'Forrest Gump', year: 1994, priority: 'high' },
  { tmdb_id: 278, media_type: 'movie', title: 'The Shawshank Redemption', year: 1994, priority: 'high' },
  { tmdb_id: 872585, media_type: 'movie', title: 'Oppenheimer', year: 2023, priority: 'high' },
  { tmdb_id: 346698, media_type: 'movie', title: 'Barbie', year: 2023, priority: 'high' },
  
  // Medium Priority Movies
  { tmdb_id: 1949, media_type: 'movie', title: 'Zodiac', year: 2007, priority: 'medium' },
  { tmdb_id: 607, media_type: 'movie', title: 'Men in Black', year: 1997, priority: 'medium' },
  { tmdb_id: 72105, media_type: 'movie', title: 'Ted', year: 2012, priority: 'medium' },
  { tmdb_id: 762504, media_type: 'movie', title: 'Nope', year: 2022, priority: 'medium' },
  { tmdb_id: 9487, media_type: 'movie', title: "A Bug's Life", year: 1998, priority: 'medium' },
  { tmdb_id: 674324, media_type: 'movie', title: 'The Banshees of Inisherin', year: 2022, priority: 'medium' },
  
  // High-Quality TV Shows
  { tmdb_id: 1399, media_type: 'tv', title: 'Game of Thrones', year: 2011, priority: 'high' },
  { tmdb_id: 1396, media_type: 'tv', title: 'Breaking Bad', year: 2008, priority: 'high' },
  { tmdb_id: 94605, media_type: 'tv', title: 'Arcane', year: 2021, priority: 'high' },
  { tmdb_id: 1408, media_type: 'tv', title: 'House', year: 2004, priority: 'high' },
  { tmdb_id: 66732, media_type: 'tv', title: 'Stranger Things', year: 2016, priority: 'high' },
  { tmdb_id: 63174, media_type: 'tv', title: 'Lucifer', year: 2016, priority: 'high' },
  { tmdb_id: 60735, media_type: 'tv', title: 'The Flash', year: 2014, priority: 'medium' },
  { tmdb_id: 71712, media_type: 'tv', title: 'The Good Doctor', year: 2017, priority: 'medium' },
  { tmdb_id: 85271, media_type: 'tv', title: 'WandaVision', year: 2021, priority: 'medium' },
  { tmdb_id: 88396, media_type: 'tv', title: 'The Falcon and the Winter Soldier', year: 2021, priority: 'medium' },
]

export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron (in production)
    const authHeader = request.headers.get('authorization')
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = format(new Date(), 'yyyy-MM-dd')
    
    // Check if today's movie already exists
    const { data: existing } = await supabase
      .from('daily_movies')
      .select('id')
      .eq('date', today)
      .single()

    if (existing) {
      return NextResponse.json({ 
        message: 'Daily movie already exists',
        date: today 
      })
    }

    console.log(`Creating daily movie for ${today}`)

    // Get recently used movies to avoid repetition (last 14 days)
    const { data: recentMovies } = await supabase
      .from('daily_movies')
      .select('tmdb_id, media_type')
      .gte('date', format(subDays(new Date(), 14), 'yyyy-MM-dd'))

    const recentIds = new Set(recentMovies?.map(m => `${m.media_type}-${m.tmdb_id}`) || [])

    // Filter out recently used movies
    let availableSelections = POPULAR_SELECTIONS.filter(
      item => !recentIds.has(`${item.media_type}-${item.tmdb_id}`)
    )

    // If we've used many movies recently, expand the pool
    if (availableSelections.length < 5) {
      availableSelections = POPULAR_SELECTIONS
    }

    // Prioritize high-priority selections (80% chance)
    const highPriority = availableSelections.filter(item => item.priority === 'high')
    const useHighPriority = Math.random() > 0.2 && highPriority.length > 0
    
    const finalPool = useHighPriority ? highPriority : availableSelections
    const selectedItem = finalPool[Math.floor(Math.random() * finalPool.length)]

    console.log(`Selected: ${selectedItem.title} (${selectedItem.media_type})`)

    // Clear TMDB cache for fresh data
    tmdb.clearCache()

    // Get detailed info from TMDB
    const isMovie = selectedItem.media_type === 'movie'
    
    let details: any
    let imageUrl: string | null = null
    
    try {
      // Get movie/show details
      details = isMovie
        ? await tmdb.getMovieDetails(selectedItem.tmdb_id)
        : await tmdb.getTVDetails(selectedItem.tmdb_id)
      
      // Get the best backdrop image
      imageUrl = await tmdb.getBestBackdrop(selectedItem.tmdb_id, selectedItem.media_type)
      
      if (!imageUrl) {
        throw new Error('No suitable images found')
      }

      // Verify image is accessible with a longer timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      try {
        const imageResponse = await fetch(imageUrl, { 
          method: 'HEAD',
          signal: controller.signal 
        })
        clearTimeout(timeoutId)
        
        if (!imageResponse.ok) {
          throw new Error(`Image not accessible: ${imageResponse.status}`)
        }
      } catch (fetchError) {
        console.error('Image verification failed:', fetchError)
        // Try a different size
        if (imageUrl.includes('/original/')) {
          imageUrl = imageUrl.replace('/original/', '/w1280/')
        }
      }
    } catch (tmdbError) {
      console.error('TMDB API error:', tmdbError)
      // Skip this movie and try another one
      return NextResponse.json(
        { 
          error: 'Failed to fetch movie data from TMDB', 
          details: tmdbError instanceof Error ? tmdbError.message : 'Unknown error',
          retryable: true 
        },
        { status: 503 }
      )
    }

    // Extract release year
    const releaseYear = isMovie 
      ? ('release_date' in details && details.release_date) ? new Date(details.release_date).getFullYear() : selectedItem.year
      : ('first_air_date' in details && details.first_air_date) ? new Date(details.first_air_date).getFullYear() : selectedItem.year

    // Get cast and crew information
    const cast = details.credits?.cast
      ?.filter((c: any) => c.order < 5) // Top 5 cast members
      ?.map((c: any) => c.name) || []
    
    const director = isMovie 
      ? details.credits?.crew?.find((c: any) => c.job === 'Director')?.name || ''
      : ('created_by' in details && details.created_by?.[0]?.name) || 
        details.credits?.crew?.find((c: any) => 
          c.job === 'Executive Producer' || c.department === 'Production'
        )?.name || ''

    // Create comprehensive hints
    const hints = {
      level1: { 
        type: 'image', 
        data: imageUrl 
      },
      level2: { 
        type: 'mixed', 
        data: {
          image: imageUrl,
          year: releaseYear,
          genre: details.genres?.[0]?.name || 'Unknown'
        }
      },
      level3: {
        type: 'full',
        data: {
          image: imageUrl,
          actors: cast.slice(0, 3), // Top 3 actors
          tagline: details.tagline || '',
          director: director
        }
      }
    }

    // For now, use the same image for all blur levels
    // In production, you might want to pre-process these images
    const blurLevels = {
      heavy: imageUrl,
      medium: imageUrl,
      light: imageUrl,
    }

    // Insert into database
    const { error: insertError } = await supabase
      .from('daily_movies')
      .insert({
        date: today,
        tmdb_id: selectedItem.tmdb_id,
        media_type: selectedItem.media_type,
        title: isMovie ? ('title' in details ? details.title : selectedItem.title) : ('name' in details ? details.name : selectedItem.title),
        year: releaseYear,
        image_url: imageUrl,
        blur_levels: blurLevels,
        hints: hints,
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw insertError
    }

    console.log(`Successfully created daily movie: ${isMovie ? ('title' in details ? details.title : selectedItem.title) : ('name' in details ? details.name : selectedItem.title)}`)

    // Clean up old entries (keep last 30 days)
    const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')
    const { error: cleanupError } = await supabase
      .from('daily_movies')
      .delete()
      .lt('date', thirtyDaysAgo)

    if (cleanupError) {
      console.warn('Cleanup failed:', cleanupError)
      // Don't fail the entire operation for cleanup issues
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Daily movie created successfully',
      date: today,
      title: isMovie ? details.title : details.name,
      mediaType: selectedItem.media_type,
      year: releaseYear,
      tmdbId: selectedItem.tmdb_id,
      imageUrl: imageUrl
    })

  } catch (error) {
    console.error('Cron job error:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create daily movie'
    let statusCode = 500
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      if (error.message.includes('TMDB')) {
        statusCode = 503 // Service unavailable
      } else if (error.message.includes('Unauthorized')) {
        statusCode = 401
      } else if (error.message.includes('image')) {
        statusCode = 422 // Unprocessable entity
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    )
  }
}