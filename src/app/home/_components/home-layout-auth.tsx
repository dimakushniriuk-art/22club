'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { HomeLayoutClient } from './home-layout-client'
import { createLogger } from '@/lib/logger'

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
  const { user, role, loading } = useAuth()

  // Verifica autenticazione e ruolo (client-side, dopo che middleware ha già verificato)
  useEffect(() => {
    // Non fare nulla durante il loading iniziale
    if (loading) return

    // Se non c'è utente, redirect al login (il middleware dovrebbe già aver gestito questo)
    if (!user) {
      logger.warn('Utente non autenticato, redirect al login')
      router.push('/login?error=accesso_richiesto')
      return
    }

    // Verifica ruolo - solo atleti possono accedere a /home
    if (role && role !== 'athlete') {
      logger.warn('Ruolo non autorizzato, redirect', { role, userId: user.id })
      // Redirect in base al ruolo
      if (role === 'admin') {
        router.push('/dashboard/admin')
      } else if (role === 'trainer') {
        router.push('/dashboard')
      } else {
        router.push('/login?error=accesso_negato')
      }
      return
    }
  }, [user, role, loading, router])

  // Renderizza sempre il layout, anche durante loading
  // Il layout gestirà il rendering dei children in base allo stato
  // Questo evita la pagina nera durante la navigazione
  return <HomeLayoutClient>{children}</HomeLayoutClient>
}
