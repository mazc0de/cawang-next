"use client";
import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Landmark, Smartphone, Banknote } from 'lucide-react'
import type { Account } from '@/types/domain'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FieldWrapper } from '@/components/shared/FieldWrapper'
import { formatRupiah } from '@/lib/utils'

const formSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  type: z.enum(['bank', 'e_wallet', 'cash']),
  opening_balance: z.number().min(0, 'Opening Balance tidak boleh negatif'),
})

type FormValues = z.infer<typeof formSchema>

interface AccountFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: Account | null
  onSuccess: (data: FormValues) => void
}

export function AccountFormDialog({ open, onOpenChange, account, onSuccess }: AccountFormDialogProps) {
  const isEdit = !!account

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', type: 'bank', opening_balance: 0 },
  })

  const typeValue = watch('type')

  useEffect(() => {
    if (open) {
      reset(account
        ? { name: account.name, type: account.type, opening_balance: account.opening_balance }
        : { name: '', type: 'bank', opening_balance: 0 }
      )
    }
  }, [open, account, reset])

  const onSubmit = (data: FormValues) => {
    onSuccess(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="account-form-dialog">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Account' : 'Tambah Account'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Ubah informasi Account Anda.' : 'Tambahkan Account baru untuk mencatat transaksi.'}
          </DialogDescription>
        </DialogHeader>

        <form id="account-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldWrapper label="Nama Account" error={errors.name?.message} htmlFor="input-account-name">
            <Input
              id="input-account-name"
              placeholder="Mis. BCA Tabungan, GoPay, Dompet"
              {...register('name')}
            />
          </FieldWrapper>

          <FieldWrapper label="Tipe Account" error={errors.type?.message} htmlFor="select-account-type">
            <Select value={typeValue} onValueChange={v => setValue('type', v as FormValues['type'])}>
              <SelectTrigger id="select-account-type">
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4" /> Bank
                  </div>
                </SelectItem>
                <SelectItem value="e_wallet">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" /> E-Wallet
                  </div>
                </SelectItem>
                <SelectItem value="cash">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" /> Tunai
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </FieldWrapper>

          <FieldWrapper
            label="Opening Balance"
            error={errors.opening_balance?.message}
            description={isEdit ? 'Opening Balance tidak dapat diubah. Gunakan Reconciliation jika saldo tidak sesuai.' : 'Saldo awal Account saat pertama kali dibuat.'}
            htmlFor="input-opening-balance"
          >
            {isEdit ? (
              <Input
                id="input-opening-balance-readonly"
                disabled
                value={formatRupiah(account?.opening_balance ?? 0)}
                className="bg-muted"
              />
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                <Controller
                  name="opening_balance"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      id="input-opening-balance"
                      customInput={Input}
                      className="pl-9"
                      placeholder="0"
                      thousandSeparator="."
                      decimalSeparator=","
                      value={field.value ?? ''}
                      onValueChange={(values) => field.onChange(values.floatValue ?? 0)}
                      onBlur={field.onBlur}
                      min={0}
                    />
                  )}
                />
              </div>
            )}
          </FieldWrapper>

          <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3">
            <button
              id="btn-cancel-account"
              type="button"
              className="btn-neubrutalism bg-white text-ink px-5 py-2 text-xs font-space-grotesk"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </button>
            <button
              id="btn-submit-account"
              type="submit"
              className="btn-neubrutalism bg-hot-pink text-white px-5 py-2 text-xs font-space-grotesk"
            >
              Simpan
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
