"use client";
import { useState, useEffect } from 'react'
import { Settings, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardCard, DashboardCardContent, DashboardCardDescription, DashboardCardHeader, DashboardCardTitle } from '@/components/shared/DashboardCard'
import { Input } from '@/components/ui/input'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FieldWrapper } from '@/components/shared/FieldWrapper'
import { useAuth } from '@/contexts/AuthContext'
import { useFinancialCycleConfig, useUpdateFinancialCycleConfig } from '@/hooks/useFinancialCycleConfig'
import { supabase } from '@/lib/supabase'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const { data: cycleConfig } = useFinancialCycleConfig()
  const updateCycleConfig = useUpdateFinancialCycleConfig()

  const [startDay, setStartDay] = useState('1')
  const [fullName, setFullName] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)
  const [cycleSaved, setCycleSaved] = useState(false)

  useEffect(() => {
    if (cycleConfig?.start_day) setStartDay(String(cycleConfig.start_day))
  }, [cycleConfig])

  useEffect(() => {
    if (user?.user_metadata?.full_name) setFullName(user.user_metadata.full_name)
  }, [user])

  const handleSaveName = async () => {
    if (!fullName.trim()) return
    setNameSaving(true)
    await supabase.auth.updateUser({ data: { full_name: fullName.trim() } })
    setNameSaving(false)
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  const handleSaveCycle = async () => {
    await updateCycleConfig.mutateAsync(Number(startDay))
    setCycleSaved(true)
    setTimeout(() => setCycleSaved(false), 2000)
  }

  return (
    <div className="flex flex-col min-h-svh">


      <main className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-6">
      <DashboardHeader title="Pengaturan" />
        {/* Profile */}
        <DashboardCard id="card-profile">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Profil
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-4">
            <FieldWrapper label="Email" htmlFor="settings-email">
              <Input id="settings-email" value={user?.email ?? ''} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">Email tidak dapat diubah</p>
            </FieldWrapper>
            <FieldWrapper label="Nama" htmlFor="settings-name">
              <Input
                id="settings-name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Nama Anda"
              />
            </FieldWrapper>
            <Button
              id="btn-save-profile"
              size="sm"
              onClick={handleSaveName}
              disabled={nameSaving || !fullName.trim()}
            >
              {nameSaved ? '✓ Tersimpan' : nameSaving ? 'Menyimpan…' : 'Simpan Profil'}
            </Button>
          </DashboardCardContent>
        </DashboardCard>

        {/* Financial Cycle Config */}
        <DashboardCard id="card-cycle-config">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Financial Cycle
            </DashboardCardTitle>
            <DashboardCardDescription>
              Tanggal mulai Financial Cycle bulanan Anda. Budget dan laporan Analytics dihitung berdasarkan periode ini.
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-4">
            <FieldWrapper
              label="Tanggal Mulai Cycle"
              htmlFor="settings-start-day"
              description={`Contoh: Tanggal ${startDay} → Cycle mulai tanggal ${startDay} tiap bulan.`}
            >
              <Select value={startDay} onValueChange={setStartDay}>
                <SelectTrigger id="settings-start-day" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                    <SelectItem key={d} value={String(d)}>Tanggal {d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldWrapper>
            <Button
              id="btn-save-cycle"
              size="sm"
              onClick={handleSaveCycle}
              disabled={updateCycleConfig.isPending}
            >
              {cycleSaved ? '✓ Tersimpan' : updateCycleConfig.isPending ? 'Menyimpan…' : 'Simpan Pengaturan'}
            </Button>
          </DashboardCardContent>
        </DashboardCard>

        {/* Danger zone */}
        <DashboardCard id="card-danger-zone" className="border-red-200">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2 text-base text-red-600">
              <Settings className="h-4 w-4" />
              Zona Berbahaya
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-slate-800">Keluar dari Akun</p>
                <p className="text-xs text-slate-500 mt-1">Anda akan diarahkan ke halaman login</p>
              </div>
              <Button variant="destructive" size="sm" id="btn-settings-signout" onClick={signOut} className="rounded-full bg-red-100 hover:bg-red-200 text-red-600 shadow-none px-4">
                Keluar
              </Button>
            </div>
          </DashboardCardContent>
        </DashboardCard>
      </main>
    </div>
  )
}
