import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboardContent } from '@/components/dashboard/admin/admin-dashboard-content'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Verifica autenticazione
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Verifica ruolo admin
  // NOTA: Server component non può usare AuthProvider client, query necessaria per SSR
  if (process.env.NODE_ENV !== 'production') {
    const logger = (await import('@/lib/logger')).createLogger('dashboard:admin:page')
    logger.debug('[profiles] dashboard/admin/page → query DB (server-side)', {
      userId: session.user.id,
      source: 'dashboard/admin/page',
      reason: 'SSR - verifica ruolo admin',
    })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  const profileData = profile as { role?: string } | null
  if (profileError || !profileData || profileData.role !== 'admin') {
    redirect('/dashboard')
  }

  return <AdminDashboardContent />
}
