'use client'

import { Suspense } from 'react'
import { SchedaAllenamentoContent } from '@/app/home/allenamenti/[id]/page'
import { EmbedAthleteAllenamentiPageSkeleton } from '@/components/layout/route-loading-skeletons'

export default function EmbedSchedaPage({
  params,
}: {
  params: Promise<{ athleteProfileId: string; id: string }>
}) {
  return (
    <Suspense fallback={<EmbedAthleteAllenamentiPageSkeleton />}>
      <SchedaAllenamentoContent routeParams={params} />
    </Suspense>
  )
}
