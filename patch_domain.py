import re

with open("src/types/domain.ts", "r") as f:
    content = f.read()

content = content.replace(
    '  category_id: string;\n  cycle_year: number;',
    '  category_id: string;\n  account_id?: string | null;\n  cycle_year: number;'
)

content = content.replace(
    '  category?: Category;\n  spent?: number;',
    '  category?: Category;\n  account?: Account;\n  spent?: number;'
)

with open("src/types/domain.ts", "w") as f:
    f.write(content)
