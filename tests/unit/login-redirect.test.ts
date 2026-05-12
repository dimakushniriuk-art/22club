import { describe, expect, it } from 'vitest'
import {
  getUnknownLoginRoleError,
  resolveAthleteRedirectFromLoginQuery,
  resolvePostLoginRedirectPath,
  validateLoginForm,
} from '@/lib/auth/login-redirect'

describe('login redirect helpers', () => {
  it('validateLoginForm requires email and password', () => {
    expect(validateLoginForm('', '')).toEqual({
      email: 'Email è richiesta',
      password: 'Password è richiesta',
    })
    expect(validateLoginForm('  ', 'secret')).toEqual({ email: 'Email è richiesta' })
    expect(validateLoginForm('a@b.it', '')).toEqual({ password: 'Password è richiesta' })
    expect(validateLoginForm('a@b.it', 'secret')).toEqual({})
  })

  it('resolveAthleteRedirectFromLoginQuery accepts safe /home paths for athletes', () => {
    const athlete = { role: 'athlete', first_login: false }
    expect(resolveAthleteRedirectFromLoginQuery(athlete, '/home/chat')).toBe('/home/chat')
    expect(resolveAthleteRedirectFromLoginQuery(athlete, encodeURIComponent('/home/chat'))).toBe(
      '/home/chat',
    )
  })

  it('resolveAthleteRedirectFromLoginQuery rejects unsafe or non-athlete redirects', () => {
    const athlete = { role: 'athlete', first_login: false }
    expect(resolveAthleteRedirectFromLoginQuery(athlete, '/dashboard')).toBeNull()
    expect(resolveAthleteRedirectFromLoginQuery(athlete, '/home/../login')).toBeNull()
    expect(resolveAthleteRedirectFromLoginQuery(athlete, 'https://evil.test/home')).toBeNull()
    expect(resolveAthleteRedirectFromLoginQuery(athlete, 'x'.repeat(2049))).toBeNull()
    expect(resolveAthleteRedirectFromLoginQuery(athlete, null)).toBeNull()

    const trainer = { role: 'trainer', first_login: false }
    expect(resolveAthleteRedirectFromLoginQuery(trainer, '/home/chat')).toBeNull()
  })

  it('resolvePostLoginRedirectPath maps roles and first_login', () => {
    expect(resolvePostLoginRedirectPath({ role: 'trainer', first_login: false })).toBe('/dashboard')
    expect(resolvePostLoginRedirectPath({ role: 'athlete', first_login: true })).toBe('/welcome')
    expect(resolvePostLoginRedirectPath({ role: 'athlete', first_login: false })).toBe('/home')
    expect(resolvePostLoginRedirectPath({ role: 'unknown', first_login: false })).toBeNull()
  })

  it('getUnknownLoginRoleError includes role', () => {
    expect(getUnknownLoginRoleError('foo')).toContain('foo')
  })
})
