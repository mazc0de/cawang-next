"use client";
import { useMemo, useState } from "react";
import {
  format,
  eachDayOfInterval,
  isSameDay,
  isToday,
  getDay,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Sparkles,
} from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
} from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { useRecurringRules } from "@/hooks/useRecurringRules";
import { useFinancialCycleConfig } from "@/hooks/useFinancialCycleConfig";
import { useCalendarContext } from "@/contexts/CalendarContext";
import { useTransactionsContext } from "@/contexts/TransactionsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  TransactionFormDialog,
  type TransactionFormData,
} from "@/components/transactions/TransactionFormDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CalendarItem {
  id?: string;
  date: string;
  amount: number;
  type: "inflow" | "outflow";
  is_projection: boolean;
  label: string;
  raw?: any;
}

function getTransactionsForDay(date: Date, items: CalendarItem[]) {
  return items.filter((item) =>
    isSameDay(new Date(item.date + "T00:00:00"), date),
  );
}

function DayCell({
  date,
  items,
  isInCycle,
  onSelect,
  isSelected,
}: {
  date: Date;
  items: CalendarItem[];
  isInCycle: boolean;
  onSelect: (date: Date) => void;
  isSelected: boolean;
}) {
  const today = isToday(date);
  const dayItems = getTransactionsForDay(date, items);
  const inflow = dayItems
    .filter((i) => i.type === "inflow")
    .reduce((s, i) => s + i.amount, 0);
  const outflow = dayItems
    .filter((i) => i.type === "outflow")
    .reduce((s, i) => s + i.amount, 0);
  const hasProjection = dayItems.some((i) => i.is_projection);

  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      className={cn(
        "min-h-[112px] p-2.5 text-left rounded-[16px] border-2 transition-all flex flex-col justify-between cursor-pointer relative group",
        !isInCycle
          ? "opacity-30 bg-canvas/60 border-ink/15"
          : "bg-white hover:bg-canvas/80 border-ink shadow-hard-sm hover:shadow-hard-md hover:-translate-y-0.5",
        today && "bg-canary border-ink shadow-hard-md ring-2 ring-ink",
        isSelected &&
          !today &&
          "ring-4 ring-hot-pink border-ink shadow-hard-md bg-canvas",
      )}
    >
      {/* Top Header of Day Cell */}
      <div className="flex items-center justify-between w-full">
        <span
          className={cn(
            "text-xs font-space-mono font-bold w-7 h-7 flex items-center justify-center rounded-full border-2 border-ink shadow-[1px_1px_0px_0px_#111]",
            today
              ? "bg-ink text-white"
              : isSelected
                ? "bg-hot-pink text-white"
                : "bg-canvas text-ink",
          )}
        >
          {format(date, "d")}
        </span>

        <div className="flex items-center gap-1">
          {hasProjection && (
            <span
              title="Memiliki proyeksi recurring rule"
              className="w-4 h-4 rounded-full bg-lilac border border-ink flex items-center justify-center text-ink shadow-[1px_1px_0px_0px_#111]"
            >
              <RefreshCw className="h-2 w-2" />
            </span>
          )}
          {dayItems.length > 0 && (
            <span className="text-[11px] font-space-mono font-bold text-ink/70 px-1.5 py-0.5 rounded-md bg-canvas border border-ink/20">
              {dayItems.length}
            </span>
          )}
        </div>
      </div>

      {/* Amounts Summary in Day Cell */}
      {dayItems.length > 0 ? (
        <div className="space-y-1.5 mt-2 w-full">
          {inflow > 0 && (
            <div className="text-[11px] font-space-mono font-bold truncate px-2 py-1 rounded-[8px] border-2 border-ink bg-mint text-ink shadow-[1px_1px_0px_0px_#111] flex items-center justify-between gap-1">
              <span className="flex items-center gap-0.5 truncate">
                <ArrowUpRight className="h-3 w-3 shrink-0" strokeWidth={3} />
                <span className="truncate">+{formatRupiah(inflow, true)}</span>
              </span>
            </div>
          )}
          {outflow > 0 && (
            <div className="text-[11px] font-space-mono font-bold truncate px-2 py-1 rounded-[8px] border-2 border-ink bg-coral text-ink shadow-[1px_1px_0px_0px_#111] flex items-center justify-between gap-1">
              <span className="flex items-center gap-0.5 truncate">
                <ArrowDownRight className="h-3 w-3 shrink-0" strokeWidth={3} />
                <span className="truncate">-{formatRupiah(outflow, true)}</span>
              </span>
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: cycleConfig } = useFinancialCycleConfig();
  const startDay = cycleConfig?.start_day ?? 1;

  const calendarContext = useCalendarContext();
  const txContext = useTransactionsContext();

  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();

  const [localRefDate] = useState(new Date());
  const [localSelDate, setLocalSelDate] = useState<Date | null>(new Date());
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [localShowForm, setLocalShowForm] = useState(false);
  const [localEditingTransaction, setLocalEditingTransaction] = useState<any>(undefined);

  const referenceDate = calendarContext?.referenceDate ?? localRefDate;
  const selectedDate = calendarContext?.selectedDate ?? localSelDate;
  const setSelectedDate = calendarContext?.setSelectedDate ?? setLocalSelDate;

  const showForm = txContext?.showForm ?? localShowForm;
  const setShowForm = txContext?.setShowForm ?? setLocalShowForm;
  const editingTransaction = txContext?.editingTransaction ?? localEditingTransaction;
  const setEditingTransaction = txContext?.setEditingTransaction ?? setLocalEditingTransaction;

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

  const startStr = format(cycleStart, "yyyy-MM-dd");
  const endStr = format(cycleEnd, "yyyy-MM-dd");

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
        id: tx.id,
        date: tx.date.substring(0, 10),
        amount: tx.amount,
        type: tx.type as "inflow" | "outflow",
        is_projection: false,
        label: tx.notes || (tx as any).category?.name || "Transaksi",
        raw: tx,
      })),
      // Projected from active Recurring Rules
      ...recurringRules
        .filter(
          (r) =>
            r.is_active &&
            r.next_due_date >= startStr &&
            r.next_due_date <= endStr,
        )
        .map((r) => ({
          id: r.id,
          date: r.next_due_date,
          amount: r.amount,
          type: r.type as "inflow" | "outflow",
          is_projection: true,
          label: r.description || (r as any).category?.name || "Tagihan Rutin",
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

  const handleSelectDay = (day: Date) => {
    setSelectedDate(day);
    setIsDetailModalOpen(true);
  };

  const handleCreateTxForDate = () => {
    if (selectedDate) {
      if (txContext) {
        txContext.setSelectedDate?.(selectedDate);
        txContext.setEditingTransaction?.(undefined);
        txContext.setShowForm?.(true);
      } else {
        setLocalEditingTransaction(undefined);
        setLocalShowForm(true);
      }
      setIsDetailModalOpen(false);
    }
  };

  const handleTransactionSubmit = async (data?: TransactionFormData) => {
    if (!data || !user) return;

    if (editingTransaction) {
      if (editingTransaction.transfer_pair_id) {
        await updateTransaction.mutateAsync({
          id: editingTransaction.id,
          amount: data.amount,
          date: data.date,
          notes: data.notes,
        });
        await updateTransaction.mutateAsync({
          id: editingTransaction.transfer_pair_id,
          amount: data.amount,
          date: data.date,
        });
        queryClient.invalidateQueries({ queryKey: ["transactions", user.id] });
        queryClient.invalidateQueries({ queryKey: ["accounts", user.id] });
      } else {
        await updateTransaction.mutateAsync({
          id: editingTransaction.id,
          account_id: data.account_id,
          category_id: data.category_id!,
          amount: data.amount,
          date: data.date,
          notes: data.notes,
        });
      }
      setEditingTransaction(undefined);
      return;
    }

    if (data.type === "transfer") {
      const { data: tx1 } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            account_id: data.account_id,
            category_id:
              categories.find((c) => c.type === "outflow")?.id ?? "",
            amount: data.amount,
            type: "outflow",
            date: data.date,
            notes:
              data.notes ||
              `Transfer ke ${accounts.find((a) => a.id === data.to_account_id)?.name}`,
            is_adjustment: false,
          },
        ])
        .select()
        .single();

      if (!tx1) return;

      const { data: tx2 } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            account_id: data.to_account_id!,
            category_id:
              categories.find((c) => c.type === "inflow")?.id ?? "",
            amount: data.amount,
            type: "inflow",
            date: data.date,
            notes:
              data.notes ||
              `Transfer dari ${accounts.find((a) => a.id === data.account_id)?.name}`,
            is_adjustment: false,
            transfer_pair_id: tx1.id,
          },
        ])
        .select()
        .single();

      if (tx2) {
        await supabase
          .from("transactions")
          .update({ transfer_pair_id: tx2.id })
          .eq("id", tx1.id);
      }

      queryClient.invalidateQueries({ queryKey: ["transactions", user.id] });
      queryClient.invalidateQueries({ queryKey: ["accounts", user.id] });
    } else {
      await createTransaction.mutateAsync({
        account_id: data.account_id,
        category_id: data.category_id!,
        amount: data.amount,
        type: data.type,
        date: data.date,
        notes: data.notes,
      });
    }
  };

  const selectedItems = selectedDate
    ? getTransactionsForDay(selectedDate, calendarItems)
    : [];
  const selectedDayTotalInflow = selectedItems
    .filter((i) => i.type === "inflow")
    .reduce((s, i) => s + i.amount, 0);
  const selectedDayTotalOutflow = selectedItems
    .filter((i) => i.type === "outflow")
    .reduce((s, i) => s + i.amount, 0);

  const monthLabel =
    startDay === 1
      ? format(cycleStart, "MMMM yyyy", { locale: idLocale })
      : `${format(cycleStart, "d MMM yyyy", { locale: idLocale })} – ${format(cycleEnd, "d MMM yyyy", { locale: idLocale })}`;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto w-full">
      {/* 1. TOP HEADER SUMMARY & LEGEND */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-archivo-black text-2xl sm:text-3xl text-ink tracking-tight capitalize">
            {monthLabel}
          </h2>
          <p className="font-space-grotesk font-medium text-xs text-ink/70 mt-0.5">
            Klik pada tanggal kalender untuk membuka rincian transaksi &
            estimasi tagihan
          </p>
        </div>

        {/* Legend Pills */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border-2 border-ink shadow-[2px_2px_0px_0px_#111]">
            <div className="h-3 w-3 rounded-full bg-mint border border-ink" />
            <span className="font-space-mono text-xs font-bold text-ink">
              Inflow / Masuk
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border-2 border-ink shadow-[2px_2px_0px_0px_#111]">
            <div className="h-3 w-3 rounded-full bg-coral border border-ink" />
            <span className="font-space-mono text-xs font-bold text-ink">
              Outflow / Keluar
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border-2 border-ink shadow-[2px_2px_0px_0px_#111]">
            <div className="h-3 w-3 rounded-full bg-lilac border border-ink" />
            <span className="font-space-mono text-xs font-bold text-ink">
              Tagihan Rutin
            </span>
          </div>
        </div>
      </div>

      {/* 2. FULL-WIDTH CALENDAR VIEW */}
      <div className="card-neubrutalism bg-white p-5 sm:p-7 space-y-4 w-full">
        {/* Day of week headers */}
        <div className="grid grid-cols-7 gap-2.5 text-center">
          {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map(
            (d) => (
              <div
                key={d}
                className="py-2.5 bg-canvas rounded-xl border-2 border-ink font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink shadow-[2px_2px_0px_0px_#111]"
              >
                <span className="hidden sm:inline">{d}</span>
                <span className="sm:hidden">{d.slice(0, 3)}</span>
              </div>
            ),
          )}
        </div>

        {/* Calendar Day Grid */}
        {txLoading ? (
          <div className="grid grid-cols-7 gap-2.5">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="min-h-[112px] bg-canvas animate-pulse rounded-[16px] border-2 border-ink/10"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2.5">
            {allDays.map((day, i) => {
              const dayTime = day.getTime();
              const isInCycle =
                dayTime >= cycleStart.getTime() &&
                dayTime <= cycleEnd.getTime();
              return (
                <DayCell
                  key={i}
                  date={day}
                  items={calendarItems}
                  isInCycle={isInCycle}
                  onSelect={handleSelectDay}
                  isSelected={
                    selectedDate ? isSameDay(day, selectedDate) : false
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 3. DETAIL TRANSAKSI MODAL DIALOG */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-lg" id="calendar-day-detail-dialog">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[14px] bg-lilac border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
                <CalendarIcon className="h-6 w-6 text-ink" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">
                  Rincian Tanggal
                </p>
                <DialogTitle className="text-xl sm:text-2xl mt-0.5 truncate">
                  {selectedDate
                    ? format(selectedDate, "EEEE, d MMMM yyyy", {
                        locale: idLocale,
                      })
                    : "Pilih Tanggal"}
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-xs font-space-grotesk text-ink/70">
              Daftar seluruh transaksi tercatat dan jadwal tagihan rutin pada
              hari ini.
            </DialogDescription>
          </DialogHeader>

          {/* Daily Net Summary Cards */}
          <div className="grid grid-cols-2 gap-3 py-1">
            <div className="p-3 rounded-[14px] bg-canvas border-2 border-ink shadow-hard-sm">
              <span className="font-space-grotesk font-bold text-[11px] uppercase tracking-wider text-ink/70 block">
                Total Masuk
              </span>
              <p className="font-archivo-black text-lg sm:text-xl text-mint mt-0.5 truncate">
                +{formatRupiah(selectedDayTotalInflow, true)}
              </p>
            </div>
            <div className="p-3 rounded-[14px] bg-canvas border-2 border-ink shadow-hard-sm">
              <span className="font-space-grotesk font-bold text-[11px] uppercase tracking-wider text-ink/70 block">
                Total Keluar
              </span>
              <p className="font-archivo-black text-lg sm:text-xl text-coral mt-0.5 truncate">
                -{formatRupiah(selectedDayTotalOutflow, true)}
              </p>
            </div>
          </div>

          {/* Transaction Items List */}
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto px-1 py-1 -mx-1">
            {selectedItems.length === 0 ? (
              <div className="py-12 text-center rounded-[16px] bg-canvas border-2 border-dashed border-ink/20 flex flex-col items-center justify-center">
                <Sparkles className="h-8 w-8 text-ink/40 mb-2" />
                <p className="font-archivo-black text-sm text-ink">
                  Tidak Ada Transaksi
                </p>
                <p className="font-space-grotesk text-xs text-ink/60 mt-0.5">
                  Belum ada catatan atau proyeksi pada tanggal ini.
                </p>
              </div>
            ) : (
              selectedItems.map((item, i) => (
                <div
                  key={i}
                  onClick={() => {
                    if (!item.is_projection && item.raw) {
                      setEditingTransaction(item.raw);
                      setShowForm(true);
                      setIsDetailModalOpen(false);
                    }
                  }}
                  className={cn(
                    "p-3.5 rounded-[14px] bg-white border-2 border-ink shadow-hard-sm flex items-center justify-between gap-3 group hover:-translate-y-0.5 transition-transform",
                    item.is_projection
                      ? "border-dashed bg-canvas/40"
                      : "cursor-pointer hover:bg-canvas/50",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full border-2 border-ink flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_#111]",
                        item.type === "inflow" ? "bg-mint" : "bg-coral",
                      )}
                    >
                      {item.type === "inflow" ? (
                        <TrendingUp
                          className="h-4 w-4 text-ink"
                          strokeWidth={2.5}
                        />
                      ) : (
                        <TrendingDown
                          className="h-4 w-4 text-ink"
                          strokeWidth={2.5}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-space-grotesk font-bold text-xs sm:text-sm text-ink truncate">
                        {item.label}
                      </p>
                      {item.is_projection && (
                        <span className="inline-flex items-center gap-1 font-space-mono text-[9px] font-bold text-ink/80 px-2 py-0.5 rounded-full border border-ink bg-lilac mt-1">
                          <RefreshCw className="h-2.5 w-2.5" /> Tagihan Rutin
                          (Proyeksi)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={cn(
                        "font-space-mono font-bold text-xs sm:text-sm",
                        item.type === "inflow" ? "text-mint" : "text-coral",
                      )}
                    >
                      {item.type === "inflow" ? "+" : "-"}
                      {formatRupiah(item.amount, true)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="pt-3 flex flex-row items-center justify-between gap-3">
            <button
              type="button"
              className="btn-neubrutalism bg-white text-ink px-4 py-2 text-xs font-space-grotesk font-bold flex-1 sm:flex-none"
              onClick={() => setIsDetailModalOpen(false)}
            >
              Tutup
            </button>
            <button
              type="button"
              id="btn-add-tx-from-calendar"
              onClick={handleCreateTxForDate}
              className="btn-neubrutalism bg-hot-pink text-white px-5 py-2 text-xs font-space-grotesk font-bold flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4" strokeWidth={3} />
              Catat Transaksi
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Transaction Dialog */}
      <TransactionFormDialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setTimeout(() => setEditingTransaction(undefined), 300);
        }}
        transaction={editingTransaction}
        defaultDate={
          selectedDate
            ? format(selectedDate, "yyyy-MM-dd")
            : format(new Date(), "yyyy-MM-dd")
        }
        accounts={accounts}
        categories={categories}
        onSuccess={handleTransactionSubmit}
      />
    </div>
  );
}
