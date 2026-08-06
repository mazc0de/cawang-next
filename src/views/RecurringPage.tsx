"use client";
import { useState } from 'react'
import { Plus, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardCard, DashboardCardContent } from '@/components/shared/DashboardCard'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { NumericFormat } from 'react-number-format'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatRupiah, formatDateShort, cn } from '@/lib/utils'
import {
  useRecurringRules,
  usePendingConfirmations,
  useCreateRecurringRule,
  useToggleRecurringRule,
  useDeleteRecurringRule,
  useApproveRecurringRule,
} from '@/hooks/useRecurringRules'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import type { RecurringRule } from '@/types/domain'
import { CategoryIcon } from '@/components/shared/CategoryIcon'

const FREQ_LABEL: Record<string, string> = {
  daily: 'Harian', weekly: 'Mingguan', monthly: 'Bulanan', yearly: 'Tahunan',
}

function RuleCard({ rule, onApprove, onToggle, onDelete }: {
  rule: RecurringRule
  onApprove?: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  const isPending = rule.posting_mode === 'requires_confirmation' &&
    new Date(rule.next_due_date) <= new Date() && rule.is_active

  const cat = (rule as any).category
  const acc = (rule as any).account

  return (
    <DashboardCard id={`card-rule-${rule.id}`} className={cn('transition-all', !rule.is_active && 'opacity-50', isPending && 'border-yellow-400/50 bg-yellow-50/30 dark:bg-yellow-900/10')}>
      <DashboardCardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-lg', rule.type === 'inflow' ? 'bg-[#f0fbf7] text-[#4cb791]' : 'bg-[#fff5f5] text-[#e65c5c]')}>
            <CategoryIcon icon={cat?.icon} defaultEmoji={rule.type === 'inflow' ? '💰' : '💸'} className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm leading-tight text-slate-800">{rule.description || cat?.name || '—'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{acc?.name} · {cat?.name}</p>
              </div>
              <p className={cn('font-bold text-sm tabular-nums shrink-0', rule.type === 'inflow' ? 'text-[#4cb791]' : 'text-[#e65c5c]')}>
                {rule.type === 'inflow' ? '+' : '-'}{formatRupiah(rule.amount, true)}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-slate-200 text-slate-600 rounded-md bg-white">{FREQ_LABEL[rule.frequency]}</Badge>
              <Badge variant={rule.posting_mode === 'auto_post' ? 'secondary' : 'outline'} className={cn("text-[10px] h-4 px-1.5 rounded-md", rule.posting_mode === 'auto_post' ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "border-slate-200 text-slate-600 bg-white")}>
                {rule.posting_mode === 'auto_post' ? '⚡ Auto' : '⏳ Konfirmasi'}
              </Badge>
              <span className="text-xs font-medium text-slate-500 ml-auto">Jatuh tempo: {formatDateShort(rule.next_due_date)}</span>
            </div>

            {isPending && onApprove && (
              <Button
                size="sm"
                id={`btn-approve-${rule.id}`}
                className="mt-3 h-8 text-xs gap-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full w-full sm:w-auto"
                onClick={onApprove}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Konfirmasi Sekarang
              </Button>
            )}

            <div className="flex gap-1.5 mt-3">
              <Button
                variant="ghost"
                size="sm"
                id={`btn-toggle-${rule.id}`}
                className="h-7 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full px-3"
                onClick={onToggle}
              >
                {rule.is_active ? 'Nonaktifkan' : 'Aktifkan'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                id={`btn-delete-rule-${rule.id}`}
                className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full px-3"
                onClick={onDelete}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      </DashboardCardContent>
    </DashboardCard>
  )
}

export function RecurringPage() {
  const { data: allRules = [], isLoading } = useRecurringRules()
  const { data: pending = [] } = usePendingConfirmations()
  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const createRule = useCreateRecurringRule()
  const toggleRule = useToggleRecurringRule()
  const deleteRule = useDeleteRecurringRule()
  const approveRule = useApproveRecurringRule()

  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<'inflow' | 'outflow'>('outflow')
  const [formAccountId, setFormAccountId] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formFrequency, setFormFrequency] = useState<'monthly' | 'weekly' | 'daily' | 'yearly'>('monthly')
  const [formMode, setFormMode] = useState<'auto_post' | 'requires_confirmation'>('requires_confirmation')
  const [formNextDue, setFormNextDue] = useState('')
  const [formDescription, setFormDescription] = useState('')

  const activeRules = allRules.filter(r => r.is_active)
  const inactiveRules = allRules.filter(r => !r.is_active)

  const filteredCategories = categories.filter(c => c.type === formType)

  const handleSave = async () => {
    if (!formAccountId || !formCategoryId || !formAmount || !formNextDue) return
    await createRule.mutateAsync({
      account_id: formAccountId,
      category_id: formCategoryId,
      amount: Number(formAmount),
      type: formType,
      frequency: formFrequency,
      posting_mode: formMode,
      next_due_date: formNextDue,
      description: formDescription,
      is_active: true,
    })
    setShowForm(false)
    setFormAccountId(''); setFormCategoryId(''); setFormAmount(''); setFormNextDue(''); setFormDescription('')
  }

  return (
    <div className="flex flex-col min-h-svh">


      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <DashboardHeader title="Recurring Rule">
        {pending.length > 0 && (
          <Badge className="gap-1 bg-yellow-500 hover:bg-yellow-500 text-white ml-1" id="badge-pending-rules">
            <AlertCircle className="h-3 w-3" />
            {pending.length} Pending
          </Badge>
        )}
        <Button size="sm" id="btn-add-rule" className="ml-auto gap-1.5 h-9 bg-[#8ab4f8] hover:bg-[#739ce3] text-white rounded-full px-5 shadow-none" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Tambah Rule
        </Button>
      </DashboardHeader>
        {isLoading && <div className="space-y-3">{[1,2,3].map(i=><Skeleton key={i} className="h-28 rounded-xl"/>)}</div>}

        {/* Pending Confirmation banner */}
        {!isLoading && pending.length > 0 && (
          <div className="rounded-lg border border-yellow-400/50 bg-yellow-50/50 dark:bg-yellow-900/10 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="font-medium text-sm text-yellow-800 dark:text-yellow-400">
                {pending.length} Pending Confirmation perlu persetujuan
              </p>
            </div>
            <div className="space-y-2">
              {pending.map((p: any) => {
                const rule = p.recurring_rule
                return (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    onApprove={() => approveRule.mutate(rule)}
                    onToggle={() => toggleRule.mutate({ id: rule.id, is_active: !rule.is_active })}
                    onDelete={() => { if (confirm('Hapus rule ini?')) deleteRule.mutate(rule.id) }}
                  />
                )
              })}
            </div>
          </div>
        )}

        {!isLoading && allRules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Belum ada Recurring Rule</h3>
              <p className="text-sm text-muted-foreground mt-1">Buat template untuk transaksi berulang seperti gaji, tagihan, atau cicilan.</p>
            </div>
            <Button id="btn-add-first-rule" onClick={() => setShowForm(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Tambah Recurring Rule
            </Button>
          </div>
        )}

        {!isLoading && allRules.length > 0 && (
          <Tabs defaultValue="active" id="recurring-tabs">
            <TabsList>
              <TabsTrigger value="active" id="tab-active-rules">Aktif ({activeRules.length})</TabsTrigger>
              <TabsTrigger value="inactive" id="tab-inactive-rules">Nonaktif ({inactiveRules.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-4 space-y-3">
              {activeRules.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-10">Tidak ada Recurring Rule aktif</p>
                : activeRules.map(rule => (
                    <RuleCard
                      key={rule.id} rule={rule}
                      onApprove={rule.posting_mode === 'requires_confirmation' ? () => approveRule.mutate(rule) : undefined}
                      onToggle={() => toggleRule.mutate({ id: rule.id, is_active: false })}
                      onDelete={() => { if (confirm('Hapus rule ini?')) deleteRule.mutate(rule.id) }}
                    />
                  ))
              }
            </TabsContent>
            <TabsContent value="inactive" className="mt-4 space-y-3">
              {inactiveRules.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-10">Tidak ada Recurring Rule nonaktif</p>
                : inactiveRules.map(rule => (
                    <RuleCard
                      key={rule.id} rule={rule}
                      onToggle={() => toggleRule.mutate({ id: rule.id, is_active: true })}
                      onDelete={() => { if (confirm('Hapus rule ini?')) deleteRule.mutate(rule.id) }}
                    />
                  ))
              }
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Add Rule Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent id="add-rule-dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Recurring Rule</DialogTitle>
            <DialogDescription>Buat template jadwal transaksi berulang</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="rule-description">Deskripsi</Label>
              <Input id="rule-description" placeholder="Misal: Gaji Bulanan, Spotify, Cicilan" value={formDescription} onChange={e => setFormDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rule-type">Tipe</Label>
                <Select value={formType} onValueChange={v => { setFormType(v as typeof formType); setFormCategoryId('') }}>
                  <SelectTrigger id="rule-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inflow">Pemasukan</SelectItem>
                    <SelectItem value="outflow">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rule-frequency">Frekuensi</Label>
                <Select value={formFrequency} onValueChange={v => setFormFrequency(v as typeof formFrequency)}>
                  <SelectTrigger id="rule-frequency"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Harian</SelectItem>
                    <SelectItem value="weekly">Mingguan</SelectItem>
                    <SelectItem value="monthly">Bulanan</SelectItem>
                    <SelectItem value="yearly">Tahunan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rule-account">Account</Label>
              <Select value={formAccountId} onValueChange={setFormAccountId}>
                <SelectTrigger id="rule-account"><SelectValue placeholder="Pilih Account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rule-category">Category</Label>
              <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                <SelectTrigger id="rule-category"><SelectValue placeholder="Pilih Category" /></SelectTrigger>
                <SelectContent>
                  {filteredCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <CategoryIcon icon={c.icon} className="h-4 w-4" />
                        <span>{c.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rule-amount">Jumlah</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                <NumericFormat
                    id="rule-amount"
                    customInput={Input}
                    value={formAmount ? formAmount : ''}
                    onValueChange={(values) => setFormAmount(String(values.floatValue ?? ''))}
                    className="pl-9"
                    placeholder="0"
                    thousandSeparator="."
                    decimalSeparator=","
                    min={1}
                  />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rule-mode">Mode Posting</Label>
              <Select value={formMode} onValueChange={v => setFormMode(v as typeof formMode)}>
                <SelectTrigger id="rule-mode"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto_post">⚡ Auto-post (otomatis dibuat)</SelectItem>
                  <SelectItem value="requires_confirmation">⏳ Requires Confirmation (perlu approve)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rule-next-due">Jatuh Tempo Pertama</Label>
              <Input id="rule-next-due" type="date" value={formNextDue} onChange={e => setFormNextDue(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button
              id="btn-save-rule"
              disabled={!formAccountId || !formCategoryId || !formAmount || !formNextDue || createRule.isPending}
              onClick={handleSave}
            >
              {createRule.isPending ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
