import glob
import re

for h in glob.glob("src/hooks/*.ts"):
    with open(h, "r") as f:
        content = f.read()

    # Omit<..., "user_id" ...>
    content = re.sub(r'Omit<([^,]+),\s*"user_id"', r'Omit<\1, "user_id" | "profile_id"', content)
    content = content.replace('| "user_id"', '| "user_id"\n        | "profile_id"')
    
    with open(h, "w") as f:
        f.write(content)
