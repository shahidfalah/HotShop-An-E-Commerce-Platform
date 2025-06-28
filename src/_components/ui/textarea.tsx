import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-(--color-border) bg-(--color-background) px-3 py-2 text-base ring-offset-background placeholder:text-(--color-muted) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-(--color-primary) disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
