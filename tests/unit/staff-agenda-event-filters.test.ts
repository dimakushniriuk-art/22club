import { describe, expect, it } from 'vitest'
import {
  isMassageAgendaEvent,
  isNutritionAgendaEvent,
} from '@/lib/dashboard/staff-agenda-event-filters'

describe('staff agenda event filters', () => {
  describe('isMassageAgendaEvent', () => {
    it('matches exact and partial massage descriptions', () => {
      expect(isMassageAgendaEvent('massaggio')).toBe(true)
      expect(isMassageAgendaEvent('Massaggio sportivo')).toBe(true)
      expect(isMassageAgendaEvent(undefined)).toBe(false)
      expect(isMassageAgendaEvent('nutrizionista')).toBe(false)
    })
  })

  describe('isNutritionAgendaEvent', () => {
    it('matches exact and partial nutrition descriptions', () => {
      expect(isNutritionAgendaEvent('nutrizionista')).toBe(true)
      expect(isNutritionAgendaEvent('Visita nutrizionale')).toBe(true)
      expect(isNutritionAgendaEvent(undefined)).toBe(false)
      expect(isNutritionAgendaEvent('massaggio')).toBe(false)
    })
  })
})
