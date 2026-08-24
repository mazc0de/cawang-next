"use client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import type { FinancialCycleConfig } from "@/types/domain";

export function useFinancialCycleConfig() {
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useQuery({
    queryKey: ["financial_cycle_config", user?.id, activeProfile?.id],
    queryFn: async () => {
      if (!user || !activeProfile) return null;

      const { data, error } = await supabase
        .from("financial_cycle_config")
        .select("*")
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 is no rows returned
      return (data as FinancialCycleConfig) || { start_day: 1 };
    },
    enabled: !!user && !!activeProfile,
  });
}

export function useUpdateFinancialCycleConfig() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async (start_day: number) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      const { data, error } = await supabase
        .from("financial_cycle_config")
        .upsert({ user_id: user.id, profile_id: activeProfile.id, start_day }, { onConflict: "profile_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onError: (err: any) => {

      toast.error(err.message || "Terjadi kesalahan!");

    },

    onSuccess: () => {
      toast.success("Siklus berhasil diperbarui!");
      queryClient.invalidateQueries({
        queryKey: ["financial_cycle_config", user?.id, activeProfile?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["budgets", user?.id, activeProfile?.id] });
    },
  });
}
