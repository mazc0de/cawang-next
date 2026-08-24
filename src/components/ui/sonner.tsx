import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="h-5 w-5 text-ink shrink-0" strokeWidth={2.5} />
        ),
        info: (
          <InfoIcon className="h-5 w-5 text-ink shrink-0" strokeWidth={2.5} />
        ),
        warning: (
          <TriangleAlertIcon className="h-5 w-5 text-ink shrink-0" strokeWidth={2.5} />
        ),
        error: (
          <OctagonXIcon className="h-5 w-5 text-ink shrink-0" strokeWidth={2.5} />
        ),
        loading: (
          <Loader2Icon className="h-5 w-5 text-ink animate-spin shrink-0" strokeWidth={2.5} />
        ),
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "group toast flex w-full sm:w-[356px] items-center gap-3 rounded-[14px] border-2 border-ink p-4 shadow-[4px_4px_0px_0px_#111] font-space-grotesk text-sm font-bold text-ink transition-all bg-white",
          title: "text-sm font-bold font-space-grotesk text-ink",
          description: "font-space-mono text-ink/80 text-xs font-semibold",
          actionButton: "btn-neubrutalism bg-hot-pink text-ink text-xs px-3 py-1.5 border-2 border-ink shadow-[2px_2px_0px_0px_#111]",
          cancelButton: "btn-neubrutalism bg-white text-ink text-xs px-3 py-1.5 border-2 border-ink shadow-[2px_2px_0px_0px_#111]",
          success: "bg-mint",
          error: "bg-coral",
          warning: "bg-canary",
          info: "bg-white",
          icon: "shrink-0 mr-1 flex items-center justify-center",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
