'use client';
import { LogOut, Plus, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useFinancialCycleConfig } from '@/hooks/useFinancialCycleConfig';
import { getCurrentFinancialCycle, formatDateShort, formatDate } from '@/lib/utils';
import { useTransactionsContext } from '@/contexts/TransactionsContext';
import { useBudgetContext } from '@/contexts/BudgetContext';
import { useCalendarContext } from '@/contexts/CalendarContext';
import { useRecurringContext } from '@/contexts/RecurringContext';
import { useCategoriesContext } from '@/contexts/CategoriesContext';
import { addDays, subDays, addMonths, subMonths } from 'date-fns';

export function TopNavbar() {
    const { user, signOut } = useAuth();
    const pathname = usePathname();
    const isOverview = pathname === '/dashboard';
    const isTransactions = pathname === '/dashboard/transactions';
    const isBudget = pathname === '/dashboard/budget';
    const isCalendar = pathname === '/dashboard/calendar';
    const isRecurring = pathname === '/dashboard/recurring';
    const isCategories = pathname === '/dashboard/categories';

    const txContext = useTransactionsContext();
    const selectedDate = txContext?.selectedDate ?? new Date();
    const setSelectedDate = txContext?.setSelectedDate;
    const setShowForm = txContext?.setShowForm;
    const setEditingTransaction = txContext?.setEditingTransaction;

    const budgetContext = useBudgetContext();
    const openAddBudgetModal = budgetContext?.openAddModal;
    const openBudgetWizardModal = budgetContext?.openWizardModal;

    const calendarContext = useCalendarContext();
    const setReferenceDate = calendarContext?.setReferenceDate;
    const setCalendarSelectedDate = calendarContext?.setSelectedDate;

    const recurringContext = useRecurringContext();
    const openAddRuleModal = recurringContext?.openAddModal;

    const categoriesContext = useCategoriesContext();
    const openAddCategoryModal = categoriesContext?.openAddModal;

    const { data: cycleConfig } = useFinancialCycleConfig();
    const startDay = cycleConfig?.start_day ?? 1;
    const { startDate, endDate } = getCurrentFinancialCycle(startDay);
    const cycleRange = `${formatDateShort(startDate)} – ${formatDateShort(endDate)}`;

    const initials =
        user?.user_metadata?.full_name
            ?.split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
    const pageTitle = isOverview ? 'Overview' : (pathname.split('/').pop() || 'Dashboard').replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    return (
        <header className="flex h-24 w-full items-center justify-between bg-transparent px-6 lg:px-10 mt-2 shrink-0">
            {/* Page Title & Subtitle */}
            <div className="flex flex-col gap-1">
                <h2 className="font-archivo-black text-4xl text-ink leading-none">{pageTitle}</h2>
                {isOverview && (
                    <p className="text-sm font-space-grotesk text-ink/70 font-normal">
                        Financial Cycle: <span className="font-semibold">{cycleRange}</span>
                    </p>
                )}
                {isTransactions && (
                    <p className="text-sm font-space-grotesk text-ink/70 font-medium">
                        {formatDate(selectedDate, 'EEEE, d MMMM yyyy')}
                    </p>
                )}
                {isBudget && (
                    <p className="text-sm font-space-grotesk text-ink/70 font-medium">
                        Kelola batas pengeluaran kategori untuk siklus ini
                    </p>
                )}
                {isCalendar && (
                    <p className="text-sm font-space-grotesk text-ink/70 font-medium">
                        Kalender arus kas harian & proyeksi tagihan rutin
                    </p>
                )}
                {isRecurring && (
                    <p className="text-sm font-space-grotesk text-ink/70 font-medium">
                        Jadwal transaksi rutin, tagihan langganan & cicilan
                    </p>
                )}
                {isCategories && (
                    <p className="text-sm font-space-grotesk text-ink/70 font-medium">
                        Kelola label & ikon kategori pemasukan dan pengeluaran
                    </p>
                )}
                {pathname === '/dashboard/settings' && (
                    <p className="text-sm font-space-grotesk text-ink/70 font-medium">
                        Kelola profil akun & konfigurasi siklus finansial
                    </p>
                )}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Specific controls for Transactions Page */}
                {isTransactions && (
                    <>
                        {/* Date Navigator */}
                        <div className="flex items-center gap-1 bg-white rounded-full border-2 border-ink p-1 shadow-hard-sm">
                            <button
                                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center hover:bg-canvas text-ink transition-colors cursor-pointer"
                                onClick={() => setSelectedDate?.((prev) => subDays(prev, 1))}
                                title="Hari Sebelumnya"
                            >
                                <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
                            </button>
                            <button
                                className="btn-neubrutalism bg-canary text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1 text-ink h-7"
                                onClick={() => setSelectedDate?.(new Date())}
                            >
                                Hari Ini
                            </button>
                            <button
                                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center hover:bg-canvas text-ink transition-colors cursor-pointer"
                                onClick={() => setSelectedDate?.((prev) => addDays(prev, 1))}
                                title="Hari Berikutnya"
                            >
                                <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Catat Transaksi Button */}
                        <button
                            id="btn-navbar-add-transaction"
                            className="btn-neubrutalism bg-hot-pink text-white px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-space-grotesk flex items-center gap-1.5 sm:gap-2"
                            onClick={() => {
                                setEditingTransaction?.(undefined);
                                setShowForm?.(true);
                            }}
                        >
                            <Plus className="h-4 w-4" strokeWidth={3} />
                            <span className="hidden sm:inline">Catat Transaksi</span>
                            <span className="sm:hidden">Catat</span>
                        </button>
                    </>
                )}

                {/* Specific controls for Budget Page */}
                {isBudget && (
                    <>
                        <button
                            id="btn-navbar-open-wizard"
                            onClick={() => openBudgetWizardModal?.()}
                            className="btn-neubrutalism bg-white text-ink px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-space-grotesk flex items-center gap-1.5"
                        >
                            <Sparkles className="h-4 w-4 text-hot-pink" strokeWidth={2.5} />
                            <span className="hidden sm:inline">Budgeting Wizard</span>
                            <span className="sm:hidden">Wizard</span>
                        </button>
                        <button
                            id="btn-navbar-add-budget"
                            onClick={() => openAddBudgetModal?.()}
                            className="btn-neubrutalism bg-hot-pink text-white px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-space-grotesk flex items-center gap-1.5"
                        >
                            <Plus className="h-4 w-4" strokeWidth={3} />
                            <span className="hidden sm:inline">Tambah Budget</span>
                            <span className="sm:hidden">Tambah</span>
                        </button>
                    </>
                )}

                {/* Specific controls for Calendar Page */}
                {isCalendar && (
                    <>
                        {/* Month Navigator */}
                        <div className="flex items-center gap-1 bg-white rounded-full border-2 border-ink p-1 shadow-hard-sm">
                            <button
                                id="btn-prev-month"
                                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center hover:bg-canvas text-ink transition-colors cursor-pointer"
                                onClick={() => setReferenceDate?.((prev) => subMonths(prev, 1))}
                                title="Bulan Sebelumnya"
                            >
                                <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
                            </button>
                            <button
                                id="btn-today"
                                className="btn-neubrutalism bg-canary text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1 text-ink h-7"
                                onClick={() => {
                                    setReferenceDate?.(new Date());
                                    setCalendarSelectedDate?.(new Date());
                                }}
                            >
                                Hari Ini
                            </button>
                            <button
                                id="btn-next-month"
                                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center hover:bg-canvas text-ink transition-colors cursor-pointer"
                                onClick={() => setReferenceDate?.((prev) => addMonths(prev, 1))}
                                title="Bulan Berikutnya"
                            >
                                <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                            </button>
                        </div>
                    </>
                )}

                {/* Specific controls for Recurring Page */}
                {isRecurring && (
                    <>
                        <button
                            id="btn-navbar-add-rule"
                            onClick={() => openAddRuleModal?.()}
                            className="btn-neubrutalism bg-hot-pink text-white px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-space-grotesk flex items-center gap-1.5"
                        >
                            <Plus className="h-4 w-4" strokeWidth={3} />
                            <span className="hidden sm:inline">Tambah Rule</span>
                            <span className="sm:hidden">Tambah</span>
                        </button>
                    </>
                )}

                {/* Specific controls for Categories Page */}
                {isCategories && (
                    <>
                        <button
                            id="btn-navbar-add-category"
                            onClick={() => openAddCategoryModal?.()}
                            className="btn-neubrutalism bg-hot-pink text-white px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-space-grotesk flex items-center gap-1.5"
                        >
                            <Plus className="h-4 w-4" strokeWidth={3} />
                            <span className="hidden sm:inline">Tambah Kategori</span>
                            <span className="sm:hidden">Tambah</span>
                        </button>
                    </>
                )}

                {/* Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center justify-center h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-mint border-2 border-ink shadow-hard-sm hover:shadow-hard-md hover:-translate-y-0.5 transition-all outline-none cursor-pointer select-none">
                            <span className="font-bold text-ink text-sm font-space-mono">{initials}</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 rounded-[16px] border-2 border-ink shadow-hard-md mt-2 p-2 bg-white" align="end">
                        <DropdownMenuItem id="btn-signout" className="cursor-pointer font-bold text-ink hover:bg-canvas rounded-xl focus:bg-canvas focus:text-ink flex items-center gap-2 px-3 py-2 font-space-grotesk" onClick={signOut}>
                            <LogOut className="h-4 w-4" strokeWidth={2.5} />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
