'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  // Redirect sempre a /login all'avvio - nessuna azione finché non si inseriscono credenziali
  useEffect(() => {
    router.replace('/login')
  }, [router])

  // Mostra solo loading durante redirect
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent mx-auto mb-4"></div>
        <p className="text-text-secondary text-sm">Caricamento...</p>
      </div>
    </div>
  )
}
