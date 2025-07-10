// TYPOGRAPHY SYSTEM - Clean, readable, professional
export const TYPOGRAPHY = {
  display: {
    large: "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
    medium: "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight",
    small: "text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight",
  },
  heading: {
    h1: "text-2xl md:text-3xl font-semibold tracking-tight",
    h2: "text-xl md:text-2xl font-semibold tracking-tight",
    h3: "text-lg md:text-xl font-semibold tracking-tight",
    h4: "text-base md:text-lg font-semibold tracking-tight",
  },
  body: {
    large: "text-lg leading-relaxed",
    medium: "text-base leading-relaxed",
    small: "text-sm leading-relaxed",
  },
} as const

// SPACING SYSTEM - Consistent rhythm and hierarchy
export const SPACING = {
  component: {
    xs: "space-y-2",
    sm: "space-y-3",
    md: "space-y-4",
    lg: "space-y-6",
    xl: "space-y-8",
  },
  padding: {
    xs: "p-2",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  },
} as const
