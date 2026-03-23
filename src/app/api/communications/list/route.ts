import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'
import { getCommunications } from '@/lib/communications/service'
import type { Tables } from '@/types/supabase'

type CommunicationStatus = Tables<'communications'>['status']

const ALLOWED_STATUSES: CommunicationStatus[] = [
  'draft',
  'scheduled',
  'sending',
  'sent',
  'failed',
  'cancelled',
]

function parseStatuses(raw: string | null): CommunicationStatus[] | undefined {
  if (!raw?.trim()) return undefined
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const valid = parts.filter((p): p is CommunicationStatus =>
    ALLOWED_STATUSES.includes(p as CommunicationStatus),
  )
  return valid.length > 0 ? valid : undefined
}

/**
 * GET /api/communications/list
 * Query: status (singolo o CSV), type, limit, offset
 * Risposta: { communications, count } — evita chiave top-level `data` per compatibilità con apiGet.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const profileRow = await resolveProfileByIdentifier(supabase, user.id, 'id, role')
    const role = profileRow?.role as string | undefined
    const canList =
      role && ['admin', 'trainer', 'nutrizionista', 'massaggiatore', 'marketing'].includes(role)
    if (!canList) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const statuses = parseStatuses(searchParams.get('status'))

    const typeRaw = searchParams.get('type')
    const type =
      typeRaw && ['push', 'email', 'sms', 'all'].includes(typeRaw)
        ? (typeRaw as Tables<'communications'>['type'])
        : undefined

    let limit: number | undefined
    const limitParam = searchParams.get('limit')
    if (limitParam !== null && limitParam !== '') {
      const n = Number(limitParam)
      if (!Number.isFinite(n) || n < 1 || n > 100) {
        return NextResponse.json({ error: 'limit deve essere tra 1 e 100' }, { status: 400 })
      }
      limit = n
    }

    let offset: number | undefined
    const offsetParam = searchParams.get('offset')
    if (offsetParam !== null && offsetParam !== '') {
      const n = Number(offsetParam)
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json({ error: 'offset deve essere >= 0' }, { status: 400 })
      }
      offset = n
    }

    const { data, count, error } = await getCommunications({
      statuses,
      type,
      limit,
      offset,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      communications: data ?? [],
      count: count ?? 0,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Errore server'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
