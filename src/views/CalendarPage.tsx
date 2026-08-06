"use client";
import { useState } from 'react'
import { format, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, getDay } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { cn, formatRupiah } from '@/lib/utils'
import { useTransactions } from '@/hooks/useTransactions'
import { useRecurringRules } from '@/hooks/useRecurringRules'
import { useFinancialCycleConfig } from '@/hooks/useFinancialCycleConfig'

function getTransactionsForDay(date: Date, items: Array<{ date: string; amount: number; type: 'inflow' | 'outflow'; is_projection: boolean; label: string }>) {
  return items.filter(item => isSameDay(new Date(item.date + 'T00:00:00'), date))
}

function DayCell({ date, items, isInCycle, onSelect, isSelected }: {
  date: Date
  items: Array<{ date: string; amount: number; type: 'inflow' | 'outflow'; is_projection: boolean; label: string }>
  isInCycle: boolean
  onSelect: (date: Date) => void
  isSelected: boolean
}) {
  const today = isToday(date)
  const dayItems = getTransactionsForDay(date, items)
  const hasProjection = dayItems.some(i => i.is_projection)
  const inflow = dayItems.filter(i => i.type === 'inflow').reduce((s, i) => s + i.amount, 0)
  const outflow = dayItems.filter(i => i.type === 'outflow').reduce((s, i) => s + i.amount, 0)

  return (
    <button
      onClick={() => onSelect(date)}
      className={cn(
        'min-h-[72px] p-1.5 text-left rounded-lg border transition-all hover:bg-muted/50',
        !isInCycle && 'opacity-30',
        today && 'border-primary bg-primary/5',
        isSelected && !today && 'border-primary/50 ring-1 ring-primary/20 bg-muted/30',
        !today && !isSelected && 'border-transparent',
      )}
    >
      <div className={cn('text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full',
        today && 'bg-primary text-primary-foreground', !today && 'text-foreground'
      )}>
        {format(date, 'd')}
      </div>
      {dayItems.length > 0 && (
        <div className="space-y-0.5">
          {inflow > 0 && (
            <div className={cn('text-[10px] font-medium truncate px-1 py-0.5 rounded',
              hasProjection ? 'text-income/60 bg-income/10 border border-income/20 border-dashed' : 'text-income bg-income/10'
            )}>
              +{formatRupiah(inflow, true)}
            </div>
          )}
          {outflow > 0 && (
            <div className={cn('text-[10px] font-medium truncate px-1 py-0.5 rounded',
              hasProjection ? 'text-expense/60 bg-expense/10 border border-expense/20 border-dashed' : 'text-expense bg-expense/10'
            )}>
              -{formatRupiah(outflow, true)}
            </div>
          )}
        </div>
      )}
    </button>
  )
}

