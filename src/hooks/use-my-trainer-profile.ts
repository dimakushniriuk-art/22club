'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-keys'

/** Prima riga di `get_my_trainer_profile` (tipi allineati a `Database['public']['Functions']`). */
export type MyTrainerProfileRow = {
  pt_id: string
  pt_nome: string | null
  pt_cognome: string | null
  pt_avatar_url: string | null
  pt_email?: string | null
  pt_telefono?: string | null
}

export async function fetchMyTrainerProfile(): Promise<MyTrainerProfileRow | null> {
  const { data, error } = await supabase.rpc('get_my_trainer_profile')
  if (error) throw error
  if (!Array.isArray(data) || data.length === 0) return null
  const row = data[0] as MyTrainerProfileRow
  return row?.pt_id ? row : null
}

/**
 * RPC `get_my_trainer_profile` con cache React Query condivisa (stale 5 min)
 * per evitare richieste duplicate tra calendario atleta, /home/allenamenti, ecc.
 */
export function useMyTrainerProfile(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.athlete.myTrainerProfile,
    queryFn: fetchMyTrainerProfile,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
