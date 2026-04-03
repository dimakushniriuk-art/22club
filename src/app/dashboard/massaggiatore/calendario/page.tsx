'use client'

import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { CalendarPageContent } from '@/app/dashboard/calendario/page'
import { StaffDashboardGuardSkeleton } from '@/components/layout/route-loading-skeletons'

export default function MassaggiatoreCalendarioPage() {
  const { showLoader } = useStaffDashboardGuard('massaggiatore')

  if (showLoader) {
    return <StaffDashboardGuardSkeleton />
  }

  return <CalendarPageContent basePath="/dashboard/massaggiatore/calendario" />
}
