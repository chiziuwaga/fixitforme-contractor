'use client'

import { useState, useEffect } from 'react'
import { 
  SCREEN_BREAKPOINTS,
  getChartDimensions, 
  getChartConfig,
  CHART_RESPONSIVE_DIMENSIONS 
} from '../lib/chart-responsive'

// Get current screen breakpoint
function getCurrentBreakpoint(): keyof typeof SCREEN_BREAKPOINTS {
  if (typeof window === 'undefined') return 'lg'; // SSR fallback
  
  const width = window.innerWidth;
  
  if (width >= SCREEN_BREAKPOINTS['4xl']) return '4xl';
  if (width >= SCREEN_BREAKPOINTS['3xl']) return '3xl';
  if (width >= SCREEN_BREAKPOINTS['2xl']) return '2xl';
  if (width >= SCREEN_BREAKPOINTS.xl) return 'xl';
  if (width >= SCREEN_BREAKPOINTS.lg) return 'lg';
  if (width >= SCREEN_BREAKPOINTS.md) return 'md';
  if (width >= SCREEN_BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

// Hook for responsive D3 charts that adapts to screen changes
export function useResponsiveChart(chartType: keyof typeof CHART_RESPONSIVE_DIMENSIONS) {
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      // SSR fallback
      return getChartDimensions(chartType, 'lg')
    }
    const breakpoint = getCurrentBreakpoint()
    return getChartDimensions(chartType, breakpoint)
  })
  
  const [config, setConfig] = useState(() => {
    if (typeof window === 'undefined') {
      return getChartConfig('lg')
    }
    const breakpoint = getCurrentBreakpoint()
    return getChartConfig(breakpoint)
  })

  useEffect(() => {
    const handleResize = () => {
      const breakpoint = getCurrentBreakpoint()
      setDimensions(getChartDimensions(chartType, breakpoint))
      setConfig(getChartConfig(breakpoint))
    }

    // Set initial values
    handleResize()
    
    // Add resize listener with debounce
    let timeoutId: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleResize, 150)
    }

    window.addEventListener('resize', debouncedResize)
    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [chartType])

  return { dimensions, config }
}
