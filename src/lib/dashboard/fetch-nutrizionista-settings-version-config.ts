import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { createLogger } from '@/lib/logger'
import { NUTRITION_TABLES, nutritionFrom } from '@/lib/nutrition-tables'

const logger = createLogger('lib:dashboard:fetch-nutrizionista-settings-version-config')

export const DEFAULT_NUTRIZIONISTA_AUTO_CONFIG = {
  meals_per_day: 5,
  macro_distribution_mode: 'equal' as const,
  carb_cycling: false,
}

export const DEFAULT_NUTRIZIONISTA_ADAPTIVE_SETTINGS = {
  goal_type: 'maintain' as const,
  weekly_target_percent: 0.5,
  tolerance_percent: 0.2,
  min_calorie_adjustment: -150,
  max_calorie_adjustment: 150,
  protein_floor_per_kg: 1.8,
  adjust_frequency_days: 7,
}

export type NutrizionistaSettingsAutoConfig = {
  meals_per_day: number
  macro_distribution_mode: string
  carb_cycling: boolean
}

export type NutrizionistaSettingsAdaptiveSettings = {
  goal_type: string
  weekly_target_percent: number
  tolerance_percent: number
  min_calorie_adjustment: number
  max_calorie_adjustment: number
  protein_floor_per_kg: number
  adjust_frequency_days: number
}

export type NutrizionistaSettingsVersionConfigData = {
  autoConfig: NutrizionistaSettingsAutoConfig
  adaptiveSettings: NutrizionistaSettingsAdaptiveSettings
  autoConfigLoaded: boolean
  adaptiveLoaded: boolean
}

export async function fetchNutrizionistaSettingsVersionConfig(
  supabase: SupabaseClient<Database>,
  versionId: string,
): Promise<NutrizionistaSettingsVersionConfigData> {
  const [configRes, settingsRes] = await Promise.all([
    nutritionFrom(supabase, NUTRITION_TABLES.autoConfig)
      .select('*')
      .eq('version_id', versionId)
      .maybeSingle(),
    nutritionFrom(supabase, NUTRITION_TABLES.adaptiveSettings)
      .select('*')
      .eq('version_id', versionId)
      .maybeSingle(),
  ])

  if (configRes.error) {
    logger.warn('auto_config versione', configRes.error)
  }
  if (settingsRes.error) {
    logger.warn('adaptive_settings versione', settingsRes.error)
  }

  const config = (configRes.error ? null : configRes.data) as {
    meals_per_day?: number
    macro_distribution_mode?: string
    carb_cycling?: boolean
  } | null
  const settings = (settingsRes.error ? null : settingsRes.data) as {
    goal_type?: string
    weekly_target_percent?: number
    tolerance_percent?: number
    min_calorie_adjustment?: number
    max_calorie_adjustment?: number
    protein_floor_per_kg?: number
    adjust_frequency_days?: number
  } | null

  return {
    autoConfig: config
      ? {
          meals_per_day: config.meals_per_day ?? DEFAULT_NUTRIZIONISTA_AUTO_CONFIG.meals_per_day,
          macro_distribution_mode:
            config.macro_distribution_mode ??
            DEFAULT_NUTRIZIONISTA_AUTO_CONFIG.macro_distribution_mode,
          carb_cycling: config.carb_cycling ?? DEFAULT_NUTRIZIONISTA_AUTO_CONFIG.carb_cycling,
        }
      : DEFAULT_NUTRIZIONISTA_AUTO_CONFIG,
    adaptiveSettings: settings
      ? {
          goal_type: settings.goal_type ?? DEFAULT_NUTRIZIONISTA_ADAPTIVE_SETTINGS.goal_type,
          weekly_target_percent:
            settings.weekly_target_percent ??
            DEFAULT_NUTRIZIONISTA_ADAPTIVE_SETTINGS.weekly_target_percent,
          tolerance_percent:
            settings.tolerance_percent ?? DEFAULT_NUTRIZIONISTA_ADAPTIVE_SETTINGS.tolerance_percent,
          min_calorie_adjustment:
            settings.min_calorie_adjustment ??
            DEFAULT_NUTRIZIONISTA_ADAPTIVE_SETTINGS.min_calorie_adjustment,
          max_calorie_adjustment:
            settings.max_calorie_adjustment ??
            DEFAULT_NUTRIZIONISTA_ADAPTIVE_SETTINGS.max_calorie_adjustment,
          protein_floor_per_kg:
            settings.protein_floor_per_kg ??
            DEFAULT_NUTRIZIONISTA_ADAPTIVE_SETTINGS.protein_floor_per_kg,
          adjust_frequency_days:
            settings.adjust_frequency_days ??
            DEFAULT_NUTRIZIONISTA_ADAPTIVE_SETTINGS.adjust_frequency_days,
        }
      : DEFAULT_NUTRIZIONISTA_ADAPTIVE_SETTINGS,
    autoConfigLoaded: Boolean(config),
    adaptiveLoaded: Boolean(settings),
  }
}
