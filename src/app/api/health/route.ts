import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/health
 * Health check endpoint per verificare lo stato dell'applicazione
 */
export async function GET() {
  try {
    // Verifica connessione Supabase
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').select('count').limit(1)

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: error ? 'error' : 'connected',
        version: process.env.npm_package_version || '1.0.0',
      },
      { status: 200 },
    )
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'error',
      },
      { status: 500 },
    )
  }
}
