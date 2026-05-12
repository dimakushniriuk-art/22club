'use client'

import { Suspense } from 'react'
import { RiepilogoPageContent } from '@/features/athlete-allenamenti'

export { RiepilogoPageContent } from '@/features/athlete-allenamenti'

export default function RiepilogoPage() {
  return (
    <Suspense fallback={null}>
      <RiepilogoPageContent />
    </Suspense>
  )
}
