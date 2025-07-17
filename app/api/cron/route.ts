import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { tmdb } from '@/lib/tmdb'
import { format, subDays } from 'date-fns'

// This should be called by Vercel Cron Jobs
// Add to vercel.json: 
// {
//   "crons": [{
//     "path": "/api/cron",
//     "schedule": "0 0 * * *"
//   }]
// }

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
      return NextResponse.json({ message: 'Daily movie already exists' })
    }

    // Get a random popular movie or TV show
    const isMovie = Math.random() > 0.5
    const page = Math.floor(Math.random() * 5) + 1 // Random page 1-5
    
    const items = isMovie 
      ? await tmdb.getPopularMovies(page)
      : await tmdb.getPopularTVShows(page)
    
    // Pick a random item
    const randomItem = items[Math.floor(Math.random() * items.length)]
    
    // Get detailed info and images
    const details = isMovie
      ? await tmdb.getMovieDetails(randomItem.id)
      : await tmdb.getTVDetails(randomItem.id)
    
    const images = isMovie
      ? await tmdb.getMovieImages(randomItem.id)
      : await tmdb.getTVImages(randomItem.id)
    
    // Select a good still (prefer backdrops over posters)
    const stills = images.backdrops || []
    const selectedStill = stills.length > 0 
      ? stills[Math.floor(Math.random() * Math.min(stills.length, 5))]
      : { file_path: details.backdrop_path || details.poster_path }
    
    if (!selectedStill?.file_path) {
      throw new Error('No images found for selected item')
    }

    const imageUrl = tmdb.getImageUrl(selectedStill.file_path, 'original')
    
    // Prepare hints
    const hints = {
      level1: { type: 'image', data: imageUrl },
      level2: { 
        type: 'mixed', 
        data: {
          image: imageUrl,
          year: isMovie ? new Date(details.release_date).getFullYear() : new Date(details.first_air_date).getFullYear(),
          genre: details.genres?.[0]?.name
        }
      },
      level3: {
        type: 'full',
        data: {
          image: imageUrl,
          actors: details.credits?.cast?.slice(0, 3).map((c: any) => c.name) || [],
          tagline: details.tagline,
          director: isMovie 
            ? details.credits?.crew?.find((c: any) => c.job === 'Director')?.name
            : details.created_by?.[0]?.name
        }
      }
    }

    // For now, we'll use the same image for all blur levels
    // In production, you'd want to create actual blurred versions
    const blurLevels = {
      heavy: imageUrl, // Should be heavily blurred/cropped
      medium: imageUrl, // Should be medium blurred
      light: imageUrl, // Should be lightly blurred
    }

    // Insert into database
    const { error } = await supabase
      .from('daily_movies')
      .insert({
        date: today,
        tmdb_id: randomItem.id,
        media_type: isMovie ? 'movie' : 'tv',
        title: isMovie ? details.title : details.name,
        year: isMovie 
          ? details.release_date ? new Date(details.release_date).getFullYear() : null
          : details.first_air_date ? new Date(details.first_air_date).getFullYear() : null,
        image_url: imageUrl,
        blur_levels: blurLevels,
        hints: hints,
      })

    if (error) {
      throw error
    }

    // Clean up old entries (keep last 30 days)
    const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')
    await supabase
      .from('daily_movies')
      .delete()
      .lt('date', thirtyDaysAgo)

    return NextResponse.json({ 
      success: true, 
      message: 'Daily movie created',
      title: isMovie ? details.title : details.name 
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Failed to create daily movie' },
      { status: 500 }
    )
  }
}