import glob
import re

for h in glob.glob("src/hooks/*.ts"):
    with open(h, "r") as f:
        content = f.read()

    # .eq("profile_id", activeProfile.id) -> .eq("profile_id", activeProfile!.id)
    content = content.replace('activeProfile.id', 'activeProfile!.id')
    
    with open(h, "w") as f:
        f.write(content)
