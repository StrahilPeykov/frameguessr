export type HintLevel = 1 | 2 | 3 | 'complete'
export type BlurIntensity = 'heavy' | 'medium' | 'light' | 'none'

// Cinema blur configuration - all values centralized here
export const BLUR_CONFIG = {
  heavy: {
    blur: 25,
    brightness: 0.75,
    contrast: 1.05,
    saturate: 1.1,
    className: 'blur-heavy'
  },
  medium: {
    blur: 12,
    brightness: 0.9,
    contrast: 1.05,
    saturate: 1.05,
    className: 'blur-medium'
  },
  light: {
    blur: 4,
    brightness: 1,
    contrast: 1.1,
    saturate: 1,
    className: 'blur-light'
  },
  none: {
    blur: 0,
    brightness: 1,
    contrast: 1,
    saturate: 1,
    className: ''
  }
} as const

// Map hint levels to blur intensities
export const HINT_LEVEL_TO_BLUR: Record<HintLevel, BlurIntensity> = {
  1: 'heavy',
  2: 'medium', 
  3: 'light',
  'complete': 'none'
} as const

/**
 * Get blur class name for a hint level
 */
export function getBlurClass(hintLevel: HintLevel, completed: boolean = false): string {
  if (completed) return BLUR_CONFIG.none.className
  
  const blurIntensity = HINT_LEVEL_TO_BLUR[hintLevel]
  return BLUR_CONFIG[blurIntensity].className
}

/**
 * Get inline CSS filter for a hint level
 */
export function getBlurFilter(hintLevel: HintLevel, completed: boolean = false): string {
  if (completed) return 'none'
  
  const blurIntensity = HINT_LEVEL_TO_BLUR[hintLevel]
  const config = BLUR_CONFIG[blurIntensity]
  
  const filters = []
  
  if (config.blur > 0) {
    filters.push(`blur(${config.blur}px)`)
  }
  
  if (config.brightness !== 1) {
    filters.push(`brightness(${config.brightness})`)
  }
  
  if (config.contrast !== 1) {
    filters.push(`contrast(${config.contrast})`)
  }
  
  if (config.saturate !== 1) {
    filters.push(`saturate(${config.saturate})`)
  }
  
  return filters.length > 0 ? filters.join(' ') : 'none'
}

/**
 * Generate CSS classes for all blur levels
 * Use this to generate the CSS for globals.css
 */
export function generateBlurCSS(): string {
  return Object.entries(BLUR_CONFIG)
    .filter(([_, config]) => config.className)
    .map(([intensity, config]) => {
      const filter = getBlurFilter(
        Object.keys(HINT_LEVEL_TO_BLUR).find(
          level => HINT_LEVEL_TO_BLUR[level as HintLevel] === intensity as BlurIntensity
        ) as HintLevel
      )
      
      return `.${config.className} {
  filter: ${filter};
  transition: filter 0.5s ease-in-out;
}`
    })
    .join('\n\n')
}

/**
 * Get blur description for accessibility
 */
export function getBlurDescription(hintLevel: HintLevel, completed: boolean = false): string {
  if (completed) return 'Image is clear and unblurred'
  
  const blurIntensity = HINT_LEVEL_TO_BLUR[hintLevel]
  
  switch (blurIntensity) {
    case 'heavy':
      return 'Image is heavily blurred - first hint level'
    case 'medium':
      return 'Image is moderately blurred - second hint level'  
    case 'light':
      return 'Image is lightly blurred - third hint level'
    default:
      return 'Image blur level unknown'
  }
}

/**
 * Get blur configuration object for a hint level
 */
export function getBlurConfig(hintLevel: HintLevel, completed: boolean = false) {
  if (completed) return BLUR_CONFIG.none
  
  const blurIntensity = HINT_LEVEL_TO_BLUR[hintLevel]
  return BLUR_CONFIG[blurIntensity]
}

/**
 * Hook for using blur state in React components
 * Returns all blur-related data needed for components
 */
