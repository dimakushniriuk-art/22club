/**
 * Nomi tabelle e viste Supabase per il modulo nutrizionista (schema legacy).
 * Assegnazioni: staff_atleti (staff_id, atleta_id, status).
 * Piani: nutrition_plan_groups → nutrition_plan_versions → nutrition_plan_days → nutrition_plan_meals → nutrition_plan_items.
 * Monitoraggio: nutrition_progress, nutrition_weekly_analysis.
 * Autoadattamento: nutrition_adjustments, nutrition_auto_config, nutrition_adaptive_settings.
 * Usare nutritionFrom() per tabelle/viste non nei tipi generati.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export function nutritionFrom(client: SupabaseClient, tableName: string) {
  return (client as { from: (t: string) => ReturnType<SupabaseClient['from']> }).from(tableName)
}

export const NUTRITION_TABLES = {
  /** Assegnazioni atleta↔nutrizionista: usare supabase.from('staff_atleti') con staff_id, atleta_id, status, staff_type. */
  staffAssignments: 'staff_atleti',
  /** Header piano (athlete_id, …). */
  planGroups: 'nutrition_plan_groups',
  /** Versioni: FK verso groups (colonna reale group_id o plan_group_id), version_number, calories_target, protein_target, carb_target, fat_target, status, start_date, end_date, pdf_file_path, created_by, created_at, auto_generated, auto_adjustment_reason. */
  planVersions: 'nutrition_plan_versions',
  planDays: 'nutrition_plan_days',
  planMeals: 'nutrition_plan_meals',
  planItems: 'nutrition_plan_items',
  /** Monitoraggio / check-in. */
  progress: 'nutrition_progress',
  weeklyAnalysis: 'nutrition_weekly_analysis',
  adjustments: 'nutrition_adjustments',
  autoConfig: 'nutrition_auto_config',
  adaptiveSettings: 'nutrition_adaptive_settings',
  /** Vista: staff_atleti + profiles + latest version + progress. */
  viewAthletes: 'v_nutritionist_athletes',
  /** Vista: timeline progressi per nutrizionista (progress_id, athlete_name, weight, body_fat, waist, hip, created_at, source, created_by_role). */
  viewProgressTimeline: 'v_nutritionist_progress_timeline',
  /** Vista: overview atleti con ultimo progresso, days_since_last_progress, weight_delta_7d. */
  viewProgressAthletes: 'v_nutritionist_progress_athletes',
  /** Vista: analisi settimanale per nutrizionista (weekly_id, version_id, athlete, week_start/end, avg_weight, delta_weight, target_delta, delta_vs_target, adjustment_applied). */
  viewWeeklyAnalysis: 'v_nutritionist_weekly_analysis',
  /** Vista: documenti atleti assegnati al nutrizionista (document_id, athlete_name, category, file_url, status, expires_at, uploaded_by_profile_id, …). */
  viewDocuments: 'v_nutritionist_documents',
} as const

/** staff_atleti.status: solo 'active' dà accesso. */
export const STAFF_ASSIGNMENT_STATUS_ACTIVE = 'active'
/** staff_atleti.staff_type per nutrizionista. */
export const STAFF_TYPE_NUTRIZIONISTA = 'nutrizionista'

/** nutrition_plan_versions.status. */
export const PLAN_VERSION_STATUS_ACTIVE = 'active'
export const PLAN_VERSION_STATUS_DRAFT = 'draft'
export const PLAN_VERSION_STATUS_ARCHIVED = 'archived'
