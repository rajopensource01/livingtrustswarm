import * as React from "react"
import { cn } from "@/lib/utils"

/* ── Root Card ── */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-[var(--bg-surface)] border border-[var(--border-faint)] rounded-[var(--r-lg)]",
        "shadow-[var(--shadow-card)] overflow-hidden",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

/* ── Card Header ── */
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between px-5 py-3.5",
        "border-b border-[var(--border-faint)]",
        className
      )}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

/* ── Card Title ── */
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-[12.5px] font-semibold tracking-[-0.010em] text-[var(--text-primary)]",
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

/* ── Card Description ── */
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-[11.5px] text-[var(--text-tertiary)] leading-[1.5]",
        className
      )}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

/* ── Card Content ── */
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-5 py-4", className)}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"

/* ── Card Footer ── */
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center px-5 py-3.5",
        "border-t border-[var(--border-faint)] bg-[var(--bg-base)]",
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

/* ── Card Section (horizontal divider within body) ── */
const CardSection = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-5 py-4 border-b border-[var(--border-faint)] last:border-b-0",
        className
      )}
      {...props}
    />
  )
)
CardSection.displayName = "CardSection"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardSection }