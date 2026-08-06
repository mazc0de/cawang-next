"use client";
import { useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

import { DashboardCard, DashboardCardContent, DashboardCardHeader, DashboardCardTitle, DashboardCardDescription } from '@/components/shared/DashboardCard'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRupiah, getCurrentFinancialCycle, formatDateShort } from '@/lib/utils'

import { useFinancialCycleConfig } from '@/hooks/useFinancialCycleConfig'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useAnalyticsData } from '@/hooks/useAnalyticsData'
import { useBudgets } from '@/hooks/useBudgets'

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs space-y-1">
      {label && <p className="font-medium text-slate-800 mb-2">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-medium text-slate-800">{formatRupiah(p.value, true)}</span>
        </div>
      ))}
    </div>
  )
}

const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
      <p className="font-medium text-slate-800">{payload[0].name}</p>
      <p className="text-slate-500">{formatRupiah(payload[0].value)}</p>
    </div>
  )
}

export function AnalyticsPage() {
  const { data: cycleConfig } = useFinancialCycleConfig()
  const startDay = cycleConfig?.start_day ?? 1
  const { startDate: cycleStart, endDate: cycleEnd } = getCurrentFinancialCycle(startDay)
  
  const cycleYear = cycleStart.getFullYear()
  const cycleMonth = cycleStart.getMonth() + 1

  const { data: stats, isLoading: isLoadingStats } = useDashboardStats(cycleStart, cycleEnd)
  const { data: analytics, isLoading: isLoadingAnalytics } = useAnalyticsData(cycleStart, cycleEnd)
  const { data: budgets, isLoading: isLoadingBudgets } = useBudgets(cycleYear, cycleMonth)

  const isLoading = isLoadingStats || isLoadingAnalytics || isLoadingBudgets

  const totalSpending = analytics?.spendingByCategory?.reduce((sum, c) => sum + c.value, 0) || 0

  const budgetVsActual = useMemo(() => {
    if (!budgets) return []
    return budgets.map(b => ({
      category: b.category?.name || 'Unknown',
      budget: b.amount,
      actual: b.spent || 0
    }))
  }, [budgets])

  return (
    <div className="flex flex-col min-h-svh">


      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <DashboardHeader title="Analytics">
        <span className="ml-2 text-xs text-slate-500 font-medium">Financial Cycle: {formatDateShort(cycleStart)} – {formatDateShort(cycleEnd)}</span>
      </DashboardHeader>
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
            </div>
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <DashboardCard>
                <DashboardCardHeader className="pb-2">
                  <DashboardCardTitle className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                    <Wallet className="h-4 w-4" />
                    Net Worth
                  </DashboardCardTitle>
                </DashboardCardHeader>
                <DashboardCardContent>
                  <p className="text-2xl font-bold text-slate-800">{formatRupiah(stats?.net_worth || 0, true)}</p>
                </DashboardCardContent>
              </DashboardCard>
              <DashboardCard>
                <DashboardCardHeader className="pb-2">
                  <DashboardCardTitle className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                    <TrendingUp className="h-4 w-4 text-[#4cb791]" />
                    Income Bulan Ini
                  </DashboardCardTitle>
                </DashboardCardHeader>
                <DashboardCardContent>
                  <p className="text-2xl font-bold text-[#4cb791]">{formatRupiah(stats?.income_this_cycle || 0, true)}</p>
                </DashboardCardContent>
              </DashboardCard>
              <DashboardCard>
                <DashboardCardHeader className="pb-2">
                  <DashboardCardTitle className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                    <TrendingDown className="h-4 w-4 text-[#e65c5c]" />
                    Pengeluaran Bulan Ini
                  </DashboardCardTitle>
                </DashboardCardHeader>
                <DashboardCardContent>
                  <p className="text-2xl font-bold text-[#e65c5c]">{formatRupiah(stats?.expense_this_cycle || 0, true)}</p>
                </DashboardCardContent>
              </DashboardCard>
            </div>

            {/* Charts */}
            <Tabs defaultValue="spending" id="analytics-tabs">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="spending" id="tab-spending">Spending</TabsTrigger>
                <TabsTrigger value="income-expense" id="tab-income-expense">Income vs Expense</TabsTrigger>
                <TabsTrigger value="net-worth" id="tab-net-worth">Net Worth</TabsTrigger>
                <TabsTrigger value="budget" id="tab-budget">Budget vs Aktual</TabsTrigger>
              </TabsList>

              {/* Spending by Category */}
              <TabsContent value="spending" className="mt-4">
                <div className="grid gap-6 lg:grid-cols-2">
                  <DashboardCard>
                    <DashboardCardHeader>
                      <DashboardCardTitle className="text-base">Spending by Category</DashboardCardTitle>
                      <DashboardCardDescription>Total pengeluaran cycle ini: {formatRupiah(totalSpending)}</DashboardCardDescription>
                    </DashboardCardHeader>
                    <DashboardCardContent>
                      {analytics?.spendingByCategory && analytics.spendingByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Pie
                              data={analytics.spendingByCategory}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={110}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {analytics.spendingByCategory.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<PieTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-[260px] items-center justify-center text-sm text-slate-500">Belum ada pengeluaran</div>
                      )}
                    </DashboardCardContent>
                  </DashboardCard>

                  <DashboardCard>
                    <DashboardCardHeader>
                      <DashboardCardTitle className="text-base">Rincian per Kategori</DashboardCardTitle>
                    </DashboardCardHeader>
                    <DashboardCardContent>
                      <div className="space-y-3">
                        {analytics?.spendingByCategory && analytics.spendingByCategory.length > 0 ? (
                          analytics.spendingByCategory.map(cat => (
                            <div key={cat.name} className="flex items-center gap-3">
                              <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="font-medium truncate">{cat.name}</span>
                                  <span className="text-slate-500 ml-2">{((cat.value / totalSpending) * 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${(cat.value / totalSpending) * 100}%`,
                                      backgroundColor: cat.color,
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">{formatRupiah(cat.value)}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-slate-500">Belum ada rincian kategori</div>
                        )}
                      </div>
                    </DashboardCardContent>
                  </DashboardCard>
                </div>
              </TabsContent>

              {/* Income vs Expense */}
              <TabsContent value="income-expense" className="mt-4">
                <DashboardCard>
                  <DashboardCardHeader>
                    <DashboardCardTitle className="text-base">Income vs Pengeluaran</DashboardCardTitle>
                    <DashboardCardDescription>5 bulan terakhir</DashboardCardDescription>
                  </DashboardCardHeader>
                  <DashboardCardContent>
                    {analytics?.incomeExpenseByMonth && analytics.incomeExpenseByMonth.length > 0 ? (
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={analytics.incomeExpenseByMonth} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="month" className="text-xs" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis className="text-xs" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => formatRupiah(v, true)} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            formatter={(value) => value === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                            wrapperStyle={{ fontSize: '12px' }}
                          />
                          <Bar dataKey="income" name="income" fill="#4cb791" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="expense" name="expense" fill="#e65c5c" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">Belum ada data</div>
                    )}
                  </DashboardCardContent>
                </DashboardCard>
              </TabsContent>

              {/* Net Worth over time */}
              <TabsContent value="net-worth" className="mt-4">
                <DashboardCard>
                  <DashboardCardHeader>
                    <DashboardCardTitle className="text-base">Net Worth dari Waktu ke Waktu</DashboardCardTitle>
                    <DashboardCardDescription>Total saldo semua Account</DashboardCardDescription>
                  </DashboardCardHeader>
                  <DashboardCardContent>
                    {analytics?.netWorthOverTime && analytics.netWorthOverTime.length > 0 ? (
                      <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={analytics.netWorthOverTime} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => formatRupiah(v, true)} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line
                            type="monotone"
                            dataKey="value"
                            name="Net Worth"
                            stroke="#5a8df2"
                            strokeWidth={3}
                            dot={{ fill: '#5a8df2', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">Belum ada data</div>
                    )}
                  </DashboardCardContent>
                </DashboardCard>
              </TabsContent>

              {/* Budget vs Actual */}
              <TabsContent value="budget" className="mt-4">
                <DashboardCard>
                  <DashboardCardHeader>
                    <DashboardCardTitle className="text-base">Budget vs Aktual</DashboardCardTitle>
                    <DashboardCardDescription>Perbandingan alokasi Budget dengan pengeluaran aktual</DashboardCardDescription>
                  </DashboardCardHeader>
                  <DashboardCardContent>
                    {budgetVsActual.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={320}>
                          <BarChart
                            data={budgetVsActual}
                            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => formatRupiah(v, true)} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="category" tick={{ fill: '#64748b', fontSize: 12 }} width={100} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                              formatter={(value) => value === 'budget' ? 'Budget' : 'Aktual'}
                              wrapperStyle={{ fontSize: '12px' }}
                            />
                            <Bar dataKey="budget" name="budget" fill="#cbd5e1" opacity={0.6} radius={[0, 4, 4, 0]} />
                            <Bar dataKey="actual" name="actual" fill="#5a8df2" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                          {budgetVsActual.map(b => {
                            const over = b.actual > b.budget
                            const pct = b.budget > 0 ? (b.actual / b.budget) * 100 : 0
                            return (
                              <div key={b.category} className="flex items-center justify-between text-sm">
                                <span className="font-medium text-slate-700">{b.category}</span>
                                <span className={over ? 'text-red-500 font-medium' : 'text-[#4cb791] font-medium'}>
                                  {over ? '▲ Over ' : '✓ '}
                                  {pct.toFixed(0)}%
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">Belum ada data budget</div>
                    )}
                  </DashboardCardContent>
                </DashboardCard>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}
