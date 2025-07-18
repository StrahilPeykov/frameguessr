import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

interface GuessRequest {
  guess: {
    id: string
    title: string
    tmdbId: number
    mediaType: 'movie' | 'tv'
    correct: boolean
    timestamp: number
  }
  gameState?: {
    attempts: number
    completed: boolean
    won: boolean
    currentHintLevel: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GuessRequest
    const { guess, gameState } = body

    if (!guess || typeof guess !== 'object') {
      return NextResponse.json(
        { error: 'Invalid guess data' },
        { status: 400 }
      )
    }

    // Validate guess structure
    const requiredFields = ['id', 'title', 'tmdbId', 'mediaType', 'correct', 'timestamp']
    const missingFields = requiredFields.filter(field => !(field in guess))
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate data types
    if (typeof guess.tmdbId !== 'number' || guess.tmdbId <= 0) {
      return NextResponse.json(
        { error: 'Invalid TMDB ID' },
        { status: 400 }
      )
    }

    if (!['movie', 'tv'].includes(guess.mediaType)) {
      return NextResponse.json(
        { error: 'Invalid media type' },
        { status: 400 }
      )
    }

    const today = format(new Date(), 'yyyy-MM-dd')

    // Get today's correct answer for server-side validation
    const { data: dailyMovie, error: dailyError } = await supabase
      .from('daily_movies')
      .select('tmdb_id, media_type, title')
      .eq('date', today)
      .single()

    if (dailyError || !dailyMovie) {
      console.error('Failed to get daily movie for validation:', dailyError)
      return NextResponse.json(
        { error: 'Unable to validate guess - daily movie not found' },
        { status: 404 }
      )
    }

    // Server-side validation of the guess
    const serverValidatedCorrect = 
      dailyMovie.tmdb_id === guess.tmdbId && 
      dailyMovie.media_type === guess.mediaType

    // Check if client-side validation matches server-side
    if (guess.correct !== serverValidatedCorrect) {
      console.warn(`Guess validation mismatch for ${guess.title}: client=${guess.correct}, server=${serverValidatedCorrect}`)
      
      // Return the server-validated result
      return NextResponse.json({
        success: true,
        validated: true,
        corrected: true,
        correct: serverValidatedCorrect,
        correctAnswer: serverValidatedCorrect ? null : {
          title: dailyMovie.title,
          tmdbId: dailyMovie.tmdb_id,
          mediaType: dailyMovie.media_type
        },
        message: serverValidatedCorrect ? 'Correct guess!' : 'Incorrect guess'
      })
    }

    // Future: Store guess in database for authenticated users
    // This would require user authentication to be implemented
    /*
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (token) {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        
        if (user && !authError) {
          // Store user's guess and game progress
          const { error: upsertError } = await supabase
            .from('user_progress')
            .upsert({
              user_id: user.id,
              date: today,
              attempts: gameState?.attempts || 1,
              completed: gameState?.completed || false,
              won: gameState?.won || false,
              guesses: [guess], // Would need to append to existing guesses
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,date'
            })

          if (upsertError) {
            console.error('Failed to save user progress:', upsertError)
          }
        }
      } catch (authError) {
        console.error('Auth error:', authError)
      }
    }
    */

    // Log guess for analytics (anonymized)
    try {
      const analyticsData = {
        date: today,
        guess_title: guess.title,
        guess_tmdb_id: guess.tmdbId,
        guess_media_type: guess.mediaType,
        correct: guess.correct,
        attempt_number: gameState?.attempts || 1,
        hint_level: gameState?.currentHintLevel || 1,
        timestamp: new Date().toISOString(),
        user_agent: request.headers.get('user-agent') || 'unknown'
      }

      // In production, you might want to send this to an analytics service
      console.log('Guess analytics:', analyticsData)
    } catch (analyticsError) {
      console.error('Failed to log analytics:', analyticsError)
      // Don't fail the request for analytics issues
    }

    return NextResponse.json({
      success: true,
      validated: true,
      correct: guess.correct,
      message: guess.correct ? 'Congratulations! Correct guess!' : 'Incorrect guess, try again!',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error processing guess:', error)
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process guess',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve guess history (future feature)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')
    
    // Future: Return user's guess history for a specific date
    // This would require authentication
    
    return NextResponse.json({
      message: 'Guess history endpoint - authentication required',
      date: date
    })
    
  } catch (error) {
    console.error('Error retrieving guess history:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve guess history' },
      { status: 500 }
    )
  }
}