'use client'

import { Suspense } from 'react'
import { AllenamentiOggiPageContent } from '@/features/live-workout-session'
import { EmbedAthleteAllenamentiPageSkeleton } from '@/components/layout/route-loading-skeletons'

export default function EmbedOggiPage() {
  return (
    <Suspense fallback={<EmbedAthleteAllenamentiPageSkeleton />}>
      <AllenamentiOggiPageContent />
    </Suspense>
  )
}