export function CalendarPage() {
  const { data: cycleConfig } = useFinancialCycleConfig()
  const startDay = cycleConfig?.start_day ?? 1

  const [referenceDate, setReferenceDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  // Calculate cycle bounds based on referenceDate and startDay
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  
  let cycleStart: Date
  let cycleEnd: Date

  if (startDay === 1) {
    cycleStart = new Date(year, month, 1)
    cycleEnd = new Date(year, month + 1, 0)
  } else {
    // If today is before startDay, the reference is shifted to the previous cycle.
    // So if referenceDate is Aug 10, startDay 25 -> cycle is Jul 25 - Aug 24
    // If referenceDate is Aug 26, startDay 25 -> cycle is Aug 25 - Sep 24
    if (referenceDate.getDate() >= startDay) {
      cycleStart = new Date(year, month, startDay)
      cycleEnd = new Date(year, month + 1, startDay - 1)
    } else {
      cycleStart = new Date(year, month - 1, startDay)
      cycleEnd = new Date(year, month, startDay - 1)
    }
  }

  const startStr = format(cycleStart, 'yyyy-MM-dd')
  const endStr = format(cycleEnd, 'yyyy-MM-dd')

  const { data: transactions = [], isLoading: txLoading } = useTransactions({ start_date: startStr, end_date: endStr })
  const { data: recurringRules = [] } = useRecurringRules()

  // Build unified calendar items
  const calendarItems = [
    // Actual transactions
    ...transactions.map(tx => ({
      date: tx.date.substring(0, 10),
      amount: tx.amount,
      type: tx.type as 'inflow' | 'outflow',
      is_projection: false,
      label: tx.notes || (tx as any).category?.name || '—',
    })),
    // Projected from active Recurring Rules
    ...recurringRules
      .filter(r => r.is_active && r.next_due_date >= startStr && r.next_due_date <= endStr)
      .map(r => ({
        date: r.next_due_date,
        amount: r.amount,
        type: r.type as 'inflow' | 'outflow',
        is_projection: true,
        label: r.description || (r as any).category?.name || '—',
      })),
  ]

  const days = eachDayOfInterval({ start: cycleStart, end: cycleEnd })
  const startDow = (getDay(cycleStart) + 6) % 7
  const leadingDays = Array.from({ length: startDow }, (_, i) => {
    const d = new Date(cycleStart); d.setDate(d.getDate() - (startDow - i)); return d
  })
  const totalCells = leadingDays.length + days.length
  const trailingCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
  const trailingDays = Array.from({ length: trailingCount }, (_, i) => {
    const d = new Date(cycleEnd); d.setDate(d.getDate() + i + 1); return d
  })
  const allDays = [...leadingDays, ...days, ...trailingDays]

  const selectedItems = selectedDate ? getTransactionsForDay(selectedDate, calendarItems) : []

  return (
    <div className="flex flex-col min-h-svh">


      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <DashboardHeader title="Calendar View">
        <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-[#4cb791]" />Aktual</div>
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-[#eef4ff] border border-[#a7c5f9]" />Proyeksi</div>
        </div>
      </DashboardHeader>
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {startDay === 1
              ? format(cycleStart, 'MMMM yyyy', { locale: idLocale })
              : `${format(cycleStart, 'd MMM yyyy', { locale: idLocale })} - ${format(cycleEnd, 'd MMM yyyy', { locale: idLocale })}`
            }
          </h2>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" id="btn-prev-month" className="h-8 w-8" onClick={() => setReferenceDate(subMonths(referenceDate, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" id="btn-today" className="h-8" onClick={() => { setReferenceDate(new Date()); setSelectedDate(new Date()) }}>
              Hari Ini
            </Button>
            <Button variant="outline" size="icon" id="btn-next-month" className="h-8 w-8" onClick={() => setReferenceDate(addMonths(referenceDate, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-7 mb-1">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            {txLoading
              ? <div className="grid grid-cols-7 gap-1">{Array.from({ length: 35 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
              : (
                <div className="grid grid-cols-7 gap-1">
                  {allDays.map((day, i) => {
                    const dayTime = day.getTime()
                    const isInCycle = dayTime >= cycleStart.getTime() && dayTime <= cycleEnd.getTime()
                    return (
                      <DayCell
                        key={i}
                        date={day}
                        items={calendarItems}
                        isInCycle={isInCycle}
                        onSelect={setSelectedDate}
                        isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
                      />
                    )
                  })}
                </div>
              )
            }
          </div>

          {/* Selected day panel */}
          <div className="space-y-3">
            <div className="font-medium text-sm">
              {selectedDate ? format(selectedDate, 'EEEE, d MMMM yyyy', { locale: idLocale }) : 'Pilih tanggal'}
            </div>
            {selectedDate && selectedItems.length === 0 && (
              <p className="text-sm text-muted-foreground">Tidak ada transaksi</p>
            )}
            {selectedItems.map((item, i) => (
              <Card key={i} className={cn('border', item.is_projection && 'border-dashed opacity-75')}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={cn('h-7 w-7 rounded-full flex items-center justify-center shrink-0', item.type === 'inflow' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense')}>
                        {item.type === 'inflow' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      </div>
                      <p className="text-sm font-medium leading-tight">{item.label}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn('text-sm font-semibold tabular-nums', item.type === 'inflow' ? 'text-income' : 'text-expense')}>
                        {item.type === 'inflow' ? '+' : '-'}{formatRupiah(item.amount, true)}
                      </p>
                      {item.is_projection && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1 mt-0.5 gap-0.5 border-dashed">
                          <RefreshCw className="h-2.5 w-2.5" />Proyeksi
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
