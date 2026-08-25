"use client";
import { useState, useMemo } from "react";
import {
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Trash2,
  Power,
  Calendar,
  Layers,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRupiah, formatDateShort, cn } from "@/lib/utils";
import {
  useRecurringRules,
  usePendingConfirmations,
  useCreateRecurringRule,
  useToggleRecurringRule,
  useDeleteRecurringRule,
  useApproveRecurringRule,
} from "@/hooks/useRecurringRules";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import type { RecurringRule } from "@/types/domain";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { useRecurringContext } from "@/contexts/RecurringContext";

const FREQ_LABEL: Record<string, string> = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
  yearly: "Tahunan",
};

function RuleCard({
  rule,
  onApprove,
  onToggle,
  onDelete,
}: {
  rule: RecurringRule;
  onApprove?: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const isPending =
    rule.posting_mode === "requires_confirmation" &&
    new Date(rule.next_due_date) <= new Date() &&
    rule.is_active;

  const cat = (rule as any).category;
  const acc = (rule as any).account;

  return (
    <div
      id={`card-rule-${rule.id}`}
      className={cn(
        "card-neubrutalism bg-white p-5 space-y-4 group hover:-translate-y-1 transition-transform",
        !rule.is_active && "opacity-60 bg-canvas/60",
        isPending &&
          "border-canary bg-canary/10 ring-2 ring-ink shadow-hard-md",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "w-12 h-12 rounded-[14px] border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0",
              rule.type === "inflow" ? "bg-mint" : "bg-coral",
            )}
          >
            <CategoryIcon
              icon={cat?.icon}
              defaultEmoji={rule.type === "inflow" ? "💰" : "💸"}
              className="h-6 w-6 text-ink"
            />
          </div>
          <div className="min-w-0">
            <h4 className="font-archivo-black text-base text-ink truncate leading-tight">
              {rule.description || cat?.name || "—"}
            </h4>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="font-space-grotesk text-xs font-bold text-ink/70">
                {acc?.name ?? "Akun"}
              </span>
              <span className="text-ink/40 text-xs">•</span>
              <span className="font-space-grotesk text-xs font-medium text-ink/60">
                {cat?.name ?? "Kategori"}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p
            className={cn(
              "font-archivo-black text-lg sm:text-xl tracking-tight",
              rule.type === "inflow" ? "text-mint" : "text-coral",
            )}
          >
            {rule.type === "inflow" ? "+" : "-"}
            {formatRupiah(rule.amount)}
          </p>
        </div>
      </div>

      {/* Badges & Meta */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t-2 border-ink/10 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full bg-canvas border-2 border-ink font-space-mono text-[11px] font-bold text-ink shadow-[1px_1px_0px_0px_#111]">
            {FREQ_LABEL[rule.frequency] ?? rule.frequency}
          </span>
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full border-2 border-ink font-space-mono text-[11px] font-bold text-ink shadow-[1px_1px_0px_0px_#111]",
              rule.posting_mode === "auto_post" ? "bg-lilac" : "bg-canary",
            )}
          >
            {rule.posting_mode === "auto_post"
              ? "⚡ Otomatis"
              : "⏳ Butuh Konfirmasi"}
          </span>
          <span className="flex items-center gap-1 text-xs font-space-grotesk font-bold text-ink/70">
            <Calendar className="h-3.5 w-3.5 text-ink" />
            Jatuh tempo:{" "}
            <strong className="text-ink">
              {formatDateShort(rule.next_due_date)}
            </strong>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {isPending && onApprove && (
            <button
              id={`btn-approve-${rule.id}`}
              className="btn-neubrutalism bg-canary text-ink px-3.5 py-1.5 text-xs font-space-grotesk font-bold flex items-center gap-1.5"
              onClick={onApprove}
            >
              <CheckCircle className="h-3.5 w-3.5 text-ink" />
              Konfirmasi
            </button>
          )}
          <button
            id={`btn-toggle-${rule.id}`}
            onClick={onToggle}
            title={rule.is_active ? "Nonaktifkan" : "Aktifkan"}
            className={cn(
              "h-8 px-3 rounded-full border-2 border-ink font-space-grotesk font-bold text-xs flex items-center gap-1.5 transition-all shadow-[1px_1px_0px_0px_#111] cursor-pointer",
              rule.is_active
                ? "bg-white hover:bg-canvas text-ink"
                : "bg-mint text-ink",
            )}
          >
            <Power className="h-3.5 w-3.5" />
            {rule.is_active ? "Nonaktifkan" : "Aktifkan"}
          </button>
          <button
            id={`btn-delete-rule-${rule.id}`}
            onClick={onDelete}
            title="Hapus Rule"
            className="w-8 h-8 rounded-full border-2 border-ink bg-white hover:bg-coral hover:text-white flex items-center justify-center text-ink transition-colors shadow-[1px_1px_0px_0px_#111] cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function RecurringPage() {
  const { data: allRules = [], isLoading } = useRecurringRules();
  const { data: pending = [] } = usePendingConfirmations();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createRule = useCreateRecurringRule();
  const toggleRule = useToggleRecurringRule();
  const deleteRule = useDeleteRecurringRule();
  const approveRule = useApproveRecurringRule();

  const recurringContext = useRecurringContext();
  const [localShowForm, setLocalShowForm] = useState(false);
  const showForm = recurringContext?.showForm ?? localShowForm;
  const setShowForm = recurringContext?.setShowForm ?? setLocalShowForm;

  const [formType, setFormType] = useState<"inflow" | "outflow">("outflow");
  const [formAccountId, setFormAccountId] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formFrequency, setFormFrequency] = useState<
    "monthly" | "weekly" | "daily" | "yearly"
  >("monthly");
  const [formMode, setFormMode] = useState<
    "auto_post" | "requires_confirmation"
  >("requires_confirmation");
  const [formNextDue, setFormNextDue] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const activeRules = allRules.filter((r) => r.is_active);
  const inactiveRules = allRules.filter((r) => !r.is_active);

  const monthlyOutflow = useMemo(() => {
    return activeRules
      .filter((r) => r.type === "outflow")
      .reduce((sum, r) => {
        let mult = 1;
        if (r.frequency === "daily") mult = 30;
        if (r.frequency === "weekly") mult = 4;
        if (r.frequency === "yearly") mult = 1 / 12;
        return sum + r.amount * mult;
      }, 0);
  }, [activeRules]);

  const monthlyInflow = useMemo(() => {
    return activeRules
      .filter((r) => r.type === "inflow")
      .reduce((sum, r) => {
        let mult = 1;
        if (r.frequency === "daily") mult = 30;
        if (r.frequency === "weekly") mult = 4;
        if (r.frequency === "yearly") mult = 1 / 12;
        return sum + r.amount * mult;
      }, 0);
  }, [activeRules]);

  const filteredCategories = categories.filter((c) => c.type === formType);

  const handleSave = async () => {
    if (!formAccountId || !formCategoryId || !formAmount || !formNextDue)
      return;
    await createRule.mutateAsync({
      account_id: formAccountId,
      category_id: formCategoryId,
      amount: Number(formAmount),
      type: formType,
      frequency: formFrequency,
      posting_mode: formMode,
      next_due_date: formNextDue,
      description: formDescription,
      is_active: true,
    });
    setShowForm(false);
    setFormAccountId("");
    setFormCategoryId("");
    setFormAmount("");
    setFormNextDue("");
    setFormDescription("");
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto w-full">
      {/* 1. TOP KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card-neubrutalism bg-white p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 rounded-[14px] bg-coral border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
            <RefreshCw className="h-6 w-6 text-ink" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">
              Est. Beban Bulanan
            </p>
            <p className="font-archivo-black text-2xl text-coral tracking-tight truncate mt-0.5">
              {formatRupiah(monthlyOutflow, true)}
            </p>
          </div>
        </div>

        <div className="card-neubrutalism bg-white p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 rounded-[14px] bg-mint border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
            <Layers className="h-6 w-6 text-ink" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">
              Est. Pemasukan Rutin
            </p>
            <p className="font-archivo-black text-2xl text-mint tracking-tight truncate mt-0.5">
              {formatRupiah(monthlyInflow, true)}
            </p>
          </div>
        </div>

        <div className="card-neubrutalism bg-canary p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 rounded-[14px] bg-white border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6 text-ink" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">
              Butuh Persetujuan
            </p>
            <p className="font-archivo-black text-2xl text-ink tracking-tight truncate mt-0.5">
              {pending.length} Tagihan
            </p>
          </div>
        </div>
      </div>

      {/* 2. PENDING CONFIRMATIONS BANNER */}
      {!isLoading && pending.length > 0 && (
        <div className="rounded-[18px] border-2 border-ink bg-canary/20 p-5 space-y-4 shadow-hard-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-canary border-2 border-ink flex items-center justify-center shadow-[1px_1px_0px_0px_#111]">
              <AlertCircle className="h-4 w-4 text-ink" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-archivo-black text-base text-ink">
                {pending.length} Transaksi Perlu Dikonfirmasi
              </h3>
              <p className="font-space-grotesk text-xs text-ink/70">
                Tagihan di bawah telah jatuh tempo dan membutuhkan konfirmasi
                pencatatan Anda.
              </p>
            </div>
          </div>
          <div className="grid gap-3">
            {pending.map((p: any) => {
              const rule = p.recurring_rule;
              return (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onApprove={() => approveRule.mutate(rule)}
                  onToggle={() =>
                    toggleRule.mutate({
                      id: rule.id,
                      is_active: !rule.is_active,
                    })
                  }
                  onDelete={() => {
                    if (confirm("Hapus rule ini?")) deleteRule.mutate(rule.id);
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 3. RULES LIST & TABS */}
      <div>
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-36 w-full bg-canvas animate-pulse rounded-[18px] border-2 border-ink/10"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && allRules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-[18px] bg-canvas border-2 border-dashed border-ink/20">
            <div className="w-16 h-16 rounded-[16px] bg-lilac border-2 border-ink shadow-hard-sm flex items-center justify-center mb-4">
              <RefreshCw className="h-8 w-8 text-ink" strokeWidth={2.5} />
            </div>
            <h3 className="font-archivo-black text-lg text-ink">
              Belum Ada Recurring Rule
            </h3>
            <p className="font-space-grotesk text-sm text-ink/70 max-w-sm mt-1 mb-6">
              Buat jadwal otomatis untuk transaksi rutin seperti gaji, langganan
              internet, atau cicilan bulanan.
            </p>
            <button
              id="btn-add-first-rule"
              onClick={() => setShowForm(true)}
              className="btn-neubrutalism bg-hot-pink text-white px-6 py-2.5 text-sm font-space-grotesk flex items-center gap-2"
            >
              <Plus className="h-4 w-4" strokeWidth={3} />
              Tambah Recurring Rule
            </button>
          </div>
        )}

        {!isLoading && allRules.length > 0 && (
          <Tabs defaultValue="active" id="recurring-tabs" className="space-y-6">
            <div className="flex items-center justify-start">
              <TabsList id="recurring-tabs-list">
                <TabsTrigger value="active" id="tab-active-rules">
                  Aktif ({activeRules.length})
                </TabsTrigger>
                <TabsTrigger value="inactive" id="tab-inactive-rules">
                  Nonaktif ({inactiveRules.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="active" className="mt-0 space-y-4">
              {activeRules.length === 0 ? (
                <div className="py-12 text-center rounded-[18px] bg-canvas border-2 border-dashed border-ink/20">
                  <p className="font-space-grotesk font-bold text-sm text-ink/70">
                    Tidak ada recurring rule aktif
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {activeRules.map((rule) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      onApprove={
                        rule.posting_mode === "requires_confirmation"
                          ? () => approveRule.mutate(rule)
                          : undefined
                      }
                      onToggle={() =>
                        toggleRule.mutate({ id: rule.id, is_active: false })
                      }
                      onDelete={() => {
                        if (confirm("Hapus rule ini?"))
                          deleteRule.mutate(rule.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="inactive" className="mt-0 space-y-4">
              {inactiveRules.length === 0 ? (
                <div className="py-12 text-center rounded-[18px] bg-canvas border-2 border-dashed border-ink/20">
                  <p className="font-space-grotesk font-bold text-sm text-ink/70">
                    Tidak ada recurring rule nonaktif
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {inactiveRules.map((rule) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      onToggle={() =>
                        toggleRule.mutate({ id: rule.id, is_active: true })
                      }
                      onDelete={() => {
                        if (confirm("Hapus rule ini?"))
                          deleteRule.mutate(rule.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* 4. ADD RECURRING RULE DIALOG */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent id="add-rule-dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Recurring Rule</DialogTitle>
            <DialogDescription>
              Buat template jadwal transaksi berkala yang otomatis atau dengan
              persetujuan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="rule-description"
                className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
              >
                Deskripsi
              </Label>
              <Input
                id="rule-description"
                placeholder="Misal: Gaji Bulanan, Spotify, Cicilan Rumah"
                value={formDescription}
                onChange={(e) => {
                  const val = e.target.value;
                  const capitalized = val.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
                  setFormDescription(capitalized);
                }}
                className="font-space-grotesk text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="rule-type"
                  className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
                >
                  Tipe
                </Label>
                <Select
                  value={formType}
                  onValueChange={(v) => {
                    setFormType(v as typeof formType);
                    setFormCategoryId("");
                  }}
                >
                  <SelectTrigger
                    id="rule-type"
                    className="h-10 text-xs font-space-grotesk font-bold"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inflow">Pemasukan (+)</SelectItem>
                    <SelectItem value="outflow">Pengeluaran (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="rule-frequency"
                  className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
                >
                  Frekuensi
                </Label>
                <Select
                  value={formFrequency}
                  onValueChange={(v) =>
                    setFormFrequency(v as typeof formFrequency)
                  }
                >
                  <SelectTrigger
                    id="rule-frequency"
                    className="h-10 text-xs font-space-grotesk font-bold"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Harian</SelectItem>
                    <SelectItem value="weekly">Mingguan</SelectItem>
                    <SelectItem value="monthly">Bulanan</SelectItem>
                    <SelectItem value="yearly">Tahunan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="rule-account"
                className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
              >
                Akun / Dompet
              </Label>
              <Select value={formAccountId} onValueChange={setFormAccountId}>
                <SelectTrigger
                  id="rule-account"
                  className="h-10 text-xs font-space-grotesk font-bold"
                >
                  <SelectValue placeholder="Pilih Akun" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="rule-category"
                className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
              >
                Kategori
              </Label>
              <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                <SelectTrigger
                  id="rule-category"
                  className="h-10 text-xs font-space-grotesk font-bold"
                >
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((c) => (
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

            <div className="space-y-1.5">
              <Label
                htmlFor="rule-amount"
                className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
              >
                Nominal
              </Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-space-mono font-bold text-ink/60">
                  Rp
                </span>
                <NumericFormat
                  id="rule-amount"
                  customInput={Input}
                  value={formAmount ? formAmount : ""}
                  onValueChange={(values) =>
                    setFormAmount(String(values.floatValue ?? ""))
                  }
                  className="pl-9 font-space-mono font-bold text-sm"
                  placeholder="0"
                  thousandSeparator="."
                  decimalSeparator=","
                  min={1}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="rule-mode"
                className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
              >
                Mode Pencatatan
              </Label>
              <Select
                value={formMode}
                onValueChange={(v) => setFormMode(v as typeof formMode)}
              >
                <SelectTrigger
                  id="rule-mode"
                  className="h-10 text-xs font-space-grotesk font-bold"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto_post">
                    ⚡ Auto-post (otomatis dibuat sistem)
                  </SelectItem>
                  <SelectItem value="requires_confirmation">
                    ⏳ Butuh Konfirmasi Manual
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="rule-next-due"
                className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
              >
                Jatuh Tempo Pertama
              </Label>
              <Input
                id="rule-next-due"
                type="date"
                value={formNextDue}
                onChange={(e) => setFormNextDue(e.target.value)}
                className="font-space-mono text-sm font-bold"
              />
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3">
              <button
                type="button"
                className="btn-neubrutalism bg-white text-ink px-5 py-2 text-xs font-space-grotesk flex-1 sm:flex-none"
                onClick={() => setShowForm(false)}
              >
                Batal
              </button>
              <button
                id="btn-save-rule"
                className="btn-neubrutalism bg-hot-pink text-white px-5 py-2 text-xs font-space-grotesk flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  !formAccountId ||
                  !formCategoryId ||
                  !formAmount ||
                  !formNextDue ||
                  createRule.isPending
                }
                onClick={handleSave}
              >
                {createRule.isPending ? "Menyimpan…" : "Simpan Rule"}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
