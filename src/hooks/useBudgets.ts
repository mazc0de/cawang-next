"use client";
import { toast } from "sonner";
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

      // Fetch budgets (no longer filtered by cycle)
      const { data: budgets, error: budgetError } = await supabase
        .from("budgets")
        .select("*, category:categories(*), account:accounts(*)")
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id);

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
        .select("category_id, account_id, amount")
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
          const keyGen = tx.category_id;
          acc[keyGen] = (acc[keyGen] || 0) + tx.amount;
          const keyAcc = `${tx.category_id}_${tx.account_id}`;
          acc[keyAcc] = (acc[keyAcc] || 0) + tx.amount;
          return acc;
        },
        {},
      );

      return (budgets || []).map((budget) => {
        const spentKey = budget.account_id ? `${budget.category_id}_${budget.account_id}` : budget.category_id;
        return {
          ...budget,
          spent: spentMap[spentKey] || 0,
        };
      }) as Budget[];
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
        | "profile_id" | "created_at" | "updated_at" | "category" | "spent" | "account"
      > & { id?: string },
    ) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      
      if (budget.id) {
        // Edit mode explicitly provided ID
        const { id, ...updates } = budget;
        const { data, error } = await supabase
          .from("budgets")
          .update({ amount: updates.amount, account_id: updates.account_id })
          .eq("id", id)
          .eq("profile_id", activeProfile!.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      
      let query = supabase
        .from("budgets")
        .select("id")
        .eq("profile_id", activeProfile!.id)
        .eq("category_id", budget.category_id);
        
      if (budget.account_id) {
        query = query.eq("account_id", budget.account_id);
      } else {
        query = query.is("account_id", null);
      }
      
      const { data: existing } = await query.maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("budgets")
          .update({ amount: budget.amount })
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("budgets")
          .insert([{ ...budget, user_id: user.id, profile_id: activeProfile!.id }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onError: (err: any) => {

      toast.error(err.message || "Terjadi kesalahan!");

    },

    onSuccess: () => {
      toast.success("Budget berhasil disimpan!");
      queryClient.invalidateQueries({
        queryKey: [
          "budgets",
          user?.id,
          activeProfile?.id,
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
    onError: (err: any) => {

      toast.error(err.message || "Terjadi kesalahan!");

    },

    onSuccess: () => {
      toast.success("Budget berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["budgets", user?.id, activeProfile?.id] });
    },
  });
}
