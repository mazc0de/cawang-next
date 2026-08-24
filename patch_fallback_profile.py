import re

with open("src/contexts/ProfileContext.tsx", "r") as f:
    content = f.read()

new_fallback = """          const { data: newProfile } = await supabase
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
          }"""

content = re.sub(
    r'          const \{ data: newProfile \} = await supabase\n            \.from\("profiles"\)\n            \.insert\(\[\{ user_id: user!\.id, name: "Personal", is_default: true \}\]\)\n            \.select\(\)\n            \.single\(\);\n          if \(newProfile\) \{\n            setProfiles\(\[newProfile\]\);\n            setActiveProfileIdState\(newProfile\.id\);\n          \}',
    new_fallback,
    content,
    flags=re.DOTALL
)

with open("src/contexts/ProfileContext.tsx", "w") as f:
    f.write(content)
