// Avatar system with predefined avatar options
export interface AvatarOption {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent?: string
  }
  pattern: 'geometric' | 'gradient' | 'abstract' | 'minimal'
}

export const PREDEFINED_AVATARS: AvatarOption[] = [
  // Geometric patterns
  {
    id: 'geo-01',
    name: 'Cinema Red',
    colors: { primary: '#8B1538', secondary: '#D4A574' },
    pattern: 'geometric'
  },
  {
    id: 'geo-02', 
    name: 'Ocean Blue',
    colors: { primary: '#1E40AF', secondary: '#60A5FA' },
    pattern: 'geometric'
  },
  {
    id: 'geo-03',
    name: 'Forest Green', 
    colors: { primary: '#059669', secondary: '#34D399' },
    pattern: 'geometric'
  },
  {
    id: 'geo-04',
    name: 'Sunset Orange',
    colors: { primary: '#EA580C', secondary: '#FB923C' },
    pattern: 'geometric'
  },
  {
    id: 'geo-05',
    name: 'Royal Purple',
    colors: { primary: '#7C3AED', secondary: '#A78BFA' },
    pattern: 'geometric'
  },
  {
    id: 'geo-06',
    name: 'Rose Gold',
    colors: { primary: '#BE185D', secondary: '#F472B6' },
    pattern: 'geometric'
  },

  // Gradient patterns
  {
    id: 'grad-01',
    name: 'Warm Sunset',
    colors: { primary: '#F59E0B', secondary: '#EF4444', accent: '#EC4899' },
    pattern: 'gradient'
  },
  {
    id: 'grad-02',
    name: 'Cool Ocean',
    colors: { primary: '#3B82F6', secondary: '#06B6D4', accent: '#10B981' },
    pattern: 'gradient'
  },
  {
    id: 'grad-03', 
    name: 'Purple Haze',
    colors: { primary: '#8B5CF6', secondary: '#A855F7', accent: '#EC4899' },
    pattern: 'gradient'
  },
  {
    id: 'grad-04',
    name: 'Forest Mist',
    colors: { primary: '#059669', secondary: '#0891B2', accent: '#3B82F6' },
    pattern: 'gradient'
  },

  // Abstract patterns  
  {
    id: 'abs-01',
    name: 'Cosmic Swirl',
    colors: { primary: '#1F2937', secondary: '#F59E0B', accent: '#EF4444' },
    pattern: 'abstract'
  },
  {
    id: 'abs-02',
    name: 'Neon Dreams',
    colors: { primary: '#0F172A', secondary: '#06D6A0', accent: '#FFD23F' },
    pattern: 'abstract'
  },
  {
    id: 'abs-03',
    name: 'Retro Wave',
    colors: { primary: '#312E81', secondary: '#EC4899', accent: '#06D6A0' },
    pattern: 'abstract'
  },

  // Minimal patterns
  {
    id: 'min-01',
    name: 'Simple Gray',
    colors: { primary: '#6B7280', secondary: '#9CA3AF' },
    pattern: 'minimal'
  },
  {
    id: 'min-02',
    name: 'Warm Beige',
    colors: { primary: '#92400E', secondary: '#D97706' },
    pattern: 'minimal'
  },
  {
    id: 'min-03',
    name: 'Cool Slate',
    colors: { primary: '#475569', secondary: '#64748B' },
    pattern: 'minimal'
  }
]

export function getAvatarById(id: string): AvatarOption | null {
  return PREDEFINED_AVATARS.find(avatar => avatar.id === id) || null
}

export function generateAvatarSVG(avatar: AvatarOption, size: number = 40): string {
  const { colors, pattern } = avatar
  
  switch (pattern) {
    case 'geometric':
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="20" fill="${colors.primary}"/>
          <polygon points="20,8 32,20 20,32 8,20" fill="${colors.secondary}"/>
          <circle cx="20" cy="20" r="6" fill="${colors.primary}"/>
        </svg>
      `
    
    case 'gradient':
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-${avatar.id}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${colors.primary}"/>
              <stop offset="50%" style="stop-color:${colors.secondary}"/>
              ${colors.accent ? `<stop offset="100%" style="stop-color:${colors.accent}"/>` : ''}
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="20" fill="url(#grad-${avatar.id})"/>
        </svg>
      `
      
    case 'abstract':
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="20" fill="${colors.primary}"/>
          <path d="M8 20 Q20 8 32 20 Q20 32 8 20" fill="${colors.secondary}"/>
          ${colors.accent ? `<circle cx="20" cy="16" r="4" fill="${colors.accent}"/>` : ''}
        </svg>
      `
      
    case 'minimal':
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="20" fill="${colors.primary}"/>
          <circle cx="20" cy="20" r="12" fill="none" stroke="${colors.secondary}" stroke-width="2"/>
        </svg>
      `
      
    default:
      return generateDefaultAvatar(size)
  }
}

export function generateDefaultAvatar(size: number = 40): string {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#6B7280"/>
      <circle cx="20" cy="16" r="5" fill="#ffffff"/>
      <path d="M12 30 Q20 25 28 30" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

export function isAvatarId(value: string): boolean {
  return PREDEFINED_AVATARS.some(avatar => avatar.id === value)
}

export function getAvatarDisplay(avatarValue: string | null | undefined, displayName: string, size: number = 40): {
  type: 'avatar' | 'initials' | 'url'
  content: string
} {
  // Check if it's a predefined avatar ID
  if (avatarValue && isAvatarId(avatarValue)) {
    const avatar = getAvatarById(avatarValue)
    if (avatar) {
      return {
        type: 'avatar',
        content: generateAvatarSVG(avatar, size)
      }
    }
  }
  
  // Check if it's a URL (for future custom uploads)
  if (avatarValue && (avatarValue.startsWith('http') || avatarValue.startsWith('data:'))) {
    return {
      type: 'url',
      content: avatarValue
    }
  }
  
  // Fallback to initials
  return {
    type: 'initials',
    content: getInitials(displayName)
  }
}