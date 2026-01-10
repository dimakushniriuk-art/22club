import { Card, CardContent } from '@/components/ui'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading state per route dinamiche workout plan
 * Mostrato durante il caricamento della pagina
 */
export default function WorkoutPlanLoading() {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header skeleton */}
        <div className="mb-6 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Title skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Cards skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              className="border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-transparent"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-5 flex-1" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
