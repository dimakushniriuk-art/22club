'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthCardSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { usePasswordResetRecoverySession } from '@/features/auth-password-reset/hooks/use-password-reset-recovery-session'
import { useResetPasswordSubmit } from '@/features/auth-password-reset/hooks/use-reset-password-submit'
import { ResetPasswordCheckingView } from '@/features/auth-password-reset/ui/reset-password-checking-view'
import { ResetPasswordFormView } from '@/features/auth-password-reset/ui/reset-password-form-view'
import { ResetPasswordLinkErrorView } from '@/features/auth-password-reset/ui/reset-password-link-error-view'
import { ResetPasswordSuccessView } from '@/features/auth-password-reset/ui/reset-password-success-view'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { checkingSession, hasValidSession, urlError } = usePasswordResetRecoverySession(
    searchParams,
    router,
  )
  const {
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
  } = useResetPasswordSubmit(hasValidSession, router)

  if (checkingSession) {
    return <ResetPasswordCheckingView />
  }

  if (urlError) {
    return <ResetPasswordLinkErrorView message={urlError} />
  }

  if (success) {
    return <ResetPasswordSuccessView />
  }

  if (!hasValidSession) {
    return null
  }

  return (
    <ResetPasswordFormView
      password={password}
      confirmPassword={confirmPassword}
      loading={loading}
      error={error}
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onToggleShowPassword={() => setShowPassword((value) => !value)}
      onToggleShowConfirmPassword={() => setShowConfirmPassword((value) => !value)}
      onSubmit={handleResetPassword}
    />
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthCardSegmentSkeleton />}>
      <ResetPasswordContent />
    </Suspense>
  )
}
