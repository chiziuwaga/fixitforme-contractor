// FixItForMe Brand System
export const BRAND = {
  name: 'FixItForMe',
  tagline: 'AI-Powered Contractor Platform',
    colors: {
    // Primary Brand Colors
    primary: '#D4A574',      // Felix Gold
    secondary: '#1A2E1A',    // Forest Green
    accent: '#6B7280',       // Slate Gray
    
    // UI Colors
    success: '#10B981',      // Emerald
    warning: '#F59E0B',      // Amber
    error: '#EF4444',        // Red
    info: '#3B82F6',         // Blue
    
    // Agent Colors (from FixItForMe branding)
    agents: {
      lexi: '#1e40af',       // Blue - Liaison/Guide
      alex: '#059669',       // Green - Assessor/Analysis
      rex: '#d97706',        // Orange - Retriever/Search
    },
    
    // Grays
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    
    // Background Colors
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
    }
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },
    
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    }
  },
  
  spacing: {
    xs: '0.5rem',      // 8px
    sm: '0.75rem',     // 12px
    md: '1rem',        // 16px
    lg: '1.5rem',      // 24px
    xl: '2rem',        // 32px
    '2xl': '3rem',     // 48px
    '3xl': '4rem',     // 64px
  },
  
  borderRadius: {
    sm: '0.25rem',     // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  agents: {
    lexi: {
      name: 'Lexi the Liaison',
      color: '#D4A574',
      avatar: '👩‍💼',
      description: 'Onboarding & Setup Guide',
      personality: 'Friendly, organized, and thorough'
    },
    alex: {
      name: 'Alex the Assessor', 
      color: '#1A2E1A',
      avatar: '📊',
      description: 'Bidding & Cost Analysis',
      personality: 'Analytical, precise, and strategic'
    },
    rex: {
      name: 'Rex the Retriever',
      color: '#6B7280', 
      avatar: '🔍',
      description: 'Lead Generation & Market Intelligence',
      personality: 'Methodical, data-driven, and efficient'
    }
  },
  
  breakpoints: {
    mobile: '640px',
    tablet: '768px', 
    desktop: '1024px',
    wide: '1280px',
    ultrawide: '1536px',
  }
};

// CSS Custom Properties for consistent theming
export const CSS_VARIABLES = `
  :root {
    --color-primary: ${BRAND.colors.primary};
    --color-secondary: ${BRAND.colors.secondary};
    --color-accent: ${BRAND.colors.accent};
    
    --color-success: ${BRAND.colors.success};
    --color-warning: ${BRAND.colors.warning};
    --color-error: ${BRAND.colors.error};
    --color-info: ${BRAND.colors.info};
    
    --color-bg-primary: ${BRAND.colors.background.primary};
    --color-bg-secondary: ${BRAND.colors.background.secondary};
    --color-bg-tertiary: ${BRAND.colors.background.tertiary};
    
    --font-family-sans: ${BRAND.typography.fontFamily.sans.join(', ')};
    --font-family-mono: ${BRAND.typography.fontFamily.mono.join(', ')};
    
    --spacing-xs: ${BRAND.spacing.xs};
    --spacing-sm: ${BRAND.spacing.sm};
    --spacing-md: ${BRAND.spacing.md};
    --spacing-lg: ${BRAND.spacing.lg};
    --spacing-xl: ${BRAND.spacing.xl};
    
    --border-radius-sm: ${BRAND.borderRadius.sm};
    --border-radius-md: ${BRAND.borderRadius.md};
    --border-radius-lg: ${BRAND.borderRadius.lg};
    --border-radius-xl: ${BRAND.borderRadius.xl};
    
    --shadow-sm: ${BRAND.shadows.sm};
    --shadow-md: ${BRAND.shadows.md};
    --shadow-lg: ${BRAND.shadows.lg};
    --shadow-xl: ${BRAND.shadows.xl};
  }
`;

// Device detection utilities
export const DEVICE_UTILS = {
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  },
  
  isTablet: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  },
  
  isDesktop: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  },
  
  shouldRedirectMobile: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640; // Only redirect very small screens
  }
};
