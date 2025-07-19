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
  { tmdb_id: 244786, media_type: 'movie', title: 'Whiplash', year: 2014 },
  { tmdb_id: 1399,   media_type: 'tv',    title: 'Game of Thrones', year: 2011 },
  { tmdb_id: 49026,  media_type: 'movie', title: 'The Dark Knight Rises', year: 2012 },
  { tmdb_id: 94605,  media_type: 'tv',    title: 'Arcane', year: 2021 },
  { tmdb_id: 1726,   media_type: 'movie', title: 'Iron Man', year: 2008 },
  { tmdb_id: 607,    media_type: 'movie', title: 'Men in Black', year: 1997 },
  { tmdb_id: 1396,   media_type: 'tv',    title: 'Breaking Bad', year: 2008 },
  { tmdb_id: 475557, media_type: 'movie', title: 'Joker', year: 2019 },
  { tmdb_id: 1408,   media_type: 'tv',    title: 'House', year: 2004 },
  { tmdb_id: 491472, media_type: 'movie', title: "At Eternity's Gate", year: 2018 },
  { tmdb_id: 1359,   media_type: 'movie', title: 'American Psycho', year: 2000 },
  { tmdb_id: 671,    media_type: 'movie', title: "Harry Potter and the Philosopher's Stone", year: 2001 },
  { tmdb_id: 454626, media_type: 'movie', title: 'Sonic the Hedgehog', year: 2020 },
  { tmdb_id: 329,    media_type: 'movie', title: 'Jurassic Park', year: 1993 },
  { tmdb_id: 597,    media_type: 'movie', title: 'Titanic', year: 1997 },
  { tmdb_id: 762504, media_type: 'movie', title: 'Nope', year: 2022 },
  { tmdb_id: 9487,   media_type: 'movie', title: "A Bug's Life", year: 1998 },
  { tmdb_id: 1949,   media_type: 'movie', title: 'Zodiac', year: 2007 },
  { tmdb_id: 9297,   media_type: 'movie', title: 'Monster House', year: 2006 },
  { tmdb_id: 155,    media_type: 'movie', title: 'The Dark Knight', year: 2008 },
  { tmdb_id: 436270, media_type: 'movie', title: 'Black Adam', year: 2022 },
  { tmdb_id: 76600,  media_type: 'movie', title: 'Avatar: The Way of Water', year: 2022 },
  { tmdb_id: 414906, media_type: 'movie', title: 'The Batman', year: 2022 },
  { tmdb_id: 674324, media_type: 'movie', title: 'The Banshees of Inisherin', year: 2022 },
  { tmdb_id: 334541, media_type: 'movie', title: 'Manchester by the Sea', year: 2016 },
  { tmdb_id: 72105,  media_type: 'movie', title: 'Ted', year: 2012 },
  { tmdb_id: 600,    media_type: 'movie', title: 'Full Metal Jacket', year: 1987 },
  { tmdb_id: 4232,   media_type: 'movie', title: 'Scream', year: 1996 },
  { tmdb_id: 2675,   media_type: 'movie', title: 'Signs', year: 2002 },
  { tmdb_id: 381288, media_type: 'movie', title: 'Split', year: 2016 },
  { tmdb_id: 74,     media_type: 'movie', title: 'War of the Worlds', year: 2005 },
  { tmdb_id: 744,    media_type: 'movie', title: 'Top Gun', year: 1986 },
  { tmdb_id: 45612,  media_type: 'movie', title: 'Source Code', year: 2011 },
  { tmdb_id: 436969, media_type: 'movie', title: 'The Suicide Squad', year: 2021 },
  { tmdb_id: 6867,   media_type: 'movie', title: 'Australia', year: 2008 },
  { tmdb_id: 314365, media_type: 'movie', title: 'Spotlight', year: 2015 },
  { tmdb_id: 85,     media_type: 'movie', title: 'Raiders of the Lost Ark', year: 1981 },
  { tmdb_id: 9377,   media_type: 'movie', title: "Ferris Bueller's Day Off", year: 1986 },
  { tmdb_id: 286217, media_type: 'movie', title: 'The Martian', year: 2015 },
  { tmdb_id: 308266, media_type: 'movie', title: 'Downsizing', year: 2017 },
  { tmdb_id: 824,    media_type: 'movie', title: 'Moulin Rouge!', year: 2001 },
  { tmdb_id: 44115,  media_type: 'movie', title: '127 Hours', year: 2010 },
  { tmdb_id: 2080,   media_type: 'movie', title: 'X-Men Origins: Wolverine', year: 2009 },
  { tmdb_id: 424,    media_type: 'movie', title: "Schindler's List", year: 1993 },
  { tmdb_id: 269149, media_type: 'movie', title: 'Zootopia', year: 2016 },
  { tmdb_id: 49049,  media_type: 'movie', title: 'Dredd', year: 2012 },
  { tmdb_id: 245891, media_type: 'movie', title: 'John Wick', year: 2014 },
  { tmdb_id: 270946, media_type: 'movie', title: 'Penguins of Madagascar', year: 2014 },
  { tmdb_id: 49047,  media_type: 'movie', title: 'Gravity', year: 2013 },
  { tmdb_id: 419704, media_type: 'movie', title: 'Ad Astra', year: 2019 },
  { tmdb_id: 5915,   media_type: 'movie', title: 'Into the Wild', year: 2007 },
  { tmdb_id: 9799,   media_type: 'movie', title: 'The Fast and the Furious', year: 2001 },
  { tmdb_id: 346698, media_type: 'movie', title: 'Barbie', year: 2023 },
  { tmdb_id: 137106, media_type: 'movie', title: 'The Lego Movie', year: 2014 },
  { tmdb_id: 315162, media_type: 'movie', title: 'Puss in Boots: The Last Wish', year: 2022 },
  { tmdb_id: 346648, media_type: 'movie', title: 'Paddington 2', year: 2017 },
  { tmdb_id: 949,    media_type: 'movie', title: 'Heat', year: 1995 },
  { tmdb_id: 808,    media_type: 'movie', title: 'Shrek', year: 2001 },
  { tmdb_id: 578,    media_type: 'movie', title: 'Jaws', year: 1975 },
  { tmdb_id: 258475, media_type: 'movie', title: 'A Pigeon Sat on a Branch Reflecting on Existence', year: 2014 },
  { tmdb_id: 22881,  media_type: 'movie', title: 'The Blind Side', year: 2009 },
  { tmdb_id: 15,     media_type: 'movie', title: 'Citizen Kane', year: 1941 },
  { tmdb_id: 11036,  media_type: 'movie', title: 'The Notebook', year: 2004 },
  { tmdb_id: 776503, media_type: 'movie', title: 'CODA', year: 2021 },
  { tmdb_id: 10160,  media_type: 'movie', title: 'Cheaper by the Dozen', year: 2003 },
  { tmdb_id: 36657,  media_type: 'movie', title: 'X-Men', year: 2000 },
  { tmdb_id: 103663, media_type: 'movie', title: 'Mud', year: 2012 },
  { tmdb_id: 1927,   media_type: 'movie', title: 'Hulk', year: 2003 },
  { tmdb_id: 1724,   media_type: 'movie', title: 'The Incredible Hulk', year: 2008 },
  { tmdb_id: 23168,  media_type: 'movie', title: 'The Town', year: 2010 },
  { tmdb_id: 565,    media_type: 'movie', title: 'The Ring', year: 2002 },
  { tmdb_id: 184,    media_type: 'movie', title: 'Jackie Brown', year: 1997 },
  { tmdb_id: 49519,  media_type: 'movie', title: 'The Croods', year: 2013 },
  { tmdb_id: 872585, media_type: 'movie', title: 'Oppenheimer', year: 2023 },
  { tmdb_id: 558,    media_type: 'movie', title: 'Spider-Man 2', year: 2004 },
  { tmdb_id: 14306,  media_type: 'movie', title: 'Hoodwinked!', year: 2005 },
  { tmdb_id: 146233, media_type: 'movie', title: 'Prisoners', year: 2013 },
  { tmdb_id: 4995,   media_type: 'movie', title: 'Boogie Nights', year: 1997 },
  { tmdb_id: 150540, media_type: 'movie', title: 'Inside Out', year: 2015 },
  { tmdb_id: 82992,  media_type: 'movie', title: 'Fast & Furious 6', year: 2013 },
  { tmdb_id: 118340, media_type: 'movie', title: 'Guardians of the Galaxy', year: 2014 },
  { tmdb_id: 76170,  media_type: 'movie', title: 'The Wolverine', year: 2013 },
  { tmdb_id: 124905, media_type: 'movie', title: 'Godzilla', year: 2014 },
  { tmdb_id: 12445,  media_type: 'movie', title: 'Harry Potter and the Deathly Hallows: Part 2', year: 2011 },
  { tmdb_id: 419430, media_type: 'movie', title: 'Get Out', year: 2017 },
  { tmdb_id: 70160,  media_type: 'movie', title: 'The Hunger Games', year: 2012 },
  { tmdb_id: 141,    media_type: 'movie', title: 'Donnie Darko', year: 2001 },
  { tmdb_id: 913290, media_type: 'movie', title: 'Barbarian', year: 2022 },
  { tmdb_id: 466420, media_type: 'movie', title: 'Killers of the Flower Moon', year: 2023 },
  { tmdb_id: 316029, media_type: 'movie', title: 'The Greatest Showman', year: 2017 },
  { tmdb_id: 299536, media_type: 'movie', title: 'Avengers: Infinity War', year: 2018 },
  { tmdb_id: 293660, media_type: 'movie', title: 'Deadpool', year: 2016 },
  { tmdb_id: 9880,   media_type: 'movie', title: 'Shallow Hal', year: 2001 },
  { tmdb_id: 49444,  media_type: 'movie', title: 'Kung Fu Panda 2', year: 2011 },
  { tmdb_id: 920,    media_type: 'movie', title: 'Cars', year: 2006 },
  { tmdb_id: 37799,  media_type: 'movie', title: 'The Social Network', year: 2010 },
  { tmdb_id: 98,     media_type: 'movie', title: 'Gladiator', year: 2000 },
  { tmdb_id: 114150, media_type: 'movie', title: 'Pitch Perfect', year: 2012 },
  { tmdb_id: 1210646, media_type: 'movie', title: 'Lady Ballers', year: 2023 },
  { tmdb_id: 563,    media_type: 'movie', title: 'Starship Troopers', year: 1997 },
  { tmdb_id: 639,    media_type: 'movie', title: 'When Harry Met Sally...', year: 1989 },
  { tmdb_id: 753342, media_type: 'movie', title: 'Napoleon', year: 2023 },
  { tmdb_id: 823482, media_type: 'movie', title: 'Dream Scenario', year: 2023 },
  { tmdb_id: 8374,   media_type: 'movie', title: 'The Boondock Saints', year: 1999 },
  { tmdb_id: 62560,  media_type: 'tv',    title: 'Mr. Robot', year: 2015 },
  { tmdb_id: 339103, media_type: 'movie', title: 'Good Time', year: 2017 },
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