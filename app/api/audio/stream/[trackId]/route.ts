import { NextRequest, NextResponse } from 'next/server'
import { deezer } from '@/lib/deezer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const { trackId } = await params

    if (!trackId) {
      return new NextResponse('Track ID is required', { status: 400 })
    }

    const trackIdNumber = parseInt(trackId, 10)
    if (isNaN(trackIdNumber) || trackIdNumber <= 0) {
      return new NextResponse('Invalid track ID', { status: 400 })
    }

    // Fetch track info to get preview URL
    const track = await deezer.getTrack(trackIdNumber)
    if (!track) {
      return new NextResponse('Track not found', { status: 404 })
    }

    // Fetch the preview audio from Deezer
    const response = await fetch(track.preview)
    if (!response.ok || !response.body) {
      return new NextResponse('Failed to fetch preview', { status: 500 })
    }

    // Stream the audio through our server
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        // Cache for 1 hour
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('[Audio Stream] Error:', error)
    return new NextResponse('Audio stream error', { status: 500 })
  }
}

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