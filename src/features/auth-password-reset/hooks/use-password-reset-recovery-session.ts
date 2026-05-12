'use client'

import { useEffect, useMemo, useState } from 'react'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import {
  hasPasswordRecoveryHash,
  resolveResetPasswordUrlError,
} from '@/features/auth-password-reset/lib/password-reset-helpers'

const logger = createLogger('auth-password-reset:recovery-session')

const RECOVERY_HASH_WAIT_MS = 800
const RECOVERY_RETRY_WAIT_MS = 1500
const RECOVERY_USER_WAIT_MS = 1200

function getLocationHash(): string {
  return typeof window !== 'undefined' ? window.location.hash : ''
}

export function usePasswordResetRecoverySession(
  searchParams: ReadonlyURLSearchParams,
  router: AppRouterInstance,
) {
  const supabase = useMemo(() => createClient(), [])
  const [urlError, setUrlError] = useState<string | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const errorDescription = searchParams.get('error_description')
    const urlErrorMessage = resolveResetPasswordUrlError(
      errorParam,
      errorCode,
      errorDescription,
    )

    if (urlErrorMessage) {
      setUrlError(urlErrorMessage)
      setCheckingSession(false)
      logger.error('Errore da URL reset password', {
        error: errorParam,
        errorCode,
        errorDescription,
      })
      return
    }

    const recoveryHash = hasPasswordRecoveryHash(getLocationHash())
    if (!recoveryHash) {
      logger.info('Reset-password aperto senza token recovery, redirect a forgot-password')
      router.replace('/forgot-password')
      return
    }

    let cancelled = false

    const checkSession = async () => {
      try {
        logger.info('Verifica autenticazione per reset password')

        const hasRecoveryHash = hasPasswordRecoveryHash(getLocationHash())
        await new Promise((resolve) => setTimeout(resolve, hasRecoveryHash ? RECOVERY_HASH_WAIT_MS : 500))

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (cancelled) return

        if (userError) {
          const isSessionMissing =
            userError.message?.includes('session missing') ||
            userError.message?.includes('Auth session missing')

          if (isSessionMissing && hasRecoveryHash) {
            logger.warn(
              'Sessione non ancora pronta, attendo elaborazione token recovery',
              userError.message,
            )
            await new Promise((resolve) => setTimeout(resolve, RECOVERY_RETRY_WAIT_MS))
            if (cancelled) return

            const {
              data: { user: retryUser },
              error: retryError,
            } = await supabase.auth.getUser()

            if (retryError || !retryUser) {
              logger.warn('Nessun utente dopo attesa token recovery', retryError?.message)
              setUrlError('Link non valido o scaduto. Richiedi un nuovo link di reset password.')
              setCheckingSession(false)
              return
            }

            setHasValidSession(true)
            setCheckingSession(false)
            return
          }

          if (
            userError.message?.includes('expired') ||
            userError.message?.includes('invalid') ||
            userError.message?.includes('token')
          ) {
            setUrlError('Link non valido o scaduto. Richiedi un nuovo link di reset password.')
          } else {
            setUrlError(
              'Errore durante la verifica del link. Il link potrebbe essere scaduto o non valido.',
            )
          }
          setCheckingSession(false)
          return
        }

        if (!user) {
          if (hasRecoveryHash) {
            logger.info("Token di recovery nell'URL, attendo elaborazione da Supabase")
            await new Promise((resolve) => setTimeout(resolve, RECOVERY_USER_WAIT_MS))
            if (cancelled) return

            const {
              data: { user: retryUser },
              error: retryError,
            } = await supabase.auth.getUser()

            if (retryError || !retryUser) {
              logger.warn('Nessun utente trovato dopo attesa token recovery', retryError?.message)
              setUrlError('Link non valido o scaduto. Richiedi un nuovo link di reset password.')
              setCheckingSession(false)
              return
            }

            setHasValidSession(true)
            setCheckingSession(false)
            return
          }

          logger.warn('Nessun utente trovato per reset password')
          setUrlError('Link non valido o scaduto. Richiedi un nuovo link di reset password.')
          setCheckingSession(false)
          return
        }

        setHasValidSession(true)
        setCheckingSession(false)
      } catch (err) {
        if (cancelled) return
        logger.error('Errore durante verifica autenticazione', err)
        setUrlError('Errore durante la verifica del link. Riprova più tardi.')
        setCheckingSession(false)
      }
    }

    void checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: unknown) => {
      logger.info('Auth state changed durante reset password', { event, hasSession: !!session })

      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          logger.warn('Errore verifica utente dopo auth state change', userError)
          return
        }

        if (user) {
          logger.info('Utente autenticato da token recovery', {
            userId: user.id,
            email: user.email,
            event,
          })
          setHasValidSession(true)
          setCheckingSession(false)
        }
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [searchParams, supabase.auth, router])

  return { checkingSession, hasValidSession, urlError }
}
