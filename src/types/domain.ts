// ============================================================
// CAWANG Domain Types — sesuai dengan CONTEXT.md (ubiquitous language)
// Jangan gunakan istilah yg ada di bagian _Avoid_ di CONTEXT.md
// ============================================================

export type AccountType = 'bank' | 'e_wallet' | 'cash'

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  opening_balance: number
  created_at: string
  updated_at: string
}

export type TransactionType = 'inflow' | 'outflow'

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id: string
  amount: number
  type: TransactionType
  date: string
  notes?: string
  // Transfer Pair fields — null jika bukan Transfer
  transfer_pair_id?: string | null
  is_adjustment?: boolean // true = Adjustment Transaction dari Reconciliation
  created_at: string
  updated_at: string
  // Relations (populated via joins)
  account?: Account
  category?: Category
  tags?: Tag[]
}

export interface Category {
  id: string
  user_id: string
  name: string
  icon?: string
  color?: string
  type: TransactionType // kategori income atau expense
  created_at: string
}

export interface Tag {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface TransactionTag {
  transaction_id: string
  tag_id: string
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type RecurringPostingMode = 'auto_post' | 'requires_confirmation'

export interface RecurringRule {
  id: string
  user_id: string
  account_id: string
  category_id: string
  amount: number
  type: TransactionType
  frequency: RecurringFrequency
  posting_mode: RecurringPostingMode
  next_due_date: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Relations
  account?: Account
  category?: Category
}

/**
 * PendingConfirmation = RecurringRule dengan posting_mode 'requires_confirmation'
 * yang sudah jatuh tempo tapi belum di-approve user.
 * Ini bukan entitas terpisah — derived dari RecurringRule.
 */
export interface PendingConfirmation {
  recurring_rule: RecurringRule
  due_date: string
}

export type BudgetingFramework =
  | '50_30_20'
  | 'zero_based'
  | 'kakeibo'
  | 'envelope'

export interface FinancialCycleConfig {
  id: string
  user_id: string
  start_day: number // 1–28 (tanggal mulai cycle tiap bulan)
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  cycle_year: number
  cycle_month: number
  amount: number
  created_at: string
  updated_at: string
  // Relations
  category?: Category
  spent?: number // dihitung dari Transaction
}

/**
 * Financial Cycle = periode bulanan untuk Budget dan Analytics.
 * Dihitung dari FinancialCycleConfig.start_day.
 */
export interface FinancialCycle {
  startDate: Date
  endDate: Date
  year: number
  month: number
}

// ============================================================
// Auth types
// ============================================================

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}
