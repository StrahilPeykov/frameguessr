import { NextRequest, NextResponse } from 'next/server'
import { deezer } from '@/lib/deezer'

// Next.js 15 App Router dynamic route handler
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    console.log('[Audio API] Full request URL:', request.url)
    
    const { trackId } = await params
    console.log('[Audio API] Extracted trackId:', trackId)
    
    // Validate track ID
    if (!trackId) {
      console.error('[Audio API] No track ID provided in params')
      return NextResponse.json(
        { error: 'Track ID is required' },
        { status: 400 }
      )
    }
    
    const trackIdNumber = parseInt(trackId, 10)
    if (isNaN(trackIdNumber) || trackIdNumber <= 0) {
      console.error(`[Audio API] Invalid track ID: ${trackId}`)
      return NextResponse.json(
        { error: `Invalid track ID: ${trackId}. Must be a positive number.` },
        { status: 400 }
      )
    }

    console.log(`[Audio API] Fetching Deezer track: ${trackIdNumber}`)

    const track = await deezer.getTrack(trackIdNumber)

    if (!track) {
      console.log(`[Audio API] Track not found: ${trackIdNumber}`)
      return NextResponse.json(
        { error: `Track ${trackIdNumber} not found or has no preview` },
        { status: 404 }
      )
    }

    console.log(`[Audio API] Found track: "${track.title}" by ${track.artist.name}`)

    // Return simple audio data
    const audioData = {
      track: {
        id: track.id,
        title: track.title,
        artist: track.artist.name,
        previewUrl: track.preview,
        duration: track.duration
      },
      durations: {
        level1: 5,   // 5 seconds for first hint
        level2: 10,  // 10 seconds for second hint
        level3: 15   // 15 seconds for third hint
      }
    }

    return NextResponse.json(audioData, {
      headers: {
        // Cache for 1 hour since track data doesn't change
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })

  } catch (error) {
    console.error('[Audio API] Error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'Network error. Please check your connection.' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch audio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}