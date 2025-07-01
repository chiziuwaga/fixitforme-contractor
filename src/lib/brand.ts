// FixItForMe Brand System - Official Design Specification
export const BRAND = {
  name: 'FixItForMe',
  tagline: 'Professional Home Repairs',
  
  colors: {
    // Primary Brand Colors (from official brand guide)
    primary: '#D4A574',      // Felix Gold - Primary brand color
    secondary: '#1A2E1A',    // Forest Green - Primary text color
    background: '#FFFFFF',   // Pure White - Main background
    
    // Secondary Colors
    warmGray: '#F5F5F5',     // Warm Gray - Light backgrounds
    charcoal: '#2C2C2C',     // Charcoal - Primary text
    
    // Accent Colors
    steelBlue: '#4A6FA5',    // Steel Blue - Info states
    success: '#28A745',      // Success Green (official)
    warning: '#FFC107',      // Warning Orange
    error: '#DC3545',        // Error Red
    info: '#17A2B8',         // Info Blue
    
    // Agent Colors (brand-aligned)
    agents: {
      lexi: '#D4A574',       // Felix Gold - Liaison/Guide
      alex: '#28A745',       // Success Green - Assessor/Analysis  
      rex: '#FFC107',        // Warning Orange - Retriever/Search
      felix: '#1A2E1A',      // Forest Green - Diagnostic Agent
    },
    
    // Typography Colors
    text: {
      primary: '#1A2E1A',    // Forest Green for primary text
      secondary: '#2C2C2C',  // Charcoal for secondary text
      accent: '#D4A574',     // Felix Gold for highlights
      inverse: '#FFFFFF',    // White for dark backgrounds
      muted: '#6C757D',      // Muted gray for less important text
    },
    
    // UI State Colors
    state: {
      success: '#28A745',
      warning: '#FFC107', 
      error: '#DC3545',
      info: '#17A2B8',
      disabled: '#F5F5F5',
    },
    
    // Background Variations - renamed to avoid conflict
    surfaces: {
      primary: '#FFFFFF',    // Pure white
      secondary: '#F5F5F5',  // Warm gray
      tertiary: '#F8F9FA',   // Lighter neutral
      dark: '#1A2E1A',       // Forest green for dark sections
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
    
    --color-success: ${BRAND.colors.success};
    --color-warning: ${BRAND.colors.warning};
    --color-error: ${BRAND.colors.error};
    --color-info: ${BRAND.colors.steelBlue};
    
    --color-bg-primary: ${BRAND.colors.surfaces.primary};
    --color-bg-secondary: ${BRAND.colors.surfaces.secondary};
    --color-bg-tertiary: ${BRAND.colors.surfaces.tertiary};
    
    --color-text-primary: ${BRAND.colors.text.primary};
    --color-text-secondary: ${BRAND.colors.text.secondary};
    --color-text-accent: ${BRAND.colors.text.accent};
    
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
