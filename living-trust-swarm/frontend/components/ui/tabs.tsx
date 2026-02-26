import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

/* ── TabsList ── */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center gap-0.5 p-1 rounded-[var(--r-lg)]",
      "bg-[var(--bg-canvas)] border border-[var(--border-faint)]",
      "shadow-[var(--shadow-inset)]",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

/* ── TabsTrigger ── */
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap",
      "rounded-[var(--r-md)] px-3 py-1.5",
      "text-[12.5px] font-medium tracking-[-0.008em]",
      "transition-all duration-[var(--t-base)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1",
      "disabled:pointer-events-none disabled:opacity-40",
      // Inactive
      "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]",
      // Active
      "data-[state=active]:bg-[var(--bg-surface)]",
      "data-[state=active]:text-[var(--text-primary)]",
      "data-[state=active]:font-semibold",
      "data-[state=active]:shadow-[var(--shadow-xs)]",
      "data-[state=active]:border data-[state=active]:border-[var(--border-faint)]",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

/* ── TabsContent ── */
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-visible:outline-none",
      "data-[state=active]:animate-in data-[state=active]:fade-in-0",
      "data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }