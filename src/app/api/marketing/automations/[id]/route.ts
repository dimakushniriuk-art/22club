import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:marketing:automations:[id]')

/**
 * GET /api/marketing/automations/:id
 * Dettaglio automazione + segmento. Solo admin/marketing (RLS).
 */
export async function GET(
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
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    const role = (profile as { role?: string } | null)?.role
    if (role !== 'admin' && role !== 'marketing') {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const { data: automation, error: autoErr } = await supabase
      .from('marketing_automations')
      .select('*')
      .eq('id', id)
      .single()

    if (autoErr || !automation) {
      return NextResponse.json({ error: autoErr?.message ?? 'Automazione non trovata' }, { status: 404 })
    }

    const segmentId = (automation as { segment_id: string }).segment_id
    const { data: segment } = await supabase
      .from('marketing_segments')
      .select('id, name, description, rules, is_active')
      .eq('id', segmentId)
      .single()

    return NextResponse.json({
      data: {
        automation,
        segment: segment ?? null,
      },
    })
  } catch (err) {
    logger.error('Errore GET automation', err)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
