'use client'

/**
 * Skeleton di caricamento per la pagina Profilo dashboard.
 * Riutilizzabile e modificabile in un solo punto.
 */
export function ProfiloPageSkeleton() {
  return (
    <div className="min-h-screen bg-black p-6">
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="bg-background-tertiary h-32 rounded-lg" />
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-background-tertiary h-24 rounded-lg" />
            <div className="bg-background-tertiary h-24 rounded-lg" />
            <div className="bg-background-tertiary h-24 rounded-lg" />
          </div>
          <div className="bg-background-tertiary h-64 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
