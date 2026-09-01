"use client";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Tags, ArrowDownRight, ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useFinancialCycleConfig } from "@/hooks/useFinancialCycleConfig";
import { formatRupiah, cn, formatDateShort } from "@/lib/utils";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import type { Transaction, Category } from "@/types/domain";

export function CategoriesReportPage() {
  const [cycleOffset, setCycleOffset] = useState(0);

  const { data: cycleConfig } = useFinancialCycleConfig();
  const startDay = cycleConfig?.start_day ?? 1;

  const getCycleDates = (offset: number) => {
    const today = new Date();
    let startDate: Date;
    if (today.getDate() >= startDay) {
      startDate = new Date(today.getFullYear(), today.getMonth(), startDay);
    } else {
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, startDay);
    }

    startDate.setMonth(startDate.getMonth() + offset);
    
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1);

    return { startDate, endDate };
  };

  const { startDate, endDate } = getCycleDates(cycleOffset);

  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const { data: transactions = [], isLoading: isTransactionsLoading } = useTransactions({
    start_date: format(startDate, "yyyy-MM-dd"),
    end_date: format(endDate, "yyyy-MM-dd"),
  });

  const isLoading = isCategoriesLoading || isTransactionsLoading;

  const handlePrevCycle = () => setCycleOffset((prev) => prev - 1);
  const handleNextCycle = () => setCycleOffset((prev) => prev + 1);

  // Group transactions by category
  const reportData = useMemo(() => {
    const data: Record<string, { category: Category; total: number; count: number; transactions: Transaction[] }> = {};

    // Initialize with all categories so even empty ones show up if we want (optional, let's only show categories with data or all active ones)
    categories.forEach((cat) => {
      data[cat.id] = { category: cat, total: 0, count: 0, transactions: [] };
    });

    transactions.forEach((tx) => {
      if (tx.is_adjustment || tx.transfer_pair_id) return;
      if (!tx.category_id) return;

      const catData = data[tx.category_id];
      if (catData) {
        catData.transactions.push(tx);
        catData.total += tx.amount;
        catData.count += 1;
      }
    });

    return Object.values(data)
      .filter((d) => d.count > 0) // Only show categories with transactions in this period
      .sort((a, b) => b.total - a.total); // Sort by highest total
  }, [categories, transactions]);

  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const toggleCat = (id: string) => {
    const newSet = new Set(expandedCats);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedCats(newSet);
  };

  const totalExpense = reportData.filter(d => d.category.type === "outflow").reduce((sum, d) => sum + d.total, 0);
  const totalIncome = reportData.filter(d => d.category.type === "inflow").reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-[18px] border-2 border-ink shadow-hard-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-canary border-2 border-ink shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] flex items-center justify-center shrink-0">
            <Tags className="h-5 w-5 text-ink" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-archivo-black text-xl text-ink">Laporan per Kategori</h1>
            <p className="font-space-grotesk text-xs font-bold text-ink/70">Rincian seluruh transaksi berdasarkan kategori</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-canvas px-2 py-1.5 rounded-[12px] border-2 border-ink">
          <button
            onClick={handlePrevCycle}
            className="w-8 h-8 rounded-[8px] bg-white border-2 border-ink flex items-center justify-center hover:bg-canary transition-colors cursor-pointer shadow-[1px_1px_0px_0px_rgba(17,17,17,1)] active:translate-y-px active:shadow-none"
          >
            <ChevronLeft className="h-4 w-4 text-ink" strokeWidth={3} />
          </button>
          <div className="w-auto px-2 text-center">
            <p className="font-space-mono text-[10px] sm:text-xs font-bold text-ink uppercase tracking-wider">
              {formatDateShort(startDate)} - {formatDateShort(endDate)}
            </p>
          </div>
          <button
            onClick={handleNextCycle}
            className="w-8 h-8 rounded-[8px] bg-white border-2 border-ink flex items-center justify-center hover:bg-canary transition-colors cursor-pointer shadow-[1px_1px_0px_0px_rgba(17,17,17,1)] active:translate-y-px active:shadow-none"
          >
            <ChevronRight className="h-4 w-4 text-ink" strokeWidth={3} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 w-full bg-canvas animate-pulse rounded-[16px] border-2 border-ink/10" />
          ))}
        </div>
      ) : reportData.length === 0 ? (
         <div className="card-neubrutalism bg-white p-8">
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-[16px] bg-canvas border-2 border-dashed border-ink/20">
              <h3 className="font-archivo-black text-lg text-ink">Tidak ada transaksi</h3>
              <p className="font-space-grotesk text-sm text-ink/70 max-w-sm mt-1">
                Belum ada transaksi pada periode {formatDateShort(startDate)} hingga {formatDateShort(endDate)}.
              </p>
            </div>
          </div>
      ) : (
        <div className="space-y-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
             <div className="card-neubrutalism bg-white p-5 flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-[14px] bg-coral border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
                  <ArrowDownRight className="h-6 w-6 text-ink" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">Total Pengeluaran</p>
                  <p className="font-archivo-black text-2xl text-ink tracking-tight truncate mt-0.5">{formatRupiah(totalExpense)}</p>
                </div>
              </div>
              <div className="card-neubrutalism bg-white p-5 flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-[14px] bg-mint border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
                  <ArrowUpRight className="h-6 w-6 text-ink" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">Total Pemasukan</p>
                  <p className="font-archivo-black text-2xl text-ink tracking-tight truncate mt-0.5">{formatRupiah(totalIncome)}</p>
                </div>
              </div>
           </div>

           <div className="space-y-3">
             {reportData.map((item) => {
               const isExpanded = expandedCats.has(item.category.id);
               const isIncome = item.category.type === "inflow";

               return (
                 <div key={item.category.id} className="card-neubrutalism bg-white overflow-hidden transition-all">
                   <div 
                     className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-canvas/50 transition-colors"
                     onClick={() => toggleCat(item.category.id)}
                   >
                     <div className="flex items-center gap-3.5 min-w-0">
                       <div className={cn("w-11 h-11 rounded-[12px] border-2 border-ink shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] flex items-center justify-center shrink-0", isIncome ? "bg-mint" : "bg-coral")}>
                         <CategoryIcon icon={item.category.icon} className="h-5 w-5 text-ink" />
                       </div>
                       <div className="min-w-0">
                         <p className="font-archivo-black text-base text-ink truncate">{item.category.name}</p>
                         <p className="font-space-mono text-xs font-bold text-ink/60 mt-0.5">{item.count} transaksi</p>
                       </div>
                     </div>
                     
                     <div className="flex items-center gap-4 shrink-0">
                       <p className={cn("font-space-mono font-bold text-base sm:text-lg tabular-nums", isIncome ? "text-mint font-extrabold" : "text-ink")}>
                         {isIncome ? "+" : "-"}{formatRupiah(item.total, true)}
                       </p>
                       <div className="w-8 h-8 flex items-center justify-center rounded-full border border-ink/20">
                         {isExpanded ? <ChevronUp className="h-4 w-4 text-ink" /> : <ChevronDown className="h-4 w-4 text-ink" />}
                       </div>
                     </div>
                   </div>

                   {isExpanded && (
                     <div className="border-t-2 border-ink/10 bg-canvas/30 p-4 space-y-2">
                       {item.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                         <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-[10px] border border-ink/20">
                           <div className="min-w-0 flex-1">
                             <div className="flex items-center justify-between sm:justify-start gap-2">
                               <span className="font-space-mono font-bold text-[10px] px-2 py-0.5 bg-canvas border border-ink rounded-md">
                                 {format(new Date(tx.date), "dd MMM", { locale: id })}
                               </span>
                               <p className="font-space-grotesk font-bold text-sm text-ink truncate flex-1">
                                 {tx.notes || "-"}
                               </p>
                             </div>
                             {tx.account?.name && (
                               <p className="font-space-mono text-[10px] text-ink/60 font-bold mt-1.5 ml-1">
                                 Akun: {tx.account.name}
                               </p>
                             )}
                           </div>
                           <div className="text-right mt-1 sm:mt-0">
                             <p className={cn("font-space-mono font-bold text-sm tabular-nums", isIncome ? "text-mint" : "text-ink")}>
                               {formatRupiah(tx.amount)}
                             </p>
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               );
             })}
           </div>
        </div>
      )}
    </div>
  );
}
