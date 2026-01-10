// API route per contare i destinatari in base al filtro

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import { hasRole } from '@/lib/supabase/get-user-profile'

const logger = createLogger('api/communications/count-recipients')
import { countRecipientsByFilter } from '@/lib/communications/recipients'
import type { RecipientFilter } from '@/lib/communications/service'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verifica autenticazione e ruolo usando helper con cache
    const isStaff = await hasRole(supabase, ['admin', 'pt', 'trainer', 'staff'])

    if (!isStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Leggi recipient filter dal body
    const body = await request.json()
    const recipientFilter = body.filter as RecipientFilter

    if (!recipientFilter) {
      return NextResponse.json({ error: 'filter is required' }, { status: 400 })
    }

    // Calcola count
    const { count, error } = await countRecipientsByFilter(recipientFilter)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ count })
  } catch (error) {
    logger.error('Error counting recipients', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
