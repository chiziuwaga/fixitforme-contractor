"use client"

import type { Variants } from "framer-motion"

/**
 * Professional animation tokens for a consistent motion design language.
 * Inspired by the FixItForMe ENHANCED_UI_TRANSFORMATION_PLAN.md.
 */
export const MOTION_TOKENS = {
  // Easing Functions
  ease: {
    primary: [0.25, 0.46, 0.45, 0.94] as const, // Smooth professional
    bouncy: [0.68, -0.55, 0.265, 1.55] as const, // Playful interactions
    sharp: [0.4, 0.0, 0.2, 1] as const, // Quick, decisive
    inOut: [0.4, 0, 0.2, 1],
    out: [0, 0, 0.2, 1],
  },

  // Duration Scale (in seconds for Framer Motion)
  duration: {
    instant: 0.15,
    fast: 0.2,
    medium: 0.4,
    normal: 0.35,
    slow: 0.6,
    glacial: 1.0,
  },

  // Signature Effects
  hover: {
    scale: 1.02,
    y: -3,
    boxShadow: "0 8px 25px hsl(var(--primary) / 0.15)",
    transition: { type: "spring", stiffness: 400, damping: 17 },
  },

  tap: {
    scale: 0.98,
    y: 0,
    boxShadow: "0 1px 2px hsl(var(--primary) / 0.05)",
    transition: { type: "spring", stiffness: 400, damping: 17 },
  },

  glass: {
    backdropFilter: "blur(10px)",
    backgroundColor: "hsl(var(--primary) / 0.05)",
    border: "1px solid hsl(var(--primary) / 0.2)",
  },
}

/**
 * Pre-configured variants for common animations.
 */
export const FADE_IN_UP: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_TOKENS.duration.normal,
      ease: MOTION_TOKENS.ease.primary,
    },
  },
}

export const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: MOTION_TOKENS.duration.slow,
    },
  },
}

export const SCALE_IN: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: MOTION_TOKENS.duration.normal,
      ease: MOTION_TOKENS.ease.bouncy,
    },
  },
}

export const SLIDE_IN_LEFT: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: MOTION_TOKENS.duration.normal,
      ease: MOTION_TOKENS.ease.primary,
    },
  },
}

export const SLIDE_IN_RIGHT: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: MOTION_TOKENS.duration.normal,
      ease: MOTION_TOKENS.ease.primary,
    },
  },
}
