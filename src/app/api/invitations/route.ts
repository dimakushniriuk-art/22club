import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'
import { createLogger } from '@/lib/logger'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
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
    const { user } = await getServerAuthUser(supabase)

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const profile = await resolveProfileByIdentifier(supabase, user.id, 'id, role')
    const profileId = profile?.id as string | undefined
    const role = profile?.role as string | undefined
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

    const rows = data ?? []
    const registratiEmails = rows
      .filter(
        (r) =>
          r.status === 'accepted' || (r.stato && String(r.stato).toLowerCase() === 'registrato'),
      )
      .map((r) => r.email)
      .filter(Boolean) as string[]

    let filtered = rows
    if (registratiEmails.length > 0) {
      const existingEmails = new Set<string>()
      for (const emailChunk of chunkForSupabaseIn(registratiEmails)) {
        const { data: existingProfiles } = await supabase
          .from('profiles')
          .select('email')
          .in('email', emailChunk)
          .or('is_deleted.eq.false,is_deleted.is.null')
        for (const p of existingProfiles ?? []) {
          const em = (p as { email: string }).email
          if (em) existingEmails.add(em)
        }
      }
      filtered = rows.filter((r) => {
        const isRegistrato =
          r.status === 'accepted' || (r.stato && String(r.stato).toLowerCase() === 'registrato')
        if (!isRegistrato) return true
        return existingEmails.has(r.email)
      })
    }

    const finalCount =
      !enablePagination && registratiEmails.length > 0
        ? filtered.length
        : (count ?? filtered.length)
    return NextResponse.json({
      data: filtered,
      count: finalCount,
    })
  } catch (error) {
    logger.error('Errore API list invitations', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
