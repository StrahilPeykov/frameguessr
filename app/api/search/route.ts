import { NextRequest, NextResponse } from 'next/server'
import { tmdb } from '@/lib/tmdb'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.trim()

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    // Prevent overly long queries
    if (query.length > 100) {
      return NextResponse.json(
        { error: 'Query too long' },
        { status: 400 }
      )
    }

    const results = await tmdb.search(query)
    
    // Enhanced formatting with better validation
    const formattedResults = results
      .filter(item => {
        // Filter out items without essential data
        const hasTitle = item.title || item.name
        const hasId = item.id && item.id > 0
        const hasValidMediaType = item.media_type === 'movie' || item.media_type === 'tv'
        
        return hasTitle && hasId && hasValidMediaType
      })
      .slice(0, 10)
      .map((item) => {
        const title = item.title || item.name || 'Unknown Title'
        const year = item.release_date 
          ? new Date(item.release_date).getFullYear()
          : item.first_air_date 
          ? new Date(item.first_air_date).getFullYear()
          : undefined
        
        // Only include year if it's a valid year
        const validYear = year && year > 1800 && year <= new Date().getFullYear() + 5 ? year : undefined
        
        return {
          id: item.id,
          title: title,
          year: validYear,
          mediaType: item.media_type as 'movie' | 'tv',
          posterUrl: item.poster_path 
            ? tmdb.getImageUrl(item.poster_path, 'w300')
            : undefined,
          backdropUrl: item.backdrop_path
            ? tmdb.getImageUrl(item.backdrop_path, 'w780')
            : undefined,
          overview: item.overview || '',
          popularity: item.popularity || 0,
        }
      })
      .sort((a, b) => {
        // Sort by popularity (TMDB score) descending
        return (b.popularity || 0) - (a.popularity || 0)
      })

    return NextResponse.json(formattedResults)
  } catch (error) {
    console.error('Search error:', error)
    
    // Return more specific error information
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
      { error: 'Search temporarily unavailable' },
      { status: 500 }
    )
  }
}