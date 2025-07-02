import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:bg-primary/90 hover:scale-[1.02]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:bg-destructive/90 hover:scale-[1.02]",
        outline:
          "border-2 border-secondary bg-background text-secondary hover:bg-secondary hover:text-secondary-foreground hover:shadow-md transform hover:-translate-y-0.5 hover:scale-[1.01]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:bg-secondary/90 hover:scale-[1.02]",
        accent:
          "bg-accent text-accent-foreground shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:bg-accent/90 hover:scale-[1.02]",
        ghost: "hover:bg-muted hover:text-muted-foreground hover:shadow-sm transform hover:scale-[1.01]",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        gradient: "bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl hover:shadow-primary/25 transform hover:-translate-y-0.5 hover:scale-[1.02] hover:from-primary/90 hover:to-accent/90",
        // Professional auth variants
        primary: "bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl hover:shadow-primary/25 transform hover:-translate-y-0.5 hover:scale-[1.02] hover:from-primary/90 hover:to-accent/90 font-semibold",
        soft: "bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 hover:border-secondary/30 transform hover:scale-[1.01]",
      },
      size: {
        xs: "h-8 px-3 text-xs rounded-sm gap-1",
        sm: "h-9 px-4 text-sm rounded-md gap-1.5",
        default: "h-10 px-6 text-sm rounded-md gap-2",
        lg: "h-12 px-8 text-base font-semibold rounded-lg gap-2.5",
        xl: "h-14 px-10 text-lg font-semibold rounded-lg gap-3",
        xxl: "h-16 px-12 text-xl font-bold rounded-xl gap-3.5",
        // Professional form sizes
        form: "h-11 px-6 text-sm font-medium rounded-lg gap-2",
        "form-lg": "h-12 px-8 text-base font-semibold rounded-lg gap-2.5",
        "form-xl": "h-14 px-10 text-lg font-semibold rounded-xl gap-3",
        // Icon variants
        icon: "h-10 w-10 rounded-md",
        "icon-sm": "h-8 w-8 rounded-sm",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * If `true`, the button will be rendered as a child of the immediate child.
   * This is useful for passing props to a custom component.
   * @default false
   */
  asChild?: boolean
  /**
   * If `true`, the button will be in a loading state.
   * A spinner will be displayed, and the button will be disabled.
   * @default false
   */
  loading?: boolean
}

/**
 * A professional, customizable button component for business applications.
 * It supports multiple variants, sizes, and states including loading and disabled.
 * Built with semantic colors for the FixItForMe design system.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4 animate-spin"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        )}
        {props.children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }