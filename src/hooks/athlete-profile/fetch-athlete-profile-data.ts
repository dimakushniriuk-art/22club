import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import type { Cliente } from '@/types/cliente'
import { progressLogsAthleteIdOrFilter } from '@/lib/progress-logs-athlete-scope'

const logger = createLogger('hooks:athlete-profile:fetch-athlete-profile-data')

export interface AthleteProfileStats {
  allenamenti_totali: number
  allenamenti_mese: number
  schede_attive: number
  documenti_scadenza: number
  ultimo_accesso: string | null
  peso_attuale: number | null
  lessons_remaining: number | null
}

export const EMPTY_ATHLETE_PROFILE_STATS: AthleteProfileStats = {
  allenamenti_totali: 0,
  allenamenti_mese: 0,
  schede_attive: 0,
  documenti_scadenza: 0,
  ultimo_accesso: null,
  peso_attuale: null,
  lessons_remaining: null,
}

export type AthleteProfileQueryResult = {
  athlete: Cliente
  athleteUserId: string
}

export type AthleteProfileStatsQueryResult = {
  stats: AthleteProfileStats
  statsError: string | null
}

type ProfileRow = {
  id: string
  nome: string | null
  cognome: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  avatar: string | null
  data_iscrizione: string | null
  created_at: string | null
  stato: string | null
  documenti_scadenza: boolean | null
  note: string | null
  role: string | null
  updated_at: string | null
  user_id: string | null
}

function pushSupabaseError(messages: string[], res: { error?: { message: string } | null }) {
  if (res.error?.message) {
    messages.push(res.error.message)
  }
}

function startOfMonthLocalYmd(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}-01`
}

function mapProfileRowToCliente(profile: ProfileRow): Cliente {
  return {
    id: profile.id,
    nome: profile.nome || '',
    cognome: profile.cognome || '',
    first_name: profile.first_name || profile.nome || '',
    last_name: profile.last_name || profile.cognome || '',
    email: profile.email || '',
    phone: profile.phone || null,
    avatar_url: profile.avatar_url || profile.avatar || null,
    data_iscrizione: profile.data_iscrizione || profile.created_at || '',
    stato: (profile.stato as 'attivo' | 'inattivo' | 'sospeso') || 'attivo',
    allenamenti_mese: 0,
    ultimo_accesso: null,
    scheda_attiva: null,
    documenti_scadenza: profile.documenti_scadenza || false,
    note: profile.note || null,
    tags: [],
    role: profile.role || '',
    created_at: profile.created_at || '',
    updated_at: profile.updated_at || '',
  }
}

export async function fetchAthleteProfileData(
  athleteId: string,
): Promise<AthleteProfileQueryResult> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*, user_id')
    .eq('id', athleteId)
    .eq('role', 'athlete')
    .single()

  if (profileError) {
    const { data: profile2, error: profileError2 } = await supabase
      .from('profiles')
      .select('*, user_id')
      .eq('id', athleteId)
      .eq('role', 'athlete')
      .single()

    if (profileError2) {
      throw profileError2
    }

    if (!profile2.user_id) {
      throw new Error('user_id non trovato nel profilo')
    }

    return {
      athlete: mapProfileRowToCliente(profile2 as ProfileRow),
      athleteUserId: profile2.user_id,
    }
  }

  if (!profile.user_id) {
    throw new Error('user_id non trovato nel profilo')
  }

  return {
    athlete: mapProfileRowToCliente(profile as ProfileRow),
    athleteUserId: profile.user_id,
  }
}

export async function fetchAthleteProfileStats(
  athleteId: string,
  athleteUserId: string,
  ultimoAccesso: string | null,
): Promise<AthleteProfileStatsQueryResult> {
  const errMsgs: string[] = []
  const startOfMonth = startOfMonthLocalYmd()
  const workoutLogsOr = `atleta_id.eq.${athleteId},athlete_id.eq.${athleteId}`
  const progressOr = progressLogsAthleteIdOrFilter(athleteId, athleteUserId)

  try {
    const totalRes = await supabase
      .from('workout_logs')
      .select('*', { count: 'exact', head: true })
      .or(workoutLogsOr)
    pushSupabaseError(errMsgs, totalRes)

    const monthRes = await supabase
      .from('workout_logs')
      .select('*', { count: 'exact', head: true })
      .or(workoutLogsOr)
      .gte('data', startOfMonth)
    pushSupabaseError(errMsgs, monthRes)

    const plansRes = await supabase
      .from('workout_plans')
      .select('*', { count: 'exact', head: true })
      .eq('athlete_id', athleteId)
      .eq('is_active', true)
    pushSupabaseError(errMsgs, plansRes)

    const docsRes = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('athlete_id', athleteId)
      .eq('status', 'in_scadenza')
    pushSupabaseError(errMsgs, docsRes)

    const progressRes = await supabase
      .from('progress_logs')
      .select('weight_kg')
      .or(progressOr)
      .order('date', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle()
    pushSupabaseError(errMsgs, progressRes)

    const counterRes = await supabase
      .from('lesson_counters')
      .select('count')
      .eq('athlete_id', athleteId)
      .maybeSingle()
    pushSupabaseError(errMsgs, counterRes)

    const weightRaw = progressRes.data?.weight_kg
    const pesoAttuale = weightRaw === null || weightRaw === undefined ? null : Number(weightRaw)

    return {
      stats: {
        allenamenti_totali: totalRes.count ?? 0,
        allenamenti_mese: monthRes.count ?? 0,
        schede_attive: plansRes.count ?? 0,
        documenti_scadenza: docsRes.count ?? 0,
        ultimo_accesso: ultimoAccesso,
        peso_attuale: Number.isFinite(pesoAttuale) ? pesoAttuale : null,
        lessons_remaining: counterRes.data?.count ?? null,
      },
      statsError: errMsgs.length ? [...new Set(errMsgs)].join(' · ') : null,
    }
  } catch (err) {
    logger.error('Errore caricamento statistiche', err, { athleteId })
    const msg = err instanceof Error ? err.message : 'Errore nel caricamento delle statistiche'
    return {
      stats: { ...EMPTY_ATHLETE_PROFILE_STATS, ultimo_accesso: ultimoAccesso },
      statsError: msg,
    }
  }
}
