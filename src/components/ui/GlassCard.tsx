'use client';

import { motion } from 'framer-motion';
import { BRAND } from '@/lib/brand';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <motion.div
      className={className}
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px) saturate(180%)',
        WebkitBackdropFilter: 'blur(10px) saturate(180%)',
        border: `1px solid rgba(209, 213, 219, 0.3)`,
        borderRadius: BRAND.borderRadius.xl,
        boxShadow: BRAND.shadows.lg,
      }}
    >
      {children}
    </motion.div>
  );
}
