import re

with open("src/views/BudgetPage.tsx", "r") as f:
    content = f.read()

# Add addAccountId state
content = content.replace(
    'const [addCategoryId, setAddCategoryId] = useState("");',
    'const [addCategoryId, setAddCategoryId] = useState("");\n  const [addAccountId, setAddAccountId] = useState("all");'
)

# Fetch accounts
content = content.replace(
    'const { data: categories = [] } = useCategories();',
    'const { data: categories = [] } = useCategories();\n  const { data: accounts = [] } = useAccounts();'
)
if "useAccounts" not in content:
    content = content.replace(
        'import { useCategories } from "@/hooks/useCategories";',
        'import { useCategories } from "@/hooks/useCategories";\nimport { useAccounts } from "@/hooks/useAccounts";'
    )

# Reset form on OpenAdd
content = content.replace(
    'setAddAmount("");',
    'setAddAmount("");\n    setAddAccountId("all");'
)

# Set states on Edit
content = content.replace(
    'setAddCategoryId(b.category_id);\n    setAddAmount(String(b.amount));',
    'setAddCategoryId(b.category_id);\n    setAddAmount(String(b.amount));\n    setAddAccountId(b.account_id || "all");'
)

# Pass addAccountId to mutateAsync
content = content.replace(
    'category_id: addCategoryId,\n      amount: Number(addAmount),',
    'category_id: addCategoryId,\n      account_id: addAccountId === "all" ? null : addAccountId,\n      amount: Number(addAmount),'
)

# Add Select for account to the form
account_select = """              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="budget-account"
                  className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
                >
                  Akun (Opsional)
                </Label>
                <Select value={addAccountId} onValueChange={setAddAccountId}>
                  <SelectTrigger
                    id="budget-account"
                    className="h-10 text-xs font-space-grotesk font-bold"
                  >
                    <SelectValue placeholder="Pilih akun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Akun</SelectItem>
                    {accounts.map((acc: any) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>"""

content = re.sub(
    r'              </div>\s+<div className="space-y-2">\s+<Label\s+htmlFor="budget-amount"',
    account_select + '\n              <div className="space-y-2">\n                <Label\n                  htmlFor="budget-amount"',
    content
)

with open("src/views/BudgetPage.tsx", "w") as f:
    f.write(content)

