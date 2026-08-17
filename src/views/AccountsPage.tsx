"use client";
import { useState, useMemo } from "react";
import { Plus, Wallet } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
} from "@/hooks/useAccounts";
import type { AccountWithBalance } from "@/hooks/useAccounts";
import { AccountCard } from "@/components/accounts/AccountCard";
import { AccountFormDialog } from "@/components/accounts/AccountFormDialog";
import { ReconciliationDialog } from "@/components/accounts/ReconciliationDialog";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";

export function AccountsPage() {
  const { data: accounts = [], isLoading } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();
  const createTransaction = useCreateTransaction();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReconOpen, setIsReconOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<AccountWithBalance | null>(null);

  const totalNetWorth = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + acc.actual_balance, 0);
  }, [accounts]);

  const bankCount = accounts.filter((a) => a.type === "bank").length;
  const ewalletCount = accounts.filter((a) => a.type === "e_wallet").length;
  const cashCount = accounts.filter((a) => a.type === "cash").length;

  // Find or create an "Adjustment" category for reconciliation
  const adjustmentCategory =
    categories.find((c) => c.name === "Penyesuaian Saldo") ?? categories[0];

  const handleCreate = () => {
    setSelectedAccount(null);
    setIsFormOpen(true);
  };

  const handleEdit = (account: AccountWithBalance) => {
    setSelectedAccount(account);
    setIsFormOpen(true);
  };

  const handleDelete = async (account: AccountWithBalance) => {
    if (
      !confirm(
        `Hapus Akun "${account.name}"? Semua transaksi terkait akan ikut terhapus.`,
      )
    )
      return;
    await deleteAccount.mutateAsync(account.id);
  };

  const handleReconcile = (account: AccountWithBalance) => {
    setSelectedAccount(account);
    setIsReconOpen(true);
  };

  const handleFormSuccess = async (data: {
    name: string;
    type: "bank" | "e_wallet" | "cash";
    opening_balance: number;
  }) => {
    if (selectedAccount) {
      await updateAccount.mutateAsync({
        id: selectedAccount.id,
        name: data.name,
        type: data.type,
      });
    } else {
      await createAccount.mutateAsync({
        name: data.name,
        type: data.type,
        opening_balance: data.opening_balance,
      });
    }
  };

  const handleReconcileSuccess = async (result: {
    selisih: number;
    type: "inflow" | "outflow";
  }) => {
    if (!selectedAccount || !adjustmentCategory) return;
    await createTransaction.mutateAsync({
      account_id: selectedAccount.id,
      category_id: adjustmentCategory.id,
      amount: result.selisih,
      type: result.type,
      date: new Date().toISOString().split("T")[0],
      notes: `Adjustment Transaction — Reconciliation`,
      is_adjustment: true,
      transfer_pair_id: null,
    });
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto w-full">
      {/* 1. TOP SUMMARY & ACTION ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Net Worth Card */}
        <div className="card-neubrutalism bg-white p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform md:col-span-2">
          <div className="w-12 h-12 rounded-[14px] bg-hot-pink border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
            <Wallet className="h-6 w-6 text-ink" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">
              Total Saldo Semua Akun (Net Worth)
            </p>
            <p className="font-archivo-black text-2xl sm:text-3xl text-ink tracking-tight truncate mt-0.5">
              {formatRupiah(totalNetWorth)}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-mint border-2 border-ink font-space-mono text-[11px] font-bold text-ink shadow-[2px_2px_0px_0px_#111]">
              {bankCount} Bank
            </span>
            <span className="px-2.5 py-1 rounded-full bg-lilac border-2 border-ink font-space-mono text-[11px] font-bold text-ink shadow-[2px_2px_0px_0px_#111]">
              {ewalletCount} E-Wallet
            </span>
            <span className="px-2.5 py-1 rounded-full bg-canary border-2 border-ink font-space-mono text-[11px] font-bold text-ink shadow-[2px_2px_0px_0px_#111]">
              {cashCount} Tunai
            </span>
          </div>
        </div>

        {/* Action Button Card */}
        <div className="card-neubrutalism bg-canary p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-archivo-black text-lg text-ink leading-tight">
              Akun Baru?
            </p>
            <p className="font-space-grotesk font-medium text-xs text-ink/70 mt-0.5">
              Tambah bank atau dompet digital
            </p>
          </div>
          <button
            id="btn-add-account"
            onClick={handleCreate}
            className="btn-neubrutalism bg-hot-pink text-white px-4 py-2.5 text-xs font-space-grotesk font-bold flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" strokeWidth={3} />
            Tambah Akun
          </button>
        </div>
      </div>

      {/* 2. ACCOUNTS GRID & CONTENT */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="font-archivo-black text-xl text-ink">
              Daftar Akun & Dompet
            </h2>
            {!isLoading && (
              <span className="px-3 py-0.5 rounded-full bg-white border-2 border-ink font-space-mono text-xs font-bold text-ink shadow-[2px_2px_0px_0px_#111]">
                {accounts.length} Akun
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 w-full bg-canvas animate-pulse rounded-[18px] border-2 border-ink/10"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && accounts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-[18px] bg-canvas border-2 border-dashed border-ink/20">
            <div className="w-16 h-16 rounded-[16px] bg-lilac border-2 border-ink shadow-hard-sm flex items-center justify-center mb-4">
              <Wallet className="h-8 w-8 text-ink" strokeWidth={2.5} />
            </div>
            <h3 className="font-archivo-black text-lg text-ink">
              Belum Ada Akun
            </h3>
            <p className="font-space-grotesk text-sm text-ink/70 max-w-sm mt-1 mb-6">
              Tambahkan akun rekening bank, e-wallet, atau kas tunai pertama
              Anda untuk mulai mencatat keuangan.
            </p>
            <button
              id="btn-add-first-account"
              onClick={handleCreate}
              className="btn-neubrutalism bg-hot-pink text-white px-6 py-2.5 text-sm font-space-grotesk flex items-center gap-2"
            >
              <Plus className="h-4 w-4" strokeWidth={3} />
              Tambah Akun Pertama
            </button>
          </div>
        )}

        {/* Accounts Grid */}
        {!isLoading && accounts.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReconcile={handleReconcile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AccountFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        account={selectedAccount}
        onSuccess={handleFormSuccess}
      />

      <ReconciliationDialog
        open={isReconOpen}
        onOpenChange={setIsReconOpen}
        account={selectedAccount}
        onSuccess={handleReconcileSuccess}
      />
    </div>
  );
}
