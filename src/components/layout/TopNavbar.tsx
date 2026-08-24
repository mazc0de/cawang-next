"use client";
import {
  LogOut,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { usePathname } from "next/navigation";
import { useFinancialCycleConfig } from "@/hooks/useFinancialCycleConfig";
import {
  getCurrentFinancialCycle,
  formatDateShort,
  formatDate,
} from "@/lib/utils";
import { useTransactionsContext } from "@/contexts/TransactionsContext";
import { useBudgetContext } from "@/contexts/BudgetContext";
import { useCalendarContext } from "@/contexts/CalendarContext";
import { useRecurringContext } from "@/contexts/RecurringContext";
import { useCategoriesContext } from "@/contexts/CategoriesContext";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { addDays, subDays, addMonths, subMonths } from "date-fns";

export function TopNavbar() {
  const { user, signOut } = useAuth();
  const { profiles, activeProfile, setActiveProfileId, createProfile, deleteProfile } = useProfile();
  const pathname = usePathname();
  const isOverview = pathname === "/dashboard";
  const isTransactions = pathname === "/dashboard/transactions";
  const isBudget = pathname === "/dashboard/budget";
  const isCalendar = pathname === "/dashboard/calendar";
  const isRecurring = pathname === "/dashboard/recurring";
  const isCategories = pathname === "/dashboard/categories";

  const sidebarContext = useSidebarContext();
  const isSidebarCollapsed = sidebarContext?.isCollapsed ?? false;
  const toggleSidebar = sidebarContext?.toggleSidebar;
  const toggleMobileSidebar = sidebarContext?.toggleMobileSidebar;

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
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  const pageTitle = isOverview
    ? "Overview"
    : (pathname.split("/").pop() || "Dashboard")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <header className="flex flex-col sm:flex-row sm:h-24 w-full items-start sm:items-center justify-between bg-transparent px-5 sm:px-8 lg:px-10 pt-5 pb-3 sm:py-0 mt-1 sm:mt-2 shrink-0 gap-3.5 sm:gap-4">
      {/* Page Title & Subtitle */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-3">
        <div className="flex items-center gap-3">
          {/* Mobile Toggle Button */}
          <button
            id="btn-navbar-toggle-mobile"
            onClick={toggleMobileSidebar}
            type="button"
            className="md:hidden h-10 w-10 rounded-xl bg-white border-2 border-ink shadow-[2px_2px_0px_0px_#111111] hover:bg-canary active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center text-ink transition-all cursor-pointer shrink-0"
            title="Menu"
          >
            <PanelLeftOpen className="h-5 w-5" strokeWidth={2.5} />
          </button>

          {/* Desktop Toggle Button */}
          {toggleSidebar && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  id="btn-navbar-toggle-sidebar"
                  onClick={toggleSidebar}
                  type="button"
                  className="hidden md:flex h-10 w-10 rounded-xl bg-white border-2 border-ink shadow-[2px_2px_0px_0px_#111111] hover:bg-canary hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-hard-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none items-center justify-center text-ink transition-all cursor-pointer shrink-0"
                >
                  {isSidebarCollapsed ? (
                    <PanelLeftOpen className="h-5 w-5" strokeWidth={2.5} />
                  ) : (
                    <PanelLeftClose className="h-5 w-5" strokeWidth={2.5} />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="font-space-grotesk font-bold text-xs bg-white text-ink border-2 border-ink shadow-hard-sm px-3 py-1.5 rounded-lg z-50"
              >
                {isSidebarCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
              </TooltipContent>
            </Tooltip>
          )}

          <div className="flex flex-col gap-0.5 sm:gap-1">
            <h2 className="font-archivo-black text-2xl sm:text-3xl lg:text-4xl text-ink leading-none">
              {pageTitle}
            </h2>
            {isOverview && (
              <p className="text-xs sm:text-sm font-space-grotesk text-ink/70 font-normal">
                Financial Cycle: <span className="font-semibold">{cycleRange}</span>
              </p>
            )}
            {isTransactions && (
              <p className="text-xs sm:text-sm font-space-grotesk text-ink/70 font-medium">
                {formatDate(selectedDate, "EEEE, d MMMM yyyy")}
              </p>
            )}
            {isBudget && (
              <p className="text-xs sm:text-sm font-space-grotesk text-ink/70 font-medium line-clamp-1">
                Kelola batas pengeluaran kategori untuk siklus ini
              </p>
            )}
            {isCalendar && (
              <p className="text-xs sm:text-sm font-space-grotesk text-ink/70 font-medium line-clamp-1">
                Kalender arus kas harian & proyeksi tagihan rutin
              </p>
            )}
            {isRecurring && (
              <p className="text-xs sm:text-sm font-space-grotesk text-ink/70 font-medium line-clamp-1">
                Jadwal transaksi rutin, tagihan langganan & cicilan
              </p>
            )}
            {isCategories && (
              <p className="text-xs sm:text-sm font-space-grotesk text-ink/70 font-medium line-clamp-1">
                Kelola label & ikon kategori pemasukan dan pengeluaran
              </p>
            )}
            {pathname === "/dashboard/settings" && (
              <p className="text-xs sm:text-sm font-space-grotesk text-ink/70 font-medium line-clamp-1">
                Kelola profil akun & konfigurasi siklus finansial
              </p>
            )}
          </div>
        </div>

        {/* Profile button on mobile top row */}
        <div className="sm:hidden p-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center h-10 w-10 rounded-full bg-mint border-2 border-ink shadow-hard-sm active:translate-y-0.5 transition-all outline-none cursor-pointer select-none my-0.5 mr-1">
                <span className="font-bold text-ink text-xs font-space-mono">
                  {initials}
                </span>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent
              className="w-56 rounded-[16px] border-2 border-ink shadow-hard-md mt-2 p-2 bg-white"
              align="end"
            >
              <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Profiles
              </div>
              {profiles.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  className="cursor-pointer font-bold text-ink hover:bg-canvas rounded-xl focus:bg-canvas focus:text-ink flex items-center justify-between px-3 py-2 font-space-grotesk"
                  onClick={(e) => {
                    // Prevent closing if we clicked the delete button
                    if ((e.target as HTMLElement).closest('.delete-btn')) {
                      e.preventDefault();
                      return;
                    }
                    setActiveProfileId(p.id);
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate">{p.name}</span>
                    {activeProfile?.id === p.id && (
                      <span className="w-2 h-2 rounded-full bg-mint border border-ink flex-shrink-0"></span>
                    )}
                  </div>
                  {profiles.length > 1 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Yakin hapus profil ${p.name}? Semua data di dalamnya akan hilang permanen.`)) {
                          deleteProfile(p.id);
                        }
                      }}
                      className="delete-btn text-ink/40 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                      title="Hapus Profil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                className="cursor-pointer font-bold text-hot-pink hover:bg-canvas rounded-xl focus:bg-canvas focus:text-hot-pink flex items-center gap-2 px-3 py-2 font-space-grotesk"
                onClick={async () => {
                  const name = prompt("Enter new profile name:");
                  if (name) {
                    await createProfile(name);
                  }
                }}
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                New Profile
              </DropdownMenuItem>
              
              <div className="h-px bg-ink/20 my-1 mx-2" />

              <DropdownMenuItem
                id="btn-signout"
                className="cursor-pointer font-bold text-ink hover:bg-canvas rounded-xl focus:bg-canvas focus:text-ink flex items-center gap-2 px-3 py-2 font-space-grotesk"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" strokeWidth={2.5} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>

          </DropdownMenu>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2.5 sm:gap-4 overflow-x-auto sm:overflow-visible py-2 px-1 sm:p-0 scrollbar-none">
        {/* Specific controls for Transactions Page */}
        {isTransactions && (
          <>
            {/* Date Navigator */}
            <div className="flex items-center gap-1 bg-white rounded-full border-2 border-ink p-1 shadow-hard-sm shrink-0 my-0.5">
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
              className="btn-neubrutalism bg-hot-pink text-white px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-space-grotesk flex items-center gap-1.5 sm:gap-2 shrink-0 my-0.5 mr-0.5"
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
              className="btn-neubrutalism bg-white text-ink px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs font-space-grotesk flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="h-4 w-4 text-hot-pink" strokeWidth={2.5} />
              <span className="hidden sm:inline">Budgeting Wizard</span>
              <span className="sm:hidden">Wizard</span>
            </button>
            <button
              id="btn-navbar-add-budget"
              onClick={() => openAddBudgetModal?.()}
              className="btn-neubrutalism bg-hot-pink text-white px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-space-grotesk flex items-center gap-1.5 shrink-0"
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
            <div className="flex items-center gap-1 bg-white rounded-full border-2 border-ink p-1 shadow-hard-sm shrink-0">
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
              className="btn-neubrutalism bg-hot-pink text-white px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-space-grotesk flex items-center gap-1.5 shrink-0"
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
              className="btn-neubrutalism bg-hot-pink text-white px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-space-grotesk flex items-center gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4" strokeWidth={3} />
              <span className="hidden sm:inline">Tambah Kategori</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </>
        )}

        {/* Desktop Profile */}
        <div className="hidden sm:block shrink-0 my-0.5 mr-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-mint border-2 border-ink shadow-hard-sm hover:shadow-hard-md hover:-translate-y-0.5 transition-all outline-none cursor-pointer select-none">
                <span className="font-bold text-ink text-sm font-space-mono">
                  {initials}
                </span>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent
              className="w-56 rounded-[16px] border-2 border-ink shadow-hard-md mt-2 p-2 bg-white"
              align="end"
            >
              <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Profiles
              </div>
              {profiles.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  className="cursor-pointer font-bold text-ink hover:bg-canvas rounded-xl focus:bg-canvas focus:text-ink flex items-center justify-between px-3 py-2 font-space-grotesk"
                  onClick={(e) => {
                    // Prevent closing if we clicked the delete button
                    if ((e.target as HTMLElement).closest('.delete-btn')) {
                      e.preventDefault();
                      return;
                    }
                    setActiveProfileId(p.id);
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate">{p.name}</span>
                    {activeProfile?.id === p.id && (
                      <span className="w-2 h-2 rounded-full bg-mint border border-ink flex-shrink-0"></span>
                    )}
                  </div>
                  {profiles.length > 1 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Yakin hapus profil ${p.name}? Semua data di dalamnya akan hilang permanen.`)) {
                          deleteProfile(p.id);
                        }
                      }}
                      className="delete-btn text-ink/40 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                      title="Hapus Profil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                className="cursor-pointer font-bold text-hot-pink hover:bg-canvas rounded-xl focus:bg-canvas focus:text-hot-pink flex items-center gap-2 px-3 py-2 font-space-grotesk"
                onClick={async () => {
                  const name = prompt("Enter new profile name:");
                  if (name) {
                    await createProfile(name);
                  }
                }}
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                New Profile
              </DropdownMenuItem>
              
              <div className="h-px bg-ink/20 my-1 mx-2" />

              <DropdownMenuItem
                id="btn-signout"
                className="cursor-pointer font-bold text-ink hover:bg-canvas rounded-xl focus:bg-canvas focus:text-ink flex items-center gap-2 px-3 py-2 font-space-grotesk"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" strokeWidth={2.5} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>

          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
