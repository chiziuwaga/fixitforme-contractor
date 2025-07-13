/**
 * Enhanced UI Components with Subtle Improvements
 * These components add professional polish without being excessive
 */

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import * as React from 'react'

// Enhanced Card with subtle shadow variations
export const EnhancedCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'elevated' | 'interactive' | 'agent'
    agent?: 'lexi' | 'alex' | 'rex'
  }
>(({ className, variant = 'default', agent, ...props }, ref) => {
  const agentColors = {
    lexi: 'shadow-primary/5 border-primary/10 hover:shadow-primary/15',
    alex: 'shadow-green-500/5 border-green-500/10 hover:shadow-green-500/15', 
    rex: 'shadow-secondary/5 border-secondary/10 hover:shadow-secondary/15'
  }

  // Filter out event handlers that conflict with framer-motion
  const { 
    onDrag, 
    onDragStart, 
    onDragEnd, 
    onAnimationStart,
    onAnimationEnd,
    onAnimationIteration,
    ...motionProps 
  } = props;

  return (
    <motion.div
      ref={ref}
      whileHover={variant === 'interactive' ? { y: -2, scale: 1.01 } : undefined}
      className={cn(
        "rounded-lg border bg-card text-card-foreground transition-all duration-200",
        // Shadow variants
        variant === 'default' && "shadow-sm",
        variant === 'elevated' && "shadow-md hover:shadow-lg",
        variant === 'interactive' && "shadow-sm hover:shadow-md cursor-pointer",
        variant === 'agent' && agent && agentColors[agent],
        // Base styles
        "hover:border-border/60",
        className
      )}
      {...motionProps}
    />
  )
})

// Enhanced Button with micro-interactions
export const EnhancedButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'subtle' | 'agent'
    agent?: 'lexi' | 'alex' | 'rex'
  }
>(({ className, variant = 'default', agent, children, ...props }, ref) => {
  const agentStyles = {
    lexi: 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20',
    alex: 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20',
    rex: 'bg-secondary/10 text-secondary hover:bg-secondary/20 border-secondary/20'
  }

  // Filter out event handlers that conflict with framer-motion
  const { 
    onDrag, 
    onDragStart, 
    onDragEnd, 
    onAnimationStart,
    onAnimationEnd,
    onAnimationIteration,
    ...motionProps 
  } = props;

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        // Variants
        variant === 'default' && "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2",
        variant === 'subtle' && "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground px-3 py-1.5",
        variant === 'agent' && agent && `${agentStyles[agent]} px-3 py-1.5 border`,
        // Enhanced shadows
        "shadow-sm hover:shadow-md",
        className
      )}
      {...motionProps}
    >
      {children}
    </motion.button>
  )
})

// Enhanced Input with focus states
export const EnhancedInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    variant?: 'default' | 'agent'
    agent?: 'lexi' | 'alex' | 'rex'
  }
>(({ className, variant = 'default', agent, ...props }, ref) => {
  const agentFocus = {
    lexi: 'focus:border-primary/50 focus:ring-primary/20',
    alex: 'focus:border-green-500/50 focus:ring-green-500/20',
    rex: 'focus:border-secondary/50 focus:ring-secondary/20'
  }

  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        "ring-offset-background transition-all duration-200",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Enhanced focus states
        variant === 'default' && "focus:border-primary/50 focus:ring-primary/20",
        variant === 'agent' && agent && agentFocus[agent],
        // Subtle shadow
        "shadow-sm focus:shadow-md",
        className
      )}
      {...props}
    />
  )
})

// Enhanced Badge with better contrast
export const EnhancedBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'agent'
    agent?: 'lexi' | 'alex' | 'rex'
  }
>(({ className, variant = 'default', agent, ...props }, ref) => {
  const agentStyles = {
    lexi: 'bg-primary/15 text-primary border-primary/30',
    alex: 'bg-green-500/15 text-green-700 border-green-500/30',
    rex: 'bg-secondary/15 text-secondary border-secondary/30'
  }

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        // Variants with enhanced contrast
        variant === 'default' && "border-primary/30 bg-primary/10 text-primary",
        variant === 'secondary' && "border-muted-foreground/30 bg-muted/50 text-muted-foreground",
        variant === 'success' && "border-green-500/30 bg-green-500/10 text-green-700",
        variant === 'warning' && "border-yellow-500/30 bg-yellow-500/10 text-yellow-700",
        variant === 'agent' && agent && agentStyles[agent],
        // Subtle shadow
        "shadow-sm",
        className
      )}
      {...props}
    />
  )
})

// Enhanced Alert with better visual hierarchy
export const EnhancedAlert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'success' | 'warning' | 'destructive'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full rounded-lg border p-4 transition-all duration-200",
        // Enhanced variants with subtle gradients
        variant === 'default' && "bg-background border-border text-foreground",
        variant === 'success' && "bg-green-50 border-green-200 text-green-800",
        variant === 'warning' && "bg-yellow-50 border-yellow-200 text-yellow-800", 
        variant === 'destructive' && "bg-red-50 border-red-200 text-red-800",
        // Enhanced shadow
        "shadow-sm",
        className
      )}
      {...props}
    />
  )
})

EnhancedCard.displayName = "EnhancedCard"
EnhancedButton.displayName = "EnhancedButton"  
EnhancedInput.displayName = "EnhancedInput"
EnhancedBadge.displayName = "EnhancedBadge"
EnhancedAlert.displayName = "EnhancedAlert"

export {
  EnhancedCard as Card,
  EnhancedButton as Button,
  EnhancedInput as Input, 
  EnhancedBadge as Badge,
  EnhancedAlert as Alert
}
