import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:shadow-lg transform hover:-translate-y-px hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:shadow-lg transform hover:-translate-y-px hover:bg-destructive/90",
        outline:
          "border-2 border-secondary bg-background text-secondary hover:bg-secondary hover:text-secondary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-md hover:shadow-lg transform hover:-translate-y-px hover:bg-secondary/90",
        accent:
          "bg-accent text-accent-foreground shadow-md hover:shadow-lg transform hover:-translate-y-px hover:bg-accent/90",
        ghost: "hover:bg-muted hover:text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 rounded-md px-4 text-sm",
        lg: "h-12 rounded-md px-8 text-base font-semibold",
        icon: "h-10 w-10",
        xl: "h-14 rounded-lg px-10 text-lg font-semibold",
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