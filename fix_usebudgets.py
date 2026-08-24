import re

with open("src/hooks/useBudgets.ts", "r") as f:
    content = f.read()

content = content.replace(
    '{ ...budget, user_id: user.id },',
    '{ ...budget, user_id: user.id, profile_id: activeProfile.id },'
)

content = content.replace(
    'onConflict: "user_id,category_id,cycle_year,cycle_month",',
    'onConflict: "profile_id,category_id,cycle_year,cycle_month",'
)

content = content.replace(
    'queryKey: [\n          "budgets",\n          user?.id,\n          variables.cycle_year,\n          variables.cycle_month,\n        ],',
    'queryKey: [\n          "budgets",\n          user?.id,\n          activeProfile?.id,\n          variables.cycle_year,\n          variables.cycle_month,\n        ],'
)

with open("src/hooks/useBudgets.ts", "w") as f:
    f.write(content)
