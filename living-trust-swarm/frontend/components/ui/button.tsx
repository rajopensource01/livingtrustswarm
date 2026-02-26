import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5",
    "rounded-[var(--r-md)] font-medium font-sans",
    "text-[13px] leading-none tracking-[-0.010em]",
    "transition-all duration-[var(--t-base)] cursor-pointer",
    "border border-transparent whitespace-nowrap select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--text-primary)] text-[var(--text-inverse)] border-[var(--text-primary)]",
          "shadow-[var(--shadow-xs)]",
          "hover:bg-[#262623] hover:shadow-[var(--shadow-sm)]",
          "active:bg-[#1a1a18] active:translate-y-[0.5px]",
        ].join(" "),

        secondary: [
          "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-medium)]",
          "shadow-[var(--shadow-xs)]",
          "hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]",
          "active:bg-[var(--bg-active)] active:translate-y-[0.5px]",
        ].join(" "),

        outline: [
          "bg-transparent text-[var(--text-secondary)] border-[var(--border-medium)]",
          "hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]",
        ].join(" "),

        ghost: [
          "bg-transparent text-[var(--text-tertiary)] border-transparent",
          "hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]",
          "active:bg-[var(--bg-active)]",
        ].join(" "),

        destructive: [
          "bg-[var(--risk-collapsing-bg)] text-[var(--risk-collapsing-text)] border-[var(--risk-collapsing-border)]",
          "hover:bg-[var(--risk-collapsing-subtle)]",
          "active:translate-y-[0.5px]",
        ].join(" "),

        link: [
          "bg-transparent text-[var(--text-link)] border-transparent p-0 h-auto",
          "underline-offset-4 hover:underline",
          "shadow-none",
        ].join(" "),
      },

      size: {
        sm:      "h-7 px-2.5 text-[12px] gap-1.5 rounded-[var(--r-sm)]",
        default: "h-8 px-3.5",
        lg:      "h-9 px-4 text-[13.5px] gap-2",
        xl:      "h-10 px-5 text-[14px] gap-2 rounded-[var(--r-lg)]",
        icon:    "h-8 w-8 p-0",
        "icon-sm": "h-7 w-7 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }