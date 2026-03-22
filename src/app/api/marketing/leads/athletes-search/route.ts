import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:marketing:leads:athletes-search')

type RpcRow = {
  athlete_id: string
  first_name: string | null
  last_name: string | null
  email: string | null
}

/**
 * GET /api/marketing/leads/athletes-search?q=
 * Cerca atleti dello stesso org per dropdown conversione. Usa RPC search_athletes_for_marketing(q).
 * q opzionale. Solo admin/marketing (RLS/context nella RPC). Nessun accesso diretto a profiles.
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
    const q = searchParams.get('q')?.trim() ?? undefined

    const { data: rows, error } = await supabase.rpc('search_athletes_for_marketing', { q })

    if (error) {
      logger.warn('Errore RPC search_athletes_for_marketing', error)
      return NextResponse.json({ error: error.message || 'Errore ricerca atleti' }, { status: 500 })
    }

    const list = (Array.isArray(rows) ? rows : []) as RpcRow[]
    const data = list.map((r) => ({
      id: r.athlete_id,
      first_name: r.first_name,
      last_name: r.last_name,
      email: r.email,
    }))

    return NextResponse.json({ data })
  } catch (err) {
    logger.error('Errore API marketing leads athletes-search', err)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
