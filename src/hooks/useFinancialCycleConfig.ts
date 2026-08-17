"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { FinancialCycleConfig } from "@/types/domain";

export function useFinancialCycleConfig() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["financial_cycle_config", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("financial_cycle_config")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 is no rows returned
      return (data as FinancialCycleConfig) || { start_day: 1 };
    },
    enabled: !!user,
  });
}

export function useUpdateFinancialCycleConfig() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (start_day: number) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("financial_cycle_config")
        .upsert({ user_id: user.id, start_day }, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["financial_cycle_config", user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["budgets", user?.id] });
    },
  });
}
