import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format angka ke format Rupiah Indonesia.
 * Contoh: 1500000 → "Rp 1.500.000"
 */
export function formatRupiah(amount: number, compact = false): string {
  if (compact && Math.abs(amount) >= 1_000_000) {
    const value = amount / 1_000_000
    return `Rp ${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}jt`
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format tanggal ke format Indonesia.
 * Contoh: "1 Agustus 2026"
 */
export function formatDate(date: string | Date, fmt = 'd MMMM yyyy'): string {
  return format(new Date(date), fmt, { locale: idLocale })
}

/**
 * Format tanggal singkat.
 * Contoh: "1 Agt 2026"
 */
export function formatDateShort(date: string | Date): string {
  return format(new Date(date), 'd MMM yyyy', { locale: idLocale })
}

/**
 * Hitung Financial Cycle dari tanggal sekarang dan start_day config.
 * Contoh: start_day=15, tanggal sekarang 20 Juli → Cycle 15 Jul – 14 Agt
 */
export function getCurrentFinancialCycle(startDay: number): {
  startDate: Date
  endDate: Date
} {
  const now = new Date()
  const day = now.getDate()

  let startDate: Date
  if (day >= startDay) {
    startDate = new Date(now.getFullYear(), now.getMonth(), startDay)
  } else {
    // cycle dimulai bulan lalu
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, startDay)
  }

  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + 1)
  endDate.setDate(endDate.getDate() - 1)

  return { startDate, endDate }
}
