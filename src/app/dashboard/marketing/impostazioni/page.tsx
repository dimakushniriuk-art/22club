'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StaffMarketingSegmentSkeleton } from '@/components/layout/route-loading-skeletons'

/** Impostazioni marketing: redirect alla pagina condivisa. */
export default function MarketingImpostazioniPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/impostazioni')
  }, [router])
  return <StaffMarketingSegmentSkeleton />
}
