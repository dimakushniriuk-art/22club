'use client'

import { Suspense } from 'react'
import { GiornoPreviewContent } from '@/features/athlete-allenamenti'
import { EmbedAthleteAllenamentiPageSkeleton } from '@/components/layout/route-loading-skeletons'

export default function EmbedGiornoPage({
  params,
}: {
  params: Promise<{ athleteProfileId: string; id: string; dayId: string }>
}) {
  return (
    <Suspense fallback={<EmbedAthleteAllenamentiPageSkeleton />}>
      <GiornoPreviewContent routeParams={params} />
    </Suspense>
  )
}
