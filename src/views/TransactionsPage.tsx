"use client";
import { useState, useMemo } from 'react';
import { Plus, ArrowLeftRight, TrendingUp, TrendingDown, Filter, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatRupiah, formatDateShort, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useTransactions, useDeleteTransaction, useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { TransactionFormDialog } from '@/components/transactions/TransactionFormDialog';
import type { TransactionFormData } from '@/components/transactions/TransactionFormDialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

import { useTransactionsContext } from '@/contexts/TransactionsContext';

export function TransactionsPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const txContext = useTransactionsContext();
    const [localDate, setLocalDate] = useState<Date>(new Date());
    const [localShowForm, setLocalShowForm] = useState(false);
    const [localEditingTransaction, setLocalEditingTransaction] = useState<any>(undefined);

    const selectedDate = txContext?.selectedDate ?? localDate;
    const setSelectedDate = txContext?.setSelectedDate ?? setLocalDate;
    const showForm = txContext?.showForm ?? localShowForm;
    const setShowForm = txContext?.setShowForm ?? setLocalShowForm;
    const editingTransaction = txContext?.editingTransaction ?? localEditingTransaction;
    const setEditingTransaction = txContext?.setEditingTransaction ?? setLocalEditingTransaction;

    const [filterAccount, setFilterAccount] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

    const totalExpense = useMemo(() => {
        return sortedTransactions
            .filter((tx) => tx.type === 'outflow' && !tx.is_adjustment && !tx.transfer_pair_id)
            .reduce((sum, tx) => sum + tx.amount, 0);
    }, [sortedTransactions]);

    const totalIncome = useMemo(() => {
        return sortedTransactions
            .filter((tx) => tx.type === 'inflow' && !tx.is_adjustment && !tx.transfer_pair_id)
            .reduce((sum, tx) => sum + tx.amount, 0);
    }, [sortedTransactions]);

    const netAmount = totalIncome - totalExpense;

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus transaksi ini?')) return;
        await deleteTransaction.mutateAsync(id);
    };

    const hasActiveFilters = filterAccount !== 'all' || filterCategory !== 'all';

    return (
        <div className="space-y-6 pb-12 max-w-7xl mx-auto w-full">

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="card-neubrutalism bg-white p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 rounded-[14px] bg-coral border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
                        <TrendingDown className="h-6 w-6 text-ink" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                        <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">Total Pengeluaran</p>
                        <p className="font-archivo-black text-2xl text-ink tracking-tight truncate mt-0.5">
                            {formatRupiah(totalExpense)}
                        </p>
                    </div>
                </div>

                <div className="card-neubrutalism bg-white p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 rounded-[14px] bg-mint border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
                        <TrendingUp className="h-6 w-6 text-ink" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                        <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">Total Pemasukan</p>
                        <p className="font-archivo-black text-2xl text-ink tracking-tight truncate mt-0.5">
                            {formatRupiah(totalIncome)}
                        </p>
                    </div>
                </div>

                <div className="card-neubrutalism bg-white p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 rounded-[14px] bg-lilac border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
                        <ArrowLeftRight className="h-6 w-6 text-ink" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                        <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">Selisih Bersih</p>
                        <p className={cn("font-archivo-black text-2xl tracking-tight truncate mt-0.5", netAmount >= 0 ? "text-ink" : "text-coral")}>
                            {netAmount >= 0 ? '+' : ''}{formatRupiah(netAmount)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-5 rounded-[18px] bg-white border-2 border-ink shadow-hard-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-ink shrink-0" strokeWidth={2.5} />
                        <span className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink">Filter:</span>
                    </div>

                    <Select value={filterAccount} onValueChange={setFilterAccount}>
                        <SelectTrigger id="filter-account" className="h-10 w-44 text-xs font-space-grotesk font-bold">
                            <SelectValue placeholder="Semua Account" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Account</SelectItem>
                            {accounts.map((a) => (
                                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger id="filter-category" className="h-10 w-44 text-xs font-space-grotesk font-bold">
                            <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>
                        <SelectContent>
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
                        className="h-10 w-40 text-xs font-space-mono font-bold"
                    />

                    {hasActiveFilters && (
                        <button
                            id="btn-reset-filter"
                            className="btn-neubrutalism bg-canary text-xs px-3.5 py-2 text-ink flex items-center gap-1.5"
                            onClick={() => {
                                setFilterAccount('all');
                                setFilterCategory('all');
                                setSelectedDate(new Date());
                            }}
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">Urutkan:</span>
                    <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
                        <SelectTrigger className="h-10 w-36 text-xs font-space-grotesk font-bold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="desc">Terbaru Dulu</SelectItem>
                            <SelectItem value="asc">Terlama Dulu</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="card-neubrutalism bg-white p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="font-archivo-black text-xl text-ink">Daftar Transaksi</h2>
                        {!isLoading && (
                            <span className="px-3 py-0.5 rounded-full bg-canary border-2 border-ink font-space-mono text-xs font-bold text-ink shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]">
                                {sortedTransactions.length} transaksi
                            </span>
                        )}
                    </div>
                </div>

                {isLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-16 w-full bg-canvas animate-pulse rounded-[14px] border-2 border-ink/10" />
                        ))}
                    </div>
                )}

                {!isLoading && sortedTransactions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-[16px] bg-canvas border-2 border-dashed border-ink/20">
                        <div className="w-16 h-16 rounded-[16px] bg-lilac border-2 border-ink shadow-hard-sm flex items-center justify-center mb-4">
                            <ArrowLeftRight className="h-8 w-8 text-ink" strokeWidth={2.5} />
                        </div>
                        <h3 className="font-archivo-black text-lg text-ink">Belum Ada Transaksi</h3>
                        <p className="font-space-grotesk text-sm text-ink/70 max-w-sm mt-1 mb-6">
                            {hasActiveFilters
                                ? 'Tidak ada transaksi yang cocok dengan filter yang dipilih.'
                                : 'Belum ada transaksi tercatat untuk tanggal ini. Mulai catat transaksi baru Anda!'}
                        </p>
                        <button
                            id="btn-add-first-transaction"
                            onClick={() => {
                                setEditingTransaction(undefined);
                                setShowForm(true);
                            }}
                            className="btn-neubrutalism bg-hot-pink text-white px-6 py-2.5 text-sm font-space-grotesk flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" strokeWidth={3} />
                            Catat Transaksi Pertama
                        </button>
                    </div>
                )}

                {!isLoading && sortedTransactions.length > 0 && (
                    <div className="space-y-3">
                        {sortedTransactions.map((tx) => {
                            const isTransfer = !!tx.transfer_pair_id;
                            const isIncome = tx.type === 'inflow';
                            const acc = (tx as any).account;
                            const cat = (tx as any).category;

                            return (
                                <div
                                    key={tx.id}
                                    id={`tx-row-${tx.id}`}
                                    className="p-4 rounded-[14px] bg-white border-2 border-ink shadow-hard-sm hover:shadow-hard-md hover:-translate-y-0.5 transition-all flex items-center justify-between gap-4 group"
                                >
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div
                                            className={cn(
                                                'w-11 h-11 rounded-[12px] border-2 border-ink flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]',
                                                isTransfer ? 'bg-canary' : isIncome ? 'bg-mint' : 'bg-coral'
                                            )}
                                        >
                                            {isTransfer ? (
                                                <span className="font-bold text-sm text-ink">⇄</span>
                                            ) : isIncome ? (
                                                <TrendingUp className="h-5 w-5 text-ink" strokeWidth={2.5} />
                                            ) : (
                                                <TrendingDown className="h-5 w-5 text-ink" strokeWidth={2.5} />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="font-space-grotesk font-bold text-sm sm:text-base text-ink truncate leading-tight">
                                                {tx.notes || cat?.name || '—'}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                {cat?.name && (
                                                    <span className="font-space-mono text-xs text-ink/70 font-semibold">
                                                        {cat.name} ·
                                                    </span>
                                                )}
                                                <span className="font-space-mono text-xs text-ink/70">
                                                    {acc?.name}
                                                </span>
                                                <span className="font-space-mono text-xs text-ink/40">·</span>
                                                <span className="font-space-mono text-xs text-ink/60">
                                                    {formatDateShort(tx.date)}
                                                </span>

                                                {isTransfer && (
                                                    <span className="ml-1 px-2 py-0.5 rounded-full bg-canary border border-ink font-space-mono text-[9px] font-bold text-ink">
                                                        Transfer
                                                    </span>
                                                )}
                                                {tx.is_adjustment && (
                                                    <span className="ml-1 px-2 py-0.5 rounded-full bg-canvas border border-ink font-space-mono text-[9px] font-bold text-ink/70">
                                                        Adjustment
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                                        <span
                                            className={cn(
                                                'hidden sm:inline-flex items-center justify-center px-3 py-1 rounded-full border-2 border-ink font-space-grotesk font-bold text-[10px] text-ink uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]',
                                                isTransfer ? 'bg-canary' : isIncome ? 'bg-mint' : 'bg-coral'
                                            )}
                                        >
                                            {isTransfer ? 'Transfer' : isIncome ? 'Income' : 'Expense'}
                                        </span>

                                        <p
                                            className={cn(
                                                'font-space-mono font-bold text-base sm:text-lg tabular-nums',
                                                isIncome ? 'text-mint font-extrabold' : 'text-ink'
                                            )}
                                        >
                                            {isIncome ? '+' : '-'}{formatRupiah(tx.amount, true)}
                                        </p>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    id={`btn-tx-menu-${tx.id}`}
                                                    className="h-8 w-8 rounded-full border border-transparent hover:border-ink hover:bg-canvas flex items-center justify-center transition-all text-ink cursor-pointer"
                                                >
                                                    <span className="sr-only">Menu</span>
                                                    <span className="font-bold text-base leading-none">⋯</span>
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-[16px] border-2 border-ink shadow-hard-md bg-white p-2">
                                                <DropdownMenuItem
                                                    className="cursor-pointer font-bold text-ink hover:bg-canvas rounded-xl mb-1 px-3 py-2 font-space-grotesk"
                                                    onClick={() => {
                                                        setEditingTransaction(tx);
                                                        setShowForm(true);
                                                    }}
                                                >
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    id={`btn-delete-tx-${tx.id}`}
                                                    className="cursor-pointer font-bold text-coral hover:bg-coral/10 focus:bg-coral/10 focus:text-coral rounded-xl px-3 py-2 font-space-grotesk"
                                                    onClick={() => handleDelete(tx.id)}
                                                >
                                                    Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <TransactionFormDialog
                open={showForm}
                onOpenChange={(open) => {
                    setShowForm(open);
                    if (!open) setTimeout(() => setEditingTransaction(undefined), 300);
                }}
                transaction={editingTransaction}
                defaultDate={format(selectedDate, 'yyyy-MM-dd')}
                accounts={accounts}
                categories={categories}
                onSuccess={handleSubmit}
            />
        </div>
    );
}
