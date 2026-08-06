"use client";
import { useState } from 'react'
import { Plus, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'


import { Skeleton } from '@/components/ui/skeleton'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { formatRupiah } from '@/lib/utils'
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '@/hooks/useAccounts'
import type { AccountWithBalance } from '@/hooks/useAccounts'
import { AccountCard } from '@/components/accounts/AccountCard'
import { AccountFormDialog } from '@/components/accounts/AccountFormDialog'
import { ReconciliationDialog } from '@/components/accounts/ReconciliationDialog'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
export function AccountsPage() {
  const { data: accounts = [], isLoading } = useAccounts()
  const { data: categories = [] } = useCategories()
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const deleteAccount = useDeleteAccount()
  const createTransaction = useCreateTransaction()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isReconOpen, setIsReconOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<AccountWithBalance | null>(null)

  const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.actual_balance, 0)

  // Find or create an "Adjustment" category for reconciliation
  const adjustmentCategory = categories.find(c => c.name === 'Penyesuaian Saldo') ?? categories[0]

  const handleCreate = () => {
    setSelectedAccount(null)
    setIsFormOpen(true)
  }

  const handleEdit = (account: AccountWithBalance) => {
    setSelectedAccount(account)
    setIsFormOpen(true)
  }

  const handleDelete = async (account: AccountWithBalance) => {
    if (!confirm(`Hapus Account "${account.name}"? Semua transaksi terkait akan ikut terhapus.`)) return
    await deleteAccount.mutateAsync(account.id)
  }

  const handleReconcile = (account: AccountWithBalance) => {
    setSelectedAccount(account)
    setIsReconOpen(true)
  }

  const handleFormSuccess = async (data: { name: string; type: 'bank' | 'e_wallet' | 'cash'; opening_balance: number }) => {
    if (selectedAccount) {
      await updateAccount.mutateAsync({ id: selectedAccount.id, name: data.name, type: data.type })
    } else {
      await createAccount.mutateAsync({ name: data.name, type: data.type, opening_balance: data.opening_balance })
    }
  }

  const handleReconcileSuccess = async (result: { selisih: number; type: 'inflow' | 'outflow' }) => {
    if (!selectedAccount || !adjustmentCategory) return
    await createTransaction.mutateAsync({
      account_id: selectedAccount.id,
      category_id: adjustmentCategory.id,
      amount: result.selisih,
      type: result.type,
      date: new Date().toISOString().split('T')[0],
      notes: `Adjustment Transaction — Reconciliation`,
      is_adjustment: true,
      transfer_pair_id: null,
    })
  }

  return (
    <div className="flex flex-col min-h-svh">


      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
      <DashboardHeader title="Account">
        {accounts.length > 0 && (
          <span className="text-xs text-slate-500 ml-2">
            Net Worth: <span className="font-semibold text-slate-800">{formatRupiah(totalNetWorth)}</span>
          </span>
        )}
        <Button size="sm" id="btn-add-account" className="ml-auto gap-1.5 h-9 bg-[#8ab4f8] hover:bg-[#739ce3] text-white rounded-full px-5 shadow-none" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Tambah Account
        </Button>
      </DashboardHeader>
        {/* Loading */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && accounts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Belum ada Account</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tambahkan Account pertama Anda — bank, e-wallet, atau kas tunai.
              </p>
            </div>
            <Button id="btn-add-first-account" onClick={handleCreate} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Tambah Account
            </Button>
          </div>
        )}

        {/* Account grid */}
        {!isLoading && accounts.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map(account => (
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
      </main>

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
  )
}
