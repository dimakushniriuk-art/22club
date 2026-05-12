'use client'

import type { LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  MessageSquare,
  BarChart3,
  ClipboardList,
  CreditCard,
  Settings,
  Users,
} from 'lucide-react'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { useNutrizionistaDashboardStats } from '@/hooks/use-nutrizionista-dashboard-stats'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui'
import { StaffDashboardGuardSkeleton } from '@/components/layout/route-loading-skeletons'
import { AgendaClient } from '@/app/dashboard/_components/agenda-client'
import {
  DashboardColumnEmpty,
  DashboardColumnFooterLink,
  DashboardColumnListSkeleton,
  DashboardColumnPanel,
} from '@/app/dashboard/_components/dashboard-widget-columns'
import { NewAppointmentButton } from '@/app/dashboard/_components/new-appointment-button'
import { useStaffTodayAgenda } from '@/hooks/use-staff-today-agenda'
import { cn } from '@/lib/utils'
import { isNutritionAgendaEvent } from '@/lib/dashboard/staff-agenda-event-filters'
import { NutrizionistaDashboardWidgetColumns } from './nutrizionista-dashboard-widget-columns'

const QUICK_ACTION_CARD_CLASS =
  'group flex min-h-[64px] flex-col items-center justify-center rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-2.5 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-all hover:border-white/18 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.99] sm:min-h-[72px] sm:p-3'

type QuickActionLink = {
  href: string
  icon: LucideIcon
  label: string
  iconBoxClass: string
}
type QuickActionAppointment = { href: null; iconBoxClass: string }
type QuickActionItem = QuickActionLink | QuickActionAppointment

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    href: '/dashboard/nutrizionista/calendario',
    icon: CalendarDays,
    label: 'Calendario',
    iconBoxClass: 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400',
  },
  {
    href: '/dashboard/nutrizionista/atleti',
    icon: Users,
    label: 'Atleti',
    iconBoxClass: 'border-orange-500/30 bg-orange-500/20 text-orange-300',
  },
  {
    href: '/dashboard/nutrizionista/chat',
    icon: MessageSquare,
    label: 'Chat',
    iconBoxClass: 'border-purple-500/30 bg-purple-500/20 text-purple-400',
  },
  {
    href: '/dashboard/nutrizionista/analisi',
    icon: BarChart3,
    label: 'Analisi',
    iconBoxClass: 'border-blue-500/30 bg-blue-500/20 text-blue-400',
  },
  {
    href: '/dashboard/nutrizionista/piani',
    icon: ClipboardList,
    label: 'Piani',
    iconBoxClass: 'border-sky-500/30 bg-sky-500/20 text-sky-300',
  },
  {
    href: null,
    iconBoxClass: 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400',
  },
  {
    href: '/dashboard/nutrizionista/abbonamenti',
    icon: CreditCard,
    label: 'Abbonamenti',
    iconBoxClass: 'border-lime-500/30 bg-lime-500/20 text-lime-300',
  },
  {
    href: '/dashboard/nutrizionista/impostazioni',
    icon: Settings,
    label: 'Impostazioni',
    iconBoxClass: 'border-zinc-500/30 bg-zinc-500/20 text-zinc-300',
  },
]

