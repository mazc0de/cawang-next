"use client";
import { useState } from "react";
import {
  Plus,
  PieChart,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NumericFormat } from "react-number-format";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRupiah, getCurrentFinancialCycle, cn } from "@/lib/utils";
import {
  useBudgets,
  useUpsertBudget,
  useDeleteBudget,
} from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { useFinancialCycleConfig } from "@/hooks/useFinancialCycleConfig";
import { CategoryIcon } from "@/components/shared/CategoryIcon";

const FRAMEWORKS = [
  {
    id: "50_30_20",
    label: "50/30/20",
    desc: "Kebutuhan 50%, Keinginan 30%, Tabungan 20%",
  },
  {
    id: "zero_based",
    label: "Zero-Based Budgeting",
    desc: "Setiap rupiah dialokasikan, income = outcome",
  },
  {
    id: "kakeibo",
    label: "Kakeibo",
    desc: "Metode Jepang: Survive, Optional, Culture, Extra",
  },
  {
    id: "envelope",
    label: "Envelope Method",
    desc: "Pisahkan uang per kategori amplop",
  },
];

import { useBudgetContext } from "@/contexts/BudgetContext";

export function BudgetPage() {
  const { data: cycleConfig } = useFinancialCycleConfig();
  const startDay = cycleConfig?.start_day ?? 1;
  const { startDate: cycleStart } = getCurrentFinancialCycle(startDay);
  const cycleYear = cycleStart.getFullYear();
  const cycleMonth = cycleStart.getMonth() + 1;

  const { data: budgets = [], isLoading } = useBudgets(cycleYear, cycleMonth);
  const { data: categories = [] } = useCategories("outflow");
  const upsertBudget = useUpsertBudget();
  const deleteBudget = useDeleteBudget();

  const budgetContext = useBudgetContext();
  const [localShowWizard, setLocalShowWizard] = useState(false);
  const [localShowAddDialog, setLocalShowAddDialog] = useState(false);
  const [localEditBudget, setLocalEditBudget] = useState<any | null>(null);

  const showWizard = budgetContext?.showWizard ?? localShowWizard;
  const setShowWizard = budgetContext?.setShowWizard ?? setLocalShowWizard;
  const showAddDialog = budgetContext?.showAddDialog ?? localShowAddDialog;
  const setShowAddDialog =
    budgetContext?.setShowAddDialog ?? setLocalShowAddDialog;
  const editBudget = budgetContext?.editBudget ?? localEditBudget;
  const setEditBudget = budgetContext?.setEditBudget ?? setLocalEditBudget;

  // Add/Edit budget dialog state
  const [addCategoryId, setAddCategoryId] = useState("");
  const [addAmount, setAddAmount] = useState("");

  // Wizard state
  const [wizardStep, setWizardStep] = useState<
    "framework" | "income" | "result"
  >("framework");
  const [selectedFramework, setSelectedFramework] = useState<string | null>(
    null,
  );
  const [wizardIncome, setWizardIncome] = useState("");

  const totalBudget = budgets.reduce((s: number, b: any) => s + b.amount, 0);
  const totalSpent = budgets.reduce(
    (s: number, b: any) => s + (b.spent ?? 0),
    0,
  );
  const totalPct =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Categories not yet budgeted
  const budgetedCategoryIds = new Set(budgets.map((b: any) => b.category_id));
  const unbucketedCategories = categories.filter(
    (c) => !budgetedCategoryIds.has(c.id),
  );

  const handleOpenAdd = () => {
    setAddCategoryId("");
    setAddAmount("");
    setEditBudget(null);
    setShowAddDialog(true);
  };

  const handleOpenEdit = (b: any) => {
    setAddCategoryId(b.category_id);
    setAddAmount(String(b.amount));
    setEditBudget(b);
    setShowAddDialog(true);
  };

  const handleSaveBudget = async () => {
    if (!addCategoryId || !addAmount || Number(addAmount) <= 0) return;
    await upsertBudget.mutateAsync({
      category_id: addCategoryId,
      amount: Number(addAmount),
      cycle_year: cycleYear,
      cycle_month: cycleMonth,
    });
    setShowAddDialog(false);
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm("Hapus Budget ini?")) return;
    await deleteBudget.mutateAsync(id);
  };

  const resetWizard = () => {
    setWizardStep("framework");
    setSelectedFramework(null);
    setWizardIncome("");
    setShowWizard(false);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto w-full">
      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          <div className="h-44 w-full bg-canvas animate-pulse rounded-[18px] border-2 border-ink/10" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-36 w-full bg-canvas animate-pulse rounded-[18px] border-2 border-ink/10"
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && budgets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-[18px] bg-canvas border-2 border-dashed border-ink/20">
          <div className="w-16 h-16 rounded-[16px] bg-canary border-2 border-ink shadow-hard-sm flex items-center justify-center mb-4">
            <PieChart className="h-8 w-8 text-ink" strokeWidth={2.5} />
          </div>
          <h3 className="font-archivo-black text-lg text-ink">
            Belum Ada Budget
          </h3>
          <p className="font-space-grotesk text-sm text-ink/70 max-w-sm mt-1 mb-6">
            Gunakan Budgeting Wizard untuk panduan otomatis atau tambahkan
            budget kategori manual.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="btn-start-wizard"
              onClick={() => setShowWizard(true)}
              className="btn-neubrutalism bg-white text-ink px-5 py-2.5 text-xs font-space-grotesk flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-hot-pink" strokeWidth={2.5} />
              Budgeting Wizard
            </button>
            <button
              id="btn-add-first-budget"
              onClick={handleOpenAdd}
              className="btn-neubrutalism bg-hot-pink text-white px-5 py-2.5 text-xs font-space-grotesk flex items-center gap-2"
            >
              <Plus className="h-4 w-4" strokeWidth={3} />
              Tambah Manual
            </button>
          </div>
        </div>
      )}

      {/* Main Content with Budgets */}
      {!isLoading && budgets.length > 0 && (
        <>
          {/* 2. OVERVIEW CARD */}
          <div
            id="card-budget-overview"
            className="card-neubrutalism bg-white p-6 space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-archivo-black text-xl text-ink">
                  Overview Cycle Ini
                </h3>
                <p className="font-space-grotesk text-xs text-ink/60 mt-0.5">
                  Total utilisasi anggaran seluruh kategori
                </p>
              </div>
              <span
                className={cn(
                  "px-3.5 py-1 rounded-full border-2 border-ink font-space-mono text-xs font-bold text-ink shadow-[2px_2px_0px_0px_#111]",
                  totalPct > 100
                    ? "bg-coral"
                    : totalPct > 80
                      ? "bg-canary"
                      : "bg-mint",
                )}
              >
                {totalPct}% terpakai
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-4 bg-canvas border-2 border-ink rounded-full overflow-hidden p-0.5 shadow-[2px_2px_0px_0px_#111]">
              <div
                className={cn(
                  "h-full rounded-full border border-ink transition-all",
                  totalPct > 100
                    ? "bg-coral"
                    : totalPct > 80
                      ? "bg-canary"
                      : "bg-mint",
                )}
                style={{ width: `${Math.min(totalPct, 100)}%` }}
              />
            </div>

            {/* 3 Stats Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-[14px] bg-canvas border-2 border-ink shadow-hard-sm text-center">
                <p className="font-space-grotesk font-bold text-[11px] uppercase tracking-wider text-ink/60">
                  Total Budget
                </p>
                <p className="font-space-mono font-bold text-lg sm:text-xl text-ink mt-0.5">
                  {formatRupiah(totalBudget, true)}
                </p>
              </div>
              <div className="p-3.5 rounded-[14px] bg-canvas border-2 border-ink shadow-hard-sm text-center">
                <p className="font-space-grotesk font-bold text-[11px] uppercase tracking-wider text-coral">
                  Terpakai
                </p>
                <p className="font-space-mono font-bold text-lg sm:text-xl text-coral mt-0.5">
                  {formatRupiah(totalSpent, true)}
                </p>
              </div>
              <div className="p-3.5 rounded-[14px] bg-canvas border-2 border-ink shadow-hard-sm text-center">
                <p className="font-space-grotesk font-bold text-[11px] uppercase tracking-wider text-mint">
                  Sisa Budget
                </p>
                <p
                  className={cn(
                    "font-space-mono font-bold text-lg sm:text-xl mt-0.5",
                    totalBudget - totalSpent < 0 ? "text-coral" : "text-mint",
                  )}
                >
                  {formatRupiah(totalBudget - totalSpent, true)}
                </p>
              </div>
            </div>
          </div>

          {/* 3. BUDGET CATEGORIES GRID */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((b: any) => {
              const spent = b.spent ?? 0;
              const pct =
                b.amount > 0
                  ? Math.min(Math.round((spent / b.amount) * 100), 100)
                  : 0;
              const over = spent > b.amount;

              return (
                <div
                  key={b.id}
                  id={`card-budget-${b.id}`}
                  onClick={() => handleOpenEdit(b)}
                  className="card-neubrutalism bg-white p-5 flex flex-col justify-between gap-4 group hover:-translate-y-1 transition-transform cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-[12px] bg-canary border-2 border-ink shadow-[2px_2px_0px_0px_#111] flex items-center justify-center shrink-0">
                        <CategoryIcon
                          icon={b.category?.icon}
                          defaultEmoji="📦"
                          className="h-5 w-5"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-archivo-black text-base text-ink truncate">
                          {b.category?.name ?? "—"}
                        </h4>
                        <span className="font-space-mono text-xs text-ink/60 font-semibold">
                          {pct}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {over ? (
                        <span className="px-2 py-0.5 rounded-full bg-coral border border-ink font-space-mono text-[10px] font-bold text-ink flex items-center gap-1 shadow-[1px_1px_0px_0px_#111]">
                          <AlertTriangle className="h-3 w-3" /> Over
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-mint border border-ink font-space-mono text-[10px] font-bold text-ink flex items-center gap-1 shadow-[1px_1px_0px_0px_#111]">
                          <CheckCircle2 className="h-3 w-3" /> Aman
                        </span>
                      )}
                      <button
                        id={`btn-delete-budget-${b.id}`}
                        className="w-7 h-7 rounded-full border border-ink hover:bg-coral/20 hover:text-coral flex items-center justify-center text-ink transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBudget(b.id);
                        }}
                        title="Hapus Budget"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {/* Category Progress Bar */}
                  <div className="w-full h-2.5 bg-canvas border-2 border-ink rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full border-r border-ink transition-all",
                        over ? "bg-coral" : pct > 80 ? "bg-canary" : "bg-mint",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Amounts */}
                  <div className="flex items-center justify-between text-xs font-space-mono font-bold">
                    <span className={over ? "text-coral" : "text-ink/70"}>
                      {formatRupiah(spent, true)}
                    </span>
                    <span className="text-ink/50">
                      / {formatRupiah(b.amount, true)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Add More Category Card */}
            {unbucketedCategories.length > 0 && (
              <div
                id="card-add-more-budget"
                onClick={handleOpenAdd}
                className="border-2 border-dashed border-ink/30 bg-canvas/60 rounded-[18px] p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-ink hover:bg-white transition-all shadow-hard-sm hover:shadow-hard-md min-h-[140px] group"
              >
                <div className="w-10 h-10 rounded-[12px] bg-white border-2 border-ink shadow-[2px_2px_0px_0px_#111] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Plus className="h-5 w-5 text-ink" strokeWidth={2.5} />
                </div>
                <p className="font-space-grotesk font-bold text-xs text-ink">
                  Tambah Budget Kategori Lain
                </p>
                <p className="font-space-grotesk text-[11px] text-ink/60 mt-0.5">
                  {unbucketedCategories.length} kategori belum diatur
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit Budget Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm" id="add-budget-dialog">
          <DialogHeader>
            <DialogTitle>
              {editBudget ? "Edit Budget" : "Tambah Budget"}
            </DialogTitle>
            <DialogDescription>
              {editBudget
                ? `Ubah alokasi anggaran untuk ${editBudget.category?.name}`
                : "Pilih kategori dan tentukan nominal batas anggaran."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!editBudget && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="budget-category"
                  className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
                >
                  Kategori
                </Label>
                <Select value={addCategoryId} onValueChange={setAddCategoryId}>
                  <SelectTrigger
                    id="budget-category"
                    className="h-10 text-xs font-space-grotesk font-bold"
                  >
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {(unbucketedCategories.length > 0
                      ? unbucketedCategories
                      : categories
                    ).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <div className="flex items-center gap-2">
                          <CategoryIcon icon={c.icon} className="h-4 w-4" />
                          <span>{c.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="budget-amount"
                className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
              >
                Jumlah Budget
              </Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-space-mono font-bold text-ink/60">
                  Rp
                </span>
                <NumericFormat
                  id="budget-amount"
                  customInput={Input}
                  className="pl-9 font-space-mono font-bold text-sm"
                  placeholder="0"
                  thousandSeparator="."
                  decimalSeparator=","
                  value={addAmount ? addAmount : ""}
                  onValueChange={(values) =>
                    setAddAmount(String(values.floatValue || 0))
                  }
                  min={1}
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3">
              <button
                type="button"
                className="btn-neubrutalism bg-white text-ink px-5 py-2 text-xs font-space-grotesk flex-1 sm:flex-none"
                onClick={() => setShowAddDialog(false)}
              >
                Batal
              </button>
              <button
                id="btn-save-budget"
                className="btn-neubrutalism bg-hot-pink text-white px-5 py-2 text-xs font-space-grotesk flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  !addCategoryId ||
                  !addAmount ||
                  Number(addAmount) <= 0 ||
                  upsertBudget.isPending
                }
                onClick={handleSaveBudget}
              >
                {upsertBudget.isPending ? "Menyimpan…" : "Simpan"}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Budgeting Wizard Dialog */}
      <Dialog open={showWizard} onOpenChange={resetWizard}>
        <DialogContent className="max-w-md" id="budget-wizard-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-hot-pink" />
              Budgeting Wizard
            </DialogTitle>
            <DialogDescription>
              Pilih metode alokasi anggaran sebagai titik awal perencanaan Anda.
            </DialogDescription>
          </DialogHeader>

          {wizardStep === "framework" && (
            <div className="space-y-4 py-2">
              <div className="space-y-2.5">
                {FRAMEWORKS.map((f) => (
                  <button
                    key={f.id}
                    id={`framework-${f.id}`}
                    onClick={() => setSelectedFramework(f.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3.5 rounded-[14px] border-2 border-ink text-left transition-all cursor-pointer shadow-hard-sm",
                      selectedFramework === f.id
                        ? "bg-canary"
                        : "bg-white hover:bg-canvas",
                    )}
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border-2 border-ink mt-0.5 shrink-0",
                        selectedFramework === f.id ? "bg-ink" : "bg-white",
                      )}
                    />
                    <div>
                      <p className="font-archivo-black text-sm text-ink">
                        {f.label}
                      </p>
                      <p className="font-space-grotesk text-xs text-ink/70 mt-0.5">
                        {f.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <DialogFooter className="pt-2">
                <button
                  className="btn-neubrutalism bg-hot-pink text-white w-full py-2.5 text-xs font-space-grotesk disabled:opacity-50 disabled:cursor-not-allowed"
                  id="btn-wizard-next"
                  disabled={!selectedFramework}
                  onClick={() => setWizardStep("income")}
                >
                  Lanjut →
                </button>
              </DialogFooter>
            </div>
          )}

          {wizardStep === "income" && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="wizard-income"
                  className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
                >
                  Total Penghasilan (Income) Bulanan
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-space-mono font-bold text-ink/60">
                    Rp
                  </span>
                  <NumericFormat
                    id="wizard-income"
                    customInput={Input}
                    value={wizardIncome ? wizardIncome : ""}
                    onValueChange={(values) =>
                      setWizardIncome(String(values.floatValue ?? ""))
                    }
                    className="pl-9 font-space-mono font-bold text-sm"
                    placeholder="0"
                    thousandSeparator="."
                    decimalSeparator=","
                    min={0}
                  />
                </div>
                <p className="text-[11px] font-space-grotesk text-ink/60">
                  Anggaran akan dikalkulasikan otomatis sesuai metode yang Anda
                  pilih.
                </p>
              </div>
              <DialogFooter className="pt-2 flex flex-row items-center justify-between gap-3">
                <button
                  className="btn-neubrutalism bg-white text-ink px-5 py-2 text-xs font-space-grotesk flex-1"
                  onClick={() => setWizardStep("framework")}
                >
                  Kembali
                </button>
                <button
                  id="btn-wizard-generate"
                  className="btn-neubrutalism bg-hot-pink text-white px-5 py-2 text-xs font-space-grotesk flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!wizardIncome || Number(wizardIncome) <= 0}
                  onClick={() => setWizardStep("result")}
                >
                  Hitung Alokasi
                </button>
              </DialogFooter>
            </div>
          )}

          {wizardStep === "result" && (
            <div className="space-y-4 py-2">
              <div className="bg-canvas rounded-[16px] border-2 border-ink p-4 text-sm space-y-3 shadow-hard-sm">
                <p className="font-archivo-black text-sm text-ink">
                  Alokasi Berdasarkan{" "}
                  {FRAMEWORKS.find((f) => f.id === selectedFramework)?.label}
                </p>
                {selectedFramework === "50_30_20" && (
                  <div className="space-y-2 font-space-grotesk">
                    <div className="flex justify-between items-center p-2.5 bg-white rounded-xl border border-ink">
                      <span className="font-bold text-xs text-ink">
                        Kebutuhan (50%)
                      </span>
                      <span className="font-space-mono font-bold text-sm text-ink">
                        {formatRupiah(Number(wizardIncome) * 0.5)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-white rounded-xl border border-ink">
                      <span className="font-bold text-xs text-ink">
                        Keinginan (30%)
                      </span>
                      <span className="font-space-mono font-bold text-sm text-ink">
                        {formatRupiah(Number(wizardIncome) * 0.3)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-white rounded-xl border border-ink">
                      <span className="font-bold text-xs text-ink">
                        Tabungan & Investasi (20%)
                      </span>
                      <span className="font-space-mono font-bold text-sm text-mint">
                        {formatRupiah(Number(wizardIncome) * 0.2)}
                      </span>
                    </div>
                  </div>
                )}
                <p className="text-[11px] font-space-grotesk text-ink/70 pt-1">
                  Gunakan nominal ini sebagai acuan saat mengatur anggaran
                  kategori Anda secara manual.
                </p>
              </div>
              <DialogFooter className="pt-2">
                <button
                  id="btn-wizard-done"
                  className="btn-neubrutalism bg-hot-pink text-white w-full py-2.5 text-xs font-space-grotesk"
                  onClick={resetWizard}
                >
                  Selesai
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
