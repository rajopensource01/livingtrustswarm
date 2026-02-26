import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/lib/utils"

interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  /** Optional label text shown centered in the separator */
  label?: string
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(({ className, orientation = "horizontal", decorative = true, label, ...props }, ref) =>
  label ? (
    /* Labeled separator */
    <div
      className={cn(
        "flex items-center gap-3",
        orientation === "vertical" && "flex-col",
        className
      )}
    >
      <div
        className="flex-1"
        style={{
          height: orientation === "vertical" ? "100%" : "1px",
          width: orientation === "vertical" ? "1px" : "100%",
          background: "var(--border-faint)",
        }}
      />
      <span
        style={{
          fontSize: "10.5px",
          fontWeight: 600,
          letterSpacing: "0.055em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div
        className="flex-1"
        style={{
          height: orientation === "vertical" ? "100%" : "1px",
          width: orientation === "vertical" ? "1px" : "100%",
          background: "var(--border-faint)",
        }}
      />
    </div>
  ) : (
    /* Plain separator */
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-[var(--border-faint)]",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }