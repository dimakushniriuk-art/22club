import { describe, expect, it } from 'vitest'
import { mapNutrizionistaCheckinListError } from '@/lib/dashboard/fetch-nutrizionista-checkin-list'

describe('mapNutrizionistaCheckinListError', () => {
  it('maps missing relation errors to migration hint', () => {
    expect(mapNutrizionistaCheckinListError({ message: 'relation does not exist' })).toContain(
      'nutrition_check_ins',
    )
  })

  it('passes through generic errors', () => {
    expect(mapNutrizionistaCheckinListError(new Error('timeout'))).toBe('timeout')
  })
})
