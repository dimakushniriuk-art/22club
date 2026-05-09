import { describe, it, expect } from 'vitest'
import {
  isPublicExerciseThumbStorageUrl,
  isPublicExerciseVideoStorageUrl,
  validateExerciseThumbUrl,
  validateExerciseVideoUrl,
} from '@/lib/validations/exercise-media-urls'

describe('exercise-media-urls', () => {
  it('accepts empty video and thumb', () => {
    expect(validateExerciseVideoUrl(null)).toBeUndefined()
    expect(validateExerciseVideoUrl('')).toBeUndefined()
    expect(validateExerciseThumbUrl(undefined)).toBeUndefined()
  })

  it('detects Supabase public storage paths', () => {
    const v = 'https://xyz.supabase.co/storage/v1/object/public/exercise-videos/u1/f.mp4'
    const t = 'https://xyz.supabase.co/storage/v1/object/public/exercise-thumbs/u1/x.jpg'
    expect(isPublicExerciseVideoStorageUrl(v)).toBe(true)
    expect(isPublicExerciseThumbStorageUrl(t)).toBe(true)
    expect(validateExerciseVideoUrl(v)).toBeUndefined()
    expect(validateExerciseThumbUrl(t)).toBeUndefined()
  })

  it('accepts known video hosts via video-url helper', () => {
    expect(validateExerciseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBeUndefined()
  })

  it('rejects thumb that is not storage nor image extension', () => {
    expect(validateExerciseThumbUrl('https://example.com/page')).toBeDefined()
  })
})
