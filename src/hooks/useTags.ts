"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Tag } from '@/types/domain'

export function useTags() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['tags', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (error) throw error
      return data as Tag[]
    },
    enabled: !!user,
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (newTag: Omit<Tag, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('tags')
        .insert([{ ...newTag, user_id: user.id }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags', user?.id] })
    },
  })
}
