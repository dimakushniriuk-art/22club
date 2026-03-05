import { describe, it, expect } from 'vitest'

describe('Simple Test Suite', () => {
  it('should pass basic math test', () => {
    expect(2 + 2).toBe(4)
  })

  it('should handle string operations', () => {
    const greeting = 'Hello'
    const name = 'World'
    expect(`${greeting} ${name}`).toBe('Hello World')
  })

  it('should work with arrays', () => {
    const numbers = [1, 2, 3, 4, 5]
    expect(numbers.length).toBe(5)
    expect(numbers.includes(3)).toBe(true)
  })

  it('should work with objects', () => {
    const user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    }

    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('name')
    expect(user).toHaveProperty('email')
    expect(user.name).toBe('Test User')
  })
})
