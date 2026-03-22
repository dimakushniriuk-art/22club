import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import type { Json } from '@/lib/supabase/types'

const logger = createLogger('api:marketing:events')

/**
 * POST /api/marketing/events
 * Inserisce un evento marketing (solo admin/marketing, org_id dal profilo).
 * Body: type (required), campaign_id?, lead_id?, source?, medium?, utm_campaign?, payload?
 * occurred_at = now(), actor_profile_id = profilo corrente.
 */
export async function POST(request: NextRequest) {
  try {
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
      .select('role, org_id, id')
      .eq('user_id', session.user.id)
      .single()

    const prof = profile as { role?: string; org_id?: string | null; id?: string } | null
    if (prof?.role !== 'admin' && prof?.role !== 'marketing') {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }
    if (!prof?.org_id) {
      return NextResponse.json({ error: 'Profilo senza org_id' }, { status: 400 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const { type, campaign_id, lead_id, source, medium, utm_campaign, payload } = body

    if (typeof type !== 'string' || !type.trim()) {
      return NextResponse.json({ error: 'type obbligatorio' }, { status: 400 })
    }

    const insert = {
      org_id: prof.org_id,
      org_id_text: prof.org_id,
      type: type.trim(),
      campaign_id:
        typeof campaign_id === 'string' && campaign_id.trim() ? campaign_id.trim() : null,
      lead_id: typeof lead_id === 'string' && lead_id.trim() ? lead_id.trim() : null,
      actor_profile_id: prof.id ?? null,
      source: typeof source === 'string' ? source : null,
      medium: typeof medium === 'string' ? medium : null,
      utm_campaign: typeof utm_campaign === 'string' ? utm_campaign : null,
      payload: (payload != null && typeof payload === 'object' ? payload : {}) as Json,
    }

    const { data: row, error } = await supabase
      .from('marketing_events')
      .insert(insert)
      .select('id, type, occurred_at')
      .single()

    if (error) {
      logger.warn('Errore POST marketing/events', error)
      return NextResponse.json(
        { error: error.message ?? 'Errore inserimento evento' },
        { status: 500 },
      )
    }

    return NextResponse.json({ data: row })
  } catch (err) {
    logger.error('Errore API marketing events POST', err)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
