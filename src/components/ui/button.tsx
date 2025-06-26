import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-felix-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-felix-gold text-white hover:bg-felix-gold/90 shadow-md hover:shadow-lg transform hover:-translate-y-0.5",
        destructive: "bg-error-red text-white hover:bg-error-red/90 shadow-md hover:shadow-lg",
        outline: "border-2 border-forest-green bg-transparent text-forest-green hover:bg-forest-green hover:text-white",
        secondary: "bg-forest-green text-white hover:bg-forest-green/90 shadow-md hover:shadow-lg",
        ghost: "hover:bg-warm-gray hover:text-charcoal",
        link: "text-felix-gold underline-offset-4 hover:underline hover:text-felix-gold/80",
        steel: "bg-steel-blue text-white hover:bg-steel-blue/90 shadow-md hover:shadow-lg",
        success: "bg-success-green text-white hover:bg-success-green/90 shadow-md hover:shadow-lg",
        warning: "bg-warning-orange text-charcoal hover:bg-warning-orange/90 shadow-md hover:shadow-lg",
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
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
