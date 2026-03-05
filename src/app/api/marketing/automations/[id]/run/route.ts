import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import { applySegmentRules, type SegmentRules } from '@/lib/marketing/segment-rules'

const logger = createLogger('api:marketing:automations:run')

/**
 * POST /api/marketing/automations/:id/run
 * Esegue manualmente l'automation: carica segmento + atleti, applica regole, esegue action (eventi/suggerimenti), aggiorna last_run_at.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'id obbligatorio' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, org_id')
      .eq('user_id', session.user.id)
      .single()

    const role = (profile as { role?: string; org_id?: string } | null)?.role
    if (role !== 'admin' && role !== 'marketing') {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const orgId = (profile as { org_id?: string } | null)?.org_id
    if (!orgId) {
      return NextResponse.json({ error: 'Profilo senza org_id' }, { status: 400 })
    }

    const { data: automation, error: autoErr } = await supabase
      .from('marketing_automations')
      .select('*')
      .eq('id', id)
      .single()

    if (autoErr || !automation) {
      return NextResponse.json({ error: autoErr?.message ?? 'Automation non trovata' }, { status: 404 })
    }

    const { data: segment, error: segErr } = await supabase
      .from('marketing_segments')
      .select('id, name, rules')
      .eq('id', (automation as { segment_id: string }).segment_id)
      .single()

    if (segErr || !segment) {
      return NextResponse.json({ error: 'Segmento non trovato' }, { status: 404 })
    }

    const { data: athletesRows, error: athErr } = await supabase
      .from('marketing_athletes')
      .select('athlete_id, last_workout_at, workouts_coached_7d, workouts_solo_7d, workouts_coached_30d, workouts_solo_30d')

    if (athErr) {
      logger.warn('Errore fetch marketing_athletes', athErr)
      return NextResponse.json({ error: 'Errore caricamento atleti' }, { status: 500 })
    }

    const athletes = (athletesRows ?? []) as {
      athlete_id: string
      last_workout_at: string | null
      workouts_coached_7d: number | null
      workouts_solo_7d: number | null
      workouts_coached_30d: number | null
      workouts_solo_30d: number | null
    }[]
    const rules = (segment as { rules?: SegmentRules }).rules as SegmentRules | undefined
    const filtered = applySegmentRules(athletes, rules ?? undefined)
    const athletesCount = filtered.length

    const segmentId = (segment as { id: string }).id
    const actionType = (automation as { action_type: string }).action_type
    const actionPayload = (automation as { action_payload: Record<string, unknown> }).action_payload ?? {}

    if (actionType === 'create_campaign_suggestion') {
      const suggestedName = (actionPayload.suggested_name as string) ?? `Suggerimento: ${(segment as { name?: string }).name ?? 'Segmento'}`
      const suggestedBudget = (actionPayload.suggested_budget as number) ?? null
      await supabase.from('marketing_events').insert({
        org_id: orgId,
        org_id_text: orgId,
        type: 'campaign_suggestion',
        payload: {
          segment_id: segmentId,
          athletes_count: athletesCount,
          suggested_name: suggestedName,
          suggested_budget: suggestedBudget,
          automation_id: id,
        },
      })
    } else if (actionType === 'log_event') {
      const eventType = (actionPayload.event_type as string) ?? 'segment_audience'
      await supabase.from('marketing_events').insert({
        org_id: orgId,
        org_id_text: orgId,
        type: eventType,
        payload: {
          segment_id: segmentId,
          athletes_count: athletesCount,
          automation_id: id,
        },
      })
    }
    // tag_leads: no-op in MVP

    const { error: updateErr } = await supabase
      .from('marketing_automations')
      .update({ last_run_at: new Date().toISOString() })
      .eq('id', id)

    if (updateErr) {
      logger.warn('Errore update last_run_at', updateErr)
    }

    return NextResponse.json({
      data: {
        automation_id: id,
        athletes_count: athletesCount,
        action_type: actionType,
        last_run_at: new Date().toISOString(),
      },
    })
  } catch (err) {
    logger.error('Errore run automation', err)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
