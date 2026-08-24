import glob
import re

for h in glob.glob("src/hooks/*.ts"):
    with open(h, "r") as f:
        content = f.read()

    if content.startswith('import { toast } from "sonner";\n"use client";'):
        content = content.replace('import { toast } from "sonner";\n"use client";', '"use client";\nimport { toast } from "sonner";')
        with open(h, "w") as f:
            f.write(content)

# Also fix ProfileContext.tsx
with open("src/contexts/ProfileContext.tsx", "r") as f:
    content = f.read()
if content.startswith('import { toast } from "sonner";\n"use client";'):
    content = content.replace('import { toast } from "sonner";\n"use client";', '"use client";\nimport { toast } from "sonner";')
    with open("src/contexts/ProfileContext.tsx", "w") as f:
        f.write(content)

