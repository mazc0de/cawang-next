"use client";
import { toast } from "sonner";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/domain";

interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  setActiveProfileId: (id: string) => void;
  loading: boolean;
  createProfile: (name: string, isDefault?: boolean) => Promise<Profile>;
  deleteProfile: (id: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfiles([]);
      setActiveProfileIdState(null);
      setLoading(false);
      return;
    }

    async function fetchProfiles() {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setProfiles(data);
        if (data.length > 0) {
          const storedId = localStorage.getItem(`activeProfileId_${user!.id}`);
          const found = data.find((p) => p.id === storedId);
          if (found) {
            setActiveProfileIdState(found.id);
          } else {
            const def = data.find((p) => p.is_default) || data[0];
            setActiveProfileIdState(def.id);
          }
        } else {
          // Auto create default profile if none exists
          const { data: newProfile } = await supabase
            .from("profiles")
            .insert([{ user_id: user!.id, name: "Personal", is_default: true }])
            .select()
            .single();
          if (newProfile) {
            await supabase.from("financial_cycle_config").insert([
              { user_id: user!.id, profile_id: newProfile.id, start_day: 1 }
            ]);
            setProfiles([newProfile]);
            setActiveProfileIdState(newProfile.id);
          }
        }
      }
      setLoading(false);
    }
    fetchProfiles();
  }, [user]);

  const setActiveProfileId = (id: string) => {
    if (id !== activeProfileId) {
      setActiveProfileIdState(id);
      if (user) {
        localStorage.setItem(`activeProfileId_${user.id}`, id);
      }
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  const createProfile = async (name: string, isDefault = false) => {
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("profiles")
      .insert([{ user_id: user.id, name, is_default: isDefault }])
      .select()
      .single();
    if (error) throw error;
    
    // Create default config
    await supabase.from("financial_cycle_config").insert([
      { user_id: user.id, profile_id: data.id, start_day: 1 }
    ]);

    // Create default categories
    const defaultCategories = [
      { name: 'Makan & Minum', icon: '🍜', color: '#f97316', type: 'outflow' },
      { name: 'Transport', icon: '🚗', color: '#3b82f6', type: 'outflow' },
      { name: 'Belanja', icon: '🛒', color: '#a855f7', type: 'outflow' },
      { name: 'Tagihan & Utilitas', icon: '💡', color: '#eab308', type: 'outflow' },
      { name: 'Kesehatan', icon: '💊', color: '#ef4444', type: 'outflow' },
      { name: 'Hiburan', icon: '🎬', color: '#ec4899', type: 'outflow' },
      { name: 'Pendidikan', icon: '📚', color: '#06b6d4', type: 'outflow' },
      { name: 'Lain-lain', icon: '📦', color: '#94a3b8', type: 'outflow' },
      { name: 'Gaji', icon: '💰', color: '#22c55e', type: 'inflow' },
      { name: 'Pendapatan Lain', icon: '💵', color: '#6ee7b7', type: 'inflow' },
    ].map(cat => ({
      ...cat,
      user_id: user.id,
      profile_id: data.id
    }));
    
    await supabase.from("categories").insert(defaultCategories);

    setProfiles((prev) => [...prev, data]);
    setActiveProfileIdState(data.id);
    if (user) localStorage.setItem(`activeProfileId_${user.id}`, data.id);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    toast.success("Profil berhasil dibuat!");
    return data;
  };

  const deleteProfile = async (id: string) => {
    if (!user) throw new Error("Not authenticated");
    if (profiles.length <= 1) throw new Error("Cannot delete the last profile");

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
      
    if (error) throw error;
    
    setProfiles((prev) => {
      const newProfiles = prev.filter((p) => p.id !== id);
      // If we deleted the active profile, switch to another one
      if (activeProfileId === id && newProfiles.length > 0) {
        setActiveProfileIdState(newProfiles[0].id);
        localStorage.setItem(`activeProfileId_${user.id}`, newProfiles[0].id);
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }
      toast.success("Profil berhasil dihapus!");
      return newProfiles;
    });
  };

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || null;

  return (
    <ProfileContext.Provider value={{ profiles, activeProfile, setActiveProfileId, loading, createProfile, deleteProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
