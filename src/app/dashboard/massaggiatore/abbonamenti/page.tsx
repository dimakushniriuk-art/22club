'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { StaffDashboardGuardSkeleton } from '@/components/layout/route-loading-skeletons'

export default function MassaggiatoreAbbonamentiPage() {
  const router = useRouter()
  const { showLoader } = useStaffDashboardGuard('massaggiatore')

  useEffect(() => {
    if (showLoader) return
    router.replace('/dashboard/abbonamenti?service=massage')
  }, [router, showLoader])

  return <StaffDashboardGuardSkeleton />
}
