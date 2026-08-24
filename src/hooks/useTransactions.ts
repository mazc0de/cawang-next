"use client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import type { Transaction } from "@/types/domain";

export interface TransactionFilters {
  account_id?: string;
  category_id?: string;
  start_date?: string;
  end_date?: string;
  type?: "inflow" | "outflow";
}

export function useTransactions(filters?: TransactionFilters) {
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useQuery({
    queryKey: ["transactions", user?.id, activeProfile?.id, filters],
    queryFn: async () => {
      if (!user || !activeProfile) return [];

      let query = supabase
        .from("transactions")
        .select(
          "*, account:accounts(id,name,type), category:categories(id,name,icon,color,type), transaction_tags(tag:tags(id,name))",
        )
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id)
        .order("date", { ascending: false });

      if (filters?.account_id)
        query = query.eq("account_id", filters.account_id);
      if (filters?.category_id)
        query = query.eq("category_id", filters.category_id);
      if (filters?.start_date) query = query.gte("date", filters.start_date);
      if (filters?.end_date) query = query.lte("date", filters.end_date);
      if (filters?.type) query = query.eq("type", filters.type);

      const { data, error } = await query;

      if (error) throw error;

      // Transform tags from junction table relation
      return (data || []).map((tx: any) => {
        const tags = tx.transaction_tags?.map((tt: any) => tt.tag) || [];
        const { transaction_tags: _transaction_tags, ...rest } = tx;
        return {
          ...rest,
          tags,
        } as Transaction;
      });
    },
    enabled: !!user && !!activeProfile,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async (
      newTransaction: Omit<
        Transaction,
        | "id"
        | "user_id"
        | "profile_id"
        | "created_at"
        | "updated_at"
        | "account"
        | "category"
        | "tags"
      >,
    ) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      const { data, error } = await supabase
        .from("transactions")
        .insert([{ ...newTransaction, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onError: (err: any) => {

      toast.error(err.message || "Terjadi kesalahan!");

    },

    onSuccess: () => {
      toast.success("Transaksi berhasil dicatat!");
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id, activeProfile?.id] });
      queryClient.invalidateQueries({ queryKey: ["accounts", user?.id, activeProfile?.id] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard_stats", user?.id, activeProfile?.id],
      });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Transaction> & { id: string }) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      const { data, error } = await supabase
        .from("transactions")
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
      toast.success("Transaksi berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id, activeProfile?.id] });
      queryClient.invalidateQueries({ queryKey: ["accounts", user?.id, activeProfile?.id] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard_stats", user?.id, activeProfile?.id],
      });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");

      // First get the transaction to see if it has a transfer pair
      const { data: tx, error: fetchError } = await supabase
        .from("transactions")
        .select("transfer_pair_id")
        .eq("id", id)
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id)
        .single();

      if (fetchError) throw fetchError;

      if (tx?.transfer_pair_id) {
        // Delete both transactions in the pair
        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("transfer_pair_id", tx.transfer_pair_id)
          .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id);
        if (error) throw error;
      } else {
        // Delete single transaction
        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id);
        if (error) throw error;
      }
    },
    onError: (err: any) => {

      toast.error(err.message || "Terjadi kesalahan!");

    },

    onSuccess: () => {
      toast.success("Transaksi berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id, activeProfile?.id] });
      queryClient.invalidateQueries({ queryKey: ["accounts", user?.id, activeProfile?.id] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard_stats", user?.id, activeProfile?.id],
      });
    },
  });
}
