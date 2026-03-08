import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type ProfileRow = {
  id: string
  nome: string | null
  cognome: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
}

function displayName(row: ProfileRow): string {
  if (row.first_name && row.last_name) return `${row.first_name} ${row.last_name}`.trim()
  if (row.nome && row.cognome) return `${row.nome} ${row.cognome}`.trim()
  return [row.nome, row.cognome, row.first_name, row.last_name, row.email].find(Boolean) ?? row.id
}

/**
 * GET /api/communications/list-athletes
 * Lista atleti (profili) della stessa org per il selettore nella modal comunicazioni.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ athletes: [] }, { status: 200 })
    }

    // Profilo utente: prima per user_id (auth.uid()), fallback su id per compatibilità
    let myProfile: { org_id?: string } | null = null
    const { data: byUserId } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (byUserId) {
      myProfile = byUserId as { org_id?: string }
    } else {
      const { data: byId } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .maybeSingle()
      myProfile = byId as { org_id?: string } | null
    }

    const orgId = myProfile?.org_id
    if (!orgId) {
      return NextResponse.json({ athletes: [] }, { status: 200 })
    }

    const { data: rows, error } = await supabase
      .from('profiles')
      .select('id, nome, cognome, first_name, last_name, email')
      .eq('org_id', orgId)
      .eq('role', 'athlete')

    if (error) {
      return NextResponse.json({ athletes: [] }, { status: 200 })
    }

    const athletes = (rows ?? []).map((r: ProfileRow) => ({
      id: r.id,
      name: displayName(r),
      email: r.email ?? null,
    }))

    return NextResponse.json({ athletes })
  } catch {
    return NextResponse.json({ athletes: [] }, { status: 200 })
  }
}
