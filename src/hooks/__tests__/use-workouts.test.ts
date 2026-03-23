import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useWorkouts } from '../use-workouts'

const { mockSupabase } = vi.hoisted(() => ({
  mockSupabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}))

vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => mockSupabase),
  supabase: mockSupabase,
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
  supabase: mockSupabase,
  handleRefreshTokenError: vi.fn(() => false),
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

    const { result } = renderHook(() => useWorkouts({ userId: 'test-user-id', role: 'trainer' }))

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

    const { result } = renderHook(() => useWorkouts({ userId: 'test-user-id', role: 'trainer' }))

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

    const { result } = renderHook(() => useWorkouts({ userId: 'athlete-1', role: 'athlete' }))

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 3000 },
    )

    expect(mockSupabase.from).toHaveBeenCalledWith('workout_plans')
  })

  it('should reach non-loading state after fetch', async () => {
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
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      })

    const { result } = renderHook(() => useWorkouts({ userId: 'test-user-id', role: 'trainer' }))

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 2000 },
    )
    expect(result.current.workouts).toBeDefined()
  })
})
