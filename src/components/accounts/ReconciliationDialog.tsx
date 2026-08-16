"use client";
import { useEffect, useState } from 'react'
import { formatRupiah, cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
          <div className="flex flex-col gap-1 p-3.5 bg-canvas border-2 border-ink rounded-[14px] shadow-hard-sm">
            <span className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink/70">Saldo Tercatat Saat Ini</span>
            <span className="text-2xl font-archivo-black text-ink">{formatRupiah(account.actual_balance)}</span>
          </div>

          <form id="reconciliation-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="input-actual-balance" className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink">
                Saldo Aktual (Sebenarnya)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-space-mono font-bold text-ink/60">Rp</span>
                <NumericFormat
                  id="input-actual-balance"
                  customInput={Input}
                  className="pl-9 font-space-mono font-bold text-sm"
                  placeholder="0"
                  thousandSeparator="."
                  decimalSeparator=","
                  value={realBalance ? realBalance : ''}
                  onValueChange={(values) => setRealBalance(String(values.floatValue || 0))}
                  min={0}
                />
              </div>
              <p className="text-[11px] font-space-grotesk text-ink/60">Masukkan jumlah saldo riil saat ini dari m-banking atau aplikasi dompet.</p>
            </div>

            <div className="pt-1">
              {selisih === 0 ? (
                <div className="text-xs font-space-grotesk font-bold text-ink/70 flex items-center justify-center p-3.5 bg-canvas rounded-[14px] border-2 border-dashed border-ink/20">
                  Saldo sudah sesuai, tidak perlu penyesuaian.
                </div>
              ) : (
                <div className="p-3.5 bg-white rounded-[14px] border-2 border-ink shadow-hard-sm space-y-1">
                  <span className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink/70">Selisih yang akan disesuaikan:</span>
                  <p className={cn('text-xl font-archivo-black', selisih > 0 ? 'text-mint' : 'text-coral')}>
                    {selisih > 0 ? '+' : ''}{formatRupiah(selisih)}
                  </p>
                  <p className="text-[11px] font-space-grotesk text-ink/70">
                    Akan dibuatkan transaksi penyesuaian otomatis ({selisih > 0 ? 'Pemasukan / Inflow' : 'Pengeluaran / Outflow'}).
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3">
              <button
                id="btn-cancel-recon"
                type="button"
                className="btn-neubrutalism bg-white text-ink px-5 py-2 text-xs font-space-grotesk"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </button>
              <button
                id="btn-submit-recon"
                type="submit"
                disabled={selisih === 0}
                className="btn-neubrutalism bg-hot-pink text-white px-5 py-2 text-xs font-space-grotesk disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Konfirmasi Penyesuaian
              </button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
