'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ArrowLeftRight, CalendarDays, PieChart, Settings, TrendingUp, LogOut, RefreshCw, Folder } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// 1. Categories dipindahkan ke dalam mainNavItems (bagian atas)
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

// 2. Settings tertinggal di secondaryNavItems (bagian bawah)
const secondaryNavItems = [{ href: '/dashboard/settings', label: 'Settings', icon: Settings, bg: 'bg-blue-100', color: 'text-blue-500' }];

export function AppSidebar() {
    const { user, signOut } = useAuth();
    const pathname = usePathname();

    const initials = user?.user_metadata?.full_name
        ? user.user_metadata.full_name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : (user?.email?.[0]?.toUpperCase() ?? 'U');

    return (
        <Sidebar variant="sidebar" collapsible="icon" className="border-r-0 bg-[#eaf1ff] dark:bg-background">
            <SidebarHeader className="pt-6 pb-4 px-6 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent group-data-[collapsible=icon]:justify-center">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white w-8 h-8 font-bold text-lg leading-none shrink-0 shadow-sm">C</div>
                                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate font-extrabold text-lg tracking-tight">CAWANG</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-4 group-data-[collapsible=icon]:px-2">
                {/* Grup Utama (termasuk Categories) */}
                <SidebarGroup className="group-data-[collapsible=icon]:p-0">
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-2">
                            {mainNavItems.map(({ href, label, icon: Icon, bg, color }) => {
                                const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
                                return (
                                    <SidebarMenuItem key={href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={label}
                                            className={
                                                isActive
                                                    ? 'bg-white text-slate-900 shadow-sm rounded-xl hover:bg-white/90 dark:bg-slate-800 h-auto px-3 py-2.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:mx-auto'
                                                    : 'text-slate-600 hover:bg-white/50 hover:text-slate-900 dark:hover:bg-slate-800 rounded-xl h-auto px-3 py-2.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:mx-auto'
                                            }
                                        >
                                            <Link href={href} id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0">
                                                <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}>
                                                    <Icon className="size-4" />
                                                </div>
                                                {/* Tambahkan hidden class saat sidebar collapsed */}
                                                <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">{label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Grup Sekunder (hanya Settings) */}
                <SidebarGroup className="mt-4 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mt-auto">
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-2">
                            {secondaryNavItems.map(({ href, label, icon: Icon, bg, color }) => {
                                const isActive = pathname.startsWith(href);
                                return (
                                    <SidebarMenuItem key={href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={label}
                                            className={
                                                isActive
                                                    ? 'bg-white text-slate-900 shadow-sm rounded-xl hover:bg-white/90 dark:bg-slate-800 h-auto px-3 py-2.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:mx-auto'
                                                    : 'text-slate-600 hover:bg-white/50 hover:text-slate-900 dark:hover:bg-slate-800 rounded-xl h-auto px-3 py-2.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:mx-auto'
                                            }
                                        >
                                            <Link href={href} id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0">
                                                <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}>
                                                    <Icon className="size-4" />
                                                </div>
                                                {/* Tambahkan hidden class saat sidebar collapsed */}
                                                <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">{label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2 border-t border-border/40 mt-auto">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-white/50 dark:hover:bg-slate-800 rounded-xl group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
                                    id="user-menu-trigger"
                                >
                                    <Avatar className="h-9 w-9 rounded-full group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
                                        <AvatarFallback className="rounded-full bg-slate-200 text-slate-700 font-semibold text-sm">{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight ml-1 group-data-[collapsible=icon]:hidden">
                                        <span className="truncate font-semibold text-foreground">{user?.user_metadata?.full_name?.split(' ')[0] ?? 'Daffa'}</span>
                                        <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                                    </div>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl shadow-lg" side="top" align="center" sideOffset={8}>
                                <DropdownMenuItem id="btn-signout" className="cursor-pointer text-destructive focus:text-destructive rounded-lg" onClick={signOut}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
