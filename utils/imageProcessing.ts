export const IMAGE_SIZES = {
  small: 'w500',
  medium: 'w780', 
  large: 'w1280',
  original: 'original'
} as const

export function getImageUrl(
  path: string | null | undefined, 
  size: keyof typeof IMAGE_SIZES = 'medium'
): string {
  if (!path) return '/placeholder-movie.svg'
  return `https://image.tmdb.org/t/p/${IMAGE_SIZES[size]}${path}`
}

export function generateSrcSet(basePath: string): string {
  if (!basePath) return ''
  
  return Object.entries(IMAGE_SIZES)
    .filter(([key]) => key !== 'original')
    .map(([key, size]) => {
      const url = getImageUrl(basePath, key as keyof typeof IMAGE_SIZES)
      const width = size.replace('w', '')
      return `${url} ${width}w`
    })
    .join(', ')
}

export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

export function calculateAspectRatio(width: number, height: number): number {
  return width / height
}

export function generateCinemaImageAlt(
  title: string,
  hintLevel: number,
  blurIntensity?: string
): string {
  const blurDescription = blurIntensity ? ` with ${blurIntensity} blur effect` : ''
  return `Movie still from "${title}" - Hint level ${hintLevel}${blurDescription}`
}