import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-hover)]",
        secondary:
          "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-input-border)] hover:bg-[var(--color-bg-tertiary)]",
        ghost:
          "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]",
        outline:
          "bg-transparent text-[var(--color-text-primary)] border border-[var(--color-input-border)] hover:border-[var(--color-text-secondary)]",
        destructive:
          "bg-[var(--color-danger)] text-white hover:opacity-90",
        link: "text-[var(--color-brand-primary)] underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 rounded-[var(--radius-sm)] px-3 text-sm",
        default: "h-9 rounded-[var(--radius-sm)] px-4 text-sm",
        lg: "h-11 rounded-[var(--radius-sm)] px-6 text-base",
        icon: "size-9 rounded-[var(--radius-sm)]",
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
