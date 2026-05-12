'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { createLogger } from '@/lib/logger'
import { resolvePostLoginRedirectPath } from '@/lib/auth/login-redirect'

const logger = createLogger('post-login')

/**
 * Route client-side per redirect dopo login quando il profilo non è stato risolto in `/login`.
 * Usa `resolvePostLoginRedirectPath` (stesso mapping di `/login` e middleware).
 */
export function AuthPostLoginPageContent() {
  const router = useRouter()
  const { user, role, loading, authRecovery, retryAuthSession } = useAuth()
  const hasRetriedSessionRef = useRef(false)

  useEffect(() => {
    if (loading) {
      return
    }

    if (!user) {
      if (!hasRetriedSessionRef.current) {
        hasRetriedSessionRef.current = true
        logger.warn('Utente non presente in /post-login, tentativo recovery sessione')
        void retryAuthSession()
        return
      }
      if (authRecovery === 'retrying' || authRecovery === 'degraded') {
        return
      }
      logger.warn('Utente non autenticato in /post-login dopo recovery')
      router.replace('/login?reason=auth_required')
      return
    }
    hasRetriedSessionRef.current = false

    if (!role) {
      logger.warn('Ruolo non disponibile in /post-login', {
        userId: user.id,
        role,
      })
      router.replace('/login?error=ruolo_non_valido')
      return
    }

    const path = resolvePostLoginRedirectPath({
      role,
      first_login: user.first_login ?? null,
    })

    if (process.env.NODE_ENV !== 'production') {
      logger.debug('Redirect post-login basato su ruolo', {
        userId: user.id,
        role,
        first_login: user.first_login ?? null,
        path,
      })
    }

    if (!path) {
      logger.warn('Ruolo non riconosciuto in /post-login', {
        userId: user.id,
        role,
      })
      router.replace('/login?error=ruolo_non_valido')
      return
    }

    router.replace(path)
  }, [user, role, loading, router, authRecovery, retryAuthSession])

  return (
    <div className="flex min-h-full w-full flex-1 items-center justify-center bg-background text-text-primary">
      <div
        className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-primary"
        aria-hidden
      />
    </div>
  )
}
