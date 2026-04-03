import { isValidUUID } from '@/lib/utils/type-guards'

/** L’iframe embed ha sessionStorage separato dal parent: il path viene inviato via postMessage. */
export const EMBED_ATHLETE_PATH_UPDATE = '22club:embed-athlete-path' as const

export const STAFF_WORKOUTS_EMBED_LAST_PATH_SESSION_KEY =
  '22club:staff-workouts-embed-last-path-v1' as const

type EmbedPathMap = Record<string, string>

function parseMap(raw: string | null): EmbedPathMap {
  if (!raw) return {}
  try {
    const o = JSON.parse(raw) as unknown
    if (!o || typeof o !== 'object') return {}
    const out: EmbedPathMap = {}
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      if (!isValidUUID(k.trim())) continue
      if (typeof v !== 'string') continue
      const p = v.trim()
      if (isValidEmbedPathForAthlete(p, k.trim())) out[k.trim()] = p
    }
    return out
  } catch {
    return {}
  }
}

function writeMap(map: EmbedPathMap) {
  if (typeof window === 'undefined') return
  try {
    if (Object.keys(map).length === 0) {
      sessionStorage.removeItem(STAFF_WORKOUTS_EMBED_LAST_PATH_SESSION_KEY)
      return
    }
    sessionStorage.setItem(STAFF_WORKOUTS_EMBED_LAST_PATH_SESSION_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

export function isValidEmbedPathForAthlete(path: string, athleteProfileId: string): boolean {
  const id = athleteProfileId.trim()
  if (!isValidUUID(id)) return false
  const p = path.trim()
  if (!p.startsWith('/')) return false
  const parts = p.split('/').filter(Boolean)
  if (parts.length < 3) return false
  if (parts[0] !== 'embed' || parts[1] !== 'athlete-allenamenti') return false
  if (parts[2] !== id) return false
  return true
}

export function readLastEmbedPathForAthlete(athleteProfileId: string): string {
  const id = athleteProfileId.trim()
  if (!isValidUUID(id) || typeof window === 'undefined') return ''
  const map = parseMap(sessionStorage.getItem(STAFF_WORKOUTS_EMBED_LAST_PATH_SESSION_KEY))
  const path = map[id]?.trim() ?? ''
  return isValidEmbedPathForAthlete(path, id) ? path : ''
}

export function persistLastEmbedPathForAthlete(athleteProfileId: string, path: string) {
  const id = athleteProfileId.trim()
  const p = path.trim()
  if (!isValidUUID(id) || !isValidEmbedPathForAthlete(p, id)) return
  const map = parseMap(sessionStorage.getItem(STAFF_WORKOUTS_EMBED_LAST_PATH_SESSION_KEY))
  map[id] = p
  writeMap(map)
}

export function clearLastEmbedPathForAthlete(athleteProfileId: string) {
  const id = athleteProfileId.trim()
  if (!isValidUUID(id) || typeof window === 'undefined') return
  const map = parseMap(sessionStorage.getItem(STAFF_WORKOUTS_EMBED_LAST_PATH_SESSION_KEY))
  if (!(id in map)) return
  delete map[id]
  writeMap(map)
}
