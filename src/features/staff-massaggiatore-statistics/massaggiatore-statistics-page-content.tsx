'use client'

import Link from 'next/link'
import {
  Hand,
  Users,
  CalendarCheck,
  FileText,
  ArrowRight,
  Calendar,
  MessageSquare,
} from 'lucide-react'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { useMassaggiatoreDashboardStats } from '@/hooks/use-massaggiatore-dashboard-stats'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui'
import {
  StaffDashboardGuardSkeleton,
  StaffStaffPageContentSkeleton,
} from '@/components/layout/route-loading-skeletons'

function KpiCard({
  label,
  value,
  icon: Icon,
  href,
  sublabel,
}: {
  label: string
  value: number
  icon: React.ElementType
  href?: string
  sublabel?: string
}) {
  const cardClass =
    'rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-3 sm:p-5 text-left min-w-0 min-h-[44px] transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] ring-1 ring-inset ring-white/[0.03] hover:border-white/18'
  const content = (
    <div className={cardClass}>
      <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
        <Icon className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
        {label}
      </div>
      <p className="text-xl font-bold text-text-primary tabular-nums">{value}</p>
      {sublabel != null && <p className="text-xs text-text-muted mt-0.5">{sublabel}</p>}
    </div>
  )
  if (href) {
    return (
      <Link
        href={href}
        className="block touch-manipulation focus-visible:ring-2 focus-visible:ring-cyan-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-xl"
      >
        {content}
      </Link>
    )
  }
  return content
}

export function MassaggiatoreStatisticsPageContent() {
  const { showLoader } = useStaffDashboardGuard('massaggiatore')
  const { user } = useAuth()
  const { stats, loading, error, reload } = useMassaggiatoreDashboardStats(user?.id)

  if (showLoader) {
    return <StaffDashboardGuardSkeleton />
  }

  return (
    <StaffContentLayout
      title="Statistiche"
      description="Clienti, trattamenti eseguiti, fatturazione e appuntamenti."
      theme="teal"
    >
      {error && (
        <div className="rounded-xl border-2 border-red-500/40 bg-red-500/10 px-3 py-2.5 sm:px-4 sm:py-3 text-red-200 text-sm flex items-center justify-between flex-wrap gap-2">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] touch-manipulation shrink-0"
            onClick={() => void reload()}
          >
            Riprova
          </Button>
        </div>
      )}

      {loading && !error && <StaffStaffPageContentSkeleton />}

      {!loading && !error && (
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <KpiCard
              label="Clienti seguiti"
              value={stats.clientiSeguiti}
              icon={Users}
              href="/dashboard/massaggiatore/clienti"
            />
            <KpiCard
              label="Massaggi eseguiti"
              value={stats.massaggiEseguiti}
              icon={Hand}
              sublabel={`di ${stats.massaggiTotali} totali`}
            />
            <KpiCard
              label="Fatture emesse"
              value={stats.fattureEmesse}
              icon={FileText}
              href="/dashboard/massaggiatore/abbonamenti"
            />
            <KpiCard
              label="Oggi"
              value={stats.appuntamentiOggi}
              icon={CalendarCheck}
              sublabel="appuntamenti"
              href="/dashboard/massaggiatore/appuntamenti"
            />
            <KpiCard
              label="Prossimi 7 giorni"
              value={stats.appuntamentiSettimana}
              icon={Calendar}
              sublabel="appuntamenti"
              href="/dashboard/massaggiatore/calendario"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 px-3 sm:px-4 py-4 sm:py-5 space-y-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] ring-1 ring-inset ring-white/[0.03]">
            <h3 className="font-semibold text-text-primary">Azioni rapide</h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/massaggiatore/calendario"
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-white/[0.08] bg-white/[0.04] text-cyan-400 hover:border-white/15 hover:bg-white/[0.07] hover:text-cyan-300 transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                <Calendar className="h-4 w-4" />
                Calendario
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/massaggiatore/appuntamenti"
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-white/[0.08] bg-white/[0.04] text-cyan-400 hover:border-white/15 hover:bg-white/[0.07] hover:text-cyan-300 transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                <CalendarCheck className="h-4 w-4" />
                Appuntamenti
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/massaggiatore/chat"
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-white/[0.08] bg-white/[0.04] text-cyan-400 hover:border-white/15 hover:bg-white/[0.07] hover:text-cyan-300 transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                <MessageSquare className="h-4 w-4" />
                Chat
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </StaffContentLayout>
  )
}
