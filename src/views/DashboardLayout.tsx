"use client";
import { Navigate } from '@/components/Navigate';
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { TopNavbar } from '@/components/layout/TopNavbar'
import { CustomSidebar } from '@/components/layout/CustomSidebar'

import { TransactionsProvider } from '@/contexts/TransactionsContext';
import { BudgetProvider } from '@/contexts/BudgetContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { RecurringProvider } from '@/contexts/RecurringContext';
import { CategoriesProvider } from '@/contexts/CategoriesContext';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-canvas" suppressHydrationWarning>
        <Loader2 className="h-10 w-10 animate-spin text-ink" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return (
    <TooltipProvider>
      <TransactionsProvider>
        <BudgetProvider>
          <CalendarProvider>
            <RecurringProvider>
              <CategoriesProvider>
                <div className="flex h-screen w-full flex-row overflow-hidden bg-canvas text-ink selection:bg-hot-pink selection:text-ink font-space-grotesk" suppressHydrationWarning>
                  <CustomSidebar />
                  <div className="flex flex-col flex-1 overflow-hidden relative">
                    <TopNavbar />
                    <main className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 relative">
                      <div className="mx-auto w-full max-w-7xl">
                        {children}
                      </div>
                    </main>
                  </div>
                </div>
              </CategoriesProvider>
            </RecurringProvider>
          </CalendarProvider>
        </BudgetProvider>
      </TransactionsProvider>
    </TooltipProvider>
  )
}
