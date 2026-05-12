'use client'

import { FileText } from 'lucide-react'
import { useMarketingDashboardGuard } from '@/hooks/use-marketing-dashboard-guard'
import { StaffMarketingSegmentSkeleton } from '@/components/layout/route-loading-skeletons'

export function MarketingReportPageContent() {
  const { showLoader } = useMarketingDashboardGuard()

  if (showLoader) {
    return <StaffMarketingSegmentSkeleton />
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-background text-text-primary">
      <header>
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-cyan-400" />
          Report
        </h1>
        <p className="text-text-secondary text-sm mt-1">Report e export. Modulo in preparazione.</p>
      </header>
      <div className="rounded-xl border border-border bg-background-secondary/50 p-8 text-center text-text-secondary text-sm">
        Sezione Report in arrivo. Qui potrai generare report e export sui KPI e lead.
      </div>
    </div>
  )
}
