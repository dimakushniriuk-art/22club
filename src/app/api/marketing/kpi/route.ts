import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:marketing:kpi')

export type AthleteMarketingMetricEnriched = {
  athlete_id: string
  workouts_total_count: number
  workouts_solo_count: number
  workouts_coached_count: number
  last_workout_at: string | null
  nome: string | null
  cognome: string | null
  email: string | null
}

/**
 * GET /api/marketing/kpi
 * Restituisce KPI dalla view marketing_athletes (dati da athlete_marketing_kpis, no raw).
 * Solo admin/marketing.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { data: role } = await supabase.rpc('get_current_user_role')
    if (role !== 'admin' && role !== 'marketing') {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const { data: rows, error } = await supabase.rpc('marketing_list_athletes', {
      p_limit: 500,
      p_offset: 0,
    })

    if (error) {
      logger.warn('Errore RPC marketing_list_athletes', error)
      return NextResponse.json(
        { error: 'Errore nel caricamento KPI' },
        { status: 500 },
      )
    }

    const enriched: AthleteMarketingMetricEnriched[] = (rows ?? []).map((r: { athlete_profile_id: string; first_name: string | null; last_name: string | null; email: string | null; workouts_coached_30d: number; workouts_solo_30d: number; last_workout_at: string | null }) => {
      const coached = Number(r.workouts_coached_30d ?? 0)
      const solo = Number(r.workouts_solo_30d ?? 0)
      return {
        athlete_id: r.athlete_profile_id,
        workouts_total_count: coached + solo,
        workouts_solo_count: solo,
        workouts_coached_count: coached,
        last_workout_at: r.last_workout_at,
        nome: r.first_name ?? null,
        cognome: r.last_name ?? null,
        email: r.email ?? null,
      }
    })

    return NextResponse.json({ data: enriched })
  } catch (err) {
    logger.error('Errore API marketing KPI', err)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 },
    )
  }
}
