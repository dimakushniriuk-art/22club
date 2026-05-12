'use client'

import { Suspense } from 'react'
import { WelcomePageContent, WelcomePageFallback } from '@/features/welcome-onboarding'

export { WelcomePageContent, WelcomePageFallback } from '@/features/welcome-onboarding'

export default function WelcomePage() {
  return (
    <Suspense fallback={<WelcomePageFallback />}>
      <WelcomePageContent />
    </Suspense>
  )
}
