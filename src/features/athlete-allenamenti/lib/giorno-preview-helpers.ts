import type { AthleteWorkoutDayExerciseRow } from '@/hooks/use-athlete-workout-day-preview'

export type GiornoPreviewBlock = { kind: 'single' | 'circuit'; rows: AthleteWorkoutDayExerciseRow[] }

export function isRemoteOrPathImage(u: string | null | undefined): u is string {
  return (
    typeof u === 'string' &&
    u.length > 0 &&
    (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/'))
  )
}

export function isStreamableVideoUrl(u: string | null | undefined): u is string {
  return (
    typeof u === 'string' && u.length > 0 && (u.startsWith('http://') || u.startsWith('https://'))
  )
}

/** Poster URL valido per l'attributo `poster` (http(s) o path assoluto same-origin). */
export function videoPosterAttr(raw: string | null | undefined): string | undefined {
  if (raw == null || raw === '') return undefined
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('/')) return raw
  return undefined
}

export function groupExerciseRows(rows: AthleteWorkoutDayExerciseRow[]): GiornoPreviewBlock[] {
  const blocks: GiornoPreviewBlock[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const bid = row.circuit_block_id
    if (bid) {
      const group: AthleteWorkoutDayExerciseRow[] = [row]
      let j = i + 1
      while (j < rows.length && rows[j].circuit_block_id === bid) {
        group.push(rows[j])
        j++
      }
      blocks.push({ kind: 'circuit', rows: group })
      i = j - 1
    } else {
      blocks.push({ kind: 'single', rows: [row] })
    }
  }
  return blocks
}

export function formatGiornoExerciseTargets(r: AthleteWorkoutDayExerciseRow): string {
  const s = r.target_sets ?? 0
  const reps = r.target_reps ?? 0
  const w = r.target_weight
  const base = `${s}×${reps}`
  if (w != null && w > 0) return `${base} · ${w} kg`
  return base
}
