"use client";
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface DashboardStats {
  net_worth: number
  income_this_cycle: number
  expense_this_cycle: number
  expense_today: number
  pending_confirmations_count: number
}

export function useDashboardStats(cycleStart: Date, cycleEnd: Date) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['dashboard_stats', user?.id, cycleStart.toISOString(), cycleEnd.toISOString()],
    queryFn: async () => {
      if (!user) return {
        net_worth: 0,
        income_this_cycle: 0,
        expense_this_cycle: 0,
        expense_today: 0,
        pending_confirmations_count: 0
      } as DashboardStats

      // 1. Net worth
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('opening_balance, transactions(amount, type)')
        .eq('user_id', user.id)
      
      if (accountsError) throw accountsError

      let net_worth = 0
      accountsData.forEach((acc: any) => {
        let bal = acc.opening_balance || 0
        if (acc.transactions) {
          acc.transactions.forEach((tx: any) => {
            if (tx.type === 'inflow') bal += tx.amount
            else if (tx.type === 'outflow') bal -= tx.amount
          })
        }
        net_worth += bal
      })

      // 2. Cycle transactions
      const startStr = cycleStart.toISOString().split('T')[0]
      const endStr = cycleEnd.toISOString().split('T')[0]

      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id)
        .gte('date', startStr)
        .lte('date', endStr)
        .eq('is_adjustment', false)
        .is('transfer_pair_id', null)

      if (txError) throw txError

      let income_this_cycle = 0
      let expense_this_cycle = 0

      txData.forEach(tx => {
        if (tx.type === 'inflow') income_this_cycle += tx.amount
        else if (tx.type === 'outflow') expense_this_cycle += tx.amount
      })

      // 3. Today's expense
      const todayStr = new Date().toISOString().split('T')[0]
      const { data: todayTxData, error: todayTxError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('date', todayStr)
        .eq('type', 'outflow')
        .eq('is_adjustment', false)
        .is('transfer_pair_id', null)

      if (todayTxError) throw todayTxError

      let expense_today = 0
      todayTxData.forEach(tx => {
        expense_today += tx.amount
      })

      // 4. Pending confirmations count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('recurring_rules')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('posting_mode', 'requires_confirmation')
        .lte('next_due_date', todayStr)

      if (pendingError) throw pendingError

      return {
        net_worth,
        income_this_cycle,
        expense_this_cycle,
        expense_today,
        pending_confirmations_count: pendingCount || 0
      } as DashboardStats
    },
    enabled: !!user,
  })
}
