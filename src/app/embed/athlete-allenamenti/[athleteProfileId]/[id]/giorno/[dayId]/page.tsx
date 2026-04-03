'use client'

import { Suspense } from 'react'
import { GiornoPreviewContent } from '@/app/home/allenamenti/[id]/giorno/[dayId]/page'
import { EmbedAthleteAllenamentiPageSkeleton } from '@/components/layout/route-loading-skeletons'

export default function EmbedGiornoPage() {
  return (
    <Suspense fallback={<EmbedAthleteAllenamentiPageSkeleton />}>
      <GiornoPreviewContent />
    </Suspense>
  )
}
