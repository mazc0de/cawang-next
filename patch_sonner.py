import re

with open("src/components/ui/sonner.tsx", "r") as f:
    content = f.read()

new_sonner = """    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="h-5 w-5 text-ink" strokeWidth={2.5} />
        ),
        info: (
          <InfoIcon className="h-5 w-5 text-ink" strokeWidth={2.5} />
        ),
        warning: (
          <TriangleAlertIcon className="h-5 w-5 text-ink" strokeWidth={2.5} />
        ),
        error: (
          <OctagonXIcon className="h-5 w-5 text-ink" strokeWidth={2.5} />
        ),
        loading: (
          <Loader2Icon className="h-5 w-5 text-ink animate-spin" strokeWidth={2.5} />
        ),
      }}
      toastOptions={{
        classNames: {
          toast: "group toast flex w-full items-center gap-3 rounded-[14px] border-2 border-ink p-4 shadow-[4px_4px_0px_0px_#111] font-space-grotesk text-sm font-bold text-ink transition-all",
          title: "text-base font-bold",
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
    />"""

content = re.sub(
    r'<Sonner[\s\S]*?\/>',
    new_sonner,
    content
)

with open("src/components/ui/sonner.tsx", "w") as f:
    f.write(content)
