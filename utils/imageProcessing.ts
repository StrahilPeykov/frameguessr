// Image processing utilities for FrameGuessr
// Note: Blur logic has been moved to utils/blur.ts for better organization

export function getBlurDataURL(): string {
  // Placeholder blur while loading - lightweight base64 encoded blur
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
}

// Image optimization utilities
export interface ImageQuality {
  width: number
  height: number
  quality: number
  format: 'jpeg' | 'webp' | 'avif'
}

export const IMAGE_SIZES = {
  thumbnail: { width: 300, height: 450, quality: 80, format: 'jpeg' as const },
  small: { width: 500, height: 750, quality: 85, format: 'webp' as const },
  medium: { width: 780, height: 1170, quality: 90, format: 'webp' as const },
  large: { width: 1280, height: 1920, quality: 95, format: 'webp' as const },
  original: { width: 0, height: 0, quality: 100, format: 'webp' as const }
} as const

// Get responsive image URL for TMDB images
export function getResponsiveImageUrl(
  basePath: string,
  size: keyof typeof IMAGE_SIZES = 'medium'
): string {
  if (!basePath) return '/placeholder-movie.svg'
  
  const config = IMAGE_SIZES[size]
  const sizeParam = size === 'original' ? 'original' : `w${config.width}`
  
  return `https://image.tmdb.org/t/p/${sizeParam}${basePath}`
}

// Generate srcSet for responsive images
export function generateSrcSet(basePath: string): string {
  if (!basePath) return ''
  
  const sizes = ['small', 'medium', 'large'] as const
  
  return sizes
    .map(size => {
      const config = IMAGE_SIZES[size]
      const url = getResponsiveImageUrl(basePath, size)
      return `${url} ${config.width}w`
    })
    .join(', ')
}

// Get optimal image size based on viewport
export function getOptimalImageSize(containerWidth: number): keyof typeof IMAGE_SIZES {
  if (containerWidth <= 400) return 'small'
  if (containerWidth <= 800) return 'medium'
  if (containerWidth <= 1200) return 'large'
  return 'original'
}

// Image preloading utility
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    
    img.src = src
  })
}

// Check if image format is supported
export function isImageFormatSupported(format: 'webp' | 'avif'): boolean {
  if (typeof window === 'undefined') return false
  
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  
  try {
    const dataURL = canvas.toDataURL(`image/${format}`)
    return dataURL.startsWith(`data:image/${format}`)
  } catch {
    return false
  }
}

// Get best supported image format
export function getBestImageFormat(): 'avif' | 'webp' | 'jpeg' {
  if (isImageFormatSupported('avif')) return 'avif'
  if (isImageFormatSupported('webp')) return 'webp'
  return 'jpeg'
}

// Calculate aspect ratio from dimensions
export function calculateAspectRatio(width: number, height: number): number {
  return width / height
}

// Check if aspect ratio is suitable for cinema display
export function isCinemaAspectRatio(aspectRatio: number): boolean {
  // Common cinema aspect ratios: 16:9 (1.78), 21:9 (2.33), 2.35:1, etc.
  const cinemaRatios = [1.78, 1.85, 2.33, 2.35, 2.39]
  const tolerance = 0.1
  
  return cinemaRatios.some(ratio => 
    Math.abs(aspectRatio - ratio) <= tolerance
  )
}

// Extract dominant colors from image (for theming)
export function extractDominantColors(
  imageElement: HTMLImageElement,
  colorCount: number = 5
): string[] {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return []
  
  // Scale down for performance
  const scale = 0.1
  canvas.width = imageElement.width * scale
  canvas.height = imageElement.height * scale
  
  ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height)
  
  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    // Simple color extraction (you could use a more sophisticated algorithm)
    const colorMap = new Map<string, number>()
    
    for (let i = 0; i < data.length; i += 4) {
      const r = Math.round(data[i] / 32) * 32
      const g = Math.round(data[i + 1] / 32) * 32
      const b = Math.round(data[i + 2] / 32) * 32
      
      const color = `rgb(${r}, ${g}, ${b})`
      colorMap.set(color, (colorMap.get(color) || 0) + 1)
    }
    
    // Sort by frequency and return top colors
    return Array.from(colorMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, colorCount)
      .map(([color]) => color)
      
  } catch (error) {
    console.error('Failed to extract colors:', error)
    return []
  }
}

// Image validation utilities
export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export function getImageFileExtension(url: string): string | null {
  try {
    const pathname = new URL(url).pathname
    const match = pathname.match(/\.([a-zA-Z0-9]+)$/)
    return match ? match[1].toLowerCase() : null
  } catch {
    return null
  }
}

// Performance monitoring for images
export interface ImageLoadMetrics {
  url: string
  loadTime: number
  fileSize?: number
  cacheHit: boolean
  error?: string
}

export function measureImageLoad(src: string): Promise<ImageLoadMetrics> {
  const startTime = performance.now()
  
  return new Promise((resolve) => {
    const img = new Image()
    
    const finishMeasurement = (error?: string) => {
      const loadTime = performance.now() - startTime
      const cacheHit = loadTime < 50 // Heuristic for cache hit
      
      resolve({
        url: src,
        loadTime,
        cacheHit,
        error
      })
    }
    
    img.onload = () => finishMeasurement()
    img.onerror = () => finishMeasurement('Failed to load')
    
    img.src = src
  })
}

// Cinema-specific image utilities
export function generateCinemaImageAlt(
  title: string,
  hintLevel: number,
  blurIntensity?: string
): string {
  const blurDescription = blurIntensity ? ` with ${blurIntensity} blur effect` : ''
  return `Movie still from "${title}" - Hint level ${hintLevel}${blurDescription}`
}

// For potential future server-side image processing with Sharp:
/*
Server-side image processing would go here if you implement it:

import sharp from 'sharp'

export async function createBlurredVersion(
  imageBuffer: Buffer, 
  blurAmount: number,
  brightness: number = 1
): Promise<Buffer> {
  return sharp(imageBuffer)
    .blur(blurAmount)
    .modulate({ brightness })
    .toBuffer()
}

export async function createCroppedVersion(
  imageBuffer: Buffer,
  cropPercentage: number = 0.3
): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata()
  const width = metadata.width || 800
  const height = metadata.height || 600
  
  const cropWidth = Math.floor(width * cropPercentage)
  const cropHeight = Math.floor(height * cropPercentage)
  
  // Random position for the crop
  const left = Math.floor(Math.random() * (width - cropWidth))
  const top = Math.floor(Math.random() * (height - cropHeight))
  
  return sharp(imageBuffer)
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .resize(width, height)
    .blur(5)
    .toBuffer()
}
*/