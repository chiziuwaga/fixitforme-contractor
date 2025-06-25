// Enhanced Responsive Design System for FixItForMe
// Supports 8 desktop + 8 tablet screen sizes with mobile redirect

// 8 Desktop Screen Size Categories (1024px+)
export const DESKTOP_BREAKPOINTS = {
  // Standard Desktop Range
  small: { min: 1024, max: 1199, name: 'Small Desktop (1024-1199px)' },
  medium: { min: 1200, max: 1365, name: 'Medium Desktop (1200-1365px)' },
  large: { min: 1366, max: 1535, name: 'Large Desktop (1366-1535px)' },
  xlarge: { min: 1536, max: 1919, name: 'XL Desktop (1536-1919px)' },
  
  // Wide Desktop Range  
  ultrawide: { min: 1920, max: 2559, name: 'Ultrawide (1920-2559px)' },
  superwide: { min: 2560, max: 3439, name: 'Superwide (2560-3439px)' },
  cinema: { min: 3440, max: 4095, name: 'Cinema Display (3440-4095px)' },
  massive: { min: 4096, max: 7680, name: 'Massive Display (4096px+)' }
};

// 8 Tablet Screen Size Categories (768-1023px)
export const TABLET_BREAKPOINTS = {
  // Portrait Tablets
  mini: { min: 768, max: 834, name: 'Mini Tablet Portrait (768-834px)' },
  standard: { min: 835, max: 1023, name: 'Standard Tablet Portrait (835-1023px)' },
  
  // Landscape Tablets  
  mini_landscape: { min: 1024, max: 1112, name: 'Mini Tablet Landscape (1024-1112px)' },
  standard_landscape: { min: 1113, max: 1366, name: 'Standard Tablet Landscape (1113-1366px)' },
  
  // Professional Tablets
  pro_portrait: { min: 1024, max: 1366, name: 'Pro Tablet Portrait (1024-1366px)' },
  pro_landscape: { min: 1366, max: 1536, name: 'Pro Tablet Landscape (1366-1536px)' },
  
  // Large Format Tablets
  large_portrait: { min: 1080, max: 1440, name: 'Large Tablet Portrait (1080-1440px)' },
  large_landscape: { min: 1440, max: 1920, name: 'Large Tablet Landscape (1440-1920px)' }
};

// Mobile Detection (redirect required)
export const MOBILE_BREAKPOINT = { max: 767, name: 'Mobile (up to 767px)' };

// Typography Scale for Different Screen Sizes
export const TYPOGRAPHY_SCALES = {
  mobile: {
    h1: '24px',
    h2: '20px', 
    h3: '18px',
    body: '14px',
    caption: '12px'
  },
  tablet: {
    h1: '32px',
    h2: '28px',
    h3: '24px', 
    body: '16px',
    caption: '14px'
  },
  desktop: {
    h1: '48px',
    h2: '36px',
    h3: '28px',
    body: '16px',
    caption: '14px'
  },
  ultrawide: {
    h1: '64px',
    h2: '48px',
    h3: '36px',
    body: '18px',
    caption: '16px'
  }
};

// Component Sizing for Different Breakpoints
export const COMPONENT_SCALES = {
  // Chat Window Sizing
  chat: {
    mobile: { width: '100%', height: '60vh' },
    tablet: { width: '85%', height: '70vh' },
    desktop: { width: '70%', height: '75vh' },
    ultrawide: { width: '60%', height: '80vh' }
  },
  
  // Lead Feed Sizing
  leadFeed: {
    mobile: { width: '100%', columns: 1 },
    tablet: { width: '100%', columns: 2 },
    desktop: { width: '30%', columns: 1 },
    ultrawide: { width: '25%', columns: 1 }
  },
  
  // Dashboard Grid
  dashboard: {
    mobile: { columns: 1, gap: '16px' },
    tablet: { columns: 2, gap: '20px' },
    desktop: { columns: 3, gap: '24px' },
    ultrawide: { columns: 4, gap: '32px' }
  }
};

// Spacing Scale Based on Screen Size
export const SPACING_SCALES = {
  mobile: {
    xs: '4px',
    sm: '8px', 
    md: '12px',
    lg: '16px',
    xl: '24px'
  },
  tablet: {
    xs: '6px',
    sm: '12px',
    md: '16px', 
    lg: '24px',
    xl: '32px'
  },
  desktop: {
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px'
  },
  ultrawide: {
    xs: '12px',
    sm: '24px',
    md: '36px',
    lg: '48px', 
    xl: '64px'
  }
};

