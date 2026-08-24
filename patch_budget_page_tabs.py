import re

with open("src/views/BudgetPage.tsx", "r") as f:
    content = f.read()

# 1. Add state for selectedTabAccountId
content = content.replace(
    '  const [addAmount, setAddAmount] = useState("");',
    '  const [addAmount, setAddAmount] = useState("");\n  const [selectedTabAccountId, setSelectedTabAccountId] = useState("all");'
)

# 2. Add Tab switcher UI right before Main Content with Budgets
# Wait, even if budgets length === 0, they might want to switch tabs? Yes, but if there's no budgets at all maybe it's fine.
# Let's put it above the Overview Card.
tabs_ui = """      {/* Account Tabs */}
      {!isLoading && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedTabAccountId("all")}
            className={cn(
              "px-4 py-2 rounded-full border-2 border-ink text-sm font-space-grotesk font-bold whitespace-nowrap transition-colors",
              selectedTabAccountId === "all" ? "bg-ink text-white" : "bg-white text-ink hover:bg-canvas"
            )}
          >
            Semua Akun
          </button>
          {accounts.map((acc: any) => (
            <button
              key={acc.id}
              onClick={() => setSelectedTabAccountId(acc.id)}
              className={cn(
                "px-4 py-2 rounded-full border-2 border-ink text-sm font-space-grotesk font-bold whitespace-nowrap transition-colors",
                selectedTabAccountId === acc.id ? "bg-ink text-white" : "bg-white text-ink hover:bg-canvas"
              )}
            >
              {acc.name}
            </button>
          ))}
        </div>
      )}"""

content = content.replace(
    '{/* Empty State */}',
    tabs_ui + '\n\n      {/* Empty State */}'
)

# 3. Filter budgets
content = content.replace(
    '  const totalBudget = budgets.reduce((s: number, b: any) => s + b.amount, 0);',
    '  const filteredBudgets = budgets.filter((b: any) => selectedTabAccountId === "all" ? true : b.account_id === selectedTabAccountId);\n  const totalBudget = filteredBudgets.reduce((s: number, b: any) => s + b.amount, 0);'
)
content = content.replace(
    '  const totalSpent = budgets.reduce(',
    '  const totalSpent = filteredBudgets.reduce('
)
content = content.replace(
    'const budgetedCategoryIds = new Set(budgets.map',
    'const budgetedCategoryIds = new Set(filteredBudgets.map'
)
content = content.replace(
    '{!isLoading && budgets.length === 0 && (',
    '{!isLoading && filteredBudgets.length === 0 && ('
)
content = content.replace(
    '{!isLoading && budgets.length > 0 && (',
    '{!isLoading && filteredBudgets.length > 0 && ('
)
content = content.replace(
    '{budgets.map((b: any) => {',
    '{filteredBudgets.map((b: any) => {'
)

# 4. In handleOpenAdd, default the addAccountId to selectedTabAccountId (if it's a valid account ID, else "all")
content = content.replace(
    'setAddAccountId("all");',
    'setAddAccountId(selectedTabAccountId);'
)

# 5. In the add budget form, add validation based on account max balance
# We need to find `Number(addAmount) <= 0 || upsertBudget.isPending`
# First, let's declare maxAmount
max_amount_code = """  const selectedAccount = accounts.find((a: any) => a.id === addAccountId);
  const maxAmount = selectedAccount ? selectedAccount.actual_balance : null;
  const isOverBudget = maxAmount !== null && Number(addAmount) > maxAmount;"""

content = content.replace(
    '  // Wizard state',
    max_amount_code + '\n\n  // Wizard state'
)

# Then in the UI for budget amount
budget_amount_label = """              <div className="flex justify-between items-center">
                <Label
                  htmlFor="budget-amount"
                  className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
                >
                  Jumlah Budget
                </Label>
                {maxAmount !== null && (
                  <span className={cn("text-[10px] font-space-mono font-bold", isOverBudget ? "text-coral" : "text-ink/60")}>
                    Maks: {formatRupiah(maxAmount)}
                  </span>
                )}
              </div>"""

content = re.sub(
    r'<Label\s+htmlFor="budget-amount"\s+className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"\s*>\s*Jumlah Budget\s*</Label>',
    budget_amount_label,
    content
)

# And disable the button if over budget
content = content.replace(
    'Number(addAmount) <= 0 ||\n                  upsertBudget.isPending',
    'Number(addAmount) <= 0 ||\n                  isOverBudget ||\n                  upsertBudget.isPending'
)

with open("src/views/BudgetPage.tsx", "w") as f:
    f.write(content)
