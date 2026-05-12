'use client'

import { useQuery } from '@tanstack/react-query'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { queryKeys } from '@/lib/query-keys'

export type AthleteCatalogExerciseRow = {
  id: string
  name: string
  description: string | null
  video_url: string | null
  thumb_url: string | null
  image_url: string | null
  difficulty: string
  equipment: string | null
  muscle_group: string
}

async function fetchAthleteCatalogExercise(
  supabase: SupabaseClient<Database>,
  exerciseId: string,
): Promise<AthleteCatalogExerciseRow> {
  const { data, error } = await supabase
    .from('exercises')
    .select(
      'id, name, description, video_url, thumb_url, image_url, difficulty, equipment, muscle_group',
    )
    .eq('id', exerciseId)
    .single()

  if (error) throw error
  if (!data) throw new Error('Esercizio non trovato')
  return data as AthleteCatalogExerciseRow
}

export function useAthleteCatalogExercise(exerciseId: string | null, enabled = true) {
  const supabase = useSupabaseClient()
  const queryEnabled = Boolean(exerciseId) && enabled

  return useQuery({
    queryKey: queryKeys.allenamenti.catalogExercise(exerciseId ?? ''),
    queryFn: () => fetchAthleteCatalogExercise(supabase, exerciseId!),
    enabled: queryEnabled,
    staleTime: 5 * 60 * 1000,
  })
}
