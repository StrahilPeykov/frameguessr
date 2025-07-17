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
    cast: { name: string; character: string }[]
    crew: { name: string; job: string }[]
  }
}

export class TMDBClient {
  private apiKey: string
  private accessToken: string

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY!
    this.accessToken = process.env.TMDB_ACCESS_TOKEN!
  }

  // Search for movies and TV shows
  async search(query: string): Promise<TMDBSearchResult[]> {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=1`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()
    
    // Filter out person results and only return movies/tv
    return data.results.filter((item: any) => 
      item.media_type === 'movie' || item.media_type === 'tv'
    )
  }

  // Get popular movies for daily selection
  async getPopularMovies(page = 1): Promise<TMDBSearchResult[]> {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()
    return data.results.map((movie: any) => ({ ...movie, media_type: 'movie' }))
  }

  // Get popular TV shows for daily selection
  async getPopularTVShows(page = 1): Promise<TMDBSearchResult[]> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/popular?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()
    return data.results.map((show: any) => ({ ...show, media_type: 'tv' }))
  }

  // Get movie details with credits
  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?append_to_response=credits`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.json()
  }

  // Get TV show details
  async getTVDetails(tvId: number): Promise<any> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tvId}?append_to_response=credits`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.json()
  }

  // Get movie images for stills
  async getMovieImages(movieId: number): Promise<any> {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/images`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.json()
  }

  // Get TV show images
  async getTVImages(tvId: number): Promise<any> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tvId}/images`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.json()
  }

  // Helper to get full image URL
  getImageUrl(path: string, size: 'w300' | 'w500' | 'w780' | 'original' = 'w780'): string {
    if (!path) return ''
    return `${TMDB_IMAGE_BASE}/${size}${path}`
  }
}

export const tmdb = new TMDBClient()