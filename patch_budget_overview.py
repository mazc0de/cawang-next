import re

with open("src/views/BudgetPage.tsx", "r") as f:
    content = f.read()

account_stats_ui = """            </div>
            
            {selectedTabAccountId !== "all" && (() => {
              const selectedAcc = accounts.find((a: any) => a.id === selectedTabAccountId);
              if (!selectedAcc) return null;
              const accountBalance = selectedAcc.actual_balance || 0;
              const remainingBalance = accountBalance - totalBudget;
              
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-2 border-dashed border-ink/20">
                  <div className="p-3.5 rounded-[14px] bg-white border-2 border-ink shadow-[2px_2px_0px_0px_#111] flex items-center justify-between">
                    <p className="font-space-grotesk font-bold text-[11px] uppercase tracking-wider text-ink/60">
                      Total Saldo Akun
                    </p>
                    <p className="font-space-mono font-bold text-sm sm:text-base text-ink">
                      {formatRupiah(accountBalance, true)}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-[14px] bg-white border-2 border-ink shadow-[2px_2px_0px_0px_#111] flex items-center justify-between">
                    <p className="font-space-grotesk font-bold text-[11px] uppercase tracking-wider text-ink/60">
                      Sisa (Saldo - Budget)
                    </p>
                    <p className={cn("font-space-mono font-bold text-sm sm:text-base", remainingBalance < 0 ? "text-coral" : "text-mint")}>
                      {formatRupiah(remainingBalance, true)}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>"""

content = content.replace(
    '            </div>\n          </div>\n\n          {/* 3. BUDGET CATEGORIES GRID */}',
    account_stats_ui + '\n\n          {/* 3. BUDGET CATEGORIES GRID */}'
)

with open("src/views/BudgetPage.tsx", "w") as f:
    f.write(content)

