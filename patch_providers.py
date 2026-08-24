import re

with open("src/app/providers.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'import { ProfileProvider } from "@/contexts/ProfileContext";',
    'import { ProfileProvider } from "@/contexts/ProfileContext";\nimport { Toaster } from "@/components/ui/sonner";'
)

content = content.replace(
    '<ProfileProvider>{children}</ProfileProvider>',
    '<ProfileProvider>{children}\n          <Toaster position="top-center" />\n        </ProfileProvider>'
)

with open("src/app/providers.tsx", "w") as f:
    f.write(content)
