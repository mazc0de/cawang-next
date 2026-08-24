import glob
import re

for h in glob.glob("src/hooks/*.ts"):
    if "use-mobile.ts" in h or "useDashboardStats.ts" in h or "useAnalyticsData.ts" in h:
        continue

    with open(h, "r") as f:
        content = f.read()

    if "import { toast } from \"sonner\";" not in content:
        content = 'import { toast } from "sonner";\n' + content

    # Add onSuccess and onError to useMutation if they don't exist
    # If onSuccess exists, append toast.success
    # If onError doesn't exist, we can add it, or we can just append it inside useMutation object

    # Because there are many useMutation with existing onSuccess, we need a smarter replace.
    # Let's find all mutations: useUpdateAccount, useCreateAccount, useDeleteAccount, etc.
    # We can use regex to inject toast into onSuccess.
    
    # Actually, we can just replace 'onSuccess: (' or 'onSuccess: ()' or 'onSuccess: (_' with injecting toast.
    # Wait, the best way is to regex 'onSuccess: (.*?) => {'
    
    # Let's do it per file:
    
    # Accounts
    if "useAccounts.ts" in h:
        content = re.sub(r'export function useCreateAccount\(\) \{.*?\n    onSuccess: \(\) => \{', 
                         lambda m: m.group(0) + '\n      toast.success("Akun berhasil dibuat!");', content, flags=re.DOTALL)
        content = re.sub(r'export function useUpdateAccount\(\) \{.*?\n    onSuccess: \(\) => \{', 
                         lambda m: m.group(0) + '\n      toast.success("Akun berhasil diperbarui!");', content, flags=re.DOTALL)
        content = re.sub(r'export function useDeleteAccount\(\) \{.*?\n    onSuccess: \(\) => \{', 
                         lambda m: m.group(0) + '\n      toast.success("Akun berhasil dihapus!");', content, flags=re.DOTALL)
    
    # Transactions
    if "useTransactions.ts" in h:
        content = re.sub(r'export function useCreateTransaction\(\) \{.*?\n    onSuccess: \(\) => \{', 
                         lambda m: m.group(0) + '\n      toast.success("Transaksi berhasil dicatat!");', content, flags=re.DOTALL)
        content = re.sub(r'export function useUpdateTransaction\(\) \{.*?\n    onSuccess: \(\) => \{', 
                         lambda m: m.group(0) + '\n      toast.success("Transaksi berhasil diperbarui!");', content, flags=re.DOTALL)
        content = re.sub(r'export function useDeleteTransaction\(\) \{.*?\n    onSuccess: \(\) => \{', 
                         lambda m: m.group(0) + '\n      toast.success("Transaksi berhasil dihapus!");', content, flags=re.DOTALL)

    # Budgets
    if "useBudgets.ts" in h:
        content = re.sub(r'export function useUpsertBudget\(\) \{.*?\n    onSuccess: \([^)]*\) => \{', 
                         lambda m: m.group(0) + '\n      toast.success("Budget berhasil disimpan!");', content, flags=re.DOTALL)
        content = re.sub(r'export function useDeleteBudget\(\) \{.*?\n    onSuccess: \(\) => \{', 
                         lambda m: m.group(0) + '\n      toast.success("Budget berhasil dihapus!");', content, flags=re.DOTALL)

    # Categories
    if "useCategories.ts" in h:
        content = re.sub(r'export function useCreateCategory\(\) \{.*?\n    onSuccess: \(\) => \{', 
                         lambda m: m.group(0) + '\n      toast.success("Kategori berhasil dibuat!");', content, flags=re.DOTALL)
        content = re.sub(r'export function useUpdateCategory\(\) \{.*?\n    onSuccess: \(\) => \{', 
                         lambda m: m.group(0) + '\n      toast.success("Kategori berhasil diperbarui!");', content, flags=re.DOTALL)
        content = re.sub(r'export function useDeleteCategory\(\) \{.*?\n    onSuccess: \(\) => \{', 
                         lambda m: m.group(0) + '\n      toast.success("Kategori berhasil dihapus!");', content, flags=re.DOTALL)
                         
    # FinancialCycleConfig
    if "useFinancialCycleConfig.ts" in h:
        content = re.sub(r'export function useUpdateFinancialCycleConfig\(\) \{.*?\n    onSuccess: \(\) => \{', 
                         lambda m: m.group(0) + '\n      toast.success("Siklus berhasil diperbarui!");', content, flags=re.DOTALL)

    # RecurringRules
    if "useRecurringRules.ts" in h:
        content = re.sub(r'export function useCreateRecurringRule\(\) \{.*?\n    onSuccess: \(\) => \{', 
                         lambda m: m.group(0) + '\n      toast.success("Rule berhasil dibuat!");', content, flags=re.DOTALL)
        content = re.sub(r'export function useUpdateRecurringRule\(\) \{.*?\n    onSuccess: \(\) => \{', 
                         lambda m: m.group(0) + '\n      toast.success("Rule berhasil diperbarui!");', content, flags=re.DOTALL)
        content = re.sub(r'export function useDeleteRecurringRule\(\) \{.*?\n    onSuccess: \(\) => \{', 
                         lambda m: m.group(0) + '\n      toast.success("Rule berhasil dihapus!");', content, flags=re.DOTALL)
        content = re.sub(r'export function useProcessPendingConfirmation\(\) \{.*?\n    onSuccess: \(\) => \{', 
                         lambda m: m.group(0) + '\n      toast.success("Transaksi recurring berhasil dikonfirmasi!");', content, flags=re.DOTALL)
                         
    # Tags
    if "useTags.ts" in h:
        content = re.sub(r'export function useCreateTag\(\) \{.*?\n    onSuccess: \(\) => \{', 
                         lambda m: m.group(0) + '\n      toast.success("Tag berhasil dibuat!");', content, flags=re.DOTALL)


    # We can also add onError to all mutations!
    content = re.sub(r'(\s+)onSuccess:', r'\1onError: (err: any) => {\n\1  toast.error(err.message || "Terjadi kesalahan!");\n\1},\n\1onSuccess:', content)

    with open(h, "w") as f:
        f.write(content)

