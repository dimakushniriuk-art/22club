import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import { z } from 'zod'

const logger = createLogger('api:admin:athletes:assign-trainer')

const bodySchema = z.object({
  athleteId: z.string().uuid(),
  trainerId: z.string().uuid(),
})

/**
 * POST /api/admin/athletes/assign-trainer
 * Assegna un trainer a un atleta (un solo active per atleta).
 * Body: { athleteId, trainerId }
 * Validazioni: athlete role=athlete, trainer role=trainer, stesso org_id.
 * Transazione: disattiva vecchio active, inserisce nuovo active. Idempotente se già assegnato a quel trainer.
 * Solo admin.
 */
export async function POST(request: NextRequest) {
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
    const me = profile as ProfileRow

    if (me.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin può assegnare il trainer' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dati non validi', details: parsed.error.issues }, { status: 400 })
    }
    const { athleteId, trainerId } = parsed.data

    const adminClient = createAdminClient()

    const { data: athlete, error: athleteErr } = await adminClient
      .from('profiles')
      .select('id, role, org_id')
      .eq('id', athleteId)
      .single()

    if (athleteErr || !athlete) {
      return NextResponse.json({ error: 'Atleta non trovato' }, { status: 404 })
    }
    if ((athlete as { role: string }).role !== 'athlete') {
      return NextResponse.json({ error: 'Il profilo indicato non è un atleta' }, { status: 400 })
    }

    const { data: trainer, error: trainerErr } = await adminClient
      .from('profiles')
      .select('id, role, org_id')
      .eq('id', trainerId)
      .single()

    if (trainerErr || !trainer) {
      return NextResponse.json({ error: 'Trainer non trovato' }, { status: 404 })
    }
    if ((trainer as { role: string }).role !== 'trainer') {
      return NextResponse.json({ error: 'Il profilo indicato non è un trainer' }, { status: 400 })
    }

    const aOrg = (athlete as { org_id: string | null }).org_id
    const tOrg = (trainer as { org_id: string | null }).org_id
    if (aOrg != null && tOrg != null && aOrg !== tOrg) {
      return NextResponse.json({ error: 'Athlete e trainer devono appartenere allo stesso org' }, { status: 400 })
    }
    const orgId = aOrg ?? tOrg ?? 'default-org'

    // Idempotenza: se già assegnato a questo trainer (active), no-op
    const { data: existing } = await adminClient
      .from('athlete_trainer_assignments')
      .select('id')
      .eq('athlete_id', athleteId)
      .eq('trainer_id', trainerId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ ok: true, message: 'Già assegnato a questo trainer' })
    }

    // Disattiva eventuale assegnazione active per questo atleta
    const { error: updateErr } = await adminClient
      .from('athlete_trainer_assignments')
      .update({ status: 'inactive', deactivated_at: new Date().toISOString() })
      .eq('athlete_id', athleteId)
      .eq('status', 'active')

    if (updateErr) {
      logger.warn('Update old assignment', updateErr)
    }

    const { error: insertErr } = await adminClient.from('athlete_trainer_assignments').insert({
      org_id: orgId,
      org_id_text: orgId,
      athlete_id: athleteId,
      trainer_id: trainerId,
      status: 'active',
      activated_at: new Date().toISOString(),
      created_by_profile_id: me.id,
    })

    if (insertErr) {
      logger.error('Errore inserimento assegnazione', insertErr)
      return NextResponse.json({ error: 'Errore durante l\'assegnazione del trainer' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Errore assign-trainer', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
