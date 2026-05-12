'use client'

import { useCallback, useMemo, useState } from 'react'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import {
  buildWelcomeEmailRedirectTo,
  buildWelcomePath,
  storePendingInviteCodice,
} from '@/lib/auth/athlete-invite'
import {
  createEmptyAthleteRegistrationForm,
  validateAthleteRegistrationForm,
  type AthleteRegistrationFormValues,
} from '@/features/athlete-registration/lib/registration-helpers'

const logger = createLogger('athlete-registration:submit')

type ResendMessage = {
  type: 'success' | 'error'
  text: string
}

export function useAthleteRegistration(codiceInvito: string, router: AppRouterInstance) {
  const supabase = useMemo(() => createClient(), [])
  const [formData, setFormData] = useState<AthleteRegistrationFormValues>(
    createEmptyAthleteRegistrationForm(),
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmationScreen, setShowConfirmationScreen] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<ResendMessage | null>(null)

  const handleInputChange = useCallback((field: keyof AthleteRegistrationFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleRegister = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      setLoading(true)
      setError(null)

      const validationError = validateAthleteRegistrationForm(formData)
      if (validationError) {
        setError(validationError)
        setLoading(false)
        return
      }

      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        const redirectTo = buildWelcomeEmailRedirectTo(origin, codiceInvito)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectTo,
            data: {
              nome: formData.nome,
              cognome: formData.cognome,
              role: 'athlete',
              org_id: 'default-org',
            },
          },
        })

        if (authError) {
          logger.error('Errore creazione utente', authError, {
            name: authError.name,
            status: authError.status,
          })
          setError(authError.message || 'Errore durante la registrazione')
          return
        }

        if (!authData.user) {
          setError('Utente non creato correttamente')
          return
        }

        const session = authData.session
        const codiceAtSubmit = codiceInvito

        if (session?.access_token && session?.refresh_token) {
          const supabaseClient = createClient()
          await supabaseClient.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          })
          try {
            await fetch('/api/register/complete-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nome: formData.nome,
                cognome: formData.cognome,
                email: formData.email,
                ...(codiceAtSubmit && { codice: codiceAtSubmit }),
                access_token: session.access_token,
                refresh_token: session.refresh_token,
              }),
            })
          } catch {
            // welcome farà complete-profile al caricamento se fallisce qui
          }
          router.push(buildWelcomePath(codiceAtSubmit))
          return
        }

        try {
          const cpRes = await fetch('/api/register/complete-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: authData.user.id,
              email: formData.email,
              nome: formData.nome,
              cognome: formData.cognome,
              ...(codiceAtSubmit && { codice: codiceAtSubmit }),
            }),
          })
          if (!cpRes.ok) {
            const errData = await cpRes.json().catch(() => ({}))
            logger.warn('complete-profile dopo registrazione fallito', {
              status: cpRes.status,
              errData,
            })
          }
        } catch (submitError) {
          logger.warn('complete-profile dopo registrazione errore di rete', submitError)
        }

        if (codiceAtSubmit) {
          storePendingInviteCodice(codiceAtSubmit)
        }

        setRegisteredEmail(formData.email)
        setShowConfirmationScreen(true)
      } catch (err) {
        const errorDetails =
          err instanceof Error
            ? { message: err.message, name: err.name, stack: err.stack }
            : typeof err === 'object' && err !== null
              ? {
                  message: (err as { message?: string }).message || 'Errore sconosciuto',
                  fullError: err,
                }
              : { rawError: err }
        logger.error('Errore durante la registrazione', err, errorDetails)
        setError('Errore durante la registrazione. Riprova più tardi.')
      } finally {
        setLoading(false)
      }
    },
    [codiceInvito, formData, router, supabase.auth],
  )

  const handleResendConfirmation = useCallback(async () => {
    const email = registeredEmail?.trim()
    if (!email) return

    setResendMessage(null)
    setResendLoading(true)

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (resendError) {
        logger.warn('Resend confirmation email failed', resendError, { email })
        setResendMessage({
          type: 'error',
          text: resendError.message ?? "Impossibile inviare di nuovo l'email. Riprova più tardi.",
        })
        return
      }

      setResendMessage({
        type: 'success',
        text: 'Email inviata di nuovo. Controlla la casella (e la cartella spam).',
      })
    } catch (err) {
      logger.error('Resend confirmation email error', err, { email })
      setResendMessage({ type: 'error', text: 'Errore di rete. Riprova.' })
    } finally {
      setResendLoading(false)
    }
  }, [registeredEmail, supabase.auth])

  return {
    formData,
    loading,
    error,
    showConfirmationScreen,
    registeredEmail,
    resendLoading,
    resendMessage,
    handleInputChange,
    handleRegister,
    handleResendConfirmation,
  }
}
