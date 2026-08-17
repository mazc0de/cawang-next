"use client";
import { useState } from "react";
import { Navigate } from "@/components/Navigate";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Shield,
  BarChart3,
  Loader2,
  ArrowRight,
  Sparkles,
  RefreshCw,
  KeyRound,
} from "lucide-react";

export function AuthPage() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-canvas">
        <Loader2 className="h-10 w-10 animate-spin text-ink" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    setAuthLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      setError(error.message);
    } else {
      if (data.session) {
        setMessage("Pendaftaran berhasil! Mengalihkan ke dashboard...");
      } else {
        setMessage("Cek email Anda untuk konfirmasi pendaftaran.");
      }
    }
    setAuthLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage("Instruksi reset password telah dikirim ke email Anda.");
    }
    setAuthLoading(false);
  };

  return (
    <div className="min-h-svh grid lg:grid-cols-12 bg-canvas text-ink font-space-grotesk selection:bg-hot-pink selection:text-white">
      {/* Left: Branding & Value Props (7 cols) */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 xl:p-16 border-r-2 border-ink bg-[#fdfaf3] relative overflow-hidden">
        {/* Top App Title */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-12 h-12 rounded-[16px] bg-canary border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6 text-ink" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-archivo-black text-3xl tracking-tight text-ink block leading-tight">
                CAWANG
              </span>
              <p className="font-space-grotesk text-xs font-bold text-ink/70 uppercase tracking-wider">
                Catat Keuangan
              </p>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 space-y-8 my-auto py-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint border-2 border-ink shadow-hard-sm font-space-grotesk font-bold text-xs text-ink mb-4">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
              Platform Keuangan Personal Modern
            </div>
            <h1 className="font-archivo-black text-4xl xl:text-5xl text-ink leading-[1.15] mb-4">
              Kendalikan keuangan
              <br />
              dengan percaya diri.
            </h1>
            <p className="font-space-grotesk text-ink/80 text-base max-w-lg leading-relaxed font-medium">
              Dashboard keuangan personal yang membantu Anda mencatat transaksi,
              merencanakan budget, dan memahami arus kas — dalam satu tempat.
            </p>
          </div>

          {/* Value Props Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
            <div className="card-neubrutalism bg-white p-4 space-y-2 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-[12px] bg-mint border-2 border-ink shadow-hard-sm flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-ink" strokeWidth={2.5} />
              </div>
              <p className="font-archivo-black text-sm text-ink">
                Analytics Real-Time
              </p>
              <p className="font-space-grotesk text-xs text-ink/70">
                Visualisasi arus kas & rincian kategori cycle bulanan.
              </p>
            </div>

            <div className="card-neubrutalism bg-white p-4 space-y-2 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-[12px] bg-canary border-2 border-ink shadow-hard-sm flex items-center justify-center">
                <Shield className="h-5 w-5 text-ink" strokeWidth={2.5} />
              </div>
              <p className="font-archivo-black text-sm text-ink">
                Privasi Terjaga
              </p>
              <p className="font-space-grotesk text-xs text-ink/70">
                Data Anda terenkripsi aman menggunakan Supabase Auth.
              </p>
            </div>

            <div className="card-neubrutalism bg-white p-4 space-y-2 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-[12px] bg-lilac border-2 border-ink shadow-hard-sm flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-ink" strokeWidth={2.5} />
              </div>
              <p className="font-archivo-black text-sm text-ink">
                Jadwal Rutin
              </p>
              <p className="font-space-grotesk text-xs text-ink/70">
                Otomatisasi tagihan, gaji & proyeksi kalender kas.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-4 flex items-center gap-2 text-xs font-space-mono font-bold text-ink/60">
          <span>IDR (Rupiah)</span>
          <span>•</span>
          <span>Single-User</span>
          <span>•</span>
          <span>Supabase Cloud Engine</span>
        </div>
      </div>

      {/* Right: Auth Form (5 cols) */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 lg:hidden mb-2">
            <div className="w-11 h-11 rounded-[14px] bg-canary border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-ink" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-archivo-black text-2xl tracking-tight text-ink block leading-none">
                CAWANG
              </span>
              <p className="font-space-grotesk text-[11px] font-bold text-ink/70 uppercase tracking-wider">
                Catat Keuangan
              </p>
            </div>
          </div>

          {isResettingPassword ? (
            /* Reset Password Card */
            <div className="card-neubrutalism bg-white p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <div className="w-10 h-10 rounded-[12px] bg-lilac border-2 border-ink shadow-hard-sm flex items-center justify-center mb-3">
                  <KeyRound className="h-5 w-5 text-ink" strokeWidth={2.5} />
                </div>
                <h2 className="font-archivo-black text-2xl text-ink">
                  Lupa Password
                </h2>
                <p className="font-space-grotesk text-xs text-ink/70">
                  Masukkan email terdaftar untuk menerima instruksi perbaruan
                  kata sandi.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="reset-email"
                    className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
                  >
                    Email
                  </label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="font-space-grotesk text-sm font-medium"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-[12px] bg-coral border-2 border-ink shadow-hard-sm text-xs font-space-grotesk font-bold text-ink">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="p-3 rounded-[12px] bg-mint border-2 border-ink shadow-hard-sm text-xs font-space-grotesk font-bold text-ink">
                    {message}
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="btn-neubrutalism bg-hot-pink text-white w-full py-3 text-sm font-space-grotesk font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {authLoading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Kirim Link Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResettingPassword(false);
                      setError(null);
                      setMessage(null);
                    }}
                    className="btn-neubrutalism bg-white text-ink w-full py-2.5 text-xs font-space-grotesk font-bold"
                  >
                    Kembali ke Login
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Login & Register Tabs */
            <Tabs defaultValue="login" className="w-full space-y-6">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-canvas border-2 border-ink rounded-[14px] shadow-hard-sm">
                <TabsTrigger value="login" id="tab-login">
                  Masuk
                </TabsTrigger>
                <TabsTrigger value="register" id="tab-register">
                  Daftar Akun
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: LOGIN */}
              <TabsContent value="login" className="mt-0">
                <div className="card-neubrutalism bg-white p-6 sm:p-8 space-y-6">
                  <div className="space-y-1">
                    <h2 className="font-archivo-black text-2xl text-ink">
                      Selamat Datang Kembali
                    </h2>
                    <p className="font-space-grotesk text-xs text-ink/70">
                      Masuk ke akun CAWANG Anda untuk melanjutkan pembukuan.
                    </p>
                  </div>

                  <form
                    onSubmit={handleSignIn}
                    className="space-y-4"
                    id="form-login"
                  >
                    <div className="space-y-1.5">
                      <label
                        htmlFor="login-email"
                        className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
                      >
                        Email
                      </label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="font-space-grotesk text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="login-password"
                          className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
                        >
                          Password
                        </label>
                        <button
                          type="button"
                          className="font-space-grotesk text-xs font-bold text-ink underline hover:text-hot-pink transition-colors cursor-pointer"
                          onClick={() => setIsResettingPassword(true)}
                        >
                          Lupa password?
                        </button>
                      </div>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="font-space-grotesk text-sm font-medium"
                      />
                    </div>

                    {error && (
                      <div className="p-3 rounded-[12px] bg-coral border-2 border-ink shadow-hard-sm text-xs font-space-grotesk font-bold text-ink">
                        {error}
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        id="btn-login"
                        disabled={authLoading}
                        className="btn-neubrutalism bg-hot-pink text-white w-full py-3 text-sm font-space-grotesk font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {authLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" strokeWidth={3} />
                        )}
                        Masuk ke Dashboard
                      </button>
                    </div>
                  </form>
                </div>
              </TabsContent>

              {/* TAB 2: REGISTER */}
              <TabsContent value="register" className="mt-0">
                <div className="card-neubrutalism bg-white p-6 sm:p-8 space-y-6">
                  <div className="space-y-1">
                    <h2 className="font-archivo-black text-2xl text-ink">
                      Buat Akun Baru
                    </h2>
                    <p className="font-space-grotesk text-xs text-ink/70">
                      Mulai catat dan kelola keuangan pribadi Anda hari ini.
                    </p>
                  </div>

                  <form
                    onSubmit={handleSignUp}
                    className="space-y-4"
                    id="form-register"
                  >
                    <div className="space-y-1.5">
                      <label
                        htmlFor="reg-name"
                        className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
                      >
                        Nama Lengkap
                      </label>
                      <Input
                        id="reg-name"
                        type="text"
                        placeholder="Nama Anda"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        autoComplete="name"
                        className="font-space-grotesk text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="reg-email"
                        className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
                      >
                        Email
                      </label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="font-space-grotesk text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="reg-password"
                        className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink"
                      >
                        Password
                      </label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Minimal 8 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="font-space-grotesk text-sm font-medium"
                      />
                    </div>

                    {error && (
                      <div className="p-3 rounded-[12px] bg-coral border-2 border-ink shadow-hard-sm text-xs font-space-grotesk font-bold text-ink">
                        {error}
                      </div>
                    )}
                    {message && (
                      <div className="p-3 rounded-[12px] bg-mint border-2 border-ink shadow-hard-sm text-xs font-space-grotesk font-bold text-ink">
                        {message}
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        id="btn-register"
                        disabled={authLoading}
                        className="btn-neubrutalism bg-hot-pink text-white w-full py-3 text-sm font-space-grotesk font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {authLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" strokeWidth={2.5} />
                        )}
                        Daftar Akun CAWANG
                      </button>
                    </div>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <p className="text-center text-xs font-space-grotesk text-ink/60 leading-relaxed px-4">
            Dengan mendaftar atau masuk, Anda menyetujui bahwa data keuangan
            disimpan dengan aman menggunakan enkripsi Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}
