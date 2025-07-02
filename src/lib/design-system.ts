/**
 * 21st.dev-Inspired Design System for FixItForMe
 * 
 * Modern, clean, functional design patterns that prioritize:
 * - Clarity over complexity
 * - Function over form
 * - Professional polish with subtle sophistication
 * - Consistent interaction patterns
 * - Accessible and intuitive user experience
 */

// TYPOGRAPHY SYSTEM - Clean, readable, professional
export const TYPOGRAPHY = {
  // Display text - For hero sections and major headings
  display: {
    large: "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
    medium: "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight",
    small: "text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight",
  },
  
  // Headings - For section titles and component headers
  heading: {
    h1: "text-2xl md:text-3xl font-semibold tracking-tight",
    h2: "text-xl md:text-2xl font-semibold tracking-tight", 
    h3: "text-lg md:text-xl font-semibold tracking-tight",
    h4: "text-base md:text-lg font-semibold tracking-tight",
  },
  
  // Body text - For content and descriptions
  body: {
    large: "text-lg leading-relaxed",
    medium: "text-base leading-relaxed",
    small: "text-sm leading-relaxed",
  },
  
  // Labels and UI text
  label: {
    large: "text-sm font-medium tracking-wide",
    medium: "text-xs font-medium tracking-wide uppercase",
    small: "text-xs font-medium tracking-wider uppercase",
  },
  
  // Code and monospace
  code: {
    inline: "font-mono text-sm bg-muted px-1 py-0.5 rounded",
    block: "font-mono text-sm bg-muted p-3 rounded-lg",
  }
} as const;

// SPACING SYSTEM - Consistent rhythm and hierarchy  
export const SPACING = {
  // Component spacing
  component: {
    xs: "space-y-2",    // Tight grouping
    sm: "space-y-3",    // Related items
    md: "space-y-4",    // Standard sections
    lg: "space-y-6",    // Major sections
    xl: "space-y-8",    // Page sections
  },
  
  // Padding system
  padding: {
    xs: "p-2",
    sm: "p-3", 
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  },
  
  // Margin system
  margin: {
    xs: "m-2",
    sm: "m-3",
    md: "m-4", 
    lg: "m-6",
    xl: "m-8",
  }
} as const;

// INTERACTION PATTERNS - Subtle, purposeful, accessible
export const INTERACTIONS = {
  // Hover effects
  hover: {
    subtle: "transition-colors hover:bg-muted/50",
    lift: "transition-all hover:shadow-md hover:-translate-y-0.5",
    glow: "transition-all hover:shadow-lg hover:shadow-primary/20",
    scale: "transition-transform hover:scale-[1.02]",
  },
  
  // Focus states
  focus: {
    ring: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    border: "focus-visible:border-primary focus-visible:outline-none",
  },
  
  // Active states
  active: {
    scale: "active:scale-[0.98]",
    dim: "active:opacity-80",
  },
  
  // Disabled states
  disabled: {
    default: "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
  }
} as const;

// LAYOUT PATTERNS - Professional, clean, functional
export const LAYOUTS = {
  // Container sizes
  container: {
    sm: "max-w-sm mx-auto",
    md: "max-w-md mx-auto", 
    lg: "max-w-lg mx-auto",
    xl: "max-w-xl mx-auto",
    "2xl": "max-w-2xl mx-auto",
    "4xl": "max-w-4xl mx-auto",
    "6xl": "max-w-6xl mx-auto",
    full: "max-w-full mx-auto",
  },
  
  // Grid systems
  grid: {
    "1": "grid grid-cols-1 gap-6",
    "2": "grid grid-cols-1 lg:grid-cols-2 gap-6", 
    "3": "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    "4": "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
    auto: "grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6",
  },
  
  // Flex patterns
  flex: {
    center: "flex items-center justify-center",
    between: "flex items-center justify-between",
    start: "flex items-center justify-start",
    end: "flex items-center justify-end",
    col: "flex flex-col",
    colCenter: "flex flex-col items-center justify-center",
  }
} as const;

// SURFACE PATTERNS - Clean, layered, professional
export const SURFACES = {
  // Card variants
  card: {
    flat: "bg-background border border-border rounded-lg",
    elevated: "bg-card border border-border rounded-lg shadow-sm",
    interactive: "bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer",
    premium: "bg-background/60 backdrop-blur-xl border border-primary/20 rounded-xl shadow-xl shadow-primary/10",
  },
  
  // Panel variants  
  panel: {
    sidebar: "bg-card border-r border-border",
    modal: "bg-background rounded-xl border border-border shadow-2xl",
    popover: "bg-popover border border-border rounded-lg shadow-lg",
  },
  
  // Background patterns
  background: {
    page: "bg-background",
    section: "bg-muted/30",
    highlight: "bg-primary/5",
    overlay: "bg-background/80 backdrop-blur-sm",
  }
} as const;

// COMPONENT PATTERNS - Reusable, consistent, accessible
export const COMPONENTS = {
  // Button patterns
  button: {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    outline: "border border-border hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
  
  // Input patterns
  input: {
    default: "border border-border rounded-md px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20",
    search: "border border-border rounded-full px-4 py-2 pl-10 focus:border-primary focus:ring-2 focus:ring-primary/20",
  },
  
  // Badge patterns
  badge: {
    default: "bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium",
    success: "bg-success text-success-foreground px-2 py-1 rounded-md text-xs font-medium",
    warning: "bg-warning text-warning-foreground px-2 py-1 rounded-md text-xs font-medium", 
    error: "bg-destructive text-destructive-foreground px-2 py-1 rounded-md text-xs font-medium",
  }
} as const;

// ANIMATION PATTERNS - Subtle, purposeful, smooth
export const ANIMATIONS = {
  // Entrance animations
  entrance: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 }
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  },
  
  // Stagger patterns
  stagger: {
    container: {
      animate: { transition: { staggerChildren: 0.1 } }
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4 }
    }
  },
  
  // Micro-interactions
  micro: {
    tap: { scale: 0.98 },
    hover: { scale: 1.02 },
    float: {
      y: [-2, 2, -2],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
  }
} as const;

// RESPONSIVE PATTERNS - Mobile-first, professional layouts
export const RESPONSIVE = {
  // Breakpoint utilities
  breakpoints: {
    mobile: "block md:hidden",
    tablet: "hidden md:block lg:hidden", 
    desktop: "hidden lg:block",
    mobileTablet: "block lg:hidden",
    tabletDesktop: "hidden md:block",
  },
  
  // Responsive typography
  text: {
    responsive: "text-sm md:text-base lg:text-lg",
    heading: "text-xl md:text-2xl lg:text-3xl",
    display: "text-2xl md:text-4xl lg:text-5xl",
  },
  
  // Responsive spacing
  spacing: {
    responsive: "p-4 md:p-6 lg:p-8",
    section: "py-8 md:py-12 lg:py-16",
    container: "px-4 md:px-6 lg:px-8",
  }
} as const;

// Utility function to combine classes safely
export function designSystem(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
