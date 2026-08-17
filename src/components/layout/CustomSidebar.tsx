'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ArrowLeftRight, CalendarDays, PieChart, Settings, TrendingUp, Folder, RefreshCw, PiggyBank, X } from 'lucide-react';
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
    const isMobileOpen = sidebarContext?.isMobileOpen ?? false;
    const closeMobileSidebar = sidebarContext?.closeMobileSidebar ?? (() => {});

    return (
        <>
            {/* Desktop Sidebar (visible on md screens and up) */}
            <aside className={cn('hidden md:flex h-full flex-col border-r-2 border-ink bg-white shrink-0 z-20 overflow-hidden relative select-none', 'transition-[width] duration-300 ease-in-out', isCollapsed ? 'w-[72px]' : 'w-[240px]')}>
                {/* Logo Lockup & Header */}
                {/* dont give border-ink below!!! */}
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

            {/* Mobile Drawer Backdrop */}
            {isMobileOpen && <div className="fixed inset-0 bg-ink/50 backdrop-blur-xs z-40 md:hidden animate-in fade-in-0 duration-200" onClick={closeMobileSidebar} />}

            {/* Mobile Sidebar Drawer */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 w-[280px] bg-white border-r-2 border-ink z-50 flex flex-col md:hidden transition-all duration-300 ease-in-out',
                    isMobileOpen ? 'translate-x-0 shadow-hard-lg opacity-100 visible' : '-translate-x-[calc(100%+30px)] shadow-none opacity-0 invisible pointer-events-none',
                )}
            >
                {/* Header with Logo & Close Button */}
                <div className="flex items-center justify-between border-b-2 border-ink h-[76px] px-4 shrink-0 bg-canvas/50">
                    <Link href="/dashboard" onClick={closeMobileSidebar} className="flex items-center gap-3 group" title="CAWANG">
                        <div className="w-10 h-10 rounded-[12px] bg-hot-pink border-2 border-ink shadow-[2px_2px_0px_0px_#111111] flex items-center justify-center shrink-0">
                            <PiggyBank className="text-ink h-5 w-5" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-archivo-black text-lg font-bold tracking-tight text-ink uppercase leading-none">CAWANG</span>
                            <span className="font-space-grotesk text-[10px] font-bold text-ink/70 leading-tight mt-0.5">Catat Keuangan</span>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={closeMobileSidebar}
                        className="w-9 h-9 rounded-xl bg-white border-2 border-ink shadow-hard-sm flex items-center justify-center text-ink hover:bg-coral hover:text-white transition-colors cursor-pointer active:translate-y-0.5"
                        title="Tutup Menu"
                    >
                        <X className="h-5 w-5" strokeWidth={2.5} />
                    </button>
                </div>

                {/* Mobile Navigation items */}
                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-none">
                    {mainNavItems.map((item) => {
                        const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileSidebar}
                                className={cn(
                                    'flex items-center h-12 rounded-xl border-2 px-3.5 transition-all group font-space-grotesk',
                                    isActive ? 'bg-hot-pink border-ink shadow-[2px_2px_0px_0px_#111111] text-ink font-bold' : 'border-transparent text-ink hover:bg-canvas hover:border-ink hover:shadow-[2px_2px_0px_0px_#111111] font-medium',
                                )}
                            >
                                <div className="w-6 h-6 flex items-center justify-center shrink-0 mr-3">
                                    <Icon className={cn('size-5 transition-transform group-hover:scale-110', isActive ? 'fill-ink/20' : '')} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className="text-sm font-bold">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Mobile Secondary / Settings */}
                <div className="px-4 py-4 border-t-2 border-ink/10 bg-canvas/30 shrink-0">
                    {secondaryNavItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileSidebar}
                                className={cn(
                                    'flex items-center h-12 rounded-xl border-2 px-3.5 transition-all group font-space-grotesk',
                                    isActive ? 'bg-hot-pink border-ink shadow-[2px_2px_0px_0px_#111111] text-ink font-bold' : 'border-transparent text-ink hover:bg-canvas hover:border-ink hover:shadow-[2px_2px_0px_0px_#111111] font-medium',
                                )}
                            >
                                <div className="w-6 h-6 flex items-center justify-center shrink-0 mr-3">
                                    <Icon className={cn('size-5 transition-transform group-hover:scale-110', isActive ? 'fill-ink/20' : '')} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className="text-sm font-bold">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </aside>
        </>
    );
}
