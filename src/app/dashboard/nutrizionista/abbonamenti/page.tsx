'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { StaffDashboardGuardSkeleton } from '@/components/layout/route-loading-skeletons'

export default function NutrizionistaAbbonamentiPage() {
  const router = useRouter()
  const { showLoader } = useStaffDashboardGuard('nutrizionista')

  useEffect(() => {
    if (showLoader) return
    router.replace('/dashboard/abbonamenti?service=nutrition')
  }, [router, showLoader])

  return <StaffDashboardGuardSkeleton />
}
