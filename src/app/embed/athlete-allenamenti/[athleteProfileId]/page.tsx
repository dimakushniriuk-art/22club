'use client'

import { Suspense } from 'react'
import { AllenamentiHomePageContent } from '@/features/athlete-allenamenti'
import { EmbedAthleteAllenamentiPageSkeleton } from '@/components/layout/route-loading-skeletons'

export default function EmbedAthleteAllenamentiHomePage() {
  return (
    <Suspense fallback={<EmbedAthleteAllenamentiPageSkeleton />}>
      <AllenamentiHomePageContent />
    </Suspense>
  )
}
