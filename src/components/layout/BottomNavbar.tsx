"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  TrendingUp,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransactionsContext } from "@/contexts/TransactionsContext";

const leftNavItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/transactions",
    label: "Transaksi",
    icon: ArrowLeftRight,
  },
];

const rightNavItems = [
  {
    href: "/dashboard/budget",
    label: "Budget",
    icon: PieChart,
  },
  {
    href: "/dashboard/analytics",
    label: "Analisis",
    icon: TrendingUp,
  },
];

export function BottomNavbar() {
  const pathname = usePathname();
  const txContext = useTransactionsContext();

  const handleOpenAddTx = () => {
    txContext?.setEditingTransaction?.(undefined);
    txContext?.setSelectedDate?.(new Date());
    txContext?.setShowForm?.(true);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white border-t-2 border-ink shadow-[0px_-2px_0px_0px_#111111] px-3 py-1.5 safe-area-pb">
      <nav className="flex items-center justify-between max-w-md mx-auto relative px-1">
        {/* Left 2 Items: Overview & Transaksi */}
        <div className="flex items-center justify-around flex-1">
          {leftNavItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[54px] py-1.5 px-2 rounded-xl transition-all font-space-grotesk",
                  isActive
                    ? "bg-hot-pink border-2 border-ink shadow-[1.5px_1.5px_0px_0px_#111111] text-ink font-bold -translate-y-0.5"
                    : "border-2 border-transparent text-ink/70 hover:text-ink hover:bg-canvas font-medium",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform",
                    isActive ? "scale-105" : "",
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-[10px] font-bold leading-tight mt-0.5 tracking-tight truncate">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Center Prominent Floating Add Transaction Button */}
        <div className="flex flex-col items-center justify-center shrink-0 px-2 -mt-5">
          <button
            id="btn-bottom-nav-add-transaction"
            type="button"
            onClick={handleOpenAddTx}
            className="w-13 h-13 rounded-full bg-hot-pink border-2 border-ink shadow-[2.5px_2.5px_0px_0px_#111111] text-white flex items-center justify-center hover:scale-105 active:scale-95 active:shadow-none transition-all cursor-pointer group"
            title="Catat Transaksi Baru"
          >
            <Plus className="h-7 w-7 text-white stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
          </button>
          <span className="text-[10px] font-space-grotesk font-bold text-ink mt-0.5 tracking-tight">
            Catat
          </span>
        </div>

        {/* Right 2 Items: Budget & Analisis */}
        <div className="flex items-center justify-around flex-1">
          {rightNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[54px] py-1.5 px-2 rounded-xl transition-all font-space-grotesk",
                  isActive
                    ? "bg-hot-pink border-2 border-ink shadow-[1.5px_1.5px_0px_0px_#111111] text-ink font-bold -translate-y-0.5"
                    : "border-2 border-transparent text-ink/70 hover:text-ink hover:bg-canvas font-medium",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform",
                    isActive ? "scale-105" : "",
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-[10px] font-bold leading-tight mt-0.5 tracking-tight truncate">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
