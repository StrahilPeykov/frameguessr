export type HintLevel = 1 | 2 | 3
export type BlurIntensity = 'heavy' | 'medium' | 'light' | 'none'

const BLUR_CLASSES: Record<BlurIntensity, string> = {
  heavy: 'blur-heavy',
  medium: 'blur-medium', 
  light: 'blur-light',
  none: ''
}

const HINT_TO_BLUR: Record<HintLevel, BlurIntensity> = {
  1: 'heavy',
  2: 'medium',
  3: 'light'
}

const BLUR_DESCRIPTIONS: Record<BlurIntensity, string> = {
  heavy: 'Image is heavily blurred - first hint level',
  medium: 'Image is moderately blurred - second hint level',
  light: 'Image is lightly blurred - third hint level',
  none: 'Image is clear and unblurred'
}

export function getBlurClass(hintLevel: HintLevel, completed: boolean = false): string {
  if (completed) return BLUR_CLASSES.none
  return BLUR_CLASSES[HINT_TO_BLUR[hintLevel]]
}

export function getBlurDescription(hintLevel: HintLevel, completed: boolean = false): string {
  if (completed) return BLUR_DESCRIPTIONS.none
  return BLUR_DESCRIPTIONS[HINT_TO_BLUR[hintLevel]]
}

export function useBlur(hintLevel: HintLevel, completed: boolean = false) {
  const blurIntensity = completed ? 'none' : HINT_TO_BLUR[hintLevel]
  
  return {
    className: BLUR_CLASSES[blurIntensity],
    description: BLUR_DESCRIPTIONS[blurIntensity],
    intensity: blurIntensity,
    isBlurred: !completed && blurIntensity !== 'none',
    isUnblurred: blurIntensity === 'none'
  }
}