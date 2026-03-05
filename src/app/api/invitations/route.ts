import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'

const logger = createLogger('api:invitations:list')

const ALLOWED_ROLES = ['admin', 'trainer']

/**
 * GET /api/invitations?page=0&pageSize=50&enablePagination=false
 * Elenco inviti atleta (SELECT lato server, sessione da cookie - evita RLS 42501 dal client).
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', session.user.id)
      .single()

    const profileId = (profile as { id?: string; role?: string } | null)?.id
    const role = (profile as { id?: string; role?: string } | null)?.role
    if (!profileId || !role || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ data: [], count: 0 }, { status: 200 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(0, parseInt(searchParams.get('page') ?? '0', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '50', 10)))
    const enablePagination = searchParams.get('enablePagination') === 'true'

    let query = supabase
      .from('inviti_atleti')
      .select('*', { count: enablePagination ? 'exact' : undefined })
      .order('created_at', { ascending: false })

    if (role === 'trainer') {
      query = query.eq('pt_id', profileId)
    }

    if (enablePagination) {
      const from = page * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)
    }

    const { data, error, count } = await query.returns<Tables<'inviti_atleti'>[]>()

    if (error) {
      logger.error('Errore SELECT inviti_atleti', error, { profileId, role })
      return NextResponse.json(
        { error: error.message || 'Errore nel caricamento degli inviti' },
        { status: 502 },
      )
    }

    return NextResponse.json({
      data: data ?? [],
      count: count ?? (data?.length ?? 0),
    })
  } catch (error) {
    logger.error('Errore API list invitations', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 },
    )
  }
}