// Device Detection Utilities
export const RESPONSIVE_UTILS = {
  // Get current device category
  getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    
    if (width <= MOBILE_BREAKPOINT.max) return 'mobile';
    if (width <= 1023) return 'tablet';
    return 'desktop';
  },
  
  // Get specific breakpoint info
  getBreakpointInfo() {
    if (typeof window === 'undefined') return null;
    
    const width = window.innerWidth;
    const deviceType = this.getDeviceType();
    
    if (deviceType === 'mobile') {
      return { type: 'mobile', ...MOBILE_BREAKPOINT };
    }
    
    if (deviceType === 'tablet') {
      for (const [key, breakpoint] of Object.entries(TABLET_BREAKPOINTS)) {
        if (width >= breakpoint.min && width <= breakpoint.max) {
          return { type: 'tablet', key, ...breakpoint };
        }
      }
    }
    
    if (deviceType === 'desktop') {
      for (const [key, breakpoint] of Object.entries(DESKTOP_BREAKPOINTS)) {
        if (width >= breakpoint.min && (breakpoint.max ? width <= breakpoint.max : true)) {
          return { type: 'desktop', key, ...breakpoint };
        }
      }
    }
    
    return null;
  },
  
  // Check if mobile redirect is needed
  shouldRedirectMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= MOBILE_BREAKPOINT.max;
  },
  
  // Get appropriate typography scale
  getTypographyScale() {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    
    if (width <= MOBILE_BREAKPOINT.max) return TYPOGRAPHY_SCALES.mobile;
    if (width <= 1023) return TYPOGRAPHY_SCALES.tablet;
    if (width >= 2560) return TYPOGRAPHY_SCALES.ultrawide;
    return TYPOGRAPHY_SCALES.desktop;
  },
  
  // Get appropriate spacing scale
  getSpacingScale() {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    
    if (width <= MOBILE_BREAKPOINT.max) return SPACING_SCALES.mobile;
    if (width <= 1023) return SPACING_SCALES.tablet;
    if (width >= 2560) return SPACING_SCALES.ultrawide;
    return SPACING_SCALES.desktop;
  }
};

// CSS Media Queries Generator
export const MEDIA_QUERIES = {
  // Mobile redirect detection
  mobile: `@media (max-width: ${MOBILE_BREAKPOINT.max}px)`,
  
  // Tablet ranges
  tablet: {
    all: '@media (min-width: 768px) and (max-width: 1023px)',
    portrait: '@media (min-width: 768px) and (max-width: 1023px) and (orientation: portrait)',
    landscape: '@media (min-width: 768px) and (max-width: 1023px) and (orientation: landscape)'
  },
  
  // Desktop ranges
  desktop: {
    all: '@media (min-width: 1024px)',
    small: '@media (min-width: 1024px) and (max-width: 1199px)',
    medium: '@media (min-width: 1200px) and (max-width: 1365px)',
    large: '@media (min-width: 1366px) and (max-width: 1535px)',
    xlarge: '@media (min-width: 1536px) and (max-width: 1919px)',
    ultrawide: '@media (min-width: 1920px) and (max-width: 2559px)',
    superwide: '@media (min-width: 2560px) and (max-width: 3439px)',
    cinema: '@media (min-width: 3440px) and (max-width: 4095px)',
    massive: '@media (min-width: 4096px)'
  }
};

// Chat-Centric Layout Configuration
export const CHAT_CENTRIC_LAYOUT = {
  // Primary chat area takes 70% of desktop space
  chatArea: {
    mobile: '100%',
    tablet: '100%', 
    desktop: '70%',
    ultrawide: '65%'
  },
  
  // Secondary panels (leads, stats) take remaining space
  sidePanel: {
    mobile: '100%',
    tablet: '100%',
    desktop: '30%', 
    ultrawide: '35%'
  },
  
  // Adaptive layout switching
  layoutMode: {
    mobile: 'stack',    // Vertical stacking
    tablet: 'tabs',     // Tabbed interface
    desktop: 'split',   // Side-by-side
    ultrawide: 'triple' // Three-column layout
  }
};

// Export default configuration
const ResponsiveConfig = {
  DESKTOP_BREAKPOINTS,
  TABLET_BREAKPOINTS,
  MOBILE_BREAKPOINT,
  TYPOGRAPHY_SCALES,
  COMPONENT_SCALES,
  SPACING_SCALES,
  RESPONSIVE_UTILS,
  MEDIA_QUERIES,
  CHAT_CENTRIC_LAYOUT
};

export default ResponsiveConfig;
