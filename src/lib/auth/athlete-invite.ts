export const PENDING_INVITE_CODICE_STORAGE_KEY = 'pending_invite_codice'

type SearchParamsReader = {
  get: (name: string) => string | null
}

export function readInviteCodiceFromSearchParams(searchParams: SearchParamsReader): string {
  return searchParams.get('codice')?.trim() || searchParams.get('code')?.trim() || ''
}

export function buildWelcomePath(codice?: string | null): string {
  const trimmed = codice?.trim() || ''
  return trimmed ? `/welcome?codice=${encodeURIComponent(trimmed)}` : '/welcome'
}

export function buildWelcomeEmailRedirectTo(
  origin: string,
  codice?: string | null,
): string | undefined {
  if (!origin) return undefined
  const trimmed = codice?.trim() || ''
  return trimmed
    ? `${origin}/welcome?codice=${encodeURIComponent(trimmed)}`
    : `${origin}/welcome`
}

export function storePendingInviteCodice(codice: string): void {
  const trimmed = codice.trim()
  if (!trimmed || typeof window === 'undefined') return

  try {
    sessionStorage.setItem(PENDING_INVITE_CODICE_STORAGE_KEY, trimmed)
  } catch {
    // ignore
  }
}

export function readPendingInviteCodice(): string | null {
  if (typeof window === 'undefined') return null

  try {
    return sessionStorage.getItem(PENDING_INVITE_CODICE_STORAGE_KEY)?.trim() || null
  } catch {
    return null
  }
}
