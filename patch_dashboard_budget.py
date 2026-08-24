import re

with open("src/views/DashboardPage.tsx", "r") as f:
    content = f.read()

# 1. Add Select imports
if "import { Select" not in content:
    content = content.replace(
        'import { CategoryIcon } from "@/components/shared/CategoryIcon";',
        'import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";\nimport { CategoryIcon } from "@/components/shared/CategoryIcon";'
    )

# 2. State & filtered budgets
content = content.replace(
    '  const { data: budgets = [] } = useBudgets(cycleYear, cycleMonth);',
    '  const { data: rawBudgets = [] } = useBudgets(cycleYear, cycleMonth);\n  const [dashboardBudgetAccountId, setDashboardBudgetAccountId] = useState("all");\n  const budgets = rawBudgets.filter((b: any) => dashboardBudgetAccountId === "all" ? true : b.account_id === (dashboardBudgetAccountId === "all" ? null : dashboardBudgetAccountId));'
)
# Note: Actually it's `b.account_id === dashboardBudgetAccountId`. 
# Wait, if `dashboardBudgetAccountId === "all"`, it's true.
# Let's write it cleaner.
content = content.replace(
    'b.account_id === (dashboardBudgetAccountId === "all" ? null : dashboardBudgetAccountId));',
    'b.account_id === dashboardBudgetAccountId);'
)

# 3. Add Select UI to the card header
old_header = """          <div className="flex justify-between items-center mb-6">
            <h3 className="font-archivo-black text-xl text-ink">
              Budget vs Actual
            </h3>
            <Link
              href="/dashboard/budget"
              className="btn-neubrutalism bg-white px-3.5 py-1.5 text-xs font-space-grotesk text-ink inline-block"
            >
              Atur Budget
            </Link>
          </div>"""

new_header = """          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <h3 className="font-archivo-black text-xl text-ink">
              Budget vs Actual
            </h3>
            <div className="flex items-center gap-2">
              <Select value={dashboardBudgetAccountId} onValueChange={setDashboardBudgetAccountId}>
                <SelectTrigger className="h-8 text-xs font-space-grotesk font-bold bg-white w-[140px]">
                  <SelectValue placeholder="Pilih Akun" />
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
              <Link
                href="/dashboard/budget"
                className="btn-neubrutalism bg-white px-3.5 py-1.5 text-xs font-space-grotesk text-ink inline-block whitespace-nowrap"
              >
                Atur Budget
              </Link>
            </div>
          </div>"""

content = content.replace(old_header, new_header)

with open("src/views/DashboardPage.tsx", "w") as f:
    f.write(content)

