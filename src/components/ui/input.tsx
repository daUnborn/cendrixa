import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-[var(--radius-sm)] border border-[var(--color-input-border)] bg-[var(--color-surface)] px-3 py-1 text-sm text-[var(--color-text-primary)] shadow-[var(--shadow-sm)] outline-none transition-[border-color,box-shadow]",
        "placeholder:text-[var(--color-text-tertiary)]",
        "focus:border-[var(--color-input-border-focus)] focus:ring-2 focus:ring-[var(--color-focus-ring)]/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
