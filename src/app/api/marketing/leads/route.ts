import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:marketing:leads')

export type MarketingLeadRow = {
  id: string
  org_id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  source: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  status: string
  created_at: string
  updated_at: string
  converted_athlete_profile_id: string | null
}

/**
 * GET /api/marketing/leads
 * Lista lead del tenant (filtrata da RLS per org_id). Solo admin o marketing.
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    const role = (profile as { role?: string } | null)?.role
    if (role !== 'admin' && role !== 'marketing') {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const source = searchParams.get('source')

    let query = supabase
      .from('marketing_leads')
      .select('id, org_id, first_name, last_name, email, phone, source, utm_source, utm_medium, utm_campaign, status, created_at, updated_at, converted_athlete_profile_id')
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (source) query = query.eq('source', source)

    const { data: rows, error } = await query

    if (error) {
      logger.warn('Errore GET marketing/leads', error)
      return NextResponse.json({ error: 'Errore nel caricamento lead' }, { status: 500 })
    }

    return NextResponse.json({ data: (rows ?? []) as MarketingLeadRow[] })
  } catch (err) {
    logger.error('Errore API marketing leads', err)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

/**
 * POST /api/marketing/leads
 * Crea un lead (solo admin/marketing, RLS verifica org_id).
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

    const body = await request.json()
    const { first_name, last_name, email, phone, source, utm_source, utm_medium, utm_campaign, status, campaign_id: bodyCampaignId } = body as Record<string, unknown>

    const insert = {
      org_id: prof.org_id,
      org_id_text: prof.org_id,
      email: typeof email === 'string' ? email : '',
      first_name: typeof first_name === 'string' ? first_name : null,
      last_name: typeof last_name === 'string' ? last_name : null,
      phone: typeof phone === 'string' ? phone : null,
      source: typeof source === 'string' ? source : null,
      utm_source: typeof utm_source === 'string' ? utm_source : null,
      utm_medium: typeof utm_medium === 'string' ? utm_medium : null,
      utm_campaign: typeof utm_campaign === 'string' ? utm_campaign : null,
      status: typeof status === 'string' && ['new', 'contacted', 'trial', 'converted', 'lost'].includes(status) ? status : 'new',
    }

    const { data: row, error } = await supabase.from('marketing_leads').insert(insert).select().single()

    if (error) {
      logger.warn('Errore POST marketing/leads', error)
      return NextResponse.json({ error: error.message || 'Errore creazione lead' }, { status: 500 })
    }

    const leadId = (row as { id?: string })?.id
    const campaignId = typeof bodyCampaignId === 'string' && bodyCampaignId.trim() ? bodyCampaignId.trim() : null
    if (leadId && prof.org_id) {
      await supabase.from('marketing_events').insert({
        org_id: prof.org_id,
        org_id_text: prof.org_id,
        type: 'lead_created',
        lead_id: leadId,
        campaign_id: campaignId || null,
        actor_profile_id: prof.id ?? null,
        source: typeof source === 'string' ? source : null,
        medium: typeof utm_medium === 'string' ? utm_medium : null,
        utm_campaign: typeof utm_campaign === 'string' ? utm_campaign : null,
        payload: body as import('@/lib/supabase/types').Json,
      })
    }

    return NextResponse.json({ data: row })
  } catch (err) {
    logger.error('Errore API marketing leads POST', err)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
