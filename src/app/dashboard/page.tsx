'use client'

import { AgendaClient } from './_components/agenda-client'
import {
  DashboardColumnEmpty,
  DashboardColumnFooterLink,
  DashboardColumnListSkeleton,
  DashboardColumnPanel,
  DashboardWidgetColumns,
} from './_components/dashboard-widget-columns'
import { DashboardLayoutSettingsDialog } from './_components/dashboard-layout-settings-dialog'
import {
  DASHBOARD_QUICK_ACTIONS,
  DASHBOARD_QUICK_ACTION_CARD_CLASS,
  type DashboardQuickActionLink,
} from './_components/dashboard-quick-actions-config'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { NewAppointmentButton } from './_components/new-appointment-button'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { Button } from '@/components/ui'
import { useStaffTodayAgenda } from '@/hooks/use-staff-today-agenda'
import { useStaffDashboardLayoutPrefs } from '@/hooks/use-staff-dashboard-layout-prefs'

function lgMainGridColsClass(visibleCount: number): string {
  const n = Math.min(4, Math.max(1, visibleCount))
  if (n <= 1) return 'lg:grid-cols-1'
  if (n === 2) return 'lg:grid-cols-2'
  if (n === 3) return 'lg:grid-cols-3'
  return 'lg:grid-cols-4'
}

export default function DashboardPage() {
  const { events: initialEvents, loading, loadError, reload: loadAgenda } = useStaffTodayAgenda()
  const { prefs, setQuickVisible, setWidgetVisible, resetLayout } = useStaffDashboardLayoutPrefs()

  const w = prefs.widgets
  const mainVisibleCount =
    (w.agendaToday ? 1 : 0) +
    (w.expiringPrograms ? 1 : 0) +
    (w.lowLessons ? 1 : 0) +
    (w.unreadChats ? 1 : 0)

  const visibleQuickCount = DASHBOARD_QUICK_ACTIONS.filter((item) => prefs.quick[item.id]).length

  return (
    <StaffContentLayout
      title="Dashboard"
      description="Scorciatoie operative e riepilogo dell’agenda di oggi."
      theme="teal"
      className="overflow-y-auto min-h-0"
      actions={
        <DashboardLayoutSettingsDialog
          prefs={prefs}
          setQuickVisible={setQuickVisible}
          setWidgetVisible={setWidgetVisible}
          resetLayout={resetLayout}
        />
      }
    >
      <section className="shrink-0" aria-label="Azioni rapide" aria-busy={loading}>
        {visibleQuickCount === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-6 text-center text-sm text-text-secondary">
            Nessun blocco scorciatoia visibile. Riattivalo dalla personalizzazione in alto a destra.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-3">
            {DASHBOARD_QUICK_ACTIONS.map((item) => {
              if (!prefs.quick[item.id]) return null
              if (item.href) {
                const linkItem = item as DashboardQuickActionLink
                const Icon = linkItem.icon
                return (
                  <Link
                    key={linkItem.id}
                    href={linkItem.href}
                    prefetch
                    aria-label={linkItem.label}
                    className={DASHBOARD_QUICK_ACTION_CARD_CLASS}
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
              return <NewAppointmentButton key={item.id} iconBoxClass={item.iconBoxClass} />
            })}
          </div>
        )}
      </section>

      <section
        className={cn(
          'grid flex-1 min-h-0 grid-cols-1 items-stretch gap-3 sm:gap-4 lg:gap-4',
          lgMainGridColsClass(mainVisibleCount),
        )}
        aria-label="Area principale dashboard"
      >
        {mainVisibleCount === 0 ? (
          <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-6 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <p className="max-w-sm text-sm text-text-secondary">
              Nessun blocco pannello visibile. Riattivalo dalla personalizzazione in alto a destra.
            </p>
          </div>
        ) : (
          <>
            {w.agendaToday ? (
              <div
                className="flex min-h-0 min-w-0 flex-col lg:min-h-[min(52vh,440px)] lg:min-w-0"
                aria-label="Agenda di oggi"
              >
                <DashboardColumnPanel
                  title="Agenda di oggi"
                  badge={
                    !loading && loadError == null && initialEvents.length > 0
                      ? initialEvents.length
                      : undefined
                  }
                  footer={
                    <DashboardColumnFooterLink href="/dashboard/calendario">
                      Vai al calendario
                    </DashboardColumnFooterLink>
                  }
                >
                  {loading ? (
                    <DashboardColumnListSkeleton />
                  ) : loadError ? (
                    <DashboardColumnEmpty>
                      <p>{loadError}</p>
                      <Button variant="primary" size="sm" onClick={() => void loadAgenda()}>
                        Riprova
                      </Button>
                    </DashboardColumnEmpty>
                  ) : initialEvents.length === 0 ? (
                    <DashboardColumnEmpty>
                      <p className="text-text-primary/90">
                        Nessun appuntamento in agenda per oggi.
                      </p>
                      <Button variant="primary" size="sm" asChild>
                        <Link href="/dashboard/calendario" prefetch>
                          Apri calendario
                        </Link>
                      </Button>
                    </DashboardColumnEmpty>
                  ) : (
                    <AgendaClient initialEvents={initialEvents} embedded />
                  )}
                </DashboardColumnPanel>
              </div>
            ) : null}
            <DashboardWidgetColumns widgetsVisibility={w} />
          </>
        )}
      </section>
    </StaffContentLayout>
  )
}
