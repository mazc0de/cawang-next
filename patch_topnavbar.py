import re

with open("src/components/layout/TopNavbar.tsx", "r") as f:
    content = f.read()

# Add useProfile import
if "useProfile" not in content:
    content = content.replace('import { useAuth } from "@/contexts/AuthContext";', 'import { useAuth } from "@/contexts/AuthContext";\nimport { useProfile } from "@/contexts/ProfileContext";')

# Get activeProfile from hook
content = content.replace('const { user, signOut } = useAuth();', 'const { user, signOut } = useAuth();\n  const { profiles, activeProfile, setActiveProfileId, createProfile } = useProfile();')

# Replace the Profile Dropdown with a new one that supports Workspaces
new_dropdown = """
            <DropdownMenuContent
              className="w-56 rounded-[16px] border-2 border-ink shadow-hard-md mt-2 p-2 bg-white"
              align="end"
            >
              <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Profiles
              </div>
              {profiles.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  className="cursor-pointer font-bold text-ink hover:bg-canvas rounded-xl focus:bg-canvas focus:text-ink flex items-center justify-between px-3 py-2 font-space-grotesk"
                  onClick={() => setActiveProfileId(p.id)}
                >
                  <span className="truncate">{p.name}</span>
                  {activeProfile?.id === p.id && (
                    <span className="w-2 h-2 rounded-full bg-mint border border-ink"></span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                className="cursor-pointer font-bold text-hot-pink hover:bg-canvas rounded-xl focus:bg-canvas focus:text-hot-pink flex items-center gap-2 px-3 py-2 font-space-grotesk"
                onClick={async () => {
                  const name = prompt("Enter new profile name:");
                  if (name) {
                    await createProfile(name);
                  }
                }}
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                New Profile
              </DropdownMenuItem>
              
              <div className="h-px bg-ink/20 my-1 mx-2" />

              <DropdownMenuItem
                id="btn-signout"
                className="cursor-pointer font-bold text-ink hover:bg-canvas rounded-xl focus:bg-canvas focus:text-ink flex items-center gap-2 px-3 py-2 font-space-grotesk"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" strokeWidth={2.5} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
"""

# Replace the old DropdownMenuContent for both desktop and mobile
content = re.sub(
    r'<DropdownMenuContent\s+className="w-48 rounded-\[16px\] border-2 border-ink shadow-hard-md mt-2 p-2 bg-white"\s+align="end"\s*>\s*<DropdownMenuItem\s+id="btn-signout(-mobile)?"\s+className="cursor-pointer font-bold text-ink hover:bg-canvas rounded-xl focus:bg-canvas focus:text-ink flex items-center gap-2 px-3 py-2 font-space-grotesk"\s+onClick=\{signOut\}\s*>\s*<LogOut className="h-4 w-4" strokeWidth=\{2\.5\} />\s*Sign out\s*</DropdownMenuItem>\s*</DropdownMenuContent>',
    new_dropdown,
    content,
    flags=re.MULTILINE
)

with open("src/components/layout/TopNavbar.tsx", "w") as f:
    f.write(content)
