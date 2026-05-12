'use client'

import { useState } from 'react'
import { createLogger } from '@/lib/logger'
import { requestForgotPasswordEmail } from '@/features/auth-password-reset/lib/password-reset-helpers'
import { ForgotPasswordFormView } from '@/features/auth-password-reset/ui/forgot-password-form-view'
import { ForgotPasswordSuccessView } from '@/features/auth-password-reset/ui/forgot-password-success-view'

const logger = createLogger('app:forgot-password:page')

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      logger.info('Richiesta reset password via API Resend', {
        email,
        origin: typeof window !== 'undefined' ? window.location.origin : '',
      })

      const result = await requestForgotPasswordEmail(email)
      if (!result.ok) {
        setError(result.error)
        return
      }

      logger.info('Email reset password inviata con successo (Resend)', { email })
      setSuccess(true)
    } catch (err) {
      logger.error('Errore reset password', err, { email })
      setError("Errore durante l'invio della richiesta. Riprova più tardi.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return <ForgotPasswordSuccessView email={email} />
  }

  return (
    <ForgotPasswordFormView
      email={email}
      loading={loading}
      error={error}
      onEmailChange={setEmail}
      onSubmit={handleResetPassword}
    />
  )
}
