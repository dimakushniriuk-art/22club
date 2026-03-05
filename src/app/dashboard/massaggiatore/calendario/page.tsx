'use client'

import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { CalendarPageContent } from '@/app/dashboard/calendario/page'

const LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'

export default function MassaggiatoreCalendarioPage() {
  const { showLoader } = useStaffDashboardGuard('massaggiatore')

  if (showLoader) {
    return (
      <div className={LOADING_CLASS}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  return <CalendarPageContent basePath="/dashboard/massaggiatore/calendario" />
}
