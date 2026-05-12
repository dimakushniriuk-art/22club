import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { ProfileRow, SupabaseExt } from '@/features/welcome-onboarding/types'
import type { WelcomeQuestionnaireRow } from '@/features/welcome-onboarding/lib/welcome-questionnaire-helpers'

export async function fetchWelcomeAthleteProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    const msg = (error.message ?? '').toLowerCase()
    const isLockOrAbort =
      (error instanceof Error && error.name === 'AbortError') ||
      msg.includes('aborted') ||
      msg.includes('lock broken')
    if (isLockOrAbort) return null
    throw error
  }

  return data
}

export async function fetchWelcomeQuestionnaire(
  supabaseExt: SupabaseExt,
  athleteId: string,
  version: string,
): Promise<WelcomeQuestionnaireRow | null> {
  const { data, error } = await supabaseExt
    .from('athlete_questionnaires')
    .select('anamnesi, manleva, liberatoria_media')
    .eq('athlete_id', athleteId)
    .eq('version', version)
    .maybeSingle()

  if (error) throw error
  return data as WelcomeQuestionnaireRow | null
}
