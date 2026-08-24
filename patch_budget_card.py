import re

with open("src/views/BudgetPage.tsx", "r") as f:
    content = f.read()

new_name = """                        <h4 className="font-archivo-black text-base text-ink truncate flex items-center gap-2">
                          {b.category?.name ?? "—"}
                          {b.account_id && <span className="text-[10px] bg-canvas px-1.5 py-0.5 rounded-sm border border-ink/20 font-space-grotesk tracking-tight text-ink/70 max-w-[80px] truncate">{b.account?.name}</span>}
                        </h4>"""

content = content.replace(
    '<h4 className="font-archivo-black text-base text-ink truncate">\n                          {b.category?.name ?? "—"}\n                        </h4>',
    new_name
)

with open("src/views/BudgetPage.tsx", "w") as f:
    f.write(content)
