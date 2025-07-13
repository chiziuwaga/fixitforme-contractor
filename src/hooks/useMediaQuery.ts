"use client"

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    
    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)
    
    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }
    
    // Add event listener
    media.addEventListener('change', listener)
    
    // Cleanup
    return () => media.removeEventListener('change', listener)
  }, [query, mounted])

  // Return false during SSR to prevent hydration mismatches
  return mounted ? matches : false
}

// Convenience hooks for common breakpoints
export const useIsMobile = () => useMediaQuery('(max-width: 768px)')
export const useIsTablet = () => useMediaQuery('(max-width: 1024px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)')

// Responsive hook that returns current breakpoint
export function useBreakpoint() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const isDesktop = useMediaQuery('(min-width: 1025px)')
  
  if (isMobile) return 'mobile'
  if (isTablet) return 'tablet'
  if (isDesktop) return 'desktop'
  return 'unknown'
}
