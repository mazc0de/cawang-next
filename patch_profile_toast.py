import re

with open("src/contexts/ProfileContext.tsx", "r") as f:
    content = f.read()

if "import { toast } from \"sonner\";" not in content:
    content = 'import { toast } from "sonner";\n' + content

content = content.replace(
    'return data;',
    'toast.success("Profil berhasil dibuat!");\n    return data;'
)

content = content.replace(
    'return newProfiles;',
    'toast.success("Profil berhasil dihapus!");\n      return newProfiles;'
)

with open("src/contexts/ProfileContext.tsx", "w") as f:
    f.write(content)