export function useBlur(hintLevel: HintLevel, completed: boolean = false) {
  const blurIntensity = completed ? 'none' : HINT_LEVEL_TO_BLUR[hintLevel]
  const config = BLUR_CONFIG[blurIntensity]
  
  return {
    className: config.className,
    filter: getBlurFilter(hintLevel, completed),
    description: getBlurDescription(hintLevel, completed),
    intensity: blurIntensity,
    config: config,
    // Convenience booleans
    isBlurred: !completed && blurIntensity !== 'none',
    isHeavyBlur: blurIntensity === 'heavy',
    isMediumBlur: blurIntensity === 'medium',
    isLightBlur: blurIntensity === 'light',
    isUnblurred: blurIntensity === 'none'
  }
}

/**
 * Validate hint level input
 */
export function isValidHintLevel(value: any): value is HintLevel {
  return [1, 2, 3, 'complete'].includes(value)
}

/**
 * Get next hint level (for skip functionality)
 */
export function getNextHintLevel(currentLevel: HintLevel): HintLevel {
  switch (currentLevel) {
    case 1: return 2
    case 2: return 3
    case 3: return 'complete'
    case 'complete': return 'complete'
    default: return 1
  }
}

/**
 * Get previous hint level (for undo functionality)
 */
export function getPreviousHintLevel(currentLevel: HintLevel): HintLevel {
  switch (currentLevel) {
    case 1: return 1
    case 2: return 1
    case 3: return 2
    case 'complete': return 3
    default: return 1
  }
}

/**
 * Check if blur transition should be animated
 */
export function shouldAnimateBlur(): boolean {
  if (typeof window === 'undefined') return true
  
  // Respect user's reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return !prefersReducedMotion
}

/**
 * Calculate blur transition duration based on intensity change
 */
export function getBlurTransitionDuration(
  fromLevel: HintLevel, 
  toLevel: HintLevel,
  baseDuration: number = 800
): number {
  if (!shouldAnimateBlur()) return 0
  
  const fromIntensity = HINT_LEVEL_TO_BLUR[fromLevel]
  const toIntensity = HINT_LEVEL_TO_BLUR[toLevel]
  
  // Map intensities to numbers for calculation
  const intensityValues = { none: 0, light: 1, medium: 2, heavy: 3 }
  const fromValue = intensityValues[fromIntensity]
  const toValue = intensityValues[toIntensity]
  
  // Longer duration for bigger changes
  const difference = Math.abs(fromValue - toValue)
  return baseDuration + (difference * 200)
}

/**
 * Export types for use in components
 */
export type BlurConfig = typeof BLUR_CONFIG
export type BlurReturn = ReturnType<typeof useBlur>

/**
 * CSS generation utility for build time
 * Call this during build to generate static CSS
 */
export function generateStaticBlurCSS(): string {
  const css = `
/* === CONSOLIDATED BLUR SYSTEM === */
/* Generated from utils/blur.ts configuration */

.blur-heavy {
  filter: ${getBlurFilter(1)};
  transition: filter 0.5s ease-in-out;
}

.blur-medium {
  filter: ${getBlurFilter(2)};
  transition: filter 0.5s ease-in-out;
}

.blur-light {
  filter: ${getBlurFilter(3)};
  transition: filter 0.5s ease-in-out;
}

/* Accessibility: Reduce blur for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .blur-heavy,
  .blur-medium,
  .blur-light {
    transition: none !important;
  }
}

/* High contrast mode: Disable blur for better accessibility */
@media (prefers-contrast: high) {
  .blur-heavy,
  .blur-medium,
  .blur-light {
    filter: contrast(2) !important;
  }
}
`
  return css.trim()
}

// Development utilities
if (process.env.NODE_ENV === 'development') {
  // Add debug info to window for development
  if (typeof window !== 'undefined') {
    (window as any).__FRAMEGUESSR_BLUR_CONFIG__ = {
      BLUR_CONFIG,
      HINT_LEVEL_TO_BLUR,
      generateCSS: generateStaticBlurCSS,
      utils: {
        getBlurClass,
        getBlurFilter,
        getBlurDescription,
        useBlur
      }
    }
  }
}