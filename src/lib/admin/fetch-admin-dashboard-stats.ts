import type { SupabaseClient } from '@supabase/supabase-js'
import type { AdminDashboardStats } from '@/lib/admin/types'

type ProfileStatsRow = {
  id: string
  role?: string | null
  stato?: string | null
  created_at?: string | null
  org_id?: string | null
}

export async function fetchAdminDashboardStats(
  supabase: SupabaseClient,
): Promise<AdminDashboardStats> {
  const {
    data: rows,
    count,
    error,
  } = await supabase
    .from('profiles')
    .select('id, role, stato, created_at, org_id', { count: 'exact' })

  if (error) {
    throw error
  }

  const allUsers = (rows ?? []) as ProfileStatsRow[]
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  return {
    totalUsers: count ?? 0,
    activeUsers: allUsers.filter((u) => u.stato === 'attivo').length,
    newUsersThisMonth: allUsers.filter(
      (u) => u.created_at && new Date(u.created_at) >= startOfMonth,
    ).length,
    totalOrganizations: new Set(
      allUsers
        .map((p) => p.org_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ).size,
    totalTrainers: allUsers.filter((u) => u.role === 'trainer').length,
    totalAthletes: allUsers.filter((u) => u.role === 'athlete').length,
  }
}
