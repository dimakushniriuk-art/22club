'use client'

import { Suspense } from 'react'
import { AllenamentiHomePageContent } from '@/features/athlete-allenamenti'

export { AllenamentiHomePageContent } from '@/features/athlete-allenamenti'

export default function AllenamentiHomePage() {
  return (
    <Suspense fallback={null}>
      <AllenamentiHomePageContent />
    </Suspense>
  )
}
