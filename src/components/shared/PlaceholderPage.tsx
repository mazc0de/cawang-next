"use client";

interface PlaceholderPageProps {
  title: string
  description: string
  icon?: React.ReactNode
}

export function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col min-h-svh">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/50 px-6 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <h1 className="text-sm font-medium">{title}</h1>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          {icon && (
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
              {icon}
            </div>
          )}
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-xs font-medium">
            🚧 Dalam pengembangan
          </div>
        </div>
      </main>
    </div>
  )
}
