// Run this script to seed the database with initial daily movies
// Usage: npx tsx scripts/seed-daily-movies.ts
// This script will SKIP existing dates to protect your handpicked data
// Audio hints are now added manually - see SIMPLE_AUDIO_SETUP.md

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { format, addDays } from 'date-fns'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Popular movies and TV shows with good stills available
interface SeedMovie { 
  tmdb_id: number
  media_type: 'movie' | 'tv'
  title: string
  year: number
  /**
   * Optional index of the backdrop to use.
   * If omitted, one of the top images will be chosen at random.
   */
  backdropIndex?: number
  /**
   * Optional Deezer track ID for audio hint.
   * Add these manually after seeding using the setup guide.
   */
  suggestedTrackId?: number
}

const SEED_MOVIES: SeedMovie[] = [
  // July 2025
  { tmdb_id: 244786, media_type: 'movie', title: 'Whiplash', year: 2014, suggestedTrackId: 95428 },
  { tmdb_id: 1399,   media_type: 'tv',    title: 'Game of Thrones', year: 2011, suggestedTrackId: 916424 },
  { tmdb_id: 49026,  media_type: 'movie', title: 'The Dark Knight Rises', year: 2012, suggestedTrackId: 916426 },
  { tmdb_id: 94605,  media_type: 'tv',    title: 'Arcane', year: 2021 },
  { tmdb_id: 1726,   media_type: 'movie', title: 'Iron Man', year: 2008, suggestedTrackId: 72981 },
  { tmdb_id: 607,    media_type: 'movie', title: 'Men in Black', year: 1997, suggestedTrackId: 72982 },
  { tmdb_id: 1396,   media_type: 'tv',    title: 'Breaking Bad', year: 2008, suggestedTrackId: 6337 },
  { tmdb_id: 475557, media_type: 'movie', title: 'Joker', year: 2019, suggestedTrackId: 11520 },
  { tmdb_id: 1408,   media_type: 'tv',    title: 'House', year: 2004 },
  { tmdb_id: 491472, media_type: 'movie', title: "At Eternity's Gate", year: 2018 },
  { tmdb_id: 1359,   media_type: 'movie', title: 'American Psycho', year: 2000 },
  { tmdb_id: 671,    media_type: 'movie', title: "Harry Potter and the Philosopher's Stone", year: 2001, suggestedTrackId: 5104 },
  { tmdb_id: 454626, media_type: 'movie', title: 'Sonic the Hedgehog', year: 2020 },
  { tmdb_id: 329,    media_type: 'movie', title: 'Jurassic Park', year: 1993, suggestedTrackId: 5105 },
  { tmdb_id: 597,    media_type: 'movie', title: 'Titanic', year: 1997, suggestedTrackId: 72983 },
  { tmdb_id: 762504, media_type: 'movie', title: 'Nope', year: 2022 },
  { tmdb_id: 9487,   media_type: 'movie', title: "A Bug's Life", year: 1998 },
  { tmdb_id: 1949,   media_type: 'movie', title: 'Zodiac', year: 2007 },
  { tmdb_id: 9297,   media_type: 'movie', title: 'Monster House', year: 2006 },
  { tmdb_id: 155,    media_type: 'movie', title: 'The Dark Knight', year: 2008, suggestedTrackId: 916426 },
  { tmdb_id: 436270, media_type: 'movie', title: 'Black Adam', year: 2022 },
  { tmdb_id: 76600,  media_type: 'movie', title: 'Avatar: The Way of Water', year: 2022 },
  { tmdb_id: 414906, media_type: 'movie', title: 'The Batman', year: 2022 },
  { tmdb_id: 674324, media_type: 'movie', title: 'The Banshees of Inisherin', year: 2022 },
  { tmdb_id: 334541, media_type: 'movie', title: 'Manchester by the Sea', year: 2016 },
  { tmdb_id: 72105,  media_type: 'movie', title: 'Ted', year: 2012 },
  { tmdb_id: 600,    media_type: 'movie', title: 'Full Metal Jacket', year: 1987 },
  { tmdb_id: 4232,   media_type: 'movie', title: 'Scream', year: 1996 },
  { tmdb_id: 2675,   media_type: 'movie', title: 'Signs', year: 2002 },
]

// TMDB Client
class TMDBClient {
  private accessToken: string

  constructor() {
    this.accessToken = process.env.TMDB_ACCESS_TOKEN!
    if (!this.accessToken) {
      throw new Error('TMDB_ACCESS_TOKEN not found in environment variables')
    }
  }

