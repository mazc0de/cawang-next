import glob
import re

for h in glob.glob("src/hooks/*.ts"):
    with open(h, "r") as f:
        content = f.read()

    # Remove duplicates
    content = content.replace('profile_id: activeProfile!.id, profile_id: activeProfile!.id', 'profile_id: activeProfile!.id')

    with open(h, "w") as f:
        f.write(content)
