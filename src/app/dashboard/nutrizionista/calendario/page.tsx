'use client'

import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { StaffDashboardGuardSkeleton } from '@/components/layout/route-loading-skeletons'
import { CalendarPageContent } from '@/app/dashboard/calendario/page'

export default function NutrizionistaCalendarioPage() {
  const { showLoader } = useStaffDashboardGuard('nutrizionista')

  if (showLoader) {
    return <StaffDashboardGuardSkeleton />
  }

  return <CalendarPageContent basePath="/dashboard/nutrizionista/calendario" />
}
