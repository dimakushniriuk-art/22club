import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import { buildLegacyOrgWriteContext } from '@/lib/organizations/current-org'

const logger = createLogger('api:marketing:leads:[id]')

/**
 * GET /api/marketing/leads/:id
 * Dettaglio lead + note. Solo admin/marketing stesso tenant (RLS).
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { data: lead, error: leadError } = await supabase
      .from('marketing_leads')
      .select('*')
      .eq('id', id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: leadError?.message ?? 'Lead non trovato' }, { status: 404 })
    }

    const { data: notes } = await supabase
      .from('marketing_lead_notes')
      .select('id, note, author_id, created_at')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ data: { lead, notes: notes ?? [] } })
  } catch (err) {
    logger.error('Errore API marketing leads GET', err)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

/**
 * PATCH /api/marketing/leads/:id
 * Aggiorna stato e/o nota di un lead. Solo admin/marketing stesso tenant (RLS).
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      .select('role, id')
      .eq('user_id', session.user.id)
      .single()

    const prof = profile as { role?: string; id?: string } | null
    if (prof?.role !== 'admin' && prof?.role !== 'marketing') {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const { status, note } = body

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (
      typeof status === 'string' &&
      ['new', 'contacted', 'trial', 'converted', 'lost'].includes(status)
    ) {
      update.status = status
    }

    const { data: lead, error: updateError } = await supabase
      .from('marketing_leads')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      logger.warn('Errore PATCH marketing/leads', updateError)
      return NextResponse.json(
        { error: updateError.message || 'Errore aggiornamento lead' },
        { status: 500 },
      )
    }
    if (!lead) {
      return NextResponse.json({ error: 'Lead non trovato' }, { status: 404 })
    }

    if (typeof note === 'string' && note.trim()) {
      const orgId = (lead as { org_id?: string }).org_id
      if (orgId && prof?.id) {
        const orgWriteContext = buildLegacyOrgWriteContext({
          profile: { org_id: orgId },
          message: 'Lead senza org_id',
        })
        await supabase.from('marketing_lead_notes').insert({
          ...orgWriteContext,
          lead_id: id,
          author_id: prof.id,
          note: note.trim(),
        })
      }
    }

    return NextResponse.json({ data: lead })
  } catch (err) {
    logger.error('Errore API marketing leads PATCH', err)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
