"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-6 w-full overflow-hidden border-2 border-foreground bg-background shadow-pixel",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-success transition-all duration-300 relative overflow-hidden"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    >
      {/* Animated shine effect */}
      <div className="absolute inset-0 opacity-30 bg-gradient-to-b from-white via-transparent to-transparent" />
    </ProgressPrimitive.Indicator>
    
    {/* Pixel grid overlay */}
    <div className="absolute inset-0 flex pointer-events-none">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 border-r border-foreground/20 last:border-r-0"
        />
      ))}
    </div>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