  async getMovieDetails(movieId: number) {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
    return response.json()
  }

  async getTVDetails(tvId: number) {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tvId}?append_to_response=credits`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
    return response.json()
  }

  async getMovieImages(movieId: number) {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/images?include_image_language=en,null`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
    return response.json()
  }

  async getTVImages(tvId: number) {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tvId}/images?include_image_language=en,null`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
    return response.json()
  }

  getImageUrl(path: string, size: string = 'original'): string {
    return `https://image.tmdb.org/t/p/${size}${path}`
  }
}

async function seedDatabase() {
  console.log('🎬 FrameGuessr Database Seeder')
  console.log('=============================')
  console.log('⚠️  This script will SKIP existing dates to protect your handpicked data')
  console.log('🎵 Audio hints are now added manually - see SIMPLE_AUDIO_SETUP.md')
  console.log('Loading environment variables...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
  const tmdbToken = process.env.TMDB_ACCESS_TOKEN

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    console.error('Required environment variables:')
    console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
    console.error('- SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✓' : '✗')
    process.exit(1)
  }

  if (!tmdbToken) {
    console.error('❌ Missing TMDB_ACCESS_TOKEN')
    process.exit(1)
  }

  console.log('✓ Environment variables loaded')
  console.log('Creating Supabase client...')
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  console.log('Creating TMDB client...')
  const tmdb = new TMDBClient()

  // Start from July 1, 2025
  const startDate = new Date('2025-07-01')
  console.log('Starting seed from date:', format(startDate, 'yyyy-MM-dd'))
  console.log('Total movies to seed:', SEED_MOVIES.length)
  
  // First, check which dates already exist
  const endDate = addDays(startDate, SEED_MOVIES.length - 1)
  console.log('Checking existing data from', format(startDate, 'yyyy-MM-dd'), 'to', format(endDate, 'yyyy-MM-dd'))
  
  const { data: existingMovies } = await supabase
    .from('daily_movies')
    .select('date')
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))

  const existingDates = new Set(existingMovies?.map(m => m.date) || [])
  console.log(`Found ${existingDates.size} existing entries - these will be SKIPPED`)
  console.log('')

  let successCount = 0
  let failCount = 0
  let skippedCount = 0
  let audioSuggestionsCount = 0

  for (let i = 0; i < SEED_MOVIES.length; i++) {
    const movie = SEED_MOVIES[i]
    const date = format(addDays(startDate, i), 'yyyy-MM-dd')
    
    // Skip if date already exists (protects handpicked data)
    if (existingDates.has(date)) {
      console.log(`[${i + 1}/${SEED_MOVIES.length}] ⏭️  SKIPPING ${date} - already exists (protecting your data)`)
      skippedCount++
      continue
    }
    
    console.log(`[${i + 1}/${SEED_MOVIES.length}] Processing ${movie.title} for ${date}...`)

    try {
      // Get movie/show details from TMDB
      const isMovie = movie.media_type === 'movie'
      const details = isMovie
        ? await tmdb.getMovieDetails(movie.tmdb_id)
        : await tmdb.getTVDetails(movie.tmdb_id)
      
      const images = isMovie
        ? await tmdb.getMovieImages(movie.tmdb_id)
        : await tmdb.getTVImages(movie.tmdb_id)

      // Select the best backdrop
      let imageUrl: string
      
      if (images.backdrops && images.backdrops.length > 0) {
        // Filter for high-quality backdrops
        const qualityBackdrops = images.backdrops.filter((backdrop: any) => {
          const aspectRatio = backdrop.width / backdrop.height
          return aspectRatio >= 1.5 && aspectRatio <= 2.0 && backdrop.vote_average >= 0
        })
        
        let selectedBackdrop: any

        if (
          qualityBackdrops.length > 0 &&
          typeof movie.backdropIndex === 'number' &&
          qualityBackdrops[movie.backdropIndex]
        ) {
          selectedBackdrop = qualityBackdrops[movie.backdropIndex]
        } else if (qualityBackdrops.length > 0) {
          const index = Math.floor(Math.random() * Math.min(qualityBackdrops.length, 3))
          selectedBackdrop = qualityBackdrops[index]
        } else {
          selectedBackdrop = images.backdrops[0]
        }
        
        imageUrl = tmdb.getImageUrl(selectedBackdrop.file_path)
        console.log(`  → using backdrop ${selectedBackdrop.file_path}`)
      } else if (details.backdrop_path) {
        imageUrl = tmdb.getImageUrl(details.backdrop_path)
      } else if (details.poster_path) {
        imageUrl = tmdb.getImageUrl(details.poster_path)
      } else {
        console.error(`  ❌ No images found for ${movie.title}`)
        failCount++
        continue
      }

      // Extract information for hints
      const releaseYear = isMovie 
        ? details.release_date ? new Date(details.release_date).getFullYear() : movie.year
        : details.first_air_date ? new Date(details.first_air_date).getFullYear() : movie.year

      const cast = details.credits?.cast
        ?.filter((c: any) => c.order < 5)
        ?.map((c: any) => c.name) || []
      
      const director = isMovie 
        ? details.credits?.crew?.find((c: any) => c.job === 'Director')?.name || ''
        : details.created_by?.[0]?.name || ''

      const hints = {
        level1: { type: 'image', data: imageUrl },
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
            actors: cast.slice(0, 3),
            tagline: details.tagline || '',
            director: director
          }
        }
      }

      const seedData = {
        date,
        tmdb_id: movie.tmdb_id,
        media_type: movie.media_type,
        title: isMovie ? details.title : details.name,
        year: releaseYear,
        image_url: imageUrl,
        hints: hints,
        // Don't automatically add audio - this is now manual
        // deezer_track_id: null
      }

      // Use INSERT with ON CONFLICT DO NOTHING to avoid overwriting existing data
      const { error } = await supabase
        .from('daily_movies')
        .insert(seedData)

      if (error) {
        if (error.code === '23505') { // Unique constraint violation (date already exists)
          console.log(`  ⏭️  SKIPPED - ${date} already exists`)
          skippedCount++
        } else {
          console.error(`  ❌ Database error:`, error.message)
          failCount++
        }
      } else {
        console.log(`  ✅ Successfully seeded ${isMovie ? details.title : details.name}`)
        
        // Show audio suggestion if available
        if (movie.suggestedTrackId) {
          console.log(`  🎵 Suggested audio: Deezer track ID ${movie.suggestedTrackId}`)
          audioSuggestionsCount++
        }
        
        successCount++
      }
    } catch (err) {
      console.error(`  ❌ Error:`, err instanceof Error ? err.message : 'Unknown error')
      failCount++
    }

    // Add a small delay to avoid rate limiting TMDB
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n=============================')
  console.log(`🎬 Seeding complete!`)
  console.log(`   New entries: ${successCount}`)
  console.log(`   Skipped (protected): ${skippedCount}`)
  console.log(`   Failed: ${failCount}`)
  console.log(`   Total processed: ${SEED_MOVIES.length}`)
  console.log('')
  console.log(`🎵 Audio Integration:`)
  console.log(`   Suggested track IDs: ${audioSuggestionsCount}`)
  console.log(`   Manual setup required - see SIMPLE_AUDIO_SETUP.md`)
  console.log('')
  console.log('🛡️  Your existing handpicked data was protected!')
  if (skippedCount > 0) {
    console.log(`   ${skippedCount} existing entries were left untouched`)
  }
  console.log('')
  console.log('🎮 Your FrameGuessr database is ready!')
  console.log('')
  console.log('📝 Next steps for audio:')
  console.log('   1. See SIMPLE_AUDIO_SETUP.md for track ID setup')
  console.log('   2. Add track IDs to movies using SQL or Supabase dashboard')
  console.log('   3. Test audio hints in your app')
  
  if (audioSuggestionsCount > 0) {
    console.log('')
    console.log('🎵 Quick SQL to add suggested audio tracks:')
    console.log(`
UPDATE daily_movies SET deezer_track_id = 
  CASE 
    WHEN title = 'Game of Thrones' THEN 916424
    WHEN title = 'The Dark Knight' OR title = 'The Dark Knight Rises' THEN 916426
    WHEN title = 'Harry Potter and the Philosopher\\'s Stone' THEN 5104
    WHEN title = 'Jurassic Park' THEN 5105
    WHEN title = 'Whiplash' THEN 95428
    WHEN title = 'Iron Man' THEN 72981
    WHEN title = 'Men in Black' THEN 72982
    WHEN title = 'Breaking Bad' THEN 6337
    WHEN title = 'Joker' THEN 11520
    WHEN title = 'Titanic' THEN 72983
    ELSE deezer_track_id
  END
WHERE title IN ('Game of Thrones', 'The Dark Knight', 'The Dark Knight Rises', 'Harry Potter and the Philosopher\\'s Stone', 'Jurassic Park', 'Whiplash', 'Iron Man', 'Men in Black', 'Breaking Bad', 'Joker', 'Titanic');
    `)
  }
}

// Run the seed function
seedDatabase().catch(console.error)