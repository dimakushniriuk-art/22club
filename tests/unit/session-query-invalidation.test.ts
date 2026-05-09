import { describe, it, expect } from 'vitest'
import { shouldInvalidateQueryOnSessionResume } from '@/lib/session-stability/session-query-invalidation'

describe('shouldInvalidateQueryOnSessionResume', () => {
  it('returns true for known dashboard roots', () => {
    expect(shouldInvalidateQueryOnSessionResume(['appointments'])).toBe(true)
    expect(shouldInvalidateQueryOnSessionResume(['clienti', 'list', 'u'])).toBe(true)
    expect(shouldInvalidateQueryOnSessionResume(['athlete-profile', 'id1'])).toBe(true)
  })

  it('returns false for unknown keys', () => {
    expect(shouldInvalidateQueryOnSessionResume(['random-feature'])).toBe(false)
    expect(shouldInvalidateQueryOnSessionResume([])).toBe(false)
  })
})
