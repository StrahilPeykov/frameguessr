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
      // Return existing daily challenge with proper formatting
      return NextResponse.json({
        date: existingDaily.date,
        movieId: existingDaily.tmdb_id,
        mediaType: existingDaily.media_type,
        title: existingDaily.title,
        year: existingDaily.year,
        imageUrl: existingDaily.image_url,
        hints: existingDaily.hints || {
          level1: { type: 'image', data: existingDaily.image_url },
          level2: { 
            type: 'mixed', 
            data: {
              image: existingDaily.image_url,
              year: existingDaily.year,
              genre: 'Unknown'
            }
          },
          level3: {
            type: 'full',
            data: {
              image: existingDaily.image_url,
              actors: [],
              tagline: '',
              director: ''
            }
          }
        },
        blurLevels: existingDaily.blur_levels || {
          heavy: existingDaily.image_url,
          medium: existingDaily.image_url,
          light: existingDaily.image_url,
        },
      })
    }

    // If no daily movie exists, try to create one from seed data
    // This is a fallback - in production, the cron job should handle this
    const fallbackMovies = [
      { tmdb_id: 244786, media_type: 'movie', title: 'Whiplash', year: 2014 },
      { tmdb_id: 1399, media_type: 'tv', title: 'Game of Thrones', year: 2011 },
      { tmdb_id: 49026, media_type: 'movie', title: 'The Dark Knight Rises', year: 2012 },
      { tmdb_id: 155, media_type: 'movie', title: 'The Dark Knight', year: 2008 },
      { tmdb_id: 1726, media_type: 'movie', title: 'Iron Man', year: 2008 },
    ]

    // Pick a random fallback movie
    const randomMovie = fallbackMovies[Math.floor(Math.random() * fallbackMovies.length)]
    
    try {
      // Try to get detailed info from TMDB
      const isMovie = randomMovie.media_type === 'movie'
      const details = isMovie
        ? await tmdb.getMovieDetails(randomMovie.tmdb_id)
        : await tmdb.getTVDetails(randomMovie.tmdb_id)
      
      const images = isMovie
        ? await tmdb.getMovieImages(randomMovie.tmdb_id)
        : await tmdb.getTVImages(randomMovie.tmdb_id)
      
      // Select a good backdrop image
      const backdrops = images.backdrops || []
      const selectedBackdrop = backdrops.length > 0 
        ? backdrops[Math.floor(Math.random() * Math.min(backdrops.length, 3))]
        : null
      
      const imageUrl = selectedBackdrop
        ? tmdb.getImageUrl(selectedBackdrop.file_path, 'original')
        : details.backdrop_path 
        ? tmdb.getImageUrl(details.backdrop_path, 'original')
        : tmdb.getImageUrl(details.poster_path, 'original')
      
      // Create proper hints with actual data
      const hints = {
        level1: { type: 'image', data: imageUrl },
        level2: { 
          type: 'mixed', 
          data: {
            image: imageUrl,
            year: isMovie 
              ? details.release_date ? new Date(details.release_date).getFullYear() : randomMovie.year
              : details.first_air_date ? new Date(details.first_air_date).getFullYear() : randomMovie.year,
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
              : details.created_by?.[0]?.name || ''
          }
        }
      }

      // For blur levels, we'll use the same image with CSS blur effects
      // In production, you'd want to generate actual blurred images
      const blurLevels = {
        heavy: imageUrl,
        medium: imageUrl,
        light: imageUrl,
      }

      // Save to database for future requests
      const { error: insertError } = await supabase
        .from('daily_movies')
        .insert({
          date: today,
          tmdb_id: randomMovie.tmdb_id,
          media_type: randomMovie.media_type,
          title: isMovie ? details.title : details.name,
          year: isMovie 
            ? details.release_date ? new Date(details.release_date).getFullYear() : randomMovie.year
            : details.first_air_date ? new Date(details.first_air_date).getFullYear() : randomMovie.year,
          image_url: imageUrl,
          blur_levels: blurLevels,
          hints: hints,
        })

      if (insertError) {
        console.error('Failed to save daily movie:', insertError)
      }

      return NextResponse.json({
        date: today,
        movieId: randomMovie.tmdb_id,
        mediaType: randomMovie.media_type,
        title: isMovie ? details.title : details.name,
        year: isMovie 
          ? details.release_date ? new Date(details.release_date).getFullYear() : randomMovie.year
          : details.first_air_date ? new Date(details.first_air_date).getFullYear() : randomMovie.year,
        imageUrl: imageUrl,
        hints: hints,
        blurLevels: blurLevels,
      })

    } catch (tmdbError) {
      console.error('TMDB API error:', tmdbError)
      
      // Return fallback data if TMDB fails
      const fallbackImageUrl = `https://via.placeholder.com/1920x1080/1a1a1a/ffffff?text=${encodeURIComponent(randomMovie.title)}`
      
      return NextResponse.json({
        date: today,
        movieId: randomMovie.tmdb_id,
        mediaType: randomMovie.media_type,
        title: randomMovie.title,
        year: randomMovie.year,
        imageUrl: fallbackImageUrl,
        hints: {
          level1: { type: 'image', data: fallbackImageUrl },
          level2: { 
            type: 'mixed', 
            data: {
              image: fallbackImageUrl,
              year: randomMovie.year,
              genre: 'Unknown'
            }
          },
          level3: {
            type: 'full',
            data: {
              image: fallbackImageUrl,
              actors: ['Unknown'],
              tagline: 'No tagline available',
              director: 'Unknown'
            }
          }
        },
        blurLevels: {
          heavy: fallbackImageUrl,
          medium: fallbackImageUrl,
          light: fallbackImageUrl,
        },
      })
    }

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