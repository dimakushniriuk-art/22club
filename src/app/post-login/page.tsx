'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { createLogger } from '@/lib/logger'

const logger = createLogger('post-login')

/**
 * Route client-side per gestire redirect dopo login
 *
 * Questa route:
 * 1. Usa AuthProvider per ottenere ruolo e stato utente
 * 2. Esegue redirect basato sul ruolo:
 *    - admin → /dashboard/admin
 *    - trainer → /dashboard
 *    - athlete → /home
 *
 * Compatibile con Capacitor (Client Component)
 */
export default function PostLoginPage() {
  const router = useRouter()
  const { user, role, loading, authRecovery, retryAuthSession } = useAuth()
  const hasRetriedSessionRef = useRef(false)

  useEffect(() => {
    // Aspetta che l'autenticazione sia caricata
    if (loading) {
      return
    }

    // Se non c'è utente, prova una sola volta a recuperare sessione prima del redirect.
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

    // Normalizza il ruolo (pt -> trainer, atleta -> athlete); nutrizionista/massaggiatore invariati
    const roleStr = role as string | null
    const normalizedRole =
      roleStr === 'trainer'
        ? 'trainer'
        : roleStr === 'athlete'
          ? 'athlete'
          : roleStr === 'marketing'
            ? 'marketing'
            : roleStr === 'admin'
              ? 'admin'
              : roleStr === 'nutrizionista'
                ? 'nutrizionista'
                : roleStr === 'massaggiatore'
                  ? 'massaggiatore'
                  : role || null

    // Debug solo in sviluppo
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('Redirect post-login basato su ruolo', {
        userId: user.id,
        role,
        normalizedRole,
      })
    }

    // Redirect basato sul ruolo normalizzato
    if (!normalizedRole) {
      // Ruolo non disponibile
      logger.warn('Ruolo non disponibile in /post-login', {
        userId: user.id,
        role,
        normalizedRole,
      })
      router.push('/login?error=ruolo_non_valido')
      return
    }

    if (normalizedRole === 'admin') {
      router.push('/dashboard/admin')
    } else if (normalizedRole === 'trainer') {
      router.push('/dashboard')
    } else if (normalizedRole === 'athlete') {
      router.push('/home')
    } else if (normalizedRole === 'marketing') {
      router.push('/dashboard/marketing')
    } else if (normalizedRole === 'nutrizionista') {
      router.push('/dashboard/nutrizionista')
    } else if (normalizedRole === 'massaggiatore') {
      router.push('/dashboard/massaggiatore')
    } else {
      // Ruolo non riconosciuto
      logger.warn('Ruolo non riconosciuto in /post-login', {
        userId: user.id,
        role,
        normalizedRole,
      })
      router.push('/login?error=ruolo_non_valido')
    }
  }, [user, role, loading, router, authRecovery, retryAuthSession])

  // Mostra loading durante il redirect (stile trainer: sfondo #0d0d0d)
  return (
    <div className="flex min-h-full w-full flex-1 items-center justify-center bg-background text-text-primary">
      <div
        className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-primary"
        aria-hidden
      />
    </div>
  )
}
