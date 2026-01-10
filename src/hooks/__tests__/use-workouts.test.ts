import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useWorkouts } from '../use-workouts'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
}

vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

vi.mock('@/lib/workouts/workout-transformers', () => ({
  transformExercises: vi.fn((exercises) => exercises),
  getDifficultyFromDb: vi.fn((difficulty) => difficulty || 'beginner'),
}))

vi.mock('@/lib/utils/profile-id-utils', () => ({
  getUserIdFromProfileId: vi.fn(async (profileId) => `user-${profileId}`),
}))

const mockWorkoutPlans = [
  {
    id: '1',
    athlete_id: 'athlete-1',
    name: 'Upper Body',
    description: 'Workout for upper body',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 86400000).toISOString(),
    is_active: true,
    athlete: { nome: 'Mario', cognome: 'Rossi' },
    created_by_staff: { nome: 'PT', cognome: 'Trainer' },
  },
]

describe('useWorkouts', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default auth mock
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })

    // Setup exercises mock - chain completa
    const mockExercisesSelect = vi.fn()
    const mockExercisesOrder = vi.fn()

    mockExercisesSelect.mockReturnValue({
      order: mockExercisesOrder,
    })

    mockExercisesOrder.mockResolvedValue({
      data: [
        {
          id: 'ex-1',
          name: 'Bench Press',
          muscle_group: 'chest',
          equipment: 'barbell',
          difficulty: 'intermediate',
        },
      ],
      error: null,
    })

    // Setup workout plans mock - chain completa
    const mockWorkoutSelect = vi.fn()
    const mockWorkoutEq = vi.fn()
    const mockWorkoutOrder = vi.fn()

    mockWorkoutSelect.mockReturnValue({
      eq: mockWorkoutEq,
    })

    mockWorkoutEq.mockReturnValue({
      order: mockWorkoutOrder,
    })

    mockWorkoutOrder.mockResolvedValue({
      data: mockWorkoutPlans,
      error: null,
    })

    // Mock from() per ritornare chain corretta
    mockSupabase.from
      .mockReturnValueOnce({
        select: mockExercisesSelect,
      }) // First call for exercises
      .mockReturnValueOnce({
        select: mockWorkoutSelect,
      }) // Second call for workout plans
  })

  it('should fetch workouts and exercises on mount', async () => {
    // Setup proper mocks
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [{ id: 'ex-1', name: 'Bench Press' }],
            error: null,
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockWorkoutPlans,
              error: null,
            }),
          }),
        }),
      })

    const { result } = renderHook(() => useWorkouts({ userId: 'test-user-id', role: 'pt' }))

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 3000 },
    )

    expect(mockSupabase.from).toHaveBeenCalled()
    expect(result.current.workouts).toBeDefined()
  })

  it('should handle fetch errors', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Fetch error' },
        }),
      }),
    })

    const { result } = renderHook(() => useWorkouts({ userId: 'test-user-id', role: 'pt' }))

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 3000 },
    )

    expect(result.current.error).toBeTruthy()
  })

  it('should filter workouts by athlete when role is athlete', async () => {
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockWorkoutPlans,
                error: null,
              }),
            }),
          }),
        }),
      })

    const { result } = renderHook(() => useWorkouts({ userId: 'athlete-1', role: 'atleta' }))

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 3000 },
    )

    expect(mockSupabase.from).toHaveBeenCalledWith('workout_plans')
  })

  it('should return loading state initially', async () => {
    // Mock exercises query per essere asincrona (non risolve immediatamente)
    const mockExercisesSelect = vi.fn()
    const mockExercisesOrder = vi.fn()

    mockExercisesSelect.mockReturnValue({
      order: mockExercisesOrder,
    })

    // Promise che si risolve dopo un piccolo delay per simulare fetch
    mockExercisesOrder.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: [],
              error: null,
            })
          }, 10)
        }),
    )

    mockSupabase.from.mockReturnValueOnce({
      select: mockExercisesSelect,
    })

    const { result } = renderHook(() => useWorkouts({ userId: 'test-user-id', role: 'pt' }))

    // Inizialmente loading dovrebbe essere true perché useWorkoutExercises parte con loading=true
    // e fa fetch automaticamente in useEffect
    expect(result.current.loading).toBe(true)

    // Aspetta che il fetch completi
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 1000 },
    )
  })
})
