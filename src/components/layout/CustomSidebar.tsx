'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ArrowLeftRight, CalendarDays, PieChart, Settings, TrendingUp, Folder, RefreshCw, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNavItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight },
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

    return (
        <div className="flex h-full w-[240px] flex-col border-r-2 border-ink bg-white shrink-0 z-20 overflow-hidden relative">
            {/* Logo Lockup */}
            <div className="flex items-center gap-3 px-5 py-6 border-b-2">
                <div className="w-10 h-10 rounded-[12px] bg-hot-pink border-2 border-ink shadow-[2px_2px_0px_0px_#111111] flex items-center justify-center shrink-0">
                    <PiggyBank className="text-ink h-5 w-5" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="font-archivo-black text-lg font-bold tracking-tight text-ink uppercase leading-none">CAWANG</span>
                    <span className="font-space-grotesk text-[11px] font-bold text-ink/70 leading-tight mt-1 truncate">Catat Keuangan</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                {mainNavItems.map((item) => {
                    const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 h-12 px-4 rounded-xl border-2 border-transparent transition-all',
                                isActive
                                    ? 'bg-hot-pink border-ink shadow-hard-sm text-ink font-bold hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[3px_3px_0px_0px_#111111]'
                                    : 'text-ink hover:bg-canvas hover:border-ink hover:shadow-hard-sm font-medium',
                            )}
                        >
                            <Icon className={cn('size-5', isActive ? 'fill-ink/20' : '')} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[15px] font-space-grotesk">{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Secondary & Workspace */}
            <div className="px-4 pb-6 space-y-4">
                {secondaryNavItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 h-12 px-4 rounded-xl border-2 border-transparent transition-all',
                                isActive
                                    ? 'bg-hot-pink border-ink shadow-hard-sm text-ink font-bold hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[3px_3px_0px_0px_#111111]'
                                    : 'text-ink hover:bg-canvas hover:border-ink hover:shadow-hard-sm font-medium',
                            )}
                        >
                            <Icon className={cn('size-5', isActive ? 'fill-ink/20' : '')} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[15px] font-space-grotesk">{item.label}</span>
                        </Link>
                    );
                })}

                {/* Workspace Card */}
                {/* <div className="mt-4 p-4 border-2 border-ink rounded-[18px] bg-canvas flex items-center gap-3 shadow-hard-md cursor-pointer hover:bg-white hover:translate-y-[-2px] hover:shadow-hard-lg transition-all">
                    <div className="w-10 h-10 rounded-full bg-lilac border-2 border-ink flex items-center justify-center font-bold text-ink shadow-hard-sm shrink-0">{initials}</div>
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate text-ink">{user?.user_metadata?.full_name || 'My Workspace'}</p>
                        <div className="inline-flex items-center h-5 px-2 mt-0.5 rounded-full bg-canary border-2 border-ink text-[10px] font-bold text-ink uppercase">Team Plan</div>
                    </div>
                </div> */}
            </div>
        </div>
    );
}
