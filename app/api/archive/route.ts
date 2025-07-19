import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get all available dates with minimal data
    const { data, error } = await supabase
      .from('daily_movies')
      .select('date, title, media_type, deezer_track_id')
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching archive data:', error)
      return NextResponse.json(
        { error: 'Failed to load archive data' },
        { status: 500 }
      )
    }

    // Transform data for efficient client use
    const archiveData = data?.map(movie => ({
      date: movie.date,
      title: movie.title,
      media_type: movie.media_type,
      has_audio: !!movie.deezer_track_id
    })) || []

    // Calculate some basic stats
    const stats = {
      total: archiveData.length,
      firstDate: archiveData[0]?.date || null,
      lastDate: archiveData[archiveData.length - 1]?.date || null,
      withAudio: archiveData.filter(m => m.has_audio).length
    }

    return NextResponse.json({
      movies: archiveData,
      stats
    }, {
      headers: {
        // Cache for 1 hour
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })

  } catch (error) {
    console.error('Archive API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}