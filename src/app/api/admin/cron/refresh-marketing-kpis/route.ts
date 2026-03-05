import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:admin:cron:refresh-marketing-kpis')

const CRON_SECRET = process.env.CRON_SECRET

/** Rate limit: max 2 richieste per minuto (evita abuso). */
let cronLastCalls: number[] = []
const CRON_WINDOW_MS = 60_000
const CRON_MAX_PER_WINDOW = 2

/**
 * POST /api/admin/cron/refresh-marketing-kpis
 * Aggiorna athlete_marketing_kpis via RPC (service_role).
 * Protetto da header Authorization: Bearer ${CRON_SECRET} o x-cron-secret.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = request.headers.get('x-cron-secret')
    const secret = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : cronSecret

    if (!CRON_SECRET || secret !== CRON_SECRET) {
      logger.warn('Cron refresh-marketing-kpis: secret mancante o non valido')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = Date.now()
    const cutoff = now - CRON_WINDOW_MS
    cronLastCalls = cronLastCalls.filter((t) => t > cutoff)
    if (cronLastCalls.length >= CRON_MAX_PER_WINDOW) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    cronLastCalls.push(now)

    const admin = createAdminClient()
    const { error } = await admin.rpc('refresh_athlete_marketing_kpis', {
      p_org_id: undefined,
      p_athlete_profile_id: undefined,
    })

    if (error) {
      logger.error('RPC refresh_athlete_marketing_kpis failed', error)
      return NextResponse.json(
        { error: 'Refresh KPI failed', details: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error('Cron refresh-marketing-kpis error', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
