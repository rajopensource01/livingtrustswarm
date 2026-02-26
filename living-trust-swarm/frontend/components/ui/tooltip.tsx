import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

/* ── Content ── */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-[var(--r-md)]",
      "px-3 py-2",
      "text-[12px] leading-snug tracking-[-0.005em]",
      "font-medium",
      "animate-in fade-in-0 zoom-in-97",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-97",
      "data-[side=bottom]:slide-in-from-top-1",
      "data-[side=top]:slide-in-from-bottom-1",
      "data-[side=left]:slide-in-from-right-1",
      "data-[side=right]:slide-in-from-left-1",
      className
    )}
    style={{
      background: "var(--text-primary)",
      color: "var(--text-inverse)",
      boxShadow: "var(--shadow-lg)",
      maxWidth: "240px",
    }}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

/* ── Arrow ── */
const TooltipArrow = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    className={cn("fill-[var(--text-primary)]", className)}
    width={8}
    height={4}
    {...props}
  />
))
TooltipArrow.displayName = TooltipPrimitive.Arrow.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipArrow, TooltipProvider }