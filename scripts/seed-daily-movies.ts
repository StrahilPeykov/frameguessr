// Run this script to seed the database with initial daily movies
// Usage: npx tsx scripts/seed-daily-movies.ts

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { format, addDays } from 'date-fns'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Popular movies and TV shows with good stills available
const SEED_MOVIES = [
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
];


async function seedDatabase() {
  console.log('Loading environment variables...')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '***[HIDDEN]***' : 'NOT FOUND')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    console.error('Required environment variables:')
    console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
    console.error('- SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✓' : '✗')
    console.error('\nMake sure your .env.local file contains these variables.')
    process.exit(1)
  }

  console.log('Creating Supabase client...')
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Start seeding from tomorrow
  const startDate = addDays(new Date(), 1)
  console.log('Starting seed from date:', format(startDate, 'yyyy-MM-dd'))

  for (let i = 0; i < SEED_MOVIES.length; i++) {
    const movie = SEED_MOVIES[i]
    const date = format(addDays(startDate, i), 'yyyy-MM-dd')

    // For this seed script, we'll use placeholder data
    // In production, you'd fetch real images from TMDB
    const placeholderImage = `https://via.placeholder.com/1920x1080/1a1a1a/ffffff?text=${encodeURIComponent(movie.title)}`

    const seedData = {
      date,
      tmdb_id: movie.tmdb_id,
      media_type: movie.media_type,
      title: movie.title,
      year: movie.year,
      image_url: placeholderImage,
      blur_levels: {
        heavy: placeholderImage,
        medium: placeholderImage,
        light: placeholderImage,
      },
      hints: {
        level1: { type: 'image', data: placeholderImage },
        level2: {
          type: 'mixed',
          data: {
            image: placeholderImage,
            year: movie.year,
            genre: 'Drama', // Placeholder
          },
        },
        level3: {
          type: 'full',
          data: {
            image: placeholderImage,
            actors: ['Actor 1', 'Actor 2', 'Actor 3'], // Placeholder
            tagline: 'A great movie tagline', // Placeholder
            director: 'Famous Director', // Placeholder
          },
        },
      },
    }

    try {
      const { error } = await supabase
        .from('daily_movies')
        .upsert(seedData, { onConflict: 'date' })

      if (error) {
        console.error(`Failed to seed ${movie.title} for ${date}:`, error)
      } else {
        console.log(`✓ Seeded ${movie.title} for ${date}`)
      }
    } catch (err) {
      console.error(`Exception seeding ${movie.title}:`, err)
    }
  }

  console.log('\nSeeding complete!')
}

// Run the seed function
seedDatabase().catch(console.error)