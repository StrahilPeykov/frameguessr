import { NextRequest, NextResponse } from 'next/server'

// Test endpoint to debug Deezer API connection
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const trackId = searchParams.get('trackId') || '3116451' 
    
    console.log(`[Audio Test] Testing Deezer API with track ID: ${trackId}`)
    
    // Test direct Deezer API call
    const deezerUrl = `https://api.deezer.com/track/${trackId}`
    console.log(`[Audio Test] Fetching: ${deezerUrl}`)
    
    const response = await fetch(deezerUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FrameGuessr/1.0'
      },
    })
    
    console.log(`[Audio Test] Deezer response status: ${response.status}`)
    
    if (!response.ok) {
      return NextResponse.json({
        error: `Deezer API returned ${response.status}`,
        url: deezerUrl,
        status: response.status,
        statusText: response.statusText
      }, { status: response.status })
    }
    
    const data = await response.json()
    console.log(`[Audio Test] Deezer response:`, data)
    
    // Check if preview is available
    if (!data.preview) {
      return NextResponse.json({
        error: 'Track has no preview URL',
        track: data,
        hasPreview: false
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      trackId: trackId,
      deezerUrl: deezerUrl,
      track: {
        id: data.id,
        title: data.title,
        artist: data.artist?.name,
        preview: data.preview,
        duration: data.duration
      },
      rawDeezerResponse: data
    })
    
  } catch (error) {
    console.error('[Audio Test] Error:', error)
    
    return NextResponse.json({
      error: 'Failed to test audio API',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}