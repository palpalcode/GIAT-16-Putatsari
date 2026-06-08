import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-amber-200/50 bg-white px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-white file:text-sm file:font-medium file:text-foreground placeholder:text-amber-400/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
