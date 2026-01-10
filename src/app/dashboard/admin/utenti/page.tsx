import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminUsersContent } from '@/components/dashboard/admin/admin-users-content'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Verifica autenticazione
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Verifica ruolo admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const profileData = profile as { role?: string } | null
  if (profileError || !profileData || profileData.role !== 'admin') {
    redirect('/dashboard')
  }

  return <AdminUsersContent />
}
