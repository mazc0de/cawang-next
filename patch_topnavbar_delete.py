import re

with open("src/components/layout/TopNavbar.tsx", "r") as f:
    content = f.read()

# Add Trash2 to imports
content = content.replace('LogOut,', 'LogOut,\n  Trash2,')

# Add deleteProfile to destructuring
content = content.replace('setActiveProfileId, createProfile', 'setActiveProfileId, createProfile, deleteProfile')

# Replace mapping
new_map = """{profiles.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  className="cursor-pointer font-bold text-ink hover:bg-canvas rounded-xl focus:bg-canvas focus:text-ink flex items-center justify-between px-3 py-2 font-space-grotesk"
                  onClick={(e) => {
                    // Prevent closing if we clicked the delete button
                    if ((e.target as HTMLElement).closest('.delete-btn')) {
                      e.preventDefault();
                      return;
                    }
                    setActiveProfileId(p.id);
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate">{p.name}</span>
                    {activeProfile?.id === p.id && (
                      <span className="w-2 h-2 rounded-full bg-mint border border-ink flex-shrink-0"></span>
                    )}
                  </div>
                  {profiles.length > 1 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Yakin hapus profil ${p.name}? Semua data di dalamnya akan hilang permanen.`)) {
                          deleteProfile(p.id);
                        }
                      }}
                      className="delete-btn text-ink/40 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                      title="Hapus Profil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </DropdownMenuItem>
              ))}"""

content = re.sub(
    r'\{profiles\.map\(\(p\) => \(\s*<DropdownMenuItem\s*key=\{p\.id\}\s*className="cursor-pointer font-bold text-ink hover:bg-canvas rounded-xl focus:bg-canvas focus:text-ink flex items-center justify-between px-3 py-2 font-space-grotesk"\s*onClick=\{[^}]+\}\s*>\s*<span className="truncate">\{p\.name\}</span>\s*\{activeProfile\?\.id === p\.id && \(\s*<span className="w-2 h-2 rounded-full bg-mint border border-ink"></span>\s*\)\}\s*</DropdownMenuItem>\s*\)\)\}',
    new_map,
    content
)

with open("src/components/layout/TopNavbar.tsx", "w") as f:
    f.write(content)
