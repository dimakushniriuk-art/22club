'use client'

import { Suspense } from 'react'
import { EsercizioDetailPageContent } from '@/app/home/allenamenti/esercizio/[exerciseId]/page'
import { EmbedAthleteAllenamentiPageSkeleton } from '@/components/layout/route-loading-skeletons'

export default function EmbedEsercizioPage({
  params,
}: {
  params: Promise<{ athleteProfileId: string; exerciseId: string }>
}) {
  return (
    <Suspense fallback={<EmbedAthleteAllenamentiPageSkeleton />}>
      <EsercizioDetailPageContent routeParams={params} />
    </Suspense>
  )
}
