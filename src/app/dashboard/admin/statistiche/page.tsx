import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminStatisticsContent } from '@/components/dashboard/admin/admin-statistics-content'

export default async function AdminStatisticsPage() {
  const supabase = await createClient()

  // Verifica autenticazione
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Verifica ruolo admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  const profileData = profile as { role?: string } | null
  if (profileError || !profileData || profileData.role !== 'admin') {
    redirect('/dashboard')
  }

  return <AdminStatisticsContent />
}
