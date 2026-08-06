'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, Wallet, ArrowLeftRight, CalendarDays, PieChart, 
    Settings, TrendingUp, Folder, RefreshCw, ChevronRight
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const mainNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, bg: 'bg-blue-100', color: 'text-blue-500' },
    { href: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight, bg: 'bg-green-100', color: 'text-green-500' },
    { href: '/dashboard/accounts', label: 'Accounts', icon: Wallet, bg: 'bg-amber-100', color: 'text-amber-500' },
    { href: '/dashboard/budget', label: 'Budget', icon: PieChart, bg: 'bg-yellow-100', color: 'text-yellow-500' },
    { href: '/dashboard/calendar', label: 'Calendar View', icon: CalendarDays, bg: 'bg-fuchsia-100', color: 'text-fuchsia-500' },
    { href: '/dashboard/recurring', label: 'Recurring Rule', icon: RefreshCw, bg: 'bg-emerald-100', color: 'text-emerald-500' },
    { href: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp, bg: 'bg-rose-100', color: 'text-rose-500' },
    { href: '/dashboard/categories', label: 'Categories', icon: Folder, bg: 'bg-orange-100', color: 'text-orange-500' },
];

const secondaryNavItems = [
    { href: '/dashboard/settings', label: 'Settings', icon: Settings, bg: 'bg-blue-100', color: 'text-blue-500' }
];

export function CustomSidebar() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    return (
        <div
            className={cn(
                "relative flex h-full flex-col border-r border-slate-200 bg-[#eaf1ff] dark:border-slate-800 dark:bg-background transition-all duration-300 ease-in-out shrink-0",
                isExpanded ? "w-64" : "w-20"
            )}
        >
            {/* TOGGLE EXPAND BUTTON */}
            <div className="relative flex h-16 w-full items-center px-4 pt-5 pb-4">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={cn(
                        "group absolute flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-slate-200 transition-all duration-300 hover:bg-slate-50 focus:outline-none active:scale-95 z-10 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700",
                        isExpanded ? "right-4" : "right-[50%] translate-x-[50%]"
                    )}
                >
                    <ChevronRight
                        size={18}
                        className={cn(
                            "text-slate-600 transition-transform duration-300 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white",
                            isExpanded ? "rotate-180" : "rotate-0"
                        )}
                    />
                </button>
            </div>

            {/* MAIN MENU ITEMS */}
            <div className="flex flex-col gap-2 mt-2 flex-1 overflow-y-auto no-scrollbar">
                {mainNavItems.map((item) => {
                    const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Tooltip key={item.href} delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "mx-4 flex h-11 items-center overflow-hidden rounded-xl transition-all duration-300 shrink-0",
                                        isActive
                                            ? "bg-white text-slate-900 shadow-sm font-semibold dark:bg-slate-800 dark:text-white"
                                            : "text-slate-600 hover:bg-white/50 hover:text-slate-900 active:scale-[0.98] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                    )}
                                >
                                    <div className="flex h-11 w-12 shrink-0 items-center justify-center">
                                        <div className={cn(`flex size-8 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.color}`)}>
                                            <Icon className="size-4" />
                                        </div>
                                    </div>

                                    <span
                                        className={cn(
                                            "text-sm whitespace-nowrap transition-all duration-300",
                                            isExpanded ? "w-32 opacity-100 ml-1" : "w-0 opacity-0 ml-0"
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            </TooltipTrigger>

                            <TooltipContent
                                side="right"
                                className={cn(
                                    "ml-2 font-medium transition-opacity",
                                    isExpanded ? "hidden pointer-events-none opacity-0" : "visible opacity-100"
                                )}
                            >
                                {item.label}
                            </TooltipContent>
                        </Tooltip>
                    );
                })}

                {/* SECONDARY MENU ITEMS */}
                <div className="mt-4 mb-4">
                    {secondaryNavItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                            <Tooltip key={item.href} delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "mx-4 flex h-11 items-center overflow-hidden rounded-xl transition-all duration-300 shrink-0",
                                            isActive
                                                ? "bg-white text-slate-900 shadow-sm font-semibold dark:bg-slate-800 dark:text-white"
                                                : "text-slate-600 hover:bg-white/50 hover:text-slate-900 active:scale-[0.98] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                        )}
                                    >
                                        <div className="flex h-11 w-12 shrink-0 items-center justify-center">
                                            <div className={cn(`flex size-8 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.color}`)}>
                                                <Icon className="size-4" />
                                            </div>
                                        </div>

                                        <span
                                            className={cn(
                                                "text-sm whitespace-nowrap transition-all duration-300",
                                                isExpanded ? "w-32 opacity-100 ml-1" : "w-0 opacity-0 ml-0"
                                            )}
                                        >
                                            {item.label}
                                        </span>
                                    </Link>
                                </TooltipTrigger>

                                <TooltipContent
                                    side="right"
                                    className={cn(
                                        "ml-2 font-medium transition-opacity",
                                        isExpanded ? "hidden pointer-events-none opacity-0" : "visible opacity-100"
                                    )}
                                >
                                    {item.label}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
