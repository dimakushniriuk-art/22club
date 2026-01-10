// API route per recuperare lista comunicazioni con paginazione e count totale

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import { hasRole } from '@/lib/supabase/get-user-profile'

const logger = createLogger('api/communications/list')
import { getCommunications } from '@/lib/communications/service'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    // Verifica autenticazione e ruolo usando helper con cache
    const isStaff = await hasRole(supabase, ['admin', 'pt', 'trainer', 'staff'])

    if (!isStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Leggi query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const limitParam = searchParams.get('limit')
    const offsetParam = searchParams.get('offset')

    const limit = limitParam ? parseInt(limitParam, 10) : undefined
    const offset = offsetParam ? parseInt(offsetParam, 10) : undefined

    // Valida parametri
    if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
      return NextResponse.json({ error: 'Invalid limit (must be 1-100)' }, { status: 400 })
    }

    if (offset !== undefined && (isNaN(offset) || offset < 0)) {
      return NextResponse.json({ error: 'Invalid offset (must be >= 0)' }, { status: 400 })
    }

    // Ottieni comunicazioni usando il service
    const result = await getCommunications({
      status: status as
        | 'draft'
        | 'scheduled'
        | 'sending'
        | 'sent'
        | 'failed'
        | 'cancelled'
        | undefined,
      type: type && type !== 'all' ? (type as 'push' | 'email' | 'sms') : undefined,
      limit,
      offset,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: result.data || [],
      count: result.count ?? 0,
    })
  } catch (error) {
    logger.error('Error in communications/list API', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
