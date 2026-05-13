import { describe, expect, it } from 'vitest'
import {
  buildWelcomeEmailRedirectTo,
  buildWelcomePath,
  readInviteCodiceFromSearchParams,
} from '@/lib/auth/athlete-invite'
import { validateAthleteRegistrationForm } from '@/features/athlete-registration/lib/registration-helpers'

describe('athlete invite helpers', () => {
  it('readInviteCodiceFromSearchParams prefers codice then code', () => {
    expect(
      readInviteCodiceFromSearchParams(new URLSearchParams('codice=ABC12345&code=ignored')),
    ).toBe('ABC12345')
    expect(readInviteCodiceFromSearchParams(new URLSearchParams('code=XYZ98765'))).toBe('XYZ98765')
    expect(readInviteCodiceFromSearchParams(new URLSearchParams(''))).toBe('')
  })

  it('buildWelcomePath encodes codice when present', () => {
    expect(buildWelcomePath('ABC 123')).toBe('/welcome?codice=ABC%20123')
    expect(buildWelcomePath('')).toBe('/welcome')
  })

  it('buildWelcomeEmailRedirectTo keeps origin and welcome path', () => {
    expect(buildWelcomeEmailRedirectTo('https://app.test', 'INV12345')).toBe(
      'https://app.test/welcome?codice=INV12345',
    )
    expect(buildWelcomeEmailRedirectTo('https://app.test', '')).toBe('https://app.test/welcome')
    expect(buildWelcomeEmailRedirectTo('', 'INV12345')).toBeUndefined()
  })
})

describe('athlete registration helpers', () => {
  it('validateAthleteRegistrationForm enforces password rules', () => {
    expect(
      validateAthleteRegistrationForm({
        email: 'a@b.it',
        password: '123',
        confirmPassword: '123',
        nome: 'Mario',
        cognome: 'Rossi',
      }),
    ).toBe('La password deve essere di almeno 6 caratteri')

    expect(
      validateAthleteRegistrationForm({
        email: 'a@b.it',
        password: '123456',
        confirmPassword: '654321',
        nome: 'Mario',
        cognome: 'Rossi',
      }),
    ).toBe('Le password non corrispondono')

    expect(
      validateAthleteRegistrationForm({
        email: 'a@b.it',
        password: '123456',
        confirmPassword: '123456',
        nome: 'Mario',
        cognome: 'Rossi',
      }),
    ).toBeNull()
  })
})
