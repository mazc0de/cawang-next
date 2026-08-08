"use client";
import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { NumericFormat } from 'react-number-format'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { FieldWrapper } from '@/components/shared/FieldWrapper'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/types/domain'
import { CategoryIcon } from '@/components/shared/CategoryIcon'

const transactionSchema = z.object({
  type: z.enum(['inflow', 'outflow', 'transfer']),
  account_id: z.string().min(1, 'Pilih Account'),
  to_account_id: z.string().optional(),
  category_id: z.string().optional(),
  amount: z.number().min(1, 'Jumlah minimal Rp 1'),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  notes: z.string().optional(),
  tag_ids: z.array(z.string()).optional(),
}).refine(data => {
  if (data.type !== 'transfer' && !data.category_id) return false
  if (data.type === 'transfer' && !data.to_account_id) return false
  return true
}, { message: 'Data tidak lengkap' })

export type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction & { tags?: Array<{ id: string; name: string }> }
  defaultType?: 'inflow' | 'outflow' | 'transfer'
  defaultDate?: string
  onSuccess?: (data?: TransactionFormData) => void
  accounts?: Array<{ id: string; name: string; type: string }>
  categories?: Array<{ id: string; name: string; icon?: string; type: 'inflow' | 'outflow' }>
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  defaultType = 'outflow',
  defaultDate,
  onSuccess,
  accounts = [],
  categories = [],
}: TransactionFormDialogProps) {
  const isEdit = !!transaction
  const initialDate = defaultDate || format(new Date(), 'yyyy-MM-dd')

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType,
      account_id: '',
      to_account_id: '',
      category_id: '',
      amount: 0,
      date: initialDate,
      notes: '',
      tag_ids: [],
    },
  })


  useEffect(() => {
    if (open && transaction) {
      const type = transaction.transfer_pair_id ? 'transfer' : (transaction.type as 'inflow' | 'outflow')
      reset({
        type,
        amount: transaction.amount,
        date: transaction.date.substring(0, 10),
        account_id: transaction.account_id,
        category_id: transaction.category_id || '',
        notes: transaction.notes || '',
        tag_ids: [],
      })
    } else if (open) {
      reset({
        type: defaultType,
        amount: 0,
        date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
        account_id: '',
        to_account_id: '',
        category_id: '',
        notes: '',
        tag_ids: [],
      })
    }
  }, [open, transaction, reset, defaultType, defaultDate])

  const type = watch('type')
  const accountId = watch('account_id')
  const filteredCategories = categories.filter(c => c.type === type)

  const onSubmit = (data: TransactionFormData) => {
    if (onSuccess) onSuccess(data)
    onOpenChange(false)
  }

  const typeColorClass = type === 'inflow' ? 'text-income' : type === 'outflow' ? 'text-expense' : 'text-blue-500'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" id="transaction-form-dialog">
        <DialogHeader>
          <DialogTitle id="dialog-title">
            {isEdit ? 'Edit Transaction' : 'Transaksi Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="transaction-form">
          {/* Type selector — only for new transactions */}
          {!isEdit && (
            <Tabs value={type} onValueChange={v => setValue('type', v as TransactionFormData['type'])} id="tabs-type">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="outflow" id="tab-outflow" className="data-[state=active]:text-expense">
                  Pengeluaran
                </TabsTrigger>
                <TabsTrigger value="inflow" id="tab-inflow" className="data-[state=active]:text-income">
                  Pemasukan
                </TabsTrigger>
                <TabsTrigger value="transfer" id="tab-transfer" className="data-[state=active]:text-blue-500">
                  Transfer
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Amount — large and colored */}
          <FieldWrapper label="Jumlah (Rp)" error={errors.amount?.message} htmlFor="input-amount">
            <div className="relative">
              <span className={cn('absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium', typeColorClass)}>Rp</span>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    id="input-amount"
                    customInput={Input}
                    className={cn('pl-9 text-xl font-bold h-14', typeColorClass)}
                    placeholder="0"
                    thousandSeparator="."
                    decimalSeparator=","
                    value={field.value ?? ''}
                    onValueChange={(values) => field.onChange(values.floatValue ?? 0)}
                    onBlur={field.onBlur}
                    min={1}
                  />
                )}
              />
            </div>
          </FieldWrapper>

          {/* Date */}
          <FieldWrapper label="Tanggal" error={errors.date?.message} htmlFor="input-date">
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <DatePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => {
                    if (date) {
                      field.onChange(format(date, 'yyyy-MM-dd'))
                    } else {
                      field.onChange('')
                    }
                  }}
                />
              )}
            />
          </FieldWrapper>

          {/* From account */}
          <FieldWrapper label={type === 'transfer' ? 'Dari Account' : 'Account'} error={errors.account_id?.message} htmlFor="select-account">
            <Select value={accountId} onValueChange={v => setValue('account_id', v)}>
              <SelectTrigger id="select-account">
                <SelectValue placeholder="Pilih Account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrapper>

          {/* To account — only for transfer */}
          {type === 'transfer' && (
            <FieldWrapper label="Ke Account" error={errors.to_account_id?.message} htmlFor="select-to-account">
              <Select onValueChange={v => setValue('to_account_id', v)}>
                <SelectTrigger id="select-to-account">
                  <SelectValue placeholder="Pilih Account Tujuan" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.filter(a => a.id !== accountId).map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldWrapper>
          )}

          {/* Category — hidden for transfer */}
          {type !== 'transfer' && (
            <FieldWrapper label="Category" error={errors.category_id?.message} htmlFor="select-category">
              <Select onValueChange={v => setValue('category_id', v)}>
                <SelectTrigger id="select-category">
                  <SelectValue placeholder="Pilih Category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <CategoryIcon icon={cat.icon} className="h-4 w-4" /> 
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                  {filteredCategories.length === 0 && (
                    <SelectItem value="_none" disabled>Tidak ada kategori tersedia</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </FieldWrapper>
          )}

          {/* Notes */}
          <FieldWrapper label="Notes (opsional)" htmlFor="input-notes">
            <Input id="input-notes" placeholder="Keterangan singkat" {...register('notes')} />
          </FieldWrapper>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" id="btn-cancel" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" id="btn-submit">Simpan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
