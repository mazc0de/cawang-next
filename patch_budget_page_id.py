import re

with open("src/views/BudgetPage.tsx", "r") as f:
    content = f.read()

# Update handleSaveBudget to include id if editBudget
new_save = """  const handleSaveBudget = async () => {
    if (!addCategoryId || !addAmount || Number(addAmount) <= 0) return;
    await upsertBudget.mutateAsync({
      ...(editBudget ? { id: editBudget.id } : {}),
      category_id: addCategoryId,
      account_id: addAccountId === "all" ? null : addAccountId,
      amount: Number(addAmount),
      cycle_year: cycleYear,
      cycle_month: cycleMonth,
    });
    setShowAddDialog(false);
  };"""

content = re.sub(
    r'  const handleSaveBudget = async \(\) => \{[\s\S]*?setShowAddDialog\(false\);\n  \};',
    new_save,
    content
)

with open("src/views/BudgetPage.tsx", "w") as f:
    f.write(content)
