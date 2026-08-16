"use client";
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border-2 border-ink shadow-hard-sm bg-white px-4 py-2 font-space-grotesk text-ink text-base transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-ink/40 focus-visible:shadow-hard-md disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-50 aria-invalid:border-coral aria-invalid:shadow-hard-md md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
