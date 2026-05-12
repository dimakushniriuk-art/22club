'use client'

import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { AgendaClient } from '@/app/dashboard/_components/agenda-client'
import {
  DashboardColumnEmpty,
  DashboardColumnFooterLink,
  DashboardColumnListSkeleton,
  DashboardColumnPanel,
  DashboardWidgetColumns,
} from '@/app/dashboard/_components/dashboard-widget-columns'
import { DashboardLayoutSettingsDialog } from '@/app/dashboard/_components/dashboard-layout-settings-dialog'
import {
  DASHBOARD_QUICK_ACTIONS,
  DASHBOARD_QUICK_ACTION_CARD_CLASS,
  type DashboardQuickActionLink,
} from '@/app/dashboard/_components/dashboard-quick-actions-config'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { NewAppointmentButton } from '@/app/dashboard/_components/new-appointment-button'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { Button } from '@/components/ui'
import { useStaffTodayAgenda } from '@/hooks/use-staff-today-agenda'
import { useStaffDashboardLayoutPrefs } from '@/hooks/use-staff-dashboard-layout-prefs'
import { useAuth } from '@/providers/auth-provider'
import { useStaffChatUnreadDot } from '@/hooks/use-athlete-chat-unread-dot'

/** Griglia area principale: al massimo 4 colonne su desktop (celle in wrap su righe successive). */
function lgMainGridColsClass(totalCells: number): string {
  const n = Math.min(4, Math.max(1, totalCells))
  if (n <= 1) return 'lg:grid-cols-1'
  if (n === 2) return 'lg:grid-cols-2'
  if (n === 3) return 'lg:grid-cols-3'
  return 'lg:grid-cols-4'
}

const DASHBOARD_PREFS_SKELETON_QUICK_KEYS = [0, 1, 2, 3, 4, 5] as const

/** Matrice lg: 4 colonne × 2 righe — ogni pannello `row-span-2` (~doppio altezza “standard”). */
const DASHBOARD_MATRIX_GRID_STYLE = {
  gridTemplateRows: 'repeat(2, minmax(min(52vh, 440px), auto))',
} satisfies CSSProperties

