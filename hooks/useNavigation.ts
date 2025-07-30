import { useState, useEffect } from 'react'

export function useNavigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Scroll listener for navigation transparency
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsScrolled(scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when clicking outside or pressing escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showMobileMenu) {
        setShowMobileMenu(false)
      }
    }

    if (showMobileMenu) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [showMobileMenu])

  const openMobileMenu = () => setShowMobileMenu(true)
  const closeMobileMenu = () => setShowMobileMenu(false)

  return {
    isScrolled,
    showMobileMenu,
    openMobileMenu,
    closeMobileMenu,
  }
}

export default useNavigation