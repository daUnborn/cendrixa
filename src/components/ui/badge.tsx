import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-[var(--radius-full)] px-2 py-0.5 text-xs font-semibold w-fit shrink-0 [&>svg]:size-3 transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-brand-primary)] text-white",
        success:
          "bg-[var(--color-success-light)] text-[var(--color-success)]",
        warning:
          "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
        danger:
          "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
        secondary:
          "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]",
        outline:
          "border border-[var(--color-input-border)] text-[var(--color-text-secondary)] bg-transparent",
      },
      size: {
        sm: "px-1.5 py-px text-[0.6875rem]",
        md: "px-2 py-0.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "md",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
