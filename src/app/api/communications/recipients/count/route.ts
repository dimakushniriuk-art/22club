import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { getCurrentOrgIdFromProfile } from '@/lib/organizations/current-org'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'
import { countRecipientsByFilter } from '@/lib/communications/recipients'

/**
 * GET /api/communications/recipients/count
 * Query: role (opzionale) - es. "athlete" per contare solo atleti nella stessa org.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)

    if (!user) {
      return NextResponse.json({ count: 0 }, { status: 200 })
    }

    const myProfile = await resolveProfileByIdentifier(supabase, user.id, 'org_id')
    const orgId = getCurrentOrgIdFromProfile(myProfile as { org_id?: string | null } | null)

    if (!orgId) {
      return NextResponse.json({ count: 0 }, { status: 200 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') ?? undefined
    const communicationType = searchParams.get('type') ?? 'email'

    const allUsersRaw = searchParams.get('all_users')
    const athleteIdsRaw = searchParams.get('athlete_ids')
    const hasExplicitRecipientFilter =
      role !== undefined || athleteIdsRaw !== null || allUsersRaw !== null

    // Backward compatible: se non è specificato alcun filtro, conta "tutti" (come prima).
    const all_users = allUsersRaw === '1' || allUsersRaw === 'true' || !hasExplicitRecipientFilter

    const athlete_ids = athleteIdsRaw?.trim().length
      ? athleteIdsRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined

    const filter = {
      org_id: orgId,
      role: role as 'admin' | 'trainer' | 'athlete' | undefined,
      all_users: all_users || undefined,
      athlete_ids,
    }

    const { count, error } = await countRecipientsByFilter(
      filter as Parameters<typeof countRecipientsByFilter>[0],
      communicationType,
    )
    if (error) {
      return NextResponse.json({ count: 0 }, { status: 200 })
    }

    return NextResponse.json({ count: count ?? 0 }, { status: 200 })
  } catch {
    return NextResponse.json({ count: 0 }, { status: 200 })
  }
}
