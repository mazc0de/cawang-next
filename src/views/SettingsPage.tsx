"use client";
import { useState, useEffect } from "react";
import { User, Calendar, LogOut, Check, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import {
  useFinancialCycleConfig,
  useUpdateFinancialCycleConfig,
} from "@/hooks/useFinancialCycleConfig";
import { supabase } from "@/lib/supabase";

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { data: cycleConfig } = useFinancialCycleConfig();
  const updateCycleConfig = useUpdateFinancialCycleConfig();

  const [startDay, setStartDay] = useState("1");
  const [fullName, setFullName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [cycleSaved, setCycleSaved] = useState(false);

  useEffect(() => {
    if (cycleConfig?.start_day) setStartDay(String(cycleConfig.start_day));
  }, [cycleConfig]);

  useEffect(() => {
    if (user?.user_metadata?.full_name)
      setFullName(user.user_metadata.full_name);
  }, [user]);

  const handleSaveName = async () => {
    if (!fullName.trim()) return;
    setNameSaving(true);
    await supabase.auth.updateUser({ data: { full_name: fullName.trim() } });
    setNameSaving(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleSaveCycle = async () => {
    await updateCycleConfig.mutateAsync(Number(startDay));
    setCycleSaved(true);
    setTimeout(() => setCycleSaved(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto w-full">
      {/* 1. PROFIL PENGGUNA CARD */}
      <div
        id="card-profile"
        className="card-neubrutalism bg-white p-6 sm:p-7 space-y-6"
      >
        <div className="flex items-center gap-3.5 border-b-2 border-ink pb-4">
          <div className="w-12 h-12 rounded-[14px] bg-lilac border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
            <User className="h-6 w-6 text-ink" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-archivo-black text-xl text-ink">Profil Akun</h3>
            <p className="font-space-grotesk text-xs text-ink/70 mt-0.5">
              Informasi identitas akun CAWANG Anda
            </p>
          </div>
        </div>

        <div className="space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <label className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink/70">
              Alamat Email
            </label>
            <Input
              id="settings-email"
              value={user?.email ?? ""}
              disabled
              className="bg-canvas border-2 border-ink/40 font-space-mono text-sm font-bold text-ink/60 cursor-not-allowed"
            />
            <p className="text-[11px] font-space-grotesk text-ink/60">
              Alamat email terdaftar dan tidak dapat diubah.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="settings-name"
              className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
            >
              Nama Lengkap
            </label>
            <Input
              id="settings-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masukkan nama lengkap Anda"
              className="font-space-grotesk text-sm font-medium"
            />
          </div>

          <div className="pt-2">
            <button
              id="btn-save-profile"
              onClick={handleSaveName}
              disabled={nameSaving || !fullName.trim()}
              className="btn-neubrutalism bg-hot-pink text-white px-6 py-2.5 text-xs font-space-grotesk flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {nameSaved ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={3} />
                  Tersimpan!
                </>
              ) : nameSaving ? (
                "Menyimpan…"
              ) : (
                "Simpan Profil"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. FINANCIAL CYCLE CONFIG CARD */}
      <div
        id="card-cycle-config"
        className="card-neubrutalism bg-white p-6 sm:p-7 space-y-6"
      >
        <div className="flex items-center gap-3.5 border-b-2 border-ink pb-4">
          <div className="w-12 h-12 rounded-[14px] bg-canary border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
            <Calendar className="h-6 w-6 text-ink" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-archivo-black text-xl text-ink">
              Siklus Finansial (Financial Cycle)
            </h3>
            <p className="font-space-grotesk text-xs text-ink/70 mt-0.5">
              Pengaturan periode tanggal gajian & siklus pembukuan
            </p>
          </div>
        </div>

        <div className="space-y-5 max-w-xl">
          <div className="p-4 rounded-[14px] bg-canvas border-2 border-ink shadow-hard-sm flex items-start gap-3">
            <Info
              className="h-5 w-5 text-ink shrink-0 mt-0.5"
              strokeWidth={2.5}
            />
            <p className="font-space-grotesk text-xs text-ink/80 leading-relaxed">
              Budget bulanan, grafik analytics, dan perputaran arus kas akan
              dihitung dimulai dari tanggal siklus yang Anda pilih (misal:{" "}
              <strong>Tanggal {startDay}</strong> sampai{" "}
              <strong>
                Tanggal{" "}
                {Number(startDay) === 1 ? "akhir bulan" : Number(startDay) - 1}
              </strong>{" "}
              bulan berikutnya).
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="settings-start-day"
              className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
            >
              Tanggal Mulai Siklus (Start Day)
            </label>
            <Select value={startDay} onValueChange={setStartDay}>
              <SelectTrigger
                id="settings-start-day"
                className="w-56 h-11 text-xs font-space-grotesk font-bold"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <SelectItem
                    key={d}
                    value={String(d)}
                    className="font-space-grotesk text-xs font-bold"
                  >
                    Tanggal {d}{" "}
                    {d === 1 ? "(Awal Bulan)" : d === 25 ? "(Umum Gajian)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2">
            <button
              id="btn-save-cycle"
              onClick={handleSaveCycle}
              disabled={updateCycleConfig.isPending}
              className="btn-neubrutalism bg-hot-pink text-white px-6 py-2.5 text-xs font-space-grotesk flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cycleSaved ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={3} />
                  Siklus Disimpan!
                </>
              ) : updateCycleConfig.isPending ? (
                "Menyimpan…"
              ) : (
                "Simpan Siklus"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. DANGER ZONE / LOGOUT CARD */}
      <div
        id="card-danger-zone"
        className="card-neubrutalism bg-white p-6 sm:p-7 space-y-4"
      >
        <div className="flex items-center gap-3.5 border-b-2 border-ink pb-4">
          <div className="w-12 h-12 rounded-[14px] bg-coral border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
            <LogOut className="h-6 w-6 text-ink" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-archivo-black text-xl text-coral">
              Keluar dari Sesi
            </h3>
            <p className="font-space-grotesk text-xs text-ink/70 mt-0.5">
              Keluar dari akun Anda pada perangkat ini
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div>
            <p className="font-archivo-black text-sm text-ink">
              Akhiri Sesi Login
            </p>
            <p className="font-space-grotesk text-xs text-ink/60 mt-0.5">
              Anda akan diarahkan kembali ke halaman autentikasi.
            </p>
          </div>

          <button
            id="btn-settings-signout"
            onClick={signOut}
            className="btn-neubrutalism bg-coral text-ink px-5 py-2.5 text-xs font-space-grotesk font-bold flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" strokeWidth={2.5} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
