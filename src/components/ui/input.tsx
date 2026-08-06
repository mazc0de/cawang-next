"use client";
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-slate-400 focus-visible:border-[#8ab4f8] focus-visible:ring-4 focus-visible:ring-[#8ab4f8]/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50 aria-invalid:border-red-400 aria-invalid:ring-4 aria-invalid:ring-red-400/20 md:text-sm dark:bg-slate-900 dark:border-slate-800 dark:placeholder:text-slate-500",
        className
      )}
      {...props}
    />
  )
}

export { Input }
