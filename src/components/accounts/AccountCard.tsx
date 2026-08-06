"use client";
import type { Account } from '@/types/domain'
import { formatRupiah } from "@/lib/utils"
import { DashboardCard, DashboardCardHeader, DashboardCardTitle, DashboardCardContent, DashboardCardFooter } from "@/components/shared/DashboardCard"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ArrowRightLeft } from "lucide-react"

export type AccountWithBalance = Account & { actual_balance: number }

interface AccountCardProps {
  account: AccountWithBalance
  onEdit: (account: AccountWithBalance) => void
  onDelete: (account: AccountWithBalance) => void
  onReconcile: (account: AccountWithBalance) => void
}

export function AccountCard({ account, onEdit, onDelete, onReconcile }: AccountCardProps) {
  const typeMap: Record<string, string> = {
    bank: "Bank",
    e_wallet: "E-Wallet",
    cash: "Tunai",
  }

  return (
    <DashboardCard id={`account-card-${account.id}`} theme="blue">
      <DashboardCardHeader theme="blue">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <DashboardCardTitle>{account.name}</DashboardCardTitle>
            <span className="text-xs font-medium text-slate-500">
              {typeMap[account.type] || account.type}
            </span>
          </div>
        </div>
      </DashboardCardHeader>
      <DashboardCardContent>
        <div className="text-2xl font-bold text-slate-900 mt-2">
          {formatRupiah(account.actual_balance)}
        </div>
      </DashboardCardContent>
      <DashboardCardFooter className="flex justify-end gap-2">
        <Button 
          id={`btn-reconcile-${account.id}`}
          variant="outline" 
          size="sm" 
          onClick={() => onReconcile(account)}
          title="Reconciliation"
          className="rounded-full h-8 text-xs bg-white text-[#5a8df2] border-[#a7c5f9] hover:bg-[#eef4ff]"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />
          Reconcile
        </Button>
        <Button 
          id={`btn-edit-${account.id}`}
          variant="ghost" 
          size="icon" 
          onClick={() => onEdit(account)}
          title="Edit"
          className="rounded-full h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button 
          id={`btn-delete-${account.id}`}
          variant="ghost" 
          size="icon" 
          onClick={() => onDelete(account)}
          title="Delete"
          className="rounded-full h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </DashboardCardFooter>
    </DashboardCard>
  )
}
