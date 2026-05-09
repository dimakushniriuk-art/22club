'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { MiniCalendar } from '@/components/calendar'
import type { AppointmentTable } from '@/types/appointment'
import {
  DashboardColumnFooterLink,
  DashboardColumnPanel,
} from '@/app/dashboard/_components/dashboard-widget-columns'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const PREVIEW_LINK_CLASS = cn(
  'group/dashboard-cal relative flex min-h-0 flex-1 flex-col items-center justify-start overflow-hidden rounded-xl border border-white/8 bg-white/[0.02] py-2',
  'transition-colors duration-200 hover:border-white/16 hover:bg-white/[0.04]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
)

export function DashboardCalendarColumnSkeleton() {
  return (
    <DashboardColumnPanel title="Calendario" badgePlaceholder>
      <div className="mx-auto w-[220px] space-y-2 py-1">
        <div className="flex items-center justify-between px-1">
          <Skeleton className="h-4 w-32 rounded" />
          <div className="flex gap-0.5">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={`h-${i}`} className="mx-auto h-7 w-7 rounded" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: 42 }, (_, i) => (
            <Skeleton key={i} className="mx-auto h-7 w-7 rounded-full" />
          ))}
        </div>
      </div>
    </DashboardColumnPanel>
  )
}

type DashboardCalendarColumnProps = {
  appointments: AppointmentTable[]
  appointmentsLoading: boolean
}

/**
 * Anteprima menu Calendario: mini griglia statica; il blocco intero porta alla pagina calendario.
 */
export function DashboardCalendarColumn({
  appointments,
  appointmentsLoading,
}: DashboardCalendarColumnProps) {
  const appointmentDates = useMemo(() => appointments.map((a) => a.starts_at), [appointments])

  return (
    <DashboardColumnPanel
      title="Calendario"
      footer={
        <DashboardColumnFooterLink href="/dashboard/calendario">
          Apri calendario completo
        </DashboardColumnFooterLink>
      }
    >
      {appointmentsLoading ? (
        <div className="flex min-h-[min(52vh,440px)] flex-1 items-start justify-center py-2">
          <div className="mx-auto w-[220px] space-y-2">
            <div className="flex items-center justify-between px-1">
              <Skeleton className="h-4 w-32 rounded" />
              <div className="flex gap-0.5">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: 7 }, (_, i) => (
                <Skeleton key={`h-${i}`} className="mx-auto h-7 w-7 rounded" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: 42 }, (_, i) => (
                <Skeleton key={i} className="mx-auto h-7 w-7 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Link
          href="/dashboard/calendario"
          prefetch
          className={PREVIEW_LINK_CLASS}
          aria-label="Apri il calendario staff"
        >
          <span className="sr-only">Apri il calendario staff</span>
          <MiniCalendar
            interactive={false}
            selectedDate={new Date()}
            appointmentDates={appointmentDates}
          />
        </Link>
      )}
    </DashboardColumnPanel>
  )
}
