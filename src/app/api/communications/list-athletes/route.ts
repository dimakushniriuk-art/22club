import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { getCurrentOrgIdFromProfile } from '@/lib/organizations/current-org'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'

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
 * Lista atleti attivi (stato=attivo) della stessa org, allineata ai destinatari comunicazioni.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)

    if (!user) {
      return NextResponse.json({ athletes: [] }, { status: 200 })
    }

    const myProfile = await resolveProfileByIdentifier(supabase, user.id, 'org_id')
    const orgId = getCurrentOrgIdFromProfile(myProfile as { org_id?: string | null } | null)
    if (!orgId) {
      return NextResponse.json({ athletes: [] }, { status: 200 })
    }

    const { data: rows, error } = await supabase
      .from('profiles')
      .select('id, nome, cognome, first_name, last_name, email')
      .eq('org_id', orgId)
      .eq('role', 'athlete')
      .eq('stato', 'attivo')

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
