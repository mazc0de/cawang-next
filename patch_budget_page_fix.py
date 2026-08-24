import re

with open("src/views/BudgetPage.tsx", "r") as f:
    content = f.read()

# Fetch accounts
if "const { data: accounts = [] } = useAccounts();" not in content:
    content = content.replace(
        'const { data: categories = [] } = useCategories("outflow");',
        'const { data: categories = [] } = useCategories("outflow");\n  const { data: accounts = [] } = useAccounts();'
    )

# Insert the Account Select in the form.
# Let's find the Category Select and insert after it.
# The Category Select looks like:
#                 </Select>
#               </div>
#               <div className="space-y-2">
#                 <Label
#                   htmlFor="budget-amount"

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
                </Select>"""

# Using regex to insert after Category Select
content = re.sub(
    r'(<SelectContent>[\s\S]*?</SelectContent>\s*</Select>\s*</div>)',
    r'\1\n' + account_select,
    content,
    count=1 # only the first one, which is Category. Wait, what if it matches Framework select?
)

with open("src/views/BudgetPage.tsx", "w") as f:
    f.write(content)

