import { describe, expect, it } from 'vitest'
import {
  deleteWorkoutsSlotParams,
  workoutsResolveAthleteFallbackLabel,
  workoutsSlotClienteDisplayName,
} from '@/features/staff-workouts/lib/workouts-shell-slot'
import type { Cliente } from '@/types/cliente'

const ATHLETE = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'

function cliente(partial: Partial<Cliente> & { id: string }): Cliente {
  return partial as Cliente
}

describe('workouts shell slot helpers', () => {
  it('removes slot id and prefixed pane keys', () => {
    const params = new URLSearchParams({
      p1: ATHLETE,
      p1view: 'oggi',
      p1workoutPlanId: '11111111-1111-4111-8111-111111111111',
      p2: ATHLETE,
      p2view: 'home',
    })
    deleteWorkoutsSlotParams(params, 'p1')
    expect(params.get('p1')).toBeNull()
    expect(params.get('p1view')).toBeNull()
    expect(params.get('p1workoutPlanId')).toBeNull()
    expect(params.get('p2view')).toBe('home')
  })

  it('builds display name from nome/cognome or email', () => {
    expect(
      workoutsSlotClienteDisplayName(
        cliente({ id: ATHLETE, nome: 'Mario', cognome: 'Rossi', email: 'm@x.it' }),
      ),
    ).toBe('Mario Rossi')
    expect(workoutsSlotClienteDisplayName(cliente({ id: ATHLETE, email: 'solo@mail.it' }))).toBe(
      'solo@mail.it',
    )
    expect(workoutsSlotClienteDisplayName(cliente({ id: ATHLETE }))).toBe('Atleta')
  })

  it('resolves athlete label with loading and fallback', () => {
    const athletes = [cliente({ id: ATHLETE, nome: 'Luigi', cognome: 'Verdi' })]
    expect(workoutsResolveAthleteFallbackLabel(ATHLETE, athletes, false)).toBe('Luigi Verdi')
    expect(workoutsResolveAthleteFallbackLabel(ATHLETE, [], true)).toBe('Caricamento profilo…')
    expect(workoutsResolveAthleteFallbackLabel(ATHLETE, [], false)).toBe(
      `Atleta (${ATHLETE.slice(0, 8)}…)`,
    )
  })
})
