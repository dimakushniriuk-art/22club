'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { setSentryClientAppTags } from '@/lib/sentry/sentry-app-context'

/**
 * Aggiorna tag Sentry su ogni navigazione (diagnosi per schermata / ruolo).
 */
export function SentryNavigationContext() {
  const pathname = usePathname() || '/'
  const { role, org_id: orgId } = useAuth()

  useEffect(() => {
    setSentryClientAppTags({
      route: pathname,
      role: role ?? 'none',
      org_id: orgId ?? 'none',
    })
  }, [pathname, role, orgId])

  return null
}
