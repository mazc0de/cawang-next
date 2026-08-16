"use client";
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border-2 border-ink text-sm font-bold whitespace-nowrap transition-all duration-300 ease-out outline-none select-none cursor-pointer shadow-[4px_4px_0px_#111111] active:translate-y-1 active:shadow-none active:bg-canary active:text-ink active:border-ink disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-[4px_4px_0px_#ff6b5e] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-hot-pink text-white hover:bg-white hover:text-hot-pink hover:border-hot-pink hover:shadow-[4px_4px_0px_#ff3d81]",
        outline: "bg-white text-ink hover:bg-white hover:text-hot-pink hover:border-hot-pink hover:shadow-[4px_4px_0px_#ff3d81]",
        secondary: "bg-canary text-ink hover:bg-white hover:text-ink hover:border-canary hover:shadow-[4px_4px_0px_#ffd23f]",
        ghost: "border-transparent shadow-none hover:bg-white hover:border-ink hover:shadow-[3px_3px_0px_#111111]",
        destructive: "bg-coral text-white hover:bg-white hover:text-coral hover:border-coral hover:shadow-[4px_4px_0px_#ff6b5e]",
        link: "border-transparent shadow-none text-hot-pink underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        xs: "h-7 px-2.5 text-xs rounded-lg shadow-[2px_2px_0px_#111111]",
        sm: "h-8 px-3 text-xs rounded-lg shadow-[3px_3px_0px_#111111]",
        lg: "h-12 px-6 text-base rounded-xl shadow-[5px_5px_0px_#111111]",
        icon: "size-10 rounded-xl",
        "icon-xs": "size-7 rounded-lg shadow-[2px_2px_0px_#111111]",
        "icon-sm": "size-8 rounded-lg shadow-[3px_3px_0px_#111111]",
        "icon-lg": "size-12 rounded-xl shadow-[5px_5px_0px_#111111]",
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
