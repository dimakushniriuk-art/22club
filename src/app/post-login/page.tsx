'use client'

import { useEffect } from 'react'
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
  const { user, role, loading } = useAuth()

  useEffect(() => {
    // Aspetta che l'autenticazione sia caricata
    if (loading) {
      return
    }

    // Se non c'è utente, redirect a login
    if (!user) {
      logger.warn('Utente non autenticato in /post-login')
      router.push('/login?error=accesso_richiesto')
      return
    }

    // Normalizza il ruolo (pt -> trainer, atleta -> athlete); nutrizionista/massaggiatore invariati
    const roleStr = role as string | null
    const normalizedRole =
      roleStr === 'trainer' ? 'trainer'
        : roleStr === 'athlete' ? 'athlete'
        : roleStr === 'marketing' ? 'marketing'
        : roleStr === 'admin' ? 'admin'
        : roleStr === 'nutrizionista' ? 'nutrizionista'
        : roleStr === 'massaggiatore' ? 'massaggiatore'
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
  }, [user, role, loading, router])

  // Mostra loading durante il redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
