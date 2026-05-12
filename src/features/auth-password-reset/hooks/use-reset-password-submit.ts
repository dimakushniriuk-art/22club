'use client'

import { useCallback, useMemo, useState } from 'react'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { validateResetPasswordForm } from '@/features/auth-password-reset/lib/password-reset-helpers'

const logger = createLogger('auth-password-reset:submit')

const PASSWORD_UPDATE_TIMEOUT_MS = 60_000

export function useResetPasswordSubmit(
  hasValidSession: boolean,
  router: AppRouterInstance,
) {
  const supabase = useMemo(() => createClient(), [])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleResetPassword = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      setLoading(true)
      setError(null)

      if (!hasValidSession) {
        setError('Sessione non valida. Richiedi un nuovo link di reset password.')
        setLoading(false)
        return
      }

      const validationError = validateResetPasswordForm(password, confirmPassword)
      if (validationError) {
        setError(validationError)
        setLoading(false)
        return
      }

      try {
        logger.info('Aggiornamento password in corso', {
          passwordLength: password.length,
        })

        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !currentUser) {
          logger.error('Utente non autenticato durante aggiornamento password', userError)
          setError('La sessione è scaduta. Richiedi un nuovo link di reset password.')
          setLoading(false)
          return
        }

        logger.info('Utente autenticato, procedo con aggiornamento password', {
          userId: currentUser.id,
          email: currentUser.email,
        })

        logger.info('Refresh sessione prima di updateUser')
        const {
          data: { session: refreshedSession },
          error: refreshError,
        } = await supabase.auth.refreshSession()

        if (refreshError) {
          logger.warn('Errore refresh sessione, continuo comunque', refreshError)
        } else if (refreshedSession) {
          logger.info('Sessione refreshata con successo', {
            expiresAt: refreshedSession.expires_at,
            accessToken: refreshedSession.access_token?.substring(0, 20) + '...',
          })
        }

        logger.info('Chiamata updateUser con password', {
          passwordLength: password.trim().length,
          hasUser: !!currentUser,
          userId: currentUser.id,
          hasRefreshedSession: !!refreshedSession,
        })

        const updatePasswordPromise = supabase.auth
          .updateUser({
            password: password.trim(),
          })
          .then((result) => {
            logger.info('updateUser promise risolta', {
              hasData: !!result.data,
              hasError: !!result.error,
              userId: result.data?.user?.id,
              errorMessage: result.error?.message,
            })
            return result
          })
          .catch((err: unknown) => {
            const errObj = err as { message?: string; constructor?: { name?: string } }
            logger.error('updateUser promise rifiutata', err, {
              errorType: errObj?.constructor?.name,
              errorMessage: errObj?.message,
            })
            throw err
          })

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            logger.error('Timeout aggiornamento password dopo 60 secondi')
            logger.warn('Verifica se password è stata cambiata nonostante timeout...')
            reject(
              new Error(
                "Timeout: L'operazione ha impiegato troppo tempo. Verifica se la password è stata cambiata provando a fare login.",
              ),
            )
          }, PASSWORD_UPDATE_TIMEOUT_MS)
        })

        logger.info('Avvio Promise.race per aggiornamento password')
        type UpdatePasswordResult = Awaited<ReturnType<typeof supabase.auth.updateUser>>
        let result: UpdatePasswordResult

        try {
          console.log('[RESET PASSWORD] Inizio aggiornamento password...')
          console.log('[RESET PASSWORD] Utente autenticato:', {
            userId: currentUser.id,
            email: currentUser.email,
          })

          result = await Promise.race([updatePasswordPromise, timeoutPromise])

          console.log('[RESET PASSWORD] Risultato ricevuto:', {
            hasData: !!result.data,
            hasError: !!result.error,
            errorMessage: result.error?.message,
          })
        } catch (raceError) {
          console.error('[RESET PASSWORD] Errore in Promise.race:', raceError)
          logger.error('Errore in Promise.race', raceError)

          if (raceError instanceof Error && raceError.message.includes('Timeout')) {
            logger.warn('Timeout verificato, controllo se password è stata cambiata...')

            const {
              data: { user: verifyUser },
              error: verifyError,
            } = await supabase.auth.getUser()

            if (!verifyError && verifyUser) {
              logger.info(
                'Utente ancora autenticato dopo timeout, password potrebbe essere stata cambiata',
                {
                  userId: verifyUser.id,
                },
              )
              setError(
                "L'operazione ha impiegato troppo tempo. Verifica se la password è stata cambiata provando a fare login con la nuova password. Se non funziona, richiedi un nuovo link di reset.",
              )
            } else {
              setError(raceError.message)
            }
          } else {
            setError("Errore durante l'aggiornamento della password. Riprova più tardi.")
          }
          setLoading(false)
          return
        }

        const { data, error: updateError } = result

        if (updateError) {
          console.error('[RESET PASSWORD] Errore aggiornamento:', updateError)
          const errorDetails = updateError as { code?: string; status?: number } | null
          logger.error('Errore aggiornamento password', updateError, {
            errorMessage: updateError.message,
            errorCode: errorDetails?.code,
            errorStatus: errorDetails?.status,
          })

          if (
            updateError.message?.includes('session') ||
            updateError.message?.includes('expired') ||
            updateError.message?.includes('token')
          ) {
            setError('La sessione è scaduta. Richiedi un nuovo link di reset password.')
          } else if (updateError.message?.includes('password')) {
            setError(
              'La password non soddisfa i requisiti di sicurezza. Prova con una password diversa.',
            )
          } else if (
            updateError.message?.includes('network') ||
            updateError.message?.includes('fetch')
          ) {
            setError('Errore di connessione. Verifica la tua connessione internet e riprova.')
          } else {
            setError(
              updateError.message ||
                "Errore durante l'aggiornamento della password. Riprova più tardi.",
            )
          }
          setLoading(false)
          return
        }

        if (!data || !data.user) {
          console.error('[RESET PASSWORD] Dati non validi:', data)
          logger.error('Aggiornamento password completato ma dati non validi', { data })
          setError("Errore durante l'aggiornamento della password. I dati ricevuti non sono validi.")
          setLoading(false)
          return
        }

        console.log('[RESET PASSWORD] Password aggiornata con successo!', {
          userId: data.user.id,
          email: data.user.email,
        })
        logger.info('Password aggiornata con successo', {
          userId: data.user.id,
          email: data.user.email,
        })

        setSuccess(true)
        setLoading(false)

        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } catch (submitError) {
        logger.error('Errore aggiornamento password (catch)', submitError, {
          errorType:
            submitError instanceof Error ? submitError.constructor.name : typeof submitError,
          errorMessage: submitError instanceof Error ? submitError.message : String(submitError),
        })

        if (submitError instanceof Error && submitError.message.includes('Timeout')) {
          setError(submitError.message)
        } else {
          setError("Errore durante l'aggiornamento della password. Riprova più tardi.")
        }
        setLoading(false)
      }
    },
    [confirmPassword, hasValidSession, password, router, supabase.auth],
  )

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    success,
    error,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleResetPassword,
  }
}
