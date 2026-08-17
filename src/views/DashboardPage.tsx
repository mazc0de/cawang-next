"use client";
import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

import {
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRupiah, getCurrentFinancialCycle, cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialCycleConfig } from "@/hooks/useFinancialCycleConfig";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAccounts } from "@/hooks/useAccounts";
import { useBudgets } from "@/hooks/useBudgets";
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/hooks/useTransactions";
import { TransactionFormDialog } from "@/components/transactions/TransactionFormDialog";
import type { TransactionFormData } from "@/components/transactions/TransactionFormDialog";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(undefined);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const { data: cycleConfig } = useFinancialCycleConfig();
  const startDay = cycleConfig?.start_day ?? 1;
  const { startDate: cycleStart, endDate: cycleEnd } =
    getCurrentFinancialCycle(startDay);

  const { data: stats, isLoading: statsLoading } = useDashboardStats(
    cycleStart,
    cycleEnd,
  );
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const { data: todayTransactions = [], isLoading: todayTxLoading } =
    useTransactions({ start_date: todayStr, end_date: todayStr });
  const { data: categories = [] } = useCategories();

  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const cycleYear = cycleStart.getFullYear();
  const cycleMonth = cycleStart.getMonth() + 1;
  const { data: budgets = [] } = useBudgets(cycleYear, cycleMonth);

  const cashFlow =
    (stats?.income_this_cycle ?? 0) - (stats?.expense_this_cycle ?? 0);

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

    if (data.type === "transfer") {
      const { data: tx1 } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            account_id: data.account_id,
            category_id: categories.find((c) => c.type === "outflow")?.id ?? "",
            amount: data.amount,
            type: "outflow",
            date: data.date,
            notes: data.notes,
            is_adjustment: false,
          },
        ])
        .select()
        .single();
      if (!tx1) return;
      const { data: tx2 } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            account_id: data.to_account_id!,
            category_id: categories.find((c) => c.type === "inflow")?.id ?? "",
            amount: data.amount,
            type: "inflow",
            date: data.date,
            notes: data.notes,
            is_adjustment: false,
            transfer_pair_id: tx1.id,
          },
        ])
        .select()
        .single();
      if (tx2)
        await supabase
          .from("transactions")
          .update({ transfer_pair_id: tx2.id })
          .eq("id", tx1.id);
      queryClient.invalidateQueries({ queryKey: ["transactions", user.id] });
      queryClient.invalidateQueries({ queryKey: ["accounts", user.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_stats", user.id] });
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
    if (!confirm("Hapus transaksi ini?")) return;
    await deleteTransaction.mutateAsync(id);
  };

  const totalSpent = budgets.reduce(
    (sum: number, b: any) => sum + (b.spent ?? 0),
    0,
  );
  const totalBudget = budgets.reduce(
    (sum: number, b: any) => sum + (b.amount ?? 0),
    0,
  );
  const budgetProgress =
    totalBudget > 0
      ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100)
      : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* 1. TOP 5 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
        <StatCard
          title="Net Worth"
          value={formatRupiah(stats?.net_worth ?? 0)}
          sub="Total saldo semua Account"
          icon={<Wallet className="h-5 w-5 text-ink" strokeWidth={2.5} />}
          color="bg-hot-pink"
        />
        <StatCard
          title="Pengeluaran Hari Ini"
          value={formatRupiah(stats?.expense_today ?? 0)}
          sub="Total outflow hari ini"
          icon={<ArrowDown className="h-5 w-5 text-ink" strokeWidth={2.5} />}
          color="bg-coral"
        />
        <StatCard
          title="Income Cycle Ini"
          value={formatRupiah(stats?.income_this_cycle ?? 0)}
          sub="Total inflow periode ini"
          icon={<TrendingUp className="h-5 w-5 text-ink" strokeWidth={2.5} />}
          color="bg-mint"
        />
        <StatCard
          title="Pengeluaran Cycle Ini"
          value={formatRupiah(stats?.expense_this_cycle ?? 0)}
          sub="Total outflow periode ini"
          icon={<TrendingDown className="h-5 w-5 text-ink" strokeWidth={2.5} />}
          color="bg-canary"
        />
        <StatCard
          title="Cash Flow"
          value={(cashFlow >= 0 ? "+" : "") + formatRupiah(cashFlow)}
          sub="Income - Pengeluaran"
          icon={
            cashFlow >= 0 ? (
              <TrendingUp className="h-5 w-5 text-ink" strokeWidth={2.5} />
            ) : (
              <TrendingDown className="h-5 w-5 text-ink" strokeWidth={2.5} />
            )
          }
          color="bg-lilac"
        />
      </div>

      {/* 2. MAIN 2-COLUMN: Account Summary & Budget vs Actual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Summary */}
        <div className="card-neubrutalism bg-white p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-archivo-black text-xl text-ink">
                Account Summary
              </h3>
              <Link
                href="/dashboard/accounts"
                className="btn-neubrutalism bg-white px-3.5 py-1.5 text-xs font-space-grotesk text-ink inline-block"
              >
                Kelola
              </Link>
            </div>

            {accountsLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 w-full bg-canvas animate-pulse rounded-xl border-2 border-ink/10"
                  />
                ))}
              </div>
            )}

            {!accountsLoading && accounts.length === 0 && (
              <div className="text-center py-8">
                <p className="font-space-grotesk font-medium text-sm text-ink/60 mb-3">
                  Belum ada Account
                </p>
                <Link
                  href="/dashboard/accounts"
                  className="btn-neubrutalism bg-canary px-4 py-2 text-xs font-space-grotesk inline-block"
                >
                  Tambah Account →
                </Link>
              </div>
            )}

            {!accountsLoading && accounts.length > 0 && (
              <div className="space-y-4">
                {accounts.map((acc, i) => {
                  const colors = [
                    "bg-hot-pink",
                    "bg-canary",
                    "bg-mint",
                    "bg-lilac",
                  ];
                  const color = colors[i % colors.length];
                  const totalActual = accounts.reduce(
                    (sum, a) => sum + (a.actual_balance || 0),
                    0,
                  );
                  const pct =
                    totalActual > 0
                      ? Math.min(
                          100,
                          Math.max(
                            8,
                            Math.round(
                              (acc.actual_balance / totalActual) * 100,
                            ),
                          ),
                        )
                      : 20;

                  return (
                    <div
                      key={acc.id}
                      className="p-3.5 rounded-[14px] bg-white border-2 border-ink shadow-hard-sm hover:-translate-y-0.5 hover:shadow-hard-md transition-all flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-[10px] border-2 border-ink flex items-center justify-center font-archivo-black text-sm text-ink shrink-0 shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]",
                            color,
                          )}
                        >
                          {acc.name[0]?.toUpperCase() ?? "-"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-space-grotesk font-bold text-sm text-ink truncate leading-tight">
                            {acc.name}
                          </p>
                          <div className="w-28 sm:w-36 h-2 mt-1.5 bg-canvas border border-ink rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full border-r border-ink",
                                color,
                              )}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-space-mono font-bold text-sm text-ink">
                          {formatRupiah(acc.actual_balance, true)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Budget vs Actual */}
        <div className="card-neubrutalism bg-white p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-archivo-black text-xl text-ink">
              Budget vs Actual
            </h3>
            <Link
              href="/dashboard/budget"
              className="btn-neubrutalism bg-white px-3.5 py-1.5 text-xs font-space-grotesk text-ink inline-block"
            >
              Atur Budget
            </Link>
          </div>

          {budgets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 min-h-[220px] text-center">
              <p className="font-space-grotesk font-medium text-sm text-ink/60 mb-4">
                Belum ada Budget pada periode ini
              </p>
              <Link
                href="/dashboard/budget"
                className="btn-neubrutalism bg-mint px-5 py-2.5 text-xs font-space-grotesk inline-block"
              >
                Buat Budget →
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Progress Bar */}
              <div className="p-4 rounded-[14px] bg-canvas border-2 border-ink shadow-hard-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-space-grotesk font-bold text-ink">
                  <span>Total Terpakai: {formatRupiah(totalSpent)}</span>
                  <span className="font-space-mono">{budgetProgress}%</span>
                </div>
                <div className="w-full h-4 bg-white border-2 border-ink rounded-full overflow-hidden p-0.5 shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]">
                  <div
                    className={cn(
                      "h-full rounded-full border border-ink transition-all",
                      budgetProgress > 90
                        ? "bg-coral"
                        : budgetProgress > 70
                          ? "bg-canary"
                          : "bg-mint",
                    )}
                    style={{ width: `${budgetProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-space-mono text-ink/70">
                  <span>Budget: {formatRupiah(totalBudget)}</span>
                  <span>
                    Sisa: {formatRupiah(Math.max(0, totalBudget - totalSpent))}
                  </span>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-3">
                <h4 className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">
                  Kategori Utama
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {budgets.slice(0, 4).map((b: any, idx: number) => {
                    const colors = [
                      "bg-hot-pink",
                      "bg-canary",
                      "bg-mint",
                      "bg-lilac",
                    ];
                    const catColor = colors[idx % colors.length];
                    const bSpent = b.spent ?? 0;
                    const bPct =
                      b.amount > 0
                        ? Math.min(100, Math.round((bSpent / b.amount) * 100))
                        : 0;

                    return (
                      <div
                        key={b.id}
                        className="p-3 rounded-[12px] bg-white border-2 border-ink shadow-hard-sm"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={cn(
                                "w-2.5 h-2.5 rounded-full border border-ink shrink-0",
                                catColor,
                              )}
                            />
                            <span className="font-space-grotesk font-bold text-xs text-ink truncate">
                              {b.category?.name ?? "Kategori"}
                            </span>
                          </div>
                          <span className="font-space-mono text-[10px] font-bold text-ink shrink-0">
                            {bPct}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-canvas border border-ink rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full border-r border-ink",
                              catColor,
                            )}
                            style={{ width: `${bPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] font-space-mono text-ink/60">
                          <span>{formatRupiah(bSpent)}</span>
                          <span>/ {formatRupiah(b.amount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. FULL-WIDTH: Transactions Today */}
      <div className="card-neubrutalism bg-white p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="font-archivo-black text-xl text-ink">
              Transactions Today
            </h3>
            <p className="font-space-grotesk text-xs text-ink/60 mt-0.5">
              Daftar transaksi yang tercatat hari ini
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="btn-neubrutalism bg-hot-pink px-4 py-2 text-xs font-space-grotesk text-ink flex items-center gap-1.5"
              onClick={() => {
                setEditingTransaction(undefined);
                setShowForm(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Catat
            </button>
            <Link
              href="/dashboard/transactions"
              className="btn-neubrutalism bg-white px-4 py-2 text-xs font-space-grotesk text-ink inline-block"
            >
              Lihat Semua
            </Link>
          </div>
        </div>

        {todayTxLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 w-full bg-canvas animate-pulse rounded-xl border-2 border-ink/10"
              />
            ))}
          </div>
        )}

        {!todayTxLoading && todayTransactions.length === 0 && (
          <div className="text-center py-10 rounded-[14px] bg-canvas border-2 border-dashed border-ink/20">
            <p className="font-space-grotesk font-medium text-sm text-ink/60 mb-2">
              Belum ada transaksi hari ini
            </p>
            <button
              className="font-space-grotesk font-bold text-xs text-hot-pink hover:underline"
              onClick={() => {
                setEditingTransaction(undefined);
                setShowForm(true);
              }}
            >
              Catat transaksi pertama hari ini →
            </button>
          </div>
        )}

        {!todayTxLoading && todayTransactions.length > 0 && (
          <div className="space-y-3">
            {todayTransactions.map((tx) => {
              const isTransfer = !!tx.transfer_pair_id;
              const isIncome = tx.type === "inflow";
              const acc = (tx as any).account;
              const cat = (tx as any).category;

              return (
                <div
                  key={tx.id}
                  className="p-3.5 sm:p-4 rounded-[14px] bg-white border-2 border-ink shadow-hard-sm hover:shadow-hard-md hover:-translate-y-0.5 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-[12px] border-2 border-ink flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]",
                        isTransfer
                          ? "bg-canary"
                          : isIncome
                            ? "bg-mint"
                            : "bg-coral",
                      )}
                    >
                      {isTransfer ? (
                        <span className="font-bold text-xs text-ink">⇄</span>
                      ) : isIncome ? (
                        <TrendingUp
                          className="h-4 w-4 text-ink"
                          strokeWidth={2.5}
                        />
                      ) : (
                        <ArrowDown
                          className="h-4 w-4 text-ink"
                          strokeWidth={2.5}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-space-grotesk font-bold text-sm text-ink truncate leading-tight">
                        {tx.notes || cat?.name || "—"}
                      </p>
                      <p className="font-space-mono text-xs text-ink/60 truncate mt-0.5">
                        {cat?.name ? `${cat.name} • ` : ""}
                        {acc?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={cn(
                        "hidden sm:inline-flex items-center justify-center px-2.5 py-0.5 rounded-full border border-ink font-space-grotesk font-bold text-[10px] text-ink uppercase tracking-wide",
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
                          ? "Income"
                          : "Expense"}
                    </span>
                    <p
                      className={cn(
                        "font-space-mono font-bold text-sm tabular-nums",
                        isIncome ? "text-mint font-extrabold" : "text-ink",
                      )}
                    >
                      {isIncome ? "+" : "-"}
                      {formatRupiah(tx.amount, true)}
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-8 w-8 rounded-full border border-transparent hover:border-ink hover:bg-canvas flex items-center justify-center transition-all text-ink">
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
                          className="cursor-pointer font-bold text-coral hover:bg-coral/10 focus:bg-coral/10 focus:text-coral rounded-xl px-3 py-2 font-space-grotesk"
                          onClick={() => handleDeleteTransaction(tx.id)}
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
        defaultDate={todayStr}
        accounts={accounts}
        categories={categories}
        onSuccess={handleTransactionSubmit}
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  icon,
  color,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="card-neubrutalism bg-white p-5 flex flex-col justify-between transition-transform hover:-translate-y-1 group">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div
            className={cn(
              "w-10 h-10 rounded-[12px] border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0 group-hover:shadow-hard-md group-hover:-translate-y-[1px] group-hover:-translate-x-[1px] transition-all",
              color,
            )}
          >
            {icon}
          </div>
        </div>
        <div className="font-space-grotesk font-bold text-ink/70 text-xs uppercase tracking-wider mb-1">
          {title}
        </div>
        <div className="font-archivo-black text-2xl text-ink tracking-tight truncate mb-1">
          {value}
        </div>
      </div>
      {sub && (
        <div className="font-space-mono text-[10px] text-ink/60 font-medium truncate mt-2">
          {sub}
        </div>
      )}
    </div>
  );
}
