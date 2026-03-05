import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:marketing:athletes')

export type MarketingAthleteRow = {
  athlete_id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  workouts_coached_7d: number | null
  workouts_solo_7d: number | null
  workouts_coached_30d: number | null
  workouts_solo_30d: number | null
  workouts_coached_90d?: number | null
  workouts_solo_90d?: number | null
  last_workout_at: string | null
  stato?: string | null
}

/** RPC restituisce athlete_profile_id; l'API mappa in athlete_id per compatibilità UI. */
type RpcRow = {
  athlete_profile_id: string
  org_id: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  stato: string | null
  workouts_coached_7d: number
  workouts_solo_7d: number
  workouts_coached_30d: number
  workouts_solo_30d: number
  workouts_coached_90d: number
  workouts_solo_90d: number
  massages_30d: number
  nutrition_visits_30d: number
  last_activity_at: string | null
  last_workout_at: string | null
  updated_at: string | null
}

/**
 * GET /api/marketing/athletes
 * Lista atleti con KPI tramite RPC marketing_list_athletes (gateway safe).
 * Solo admin/marketing; la RPC valida ruolo e org_id. Nessun SELECT su profiles/workout_logs dal client.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim() ?? ''
    const stato = searchParams.get('stato')?.trim() ?? ''
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 500)
    const offset = Math.max(Number(searchParams.get('offset')) || 0, 0)

    const { data: rows, error } = await supabase.rpc('marketing_list_athletes', {
      p_search: search || undefined,
      p_stato: stato || undefined,
      p_limit: limit,
      p_offset: offset,
    })

    if (error) {
      const msg = error.message ?? ''
      if (
        msg.includes('ruolo non autorizzato') ||
        msg.includes('org_id mancante') ||
        msg.includes('Forbidden') ||
        msg.includes('forbidden')
      ) {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
      }
      logger.warn('GET marketing/athletes RPC error', error)
      return NextResponse.json(
        { error: 'Errore nel caricamento atleti' },
        { status: 500 },
      )
    }

    const list: MarketingAthleteRow[] = (rows ?? []).map((r: RpcRow) => ({
      athlete_id: r.athlete_profile_id,
      first_name: r.first_name,
      last_name: r.last_name,
      email: r.email,
      workouts_coached_7d: r.workouts_coached_7d,
      workouts_solo_7d: r.workouts_solo_7d,
      workouts_coached_30d: r.workouts_coached_30d,
      workouts_solo_30d: r.workouts_solo_30d,
      workouts_coached_90d: r.workouts_coached_90d,
      workouts_solo_90d: r.workouts_solo_90d,
      last_workout_at: r.last_workout_at,
      stato: r.stato,
    }))

    return NextResponse.json({ data: list })
  } catch (err) {
    logger.error('Errore API marketing athletes', err)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 },
    )
  }
}
