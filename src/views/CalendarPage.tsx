"use client";
import { useMemo, useState } from 'react';
import { format, eachDayOfInterval, isSameDay, isToday, getDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { TrendingUp, TrendingDown, RefreshCw, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn, formatRupiah } from '@/lib/utils';
import { useTransactions } from '@/hooks/useTransactions';
import { useRecurringRules } from '@/hooks/useRecurringRules';
import { useFinancialCycleConfig } from '@/hooks/useFinancialCycleConfig';
import { useCalendarContext } from '@/contexts/CalendarContext';

function getTransactionsForDay(
  date: Date,
  items: Array<{ date: string; amount: number; type: 'inflow' | 'outflow'; is_projection: boolean; label: string }>
) {
  return items.filter((item) => isSameDay(new Date(item.date + 'T00:00:00'), date));
}

function DayCell({
  date,
  items,
  isInCycle,
  onSelect,
  isSelected,
}: {
  date: Date;
  items: Array<{ date: string; amount: number; type: 'inflow' | 'outflow'; is_projection: boolean; label: string }>;
  isInCycle: boolean;
  onSelect: (date: Date) => void;
  isSelected: boolean;
}) {
  const today = isToday(date);
  const dayItems = getTransactionsForDay(date, items);
  const inflow = dayItems.filter((i) => i.type === 'inflow').reduce((s, i) => s + i.amount, 0);
  const outflow = dayItems.filter((i) => i.type === 'outflow').reduce((s, i) => s + i.amount, 0);

  return (
    <button
      onClick={() => onSelect(date)}
      className={cn(
        'min-h-[88px] p-2 text-left rounded-[14px] border-2 transition-all flex flex-col justify-between cursor-pointer relative group',
        !isInCycle ? 'opacity-35 bg-canvas/60 border-ink/10' : 'bg-white hover:bg-canvas border-ink shadow-hard-sm hover:shadow-hard-md hover:-translate-y-0.5',
        today && 'bg-canary border-ink shadow-hard-md ring-2 ring-ink',
        isSelected && !today && 'ring-4 ring-hot-pink border-ink shadow-hard-md bg-canvas'
      )}
    >
      {/* Top Header of Day Cell */}
      <div className="flex items-center justify-between w-full">
        <span
          className={cn(
            'text-xs font-space-mono font-bold w-6 h-6 flex items-center justify-center rounded-full border border-ink shadow-[1px_1px_0px_0px_#111]',
            today ? 'bg-ink text-white' : isSelected ? 'bg-hot-pink text-white' : 'bg-canvas text-ink'
          )}
        >
          {format(date, 'd')}
        </span>

        {dayItems.length > 0 && (
          <span className="text-[10px] font-space-mono font-bold text-ink/60">
            {dayItems.length} item
          </span>
        )}
      </div>

      {/* Amounts Summary in Day Cell */}
      {dayItems.length > 0 ? (
        <div className="space-y-1 mt-1.5 w-full">
          {inflow > 0 && (
            <div className="text-[10px] font-space-mono font-bold truncate px-1.5 py-0.5 rounded-md border border-ink bg-mint text-ink shadow-[1px_1px_0px_0px_#111] flex items-center gap-0.5">
              <ArrowUpRight className="h-2.5 w-2.5 shrink-0" strokeWidth={3} />
              <span className="truncate">+{formatRupiah(inflow, true)}</span>
            </div>
          )}
          {outflow > 0 && (
            <div className="text-[10px] font-space-mono font-bold truncate px-1.5 py-0.5 rounded-md border border-ink bg-coral text-ink shadow-[1px_1px_0px_0px_#111] flex items-center gap-0.5">
              <ArrowDownRight className="h-2.5 w-2.5 shrink-0" strokeWidth={3} />
              <span className="truncate">-{formatRupiah(outflow, true)}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="h-4" />
      )}
    </button>
  );
}

export function CalendarPage() {
  const { data: cycleConfig } = useFinancialCycleConfig();
  const startDay = cycleConfig?.start_day ?? 1;

  const calendarContext = useCalendarContext();
  const [localRefDate] = useState(new Date());
  const [localSelDate, setLocalSelDate] = useState<Date | null>(new Date());

  const referenceDate = calendarContext?.referenceDate ?? localRefDate;
  const selectedDate = calendarContext?.selectedDate ?? localSelDate;
  const setSelectedDate = calendarContext?.setSelectedDate ?? setLocalSelDate;

  // Calculate cycle bounds based on referenceDate and startDay
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  let cycleStart: Date;
  let cycleEnd: Date;

  if (startDay === 1) {
    cycleStart = new Date(year, month, 1);
    cycleEnd = new Date(year, month + 1, 0);
  } else {
    if (referenceDate.getDate() >= startDay) {
      cycleStart = new Date(year, month, startDay);
      cycleEnd = new Date(year, month + 1, startDay - 1);
    } else {
      cycleStart = new Date(year, month - 1, startDay);
      cycleEnd = new Date(year, month, startDay - 1);
    }
  }

  const startStr = format(cycleStart, 'yyyy-MM-dd');
  const endStr = format(cycleEnd, 'yyyy-MM-dd');

  const { data: transactions = [], isLoading: txLoading } = useTransactions({
    start_date: startStr,
    end_date: endStr,
  });
  const { data: recurringRules = [] } = useRecurringRules();

  // Build unified calendar items
  const calendarItems = useMemo(() => {
    return [
      // Actual transactions
      ...transactions.map((tx) => ({
        date: tx.date.substring(0, 10),
        amount: tx.amount,
        type: tx.type as 'inflow' | 'outflow',
        is_projection: false,
        label: tx.notes || (tx as any).category?.name || 'Transaksi',
      })),
      // Projected from active Recurring Rules
      ...recurringRules
        .filter((r) => r.is_active && r.next_due_date >= startStr && r.next_due_date <= endStr)
        .map((r) => ({
          date: r.next_due_date,
          amount: r.amount,
          type: r.type as 'inflow' | 'outflow',
          is_projection: true,
          label: r.description || (r as any).category?.name || 'Tagihan Rutin',
        })),
    ];
  }, [transactions, recurringRules, startStr, endStr]);

  const days = eachDayOfInterval({ start: cycleStart, end: cycleEnd });
  const startDow = (getDay(cycleStart) + 6) % 7;
  const leadingDays = Array.from({ length: startDow }, (_, i) => {
    const d = new Date(cycleStart);
    d.setDate(d.getDate() - (startDow - i));
    return d;
  });
  const totalCells = leadingDays.length + days.length;
  const trailingCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const trailingDays = Array.from({ length: trailingCount }, (_, i) => {
    const d = new Date(cycleEnd);
    d.setDate(d.getDate() + i + 1);
    return d;
  });
  const allDays = [...leadingDays, ...days, ...trailingDays];

  const selectedItems = selectedDate ? getTransactionsForDay(selectedDate, calendarItems) : [];
  const selectedDayTotalInflow = selectedItems.filter((i) => i.type === 'inflow').reduce((s, i) => s + i.amount, 0);
  const selectedDayTotalOutflow = selectedItems.filter((i) => i.type === 'outflow').reduce((s, i) => s + i.amount, 0);

  const monthLabel =
    startDay === 1
      ? format(cycleStart, 'MMMM yyyy', { locale: idLocale })
      : `${format(cycleStart, 'd MMM yyyy', { locale: idLocale })} – ${format(cycleEnd, 'd MMM yyyy', { locale: idLocale })}`;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto w-full">
      {/* 1. TOP HEADER SUMMARY & LEGEND */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-archivo-black text-2xl sm:text-3xl text-ink tracking-tight capitalize">
            {monthLabel}
          </h2>
          <p className="font-space-grotesk font-medium text-xs text-ink/70 mt-0.5">
            Klik pada tanggal untuk melihat rincian transaksi & estimasi tagihan
          </p>
        </div>

        {/* Legend Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border-2 border-ink shadow-[2px_2px_0px_0px_#111]">
            <div className="h-3 w-3 rounded-full bg-mint border border-ink" />
            <span className="font-space-mono text-xs font-bold text-ink">Inflow / Masuk</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border-2 border-ink shadow-[2px_2px_0px_0px_#111]">
            <div className="h-3 w-3 rounded-full bg-coral border border-ink" />
            <span className="font-space-mono text-xs font-bold text-ink">Outflow / Keluar</span>
          </div>
        </div>
      </div>

      {/* 2. CALENDAR & DETAILS GRID */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Main Calendar View (8 Cols) */}
        <div className="lg:col-span-8 card-neubrutalism bg-white p-5 sm:p-6 space-y-4">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => (
              <div
                key={d}
                className="py-2 bg-canvas rounded-xl border-2 border-ink font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink shadow-[2px_2px_0px_0px_#111]"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          {txLoading ? (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="min-h-[88px] bg-canvas animate-pulse rounded-[14px] border-2 border-ink/10" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {allDays.map((day, i) => {
                const dayTime = day.getTime();
                const isInCycle = dayTime >= cycleStart.getTime() && dayTime <= cycleEnd.getTime();
                return (
                  <DayCell
                    key={i}
                    date={day}
                    items={calendarItems}
                    isInCycle={isInCycle}
                    onSelect={setSelectedDate}
                    isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Day Detail Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card-neubrutalism bg-white p-5 sm:p-6 space-y-4">
            {/* Header Selected Date */}
            <div className="flex items-center gap-3 border-b-2 border-ink pb-4">
              <div className="w-11 h-11 rounded-[14px] bg-lilac border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
                <CalendarIcon className="h-5 w-5 text-ink" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">Tanggal Dipilih</p>
                <h3 className="font-archivo-black text-lg text-ink truncate mt-0.5">
                  {selectedDate ? format(selectedDate, 'EEEE, d MMM yyyy', { locale: idLocale }) : 'Pilih Tanggal'}
                </h3>
              </div>
            </div>

            {/* Daily Net Summary */}
            {selectedDate && selectedItems.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-2.5 rounded-[12px] bg-canvas border-2 border-ink text-center">
                  <span className="font-space-grotesk font-bold text-[10px] uppercase text-ink/70">Total Masuk</span>
                  <p className="font-space-mono font-bold text-xs text-mint mt-0.5">+{formatRupiah(selectedDayTotalInflow, true)}</p>
                </div>
                <div className="p-2.5 rounded-[12px] bg-canvas border-2 border-ink text-center">
                  <span className="font-space-grotesk font-bold text-[10px] uppercase text-ink/70">Total Keluar</span>
                  <p className="font-space-mono font-bold text-xs text-coral mt-0.5">-{formatRupiah(selectedDayTotalOutflow, true)}</p>
                </div>
              </div>
            )}

            {/* Transaction Items List */}
            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-0.5">
              {selectedDate && selectedItems.length === 0 && (
                <div className="py-10 text-center rounded-xl bg-canvas border-2 border-dashed border-ink/20">
                  <p className="font-space-grotesk font-bold text-sm text-ink/70">Tidak ada transaksi</p>
                  <p className="font-space-grotesk text-xs text-ink/50 mt-0.5">Belum ada catatan pada tanggal ini</p>
                </div>
              )}

              {selectedItems.map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    'p-3 rounded-[14px] bg-white border-2 border-ink shadow-hard-sm flex items-center justify-between gap-3',
                    item.is_projection && 'border-dashed bg-canvas/50'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full border-2 border-ink flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_#111]',
                        item.type === 'inflow' ? 'bg-mint' : 'bg-coral'
                      )}
                    >
                      {item.type === 'inflow' ? (
                        <TrendingUp className="h-4 w-4 text-ink" strokeWidth={2.5} />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-ink" strokeWidth={2.5} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-space-grotesk font-bold text-xs text-ink truncate">{item.label}</p>
                      {item.is_projection && (
                        <span className="inline-flex items-center gap-1 font-space-mono text-[9px] font-bold text-ink/70 px-1.5 py-0.2 rounded border border-ink/30 bg-canary">
                          <RefreshCw className="h-2 w-2" /> Proyeksi
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={cn(
                        'font-space-mono font-bold text-xs',
                        item.type === 'inflow' ? 'text-mint' : 'text-coral'
                      )}
                    >
                      {item.type === 'inflow' ? '+' : '-'}{formatRupiah(item.amount, true)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

