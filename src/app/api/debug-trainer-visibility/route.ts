import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/debug-trainer-visibility
 * Diagnostica: chiama la RPC debug_trainer_clienti_visibility con la sessione
 * dell'utente (cookie). Usare da browser loggato come trainer.
 * Restituisce trainer_profile_id e visible_count.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('debug_trainer_clienti_visibility').single()

    if (error) {
      const err = error as { message?: string; code?: string }
      return NextResponse.json({ error: err.message ?? 'Errore', code: err.code }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Errore interno' },
      { status: 500 },
    )
  }
}
