'use client';
import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PieChart as PieIcon, BarChart3, LineChart as LineIcon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatRupiah, getCurrentFinancialCycle, formatDateShort, cn } from '@/lib/utils';
import { useFinancialCycleConfig } from '@/hooks/useFinancialCycleConfig';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useBudgets } from '@/hooks/useBudgets';

const NEUBRUTALISM_PALETTE = [
    '#ff3d81', // hot-pink
    '#ffd23f', // canary
    '#3ddc97', // mint
    '#c8a2ff', // lilac
    '#ff6b5e', // coral
    '#38bdf8', // sky
    '#fb923c', // orange
    '#a78bfa', // purple
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border-2 border-ink rounded-xl p-3 shadow-hard-sm font-space-grotesk text-xs space-y-1">
            {label && <p className="font-archivo-black text-ink text-sm mb-2">{label}</p>}
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2 font-space-mono font-bold text-ink">
                    <div className="h-3 w-3 rounded-full border border-ink" style={{ backgroundColor: p.color || p.fill }} />
                    <span className="text-ink/70 font-space-grotesk">{p.name === 'income' ? 'Pemasukan' : p.name === 'expense' ? 'Pengeluaran' : p.name}:</span>
                    <span>{formatRupiah(p.value, true)}</span>
                </div>
            ))}
        </div>
    );
};

const PieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border-2 border-ink rounded-xl p-3 shadow-hard-sm font-space-grotesk text-xs">
            <p className="font-archivo-black text-ink text-sm">{payload[0].name}</p>
            <p className="font-space-mono font-bold text-ink mt-1">{formatRupiah(payload[0].value)}</p>
        </div>
    );
};

