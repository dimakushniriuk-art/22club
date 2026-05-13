'use client'

import { Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { readInviteCodiceFromSearchParams } from '@/lib/auth/athlete-invite'
import { useAthleteRegistration } from '@/features/athlete-registration/hooks/use-athlete-registration'
import { RegisterConfirmationView } from '@/features/athlete-registration/ui/register-confirmation-view'
import { RegisterFormFallbackView } from '@/features/athlete-registration/ui/register-form-fallback-view'
import { RegisterFormView } from '@/features/athlete-registration/ui/register-form-view'

function RegisterContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const codiceInvito = useMemo(() => readInviteCodiceFromSearchParams(searchParams), [searchParams])
  const {
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
  } = useAthleteRegistration(codiceInvito, router)

  if (showConfirmationScreen) {
    return (
      <RegisterConfirmationView
        registeredEmail={registeredEmail}
        hasInviteCodice={Boolean(codiceInvito)}
        resendLoading={resendLoading}
        resendMessage={resendMessage}
        onResendConfirmation={handleResendConfirmation}
      />
    )
  }

  return (
    <RegisterFormView
      formData={formData}
      loading={loading}
      error={error}
      hasInviteCodice={Boolean(codiceInvito)}
      onFieldChange={handleInputChange}
      onSubmit={handleRegister}
    />
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFormFallbackView />}>
      <RegisterContent />
    </Suspense>
  )
}
