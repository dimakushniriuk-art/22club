'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { AthleteHomeViewportScale } from './athlete-home-viewport-scale'
import { HomeLayoutClient } from './home-layout-client'
import { ImpersonationBanner } from '@/components/shared/impersonation-banner'
import { createLogger } from '@/lib/logger'
import { getDashboardEntryPathForNonAthleteRole } from '@/lib/utils/role-redirect-paths'

const logger = createLogger('home:layout:auth')

interface HomeLayoutAuthProps {
  children: React.ReactNode
}

/**
 * Client Component per gestire autenticazione e autorizzazione
 * Convertito da server component per evitare re-esecuzione ad ogni navigazione
 * Le verifiche di sicurezza sono già gestite dal middleware
 */
export default function HomeLayoutAuth({ children }: HomeLayoutAuthProps) {
  const router = useRouter()
  const { user, role, loading, authRecovery, retryAuthSession } = useAuth()
  const hasRetriedSessionRef = useRef(false)

  // Verifica autenticazione e ruolo (client-side, dopo che middleware ha già verificato)
  useEffect(() => {
    // Non fare nulla durante il loading iniziale
    if (loading) return

    // Se non c'è utente, prova una sola volta a recuperare sessione prima del redirect.
    if (!user) {
      if (!hasRetriedSessionRef.current) {
        hasRetriedSessionRef.current = true
        logger.warn('Utente non presente in /home, tentativo recovery sessione')
        void retryAuthSession()
        return
      }
      if (authRecovery === 'retrying' || authRecovery === 'degraded') {
        return
      }
      logger.warn('Utente non autenticato dopo recovery, redirect al login')
      router.replace('/login?reason=auth_required')
      return
    }
    hasRetriedSessionRef.current = false

    // Verifica ruolo - solo atleti possono accedere a /home
    if (role && role !== 'athlete') {
      logger.warn('Ruolo non autorizzato, redirect', { role, userId: user.id })
      const path = getDashboardEntryPathForNonAthleteRole(role)
      router.push(path ?? '/login?error=accesso_negato')
      return
    }
  }, [user, role, loading, router, authRecovery, retryAuthSession])

  return (
    <AthleteHomeViewportScale>
      <ImpersonationBanner />
      <HomeLayoutClient>{children}</HomeLayoutClient>
    </AthleteHomeViewportScale>
  )
}
