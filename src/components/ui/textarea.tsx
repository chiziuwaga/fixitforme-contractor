import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-500 transition-all duration-200",
          "focus:border-[rgb(var(--primary-orange))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-orange))]/20",
          "hover:border-neutral-300",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50",
          "resize-none",
          "brand-transition",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
