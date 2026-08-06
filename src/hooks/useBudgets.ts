"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Budget } from '@/types/domain'

export function useBudgets(cycleYear: number, cycleMonth: number) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['budgets', user?.id, cycleYear, cycleMonth],
    queryFn: async () => {
      if (!user) return []

      // Fetch budgets
      const { data: budgets, error: budgetError } = await supabase
        .from('budgets')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .eq('cycle_year', cycleYear)
        .eq('cycle_month', cycleMonth)

      if (budgetError) throw budgetError

      const { data: config } = await supabase.from('financial_cycle_config').select('start_day').eq('user_id', user.id).single()
      const startDay = config?.start_day || 1
      
      let startDate = new Date(cycleYear, cycleMonth - 1, startDay)
      let endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      endDate.setDate(endDate.getDate() - 1)
      
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('user_id', user.id)
        .eq('type', 'outflow')
        .eq('is_adjustment', false)
        .is('transfer_pair_id', null)
        .gte('date', startDateStr)
        .lte('date', endDateStr)

      if (txError) throw txError

      const spentMap = transactions.reduce((acc: Record<string, number>, tx) => {
        acc[tx.category_id] = (acc[tx.category_id] || 0) + tx.amount
        return acc
      }, {})

      return (budgets || []).map(budget => ({
        ...budget,
        spent: spentMap[budget.category_id] || 0
      })) as Budget[]
    },
    enabled: !!user && !!cycleYear && !!cycleMonth,
  })
}

export function useUpsertBudget() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'category' | 'spent'>) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('budgets')
        .upsert({ ...budget, user_id: user.id }, {
          onConflict: 'user_id,category_id,cycle_year,cycle_month'
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', user?.id, variables.cycle_year, variables.cycle_month] })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', user?.id] })
    },
  })
}
