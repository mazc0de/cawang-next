"use client";
import { Navigate } from '@/components/Navigate';
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { TopNavbar } from '@/components/layout/TopNavbar'
import { CustomSidebar } from '@/components/layout/CustomSidebar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-background" suppressHydrationWarning>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50 dark:bg-background" suppressHydrationWarning>
        <TopNavbar />

        <div className="flex flex-1 overflow-hidden bg-slate-50 dark:bg-background">
          <CustomSidebar />

          <main className="flex-1 overflow-y-auto bg-[#f2fafa] dark:bg-background relative">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
