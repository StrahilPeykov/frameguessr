// Run this script to seed the database with initial daily movies
// Usage: npx tsx scripts/seed-daily-movies.ts

import { createClient } from '@supabase/supabase-js'
import { format, addDays } from 'date-fns'

// Popular movies and TV shows with good stills available
const SEED_MOVIES = [
  { tmdb_id: 550, media_type: 'movie', title: 'Fight Club', year: 1999 },
  { tmdb_id: 680, media_type: 'movie', title: 'Pulp Fiction', year: 1994 },
  { tmdb_id: 155, media_type: 'movie', title: 'The Dark Knight', year: 2008 },
  { tmdb_id: 13, media_type: 'movie', title: 'Forrest Gump', year: 1994 },
  { tmdb_id: 278, media_type: 'movie', title: 'The Shawshank Redemption', year: 1994 },
  { tmdb_id: 238, media_type: 'movie', title: 'The Godfather', year: 1972 },
  { tmdb_id: 424, media_type: 'movie', title: "Schindler's List", year: 1993 },
  { tmdb_id: 389, media_type: 'movie', title: '12 Angry Men', year: 1957 },
  { tmdb_id: 129, media_type: 'movie', title: 'Spirited Away', year: 2001 },
  { tmdb_id: 497, media_type: 'movie', title: 'The Green Mile', year: 1999 },
  { tmdb_id: 1396, media_type: 'tv', title: 'Breaking Bad', year: 2008 },
  { tmdb_id: 1399, media_type: 'tv', title: 'Game of Thrones', year: 2011 },
  { tmdb_id: 66732, media_type: 'tv', title: 'Stranger Things', year: 2016 },
  { tmdb_id: 1418, media_type: 'tv', title: 'The Big Bang Theory', year: 2007 },
  { tmdb_id: 1668, media_type: 'tv', title: 'Friends', year: 1994 },
]

async function seedDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY // Use service key for admin access

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Start seeding from tomorrow
  const startDate = addDays(new Date(), 1)

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

    const { error } = await supabase
      .from('daily_movies')
      .upsert(seedData, { onConflict: 'date' })

    if (error) {
      console.error(`Failed to seed ${movie.title} for ${date}:`, error)
    } else {
      console.log(`✓ Seeded ${movie.title} for ${date}`)
    }
  }

  console.log('\nSeeding complete!')
}

// Run the seed function
seedDatabase().catch(console.error)