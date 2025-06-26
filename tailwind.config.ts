import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
        // FixItForMe Official Brand Colors
        'felix-gold': '#D4A574',
        'forest-green': '#1A2E1A', 
        'warm-gray': '#F5F5F5',
        'charcoal': '#2C2C2C',
        'steel-blue': '#4A90A4',
        'success-green': '#28A745',
        'warning-orange': '#FFC107',
        'error-red': '#DC3545',
        'info-blue': '#17A2B8',
        
        // Shadcn theme colors mapped to brand
        border: "#E5E5E5",
        input: "#E5E5E5", 
        ring: "#D4A574", // Felix Gold
        background: "#FFFFFF",
        foreground: "#2C2C2C", // Charcoal
        primary: {
          DEFAULT: "#D4A574", // Felix Gold
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#1A2E1A", // Forest Green
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#DC3545", // Error Red
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F5F5F5", // Warm Gray
          foreground: "#2C2C2C",
        },
        accent: {
          DEFAULT: "#4A90A4", // Steel Blue
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#2C2C2C",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#2C2C2C",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "4px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Roboto Slab", "Georgia", "serif"],
        heading: ["Roboto Slab", "Georgia", "serif"],
        mono: ["JetBrains Mono", "Menlo", "Monaco", "monospace"],
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out", 
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
