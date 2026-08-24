import re

with open("src/hooks/useBudgets.ts", "r") as f:
    content = f.read()

content = content.replace(
    '.select("category_id, amount")',
    '.select("category_id, account_id, amount")'
)

new_spent = """      const spentMap = transactions.reduce(
        (acc: Record<string, number>, tx) => {
          const keyGen = tx.category_id;
          acc[keyGen] = (acc[keyGen] || 0) + tx.amount;
          const keyAcc = `${tx.category_id}_${tx.account_id}`;
          acc[keyAcc] = (acc[keyAcc] || 0) + tx.amount;
          return acc;
        },
        {},
      );

      return (budgets || []).map((budget) => {
        const spentKey = budget.account_id ? `${budget.category_id}_${budget.account_id}` : budget.category_id;
        return {
          ...budget,
          spent: spentMap[spentKey] || 0,
        };
      }) as Budget[];"""

content = re.sub(
    r'      const spentMap = transactions\.reduce\([\s\S]*?as Budget\[\];',
    new_spent,
    content
)

with open("src/hooks/useBudgets.ts", "w") as f:
    f.write(content)
