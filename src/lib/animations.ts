import { Variants } from 'framer-motion';

// General container variant for staggering children
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Fade-in and slide-up item variant
export const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

// Simple fade-in variant
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

// Variant for scaling and fading in
export const scaleIn: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// Hover variant for subtle scaling
export const hoverVariant: Variants = {
  hover: {
    scale: 1.03,
    transition: {
      type: 'spring',
      stiffness: 300,
    },
  },
  tap: {
    scale: 0.97,
  },
};
