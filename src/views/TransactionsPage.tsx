"use client";
import { useState, useMemo } from "react";
import {
  Plus,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Filter,
  RotateCcw,
  Search,
  X,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRupiah, formatDate, cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import {
  useTransactions,
  useDeleteTransaction,
  useCreateTransaction,
  useUpdateTransaction,
} from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { TransactionFormDialog } from "@/components/transactions/TransactionFormDialog";
import type { TransactionFormData } from "@/components/transactions/TransactionFormDialog";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useTransactionsContext } from "@/contexts/TransactionsContext";
import type { Transaction } from "@/types/domain";

interface DateGroup {
  dateStr: string;
  dateObj: Date;
  formattedDate: string;
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
}

export function TransactionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const txContext = useTransactionsContext();
  const [localDate, setLocalDate] = useState<Date>(new Date());
  const [localShowForm, setLocalShowForm] = useState(false);
  const [localEditingTransaction, setLocalEditingTransaction] = useState<
    Transaction | undefined
  >(undefined);

  const selectedDate = txContext?.selectedDate ?? localDate;
  const setSelectedDate = txContext?.setSelectedDate ?? setLocalDate;
  const showForm = txContext?.showForm ?? localShowForm;
  const setShowForm = txContext?.setShowForm ?? setLocalShowForm;
  const editingTransaction = (txContext?.editingTransaction ??
    localEditingTransaction) as Transaction | undefined;
  const setEditingTransaction =
    txContext?.setEditingTransaction ?? setLocalEditingTransaction;

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<
    "all" | "inflow" | "outflow" | "transfer"
  >("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const isSearching = searchQuery.trim().length > 0;
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  // Server-side filters: when NOT searching, restrict date to selectedDateStr on the server (Supabase)
  const serverFilters = useMemo(() => {
    return {
      ...(filterAccount !== "all" && { account_id: filterAccount }),
      ...(filterCategory !== "all" && { category_id: filterCategory }),
      ...(filterType === "inflow" || filterType === "outflow"
        ? { type: filterType }
        : {}),
      ...(!isSearching && {
        start_date: selectedDateStr,
        end_date: selectedDateStr,
      }),
    };
  }, [filterAccount, filterCategory, filterType, isSearching, selectedDateStr]);

  // Fetch transactions with server-side filtering
  const { data: transactions = [], isLoading } = useTransactions(serverFilters);
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return;
    await deleteTransaction.mutateAsync(id);
  };

  // Filter transactions:
  // By default (not searching): only show transactions for today / selectedDate
  // When searching: search across ALL transactions history and match search query
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Filter account
      if (filterAccount !== "all" && tx.account_id !== filterAccount) {
        return false;
      }

      // Filter category
      if (filterCategory !== "all" && tx.category_id !== filterCategory) {
        return false;
      }

      // Filter type
      if (
        filterType === "inflow" &&
        (tx.type !== "inflow" || tx.transfer_pair_id)
      )
        return false;
      if (
        filterType === "outflow" &&
        (tx.type !== "outflow" || tx.transfer_pair_id)
      )
        return false;
      if (filterType === "transfer" && !tx.transfer_pair_id) return false;

      // Date filtering:
      // If NOT searching -> strictly show selected date (default: today)
      // If searching -> search across all dates!
      if (!isSearching) {
        if (tx.date !== selectedDateStr) {
          return false;
        }
      }

      // Search query matching (active when searching)
      if (isSearching) {
        const query = searchQuery.toLowerCase().trim();
        const notes = (tx.notes || "").toLowerCase();
        const catName = (tx.category?.name || "").toLowerCase();
        const accName = (tx.account?.name || "").toLowerCase();
        const amountStr = tx.amount.toString();
        const formattedAmt = formatRupiah(tx.amount).toLowerCase();
        const tags = (tx.tags || []).map((t) => t.name.toLowerCase()).join(" ");
        const typeStr = tx.transfer_pair_id
          ? "transfer"
          : tx.type === "inflow"
            ? "pemasukan income inflow"
            : "pengeluaran expense outflow";

        const matches =
          notes.includes(query) ||
          catName.includes(query) ||
          accName.includes(query) ||
          amountStr.includes(query) ||
          formattedAmt.includes(query) ||
          tags.includes(query) ||
          typeStr.includes(query);

        if (!matches) return false;
      }

      return true;
    });
  }, [
    transactions,
    filterAccount,
    filterCategory,
    filterType,
    isSearching,
    selectedDateStr,
    searchQuery,
  ]);

  // Group filtered transactions by date (each date gets its own card/section)
  const dateGroups = useMemo(() => {
    const groupsMap = new Map<string, Transaction[]>();

    filteredTransactions.forEach((tx) => {
      const d = tx.date;
      if (!groupsMap.has(d)) {
        groupsMap.set(d, []);
      }
      groupsMap.get(d)!.push(tx);
    });

    const sortedDates = Array.from(groupsMap.keys()).sort((a, b) => {
      const timeA = new Date(a + "T00:00:00").getTime();
      const timeB = new Date(b + "T00:00:00").getTime();
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });

    return sortedDates.map((dateStr): DateGroup => {
      const txs = groupsMap.get(dateStr)!;
      const sortedTxs = [...txs].sort((a, b) => {
        const timeA = new Date(a.created_at || a.date).getTime();
        const timeB = new Date(b.created_at || b.date).getTime();
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      });

      const income = sortedTxs
        .filter(
          (tx) =>
            tx.type === "inflow" && !tx.is_adjustment && !tx.transfer_pair_id,
        )
        .reduce((sum, tx) => sum + tx.amount, 0);

      const expense = sortedTxs
        .filter(
          (tx) =>
            tx.type === "outflow" && !tx.is_adjustment && !tx.transfer_pair_id,
        )
        .reduce((sum, tx) => sum + tx.amount, 0);

      const dateObj = new Date(dateStr + "T00:00:00");

      return {
        dateStr,
        dateObj,
        formattedDate: formatDate(dateObj, "EEEE, d MMMM yyyy"),
        transactions: sortedTxs,
        totalIncome: income,
        totalExpense: expense,
        netAmount: income - expense,
      };
    });
  }, [filteredTransactions, sortOrder]);

  // Summary calculations based on current filtered transactions
  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter(
        (tx) =>
          tx.type === "outflow" && !tx.is_adjustment && !tx.transfer_pair_id,
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter(
        (tx) =>
          tx.type === "inflow" && !tx.is_adjustment && !tx.transfer_pair_id,
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const netAmount = totalIncome - totalExpense;

  const hasActiveFilters =
    filterAccount !== "all" ||
    filterCategory !== "all" ||
    filterType !== "all" ||
    isSearching;

  const resetFilters = () => {
    setFilterAccount("all");
    setFilterCategory("all");
    setFilterType("all");
    setSearchQuery("");
    setSelectedDate(new Date());
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto w-full">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card-neubrutalism bg-white p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 rounded-[14px] bg-coral border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
            <TrendingDown className="h-6 w-6 text-ink" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">
              {isSearching
                ? "Total Pengeluaran (Pencarian)"
                : "Pengeluaran Hari Ini"}
            </p>
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
            <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">
              {isSearching
                ? "Total Pemasukan (Pencarian)"
                : "Pemasukan Hari Ini"}
            </p>
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
            <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">
              Selisih Bersih
            </p>
            <p
              className={cn(
                "font-archivo-black text-2xl tracking-tight truncate mt-0.5",
                netAmount >= 0 ? "text-ink" : "text-coral",
              )}
            >
              {netAmount >= 0 ? "+" : ""}
              {formatRupiah(netAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-[18px] bg-white border-2 border-ink shadow-hard-sm space-y-4">
        {/* Search Bar Input */}
        <div className="relative w-full">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/60"
            strokeWidth={2.5}
          />
          <Input
            id="search-transactions"
            type="text"
            placeholder="Cari transaksi di seluruh riwayat (catatan, kategori, akun, nominal, tag)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-11 h-12 bg-canvas/70 border-2 border-ink rounded-[14px] text-sm sm:text-base font-space-grotesk font-medium placeholder:text-ink/45 focus-visible:bg-white shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] transition-all"
          />
          {searchQuery && (
            <button
              id="btn-clear-search"
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white border border-ink flex items-center justify-center hover:bg-coral hover:text-white text-ink transition-colors cursor-pointer"
              title="Hapus pencarian"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Filters & Sorting Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-ink/10">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 mr-1">
              <Filter className="h-4 w-4 text-ink shrink-0" strokeWidth={2.5} />
              <span className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink">
                Filter:
              </span>
            </div>

            {/* Account Filter */}
            <Select value={filterAccount} onValueChange={setFilterAccount}>
              <SelectTrigger
                id="filter-account"
                className="h-9 w-[calc(50%-6px)] sm:w-40 text-xs font-space-grotesk font-bold"
              >
                <SelectValue placeholder="Semua Akun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Akun</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger
                id="filter-category"
                className="h-9 w-[calc(50%-6px)] sm:w-40 text-xs font-space-grotesk font-bold"
              >
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
              value={filterType}
              onValueChange={(v) =>
                setFilterType(v as "all" | "inflow" | "outflow" | "transfer")
              }
            >
              <SelectTrigger
                id="filter-type"
                className="h-9 w-[calc(50%-6px)] sm:w-36 text-xs font-space-grotesk font-bold"
              >
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="outflow">Pengeluaran</SelectItem>
                <SelectItem value="inflow">Pemasukan</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Picker (Active when not searching) */}
            {!isSearching && (
              <Input
                id="filter-date"
                type="date"
                value={selectedDateStr}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(new Date(e.target.value));
                  }
                }}
                className="h-9 w-[calc(50%-6px)] sm:w-38 text-xs font-space-mono font-bold"
              />
            )}

            {/* Reset Filter Button */}
            {hasActiveFilters && (
              <button
                id="btn-reset-filter"
                className="btn-neubrutalism bg-canary text-xs px-3 py-1.5 text-ink flex items-center gap-1.5 h-9"
                onClick={resetFilters}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">
              Urutkan:
            </span>
            <Select
              value={sortOrder}
              onValueChange={(v) => setSortOrder(v as "asc" | "desc")}
            >
              <SelectTrigger className="h-9 w-36 text-xs font-space-grotesk font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Terbaru Dulu</SelectItem>
                <SelectItem value="asc">Terlama Dulu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active search query feedback banner */}
        {isSearching && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-[12px] bg-canvas border border-ink/30">
            <div className="flex items-center gap-2 text-xs font-space-grotesk text-ink">
              <Sparkles className="h-4 w-4 text-hot-pink shrink-0" />
              <span>
                Menampilkan pencarian:{" "}
                <strong className="font-bold">&quot;{searchQuery}&quot;</strong>{" "}
                ({filteredTransactions.length} transaksi di {dateGroups.length}{" "}
                tanggal)
              </span>
            </div>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-space-grotesk font-bold text-hot-pink hover:underline cursor-pointer flex items-center gap-1 shrink-0"
            >
              <X className="h-3.5 w-3.5" />
              Kembali ke Hari Ini
            </button>
          </div>
        )}
      </div>

      {/* Transactions Section - Grouped by Date */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-3">
            <h2 className="font-archivo-black text-xl text-ink">
              {isSearching ? "Hasil Pencarian Transaksi" : "Daftar Transaksi"}
            </h2>
            {!isLoading && (
              <span className="px-3 py-0.5 rounded-full bg-canary border-2 border-ink font-space-mono text-xs font-bold text-ink shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]">
                {filteredTransactions.length} transaksi
              </span>
            )}
          </div>

          {!isLoading && isSearching && dateGroups.length > 0 && (
            <span className="text-xs font-space-grotesk font-bold text-ink/60">
              {dateGroups.length} hari
            </span>
          )}
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="card-neubrutalism bg-white p-5 space-y-3 animate-pulse"
              >
                <div className="h-6 w-48 bg-canvas rounded-md border border-ink/20" />
                <div className="space-y-2 pt-2">
                  <div className="h-16 w-full bg-canvas/60 rounded-xl border border-ink/10" />
                  <div className="h-16 w-full bg-canvas/60 rounded-xl border border-ink/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredTransactions.length === 0 && (
          <div className="card-neubrutalism bg-white p-8">
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-[16px] bg-canvas border-2 border-dashed border-ink/20">
              <div className="w-16 h-16 rounded-[16px] bg-lilac border-2 border-ink shadow-hard-sm flex items-center justify-center mb-4">
                {isSearching ? (
                  <Search className="h-8 w-8 text-ink" strokeWidth={2.5} />
                ) : (
                  <ArrowLeftRight
                    className="h-8 w-8 text-ink"
                    strokeWidth={2.5}
                  />
                )}
              </div>
              <h3 className="font-archivo-black text-lg text-ink">
                {isSearching
                  ? "Transaksi Tidak Ditemukan"
                  : "Belum Ada Transaksi Hari Ini"}
              </h3>
              <p className="font-space-grotesk text-sm text-ink/70 max-w-sm mt-1 mb-6">
                {isSearching
                  ? `Tidak ada transaksi yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci lain atau reset filter.`
                  : hasActiveFilters
                    ? "Tidak ada transaksi hari ini yang cocok dengan filter yang dipilih."
                    : "Belum ada transaksi tercatat untuk hari ini. Mulai catat transaksi baru Anda!"}
              </p>
              {isSearching ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="btn-neubrutalism bg-canary text-ink px-5 py-2.5 text-sm font-space-grotesk flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Kembali ke Transaksi Hari Ini
                </button>
              ) : (
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
              )}
            </div>
          </div>
        )}

        {/* Date Grouped Cards / Sections */}
        {!isLoading && dateGroups.length > 0 && (
          <div className="space-y-5">
            {dateGroups.map((group) => {
              const isGroupToday = isToday(group.dateObj);
              const isGroupYesterday = isYesterday(group.dateObj);

              return (
                <div
                  key={group.dateStr}
                  id={`date-group-${group.dateStr}`}
                  className="card-neubrutalism bg-white overflow-hidden group hover:shadow-hard-lg transition-all"
                >
                  {/* Date Group Section Header */}
                  <div className="bg-canvas border-b-2  px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[10px] bg-canary border-2 border-ink shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] flex items-center justify-center shrink-0">
                        <CalendarDays
                          className="h-4 w-4 text-ink"
                          strokeWidth={2.5}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-archivo-black text-base sm:text-lg text-ink">
                            {group.formattedDate}
                          </h3>
                          {isGroupToday && (
                            <span className="px-2.5 py-0.5 rounded-full bg-mint border border-ink font-space-mono text-[10px] font-bold text-ink shadow-[1px_1px_0px_0px_rgba(17,17,17,1)]">
                              Hari Ini
                            </span>
                          )}
                          {isGroupYesterday && (
                            <span className="px-2.5 py-0.5 rounded-full bg-lilac border border-ink font-space-mono text-[10px] font-bold text-ink shadow-[1px_1px_0px_0px_rgba(17,17,17,1)]">
                              Kemarin
                            </span>
                          )}
                        </div>
                        <p className="font-space-mono text-xs text-ink/60 font-medium">
                          {group.transactions.length} transaksi
                        </p>
                      </div>
                    </div>

                    {/* Group Daily Summary */}
                    <div className="flex flex-wrap items-center gap-2">
                      {group.totalIncome > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-mint/30 border border-ink font-space-mono text-xs font-bold text-ink shadow-[1px_1px_0px_0px_rgba(17,17,17,1)]">
                          <TrendingUp
                            className="h-3 w-3 text-ink"
                            strokeWidth={2.5}
                          />
                          +{formatRupiah(group.totalIncome, true)}
                        </span>
                      )}
                      {group.totalExpense > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-coral/30 border border-ink font-space-mono text-xs font-bold text-ink shadow-[1px_1px_0px_0px_rgba(17,17,17,1)]">
                          <TrendingDown
                            className="h-3 w-3 text-ink"
                            strokeWidth={2.5}
                          />
                          -{formatRupiah(group.totalExpense, true)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* List of Transactions in This Date Group */}
                  <div className="p-3 sm:p-4 space-y-2.5">
                    {group.transactions.map((tx) => {
                      const isTransfer = !!tx.transfer_pair_id;
                      const isIncome = tx.type === "inflow";
                      const acc = tx.account;
                      const cat = tx.category;
                      const tags = tx.tags;

                      return (
                        <div
                          key={tx.id}
                          id={`tx-row-${tx.id}`}
                          className="p-3.5 sm:p-4 rounded-[14px] bg-white border-2 border-ink shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:shadow-hard-sm hover:-translate-y-0.5 transition-all flex items-center justify-between gap-3 sm:gap-4 group/row"
                        >
                          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                            <div
                              className={cn(
                                "w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] border-2 border-ink flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]",
                                isTransfer
                                  ? "bg-canary"
                                  : isIncome
                                    ? "bg-mint"
                                    : "bg-coral",
                              )}
                            >
                              {isTransfer ? (
                                <span className="font-bold text-sm text-ink">
                                  ⇄
                                </span>
                              ) : cat?.icon ? (
                                <CategoryIcon
                                  icon={cat.icon}
                                  className="h-5 w-5 text-ink"
                                />
                              ) : isIncome ? (
                                <TrendingUp
                                  className="h-5 w-5 text-ink"
                                  strokeWidth={2.5}
                                />
                              ) : (
                                <TrendingDown
                                  className="h-5 w-5 text-ink"
                                  strokeWidth={2.5}
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-space-grotesk font-bold text-sm sm:text-base text-ink truncate leading-tight">
                                {tx.notes || cat?.name || "—"}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                {cat?.name && (
                                  <span className="font-space-mono text-xs text-ink/80 font-semibold">
                                    {cat.name} ·
                                  </span>
                                )}
                                <span className="font-space-mono text-xs text-ink/70">
                                  {acc?.name || "Akun"}
                                </span>

                                {isTransfer && (
                                  <span className="ml-1 px-2 py-0.2 rounded-full bg-canary border border-ink font-space-mono text-[9px] font-bold text-ink">
                                    Transfer
                                  </span>
                                )}
                                {tx.is_adjustment && (
                                  <span className="ml-1 px-2 py-0.2 rounded-full bg-canvas border border-ink font-space-mono text-[9px] font-bold text-ink/70">
                                    Penyesuaian
                                  </span>
                                )}

                                {/* Transaction tags */}
                                {tags && tags.length > 0 && (
                                  <div className="flex items-center gap-1 ml-1">
                                    {tags.map((t) => (
                                      <span
                                        key={t.id}
                                        className="px-1.5 py-0.2 rounded-md bg-lilac/30 border border-ink/40 font-space-mono text-[9px] font-semibold text-ink"
                                      >
                                        #{t.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                            <span
                              className={cn(
                                "hidden md:inline-flex items-center justify-center px-3 py-1 rounded-full border-2 border-ink font-space-grotesk font-bold text-[10px] text-ink uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]",
                                isTransfer
                                  ? "bg-canary"
                                  : isIncome
                                    ? "bg-mint"
                                    : "bg-coral",
                              )}
                            >
                              {isTransfer
                                ? "Transfer"
                                : isIncome
                                  ? "Pemasukan"
                                  : "Pengeluaran"}
                            </span>

                            <p
                              className={cn(
                                "font-space-mono font-bold text-sm sm:text-base md:text-lg tabular-nums",
                                isIncome
                                  ? "text-mint font-extrabold"
                                  : "text-ink",
                              )}
                            >
                              {isIncome ? "+" : "-"}
                              {formatRupiah(tx.amount, true)}
                            </p>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  id={`btn-tx-menu-${tx.id}`}
                                  className="h-8 w-8 rounded-full border border-transparent hover:border-ink hover:bg-canvas flex items-center justify-center transition-all text-ink cursor-pointer"
                                >
                                  <span className="sr-only">Menu</span>
                                  <span className="font-bold text-base leading-none">
                                    ⋯
                                  </span>
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="rounded-[16px] border-2 border-ink shadow-hard-md bg-white p-2"
                              >
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
