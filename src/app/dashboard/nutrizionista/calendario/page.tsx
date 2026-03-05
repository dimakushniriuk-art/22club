'use client'

import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { CalendarPageContent } from '@/app/dashboard/calendario/page'

const LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'

export default function NutrizionistaCalendarioPage() {
  const { showLoader } = useStaffDashboardGuard('nutrizionista')

  if (showLoader) {
    return (
      <div className={LOADING_CLASS}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return <CalendarPageContent basePath="/dashboard/nutrizionista/calendario" />
}
