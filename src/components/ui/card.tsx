import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "shadow-sm border-border",
        elevated: "shadow-lg shadow-primary/10 border-border",
        outlined: "shadow-none border-2 border-primary/20 bg-transparent",
        interactive: [
          "shadow-sm",
          "border-border",
          "cursor-pointer",
          "hover:shadow-lg hover:shadow-primary/10 hover:border-primary/40 hover:-translate-y-1",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background",
          "active:scale-[0.99] active:shadow-sm",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * If true, the card will be rendered in a disabled state,
   * primarily affecting the 'interactive' variant.
   */
  disabled?: boolean
}

/**
 * A versatile card component for displaying content in a structured way.
 * Built with professional business applications in mind, following the FixItForMe design system.
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, disabled = false, ...props }, ref) => {
    const isInteractive = variant === "interactive"
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, className }))}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive && !disabled ? 0 : -1}
        aria-disabled={isInteractive ? disabled : undefined}
        data-disabled={isInteractive && disabled ? "" : undefined}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

/**
 * The header section of a Card. Typically contains a CardTitle and CardDescription.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** If true, applies a more compact padding. */
    compact?: boolean
  }
>(({ className, compact = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5",
      compact ? "p-4" : "p-6",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  /** The heading level to use, from 1 (h1) to 6 (h6). */
  level?: 1 | 2 | 3 | 4 | 5 | 6
  /** The color variant of the title, based on the semantic theme colors. */
  variant?: "default" | "primary" | "secondary" | "accent"
}

/**
 * The title for a Card. Renders as a semantic heading element.
 */
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, level = 3, variant = "default", ...props }, ref) => {
    const Component = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

    return (
      <Component
        ref={ref}
        className={cn(
          "font-semibold leading-none tracking-tight",
          {
            "text-3xl": level === 1,
            "text-2xl": level === 2,
            "text-xl": level === 3,
            "text-lg": level >= 4,
          },
          {
            "text-foreground": variant === "default",
            "text-primary": variant === "primary",
            "text-secondary": variant === "secondary",
            "text-accent": variant === "accent",
          },
          className
        )}
        {...props}
      />
    )
  }
)
CardTitle.displayName = "CardTitle"

/**
 * The description text for a Card. Renders as a paragraph element.
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * The main content area of a Card.
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** If true, applies a more compact padding. */
    compact?: boolean
    /** If true, removes all padding. */
    noPadding?: boolean
  }
>(({ className, compact = false, noPadding = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      !noPadding && (compact ? "p-4 pt-0" : "p-6 pt-0"),
      className
    )}
    {...props}
  />
))
CardContent.displayName = "CardContent"

/**
 * The footer section of a Card. Often used for actions or summary information.
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Justification of the footer content. */
    justify?: "start" | "center" | "end" | "between"
    /** If true, applies a more compact padding. */
    compact?: boolean
  }
>(({ className, justify = "end", compact = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center border-t",
      compact ? "p-4" : "p-6",
      {
        "justify-start": justify === "start",
        "justify-center": justify === "center",
        "justify-end": justify === "end",
        "justify-between": justify === "between",
      },
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

/**
 * A container for action buttons within a CardFooter or CardContent.
 */
const CardActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Justification of the action items. */
    justify?: "start" | "center" | "end"
  }
>(({ className, justify = "end", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-1 items-center gap-2",
      {
        "justify-start": justify === "start",
        "justify-center": justify === "center",
        "justify-end": justify === "end",
      },
      className
    )}
    role="group"
    aria-label="Card actions"
    {...props}
  />
))
CardActions.displayName = "CardActions"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardActions,
}