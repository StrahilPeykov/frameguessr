// For server-side image processing
// This would be used in the cron job to create blurred versions

export function getBlurDataURL(): string {
  // Placeholder blur while loading
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
}

// CSS filter strings for different blur levels
export const blurFilters = {
  heavy: 'blur(20px) brightness(0.8)',
  medium: 'blur(10px) brightness(0.9)',
  light: 'blur(5px)',
  none: 'none'
}

// For client-side, you can apply CSS filters
// For server-side with Sharp, you would do actual image processing:

/*
import sharp from 'sharp'

export async function createBlurredVersion(
  imageBuffer: Buffer, 
  level: 'heavy' | 'medium' | 'light'
): Promise<Buffer> {
  const blurAmount = level === 'heavy' ? 20 : level === 'medium' ? 10 : 5
  const brightness = level === 'heavy' ? 0.8 : level === 'medium' ? 0.9 : 1
  
  return sharp(imageBuffer)
    .blur(blurAmount)
    .modulate({ brightness })
    .toBuffer()
}

export async function createCroppedVersion(
  imageBuffer: Buffer,
  cropPercentage: number = 0.3 // Show only 30% of the image
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
    .resize(width, height) // Resize back to original dimensions
    .blur(5) // Add slight blur
    .toBuffer()
}
*/