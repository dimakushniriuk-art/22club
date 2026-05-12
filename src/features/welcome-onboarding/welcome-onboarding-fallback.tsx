'use client'

import { Loader2 } from 'lucide-react'

export function WelcomePageFallback() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-3 text-sm text-text-secondary">Caricamento...</p>
    </div>
  )
}
