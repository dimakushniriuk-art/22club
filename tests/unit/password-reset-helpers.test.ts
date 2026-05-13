import { describe, expect, it } from 'vitest'
import {
  hasPasswordRecoveryHash,
  resolveResetPasswordUrlError,
  validateResetPasswordForm,
} from '@/features/auth-password-reset/lib/password-reset-helpers'

describe('password reset helpers', () => {
  it('hasPasswordRecoveryHash detects recovery tokens', () => {
    expect(hasPasswordRecoveryHash('#access_token=abc&type=recovery')).toBe(true)
    expect(hasPasswordRecoveryHash('access_token=abc&type=recovery')).toBe(true)
    expect(hasPasswordRecoveryHash('#access_token=abc&type=signup')).toBe(false)
    expect(hasPasswordRecoveryHash('')).toBe(false)
  })

  it('resolveResetPasswordUrlError maps Supabase query errors', () => {
    expect(resolveResetPasswordUrlError('access_denied', 'otp_expired', null)).toBe(
      'Il link di reset password è scaduto. Richiedi un nuovo link.',
    )
    expect(resolveResetPasswordUrlError('access_denied', 'access_denied', 'Invalid+link')).toBe(
      'Invalid link',
    )
    expect(resolveResetPasswordUrlError('access_denied', null, null)).toBe(
      'Link non valido o scaduto',
    )
    expect(resolveResetPasswordUrlError(null, null, null)).toBeNull()
  })

  it('validateResetPasswordForm enforces password rules', () => {
    expect(validateResetPasswordForm('', '')).toBe('Inserisci una nuova password')
    expect(validateResetPasswordForm('12345', '12345')).toBe(
      'La password deve essere di almeno 6 caratteri',
    )
    expect(validateResetPasswordForm('123456', '654321')).toBe('Le password non corrispondono')
    expect(validateResetPasswordForm('123456', '123456')).toBeNull()
  })
})
