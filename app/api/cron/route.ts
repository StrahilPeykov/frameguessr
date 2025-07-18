import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { tmdb } from '@/lib/tmdb'
import { format, subDays } from 'date-fns'

// Curated list of popular movies and TV shows with high-quality backdrops
const POPULAR_SELECTIONS = [
  // Movies
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
  { tmdb_id: 1949, media_type: 'movie', title: 'Zodiac', year: 2007, priority: 'medium' },
  { tmdb_id: 607, media_type: 'movie', title: 'Men in Black', year: 1997, priority: 'medium' },
  { tmdb_id: 72105, media_type: 'movie', title: 'Ted', year: 2012, priority: 'medium' },
  
  // TV Shows
  { tmdb_id: 1399, media_type: 'tv', title: 'Game of Thrones', year: 2011, priority: 'high' },
  { tmdb_id: 1396, media_type: 'tv', title: 'Breaking Bad', year: 2008, priority: 'high' },
  { tmdb_id: 94605, media_type: 'tv', title: 'Arcane', year: 2021, priority: 'high' },
  { tmdb_id: 1408, media_type: 'tv', title: 'House', year: 2004, priority: 'high' },
  { tmdb_id: 85271, media_type: 'tv', title: 'WandaVision', year: 2021, priority: 'medium' },
  { tmdb_id: 88396, media_type: 'tv', title: 'The Falcon and the Winter Soldier', year: 2021, priority: 'medium' },
]

export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron (in production)
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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

    // Get recently used movies to avoid repetition
    const { data: recentMovies } = await supabase
      .from('daily_movies')
      .select('tmdb_id, media_type')
      .gte('date', format(subDays(new Date(), 30), 'yyyy-MM-dd'))

    const recentIds = new Set(recentMovies?.map(m => `${m.media_type}-${m.tmdb_id}`) || [])

    // Filter out recently used movies
    const availableSelections = POPULAR_SELECTIONS.filter(
      item => !recentIds.has(`${item.media_type}-${item.tmdb_id}`)
    )

    // If we've used all movies recently, just use the full list
    const selectionPool = availableSelections.length > 0 ? availableSelections : POPULAR_SELECTIONS

    // Prioritize high-priority selections
    const highPriority = selectionPool.filter(item => item.priority === 'high')
    const useHighPriority = Math.random() > 0.3 // 70% chance for high priority
    
    const finalPool = useHighPriority && highPriority.length > 0 ? highPriority : selectionPool
    const selectedItem = finalPool[Math.floor(Math.random() * finalPool.length)]

    console.log(`Selected: ${selectedItem.title} (${selectedItem.media_type})`)

    // Get detailed info from TMDB
    const isMovie = selectedItem.media_type === 'movie'
    
    let details, images
    try {
      details = isMovie
        ? await tmdb.getMovieDetails(selectedItem.tmdb_id)
        : await tmdb.getTVDetails(selectedItem.tmdb_id)
      
      images = isMovie
        ? await tmdb.getMovieImages(selectedItem.tmdb_id)
        : await tmdb.getTVImages(selectedItem.tmdb_id)
    } catch (tmdbError) {
      console.error('TMDB API error:', tmdbError)
      throw new Error('Failed to fetch movie details from TMDB')
    }

    // Select the best backdrop image
    const backdrops = images.backdrops || []
    
    // Filter for high-quality backdrops (landscape orientation, good aspect ratio)
    const qualityBackdrops = backdrops.filter((backdrop: any) => {
      const aspectRatio = backdrop.width / backdrop.height
      return aspectRatio >= 1.5 && aspectRatio <= 2.0 && backdrop.vote_average >= 5
    })

    const selectedBackdrop = qualityBackdrops.length > 0 
      ? qualityBackdrops[Math.floor(Math.random() * Math.min(qualityBackdrops.length, 3))]
      : backdrops.length > 0 
      ? backdrops[0]
      : null

    let imageUrl: string
    if (selectedBackdrop) {
      imageUrl = tmdb.getImageUrl(selectedBackdrop.file_path, 'original')
    } else if (details.backdrop_path) {
      imageUrl = tmdb.getImageUrl(details.backdrop_path, 'original')
    } else if (details.poster_path) {
      imageUrl = tmdb.getImageUrl(details.poster_path, 'original')
    } else {
      throw new Error('No suitable images found for selected movie')
    }

    console.log('Selected image URL:', imageUrl)

    // Verify image is accessible
    try {
      const imageResponse = await fetch(imageUrl, { method: 'HEAD' })
      if (!imageResponse.ok) {
        throw new Error('Selected image is not accessible')
      }
    } catch (imageError) {
      console.error('Image verification failed:', imageError)
      // Fall back to poster if available
      if (details.poster_path) {
        imageUrl = tmdb.getImageUrl(details.poster_path, 'original')
      } else {
        throw new Error('No accessible images found')
      }
    }

    // Create comprehensive hints
    const releaseYear = isMovie 
      ? details.release_date ? new Date(details.release_date).getFullYear() : selectedItem.year
      : details.first_air_date ? new Date(details.first_air_date).getFullYear() : selectedItem.year

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
          actors: details.credits?.cast?.slice(0, 3).map((c: any) => c.name) || [],
          tagline: details.tagline || '',
          director: isMovie 
            ? details.credits?.crew?.find((c: any) => c.job === 'Director')?.name || ''
            : details.created_by?.[0]?.name || details.credits?.crew?.find((c: any) => c.job === 'Executive Producer')?.name || ''
        }
      }
    }

    // Create blur levels (same image, will be blurred via CSS)
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
        title: isMovie ? details.title : details.name,
        year: releaseYear,
        image_url: imageUrl,
        blur_levels: blurLevels,
        hints: hints,
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw insertError
    }

    console.log(`Successfully created daily movie: ${isMovie ? details.title : details.name}`)

    // Clean up old entries (keep last 60 days)
    const sixtyDaysAgo = format(subDays(new Date(), 60), 'yyyy-MM-dd')
    const { error: cleanupError } = await supabase
      .from('daily_movies')
      .delete()
      .lt('date', sixtyDaysAgo)

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
      tmdbId: selectedItem.tmdb_id
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