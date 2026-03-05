import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:admin:users:trainer')

/**
 * GET /api/admin/users/trainer?athleteId=...
 * Restituisce il trainer attualmente assegnato all'atleta (athlete_trainer_assignments, status=active).
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

    type ProfileRow = { id: string; org_id: string | null; role: string }
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, org_id, role')
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
    const { data: assignment, error: assignError } = await adminClient
      .from('athlete_trainer_assignments')
      .select('trainer_id')
      .eq('athlete_id', athleteId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (assignError) {
      logger.error('Errore lettura assegnazione trainer', assignError)
      return NextResponse.json({ error: 'Errore lettura assegnazione' }, { status: 500 })
    }

    return NextResponse.json({ trainerId: assignment?.trainer_id ?? null })
  } catch (error) {
    logger.error('Errore GET trainer', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
