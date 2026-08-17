'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ArrowLeftRight, CalendarDays, PieChart, Settings, TrendingUp, Folder, RefreshCw, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const mainNavItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    {
        href: '/dashboard/transactions',
        label: 'Transactions',
        icon: ArrowLeftRight,
    },
    { href: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/dashboard/accounts', label: 'Accounts', icon: Wallet },
    { href: '/dashboard/budget', label: 'Budget', icon: PieChart },
    { href: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays },
    { href: '/dashboard/recurring', label: 'Recurring', icon: RefreshCw },
    { href: '/dashboard/categories', label: 'Categories', icon: Folder },
];

const secondaryNavItems = [{ href: '/dashboard/settings', label: 'Settings', icon: Settings }];

export function CustomSidebar() {
    const pathname = usePathname();
    const sidebarContext = useSidebarContext();
    const isCollapsed = sidebarContext?.isCollapsed ?? false;

    return (
        <aside className={cn('flex h-full flex-col border-r-2 border-ink bg-white shrink-0 z-20 overflow-hidden relative select-none', 'transition-[width] duration-300 ease-in-out', isCollapsed ? 'w-[72px]' : 'w-[240px]')}>
            {/* Logo Lockup & Header */}
            <div className="flex items-center border-b-2  h-[88px] px-3.5 w-[240px] shrink-0">
                <Link href="/dashboard" className="flex items-center min-w-0 group" title="CAWANG">
                    <div className="w-11 h-11 rounded-[12px] bg-hot-pink border-2 border-ink shadow-[2px_2px_0px_0px_#111111] flex items-center justify-center shrink-0 group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all">
                        <PiggyBank className="text-ink h-5 w-5" strokeWidth={2.5} />
                    </div>

                    <div className={cn('flex flex-col min-w-0 ml-3 transition-opacity duration-200 overflow-hidden whitespace-nowrap', isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100')}>
                        <span className="font-archivo-black text-lg font-bold tracking-tight text-ink uppercase leading-none">CAWANG</span>
                        <span className="font-space-grotesk text-[11px] font-bold text-ink/70 leading-tight mt-1 truncate">Catat Keuangan</span>
                    </div>
                </Link>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 py-5 space-y-1.5 w-[240px] shrink-0 scrollbar-none">
                {mainNavItems.map((item) => {
                    const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Tooltip key={item.href} open={isCollapsed ? undefined : false}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'flex items-center h-11 rounded-xl border-2 transition-[width,background-color,border-color,box-shadow] duration-300 ease-in-out group px-3 overflow-hidden',
                                        isCollapsed ? 'w-11' : 'w-[210px]',
                                        isActive
                                            ? 'bg-hot-pink border-ink shadow-[2px_2px_0px_0px_#111111] text-ink font-bold'
                                            : 'border-transparent text-ink hover:bg-canvas hover:border-ink hover:shadow-[2px_2px_0px_0px_#111111] font-medium',
                                    )}
                                >
                                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                        <Icon className={cn('size-5 transition-transform duration-200 group-hover:scale-110', isActive ? 'fill-ink/20' : '')} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    <span className={cn('text-sm font-space-grotesk whitespace-nowrap ml-3 transition-opacity duration-200', isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100')}>{item.label}</span>
                                </Link>
                            </TooltipTrigger>
                            {isCollapsed && (
                                <TooltipContent
                                    side="right"
                                    sideOffset={12}
                                    className="font-space-grotesk font-bold text-xs bg-white text-ink border-2 border-ink shadow-hard-sm px-3 py-1.5 rounded-lg z-50 animate-in fade-in-0 zoom-in-95 duration-100"
                                >
                                    {item.label}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    );
                })}
            </nav>

            {/* Secondary & Footer */}
            <div className="px-3.5 pb-5 pt-2 border-t border-ink/10 w-[240px] shrink-0">
                {secondaryNavItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Tooltip key={item.href} open={isCollapsed ? undefined : false}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'flex items-center h-11 rounded-xl border-2 transition-[width,background-color,border-color,box-shadow] duration-300 ease-in-out group px-3 overflow-hidden',
                                        isCollapsed ? 'w-11' : 'w-[210px]',
                                        isActive
                                            ? 'bg-hot-pink border-ink shadow-[2px_2px_0px_0px_#111111] text-ink font-bold'
                                            : 'border-transparent text-ink hover:bg-canvas hover:border-ink hover:shadow-[2px_2px_0px_0px_#111111] font-medium',
                                    )}
                                >
                                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                        <Icon className={cn('size-5 transition-transform duration-200 group-hover:scale-110', isActive ? 'fill-ink/20' : '')} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    <span className={cn('text-sm font-space-grotesk whitespace-nowrap ml-3 transition-opacity duration-200', isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100')}>{item.label}</span>
                                </Link>
                            </TooltipTrigger>
                            {isCollapsed && (
                                <TooltipContent
                                    side="right"
                                    sideOffset={12}
                                    className="font-space-grotesk font-bold text-xs bg-white text-ink border-2 border-ink shadow-hard-sm px-3 py-1.5 rounded-lg z-50 animate-in fade-in-0 zoom-in-95 duration-100"
                                >
                                    {item.label}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    );
                })}
            </div>
        </aside>
    );
}
