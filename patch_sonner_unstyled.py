import re

with open("src/components/ui/sonner.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'toastOptions={{',
    'toastOptions={{\n        unstyled: true,'
)

with open("src/components/ui/sonner.tsx", "w") as f:
    f.write(content)
