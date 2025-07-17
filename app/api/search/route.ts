import { NextRequest, NextResponse } from 'next/server'
import { tmdb } from '@/lib/tmdb'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const results = await tmdb.search(query)
    
    // Format results for the frontend
    const formattedResults = results.slice(0, 10).map((item) => ({
      id: item.id,
      title: item.title || item.name || 'Unknown',
      year: item.release_date 
        ? new Date(item.release_date).getFullYear()
        : item.first_air_date 
        ? new Date(item.first_air_date).getFullYear()
        : undefined,
      mediaType: item.media_type as 'movie' | 'tv',
      posterUrl: item.poster_path 
        ? tmdb.getImageUrl(item.poster_path, 'w300')
        : undefined,
    }))

    return NextResponse.json(formattedResults)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}