'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Impostazioni marketing: redirect alla pagina condivisa. */
export default function MarketingImpostazioniPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/impostazioni')
  }, [router])
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}
