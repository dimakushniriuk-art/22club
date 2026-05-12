'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-keys'

/**
 * `profiles.stato_cliente` per gating calendario atleta (`/home/appuntamenti`).
 */
export function useAthleteStatoCliente(profileId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.athlete.statoCliente(profileId ?? ''),
    queryFn: async (): Promise<string> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('stato_cliente')
        .eq('id', profileId!)
        .single()
      if (error || !data) return 'cliente'
      return (data as { stato_cliente?: string | null }).stato_cliente ?? 'cliente'
    },
    enabled: enabled && Boolean(profileId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
