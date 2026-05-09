/**
 * Bozza form generica nel browser (`localStorage`): chiave versionata per feature + scope
 * (es. `userId`, `campaignId`). Allineato al pattern di `workout-wizard-browser-draft.ts`.
 */

export const FORM_DRAFT_PREFIX = '22club-form-draft:v1:'

export interface BrowserFormDraftEnvelope<T> {
  v: 1
  savedAt: string
  payload: T
}

export interface FormDraftLoadOptions {
  /** Default 7 giorni (come wizard schede). */
  maxAgeMs?: number
}

const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export function formDraftStorageKey(feature: string, scope: string): string {
  const safeFeature = feature.replace(/[^a-zA-Z0-9_-]/g, '_')
  const safeScope = scope.replace(/[^a-zA-Z0-9_-]/g, '_')
  return `${FORM_DRAFT_PREFIX}${safeFeature}:${safeScope}`
}

function parseEnvelope<T>(raw: string | null): BrowserFormDraftEnvelope<T> | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as BrowserFormDraftEnvelope<T>
    if (parsed?.v !== 1 || typeof parsed.savedAt !== 'string' || parsed.payload === undefined)
      return null
    return parsed
  } catch {
    return null
  }
}

export function loadFormDraft<T>(
  feature: string,
  scope: string,
  options?: FormDraftLoadOptions,
): BrowserFormDraftEnvelope<T> | null {
  if (typeof window === 'undefined') return null
  const maxAge = options?.maxAgeMs ?? DEFAULT_MAX_AGE_MS
  try {
    const parsed = parseEnvelope<T>(localStorage.getItem(formDraftStorageKey(feature, scope)))
    if (!parsed) return null
    const age = Date.now() - new Date(parsed.savedAt).getTime()
    if (!Number.isFinite(age) || age > maxAge) {
      clearFormDraft(feature, scope)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function saveFormDraft<T>(
  feature: string,
  scope: string,
  payload: T,
  savedAt?: string,
): boolean {
  if (typeof window === 'undefined') return false
  try {
    const full: BrowserFormDraftEnvelope<T> = {
      v: 1,
      savedAt: savedAt ?? new Date().toISOString(),
      payload,
    }
    localStorage.setItem(formDraftStorageKey(feature, scope), JSON.stringify(full))
    return true
  } catch {
    return false
  }
}

/** Salvataggio sincrono per `beforeunload` / `pagehide`. */
export function saveFormDraftSync<T>(
  feature: string,
  scope: string,
  payload: T,
  savedAt?: string,
): void {
  if (typeof window === 'undefined') return
  try {
    const full: BrowserFormDraftEnvelope<T> = {
      v: 1,
      savedAt: savedAt ?? new Date().toISOString(),
      payload,
    }
    localStorage.setItem(formDraftStorageKey(feature, scope), JSON.stringify(full))
  } catch {
    /* quota / privato */
  }
}

export function clearFormDraft(feature: string, scope: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(formDraftStorageKey(feature, scope))
  } catch {
    /* ignore */
  }
}
