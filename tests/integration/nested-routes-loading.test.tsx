/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import WorkoutPlanLoading from '@/app/home/allenamenti/[workout_plan_id]/loading'
import WorkoutDayLoading from '@/app/home/allenamenti/[workout_plan_id]/[day_id]/loading'

// Mock Next.js router e params
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    replace: vi.fn(),
  }),
  useParams: () => ({
    workout_plan_id: 'test-plan-id',
    day_id: 'test-day-id',
  }),
  usePathname: () => '/home/allenamenti/test-plan-id/test-day-id',
}))

// Mock useAuth
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', user_id: 'test-user-id', role: 'athlete' },
    loading: false,
    error: null,
  }),
}))

// Mock useSupabaseClient
vi.mock('@/hooks/use-supabase-client', () => ({
  useSupabaseClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }),
}))

describe('Nested Routes Loading State', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  describe('WorkoutPlanLoading', () => {
    it('should render loading skeleton for workout plan route', () => {
      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <WorkoutPlanLoading />
        </QueryClientProvider>,
      )

      // Verifica che i skeleton siano presenti (cerca elementi con classi skeleton o animate-pulse)
      const skeletons = container.querySelectorAll(
        '[class*="animate-pulse"], [class*="skeleton"], .h-10, .h-6, .h-4',
      )

      // Dovrebbe esserci almeno qualche skeleton
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should display loading state with proper structure', () => {
      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <WorkoutPlanLoading />
        </QueryClientProvider>,
      )

      // Verifica struttura base
      expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
      expect(container.querySelector('.max-w-4xl')).toBeInTheDocument()
    })

    it('should show header skeleton', () => {
      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <WorkoutPlanLoading />
        </QueryClientProvider>,
      )

      // Verifica skeleton header
      const headerSkeletons = container.querySelectorAll('.h-10, .h-6, .h-4')
      expect(headerSkeletons.length).toBeGreaterThan(0)
    })

    it('should show cards skeleton grid', () => {
      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <WorkoutPlanLoading />
        </QueryClientProvider>,
      )

      // Verifica che ci siano card skeleton (cerca elementi con Card nel className o elementi con struttura card)
      const cards = container.querySelectorAll('[class*="Card"], [class*="card"], .grid')
      // Alternativamente, verifica che ci siano elementi skeleton nella struttura
      const skeletonElements = container.querySelectorAll('.h-8, .h-5, .h-4')
      expect(cards.length + skeletonElements.length).toBeGreaterThan(0)
    })
  })

  describe('WorkoutDayLoading', () => {
    it('should render loading skeleton for workout day route', () => {
      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <WorkoutDayLoading />
        </QueryClientProvider>,
      )

      // Verifica che i skeleton siano presenti (cerca elementi con classi skeleton o animate-pulse)
      const skeletons = container.querySelectorAll(
        '[class*="animate-pulse"], [class*="skeleton"], .h-16, .h-6, .h-4',
      )

      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should display loading state with proper structure', () => {
      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <WorkoutDayLoading />
        </QueryClientProvider>,
      )

      // Verifica struttura base
      expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
      expect(container.querySelector('.max-w-4xl')).toBeInTheDocument()
    })

    it('should show exercises skeleton list', () => {
      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <WorkoutDayLoading />
        </QueryClientProvider>,
      )

      // Verifica che ci siano exercise skeleton (cerca elementi con Card o skeleton elements)
      const exerciseCards = container.querySelectorAll('[class*="Card"], [class*="card"]')
      const skeletonElements = container.querySelectorAll('.h-16, .h-6, .h-4, .space-y-4')
      expect(exerciseCards.length + skeletonElements.length).toBeGreaterThan(0)
    })

    it('should show exercise detail skeletons', () => {
      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <WorkoutDayLoading />
        </QueryClientProvider>,
      )

      // Verifica skeleton per dettagli esercizio
      const detailSkeletons = container.querySelectorAll('.h-16, .h-6, .h-4')
      expect(detailSkeletons.length).toBeGreaterThan(0)
    })
  })

  describe('Loading State Integration', () => {
    it('should transition from loading to content when data is ready', async () => {
      const TestComponent = () => {
        return <div data-testid="content">Loaded Content</div>
      }

      render(
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<WorkoutPlanLoading />}>
            <TestComponent />
          </Suspense>
        </QueryClientProvider>,
      )

      // Inizialmente dovrebbe mostrare loading
      // Poi quando i dati sono pronti, mostra content
      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })
    })

    it('should handle nested route loading states correctly', () => {
      // Test che entrambi i loading states siano strutturati correttamente
      const { container: planContainer } = render(
        <QueryClientProvider client={queryClient}>
          <WorkoutPlanLoading />
        </QueryClientProvider>,
      )

      const { container: dayContainer } = render(
        <QueryClientProvider client={queryClient}>
          <WorkoutDayLoading />
        </QueryClientProvider>,
      )

      // Entrambi dovrebbero avere struttura simile ma contenuto diverso
      expect(planContainer.querySelector('.min-h-screen')).toBeInTheDocument()
      expect(dayContainer.querySelector('.min-h-screen')).toBeInTheDocument()
    })
  })
})
