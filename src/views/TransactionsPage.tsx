"use client";
import { useState, useMemo } from 'react';
import { Plus, ArrowLeftRight, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
;
;
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatRupiah, formatDateShort, cn } from '@/lib/utils';
import { format, addDays, subDays } from 'date-fns';
import { useTransactions, useDeleteTransaction, useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { TransactionFormDialog } from '@/components/transactions/TransactionFormDialog';
import type { TransactionFormData } from '@/components/transactions/TransactionFormDialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

export function TransactionsPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [filterAccount, setFilterAccount] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<any>(undefined);

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const filters = {
        ...(filterAccount !== 'all' && { account_id: filterAccount }),
        ...(filterCategory !== 'all' && { category_id: filterCategory }),
        start_date: dateStr,
        end_date: dateStr,
    };

    const { data: transactions = [], isLoading } = useTransactions(filters);
    const { data: accounts = [] } = useAccounts();
    const { data: categories = [] } = useCategories();
    const createTransaction = useCreateTransaction();
    const updateTransaction = useUpdateTransaction();
    const deleteTransaction = useDeleteTransaction();

    const handleSubmit = async (data?: TransactionFormData) => {
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
                queryClient.invalidateQueries({ queryKey: ['transactions', user.id] });
                queryClient.invalidateQueries({ queryKey: ['accounts', user.id] });
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
                        notes: data.notes || `Transfer ke ${accounts.find((a) => a.id === data.to_account_id)?.name}`,
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
                        notes: data.notes || `Transfer dari ${accounts.find((a) => a.id === data.account_id)?.name}`,
                        is_adjustment: false,
                        transfer_pair_id: tx1.id,
                    },
                ])
                .select()
                .single();

            if (tx2) {
                await supabase.from('transactions').update({ transfer_pair_id: tx2.id }).eq('id', tx1.id);
            }

            queryClient.invalidateQueries({ queryKey: ['transactions', user.id] });
            queryClient.invalidateQueries({ queryKey: ['accounts', user.id] });
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

    
    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => {
            const timeA = new Date(a.created_at || a.date).getTime();
            const timeB = new Date(b.created_at || b.date).getTime();
            return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
        });
    }, [transactions, sortOrder]);

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus transaksi ini?')) return;
        await deleteTransaction.mutateAsync(id);
    };

    return (
        <div className="flex flex-col min-h-svh bg-[#f2fafa] dark:bg-background">


            <main className="flex-1 p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
            <DashboardHeader title="Transaksi">
                <div className="ml-auto flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white rounded-full border border-slate-200 p-1 shadow-sm">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-slate-500 hover:text-slate-800" onClick={() => setSelectedDate(prev => subDays(prev, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs rounded-full px-3 text-slate-600 hover:text-slate-900" onClick={() => setSelectedDate(new Date())}>
                            Hari Ini
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-slate-500 hover:text-slate-800" onClick={() => setSelectedDate(prev => addDays(prev, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button
                        size="sm"
                        id="btn-add-transaction"
                        className="gap-1.5 h-9 bg-[#8ab4f8] hover:bg-[#739ce3] text-white rounded-full px-5 shadow-none"
                        onClick={() => setShowForm(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Transaksi
                    </Button>
                </div>
            </DashboardHeader>
                {/* Filter bar - Menggunakan style rounded-full dan bg-white */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={filterAccount} onValueChange={setFilterAccount}>
                            <SelectTrigger id="filter-account" className="h-9 w-40 text-xs rounded-full bg-white border-slate-200 text-slate-700 shadow-sm">
                                <SelectValue placeholder="Semua Account" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Semua Account</SelectItem>
                                {accounts.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger id="filter-category" className="h-9 w-40 text-xs rounded-full bg-white border-slate-200 text-slate-700 shadow-sm">
                                <SelectValue placeholder="Semua Kategori" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input
                            id="filter-date"
                            type="date"
                            value={format(selectedDate, 'yyyy-MM-dd')}
                            onChange={(e) => {
                                if (e.target.value) setSelectedDate(new Date(e.target.value));
                            }}
                            className="h-9 w-36 text-xs rounded-full bg-white border-slate-200 text-slate-700 shadow-sm px-4"
                        />

                        {(filterAccount !== 'all' || filterCategory !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                id="btn-reset-filter"
                                className="h-9 text-xs text-slate-500 hover:text-slate-800 rounded-full px-4"
                                onClick={() => {
                                    setFilterAccount('all');
                                    setFilterCategory('all');
                                    setSelectedDate(new Date());
                                }}
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Urutkan:</span>
                        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
                            <SelectTrigger className="h-9 w-36 text-xs rounded-full bg-white border-slate-200 text-slate-700 shadow-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="asc">Terlama Dulu</SelectItem>
                                <SelectItem value="desc">Terbaru Dulu</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {!isLoading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                                <TrendingDown className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500">Total Pengeluaran</p>
                                <p className="text-lg font-bold text-slate-800">{formatRupiah(sortedTransactions.filter(tx => tx.type === 'outflow' && !tx.is_adjustment && !tx.transfer_pair_id).reduce((sum, tx) => sum + tx.amount, 0))}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500">Total Pemasukan</p>
                                <p className="text-lg font-bold text-slate-800">{formatRupiah(sortedTransactions.filter(tx => tx.type === 'inflow' && !tx.is_adjustment && !tx.transfer_pair_id).reduce((sum, tx) => sum + tx.amount, 0))}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-16 rounded-2xl bg-white/60" />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && sortedTransactions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <div className="h-16 w-16 rounded-2xl bg-[#eef4ff] flex items-center justify-center">
                            <ArrowLeftRight className="h-8 w-8 text-[#5a8df2]" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-slate-800">Belum ada Transaksi</h3>
                            <p className="text-sm text-slate-500 mt-1">{Object.keys(filters).length > 0 ? 'Tidak ada transaksi yang cocok dengan filter ini.' : 'Catat transaksi pertama Anda — pemasukan, pengeluaran, atau transfer.'}</p>
                        </div>
                        {Object.keys(filters).length === 0 && (
                            <Button id="btn-add-first-transaction" onClick={() => setShowForm(true)} className="gap-1.5 mt-2 bg-[#8ab4f8] hover:bg-[#739ce3] text-white rounded-full px-6 shadow-none">
                                <Plus className="h-4 w-4" />
                                Tambah Transaksi
                            </Button>
                        )}
                    </div>
                )}

                {/* Transaction list - Container disesuaikan menjadi card putih dengan border abu-abu lembut */}
                {!isLoading && sortedTransactions.length > 0 && (
                    <div className="space-y-0 rounded-2xl border border-[#e2e8f0] bg-white shadow-sm overflow-hidden">
                        {sortedTransactions.map((tx, i) => {
                            const isTransfer = !!tx.transfer_pair_id;
                            const acc = (tx as any).account;
                            const cat = (tx as any).category;

                            return (
                                <div key={tx.id} id={`tx-row-${tx.id}`} className={cn('flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group', i !== 0 && 'border-t border-slate-100')}>
                                    {/* Icon pastel */}
                                    <div
                                        className={cn(
                                            'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                                            isTransfer ? 'bg-[#eef4ff] text-[#5a8df2]' : tx.type === 'inflow' ? 'bg-[#f0fbf7] text-[#4cb791]' : 'bg-[#fff5f5] text-[#e65c5c]',
                                        )}
                                    >
                                        {isTransfer ? <ArrowLeftRight className="h-4 w-4" /> : tx.type === 'inflow' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                    </div>

                                    {/* Description */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{tx.notes || cat?.name || '—'}</p>
                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                            {cat?.name && tx.notes ? `${cat.name} · ` : ''}
                                            {acc?.name} · {formatDateShort(tx.date)}
                                            {isTransfer && (
                                                <Badge variant="outline" className="ml-2 text-[9px] h-4 px-1.5 rounded-md border-[#a7c5f9] text-[#5a8df2] bg-[#eef4ff]/50">
                                                    Transfer
                                                </Badge>
                                            )}
                                            {tx.is_adjustment && (
                                                <Badge variant="outline" className="ml-2 text-[9px] h-4 px-1.5 rounded-md border-slate-200 text-slate-500">
                                                    Adjustment
                                                </Badge>
                                            )}
                                        </p>
                                    </div>

                                    {/* Amount */}
                                    <p className={cn('font-bold text-sm tabular-nums shrink-0', isTransfer ? 'text-[#5a8df2]' : tx.type === 'inflow' ? 'text-[#4cb791]' : 'text-slate-800')}>
                                        {tx.type === 'inflow' ? '+' : '-'}
                                        {formatRupiah(tx.amount, true)}
                                    </p>

                                    {/* Actions */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                id={`btn-tx-menu-${tx.id}`}
                                                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                                            >
                                                <span className="sr-only">Menu</span>
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                                                    <circle cx="8" cy="3" r="1.5" />
                                                    <circle cx="8" cy="8" r="1.5" />
                                                    <circle cx="8" cy="13" r="1.5" />
                                                </svg>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                            <DropdownMenuItem className="cursor-pointer rounded-lg" onClick={() => {
                                                setEditingTransaction(tx);
                                                setShowForm(true);
                                            }}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem id={`btn-delete-tx-${tx.id}`} className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-lg" onClick={() => handleDelete(tx.id)}>
                                                Hapus
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!isLoading && sortedTransactions.length > 0 && <p className="text-xs text-slate-500 text-center pb-4">Menampilkan {sortedTransactions.length} transaksi</p>}
            </main>

            <TransactionFormDialog 
                open={showForm} 
                onOpenChange={(open) => {
                    setShowForm(open);
                    if (!open) setTimeout(() => setEditingTransaction(undefined), 300);
                }} 
                transaction={editingTransaction}
                accounts={accounts} 
                categories={categories} 
                onSuccess={handleSubmit} 
            />
        </div>
    );
}
