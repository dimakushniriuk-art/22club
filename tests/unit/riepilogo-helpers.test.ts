import { describe, expect, it } from 'vitest'
import {
  difficultyLabelIt,
  formatVolumeIt,
  muscleLabelIt,
  pickExerciseSharePreviewUrl,
  pickExerciseShareVideoUrl,
  repsForVolumeKgRep,
} from '@/features/athlete-allenamenti/lib/riepilogo-helpers'
import { WORKOUT_REPS_MAX_SENTINEL } from '@/lib/constants/workout-reps-select'

describe('riepilogo helpers', () => {
  it('formatVolumeIt rounds to integer string', () => {
    expect(formatVolumeIt(1234.6)).toBe(new Intl.NumberFormat('it-IT').format(1235))
  })

  it('repsForVolumeKgRep ignores MAX sentinel', () => {
    expect(repsForVolumeKgRep(WORKOUT_REPS_MAX_SENTINEL)).toBe(0)
    expect(repsForVolumeKgRep(8)).toBe(8)
  })

  it('difficultyLabelIt maps known codes', () => {
    expect(difficultyLabelIt('beginner')).toBe('Principiante')
    expect(difficultyLabelIt('custom')).toBe('custom')
  })

  it('muscleLabelIt normalizes unknown', () => {
    expect(muscleLabelIt('unknown')).toBe('Gruppo muscolare')
    expect(muscleLabelIt('petto')).toBe('petto')
  })

  it('pickExerciseSharePreviewUrl prefers thumb and resolves same-origin paths', () => {
    expect(
      pickExerciseSharePreviewUrl(
        { thumb_url: '/media/thumb.jpg', image_url: 'https://cdn.example/a.png' },
        'https://app.example',
      ),
    ).toBe('https://app.example/media/thumb.jpg')
  })

  it('pickExerciseShareVideoUrl resolves streamable URLs', () => {
    expect(
      pickExerciseShareVideoUrl({ video_url: 'https://cdn.example/v.mp4' }, 'https://app.example'),
    ).toBe('https://cdn.example/v.mp4')
  })
})
