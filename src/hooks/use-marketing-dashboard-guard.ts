'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'

export type MarketingAccessRole = 'marketing' | 'admin'

export function canAccessMarketingDashboard(role: string | null): role is MarketingAccessRole {
  return role === 'marketing' || role === 'admin'
}

type MarketingDashboardGuardOptions = {
  /** Lista lead: redirect negato verso /dashboard (non admin home). */
  deniedRedirect?: 'default' | 'dashboard'
}

/**
 * Guard condivisa per le route `/dashboard/marketing/*` (ruoli marketing e admin).
 */
export function useMarketingDashboardGuard(options?: MarketingDashboardGuardOptions): {
  showLoader: boolean
  canAccess: boolean
} {
  const router = useRouter()
  const { role, loading } = useAuth()
  const deniedRedirect = options?.deniedRedirect ?? 'default'

  useEffect(() => {
    if (loading || role === null) return
    if (canAccessMarketingDashboard(role)) return
    if (deniedRedirect === 'dashboard') {
      router.replace('/dashboard')
      return
    }
    router.replace((role as string) === 'admin' ? '/dashboard/admin' : '/dashboard')
  }, [loading, role, router, deniedRedirect])

  const showLoader = loading || (role !== null && !canAccessMarketingDashboard(role))
  const canAccess = canAccessMarketingDashboard(role)

  return { showLoader, canAccess }
}
