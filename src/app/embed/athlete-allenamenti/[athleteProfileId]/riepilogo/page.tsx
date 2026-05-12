'use client'

import { Suspense } from 'react'
import { RiepilogoPageContent } from '@/features/athlete-allenamenti'
import { EmbedAthleteAllenamentiPageSkeleton } from '@/components/layout/route-loading-skeletons'

export default function EmbedRiepilogoPage() {
  return (
    <Suspense fallback={<EmbedAthleteAllenamentiPageSkeleton />}>
      <RiepilogoPageContent />
    </Suspense>
  )
}
