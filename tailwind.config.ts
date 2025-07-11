import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Semantic tokens with fallback for border
        border: "hsl(var(--border, 220 13% 91%))", // fallback to light gray
        input: "hsl(var(--input, 220 13% 91%))",
        ring: "hsl(var(--ring, 35 65% 55%))",
        background: "hsl(var(--background, 0 0% 100%))",
        foreground: "hsl(var(--foreground, 224 71.4% 4.1%))",
        primary: {
          DEFAULT: "hsl(var(--primary, 35 65% 55%))",
          foreground: "hsl(var(--primary-foreground, 20 14.3% 4.1%))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary, 120 28% 15%))",
          foreground: "hsl(var(--secondary-foreground, 35 65% 95%))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive, 0 84.2% 60.2%))",
          foreground: "hsl(var(--destructive-foreground, 0 0% 98%))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted, 220 14.3% 95.9%))",
          foreground: "hsl(var(--muted-foreground, 220 8.9% 46.1%))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent, 220 14.3% 95.9%))",
          foreground: "hsl(var(--accent-foreground, 224 71.4% 4.1%))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover, 0 0% 100%))",
          foreground: "hsl(var(--popover-foreground, 224 71.4% 4.1%))",
        },
        card: {
          DEFAULT: "hsl(var(--card, 0 0% 100%))",
          foreground: "hsl(var(--card-foreground, 224 71.4% 4.1%))",
        },
        // Custom App-Specific Colors
        "background-light": "hsl(var(--background-light, 40 50% 98%))",
        "text-light-primary": "hsl(var(--text-light-primary, 120 28% 10%))",
        "text-light-secondary": "hsl(var(--text-light-secondary, 120 10% 35%))",
        "ui-border": "hsl(var(--ui-border, 120 10% 90%))",
        "ui-card": "hsl(var(--ui-card, 0 0% 100%))",
        "ui-muted": "hsl(var(--ui-muted, 120 10% 95%))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        serif: ["var(--font-roboto-slab)"],
        mono: ["var(--font-jetbrains-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