export function AnalyticsPage() {
    const { data: cycleConfig } = useFinancialCycleConfig();
    const startDay = cycleConfig?.start_day ?? 1;
    const { startDate: cycleStart, endDate: cycleEnd } = getCurrentFinancialCycle(startDay);

    const cycleYear = cycleStart.getFullYear();
    const cycleMonth = cycleStart.getMonth() + 1;

    const { data: stats, isLoading: isLoadingStats } = useDashboardStats(cycleStart, cycleEnd);
    const { data: analytics, isLoading: isLoadingAnalytics } = useAnalyticsData(cycleStart, cycleEnd);
    const { data: budgets, isLoading: isLoadingBudgets } = useBudgets(cycleYear, cycleMonth);

    const isLoading = isLoadingStats || isLoadingAnalytics || isLoadingBudgets;

    const totalSpending = analytics?.spendingByCategory?.reduce((sum, c) => sum + c.value, 0) || 0;

    const budgetVsActual = useMemo(() => {
        if (!budgets) return [];
        return budgets.map((b) => ({
            category: b.category?.name || 'Unknown',
            budget: b.amount,
            actual: b.spent || 0,
        }));
    }, [budgets]);

    return (
        <div className="space-y-8 pb-12 max-w-7xl mx-auto w-full">
            {isLoading ? (
                <div className="space-y-6">
                    <div className="grid gap-5 sm:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-28 w-full bg-canvas animate-pulse rounded-[18px] border-2 border-ink/10" />
                        ))}
                    </div>
                    <div className="h-[450px] w-full bg-canvas animate-pulse rounded-[18px] border-2 border-ink/10" />
                </div>
            ) : (
                <>
                    {/* 1. TOP 3 KPI SUMMARY STATS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {/* Net Worth */}
                        <div className="card-neubrutalism bg-white p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform">
                            <div className="w-12 h-12 rounded-[14px] bg-hot-pink border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
                                <Wallet className="h-6 w-6 text-ink" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">Net Worth</p>
                                <p className="font-archivo-black text-2xl sm:text-3xl text-ink tracking-tight truncate mt-0.5">{formatRupiah(stats?.net_worth || 0, true)}</p>
                            </div>
                        </div>

                        {/* Income Cycle Ini */}
                        <div className="card-neubrutalism bg-white p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform">
                            <div className="w-12 h-12 rounded-[14px] bg-mint border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
                                <TrendingUp className="h-6 w-6 text-ink" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">Income Cycle Ini</p>
                                <p className="font-archivo-black text-2xl sm:text-3xl text-ink tracking-tight truncate mt-0.5">{formatRupiah(stats?.income_this_cycle || 0, true)}</p>
                            </div>
                        </div>

                        {/* Pengeluaran Cycle Ini */}
                        <div className="card-neubrutalism bg-white p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform">
                            <div className="w-12 h-12 rounded-[14px] bg-coral border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
                                <TrendingDown className="h-6 w-6 text-ink" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">Pengeluaran Cycle Ini</p>
                                <p className="font-archivo-black text-2xl sm:text-3xl text-ink tracking-tight truncate mt-0.5">{formatRupiah(stats?.expense_this_cycle || 0, true)}</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. ANALYTICS TABS */}
                    <Tabs defaultValue="spending" id="analytics-tabs" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1.5 bg-canvas border-2 border-ink rounded-[16px] shadow-hard-sm gap-2">
                            <TabsTrigger value="spending" id="tab-spending">
                                Spending
                            </TabsTrigger>
                            <TabsTrigger value="income-expense" id="tab-income-expense">
                                Income vs Expense
                            </TabsTrigger>
                            <TabsTrigger value="net-worth" id="tab-net-worth">
                                Net Worth
                            </TabsTrigger>
                            <TabsTrigger value="budget" id="tab-budget">
                                Budget vs Aktual
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab 1: Spending by Category */}
                        <TabsContent value="spending" className="mt-0">
                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* Donut Chart Card */}
                                <div className="card-neubrutalism h-fit bg-white p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-archivo-black text-xl text-ink">Spending by Category</h3>
                                                <p className="font-space-grotesk text-xs text-ink/60 mt-0.5">
                                                    Total pengeluaran cycle ini: <span className="font-space-mono font-bold text-ink">{formatRupiah(totalSpending)}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {analytics?.spendingByCategory && analytics.spendingByCategory.length > 0 ? (
                                            <div className="h-[280px] w-full mt-4">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={analytics.spendingByCategory} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" stroke="#111111" strokeWidth={2}>
                                                            {analytics.spendingByCategory.map((entry, index) => (
                                                                <Cell key={index} fill={entry.color || NEUBRUTALISM_PALETTE[index % NEUBRUTALISM_PALETTE.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip content={<PieTooltip />} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="flex h-[280px] flex-col items-center justify-center text-center rounded-[14px] bg-canvas border-2 border-dashed border-ink/20">
                                                <p className="font-space-grotesk font-medium text-sm text-ink/60">Belum ada pengeluaran pada cycle ini</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Category Breakdown Details Card */}
                                <div className="card-neubrutalism bg-white p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="font-archivo-black text-xl text-ink">Rincian per Kategori</h3>
                                        </div>

                                        {analytics?.spendingByCategory && analytics.spendingByCategory.length > 0 ? (
                                            <div className="space-y-4">
                                                {analytics.spendingByCategory.map((cat, idx) => {
                                                    const pct = totalSpending > 0 ? (cat.value / totalSpending) * 100 : 0;
                                                    const catColor = cat.color || NEUBRUTALISM_PALETTE[idx % NEUBRUTALISM_PALETTE.length];

                                                    return (
                                                        <div key={cat.name} className="p-3.5 rounded-[14px] bg-white border-2 border-ink shadow-hard-sm">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-ink shrink-0" style={{ backgroundColor: catColor }} />
                                                                    <span className="font-space-grotesk font-bold text-sm text-ink truncate">{cat.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    <span className="font-space-mono font-bold text-xs text-ink">{formatRupiah(cat.value)}</span>
                                                                    <span className="px-2 py-0.5 rounded-full bg-canary border border-ink font-space-mono text-[10px] font-bold text-ink">{pct.toFixed(0)}%</span>
                                                                </div>
                                                            </div>
                                                            <div className="w-full h-2.5 bg-canvas border-2 border-ink rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full border-r-2 border-ink transition-all"
                                                                    style={{
                                                                        width: `${pct}%`,
                                                                        backgroundColor: catColor,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex h-[280px] flex-col items-center justify-center text-center rounded-[14px] bg-canvas border-2 border-dashed border-ink/20">
                                                <p className="font-space-grotesk font-medium text-sm text-ink/60">Belum ada rincian kategori</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab 2: Income vs Expense */}
                        <TabsContent value="income-expense" className="mt-0">
                            <div className="card-neubrutalism bg-white p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
                                    <div>
                                        <h3 className="font-archivo-black text-xl text-ink">Income vs Pengeluaran</h3>
                                        <p className="font-space-grotesk text-xs text-ink/60 mt-0.5">Perbandingan data dalam 5 bulan terakhir</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3.5 h-3.5 rounded-full border-2 border-ink bg-mint shadow-[1px_1px_0px_0px_#111]" />
                                            <span className="font-space-mono text-xs font-bold text-ink">Pemasukan</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3.5 h-3.5 rounded-full border-2 border-ink bg-coral shadow-[1px_1px_0px_0px_#111]" />
                                            <span className="font-space-mono text-xs font-bold text-ink">Pengeluaran</span>
                                        </div>
                                    </div>
                                </div>

                                {analytics?.incomeExpenseByMonth && analytics.incomeExpenseByMonth.length > 0 ? (
                                    <div className="h-[340px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analytics.incomeExpenseByMonth} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(17,17,17,0.1)" />
                                                <XAxis dataKey="month" tick={{ fill: '#111111', fontSize: 12, fontFamily: 'var(--font-space-mono)', fontWeight: 'bold' }} axisLine={{ stroke: '#111111', strokeWidth: 2 }} tickLine={false} />
                                                <YAxis
                                                    tick={{ fill: '#111111', fontSize: 11, fontFamily: 'var(--font-space-mono)', fontWeight: 'bold' }}
                                                    tickFormatter={(v) => formatRupiah(v, true)}
                                                    axisLine={{ stroke: '#111111', strokeWidth: 2 }}
                                                    tickLine={false}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="income" name="income" fill="#3ddc97" stroke="#111111" strokeWidth={2} radius={[6, 6, 0, 0]} />
                                                <Bar dataKey="expense" name="expense" fill="#ff6b5e" stroke="#111111" strokeWidth={2} radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="flex h-[340px] flex-col items-center justify-center text-center rounded-[14px] bg-canvas border-2 border-dashed border-ink/20">
                                        <p className="font-space-grotesk font-medium text-sm text-ink/60">Belum ada data riwayat bulanan</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Tab 3: Net Worth Over Time */}
                        <TabsContent value="net-worth" className="mt-0">
                            <div className="card-neubrutalism bg-white p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="font-archivo-black text-xl text-ink">Net Worth dari Waktu ke Waktu</h3>
                                        <p className="font-space-grotesk text-xs text-ink/60 mt-0.5">Pertumbuhan total saldo seluruh akun</p>
                                    </div>
                                </div>

                                {analytics?.netWorthOverTime && analytics.netWorthOverTime.length > 0 ? (
                                    <div className="h-[340px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={analytics.netWorthOverTime} margin={{ top: 10, right: 15, left: 15, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(17,17,17,0.1)" />
                                                <XAxis dataKey="month" tick={{ fill: '#111111', fontSize: 12, fontFamily: 'var(--font-space-mono)', fontWeight: 'bold' }} axisLine={{ stroke: '#111111', strokeWidth: 2 }} tickLine={false} />
                                                <YAxis
                                                    tick={{ fill: '#111111', fontSize: 11, fontFamily: 'var(--font-space-mono)', fontWeight: 'bold' }}
                                                    tickFormatter={(v) => formatRupiah(v, true)}
                                                    axisLine={{ stroke: '#111111', strokeWidth: 2 }}
                                                    tickLine={false}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="value"
                                                    name="Net Worth"
                                                    stroke="#ff3d81"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#ffd23f', stroke: '#111111', strokeWidth: 2, r: 5 }}
                                                    activeDot={{ fill: '#ff3d81', stroke: '#111111', strokeWidth: 2, r: 7 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="flex h-[340px] flex-col items-center justify-center text-center rounded-[14px] bg-canvas border-2 border-dashed border-ink/20">
                                        <p className="font-space-grotesk font-medium text-sm text-ink/60">Belum ada data tren Net Worth</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Tab 4: Budget vs Actual */}
                        <TabsContent value="budget" className="mt-0">
                            <div className="card-neubrutalism bg-white p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="font-archivo-black text-xl text-ink">Budget vs Aktual</h3>
                                        <p className="font-space-grotesk text-xs text-ink/60 mt-0.5">Perbandingan alokasi anggaran dengan realisasi pengeluaran</p>
                                    </div>
                                </div>

                                {budgetVsActual.length > 0 ? (
                                    <div className="space-y-6">
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={budgetVsActual} margin={{ top: 10, right: 15, left: 15, bottom: 5 }} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(17,17,17,0.1)" />
                                                    <XAxis
                                                        type="number"
                                                        tick={{ fill: '#111111', fontSize: 11, fontFamily: 'var(--font-space-mono)', fontWeight: 'bold' }}
                                                        tickFormatter={(v) => formatRupiah(v, true)}
                                                        axisLine={{ stroke: '#111111', strokeWidth: 2 }}
                                                        tickLine={false}
                                                    />
                                                    <YAxis
                                                        type="category"
                                                        dataKey="category"
                                                        tick={{ fill: '#111111', fontSize: 12, fontFamily: 'var(--font-space-grotesk)', fontWeight: 'bold' }}
                                                        width={110}
                                                        axisLine={{ stroke: '#111111', strokeWidth: 2 }}
                                                        tickLine={false}
                                                    />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Bar dataKey="budget" name="Budget" fill="#e2e8f0" stroke="#111111" strokeWidth={2} radius={[0, 6, 6, 0]} />
                                                    <Bar dataKey="actual" name="Aktual" fill="#c8a2ff" stroke="#111111" strokeWidth={2} radius={[0, 6, 6, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Breakdown List */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                            {budgetVsActual.map((b) => {
                                                const over = b.actual > b.budget;
                                                const pct = b.budget > 0 ? (b.actual / b.budget) * 100 : 0;
                                                return (
                                                    <div key={b.category} className="p-4 rounded-[14px] bg-white border-2 border-ink shadow-hard-sm flex items-center justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="font-space-grotesk font-bold text-sm text-ink truncate">{b.category}</p>
                                                            <p className="font-space-mono text-xs text-ink/60 mt-0.5">
                                                                {formatRupiah(b.actual)} / {formatRupiah(b.budget)}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={cn(
                                                                'px-3 py-1 rounded-full border-2 border-ink font-space-grotesk font-bold text-xs flex items-center gap-1 shrink-0 shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]',
                                                                over ? 'bg-coral text-ink' : 'bg-mint text-ink',
                                                            )}
                                                        >
                                                            {over ? <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} /> : <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />}
                                                            {pct.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-[300px] flex-col items-center justify-center text-center rounded-[14px] bg-canvas border-2 border-dashed border-ink/20">
                                        <p className="font-space-grotesk font-medium text-sm text-ink/60">Belum ada data anggaran pada periode ini</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}