export function NutrizionistaDashboardPageContent() {
  const { showLoader } = useStaffDashboardGuard('nutrizionista')
  const { user } = useAuth()
  const [deferSecondaryData, setDeferSecondaryData] = useState(false)
  const {
    events: agendaEvents,
    loading: agendaLoading,
    loadError: agendaLoadError,
    reload: reloadAgenda,
    lessonsLoading,
    lessonsLoadError,
  } = useStaffTodayAgenda()
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    reload: reloadStats,
  } = useNutrizionistaDashboardStats(user?.id, deferSecondaryData)

  useEffect(() => {
    if (!user?.id) {
      setDeferSecondaryData(false)
      return
    }
    const idleId =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(() => setDeferSecondaryData(true))
        : undefined
    const timeoutId =
      idleId === undefined ? window.setTimeout(() => setDeferSecondaryData(true), 0) : undefined
    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [user?.id])

  const nutritionAgendaEvents = useMemo(
    () => agendaEvents.filter((e) => isNutritionAgendaEvent(e.description)),
    [agendaEvents],
  )

  if (showLoader) {
    return <StaffDashboardGuardSkeleton />
  }

  const summaryForWidgets = {
    atletiSeguiti: stats.atletiSeguiti,
    visiteCompletate: stats.visiteCompletate,
    visiteTotali: stats.visiteTotali,
    fattureEmesse: stats.fattureEmesse,
    appuntamentiSettimana: stats.appuntamentiSettimana,
  }

  return (
    <StaffContentLayout
      title="Dashboard"
      description="Scorciatoie operative, agenda di oggi e riepilogo attività."
      theme="teal"
      className="overflow-y-auto min-h-0"
    >
      {statsError && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2.5 sm:px-4 sm:py-3 text-red-200 text-sm flex items-center justify-between flex-wrap gap-2">
          <span>{statsError}</span>
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] touch-manipulation shrink-0"
            onClick={() => void reloadStats()}
          >
            Riprova
          </Button>
        </div>
      )}

      <section className="shrink-0" aria-label="Azioni rapide" aria-busy={agendaLoading}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-3">
          {QUICK_ACTIONS.map((item) => {
            if (item.href) {
              const linkItem = item as QuickActionLink
              const Icon = linkItem.icon
              return (
                <Link
                  key={linkItem.href}
                  href={linkItem.href}
                  prefetch
                  aria-label={linkItem.label}
                  className={QUICK_ACTION_CARD_CLASS}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                      linkItem.iconBoxClass,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="mt-1.5 block text-[10px] font-semibold leading-tight text-text-primary sm:mt-2 sm:text-[11px]">
                    {linkItem.label}
                  </span>
                </Link>
              )
            }
            return (
              <NewAppointmentButton
                key="appointment"
                iconBoxClass={item.iconBoxClass}
                calendarioHref="/dashboard/nutrizionista/calendario?new=true"
              />
            )
          })}
        </div>
      </section>

      <section
        className="grid flex-1 min-h-0 grid-cols-1 items-stretch gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-4"
        aria-label="Area principale dashboard"
      >
        <div
          className="flex min-h-0 min-w-0 flex-col lg:min-h-[min(52vh,440px)] lg:min-w-0"
          aria-label="Agenda di oggi"
        >
          <DashboardColumnPanel
            title="Agenda di oggi"
            badge={
              !agendaLoading && agendaLoadError == null && nutritionAgendaEvents.length > 0
                ? nutritionAgendaEvents.length
                : undefined
            }
            footer={
              <DashboardColumnFooterLink href="/dashboard/nutrizionista/calendario">
                Vai al calendario
              </DashboardColumnFooterLink>
            }
          >
            {agendaLoading ? (
              <DashboardColumnListSkeleton />
            ) : agendaLoadError ? (
              <DashboardColumnEmpty>
                <p>{agendaLoadError}</p>
                <Button variant="primary" size="sm" onClick={() => void reloadAgenda()}>
                  Riprova
                </Button>
              </DashboardColumnEmpty>
            ) : nutritionAgendaEvents.length === 0 ? (
              <DashboardColumnEmpty>
                <p className="text-text-primary/90">
                  Nessun appuntamento nutrizione in agenda per oggi.
                </p>
                <Button variant="primary" size="sm" asChild>
                  <Link href="/dashboard/nutrizionista/calendario" prefetch>
                    Apri calendario
                  </Link>
                </Button>
              </DashboardColumnEmpty>
            ) : (
              <AgendaClient
                initialEvents={nutritionAgendaEvents}
                lessonsLoading={lessonsLoading}
                lessonsLoadError={lessonsLoadError}
                embedded
              />
            )}
          </DashboardColumnPanel>
        </div>
        <NutrizionistaDashboardWidgetColumns
          upcoming={stats.prossimiAppuntamenti}
          stats={summaryForWidgets}
          statsLoading={!deferSecondaryData || statsLoading}
          secondaryEnabled={deferSecondaryData}
        />
      </section>
    </StaffContentLayout>
  )
}
