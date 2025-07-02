// Responsive D3 Chart Configuration System
// Dynamically adapts chart dimensions based on screen size for AI generative rationale

export interface ResponsiveChartDimensions {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number; 
    bottom: number;
    left: number;
  };
}

export interface ResponsiveChartConfig {
  fontSize: string;
  tickCount: {
    x: number;
    y: number;
  };
  tickPadding: number;
  strokeWidth: number;
}

// Screen size breakpoints matching our design system
export const SCREEN_BREAKPOINTS = {
  xs: 480,    // Compact tablet
  sm: 640,    // Legacy desktop
  md: 768,    // Minimum desktop  
  lg: 1024,   // Standard laptop
  xl: 1280,   // Medium desktop
  '2xl': 1440, // Standard desktop
  '3xl': 1920, // Wide desktop
  '4xl': 2560  // Ultra-wide
} as const;

// Dynamic chart dimensions based on breakpoints
export const CHART_RESPONSIVE_DIMENSIONS = {
  // Cost Breakdown Chart (Donut)
  costBreakdown: {
    '4xl': { width: 400, height: 400, margin: { top: 20, right: 20, bottom: 20, left: 20 } },
    '3xl': { width: 360, height: 360, margin: { top: 20, right: 20, bottom: 20, left: 20 } },
    '2xl': { width: 320, height: 320, margin: { top: 15, right: 15, bottom: 15, left: 15 } },
    'xl':  { width: 300, height: 300, margin: { top: 15, right: 15, bottom: 15, left: 15 } },
    'lg':  { width: 280, height: 280, margin: { top: 10, right: 10, bottom: 10, left: 10 } },
    'md':  { width: 260, height: 260, margin: { top: 10, right: 10, bottom: 10, left: 10 } },
    'sm':  { width: 240, height: 240, margin: { top: 8, right: 8, bottom: 8, left: 8 } },
    'xs':  { width: 220, height: 220, margin: { top: 8, right: 8, bottom: 8, left: 8 } }
  },

  // Lead Distribution Chart (Bar Chart)
  leadDistribution: {
    '4xl': { width: 600, height: 350, margin: { top: 30, right: 40, bottom: 60, left: 80 } },
    '3xl': { width: 550, height: 320, margin: { top: 25, right: 35, bottom: 55, left: 70 } },
    '2xl': { width: 500, height: 300, margin: { top: 20, right: 30, bottom: 50, left: 60 } },
    'xl':  { width: 450, height: 280, margin: { top: 20, right: 30, bottom: 50, left: 60 } },
    'lg':  { width: 400, height: 250, margin: { top: 15, right: 25, bottom: 45, left: 50 } },
    'md':  { width: 350, height: 220, margin: { top: 15, right: 25, bottom: 40, left: 45 } },
    'sm':  { width: 300, height: 200, margin: { top: 10, right: 20, bottom: 35, left: 40 } },
    'xs':  { width: 260, height: 180, margin: { top: 10, right: 15, bottom: 30, left: 35 } }
  },

  // Timeline Chart (Gantt-style)
  timeline: {
    '4xl': { width: 800, height: 400, margin: { top: 40, right: 50, bottom: 80, left: 100 } },
    '3xl': { width: 700, height: 350, margin: { top: 35, right: 45, bottom: 70, left: 90 } },
    '2xl': { width: 600, height: 320, margin: { top: 30, right: 40, bottom: 60, left: 80 } },
    'xl':  { width: 550, height: 300, margin: { top: 25, right: 35, bottom: 55, left: 70 } },
    'lg':  { width: 500, height: 280, margin: { top: 20, right: 30, bottom: 50, left: 60 } },
    'md':  { width: 450, height: 250, margin: { top: 20, right: 30, bottom: 45, left: 55 } },
    'sm':  { width: 400, height: 220, margin: { top: 15, right: 25, bottom: 40, left: 50 } },
    'xs':  { width: 350, height: 200, margin: { top: 15, right: 20, bottom: 35, left: 45 } }
  }
} as const;

// Dynamic chart configuration based on breakpoints
export const CHART_RESPONSIVE_CONFIG = {
  '4xl': { fontSize: '14px', tickCount: { x: 12, y: 10 }, tickPadding: 15, strokeWidth: 2.5 },
  '3xl': { fontSize: '13px', tickCount: { x: 10, y: 8 }, tickPadding: 12, strokeWidth: 2 },
  '2xl': { fontSize: '12px', tickCount: { x: 8, y: 6 }, tickPadding: 10, strokeWidth: 2 },
  'xl':  { fontSize: '11px', tickCount: { x: 8, y: 6 }, tickPadding: 10, strokeWidth: 2 },
  'lg':  { fontSize: '10px', tickCount: { x: 6, y: 5 }, tickPadding: 8, strokeWidth: 1.5 },
  'md':  { fontSize: '10px', tickCount: { x: 6, y: 5 }, tickPadding: 8, strokeWidth: 1.5 },
  'sm':  { fontSize: '9px', tickCount: { x: 5, y: 4 }, tickPadding: 6, strokeWidth: 1.5 },
  'xs':  { fontSize: '8px', tickCount: { x: 4, y: 4 }, tickPadding: 6, strokeWidth: 1 }
} as const;

// Get responsive dimensions for a specific chart type
export function getChartDimensions(
  chartType: keyof typeof CHART_RESPONSIVE_DIMENSIONS, 
  breakpoint: keyof typeof SCREEN_BREAKPOINTS
): ResponsiveChartDimensions {
  return CHART_RESPONSIVE_DIMENSIONS[chartType][breakpoint];
}

// Get responsive config for a specific breakpoint
export function getChartConfig(breakpoint: keyof typeof SCREEN_BREAKPOINTS): ResponsiveChartConfig {
  return CHART_RESPONSIVE_CONFIG[breakpoint];
}