export function StaffTrainerDashboardPageContent() {
  const { user } = useAuth()
  const [deferSecondaryData, setDeferSecondaryData] = useState(false)

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

  const staffChatUnreadDot = useStaffChatUnreadDot(user?.id ?? null, deferSecondaryData)

  const {
    events: initialEvents,
    loading,
    loadError,
    reload: loadAgenda,
    lessonsLoading,
    lessonsLoadError,
  } = useStaffTodayAgenda()
  const { prefs, setQuickVisible, setWidgetVisible, resetLayout, hydrated } =
    useStaffDashboardLayoutPrefs()

  const layoutActions = useMemo(() => {
    if (!hydrated) {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center" aria-hidden>
          <span className="h-9 w-9 animate-pulse rounded-lg bg-white/[0.06]" />
        </div>
      )
    }
    return (
      <DashboardLayoutSettingsDialog
        prefs={prefs}
        setQuickVisible={setQuickVisible}
        setWidgetVisible={setWidgetVisible}
        resetLayout={resetLayout}
      />
    )
  }, [hydrated, prefs, setQuickVisible, setWidgetVisible, resetLayout])

  const w = prefs.widgets
  const mainVisibleCount =
    (w.agendaToday ? 1 : 0) +
    (w.expiringPrograms ? 1 : 0) +
    (w.lowLessons ? 1 : 0) +
    (w.unreadChats ? 1 : 0)

  /** Celle griglia: solo widget (+ placeholder se tutti off). */
  const mainAreaCellCount = mainVisibleCount === 0 ? 1 : mainVisibleCount

  /** lg: 4 colonne, ogni blocco occupa 2 righe di griglia (placement esplicito). */
  const matrixLg =
    mainVisibleCount > 0 && w.agendaToday && w.expiringPrograms && w.lowLessons && w.unreadChats

  const visibleQuickCount = DASHBOARD_QUICK_ACTIONS.filter((item) => prefs.quick[item.id]).length

  const panelShortClass = 'flex min-h-0 min-w-0 flex-col lg:min-h-[min(52vh,440px)] lg:min-w-0'

  return (
    <StaffContentLayout
      title="Dashboard"
      description="Scorciatoie operative e riepilogo dell’agenda di oggi."
      theme="teal"
      className="overflow-y-auto min-h-0"
      actions={layoutActions}
    >
      {!hydrated ? (
        <>
          <section className="shrink-0" aria-label="Azioni rapide" aria-busy>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-3">
              {DASHBOARD_PREFS_SKELETON_QUICK_KEYS.map((i) => (
                <div
                  key={i}
                  className={cn(
                    DASHBOARD_QUICK_ACTION_CARD_CLASS,
                    'pointer-events-none animate-pulse border-white/5 bg-black/20',
                  )}
                >
                  <span className="h-8 w-8 shrink-0 rounded-lg bg-white/[0.06]" />
                  <span className="mt-1.5 block h-3 w-14 rounded bg-white/[0.06] sm:mt-2 sm:w-16" />
                </div>
              ))}
            </div>
          </section>

          <section
            className="grid flex-1 min-h-0 grid-cols-1 items-stretch gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-4"
            style={DASHBOARD_MATRIX_GRID_STYLE}
            aria-label="Area principale dashboard"
            aria-busy
          >
            <div
              className={cn(
                panelShortClass,
                'lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:h-full lg:min-h-0',
              )}
            >
              <DashboardColumnPanel title="">
                <DashboardColumnListSkeleton />
              </DashboardColumnPanel>
            </div>
            <div
              className={cn(
                panelShortClass,
                'lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:h-full lg:min-h-0',
              )}
            >
              <DashboardColumnPanel title="Schede in scadenza" badgePlaceholder>
                <DashboardColumnListSkeleton />
              </DashboardColumnPanel>
            </div>
            <div
              className={cn(
                panelShortClass,
                'lg:col-start-3 lg:row-start-1 lg:row-span-2 lg:h-full lg:min-h-0',
              )}
            >
              <DashboardColumnPanel title="Lezioni in esaurimento" badgePlaceholder>
                <DashboardColumnListSkeleton />
              </DashboardColumnPanel>
            </div>
            <div
              className={cn(
                panelShortClass,
                'lg:col-start-4 lg:row-start-1 lg:row-span-2 lg:h-full lg:min-h-0',
              )}
            >
              <DashboardColumnPanel title="Messaggi non letti" badgePlaceholder>
                <DashboardColumnListSkeleton />
              </DashboardColumnPanel>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="shrink-0" aria-label="Azioni rapide" aria-busy={loading}>
            {visibleQuickCount === 0 ? (
              <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-6 text-center text-sm text-text-secondary">
                Nessun blocco scorciatoia visibile. Riattivalo dalla personalizzazione in alto a
                destra.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-3">
                {DASHBOARD_QUICK_ACTIONS.map((item) => {
                  if (!prefs.quick[item.id]) return null
                  if (item.href) {
                    const linkItem = item as DashboardQuickActionLink
                    const Icon = linkItem.icon
                    const showChatUnreadDot = linkItem.id === 'chat' && staffChatUnreadDot
                    return (
                      <Link
                        key={linkItem.id}
                        href={linkItem.href}
                        prefetch
                        aria-label={
                          showChatUnreadDot
                            ? `${linkItem.label}, messaggi non letti`
                            : linkItem.label
                        }
                        className={cn(DASHBOARD_QUICK_ACTION_CARD_CLASS, 'relative')}
                      >
                        {showChatUnreadDot && (
                          <span
                            className="pointer-events-none absolute left-2 top-2 z-20 h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_12px_3px_rgba(239,68,68,0.65)] ring-2 ring-black/50 animate-pulse"
                            aria-hidden
                          />
                        )}
                        <div
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                            linkItem.iconBoxClass,
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="mt-1.5 block text-[10px] font-semibold leading-tight text-text-primary sm:mt-2 sm:text-[11px] md:text-xs">
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
              matrixLg ? 'lg:grid-cols-4' : lgMainGridColsClass(mainAreaCellCount),
            )}
            style={matrixLg ? DASHBOARD_MATRIX_GRID_STYLE : undefined}
            aria-label="Area principale dashboard"
          >
            {mainVisibleCount === 0 ? (
              <div className="flex min-h-[12rem] min-h-0 min-w-0 flex-col">
                <DashboardColumnPanel title="">
                  <DashboardColumnEmpty>
                    Nessun blocco pannello visibile. Riattivalo dalla personalizzazione in alto a
                    destra.
                  </DashboardColumnEmpty>
                </DashboardColumnPanel>
              </div>
            ) : (
              <>
                {w.agendaToday ? (
                  <div
                    className={cn(
                      panelShortClass,
                      matrixLg &&
                        'lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:h-full lg:min-h-0',
                    )}
                    aria-label="Agenda di oggi"
                  >
                    <DashboardColumnPanel
                      title="Agenda di oggi"
                      badge={
                        !loading && loadError == null && initialEvents.length > 0
                          ? initialEvents.length
                          : undefined
                      }
                      badgePlaceholder={loading && loadError == null}
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
                        <AgendaClient
                          initialEvents={initialEvents}
                          lessonsLoading={lessonsLoading}
                          lessonsLoadError={lessonsLoadError}
                          embedded
                        />
                      )}
                    </DashboardColumnPanel>
                  </div>
                ) : null}
                <DashboardWidgetColumns
                  widgetsVisibility={w}
                  matrixPlacement={matrixLg}
                  secondaryDataEnabled={deferSecondaryData}
                />
              </>
            )}
          </section>
        </>
      )}
    </StaffContentLayout>
  )
}

