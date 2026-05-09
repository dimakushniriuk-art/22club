export type ProfileLocalStorageResult<T> = {
  value: T
  savedAt: string | null
}

function keyWithProfile(baseKey: string, profileId?: string | null): string {
  return `${baseKey}:${profileId ?? 'anon'}`
}

function savedAtKey(baseKey: string, profileId?: string | null): string {
  return `${keyWithProfile(baseKey, profileId)}:savedAt`
}

export function loadProfileLocalStorageJson<T>(
  baseKey: string,
  profileId: string | null | undefined,
  parse: (raw: unknown) => T,
  options?: { legacyKeys?: string[]; defaultValue: T },
): ProfileLocalStorageResult<T> {
  if (typeof window === 'undefined') {
    return { value: options?.defaultValue ?? parse(null), savedAt: null }
  }

  const primaryKey = keyWithProfile(baseKey, profileId)
  const primarySavedAtKey = savedAtKey(baseKey, profileId)

  const tryLoad = (k: string): unknown => {
    const raw = window.localStorage.getItem(k)
    if (raw == null || raw === '') return null
    return JSON.parse(raw) as unknown
  }

  try {
    const raw = tryLoad(primaryKey)
    if (raw != null) {
      return { value: parse(raw), savedAt: window.localStorage.getItem(primarySavedAtKey) }
    }

    const legacyKeys = options?.legacyKeys ?? []
    for (const legacyKey of legacyKeys) {
      const legacyRaw = tryLoad(legacyKey)
      if (legacyRaw != null) {
        const value = parse(legacyRaw)
        // Best-effort migrate forward
        try {
          window.localStorage.setItem(primaryKey, JSON.stringify(value))
          window.localStorage.setItem(primarySavedAtKey, new Date().toISOString())
        } catch {
          /* ignore */
        }
        return { value, savedAt: null }
      }
    }

    return { value: options?.defaultValue ?? parse(null), savedAt: null }
  } catch {
    return { value: options?.defaultValue ?? parse(null), savedAt: null }
  }
}

export function saveProfileLocalStorageJson<T>(
  baseKey: string,
  profileId: string | null | undefined,
  value: T,
  savedAt?: string,
): void {
  if (typeof window === 'undefined') return
  try {
    const primaryKey = keyWithProfile(baseKey, profileId)
    const primarySavedAtKey = savedAtKey(baseKey, profileId)
    window.localStorage.setItem(primaryKey, JSON.stringify(value))
    window.localStorage.setItem(primarySavedAtKey, savedAt ?? new Date().toISOString())
  } catch {
    /* ignore quota/private mode */
  }
}
