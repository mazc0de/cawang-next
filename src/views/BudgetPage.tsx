"use client";
import { useState } from 'react'
import { Plus, PieChart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardCard, DashboardCardContent } from '@/components/shared/DashboardCard'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { NumericFormat } from 'react-number-format'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatRupiah, getCurrentFinancialCycle, cn } from '@/lib/utils'
import { useBudgets, useUpsertBudget, useDeleteBudget } from '@/hooks/useBudgets'
import { useCategories } from '@/hooks/useCategories'
import { useFinancialCycleConfig } from '@/hooks/useFinancialCycleConfig'
import { CategoryIcon } from '@/components/shared/CategoryIcon'

const FRAMEWORKS = [
  { id: '50_30_20', label: '50/30/20', desc: 'Kebutuhan 50%, Keinginan 30%, Tabungan 20%' },
  { id: 'zero_based', label: 'Zero-Based Budgeting', desc: 'Setiap rupiah dialokasikan, income = outcome' },
  { id: 'kakeibo', label: 'Kakeibo', desc: 'Metode Jepang: Survive, Optional, Culture, Extra' },
  { id: 'envelope', label: 'Envelope Method', desc: 'Pisahkan uang per kategori amplop' },
]

export function BudgetPage() {
  const { data: cycleConfig } = useFinancialCycleConfig()
  const startDay = cycleConfig?.start_day ?? 1
  const { startDate: cycleStart } = getCurrentFinancialCycle(startDay)
  const cycleYear = cycleStart.getFullYear()
  const cycleMonth = cycleStart.getMonth() + 1

  const { data: budgets = [], isLoading } = useBudgets(cycleYear, cycleMonth)
  const { data: categories = [] } = useCategories('outflow')
  const upsertBudget = useUpsertBudget()
  const deleteBudget = useDeleteBudget()

  const [showWizard, setShowWizard] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editBudget, setEditBudget] = useState<any | null>(null)

  // Add/Edit budget dialog state
  const [addCategoryId, setAddCategoryId] = useState('')
  const [addAmount, setAddAmount] = useState('')

  // Wizard state
  const [wizardStep, setWizardStep] = useState<'framework' | 'income' | 'result'>('framework')
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)
  const [wizardIncome, setWizardIncome] = useState('')

  const totalBudget = budgets.reduce((s: number, b: any) => s + b.amount, 0)
  const totalSpent = budgets.reduce((s: number, b: any) => s + (b.spent ?? 0), 0)
  const totalPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  // Categories not yet budgeted
  const budgetedCategoryIds = new Set(budgets.map((b: any) => b.category_id))
  const unbucketedCategories = categories.filter(c => !budgetedCategoryIds.has(c.id))

  const handleOpenAdd = () => {
    setAddCategoryId('')
    setAddAmount('')
    setEditBudget(null)
    setShowAddDialog(true)
  }

  const handleOpenEdit = (b: any) => {
    setAddCategoryId(b.category_id)
    setAddAmount(String(b.amount))
    setEditBudget(b)
    setShowAddDialog(true)
  }

  const handleSaveBudget = async () => {
    if (!addCategoryId || !addAmount || Number(addAmount) <= 0) return
    await upsertBudget.mutateAsync({
      category_id: addCategoryId,
      amount: Number(addAmount),
      cycle_year: cycleYear,
      cycle_month: cycleMonth,
    })
    setShowAddDialog(false)
  }

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Hapus Budget ini?')) return
    await deleteBudget.mutateAsync(id)
  }

  const resetWizard = () => {
    setWizardStep('framework')
    setSelectedFramework(null)
    setWizardIncome('')
    setShowWizard(false)
  }

  return (
    <div className="flex flex-col min-h-svh">


      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <DashboardHeader title="Budget">
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" id="btn-open-wizard" className="gap-1.5 h-9 rounded-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => setShowWizard(true)}>
            <Sparkles className="h-4 w-4" />
            Budgeting Wizard
          </Button>
          <Button size="sm" id="btn-add-budget" className="gap-1.5 h-9 bg-[#8ab4f8] hover:bg-[#739ce3] text-white rounded-full px-5 shadow-none" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        </div>
      </DashboardHeader>
        {/* Loading */}
        {isLoading && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && budgets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
              <PieChart className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Belum ada Budget</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Gunakan Budgeting Wizard atau tambah Budget per kategori secara manual.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" id="btn-start-wizard" onClick={() => setShowWizard(true)} className="gap-1.5">
                <Sparkles className="h-4 w-4" />
                Budgeting Wizard
              </Button>
              <Button id="btn-add-first-budget" onClick={handleOpenAdd} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Tambah Manual
              </Button>
            </div>
          </div>
        )}

        {!isLoading && budgets.length > 0 && (
          <>
            {/* Overview card */}
            <DashboardCard id="card-budget-overview">
              <DashboardCardContent className="pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Overview cycle ini</div>
                  <span className={cn('text-sm font-semibold', totalPct > 100 ? 'text-red-500' : totalPct > 80 ? 'text-yellow-600' : 'text-[#4cb791]')}>
                    {totalPct}% terpakai
                  </span>
                </div>
                <Progress
                  value={Math.min(totalPct, 100)}
                  className={cn('h-2', totalPct > 100 ? '[&>div]:bg-red-500' : totalPct > 80 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-[#4cb791]')}
                />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-slate-500">Total Budget</p>
                    <p className="text-sm font-semibold text-slate-800">{formatRupiah(totalBudget, true)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Terpakai</p>
                    <p className="text-sm font-semibold text-red-500">{formatRupiah(totalSpent, true)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Sisa</p>
                    <p className={cn('text-sm font-semibold', totalBudget - totalSpent < 0 ? 'text-red-500' : 'text-[#4cb791]')}>
                      {formatRupiah(totalBudget - totalSpent, true)}
                    </p>
                  </div>
                </div>
              </DashboardCardContent>
            </DashboardCard>

            {/* Budget grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {budgets.map((b: any) => {
                const spent = b.spent ?? 0
                const pct = b.amount > 0 ? Math.min(Math.round((spent / b.amount) * 100), 100) : 0
                const over = spent > b.amount
                return (
                  <DashboardCard
                    key={b.id}
                    id={`card-budget-${b.id}`}
                    className={cn('cursor-pointer hover:shadow-md hover:border-slate-300 transition-all group bg-white', over && 'border-red-200')}
                    onClick={() => handleOpenEdit(b)}
                  >
                    <DashboardCardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CategoryIcon icon={b.category?.icon} defaultEmoji="📦" className="h-5 w-5" />
                          <span className="font-semibold text-sm text-slate-800">{b.category?.name ?? '—'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {over && <Badge variant="destructive" className="text-[10px] h-4 px-1.5 bg-red-100 text-red-600 hover:bg-red-200 border-none">Over</Badge>}
                          <Button
                            variant="ghost"
                            size="icon"
                            id={`btn-delete-budget-${b.id}`}
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
                            onClick={e => { e.stopPropagation(); handleDeleteBudget(b.id) }}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                      <Progress
                        value={pct}
                        className={cn('h-1.5 bg-slate-100', over ? '[&>div]:bg-red-500' : pct > 80 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-[#4cb791]')}
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className={over ? 'text-red-500 font-medium' : 'text-slate-500'}>
                          {formatRupiah(spent, true)} terpakai
                        </span>
                        <span className="text-slate-500">dari {formatRupiah(b.amount, true)}</span>
                      </div>
                    </DashboardCardContent>
                  </DashboardCard>
                )
              })}

              {/* Add more button */}
              {unbucketedCategories.length > 0 && (
                <DashboardCard
                  className="border-dashed border-slate-200 cursor-pointer hover:border-[#8ab4f8] hover:bg-[#8ab4f8]/5 transition-all bg-transparent"
                  id="card-add-more-budget"
                  onClick={handleOpenAdd}
                >
                  <DashboardCardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[120px] gap-2">
                    <div className="h-10 w-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                      <Plus className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Tambah Budget Kategori</p>
                  </DashboardCardContent>
                </DashboardCard>
              )}
            </div>
          </>
        )}
      </main>

      {/* Add/Edit Budget Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-xs" id="add-budget-dialog">
          <DialogHeader>
            <DialogTitle>{editBudget ? 'Edit Budget' : 'Tambah Budget'}</DialogTitle>
            <DialogDescription>
              {editBudget ? `Ubah alokasi untuk ${editBudget.category?.name}` : 'Pilih kategori dan set alokasi Budget.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {!editBudget && (
              <div className="space-y-1.5">
                <Label htmlFor="budget-category">Kategori</Label>
                <Select value={addCategoryId} onValueChange={setAddCategoryId}>
                  <SelectTrigger id="budget-category">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {(unbucketedCategories.length > 0 ? unbucketedCategories : categories).map(c => (
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
            )}
            <div className="space-y-1.5">
              <Label htmlFor="budget-amount">Jumlah Budget</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                <NumericFormat
                  id="budget-amount"
                  customInput={Input}
                  className="pl-9"
                  placeholder="0"
                  thousandSeparator="."
                  decimalSeparator=","
                  value={addAmount ? addAmount : ''}
                  onValueChange={(values) => setAddAmount(String(values.floatValue || 0))}
                  min={1}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddDialog(false)}>Batal</Button>
              <Button
                id="btn-save-budget"
                className="flex-1"
                disabled={!addCategoryId || !addAmount || Number(addAmount) <= 0 || upsertBudget.isPending}
                onClick={handleSaveBudget}
              >
                {upsertBudget.isPending ? 'Menyimpan…' : 'Simpan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Budgeting Wizard */}
      <Dialog open={showWizard} onOpenChange={resetWizard}>
        <DialogContent className="max-w-md" id="budget-wizard-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Budgeting Wizard
            </DialogTitle>
            <DialogDescription>
              Pilih Budgeting Framework sebagai titik awal. Budget bisa diedit setelah ini.
            </DialogDescription>
          </DialogHeader>

          {wizardStep === 'framework' && (
            <div className="space-y-3">
              <div className="grid gap-2">
                {FRAMEWORKS.map(f => (
                  <button
                    key={f.id}
                    id={`framework-${f.id}`}
                    onClick={() => setSelectedFramework(f.id)}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border text-left transition-all',
                      selectedFramework === f.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <div className={cn('h-4 w-4 rounded-full border-2 mt-0.5 shrink-0', selectedFramework === f.id ? 'border-primary bg-primary' : 'border-muted-foreground')} />
                    <div>
                      <p className="font-medium text-sm">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <Button className="w-full" id="btn-wizard-next" disabled={!selectedFramework} onClick={() => setWizardStep('income')}>
                Lanjut
              </Button>
            </div>
          )}

          {wizardStep === 'income' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="wizard-income">Total Income per bulan</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                  <NumericFormat
                    id="wizard-income"
                    customInput={Input}
                    value={wizardIncome ? wizardIncome : ''}
                    onValueChange={(values) => setWizardIncome(String(values.floatValue ?? ''))}
                    className="pl-9"
                    placeholder="0"
                    thousandSeparator="."
                    decimalSeparator=","
                    min={0}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Budget akan dikalkulasi otomatis berdasarkan framework yang dipilih.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setWizardStep('framework')} className="flex-1">Kembali</Button>
                <Button id="btn-wizard-generate" className="flex-1" disabled={!wizardIncome || Number(wizardIncome) <= 0} onClick={() => setWizardStep('result')}>
                  Generate
                </Button>
              </div>
            </div>
          )}

          {wizardStep === 'result' && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-3 text-sm space-y-2">
                <p className="font-medium">Alokasi berdasarkan <strong>{FRAMEWORKS.find(f => f.id === selectedFramework)?.label}</strong></p>
                {selectedFramework === '50_30_20' && (
                  <>
                    <div className="flex justify-between"><span>Kebutuhan (50%)</span><span className="font-medium">{formatRupiah(Number(wizardIncome) * 0.5)}</span></div>
                    <div className="flex justify-between"><span>Keinginan (30%)</span><span className="font-medium">{formatRupiah(Number(wizardIncome) * 0.3)}</span></div>
                    <div className="flex justify-between"><span>Tabungan (20%)</span><span className="font-medium">{formatRupiah(Number(wizardIncome) * 0.2)}</span></div>
                  </>
                )}
                <p className="text-xs text-muted-foreground pt-1">Gunakan angka ini sebagai panduan saat menambah Budget per kategori secara manual.</p>
              </div>
              <Button id="btn-wizard-done" className="w-full" onClick={resetWizard}>Selesai</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
