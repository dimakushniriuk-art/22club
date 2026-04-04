import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/health
 * Indica che il processo Next risponde (HTTP 200). Lo stato DB è nel body, così
 * script tipo verify-all-services possono distinguere "server su" da "DB non verificabile".
 */
export async function GET() {
  let database: 'connected' | 'error' | 'unavailable' = 'unavailable'

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').select('id').limit(1)
    if (error) {
      database = 'error'
    } else {
      database = 'connected'
    }
  } catch {
    database = 'unavailable'
  }

  const ok = database === 'connected'

  return NextResponse.json(
    {
      status: ok ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV ?? 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks: { supabase: database },
    },
    { status: 200 },
  )
}
