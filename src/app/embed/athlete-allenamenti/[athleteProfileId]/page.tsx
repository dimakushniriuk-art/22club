'use client'

import { Suspense } from 'react'
import { AllenamentiHomePageContent } from '@/app/home/allenamenti/page'
import { EmbedAthleteAllenamentiPageSkeleton } from '@/components/layout/route-loading-skeletons'

export default function EmbedAthleteAllenamentiHomePage() {
  return (
    <Suspense fallback={<EmbedAthleteAllenamentiPageSkeleton />}>
      <AllenamentiHomePageContent />
    </Suspense>
  )
}
