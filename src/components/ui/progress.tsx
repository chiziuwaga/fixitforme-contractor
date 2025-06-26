import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-neutral-200",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-gradient-to-r from-[rgb(var(--primary-orange))] to-[rgb(var(--primary-blue))] transition-all duration-300 ease-in-out"
        style={{ transform: `translateX(-${100 - (value / max) * 100}%)` }}
      />
    </div>
  )
)
Progress.displayName = "Progress"

export { Progress }
