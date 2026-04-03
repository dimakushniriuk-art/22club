'use client'

import { Suspense } from 'react'
import { EsercizioDetailPageContent } from '@/app/home/allenamenti/esercizio/[exerciseId]/page'
import { EmbedAthleteAllenamentiPageSkeleton } from '@/components/layout/route-loading-skeletons'

export default function EmbedEsercizioPage() {
  return (
    <Suspense fallback={<EmbedAthleteAllenamentiPageSkeleton />}>
      <EsercizioDetailPageContent />
    </Suspense>
  )
}
