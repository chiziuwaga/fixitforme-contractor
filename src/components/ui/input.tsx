import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: "border-input focus:border-ring focus:ring-ring/20",
      error: "border-destructive focus:border-destructive focus:ring-destructive/20",
      success: "border-success focus:border-success focus:ring-success/20"
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground transition-all duration-200 border",
          "focus:outline-none focus:ring-2",
          "hover:border-input/80",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          variantClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
