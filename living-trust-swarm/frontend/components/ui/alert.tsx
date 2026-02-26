import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  [
    "relative w-full rounded-[var(--r-md)] border p-4",
    "text-[12.5px] leading-relaxed",
    "[&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
    "[&>svg~*]:pl-6",
    "[&>svg]:text-current [&>svg]:opacity-80",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--bg-canvas)] border-[var(--border-subtle)]",
          "text-[var(--text-secondary)]",
          "[&>svg]:text-[var(--text-tertiary)]",
        ].join(" "),

        info: [
          "bg-[var(--accent-bg)] border-[var(--accent-border)]",
          "text-[var(--accent-text)]",
        ].join(" "),

        destructive: [
          "bg-[var(--risk-collapsing-bg)] border-[var(--risk-collapsing-border)]",
          "text-[var(--risk-collapsing-text)]",
        ].join(" "),

        warning: [
          "bg-[var(--risk-stressed-bg)] border-[var(--risk-stressed-border)]",
          "text-[var(--risk-stressed-text)]",
        ].join(" "),

        turbulent: [
          "bg-[var(--risk-turbulent-bg)] border-[var(--risk-turbulent-border)]",
          "text-[var(--risk-turbulent-text)]",
        ].join(" "),

        success: [
          "bg-[var(--risk-stable-bg)] border-[var(--risk-stable-border)]",
          "text-[var(--risk-stable-text)]",
        ].join(" "),
      },
    },
    defaultVariants: { variant: "default" },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      "mb-1 font-semibold leading-none text-[13px] tracking-[-0.010em]",
      className
    )}
    {...props}
  >
    {children}
  </h5>
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-[12px] leading-relaxed opacity-90", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }