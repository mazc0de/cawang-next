import re

with open("src/contexts/ProfileContext.tsx", "r") as f:
    content = f.read()

new_create_profile = """  const createProfile = async (name: string, isDefault = false) => {
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
    return data;
  };"""

content = re.sub(
    r'  const createProfile = async \(name: string, isDefault = false\) => \{.*?\n  \};',
    new_create_profile,
    content,
    flags=re.DOTALL
)

with open("src/contexts/ProfileContext.tsx", "w") as f:
    f.write(content)
