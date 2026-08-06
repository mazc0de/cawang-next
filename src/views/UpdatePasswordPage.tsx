"use client";
import { useState, useEffect } from 'react'
import { Navigate } from '@/components/Navigate';
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Loader2 } from 'lucide-react'

export function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password berhasil diperbarui! Anda akan dialihkan...')
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    }
    setLoading(false)
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
      </div>

      {/* Right: Update Password form */}
      <div className="flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">CAWANG</span>
          </div>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Perbarui Password</CardTitle>
              <CardDescription>Silakan masukkan password baru Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Min. 8 karakter"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                {error && (
                  <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
                )}
                {message && (
                  <p className="text-income text-sm bg-income/10 px-3 py-2 rounded-md">{message}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Simpan Password Baru
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
