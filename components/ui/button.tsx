import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Apple HIG Compliant Button Component
 *
 * Design Decisions:
 * - Uses capsule shape (rounded-full) as recommended by Apple HIG
 * - Font weight 600 (font-semibold) for clarity and hierarchy
 * - Tactile press feedback (active:scale-[0.97]) with Apple standard spring easing
 * - Minimum 44pt touch target for large actions and mobile touch ergonomics
 * - Optional glass variant with backdrop-blur-xl for frosted translucency
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1)] outline-none select-none focus-visible:ring-3 focus-visible:ring-primary/40 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:brightness-105 active:brightness-95",
        secondary:
          "bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20",
        outline:
          "border-border/80 bg-background/80 backdrop-blur-md hover:bg-muted hover:text-foreground",
        ghost:
          "hover:bg-black/5 hover:text-foreground active:bg-black/10",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-sm",
        glass:
          "bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 shadow-sm active:bg-white/35",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 min-h-[36px] gap-2 px-4 text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 min-h-[26px] gap-1 px-2.5 text-[11px] [&_svg:not([class*='size-'])]:size-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-8 min-h-[32px] gap-1.5 px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        lg: "h-11 min-h-[44px] gap-2.5 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-9 rounded-full",
        "icon-xs":
          "size-6 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-full [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
