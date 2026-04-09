/**
 * Preferenze cookie / tecnologie simili (localStorage).
 * Usato da banner consenso, Sentry client e componenti opzionali (es. PWA).
 * I cookie di sessione Supabase restano necessari per l’autenticazione.
 */

export const COOKIE_PREFS_STORAGE_KEY = '22club-cookie-preferences'
const LEGACY_KEY = 'cookie-consent'

/** Evento globale per aprire il pannello preferenze (da Impostazioni / Profilo). */
export const OPEN_COOKIE_PREFERENCES_EVENT = '22club-open-cookie-preferences'

export function requestOpenCookiePreferences(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(OPEN_COOKIE_PREFERENCES_EVENT))
}

export const COOKIE_PREFS_VERSION = 1 as const

export type CookiePreferencesV1 = {
  v: typeof COOKIE_PREFS_VERSION
  /** Sentry: replay, performance transactions, log strutturati oltre agli errori critici */
  analytics: boolean
  /** UI opzionale memorizzata (es. prompt installazione PWA) */
  functional: boolean
  decidedAt: string
}

function safeParse(raw: string | null): CookiePreferencesV1 | null {
  if (raw == null || raw === '') return null
  try {
    const o = JSON.parse(raw) as unknown
    if (typeof o !== 'object' || o === null) return null
    const v = (o as { v?: unknown }).v
    if (v !== COOKIE_PREFS_VERSION) return null
    const analytics = (o as { analytics?: unknown }).analytics
    const functional = (o as { functional?: unknown }).functional
    const decidedAt = (o as { decidedAt?: unknown }).decidedAt
    if (
      typeof analytics !== 'boolean' ||
      typeof functional !== 'boolean' ||
      typeof decidedAt !== 'string'
    ) {
      return null
    }
    return { v: COOKIE_PREFS_VERSION, analytics, functional, decidedAt }
  } catch {
    return null
  }
}

/** Legge preferenze (solo browser). */
export function getCookiePreferences(): CookiePreferencesV1 | null {
  if (typeof window === 'undefined') return null
  try {
    migrateLegacyCookieKey()
    return safeParse(localStorage.getItem(COOKIE_PREFS_STORAGE_KEY))
  } catch {
    return null
  }
}

/** Migrazione da `cookie-consent` legacy (entrambi i pulsanti salvavano `true`). */
export function migrateLegacyCookieKey(): void {
  if (typeof window === 'undefined') return
  try {
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy !== 'true' && legacy !== 'false') return
    if (localStorage.getItem(COOKIE_PREFS_STORAGE_KEY)) {
      localStorage.removeItem(LEGACY_KEY)
      return
    }
    const prefs: CookiePreferencesV1 = {
      v: COOKIE_PREFS_VERSION,
      analytics: legacy === 'true',
      functional: true,
      decidedAt: new Date().toISOString(),
    }
    localStorage.setItem(COOKIE_PREFS_STORAGE_KEY, JSON.stringify(prefs))
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    /* ignore */
  }
}

export function saveCookiePreferences(
  prefs: Omit<CookiePreferencesV1, 'v' | 'decidedAt'>,
): CookiePreferencesV1 {
  const full: CookiePreferencesV1 = {
    v: COOKIE_PREFS_VERSION,
    analytics: prefs.analytics,
    functional: prefs.functional,
    decidedAt: new Date().toISOString(),
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(COOKIE_PREFS_STORAGE_KEY, JSON.stringify(full))
    } catch {
      /* ignore */
    }
  }
  return full
}

/** Consenso esplicito alle analisi (Sentry replay / transaction oltre errori base). */
export function hasAnalyticsConsent(): boolean {
  return getCookiePreferences()?.analytics === true
}

/** Consenso a funzionalità opzionali non strettamente necessarie (es. prompt PWA). */
export function hasFunctionalConsent(): boolean {
  const p = getCookiePreferences()
  if (!p) return false
  return p.functional === true
}

/** L’utente ha già espresso una scelta (mostrare solo link “Gestisci”). */
export function hasCookieDecision(): boolean {
  return getCookiePreferences() != null
}
