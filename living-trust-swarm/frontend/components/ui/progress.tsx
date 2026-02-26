import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Fill color — defaults to var(--text-primary) */
  color?: string
  /** Track height — defaults to 3px */
  height?: string | number
  /** Show the animated shimmer on indeterminate */
  indeterminate?: boolean
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, color, height = 3, indeterminate, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative w-full overflow-hidden rounded-full",
      className
    )}
    style={{
      height: typeof height === "number" ? `${height}px` : height,
      background: "var(--bg-canvas)",
    }}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full flex-1 rounded-full",
        indeterminate
          ? "animate-[progress-indeterminate_1.4s_ease-in-out_infinite]"
          : "transition-[transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      )}
      style={{
        transform: indeterminate
          ? undefined
          : `translateX(-${100 - (value ?? 0)}%)`,
        background: color ?? "var(--text-primary)",
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }