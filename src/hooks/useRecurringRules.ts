"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import type { RecurringRule, PendingConfirmation } from "@/types/domain";

export function useRecurringRules() {
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useQuery({
    queryKey: ["recurring_rules", user?.id, activeProfile?.id, activeProfile?.id],
    queryFn: async () => {
      if (!user || !activeProfile) return [];

      const { data, error } = await supabase
        .from("recurring_rules")
        .select("*, account:accounts(*), category:categories(*)")
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id)
        .order("next_due_date");

      if (error) throw error;
      return data as RecurringRule[];
    },
    enabled: !!user && !!activeProfile,
  });
}

export function usePendingConfirmations() {
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useQuery({
    queryKey: ["pending_confirmations", user?.id, activeProfile?.id, activeProfile?.id],
    queryFn: async () => {
      if (!user || !activeProfile) return [];

      const todayStr = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("recurring_rules")
        .select("*, account:accounts(*), category:categories(*)")
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id)
        .eq("is_active", true)
        .eq("posting_mode", "requires_confirmation")
        .lte("next_due_date", todayStr)
        .order("next_due_date");

      if (error) throw error;

      return data.map((rule) => ({
        recurring_rule: rule,
        due_date: rule.next_due_date,
      })) as PendingConfirmation[];
    },
    enabled: !!user && !!activeProfile,
  });
}

export function useCreateRecurringRule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async (
      newRule: Omit<
        RecurringRule,
        "id" | "user_id"
        | "profile_id" | "created_at" | "updated_at" | "account" | "category"
      >,
    ) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      const { data, error } = await supabase
        .from("recurring_rules")
        .insert([{ ...newRule, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recurring_rules", user?.id, activeProfile?.id, activeProfile?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["pending_confirmations", user?.id, activeProfile?.id, activeProfile?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard_stats", user?.id, activeProfile?.id, activeProfile?.id],
      });
    },
  });
}

export function useUpdateRecurringRule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<RecurringRule> & { id: string }) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      const { data, error } = await supabase
        .from("recurring_rules")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recurring_rules", user?.id, activeProfile?.id, activeProfile?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["pending_confirmations", user?.id, activeProfile?.id, activeProfile?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard_stats", user?.id, activeProfile?.id, activeProfile?.id],
      });
    },
  });
}

export function useToggleRecurringRule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      const { data, error } = await supabase
        .from("recurring_rules")
        .update({ is_active })
        .eq("id", id)
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recurring_rules", user?.id, activeProfile?.id, activeProfile?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["pending_confirmations", user?.id, activeProfile?.id, activeProfile?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard_stats", user?.id, activeProfile?.id, activeProfile?.id],
      });
    },
  });
}

export function useDeleteRecurringRule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      const { error } = await supabase
        .from("recurring_rules")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recurring_rules", user?.id, activeProfile?.id, activeProfile?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["pending_confirmations", user?.id, activeProfile?.id, activeProfile?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard_stats", user?.id, activeProfile?.id, activeProfile?.id],
      });
    },
  });
}

export function useApproveRecurringRule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async (rule: RecurringRule) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");

      // 1. Create transaction
      const { error: txError } = await supabase.from("transactions").insert([
        {
          user_id: user.id,
          account_id: rule.account_id,
          category_id: rule.category_id,
          amount: rule.amount,
          type: rule.type,
          date: rule.next_due_date,
          notes: rule.description,
          is_adjustment: false,
        },
      ]);

      if (txError) throw txError;

      // 2. Calculate next due date
      const currentDue = new Date(rule.next_due_date);
      const nextDue = new Date(currentDue);

      switch (rule.frequency) {
        case "daily":
          nextDue.setDate(currentDue.getDate() + 1);
          break;
        case "weekly":
          nextDue.setDate(currentDue.getDate() + 7);
          break;
        case "monthly":
          nextDue.setMonth(currentDue.getMonth() + 1);
          break;
        case "yearly":
          nextDue.setFullYear(currentDue.getFullYear() + 1);
          break;
      }

      const nextDueStr = nextDue.toISOString().split("T")[0];

      // 3. Update rule
      const { data, error: updateError } = await supabase
        .from("recurring_rules")
        .update({ next_due_date: nextDueStr })
        .eq("id", rule.id)
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recurring_rules", user?.id, activeProfile?.id, activeProfile?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["pending_confirmations", user?.id, activeProfile?.id, activeProfile?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id, activeProfile?.id, activeProfile?.id] });
      queryClient.invalidateQueries({ queryKey: ["accounts", user?.id, activeProfile?.id, activeProfile?.id] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard_stats", user?.id, activeProfile?.id, activeProfile?.id],
      });
    },
  });
}
