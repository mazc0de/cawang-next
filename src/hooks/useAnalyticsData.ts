"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface SpendingByCategory {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyFlow {
  month: string;
  income: number;
  expense: number;
}

export interface MonthlyNetWorth {
  month: string;
  value: number;
}

export interface AnalyticsData {
  spendingByCategory: SpendingByCategory[];
  incomeExpenseByMonth: MonthlyFlow[];
  netWorthOverTime: MonthlyNetWorth[];
}

const COLORS = [
  "#f97316",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#64748b",
  "#ef4444",
  "#14b8a6",
  "#84cc16",
  "#facc15",
  "#0ea5e9",
];

export function useAnalyticsData(cycleStart: Date, cycleEnd: Date) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [
      "analytics_data",
      user?.id,
      cycleStart.toISOString(),
      cycleEnd.toISOString(),
    ],
    queryFn: async () => {
      if (!user) return null;

      // 1. Spending by Category (Current Cycle)
      const startStr = cycleStart.toISOString().split("T")[0];
      const endStr = cycleEnd.toISOString().split("T")[0];

      const { data: currentCycleTx, error: txError } = await supabase
        .from("transactions")
        .select("amount, category_id, categories(name)")
        .eq("user_id", user.id)
        .eq("type", "outflow")
        .eq("is_adjustment", false)
        .is("transfer_pair_id", null)
        .gte("date", startStr)
        .lte("date", endStr);

      if (txError) throw txError;

      const spendingMap: Record<string, { value: number; name: string }> = {};
      currentCycleTx.forEach((tx: any) => {
        const catName = tx.categories?.name || "Lainnya";
        if (!spendingMap[catName]) {
          spendingMap[catName] = { value: 0, name: catName };
        }
        spendingMap[catName].value += tx.amount;
      });

      const spendingByCategory: SpendingByCategory[] = Object.values(
        spendingMap,
      )
        .sort((a, b) => b.value - a.value)
        .map((cat, i) => ({
          ...cat,
          color: COLORS[i % COLORS.length],
        }));

      // 2 & 3. Income/Expense by Month & Net Worth Over Time (Last 5 Months)
      // We need transactions from the start of the 5th month ago up to today
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      // Calculate last 5 months range
      const months: {
        year: number;
        month: number;
        label: string;
        dateStr: string;
        income: number;
        expense: number;
        netWorth: number;
      }[] = [];
      for (let i = 4; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        months.push({
          year: d.getFullYear(),
          month: d.getMonth(),
          label: d.toLocaleString("id-ID", { month: "short" }),
          dateStr: d.toISOString().split("T")[0],
          income: 0,
          expense: 0,
          netWorth: 0,
        });
      }

      const fiveMonthsAgoStart = new Date(currentYear, currentMonth - 4, 1)
        .toISOString()
        .split("T")[0];

      // Get all transactions for the last 5 months
      const { data: historicalTx, error: histTxError } = await supabase
        .from("transactions")
        .select("amount, type, date")
        .eq("user_id", user.id)
        .eq("is_adjustment", false)
        .is("transfer_pair_id", null)
        .gte("date", fiveMonthsAgoStart);

      if (histTxError) throw histTxError;

      historicalTx.forEach((tx) => {
        const txDate = new Date(tx.date);
        const year = txDate.getFullYear();
        const month = txDate.getMonth();

        const monthEntry = months.find(
          (m) => m.year === year && m.month === month,
        );
        if (monthEntry) {
          if (tx.type === "inflow") monthEntry.income += tx.amount;
          else if (tx.type === "outflow") monthEntry.expense += tx.amount;
        }
      });

      // Get Current Net Worth
      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts")
        .select("opening_balance, transactions(amount, type)")
        .eq("user_id", user.id);

      if (accountsError) throw accountsError;

      let currentNetWorthValue = 0;
      accountsData.forEach((acc: any) => {
        let bal = acc.opening_balance || 0;
        if (acc.transactions) {
          acc.transactions.forEach((tx: any) => {
            if (tx.type === "inflow") bal += tx.amount;
            else if (tx.type === "outflow") bal -= tx.amount;
          });
        }
        currentNetWorthValue += bal;
      });

      let runningNetWorth = currentNetWorthValue;
      // Calculate backwards
      for (let i = months.length - 1; i >= 0; i--) {
        months[i].netWorth = runningNetWorth;
        const netChangeThisMonth = months[i].income - months[i].expense;
        runningNetWorth -= netChangeThisMonth;
      }

      const incomeExpenseByMonth: MonthlyFlow[] = months.map((m) => ({
        month: m.label,
        income: m.income,
        expense: m.expense,
      }));

      const netWorthOverTime: MonthlyNetWorth[] = months.map((m) => ({
        month: m.label,
        value: m.netWorth,
      }));

      return {
        spendingByCategory,
        incomeExpenseByMonth,
        netWorthOverTime,
      } as AnalyticsData;
    },
    enabled: !!user,
  });
}
