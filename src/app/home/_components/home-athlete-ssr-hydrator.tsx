'use client'

import { useLayoutEffect } from 'react'
import { useAuth } from '@/providers/auth-provider'
import type { Tables } from '@/types/supabase'

export function HomeAthleteSsrHydrator({ profile }: { profile: Tables<'profiles'> | null }) {
  const { user, loading, hydrateFromServerProfile } = useAuth()

  useLayoutEffect(() => {
    if (!profile || user || !loading) return
    hydrateFromServerProfile(profile)
  }, [profile, user, loading, hydrateFromServerProfile])

  return null
}
