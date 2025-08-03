import { getAvatarDisplay } from '@/utils/avatars'

interface AvatarProps {
  avatarValue?: string | null
  displayName: string
  size?: number
  className?: string
  onClick?: () => void
}

export default function Avatar({ 
  avatarValue, 
  displayName, 
  size = 40, 
  className = '',
  onClick 
}: AvatarProps) {
  const avatarDisplay = getAvatarDisplay(avatarValue, displayName, size)
  
  const baseClasses = `inline-flex items-center justify-center rounded-full flex-shrink-0 ${
    onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
  } ${className}`
  
  const sizeClasses = `w-${Math.ceil(size / 4)} h-${Math.ceil(size / 4)}`
  
  const handleClick = () => {
    if (onClick) onClick()
  }
  
  switch (avatarDisplay.type) {
    case 'avatar':
      return (
        <div 
          className={`${baseClasses} ${sizeClasses}`}
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: avatarDisplay.content }}
          aria-label={`${displayName}'s avatar`}
        />
      )
      
    case 'url':
      return (
        <img
          src={avatarDisplay.content}
          alt={`${displayName}'s avatar`}
          className={`${baseClasses} ${sizeClasses} object-cover`}
          onClick={handleClick}
          style={{ width: size, height: size }}
        />
      )
      
    case 'initials':
    default:
      return (
        <div
          className={`${baseClasses} bg-gradient-to-br from-amber-500 to-orange-600 text-white font-semibold text-sm`}
          onClick={handleClick}
          style={{ width: size, height: size, fontSize: size * 0.4 }}
          aria-label={`${displayName}'s initials: ${avatarDisplay.content}`}
        >
          {avatarDisplay.content}
        </div>
      )
  }
}