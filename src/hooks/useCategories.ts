"use client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import type { Category } from "@/types/domain";

export function useCategories(type?: "inflow" | "outflow") {
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useQuery({
    queryKey: ["categories", user?.id, activeProfile?.id, type],
    queryFn: async () => {
      if (!user || !activeProfile) return [];

      let query = supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id)
        .order("name");

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user && !!activeProfile,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async (
      newCategory: Omit<Category, "id" | "user_id"
        | "profile_id" | "created_at">,
    ) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      const { data, error } = await supabase
        .from("categories")
        .insert([{ ...newCategory, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onError: (err: any) => {

      toast.error(err.message || "Terjadi kesalahan!");

    },

    onSuccess: () => {
      toast.success("Kategori berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: ["categories", user?.id, activeProfile?.id] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      const { error } = await supabase
        .from("categories")
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
      toast.success("Kategori berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["categories", user?.id, activeProfile?.id] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Category> & { id: string }) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      const { data, error } = await supabase
        .from("categories")
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
      toast.success("Kategori berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["categories", user?.id, activeProfile?.id] });
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id, activeProfile?.id] });
      queryClient.invalidateQueries({
        queryKey: ["recurring_rules", user?.id, activeProfile?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["budgets", user?.id, activeProfile?.id] });
    },
  });
}
