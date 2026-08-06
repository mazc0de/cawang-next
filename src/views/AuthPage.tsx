"use client";
import { useState } from 'react'
import { Navigate } from '@/components/Navigate';
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, Shield, BarChart3, Loader2 } from 'lucide-react'

export function AuthPage() {
  const { user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setAuthLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) {
      setError(error.message)
    } else {
      if (data.session) {
        setMessage('Pendaftaran berhasil! Mengalihkan ke dashboard...')
      } else {
        setMessage('Cek email Anda untuk konfirmasi pendaftaran.')
      }
    }
    setAuthLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError(null)
    setMessage(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Instruksi reset password telah dikirim ke email Anda.')
    }
    setAuthLoading(false)
  }

  return (
    <div className="min-h-svh grid lg:grid-cols-2">
      {/* Left: Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, oklch(1 0 0 / 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, oklch(1 0 0 / 0.2) 0%, transparent 40%)`
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight">CAWANG</span>
          </div>
          <p className="text-primary-foreground/70 text-sm">Catat Keuangan</p>
        </div>

        <div className="relative space-y-8">
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Kendalikan keuangan<br />dengan percaya diri.
            </h1>
            <p className="text-primary-foreground/80 text-lg leading-relaxed">
              Dashboard keuangan personal yang membantu Anda mencatat transaksi,
              merencanakan budget, dan memahami arus kas — dalam satu tempat.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: BarChart3, label: 'Analytics real-time', desc: 'Income vs Expense, Budget vs Aktual' },
              { icon: Shield, label: 'Privasi terjaga', desc: 'Data Anda hanya milik Anda' },
              { icon: TrendingUp, label: 'Proyeksi cash flow', desc: 'Lihat hari depan lewat Recurring Rule' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary-foreground/15 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-primary-foreground/60 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-primary-foreground/50 text-xs">
          IDR only · Single-user · Data aman dengan Supabase Auth
        </p>
      </div>

      {/* Right: Auth form */}
      <div className="flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">CAWANG</span>
          </div>

          {isResettingPassword ? (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Lupa Password</CardTitle>
                <CardDescription>Masukkan email Anda untuk mereset password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  {error && (
                    <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
                  )}
                  {message && (
                    <p className="text-income text-sm bg-income/10 px-3 py-2 rounded-md">{message}</p>
                  )}
                  <div className="flex flex-col gap-2 pt-2">
                    <Button type="submit" disabled={authLoading}>
                      {authLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Kirim Link Reset
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => { setIsResettingPassword(false); setError(null); setMessage(null); }}>
                      Kembali ke Login
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" id="tab-login">Masuk</TabsTrigger>
                <TabsTrigger value="register" id="tab-register">Daftar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Selamat datang kembali</CardTitle>
                    <CardDescription>Masuk ke akun CAWANG Anda</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSignIn} className="space-y-4" id="form-login">
                      <div className="space-y-1.5">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="nama@email.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password">Password</Label>
                          <Button variant="link" className="p-0 h-auto text-xs font-normal" onClick={() => setIsResettingPassword(true)} type="button">
                            Lupa password?
                          </Button>
                        </div>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                        />
                      </div>
                      {error && (
                        <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
                      )}
                      <Button type="submit" id="btn-login" className="w-full" disabled={authLoading}>
                        {authLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Masuk
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

            <TabsContent value="register">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Buat akun baru</CardTitle>
                  <CardDescription>Mulai catat keuangan Anda hari ini</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4" id="form-register">
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-name">Nama Lengkap</Label>
                      <Input
                        id="reg-name"
                        type="text"
                        placeholder="Nama Anda"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Min. 8 karakter"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </div>
                    {error && (
                      <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
                    )}
                    {message && (
                      <p className="text-income text-sm bg-income/10 px-3 py-2 rounded-md">{message}</p>
                    )}
                    <Button type="submit" id="btn-register" className="w-full" disabled={authLoading}>
                      {authLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Buat Akun
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Dengan mendaftar, Anda menyetujui bahwa data keuangan disimpan dengan aman menggunakan enkripsi Supabase.
          </p>
        </div>
      </div>
    </div>
  )
}
