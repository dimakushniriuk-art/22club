'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'

const LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'

export default function NutrizionistaAbbonamentiPage() {
  const router = useRouter()
  const { showLoader } = useStaffDashboardGuard('nutrizionista')

  useEffect(() => {
    if (showLoader) return
    router.replace('/dashboard/abbonamenti?service=nutrition')
  }, [router, showLoader])

  if (showLoader) {
    return (
      <div className={LOADING_CLASS}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className={LOADING_CLASS}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}
