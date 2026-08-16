"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { TrendingUp, Loader2, KeyRound, Check } from 'lucide-react';

export function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password berhasil diperbarui! Anda akan dialihkan ke dashboard...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-svh grid lg:grid-cols-12 bg-canvas text-ink font-space-grotesk selection:bg-hot-pink selection:text-white">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 xl:p-16 border-r-2 border-ink bg-[#fdfaf3] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-12 h-12 rounded-[16px] bg-canary border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6 text-ink" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-archivo-black text-3xl tracking-tight text-ink block leading-tight">CAWANG</span>
              <p className="font-space-grotesk text-xs font-bold text-ink/70 uppercase tracking-wider">Catat Keuangan</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 my-auto py-8 space-y-4">
          <h1 className="font-archivo-black text-4xl xl:text-5xl text-ink leading-[1.15]">
            Perbarui Kata Sandi
          </h1>
          <p className="font-space-grotesk text-ink/80 text-base max-w-lg leading-relaxed font-medium">
            Amankan kembali akun Anda dengan memasukkan kata sandi baru yang kuat.
          </p>
        </div>

        <div className="relative z-10 pt-4 flex items-center gap-2 text-xs font-space-mono font-bold text-ink/60">
          <span>Enkripsi Supabase Auth</span>
        </div>
      </div>

      {/* Right: Update Password Form */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 lg:hidden mb-2">
            <div className="w-11 h-11 rounded-[14px] bg-canary border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-ink" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-archivo-black text-2xl tracking-tight text-ink block leading-none">CAWANG</span>
              <p className="font-space-grotesk text-[11px] font-bold text-ink/70 uppercase tracking-wider">Catat Keuangan</p>
            </div>
          </div>

          <div className="card-neubrutalism bg-white p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-[12px] bg-lilac border-2 border-ink shadow-hard-sm flex items-center justify-center mb-3">
                <KeyRound className="h-5 w-5 text-ink" strokeWidth={2.5} />
              </div>
              <h2 className="font-archivo-black text-2xl text-ink">Password Baru</h2>
              <p className="font-space-grotesk text-xs text-ink/70">
                Silakan buat password baru minimal 8 karakter.
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="new-password" className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink">
                  Password Baru
                </label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="font-space-grotesk text-sm font-medium"
                />
              </div>

              {error && (
                <div className="p-3 rounded-[12px] bg-coral border-2 border-ink shadow-hard-sm text-xs font-space-grotesk font-bold text-ink">
                  {error}
                </div>
              )}
              {message && (
                <div className="p-3 rounded-[12px] bg-mint border-2 border-ink shadow-hard-sm text-xs font-space-grotesk font-bold text-ink flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" strokeWidth={3} />
                  <span>{message}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-neubrutalism bg-hot-pink text-white w-full py-3 text-sm font-space-grotesk font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Simpan Password Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

