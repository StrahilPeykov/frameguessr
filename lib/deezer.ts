export interface DeezerTrack {
  id: number
  title: string
  artist: {
    name: string
  }
  preview: string // 30-second preview URL
  duration: number
}

export class DeezerClient {
  private baseUrl = 'https://api.deezer.com'
  private cache = new Map<number, DeezerTrack | null>()
  
  // Get track by ID - this is all we need!
  async getTrack(trackId: number): Promise<DeezerTrack | null> {
    // Check cache first
    if (this.cache.has(trackId)) {
      return this.cache.get(trackId) || null
    }

    try {
      const response = await fetch(`${this.baseUrl}/track/${trackId}`, {
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!response.ok) {
        console.error(`Deezer API error for track ${trackId}: ${response.status}`)
        this.cache.set(trackId, null)
        return null
      }
      
      const track: DeezerTrack = await response.json()
      
      // Validate that we have a preview URL
      if (!track.preview) {
        console.warn(`Track ${trackId} has no preview URL`)
        this.cache.set(trackId, null)
        return null
      }
      
      this.cache.set(trackId, track)
      return track
    } catch (error) {
      console.error(`Failed to fetch track ${trackId}:`, error)
      this.cache.set(trackId, null)
      return null
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear()
  }
}

export const deezer = new DeezerClient()

// Helper function to extract track ID from Deezer URL
export function extractTrackIdFromUrl(url: string): number | null {
  // Handle different Deezer URL formats:
  // https://www.deezer.com/track/123456
  // https://deezer.com/track/123456
  // https://www.deezer.com/en/track/123456
  const trackMatch = url.match(/deezer\.com\/(?:[a-z]{2}\/)?track\/(\d+)/i)
  
  if (trackMatch && trackMatch[1]) {
    return parseInt(trackMatch[1], 10)
  }
  
  // If it's just a number, treat it as track ID
  const numericMatch = url.match(/^\d+$/)
  if (numericMatch) {
    return parseInt(url, 10)
  }
  
  return null
}