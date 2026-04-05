'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'

const LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'

export default function NutrizionistaCheckinDetailPage() {
  const params = useParams()
  const id = params?.id as string | undefined
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
      title="Dettaglio check-in"
      description="Dettaglio giornata, questionario e misure (in sviluppo)."
      theme="teal"
      actions={
        <Link
          href="/dashboard/nutrizionista/checkin"
          className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Lista check-in
        </Link>
      }
    >
      <div className="rounded-xl border-2 border-teal-500/40 bg-background-secondary/50 px-3 sm:px-4 py-6 sm:py-8 text-center text-text-secondary text-sm">
        Check-in (id: {id ?? '—'}) in costruzione.
      </div>
    </StaffContentLayout>
  )
}
