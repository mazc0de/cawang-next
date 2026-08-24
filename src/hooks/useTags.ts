"use client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import type { Tag } from "@/types/domain";

export function useTags() {
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useQuery({
    queryKey: ["tags", user?.id, activeProfile?.id],
    queryFn: async () => {
      if (!user || !activeProfile) return [];

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("user_id", user.id)
        .eq("profile_id", activeProfile!.id)
        .order("name");

      if (error) throw error;
      return data as Tag[];
    },
    enabled: !!user && !!activeProfile,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeProfile } = useProfile();

  return useMutation({
    mutationFn: async (newTag: Omit<Tag, "id" | "user_id"
        | "profile_id" | "created_at">) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      const { data, error } = await supabase
        .from("tags")
        .insert([{ ...newTag, user_id: user.id, profile_id: activeProfile!.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onError: (err: any) => {

      toast.error(err.message || "Terjadi kesalahan!");

    },

    onSuccess: () => {
      toast.success("Tag berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: ["tags", user?.id, activeProfile?.id] });
    },
  });
}
