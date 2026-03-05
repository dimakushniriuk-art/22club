import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:marketing:leads:[id]:convert')

/**
 * POST /api/marketing/leads/:id/convert
 * Converte lead in atleta collegando un profile atleta esistente.
 * Body: { athlete_profile_id: string (uuid) }
 * Imposta: status=converted, converted_athlete_profile_id, converted_by_profile_id, converted_at.
 * Il trigger su marketing_leads scrive la history e converted_at se non fornito.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'id lead obbligatorio' }, { status: 400 })
    }

    const body = await request.json() as { athlete_profile_id?: string }
    const athleteProfileId = body?.athlete_profile_id
    if (typeof athleteProfileId !== 'string' || !athleteProfileId.trim()) {
      return NextResponse.json({ error: 'athlete_profile_id obbligatorio' }, { status: 400 })
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
      .select('role, id')
      .eq('user_id', session.user.id)
      .single()

    const prof = profile as { role?: string; id?: string } | null
    if (prof?.role !== 'admin' && prof?.role !== 'marketing') {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const update = {
      status: 'converted',
      converted_athlete_profile_id: athleteProfileId.trim(),
      converted_by_profile_id: prof?.id ?? null,
      converted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: lead, error: updateError } = await supabase
      .from('marketing_leads')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      logger.warn('Errore convert lead', updateError)
      return NextResponse.json({ error: updateError.message ?? 'Errore conversione lead' }, { status: 500 })
    }
    if (!lead) {
      return NextResponse.json({ error: 'Lead non trovato' }, { status: 404 })
    }

    return NextResponse.json({ data: lead })
  } catch (err) {
    logger.error('Errore API marketing leads convert', err)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
