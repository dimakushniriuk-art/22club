'use client'

import { Suspense } from 'react'
import { AllenamentiOggiPageContent } from '@/features/live-workout-session'

export { AllenamentiOggiPageContent } from '@/features/live-workout-session'

export default function AllenamentiOggiPage() {
  return (
    <Suspense fallback={null}>
      <AllenamentiOggiPageContent />
    </Suspense>
  )
}
