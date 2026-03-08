import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/communications/recipients/count
 * Query: role (opzionale) - es. "athlete" per contare solo atleti nella stessa org.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ count: 0 }, { status: 200 })
    }

    // Profilo utente: prima per user_id (auth.uid()), fallback su id per compatibilità
    let orgId: string | null = null
    const { data: byUserId } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (byUserId?.org_id) {
      orgId = byUserId.org_id
    } else {
      const { data: byId } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .maybeSingle()
      orgId = byId?.org_id ?? null
    }

    if (!orgId) {
      return NextResponse.json({ count: 0 }, { status: 200 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
    if (role) {
      query = query.eq('role', role)
    }
    const { count, error } = await query

    if (error) {
      return NextResponse.json({ count: 0 }, { status: 200 })
    }

    return NextResponse.json({ count: count ?? 0 }, { status: 200 })
  } catch {
    return NextResponse.json({ count: 0 }, { status: 200 })
  }
}
