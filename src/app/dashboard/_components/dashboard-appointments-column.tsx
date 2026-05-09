'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useStaffAppointmentsTable } from '@/hooks/appointments/useStaffAppointmentsTable'
import {
  DashboardColumnFooterLink,
  DashboardColumnPanel,
  DASHBOARD_LIST_SCROLL_CLASS,
} from '@/app/dashboard/_components/dashboard-widget-columns'
import { SkeletonAppointmentsList } from '@/components/shared/ui/skeleton'
import { DashboardAppointmentsPreview } from '@/app/dashboard/_components/dashboard-appointments-preview'
import { cn } from '@/lib/utils'

export type StaffAppointmentsTableApi = ReturnType<typeof useStaffAppointmentsTable>

const PREVIEW_LINK_CLASS = cn(
  'group/dashboard-appts relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]',
  'transition-colors duration-200 hover:border-white/16 hover:bg-white/[0.04]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
)

/**
 * Anteprima menu Appuntamenti: contenuto statico, il blocco intero porta alla pagina elenco.
 */
export function DashboardAppointmentsColumn({
  appointmentsApi,
}: {
  appointmentsApi: StaffAppointmentsTableApi
}) {
  const { appointments, appointmentsLoading } = appointmentsApi

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    )
  }, [appointments])

  return (
    <DashboardColumnPanel
      title="Appuntamenti"
      badge={
        !appointmentsLoading && sortedAppointments.length > 0
          ? sortedAppointments.length
          : undefined
      }
      badgePlaceholder={appointmentsLoading}
      footer={
        <DashboardColumnFooterLink href="/dashboard/appuntamenti">
          Vedi tutti gli appuntamenti
        </DashboardColumnFooterLink>
      }
    >
      {appointmentsLoading ? (
        <div className={DASHBOARD_LIST_SCROLL_CLASS}>
          <SkeletonAppointmentsList rows={6} className="py-2" />
        </div>
      ) : (
        <Link
          href="/dashboard/appuntamenti"
          prefetch
          className={PREVIEW_LINK_CLASS}
          aria-label="Apri la pagina Appuntamenti"
        >
          <span className="sr-only">Apri la pagina Appuntamenti</span>
          <div className={cn(DASHBOARD_LIST_SCROLL_CLASS, 'px-0.5 pt-1')}>
            <DashboardAppointmentsPreview appointments={sortedAppointments} />
          </div>
        </Link>
      )}
    </DashboardColumnPanel>
  )
}
