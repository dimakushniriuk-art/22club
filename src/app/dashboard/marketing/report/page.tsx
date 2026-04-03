'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { FileText } from 'lucide-react'
import { StaffMarketingSegmentSkeleton } from '@/components/layout/route-loading-skeletons'

export default function MarketingReportPage() {
  const router = useRouter()
  const { role, loading } = useAuth()

  useEffect(() => {
    if (loading || (role !== null && role !== 'marketing' && role !== 'admin')) {
      if (!loading && role !== null && role !== 'marketing' && role !== 'admin') {
        router.replace((role as string) === 'admin' ? '/dashboard/admin' : '/dashboard')
      }
    }
  }, [loading, role, router])

  if (loading || (role !== null && role !== 'marketing' && role !== 'admin')) {
    return <StaffMarketingSegmentSkeleton />
  }

  return (
    <div className="p-4 min-[834px]:p-6 space-y-6 bg-background text-text-primary">
      <header>
        <h1 className="text-xl min-[834px]:text-2xl font-bold flex items-center gap-2">
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
