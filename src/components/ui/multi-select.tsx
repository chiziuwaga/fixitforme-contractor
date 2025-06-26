"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  options: { label: string; value: string }[]
  value?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ options, value = [], onValueChange, placeholder = "Select items...", className, disabled }, ref) => {
    const [open, setOpen] = React.useState(false)

    const handleUnselect = (item: string) => {
      onValueChange?.(value.filter((i) => i !== item))
    }

    const handleSelect = (item: string) => {
      if (value.includes(item)) {
        handleUnselect(item)
      } else {
        onValueChange?.([...value, item])
      }
    }

    return (
      <div ref={ref} className={cn("w-full", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between min-h-[2.5rem] h-auto p-2",
                disabled && "cursor-not-allowed opacity-50"
              )}
              disabled={disabled}
            >
              <div className="flex flex-wrap gap-1 max-w-full">
                {value.length > 0 ? (
                  value.map((item) => {
                    const option = options.find((opt) => opt.value === item)
                    return (
                      <Badge
                        key={item}
                        variant="secondary"
                        className="mr-1 mb-1 bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                      >
                        {option?.label}
                        <button
                          className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleUnselect(item)
                            }
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                          onClick={() => handleUnselect(item)}
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      </Badge>
                    )
                  })
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandEmpty>No item found.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          value.includes(option.value)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      </div>
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)

MultiSelect.displayName = "MultiSelect"

export { MultiSelect }
