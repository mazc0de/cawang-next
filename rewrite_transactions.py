import re
import sys

filepath = 'src/views/TransactionsPage.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add imports for date-fns and ChevronLeft, ChevronRight if missing
if 'from \'date-fns\'' not in content:
    content = content.replace("import { formatRupiah, formatDateShort, cn } from '@/lib/utils';", "import { formatRupiah, formatDateShort, cn } from '@/lib/utils';\nimport { format, addDays, subDays } from 'date-fns';")

if 'ChevronLeft' not in content:
    content = content.replace("import { Plus, ArrowLeftRight, TrendingUp, TrendingDown } from 'lucide-react';", "import { Plus, ArrowLeftRight, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';")

if 'useMemo' not in content:
    content = content.replace("import { useState } from 'react';", "import { useState, useMemo } from 'react';")

# State variables
state_pattern = r"const \[filterType, setFilterType\] = useState.*?\n.*?const \[showForm, setShowForm\] = useState\(false\);"
new_states = """const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [filterAccount, setFilterAccount] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showForm, setShowForm] = useState(false);"""
content = re.sub(state_pattern, new_states, content, flags=re.DOTALL)

# Filters definition
filters_pattern = r"const filters = \{.*?\};"
new_filters = """const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const filters = {
        ...(filterAccount !== 'all' && { account_id: filterAccount }),
        ...(filterCategory !== 'all' && { category_id: filterCategory }),
        start_date: dateStr,
        end_date: dateStr,
    };"""
content = re.sub(filters_pattern, new_filters, content, flags=re.DOTALL)

# Sorting logic before the return statement
sorting_logic = """
    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => {
            const timeA = new Date(a.created_at || a.date).getTime();
            const timeB = new Date(b.created_at || b.date).getTime();
            return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
        });
    }, [transactions, sortOrder]);
"""
content = content.replace("const handleDelete = async (id: string) => {", sorting_logic + "\n    const handleDelete = async (id: string) => {")

# DashboardHeader
header_pattern = r'<DashboardHeader title="Transaksi">.*?</DashboardHeader>'
new_header = """<DashboardHeader title="Transaksi">
                <div className="ml-auto flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white rounded-full border border-slate-200 p-1 shadow-sm">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-slate-500 hover:text-slate-800" onClick={() => setSelectedDate(prev => subDays(prev, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs rounded-full px-3 text-slate-600 hover:text-slate-900" onClick={() => setSelectedDate(new Date())}>
                            Hari Ini
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-slate-500 hover:text-slate-800" onClick={() => setSelectedDate(prev => addDays(prev, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button
                        size="sm"
                        id="btn-add-transaction"
                        className="gap-1.5 h-9 bg-[#8ab4f8] hover:bg-[#739ce3] text-white rounded-full px-5 shadow-none"
                        onClick={() => setShowForm(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Transaksi
                    </Button>
                </div>
            </DashboardHeader>"""
content = re.sub(header_pattern, new_header, content, flags=re.DOTALL)

# Filter Bar
filter_bar_pattern = r'<div className="flex flex-wrap gap-3">.*?</div>\s*<!-- Loading -->'
new_filter_bar = """<div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={filterAccount} onValueChange={setFilterAccount}>
                            <SelectTrigger id="filter-account" className="h-9 w-40 text-xs rounded-full bg-white border-slate-200 text-slate-700 shadow-sm">
                                <SelectValue placeholder="Semua Account" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Semua Account</SelectItem>
                                {accounts.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger id="filter-category" className="h-9 w-40 text-xs rounded-full bg-white border-slate-200 text-slate-700 shadow-sm">
                                <SelectValue placeholder="Semua Kategori" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input
                            id="filter-date"
                            type="date"
                            value={format(selectedDate, 'yyyy-MM-dd')}
                            onChange={(e) => {
                                if (e.target.value) setSelectedDate(new Date(e.target.value));
                            }}
                            className="h-9 w-36 text-xs rounded-full bg-white border-slate-200 text-slate-700 shadow-sm px-4"
                        />

                        {(filterAccount !== 'all' || filterCategory !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                id="btn-reset-filter"
                                className="h-9 text-xs text-slate-500 hover:text-slate-800 rounded-full px-4"
                                onClick={() => {
                                    setFilterAccount('all');
                                    setFilterCategory('all');
                                    setSelectedDate(new Date());
                                }}
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Urutkan:</span>
                        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
                            <SelectTrigger className="h-9 w-36 text-xs rounded-full bg-white border-slate-200 text-slate-700 shadow-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="asc">Terlama Dulu</SelectItem>
                                <SelectItem value="desc">Terbaru Dulu</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Loading */}"""
content = re.sub(r'<div className="flex flex-wrap gap-3">.*?</div>\s*\{\/\* Loading \*\/\}', new_filter_bar, content, flags=re.DOTALL)


# Update transactions.length to sortedTransactions.length
content = content.replace("transactions.length === 0", "sortedTransactions.length === 0")
content = content.replace("transactions.length > 0", "sortedTransactions.length > 0")
content = content.replace("transactions.map", "sortedTransactions.map")

with open(filepath, 'w') as f:
    f.write(content)
