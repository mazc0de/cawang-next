import glob
import re

for h in glob.glob("src/hooks/*.ts"):
    with open(h, "r") as f:
        content = f.read()

    # Match .insert([{ ...something, user_id: user.id }])
    content = re.sub(r'user_id: user\.id(\s*)\}', r'user_id: user.id, profile_id: activeProfile!.id\1}', content)
    
    # Match user_id: user.id, account_id: rule.account_id,
    content = re.sub(r'user_id: user\.id,', r'user_id: user.id, profile_id: activeProfile!.id,', content)

    with open(h, "w") as f:
        f.write(content)
