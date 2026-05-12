'use client'

import { Suspense } from 'react'
import { SchedaAllenamentoContent } from '@/features/athlete-allenamenti'

export { SchedaAllenamentoContent } from '@/features/athlete-allenamenti'

export default function SchedaAllenamentoPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <SchedaAllenamentoContent routeParams={params} />
    </Suspense>
  )
}
