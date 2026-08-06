"use client";
import { useEffect, useState } from 'react'
import { formatRupiah, cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumericFormat } from 'react-number-format'
import type { AccountWithBalance } from './AccountCard'

interface ReconciliationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: AccountWithBalance | null
  onSuccess: (data: { selisih: number; type: 'inflow' | 'outflow' }) => void
}

export function ReconciliationDialog({ open, onOpenChange, account, onSuccess }: ReconciliationDialogProps) {
  const [realBalance, setRealBalance] = useState('')

  useEffect(() => {
    if (open && account) {
      setRealBalance(String(account.actual_balance))
    }
  }, [open, account])

  if (!account) return null

  const realBalanceNum = Number(realBalance) || 0
  const selisih = realBalanceNum - account.actual_balance

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selisih !== 0) {
      onSuccess({ selisih: Math.abs(selisih), type: selisih > 0 ? 'inflow' : 'outflow' })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="reconciliation-dialog">
        <DialogHeader>
          <DialogTitle>Reconciliation: {account.name}</DialogTitle>
          <DialogDescription>
            Sesuaikan saldo di aplikasi dengan saldo aktual di bank atau e-wallet Anda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-col gap-1 p-3 bg-muted rounded-md">
            <span className="text-sm font-medium text-muted-foreground">Saldo Tercatat Saat Ini</span>
            <span className="text-xl font-bold">{formatRupiah(account.actual_balance)}</span>
          </div>

          <form id="reconciliation-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="input-actual-balance" className="text-sm font-medium">
                Saldo Aktual (Sebenarnya)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                <NumericFormat
                  id="input-actual-balance"
                  customInput={Input}
                  className="pl-9"
                  placeholder="0"
                  thousandSeparator="."
                  decimalSeparator=","
                  value={realBalance ? realBalance : ''}
                  onValueChange={(values) => setRealBalance(String(values.floatValue || 0))}
                  min={0}
                />
              </div>
              <p className="text-xs text-muted-foreground">Masukkan jumlah saldo riil saat ini.</p>
            </div>

            <div className="pt-1">
              {selisih === 0 ? (
                <p className="text-sm text-muted-foreground font-medium flex items-center justify-center p-3 bg-muted/50 rounded-md border border-dashed">
                  Saldo sudah sesuai, tidak perlu reconciliation.
                </p>
              ) : (
                <div className="p-3 bg-muted/50 rounded-md border border-dashed space-y-1">
                  <span className="text-sm text-muted-foreground">Selisih yang akan disesuaikan:</span>
                  <p className={cn('text-lg font-bold', selisih > 0 ? 'text-income' : 'text-expense')}>
                    {selisih > 0 ? '+' : ''}{formatRupiah(selisih)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Akan dibuatkan Adjustment Transaction berupa {selisih > 0 ? 'inflow' : 'outflow'}.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button id="btn-cancel-recon" type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button id="btn-submit-recon" type="submit" disabled={selisih === 0}>
                Konfirmasi Penyesuaian
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
