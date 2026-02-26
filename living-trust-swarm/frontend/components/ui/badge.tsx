import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "rounded-[var(--r-pill)] px-2 py-0.5",
    "text-[11px] font-semibold leading-none",
    "border tracking-[0.01em]",
    "transition-colors duration-[var(--t-fast)]",
    "whitespace-nowrap",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--bg-canvas)] border-[var(--border-medium)]",
          "text-[var(--text-secondary)]",
        ].join(" "),

        secondary: [
          "bg-[var(--bg-base)] border-[var(--border-faint)]",
          "text-[var(--text-tertiary)]",
        ].join(" "),

        outline: [
          "bg-transparent border-[var(--border-medium)]",
          "text-[var(--text-secondary)]",
        ].join(" "),

        destructive: [
          "bg-[var(--risk-collapsing-bg)] border-[var(--risk-collapsing-border)]",
          "text-[var(--risk-collapsing-text)]",
        ].join(" "),

        /* ── Risk variants ── */
        stable: [
          "bg-[var(--risk-stable-bg)] border-[var(--risk-stable-border)]",
          "text-[var(--risk-stable-text)]",
        ].join(" "),

        stressed: [
          "bg-[var(--risk-stressed-bg)] border-[var(--risk-stressed-border)]",
          "text-[var(--risk-stressed-text)]",
        ].join(" "),

        turbulent: [
          "bg-[var(--risk-turbulent-bg)] border-[var(--risk-turbulent-border)]",
          "text-[var(--risk-turbulent-text)]",
        ].join(" "),

        collapsing: [
          "bg-[var(--risk-collapsing-bg)] border-[var(--risk-collapsing-border)]",
          "text-[var(--risk-collapsing-text)]",
        ].join(" "),

        /* ── Accent ── */
        accent: [
          "bg-[var(--accent-bg)] border-[var(--accent-border)]",
          "text-[var(--accent-text)]",
        ].join(" "),
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }