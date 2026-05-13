export function readPasswordRecoveryHashParams(hash: string): URLSearchParams {
  const normalized = hash.startsWith('#') ? hash.slice(1) : hash
  return new URLSearchParams(normalized)
}

export function hasPasswordRecoveryHash(hash = ''): boolean {
  const params = readPasswordRecoveryHashParams(hash)
  return Boolean(params.get('access_token') && params.get('type') === 'recovery')
}

export function resolveResetPasswordUrlError(
  errorParam: string | null,
  errorCode: string | null,
  errorDescription: string | null,
): string | null {
  if (!errorParam) return null

  if (errorCode === 'otp_expired') {
    return 'Il link di reset password è scaduto. Richiedi un nuovo link.'
  }

  if (errorCode === 'access_denied') {
    return errorDescription
      ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
      : 'Accesso negato. Il link potrebbe non essere valido.'
  }

  return 'Link non valido o scaduto'
}

export function validateResetPasswordForm(
  password: string,
  confirmPassword: string,
): string | null {
  if (!password) return 'Inserisci una nuova password'
  if (password.length < 6) return 'La password deve essere di almeno 6 caratteri'
  if (password !== confirmPassword) return 'Le password non corrispondono'
  return null
}

export async function requestForgotPasswordEmail(
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim(),
      redirectTo: `${origin}/reset-password`,
    }),
  })

  const data = (await res.json().catch(() => ({}))) as { error?: string }

  if (!res.ok) {
    return { ok: false, error: data.error || "Errore durante l'invio della richiesta" }
  }

  return { ok: true }
}
