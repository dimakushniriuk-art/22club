'use client'

import { Suspense } from 'react'
import { SchedaAllenamentoContent } from '@/app/home/allenamenti/[id]/page'
import { EmbedAthleteAllenamentiPageSkeleton } from '@/components/layout/route-loading-skeletons'

export default function EmbedSchedaPage() {
  return (
    <Suspense fallback={<EmbedAthleteAllenamentiPageSkeleton />}>
      <SchedaAllenamentoContent />
    </Suspense>
  )
}
