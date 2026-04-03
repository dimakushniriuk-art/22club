'use client'

import { Suspense } from 'react'
import { AllenamentiOggiPageContent } from '@/app/home/allenamenti/oggi/page'
import { EmbedAthleteAllenamentiPageSkeleton } from '@/components/layout/route-loading-skeletons'

export default function EmbedOggiPage() {
  return (
    <Suspense fallback={<EmbedAthleteAllenamentiPageSkeleton />}>
      <AllenamentiOggiPageContent />
    </Suspense>
  )
}
