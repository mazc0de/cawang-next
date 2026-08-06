'use client';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

export function TopNavbar() {
    const { user, signOut } = useAuth();

    const initials = user?.user_metadata?.full_name
        ? user.user_metadata.full_name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : (user?.email?.[0]?.toUpperCase() ?? 'U');

    return (
        <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <Link href="/dashboard" className="flex items-center gap-2 group">
                <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white w-9 h-9 font-bold text-lg leading-none shrink-0 shadow-sm transition-transform duration-500 group-hover:rotate-180">
                    C
                </div>
                <div className="flex flex-col">
                    <p className="text-lg leading-tight font-extrabold tracking-tight text-slate-900 dark:text-white">
                        CAWANG
                    </p>
                </div>
            </Link>

            <div className="flex items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-4 transition-all hover:bg-slate-100 focus:ring-2 focus:ring-blue-500/40 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
                            <div className="flex flex-col items-end">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    {user?.user_metadata?.full_name?.split(' ')[0] ?? 'Daffa'}
                                </p>
                                <p className="text-[10px] tracking-wider text-slate-500 uppercase">
                                    {user?.email}
                                </p>
                            </div>
                            <Avatar className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700">
                                <AvatarFallback className="rounded-full bg-blue-100 text-blue-700 font-semibold text-sm dark:bg-blue-900 dark:text-blue-300">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mt-2 w-56 rounded-xl border border-slate-100 shadow-xl dark:border-slate-800" align="end">
                        <DropdownMenuItem id="btn-signout" className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/50 rounded-lg flex items-center justify-start gap-2 px-3 py-2 font-medium" onClick={signOut}>
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
