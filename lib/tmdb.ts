const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

interface TMDBSearchResult {
  id: number
  title?: string // for movies
  name?: string // for TV shows
  release_date?: string // for movies
  first_air_date?: string // for TV shows
  poster_path?: string
  backdrop_path?: string
  media_type?: string
  overview?: string
  popularity?: number
}

interface TMDBMovieDetails {
  id: number
  title: string
  release_date: string
  overview: string
  tagline?: string
  poster_path?: string
  backdrop_path?: string
  genres: { id: number; name: string }[]
  credits?: {
    cast: { name: string; character: string; order: number }[]
    crew: { name: string; job: string; department: string }[]
  }
}

interface TMDBTVDetails {
  id: number
  name: string
  first_air_date: string
  overview: string
  tagline?: string
  poster_path?: string
  backdrop_path?: string
  genres: { id: number; name: string }[]
  created_by?: { name: string }[]
  credits?: {
    cast: { name: string; character: string; order: number }[]
    crew: { name: string; job: string; department: string }[]
  }
}

interface TMDBImages {
  backdrops: Array<{
    file_path: string
    width: number
    height: number
    vote_average: number
    vote_count: number
  }>
  posters: Array<{
    file_path: string
    width: number
    height: number
  }>
}

export class TMDBClient {
  private apiKey: string
  private accessToken: string
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTimeout = 1000 * 60 * 60 // 1 hour

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY!
    this.accessToken = process.env.TMDB_ACCESS_TOKEN!
    
    if (!this.accessToken && !this.apiKey) {
      console.error('TMDB credentials not found! Please set TMDB_ACCESS_TOKEN or TMDB_API_KEY')
    }
  }

  private async fetchFromTMDB(endpoint: string, retries = 3): Promise<any> {
    // Check cache first
    const cacheKey = endpoint
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    const url = `${TMDB_BASE_URL}${endpoint}`
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }

        // Prefer access token over API key
        if (this.accessToken) {
          headers['Authorization'] = `Bearer ${this.accessToken}`
        } else if (this.apiKey) {
          // Fallback to API key in URL
          const separator = endpoint.includes('?') ? '&' : '?'
          endpoint += `${separator}api_key=${this.apiKey}`
        }

        const response = await fetch(url, {
          headers,
          next: { revalidate: 3600 }, // Next.js ISR cache for 1 hour
        })

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited - wait and retry
            const retryAfter = response.headers.get('retry-after') || '1'
            await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000))
            continue
          }
          throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        
        // Cache the result
        this.cache.set(cacheKey, { data, timestamp: Date.now() })
        
        return data
      } catch (error) {
        console.error(`TMDB fetch error (attempt ${attempt + 1}/${retries}):`, error)
        if (attempt === retries - 1) throw error
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  }

  // Search for movies and TV shows
  async search(query: string): Promise<TMDBSearchResult[]> {
    try {
      const data = await this.fetchFromTMDB(
        `/search/multi?query=${encodeURIComponent(query)}&page=1&include_adult=false`
      )
      
      // Filter out person results and only return movies/tv with valid data
      return data.results
        .filter((item: any) => 
          (item.media_type === 'movie' || item.media_type === 'tv') &&
          (item.title || item.name) &&
          item.id
        )
        .slice(0, 20) // Limit results
    } catch (error) {
      console.error('Search failed:', error)
      return []
    }
  }

  // Get movie details with credits
  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    try {
      const data = await this.fetchFromTMDB(`/movie/${movieId}?append_to_response=credits`)
      return data
    } catch (error) {
      console.error(`Failed to get movie details for ${movieId}:`, error)
      throw error
    }
  }

  // Get TV show details with credits
  async getTVDetails(tvId: number): Promise<TMDBTVDetails> {
    try {
      const data = await this.fetchFromTMDB(`/tv/${tvId}?append_to_response=credits`)
      return data
    } catch (error) {
      console.error(`Failed to get TV details for ${tvId}:`, error)
      throw error
    }
  }

  // Get movie images for stills
  async getMovieImages(movieId: number): Promise<TMDBImages> {
    try {
      const data = await this.fetchFromTMDB(`/movie/${movieId}/images?include_image_language=en,null`)
      return {
        backdrops: data.backdrops || [],
        posters: data.posters || []
      }
    } catch (error) {
      console.error(`Failed to get movie images for ${movieId}:`, error)
      return { backdrops: [], posters: [] }
    }
  }

  // Get TV show images
  async getTVImages(tvId: number): Promise<TMDBImages> {
    try {
      const data = await this.fetchFromTMDB(`/tv/${tvId}/images?include_image_language=en,null`)
      return {
        backdrops: data.backdrops || [],
        posters: data.posters || []
      }
    } catch (error) {
      console.error(`Failed to get TV images for ${tvId}:`, error)
      return { backdrops: [], posters: [] }
    }
  }

  // Helper to get full image URL with fallback
  getImageUrl(path: string | null | undefined, size: 'w300' | 'w500' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
    if (!path) return '/placeholder-movie.svg' // Updated to use SVG
    return `${TMDB_IMAGE_BASE}/${size}${path}`
  }

  // Get best quality backdrop from a movie/show
  async getBestBackdrop(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<string | null> {
    try {
      const images = mediaType === 'movie' 
        ? await this.getMovieImages(tmdbId)
        : await this.getTVImages(tmdbId)

      // Sort backdrops by quality metrics
      const qualityBackdrops = images.backdrops
        .filter(backdrop => {
          const aspectRatio = backdrop.width / backdrop.height
          return (
            aspectRatio >= 1.5 && 
            aspectRatio <= 2.0 && 
            backdrop.vote_average >= 0 &&
            backdrop.width >= 1920 // Prefer HD images
          )
        })
        .sort((a, b) => {
          // Sort by vote average and vote count
          const scoreA = a.vote_average * Math.log(a.vote_count + 1)
          const scoreB = b.vote_average * Math.log(b.vote_count + 1)
          return scoreB - scoreA
        })

      if (qualityBackdrops.length > 0) {
        // Pick from top 3 backdrops randomly for variety
        const topBackdrops = qualityBackdrops.slice(0, 3)
        const selected = topBackdrops[Math.floor(Math.random() * topBackdrops.length)]
        return this.getImageUrl(selected.file_path, 'original')
      }

      // Fallback to any backdrop
      if (images.backdrops.length > 0) {
        return this.getImageUrl(images.backdrops[0].file_path, 'original')
      }

      // Get details for backdrop_path fallback
      const details = mediaType === 'movie'
        ? await this.getMovieDetails(tmdbId)
        : await this.getTVDetails(tmdbId)

      if (details.backdrop_path) {
        return this.getImageUrl(details.backdrop_path, 'original')
      }

      // Last resort: use poster
      if (details.poster_path) {
        return this.getImageUrl(details.poster_path, 'original')
      }

      return null
    } catch (error) {
      console.error('Failed to get best backdrop:', error)
      return null
    }
  }

  // Clear cache (useful for cron jobs)
  clearCache() {
    this.cache.clear()
  }
}

export const tmdb = new TMDBClient()