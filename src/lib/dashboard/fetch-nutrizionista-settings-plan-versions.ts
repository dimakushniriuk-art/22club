import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { createLogger } from '@/lib/logger'
import { NUTRITION_TABLES, nutritionFrom } from '@/lib/nutrition-tables'

const logger = createLogger('lib:dashboard:fetch-nutrizionista-settings-plan-versions')

export type NutrizionistaSettingsPlanVersion = {
  id: string
  plan_id: string
  version_number: number | null
  status: string | null
  created_at: string | null
}

export async function fetchNutrizionistaSettingsPlanVersions(
  supabase: SupabaseClient<Database>,
  planId: string,
): Promise<NutrizionistaSettingsPlanVersion[]> {
  const { data, error } = await nutritionFrom(supabase, NUTRITION_TABLES.planVersions)
    .select('id, plan_id, version_number, status, created_at')
    .eq('plan_id', planId)
    .order('version_number', { ascending: false })
  if (error) {
    logger.error('Impostazioni: versioni piano', error)
    throw error
  }
  return (data ?? []) as NutrizionistaSettingsPlanVersion[]
}
