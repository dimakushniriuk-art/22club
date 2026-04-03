'use client'

import { Suspense } from 'react'
import { RiepilogoPageContent } from '@/app/home/allenamenti/riepilogo/page'
import { EmbedAthleteAllenamentiPageSkeleton } from '@/components/layout/route-loading-skeletons'

export default function EmbedRiepilogoPage() {
  return (
    <Suspense fallback={<EmbedAthleteAllenamentiPageSkeleton />}>
      <RiepilogoPageContent />
    </Suspense>
  )
}
