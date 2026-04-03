'use client'

import { ClipboardCheck } from 'lucide-react'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'

const LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'

export default function NutrizionistaCheckinPage() {
  const { showLoader } = useStaffDashboardGuard('nutrizionista')

  if (showLoader) {
    return (
      <div className={LOADING_CLASS}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <StaffContentLayout
      title="Check-in"
      description="Calendario e stato check-in (funzionalità in sviluppo)."
      icon={<ClipboardCheck className="w-6 h-6" />}
      theme="teal"
    >
      <div className="rounded-xl border-2 border-teal-500/40 bg-background-secondary/50 px-3 sm:px-4 py-6 sm:py-8 text-center text-text-secondary text-sm">
        Modulo check-in e monitoraggio in costruzione.
      </div>
    </StaffContentLayout>
  )
}
