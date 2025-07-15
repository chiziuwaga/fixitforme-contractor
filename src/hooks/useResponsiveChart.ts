'use client'

import { useState, useEffect } from 'react'
import { 
  SCREEN_BREAKPOINTS,
  getChartDimensions, 
  getChartConfig,
  CHART_RESPONSIVE_DIMENSIONS 
} from '../lib/chart-responsive'

// 8-Breakpoint responsive system with precise pixel values
const ENHANCED_BREAKPOINTS = {
  'mobile-xs': 320,   // iPhone SE, older phones
  'mobile-sm': 375,   // iPhone 12 Mini, standard mobile
  'mobile-lg': 414,   // iPhone 12 Pro Max, large phones
  'tablet-sm': 768,   // iPad Mini, small tablets
  'tablet-lg': 1024,  // iPad Pro, large tablets
  'desktop-sm': 1280, // Laptop screens
  'desktop-lg': 1440, // Desktop monitors
  'desktop-xl': 1920  // Large displays
} as const

type EnhancedBreakpointKey = keyof typeof ENHANCED_BREAKPOINTS
type DeviceType = 'mobile' | 'tablet' | 'desktop'

interface ContractorUIPreferences {
  contractor_id: string
  preferred_breakpoint?: EnhancedBreakpointKey
  detected_device_type: DeviceType
  screen_resolution: string
  last_updated: string
  responsive_features_enabled: boolean
}

// Get current screen breakpoint with enhanced 8-breakpoint system
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

// Get enhanced breakpoint for 8-breakpoint system
function getEnhancedBreakpoint(): EnhancedBreakpointKey {
  if (typeof window === 'undefined') return 'mobile-sm';
  
  const width = window.innerWidth;
  
  if (width < ENHANCED_BREAKPOINTS['mobile-sm']) return 'mobile-xs';
  if (width < ENHANCED_BREAKPOINTS['mobile-lg']) return 'mobile-sm';
  if (width < ENHANCED_BREAKPOINTS['tablet-sm']) return 'mobile-lg';
  if (width < ENHANCED_BREAKPOINTS['tablet-lg']) return 'tablet-sm';
  if (width < ENHANCED_BREAKPOINTS['desktop-sm']) return 'tablet-lg';
  if (width < ENHANCED_BREAKPOINTS['desktop-lg']) return 'desktop-sm';
  if (width < ENHANCED_BREAKPOINTS['desktop-xl']) return 'desktop-lg';
  return 'desktop-xl';
}

// Get device type from screen width
function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'mobile';
  
  const width = window.innerWidth;
  if (width < ENHANCED_BREAKPOINTS['tablet-sm']) return 'mobile';
  if (width < ENHANCED_BREAKPOINTS['desktop-sm']) return 'tablet';
  return 'desktop';
}

// Hook for responsive D3 charts that adapts to screen changes with enhanced breakpoints
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

  // Enhanced responsive state
  const [enhancedBreakpoint, setEnhancedBreakpoint] = useState<EnhancedBreakpointKey>('mobile-sm')
  const [deviceType, setDeviceType] = useState<DeviceType>('mobile')
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const handleResize = () => {
      const breakpoint = getCurrentBreakpoint()
      const enhancedBp = getEnhancedBreakpoint()
      const device = getDeviceType()
      
      setDimensions(getChartDimensions(chartType, breakpoint))
      setConfig(getChartConfig(breakpoint))
      setEnhancedBreakpoint(enhancedBp)
      setDeviceType(device)
      setScreenSize({ width: window.innerWidth, height: window.innerHeight })
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

  // Enhanced responsive utilities
  const isMobile = deviceType === 'mobile'
  const isTablet = deviceType === 'tablet'
  const isDesktop = deviceType === 'desktop'
  
  const getResponsiveValue = <T>(mobile: T, tablet: T, desktop: T): T => {
    switch (deviceType) {
      case 'mobile': return mobile
      case 'tablet': return tablet
      case 'desktop': return desktop
      default: return mobile
    }
  }

  const isBreakpoint = (breakpoint: EnhancedBreakpointKey) => enhancedBreakpoint === breakpoint
  
  const isAboveBreakpoint = (breakpoint: EnhancedBreakpointKey) => {
    const currentWidth = screenSize.width
    const targetWidth = ENHANCED_BREAKPOINTS[breakpoint]
    return currentWidth >= targetWidth
  }

  return { 
    // Original API
    dimensions, 
    config,
    
    // Enhanced responsive data
    enhancedBreakpoint,
    deviceType,
    screenSize,
    
    // Device detection utilities
    isMobile,
    isTablet,
    isDesktop,
    
    // Responsive helpers
    getResponsiveValue,
    isBreakpoint,
    isAboveBreakpoint
  }
}

// Export types for external use
export type { EnhancedBreakpointKey, DeviceType, ContractorUIPreferences }
