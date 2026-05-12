import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'

const IMPERSONATE_COOKIE = 'impersonate_profile_id'

export type HomeAthleteSsrBootstrap = {
  profile: Tables<'profiles'> | null
}

export async function loadHomeAthleteSsrBootstrap(): Promise<HomeAthleteSsrBootstrap> {
  const cookieStore = await cookies()
  if (cookieStore.get(IMPERSONATE_COOKIE)?.value) {
    return { profile: null }
  }

  const supabase = await createClient(cookieStore)
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return { profile: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', authUser.id)
    .maybeSingle()

  if (!profile || profile.role !== 'athlete') {
    return { profile: null }
  }

  return { profile }
}
