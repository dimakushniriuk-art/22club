import { describe, expect, it } from 'vitest'
import type { AthleteWorkoutDayExerciseRow } from '@/hooks/use-athlete-workout-day-preview'
import {
  formatGiornoExerciseTargets,
  groupExerciseRows,
  isRemoteOrPathImage,
  isStreamableVideoUrl,
  videoPosterAttr,
} from '@/features/athlete-allenamenti/lib/giorno-preview-helpers'

function row(
  partial: Partial<AthleteWorkoutDayExerciseRow> & { id: string },
): AthleteWorkoutDayExerciseRow {
  return {
    order_index: null,
    target_sets: null,
    target_reps: null,
    target_weight: null,
    rest_timer_sec: null,
    rest_seconds: null,
    note: null,
    circuit_block_id: null,
    exercises: null,
    ...partial,
  }
}

describe('giorno preview helpers', () => {
  it('videoPosterAttr accepts absolute paths and remote URLs', () => {
    expect(videoPosterAttr('/poster.jpg')).toBe('/poster.jpg')
    expect(videoPosterAttr('https://cdn.example/poster.jpg')).toBe('https://cdn.example/poster.jpg')
    expect(videoPosterAttr('poster.jpg')).toBeUndefined()
  })

  it('isRemoteOrPathImage and isStreamableVideoUrl validate media URLs', () => {
    expect(isRemoteOrPathImage('/thumb.jpg')).toBe(true)
    expect(isStreamableVideoUrl('https://cdn.example/video.mp4')).toBe(true)
    expect(isStreamableVideoUrl('/video.mp4')).toBe(false)
  })

  it('groupExerciseRows groups contiguous circuit rows', () => {
    const rows = [
      row({ id: 'a', circuit_block_id: 'c1' }),
      row({ id: 'b', circuit_block_id: 'c1' }),
      row({ id: 'c' }),
    ]
    expect(groupExerciseRows(rows)).toEqual([
      { kind: 'circuit', rows: [rows[0], rows[1]] },
      { kind: 'single', rows: [rows[2]] },
    ])
  })

  it('formatGiornoExerciseTargets includes weight when present', () => {
    expect(
      formatGiornoExerciseTargets(
        row({ id: 'a', target_sets: 3, target_reps: 10, target_weight: 40 }),
      ),
    ).toBe('3×10 · 40 kg')
    expect(formatGiornoExerciseTargets(row({ id: 'a', target_sets: 3, target_reps: 10 }))).toBe(
      '3×10',
    )
  })
})
