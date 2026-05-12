'use client'

import { Suspense } from 'react'
import { GiornoPreviewContent } from '@/features/athlete-allenamenti'

export { GiornoPreviewContent } from '@/features/athlete-allenamenti'

export default function GiornoPreviewPage({
  params,
}: {
  params: Promise<{ id: string; dayId: string }>
}) {
  return (
    <Suspense fallback={null}>
      <GiornoPreviewContent routeParams={params} />
    </Suspense>
  )
}
