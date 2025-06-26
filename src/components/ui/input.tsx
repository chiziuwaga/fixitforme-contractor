import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: "border-neutral-200 focus:border-[rgb(var(--primary-orange))] focus:ring-[rgb(var(--primary-orange))]/20",
      error: "border-error-300 focus:border-error-500 focus:ring-error-500/20",
      success: "border-success-300 focus:border-success-500 focus:ring-success-500/20"
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-500 transition-all duration-200 border",
          "focus:outline-none focus:ring-2",
          "hover:border-neutral-300",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-900",
          "brand-transition",
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
