'use client';
import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

import { TrendingUp, TrendingDown, Wallet, AlertCircle, Plus, ArrowLeftRight, ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatRupiah, formatDateShort, getCurrentFinancialCycle, cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useFinancialCycleConfig } from '@/hooks/useFinancialCycleConfig';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAccounts } from '@/hooks/useAccounts';
import { useBudgets } from '@/hooks/useBudgets';
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useTransactions';
import { TransactionFormDialog } from '@/components/transactions/TransactionFormDialog';
import type { TransactionFormData } from '@/components/transactions/TransactionFormDialog';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export function DashboardPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Pengguna';
    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<any>(undefined);

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Financial cycle config
    const { data: cycleConfig } = useFinancialCycleConfig();
    const startDay = cycleConfig?.start_day ?? 1;
    const { startDate: cycleStart, endDate: cycleEnd } = getCurrentFinancialCycle(startDay);

    // Real data
    const { data: stats, isLoading: statsLoading } = useDashboardStats(cycleStart, cycleEnd);
    const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
    const { data: todayTransactions = [], isLoading: todayTxLoading } = useTransactions({ start_date: todayStr, end_date: todayStr });
    const { data: categories = [] } = useCategories();

    const createTransaction = useCreateTransaction();
    const updateTransaction = useUpdateTransaction();
    const deleteTransaction = useDeleteTransaction();

    // Budgets for current cycle
    const cycleYear = cycleStart.getFullYear();
    const cycleMonth = cycleStart.getMonth() + 1;
    const { data: budgets = [] } = useBudgets(cycleYear, cycleMonth);

    const cashFlow = (stats?.income_this_cycle ?? 0) - (stats?.expense_this_cycle ?? 0);

    const handleTransactionSubmit = async (data?: TransactionFormData) => {
        if (!data || !user) return;

        if (editingTransaction) {
            if (editingTransaction.transfer_pair_id) {
                await updateTransaction.mutateAsync({
                    id: editingTransaction.id,
                    amount: data.amount,
                    date: data.date,
                    notes: data.notes,
                });
                await updateTransaction.mutateAsync({
                    id: editingTransaction.transfer_pair_id,
                    amount: data.amount,
                    date: data.date,
                });
            } else {
                await updateTransaction.mutateAsync({
                    id: editingTransaction.id,
                    account_id: data.account_id,
                    category_id: data.category_id!,
                    amount: data.amount,
                    date: data.date,
                    notes: data.notes,
                });
            }
            setEditingTransaction(undefined);
            return;
        }

        if (data.type === 'transfer') {
            const { data: tx1 } = await supabase
                .from('transactions')
                .insert([
                    {
                        user_id: user.id,
                        account_id: data.account_id,
                        category_id: categories.find((c) => c.type === 'outflow')?.id ?? '',
                        amount: data.amount,
                        type: 'outflow',
                        date: data.date,
                        notes: data.notes,
                        is_adjustment: false,
                    },
                ])
                .select()
                .single();
            if (!tx1) return;
            const { data: tx2 } = await supabase
                .from('transactions')
                .insert([
                    {
                        user_id: user.id,
                        account_id: data.to_account_id!,
                        category_id: categories.find((c) => c.type === 'inflow')?.id ?? '',
                        amount: data.amount,
                        type: 'inflow',
                        date: data.date,
                        notes: data.notes,
                        is_adjustment: false,
                        transfer_pair_id: tx1.id,
                    },
                ])
                .select()
                .single();
            if (tx2) await supabase.from('transactions').update({ transfer_pair_id: tx2.id }).eq('id', tx1.id);
            queryClient.invalidateQueries({ queryKey: ['transactions', user.id] });
            queryClient.invalidateQueries({ queryKey: ['accounts', user.id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard_stats', user.id] });
        } else {
            await createTransaction.mutateAsync({
                account_id: data.account_id,
                category_id: data.category_id!,
                amount: data.amount,
                type: data.type,
                date: data.date,
                notes: data.notes,
                is_adjustment: false,
                transfer_pair_id: null,
            });
        }
    };

    const handleDeleteTransaction = async (id: string) => {
        if (!confirm('Hapus transaksi ini?')) return;
        await deleteTransaction.mutateAsync(id);
    };

    // Komponen StatCard
    const StatCard = ({ id, icon, label, value, sub, theme }: { id: string; icon: React.ReactNode; label: string; value: string; sub?: string; theme: 'blue' | 'emerald' | 'orange' | 'rose' }) => {
        const themeStyles = {
            blue: { border: 'border-[#a7c5f9]', header: 'bg-[#eef4ff]', icon: 'text-[#5a8df2]' },
            emerald: { border: 'border-[#a8e6cf]', header: 'bg-[#f0fbf7]', icon: 'text-[#4cb791]' },
            orange: { border: 'border-[#fcd9a1]', header: 'bg-[#fffbf2]', icon: 'text-[#f0a635]' },
            rose: { border: 'border-[#f8b4b4]', header: 'bg-[#fff5f5]', icon: 'text-[#e65c5c]' },
        };
        const style = themeStyles[theme];

        return (
            <Card id={id} className={cn('p-0 shadow-sm overflow-hidden rounded-2xl bg-white border', style.border)}>
                <CardHeader className={cn('m-0 border-b-0 pb-3 pt-3 px-5', style.header)}>
                    <CardDescription className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                        <span className={style.icon}>{icon}</span>
                        {label}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 px-5 pb-5">
                    {statsLoading ? <Skeleton className="h-8 w-32 bg-slate-200" /> : <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>}
                    {sub && <p className="text-xs text-slate-500 mt-1.5">{sub}</p>}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="flex flex-col min-h-svh bg-[#f2fafa] dark:bg-background">
            <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Hello, {firstName} 👋</h2>
                        <p className="text-slate-500 text-sm mt-2">
                            Financial Cycle:{' '}
                            <span className="font-medium text-slate-700">
                                {formatDateShort(cycleStart)} – {formatDateShort(cycleEnd)}
                            </span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {(stats?.pending_confirmations_count ?? 0) > 0 && (
                            <Link href="/dashboard/recurring">
                                <Badge className="gap-1.5 cursor-pointer bg-[#fcd9a1] hover:bg-[#f3cb8d] text-slate-800 rounded-full px-3 py-2 border-none shadow-none" id="badge-pending">
                                    <AlertCircle className="h-4 w-4" />
                                    {stats!.pending_confirmations_count} Pending
                                </Badge>
                            </Link>
                        )}
                        <Button
                            size="sm"
                            id="btn-add-transaction"
                            className="gap-1.5 h-9 bg-[#8ab4f8] hover:bg-[#739ce3] text-white rounded-full px-5 shadow-none"
                            onClick={() => {
                                setEditingTransaction(undefined);
                                setShowForm(true);
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            Catat Transaksi
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard id="card-net-worth" icon={<Wallet className="h-4 w-4" />} label="Net Worth" value={formatRupiah(stats?.net_worth ?? 0)} sub="Total saldo semua Account" theme="blue" />
                    <StatCard id="card-expense-today" icon={<ArrowDown className="h-4 w-4" />} label="Pengeluaran Hari Ini" value={formatRupiah(stats?.expense_today ?? 0)} sub="Total outflow hari ini" theme="rose" />
                    <StatCard id="card-income" icon={<TrendingUp className="h-4 w-4" />} label="Income Cycle Ini" value={formatRupiah(stats?.income_this_cycle ?? 0)} sub="Total inflow periode ini" theme="emerald" />
                    <StatCard id="card-expense" icon={<ArrowDown className="h-4 w-4" />} label="Pengeluaran Cycle Ini" value={formatRupiah(stats?.expense_this_cycle ?? 0)} sub="Total outflow periode ini" theme="orange" />
                    <StatCard id="card-cashflow" icon={<TrendingDown className="h-4 w-4" />} label="Cash Flow" value={(cashFlow >= 0 ? '+' : '') + formatRupiah(cashFlow)} sub="Income - Pengeluaran" theme="blue" />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Main Card 1: Account */}
                    <Card id="card-accounts" className="p-0 shadow-sm rounded-2xl bg-white border border-[#a7c5f9] overflow-hidden">
                        <CardHeader className="m-0 border-b-0 pb-3 pt-4 px-6 bg-[#eef4ff]">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-bold text-slate-800">Account Summary</CardTitle>
                                <Button variant="ghost" size="sm" className="h-8 text-xs rounded-full px-4 text-[#5a8df2] hover:bg-[#a7c5f9]/30" id="btn-manage-accounts" asChild>
                                    <Link href="/dashboard/accounts">Kelola</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 pt-5">
                            {accountsLoading && <Skeleton className="h-24 w-full bg-slate-100" />}
                            {!accountsLoading && accounts.length === 0 && (
                                <div className="text-center py-6">
                                    <p className="text-sm text-slate-500">Belum ada Account</p>
                                    <Button variant="link" size="sm" className="h-7 text-xs mt-1 text-[#5a8df2]" asChild>
                                        <Link href="/dashboard/accounts">Tambah Account →</Link>
                                    </Button>
                                </div>
                            )}
                            {!accountsLoading && accounts.length > 0 && (
                                <div className="space-y-4">
                                    {accounts.map((acc, i) => (
                                        <div key={acc.id} className={cn('flex items-center justify-between', i !== accounts.length - 1 && 'border-b border-slate-100 pb-4')}>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-[#eef4ff] flex items-center justify-center text-lg font-bold text-[#5a8df2]">{acc.name[0].toUpperCase()}</div>
                                                <div>
                                                    <p className="font-semibold text-sm leading-none text-slate-800">{acc.name}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-800">{formatRupiah(acc.actual_balance, true)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Main Card 2: Budget */}
                    <Card id="card-budget" className="p-0 shadow-sm rounded-2xl bg-white border border-[#a8e6cf] overflow-hidden">
                        <CardHeader className="m-0 border-b-0 pb-3 pt-4 px-6 bg-[#f0fbf7]">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-bold text-slate-800">Budget vs Actual</CardTitle>
                                <Button variant="ghost" size="sm" className="h-8 text-xs rounded-full px-4 text-[#4cb791] hover:bg-[#a8e6cf]/30" id="btn-manage-budget" asChild>
                                    <Link href="/dashboard/budget">Atur Budget</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 pt-5">
                            {budgets.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-sm text-slate-500">Belum ada Budget</p>
                                    <Button variant="link" size="sm" className="h-7 text-xs mt-1 text-[#4cb791]" asChild>
                                        <Link href="/dashboard/budget">Buat Budget →</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-slate-500">Budget progress</span>
                                        </div>
                                        <Progress
                                            value={Math.min(
                                                (budgets.reduce((sum: number, b: any) => sum + (b.spent ?? 0), 0) /
                                                    Math.max(
                                                        1,
                                                        budgets.reduce((sum: number, b: any) => sum + b.amount, 0),
                                                    )) *
                                                    100,
                                                100,
                                            )}
                                            className="h-2.5 rounded-full [&>div]:bg-[#4cb791] bg-[#e2f7ef]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid grid-cols-2 gap-y-3 text-xs text-slate-700">
                                            {budgets.slice(0, 4).map((b: any, idx: number) => {
                                                const colors = ['bg-[#4cb791]', 'bg-[#8ab4f8]', 'bg-[#fcd9a1]', 'bg-[#f8b4b4]'];
                                                return (
                                                    <div key={b.id} className="flex items-center gap-1.5">
                                                        <div className={cn('w-2 h-2 rounded-full', colors[idx % colors.length])}></div>
                                                        <span className="truncate">{b.category?.name ?? 'Kategori'}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <div className="w-24 h-24 rounded-full border-[12px] border-[#4cb791] border-r-[#8ab4f8] border-b-[#fcd9a1] relative flex items-center justify-center">
                                                <div className="w-full h-full rounded-full bg-white"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Card 3: Transactions Today */}
                <Card id="card-recent-transactions" className="p-0 shadow-sm rounded-2xl bg-white border border-[#e2e8f0] overflow-hidden">
                    <CardHeader className="m-0 border-b-0 pb-3 pt-4 px-6 bg-[#f8fafc]">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold text-slate-800">Transactions Today</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs rounded-full px-3 gap-1 border-slate-200 text-slate-700 hover:bg-slate-100"
                                    onClick={() => {
                                        setEditingTransaction(undefined);
                                        setShowForm(true);
                                    }}
                                >
                                    <Plus className="h-3.5 w-3.5" /> Catat
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 text-xs rounded-full px-4 text-slate-600 hover:bg-slate-200" id="btn-view-all-transactions" asChild>
                                    <Link href="/dashboard/transactions">Lihat Semua</Link>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-5">
                        {todayTxLoading && (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full bg-slate-100" />
                                ))}
                            </div>
                        )}
                        {!todayTxLoading && todayTransactions.length === 0 && (
                            <div className="text-center py-6">
                                <p className="text-sm text-slate-500">Belum ada transaksi hari ini</p>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="h-7 text-xs mt-1 text-slate-600"
                                    onClick={() => {
                                        setEditingTransaction(undefined);
                                        setShowForm(true);
                                    }}
                                >
                                    Catat transaksi pertama hari ini →
                                </Button>
                            </div>
                        )}
                        {!todayTxLoading && todayTransactions.length > 0 && (
                            <div className="space-y-0">
                                {todayTransactions.map((tx, i) => {
                                    const isTransfer = !!tx.transfer_pair_id;
                                    const acc = (tx as any).account;
                                    const cat = (tx as any).category;
                                    return (
                                        <div key={tx.id} className={cn('flex items-center gap-4 py-3 group', i !== todayTransactions.length - 1 && 'border-b border-slate-100')}>
                                            <div
                                                className={cn(
                                                    'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                                                    isTransfer ? 'bg-[#eef4ff] text-[#5a8df2]' : tx.type === 'inflow' ? 'bg-[#f0fbf7] text-[#4cb791]' : 'bg-[#fff5f5] text-[#e65c5c]',
                                                )}
                                            >
                                                {isTransfer ? <ArrowLeftRight className="h-4 w-4" /> : tx.type === 'inflow' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0 flex items-center gap-2">
                                                <p className="text-sm font-medium w-1/3 truncate text-slate-800">{tx.notes || cat?.name || '—'}</p>
                                                <p className="text-xs text-slate-500 flex-1 hidden sm:block truncate">
                                                    {cat?.name ? `${cat.name} • ` : ''}
                                                    {acc?.name}
                                                </p>
                                            </div>
                                            <p className={cn('text-sm font-semibold tabular-nums shrink-0', isTransfer ? 'text-[#5a8df2]' : tx.type === 'inflow' ? 'text-[#4cb791]' : 'text-slate-800')}>
                                                {tx.type === 'inflow' ? '+' : '-'}
                                                {formatRupiah(tx.amount, true)}
                                            </p>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-slate-400 hover:text-slate-700 hover:bg-slate-200">
                                                        <span className="sr-only">Menu</span>
                                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                                                            <circle cx="8" cy="3" r="1.5" />
                                                            <circle cx="8" cy="8" r="1.5" />
                                                            <circle cx="8" cy="13" r="1.5" />
                                                        </svg>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl">
                                                    <DropdownMenuItem
                                                        className="cursor-pointer rounded-lg"
                                                        onClick={() => {
                                                            setEditingTransaction(tx);
                                                            setShowForm(true);
                                                        }}
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-lg" onClick={() => handleDeleteTransaction(tx.id)}>
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            <TransactionFormDialog
                open={showForm}
                onOpenChange={(open) => {
                    setShowForm(open);
                    if (!open) setTimeout(() => setEditingTransaction(undefined), 300);
                }}
                transaction={editingTransaction}
                defaultDate={todayStr}
                accounts={accounts}
                categories={categories}
                onSuccess={handleTransactionSubmit}
            />
        </div>
    );
}
