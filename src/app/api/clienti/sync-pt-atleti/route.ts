import { NextResponse } from 'next/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:clienti:sync-pt-atleti')

const ALLOWED_ROLES = ['admin', 'pt', 'trainer']

/**
 * POST /api/clienti/sync-pt-atleti
 * Sincronizza pt_atleti da athlete_trainer_assignments (attivi).
 * Utile per atleti registrati via invito prima dell'inserimento in pt_atleti.
 * Solo staff (trainer/pt/admin) può chiamare; sincronizza le assegnazioni del proprio profilo.
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)

    if (!user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const profile = await resolveProfileByIdentifier(supabase, user.id, 'id, role')
    const profileId = profile?.id as string | undefined
    const role = profile?.role as string | undefined
    if (!profileId || !role || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ ok: true, synced: 0 })
    }

    const adminClient = createAdminClient()
    const { data: assignments, error: assignErr } = await adminClient
      .from('athlete_trainer_assignments')
      .select('trainer_id, athlete_id')
      .eq('trainer_id', profileId)
      .eq('status', 'active')

    if (assignErr || !assignments?.length) {
      return NextResponse.json({ ok: true, synced: 0 })
    }

    // pt_atleti non può avere pt_id = atleta_id (constraint pt_atleti_pt_not_self)
    const rows = assignments
      .filter((a) => a.trainer_id !== a.athlete_id)
      .map((a) => ({
        pt_id: a.trainer_id,
        atleta_id: a.athlete_id,
      }))
    const { error: upsertErr } = await adminClient
      .from('pt_atleti')
      .upsert(rows, { onConflict: 'pt_id,atleta_id', ignoreDuplicates: true })

    if (upsertErr) {
      logger.warn('Errore upsert pt_atleti (sync-pt-atleti)', upsertErr)
      return NextResponse.json(
        { error: upsertErr.message || 'Errore sincronizzazione' },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true, synced: rows.length })
  } catch (err) {
    logger.error('Errore API sync-pt-atleti', err)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
