import re

with open("src/contexts/ProfileContext.tsx", "r") as f:
    content = f.read()

# 1. Add deleteProfile to interface
content = content.replace(
    '  createProfile: (name: string, isDefault?: boolean) => Promise<Profile>;',
    '  createProfile: (name: string, isDefault?: boolean) => Promise<Profile>;\n  deleteProfile: (id: string) => Promise<void>;'
)

# 2. Add deleteProfile implementation
delete_impl = """  const deleteProfile = async (id: string) => {
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
      if (activeProfileIdState === id && newProfiles.length > 0) {
        setActiveProfileIdState(newProfiles[0].id);
        localStorage.setItem(`activeProfileId_${user.id}`, newProfiles[0].id);
      }
      return newProfiles;
    });
  };

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || null;"""

content = re.sub(
    r'  const activeProfile = profiles\.find\(\(p\) => p\.id === activeProfileId\) \|\| null;',
    delete_impl,
    content
)

# 3. Add to provider value
content = content.replace(
    'createProfile }}',
    'createProfile, deleteProfile }}'
)

with open("src/contexts/ProfileContext.tsx", "w") as f:
    f.write(content)
