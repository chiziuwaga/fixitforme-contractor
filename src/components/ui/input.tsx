import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default:
        "border-border hover:border-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10",
      error:
        "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10",
      success:
        "border-success focus:border-success focus:ring-4 focus:ring-success/10",
    }

    const iconVariants = {
      hidden: { opacity: 0, scale: 0.8, x: 10 },
      visible: { opacity: 1, scale: 1, x: 0 },
    }

    const IconComponent =
      variant === "success" ? CheckCircle2 :
      variant === "error" ? AlertCircle :
      null

    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "flex h-14 w-full rounded-lg border-2 bg-background/70 px-4 py-3 text-base text-foreground shadow-sm backdrop-blur-sm transition-all duration-300 ease-in-out",
            "placeholder:text-muted-foreground",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            variantClasses[variant],
            IconComponent ? "pr-12" : "",
            className
          )}
          ref={ref}
          aria-invalid={variant === "error"}
          {...props}
        />
        <AnimatePresence mode="wait">
          {IconComponent && (
            <motion.div
              key={variant}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={iconVariants}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
            >
              <IconComponent
                className={cn(
                  "h-6 w-6",
                  variant === "success" && "text-success",
                  variant === "error" && "text-destructive"
                )}
                aria-hidden="true"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }