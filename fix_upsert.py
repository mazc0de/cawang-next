import re

with open("src/hooks/useFinancialCycleConfig.ts", "r") as f:
    content = f.read()

content = content.replace(
    '.upsert({ user_id: user.id, start_day }, { onConflict: "user_id" })',
    '.upsert({ user_id: user.id, profile_id: activeProfile.id, start_day }, { onConflict: "profile_id" })'
)

with open("src/hooks/useFinancialCycleConfig.ts", "w") as f:
    f.write(content)
