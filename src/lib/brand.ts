/**
 * FixItForMe Brand System - Official Design Specification
 *
 * This file is the single source of truth for the UI design system, reflecting the clean,
 * professional, and high-contrast aesthetic from the provided design images. It uses a
 * solid color palette and defines typography and spacing for brand consistency.
 *
 * Principles from UI_UX_BEST_PRACTICES.md are implemented here.
 */

export const BRAND = {
  name: "FixItForMe",
  tagline: "The Gold Standard in Contractor Solutions",

  colors: {
    // Core Palette from Design Images
    primary: "#D4A574", // Felix Gold: For primary actions, highlights, and accents.
    secondary: "#1A2E1A", // Forest Green: For primary text, dark backgrounds, and key elements.

    // Backgrounds
    background: {
      light: "#FBFBFA", // A very light, warm off-white for main backgrounds.
      dark: "#1A2E1A", // Solid Forest Green for dark mode/sections.
    },

    // Text
    text: {
      light: {
        primary: "#1A2E1A", // Forest Green on light backgrounds. High contrast.
        secondary: "#5A635A", // Muted green for descriptions and secondary text.
        accent: "#B8845A", // Darker gold for emphasis.
      },
      dark: {
        primary: "#FBFBFA", // Off-white on dark backgrounds.
        secondary: "#AEC2AE", // Muted light green for secondary text on dark backgrounds.
      },
    },

    // UI Elements
    ui: {
      border: "#EAEAEA", // Subtle border for cards and inputs on light backgrounds.
      card: "#FFFFFF", // Pure white for cards to create a clean, layered look.
      muted: "#F5F5F5", // For muted buttons and subtle backgrounds.
    },

    // Semantic Colors
    semantic: {
      success: "#28A745",
      destructive: "#DC3545",
      warning: "#FFC107",
    },
  },

  typography: {
    fontFamily: {
      sans: "'Inter', system-ui, sans-serif",
      serif: "'Roboto Slab', Georgia, serif",
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
  },

  borderRadius: {
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    full: "9999px",
  },

  shadows: {
    sm: "0 2px 4px 0 rgba(0, 0, 0, 0.03)",
    md: "0 4px 8px 0 rgba(0, 0, 0, 0.04)",
    lg: "0 10px 20px 0 rgba(0, 0, 0, 0.05)",
  },
}
