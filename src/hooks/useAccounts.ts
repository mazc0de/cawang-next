"use client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import type { Account } from "@/types/domain";

export type AccountWithBalance = Account & { actual_balance: number };

export function useAccounts() {
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useQuery({
    queryKey: ["accounts", user?.id, activeProfile?.id],
    queryFn: async () => {
      if (!user || !activeProfile) return [];

      const { data, error } = await supabase
        .from("accounts")
        .select("*, transactions(amount, type)")
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id)
        .order("name");

      if (error) throw error;

      return (data || []).map((acc: any) => {
        let actual_balance = acc.opening_balance || 0;
        if (acc.transactions && Array.isArray(acc.transactions)) {
          acc.transactions.forEach((tx: any) => {
            if (tx.type === "inflow") {
              actual_balance += tx.amount;
            } else if (tx.type === "outflow") {
              actual_balance -= tx.amount;
            }
          });
        }
        // Remove transactions array from final object to keep it clean
        const { transactions: _transactions, ...rest } = acc;
        return {
          ...rest,
          actual_balance,
        } as AccountWithBalance;
      });
    },
    enabled: !!user && !!activeProfile,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async (
      newAccount: Omit<Account, "id" | "user_id"
        | "profile_id" | "created_at" | "updated_at">,
    ) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      const { data, error } = await supabase
        .from("accounts")
        .insert([{ ...newAccount, user_id: user.id, profile_id: activeProfile!.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onError: (err: any) => {

      toast.error(err.message || "Terjadi kesalahan!");

    },

    onSuccess: () => {
      toast.success("Akun berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: ["accounts", user?.id, activeProfile?.id] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Account> & { id: string }) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      const { data, error } = await supabase
        .from("accounts")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onError: (err: any) => {

      toast.error(err.message || "Terjadi kesalahan!");

    },

    onSuccess: () => {
      toast.success("Akun berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["accounts", user?.id, activeProfile?.id] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      const { error } = await supabase
        .from("accounts")
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
      toast.success("Akun berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["accounts", user?.id, activeProfile?.id] });
    },
  });
}
