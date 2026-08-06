"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Account } from '@/types/domain'

export type AccountWithBalance = Account & { actual_balance: number }

export function useAccounts() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('accounts')
        .select('*, transactions(amount, type)')
        .eq('user_id', user.id)
        .order('name')

      if (error) throw error

      return (data || []).map((acc: any) => {
        let actual_balance = acc.opening_balance || 0
        if (acc.transactions && Array.isArray(acc.transactions)) {
          acc.transactions.forEach((tx: any) => {
            if (tx.type === 'inflow') {
              actual_balance += tx.amount
            } else if (tx.type === 'outflow') {
              actual_balance -= tx.amount
            }
          })
        }
        // Remove transactions array from final object to keep it clean
        const { transactions, ...rest } = acc
        return {
          ...rest,
          actual_balance,
        } as AccountWithBalance
      })
    },
    enabled: !!user,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (newAccount: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('accounts')
        .insert([{ ...newAccount, user_id: user.id }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] })
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Account> & { id: string }) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] })
    },
  })
}
