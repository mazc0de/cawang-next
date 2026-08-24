"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import type { Budget } from "@/types/domain";

export function useBudgets(cycleYear: number, cycleMonth: number) {
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useQuery({
    queryKey: ["budgets", user?.id, activeProfile?.id, cycleYear, cycleMonth],
    queryFn: async () => {
      if (!user || !activeProfile) return [];

      // Fetch budgets
      const { data: budgets, error: budgetError } = await supabase
        .from("budgets")
        .select("*, category:categories(*)")
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id)
        .eq("cycle_year", cycleYear)
        .eq("cycle_month", cycleMonth);

      if (budgetError) throw budgetError;

      const { data: config } = await supabase
        .from("financial_cycle_config")
        .select("start_day")
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id)
        .single();
      const startDay = config?.start_day || 1;

      const startDate = new Date(cycleYear, cycleMonth - 1, startDay);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(endDate.getDate() - 1);

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      const { data: transactions, error: txError } = await supabase
        .from("transactions")
        .select("category_id, amount")
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id)
        .eq("type", "outflow")
        .eq("is_adjustment", false)
        .is("transfer_pair_id", null)
        .gte("date", startDateStr)
        .lte("date", endDateStr);

      if (txError) throw txError;

      const spentMap = transactions.reduce(
        (acc: Record<string, number>, tx) => {
          acc[tx.category_id] = (acc[tx.category_id] || 0) + tx.amount;
          return acc;
        },
        {},
      );

      return (budgets || []).map((budget) => ({
        ...budget,
        spent: spentMap[budget.category_id] || 0,
      })) as Budget[];
    },
    enabled: !!user && !!activeProfile && !!cycleYear && !!cycleMonth,
  });
}

export function useUpsertBudget() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async (
      budget: Omit<
        Budget,
        "id" | "user_id"
        | "profile_id" | "created_at" | "updated_at" | "category" | "spent"
      >,
    ) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      const { data, error } = await supabase
        .from("budgets")
        .upsert(
          { ...budget, user_id: user.id, profile_id: activeProfile.id },
          {
            onConflict: "profile_id,category_id,cycle_year,cycle_month",
          },
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "budgets",
          user?.id,
          activeProfile?.id,
          variables.cycle_year,
          variables.cycle_month,
        ],
      });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", user?.id, activeProfile?.id] });
    },
  });
}
