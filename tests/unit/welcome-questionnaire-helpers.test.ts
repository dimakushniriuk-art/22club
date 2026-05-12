import { describe, expect, it } from 'vitest'
import {
  mapProfileConsentDefaults,
  mapWelcomeQuestionnaireRow,
} from '@/features/welcome-onboarding/lib/welcome-questionnaire-helpers'
import type { ProfileRow } from '@/features/welcome-onboarding/types'

describe('welcome questionnaire helpers', () => {
  it('mapWelcomeQuestionnaireRow returns null when row is missing', () => {
    expect(mapWelcomeQuestionnaireRow(null)).toBeNull()
  })

  it('mapWelcomeQuestionnaireRow maps liberatoria aliases', () => {
    const patch = mapWelcomeQuestionnaireRow({
      anamnesi: { sonno: '7h' },
      manleva: { nome_cognome: 'Mario Rossi' },
      liberatoria_media: {
        autorizzazione: true,
        canali_consentiti: 'Social',
        durata: 'fino_a_revoca',
        luogo: 'Milano',
        firma_nome_cognome: 'Mario Rossi',
      },
    })

    expect(patch?.anamnesi.sonno).toBe('7h')
    expect(patch?.manleva.nome_cognome).toBe('Mario Rossi')
    expect(patch?.liberatoria.authorized).toBe(true)
    expect(patch?.liberatoria.channels).toEqual(['Social'])
    expect(patch?.liberatoria.duration).toBe('fino_a_revoca')
    expect(patch?.liberatoria.place).toBe('Milano')
    expect(patch?.liberatoria.firma_nome_cognome).toBe('Mario Rossi')
  })

  it('mapProfileConsentDefaults derives consent fields from profile', () => {
    const defaults = mapProfileConsentDefaults({
      nome: 'Mario',
      cognome: 'Rossi',
      data_nascita: '1990-01-01',
      indirizzo_residenza: 'Via Roma 1',
      cap: '20100',
      citta: 'Milano',
      provincia: 'MI',
    } as ProfileRow)

    expect(defaults.manleva.nome_cognome).toBe('Mario Rossi')
    expect(defaults.manleva.residenza).toContain('Via Roma 1')
    expect(defaults.liberatoria.firma_nome_cognome).toBe('Mario Rossi')
  })
})
