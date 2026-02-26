import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    /** Optional accent color for the filled range */
    accentColor?: string
  }
>(({ className, accentColor, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center group",
      "py-1", // extra vertical hit area
      className
    )}
    {...props}
  >
    {/* Track */}
    <SliderPrimitive.Track
      className="relative h-[3px] w-full grow overflow-hidden rounded-full"
      style={{ background: "var(--border-subtle)" }}
    >
      {/* Range (filled portion) */}
      <SliderPrimitive.Range
        className="absolute h-full rounded-full transition-none"
        style={{ background: accentColor ?? "var(--text-primary)" }}
      />
    </SliderPrimitive.Track>

    {/* Thumb */}
    <SliderPrimitive.Thumb
      className={cn(
        "block h-[13px] w-[13px] rounded-full",
        "border-[1.5px] border-[var(--border-strong)]",
        "bg-[var(--bg-surface)]",
        "shadow-[var(--shadow-sm)]",
        "cursor-pointer",
        "transition-all duration-[var(--t-fast)]",
        "hover:border-[var(--accent)] hover:scale-110",
        "hover:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]",
        "focus-visible:outline-none",
        "focus-visible:border-[var(--accent)]",
        "focus-visible:shadow-[0_0_0_3px_rgba(37,99,235,0.15)]",
        "disabled:pointer-events-none disabled:opacity-50",
      )}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }