import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:admin:users:assignments')

/**
 * GET /api/admin/users/assignments?athleteId=...
 * Restituisce le assegnazioni trainer per l'atleta (attuale + storico).
 * Solo admin.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    type ProfileRow = { id: string; role: string }
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileRow

    if (profileTyped.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin può accedere' }, { status: 403 })
    }

    const athleteId = request.nextUrl.searchParams.get('athleteId')
    if (!athleteId) {
      return NextResponse.json({ error: 'athleteId obbligatorio' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data: rows, error } = await adminClient
      .from('athlete_trainer_assignments')
      .select('id, trainer_id, status, activated_at, deactivated_at, created_at, profiles!athlete_trainer_assignments_trainer_id_fkey(nome, cognome)')
      .eq('athlete_id', athleteId)
      .order('activated_at', { ascending: false })

    if (error) {
      logger.error('Errore lettura assegnazioni', error)
      return NextResponse.json({ error: 'Errore lettura assegnazioni' }, { status: 500 })
    }

    const current = (rows ?? []).find((r) => r.status === 'active') ?? null
    const history = (rows ?? []).filter((r) => r.status === 'inactive')

    return NextResponse.json({
      current: current
        ? {
            trainerId: current.trainer_id,
            trainerName: (current.profiles as { nome?: string | null; cognome?: string | null } | null)
              ? `${(current.profiles as { cognome?: string | null }).cognome ?? ''} ${(current.profiles as { nome?: string | null }).nome ?? ''}`.trim() || null
              : null,
            activated_at: current.activated_at,
          }
        : null,
      history: history.map((h) => ({
        trainerId: h.trainer_id,
        trainerName: (h.profiles as { nome?: string | null; cognome?: string | null } | null)
          ? `${(h.profiles as { cognome?: string | null }).cognome ?? ''} ${(h.profiles as { nome?: string | null }).nome ?? ''}`.trim() || null
          : null,
        activated_at: h.activated_at,
        deactivated_at: h.deactivated_at,
      })),
    })
  } catch (error) {
    logger.error('Errore GET assignments', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
