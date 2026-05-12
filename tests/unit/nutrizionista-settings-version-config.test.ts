import { describe, expect, it } from 'vitest'
import {
  DEFAULT_NUTRIZIONISTA_ADAPTIVE_SETTINGS,
  DEFAULT_NUTRIZIONISTA_AUTO_CONFIG,
} from '@/lib/dashboard/fetch-nutrizionista-settings-version-config'

describe('nutrizionista settings version config defaults', () => {
  it('exposes stable auto and adaptive defaults', () => {
    expect(DEFAULT_NUTRIZIONISTA_AUTO_CONFIG.meals_per_day).toBe(5)
    expect(DEFAULT_NUTRIZIONISTA_AUTO_CONFIG.macro_distribution_mode).toBe('equal')
    expect(DEFAULT_NUTRIZIONISTA_ADAPTIVE_SETTINGS.goal_type).toBe('maintain')
    expect(DEFAULT_NUTRIZIONISTA_ADAPTIVE_SETTINGS.adjust_frequency_days).toBe(7)
  })
})
