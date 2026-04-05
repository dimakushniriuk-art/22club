'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useStaffChatUnreadPreview } from '@/hooks/use-staff-chat-unread-preview'
import {
  DashboardColumnPanel,
  DashboardColumnEmpty,
  DashboardColumnListSkeleton,
  DashboardColumnFooterLink,
  DASHBOARD_LIST_SCROLL_CLASS,
  DASHBOARD_ROW_LINK_CLASS,
} from '@/app/dashboard/_components/dashboard-widget-columns'

export type NutrizionistaUpcomingRow = {
  id: string
  starts_at: string
  athlete_name: string
  type: string | null
}

export type NutrizionistaDashboardSummary = {
  atletiSeguiti: number
  visiteCompletate: number
  visiteTotali: number
  fattureEmesse: number
  appuntamentiSettimana: number
}

function visitLabel(type: string | null): string {
  if (type === 'nutrizionista') return 'Visita'
  return type?.trim() ? type : 'Appuntamento'
}

export function NutrizionistaDashboardWidgetColumns({
  upcoming,
  stats,
  statsLoading,
}: {
  upcoming: NutrizionistaUpcomingRow[]
  stats: NutrizionistaDashboardSummary
  statsLoading: boolean
}) {
  const { items: unreadChats, loading: chatLoading } = useStaffChatUnreadPreview(true)

  return (
    <>
      <div className="flex min-h-0 min-w-0 flex-col lg:min-h-[min(52vh,440px)] lg:min-w-0">
        <DashboardColumnPanel
          title="Prossimi appuntamenti"
          badge={!statsLoading && upcoming.length > 0 ? upcoming.length : undefined}
          footer={
            <DashboardColumnFooterLink href="/dashboard/nutrizionista/calendario">
              Vai al calendario
            </DashboardColumnFooterLink>
          }
        >
          {statsLoading ? (
            <DashboardColumnListSkeleton />
          ) : upcoming.length === 0 ? (
            <DashboardColumnEmpty>
              <p className="text-text-primary/90">Nessun appuntamento in programma.</p>
            </DashboardColumnEmpty>
          ) : (
            <ul className={DASHBOARD_LIST_SCROLL_CLASS}>
              {upcoming.map((apt) => (
                <li key={apt.id}>
                  <Link
                    href="/dashboard/nutrizionista/calendario"
                    prefetch
                    className={DASHBOARD_ROW_LINK_CLASS}
                  >
                    <div className="truncate text-sm font-medium text-text-primary">
                      {apt.athlete_name}
                    </div>
                    <div className="truncate text-xs text-text-secondary">
                      {visitLabel(apt.type)} ·{' '}
                      {new Date(apt.starts_at).toLocaleString('it-IT', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DashboardColumnPanel>
      </div>

      <div className="flex min-h-0 min-w-0 flex-col lg:min-h-[min(52vh,440px)] lg:min-w-0">
        <DashboardColumnPanel
          title="Riepilogo"
          footer={
            <DashboardColumnFooterLink href="/dashboard/nutrizionista/analisi">
              Vai all&apos;analisi
            </DashboardColumnFooterLink>
          }
        >
          {statsLoading ? (
            <DashboardColumnListSkeleton />
          ) : (
            <ul className={DASHBOARD_LIST_SCROLL_CLASS}>
              <li>
                <Link
                  href="/dashboard/nutrizionista/atleti"
                  prefetch
                  className={DASHBOARD_ROW_LINK_CLASS}
                >
                  <div className="text-sm font-medium text-text-primary">Atleti seguiti</div>
                  <div className="text-xs font-semibold tabular-nums text-cyan-400/90">
                    {stats.atletiSeguiti}
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/nutrizionista/calendario"
                  prefetch
                  className={DASHBOARD_ROW_LINK_CLASS}
                >
                  <div className="text-sm font-medium text-text-primary">Visite completate</div>
                  <div className="text-xs text-text-secondary">
                    <span className="font-semibold tabular-nums text-cyan-400/90">
                      {stats.visiteCompletate}
                    </span>
                    <span className="text-text-muted"> di {stats.visiteTotali} totali</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/nutrizionista/abbonamenti"
                  prefetch
                  className={DASHBOARD_ROW_LINK_CLASS}
                >
                  <div className="text-sm font-medium text-text-primary">Fatture emesse</div>
                  <div className="text-xs font-semibold tabular-nums text-cyan-400/90">
                    {stats.fattureEmesse}
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/nutrizionista/calendario"
                  prefetch
                  className={DASHBOARD_ROW_LINK_CLASS}
                >
                  <div className="text-sm font-medium text-text-primary">Prossimi 7 giorni</div>
                  <div className="text-xs text-text-secondary">
                    <span className="font-semibold tabular-nums text-cyan-400/90">
                      {stats.appuntamentiSettimana}
                    </span>
                    <span className="text-text-muted"> appuntamenti</span>
                  </div>
                </Link>
              </li>
            </ul>
          )}
        </DashboardColumnPanel>
      </div>

      <div className="flex min-h-0 min-w-0 flex-col lg:min-h-[min(52vh,440px)] lg:min-w-0">
        <DashboardColumnPanel
          title="Messaggi non letti"
          badge={
            !chatLoading && unreadChats.length > 0
              ? unreadChats.reduce((n, c) => n + c.unread_count, 0)
              : undefined
          }
          footer={
            <DashboardColumnFooterLink href="/dashboard/nutrizionista/chat">Apri chat</DashboardColumnFooterLink>
          }
        >
          {chatLoading ? (
            <DashboardColumnListSkeleton />
          ) : unreadChats.length === 0 ? (
            <DashboardColumnEmpty>Nessun messaggio da leggere.</DashboardColumnEmpty>
          ) : (
            <ul className={DASHBOARD_LIST_SCROLL_CLASS}>
              {unreadChats.map((c) => (
                <li key={c.other_user_id}>
                  <Link
                    href={`/dashboard/nutrizionista/chat?with=${encodeURIComponent(c.other_user_id)}`}
                    prefetch
                    className={cn(
                      DASHBOARD_ROW_LINK_CLASS,
                      'flex items-center justify-between gap-2',
                    )}
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-text-primary">
                      {c.other_user_name}
                    </span>
                    <span className="shrink-0 rounded-full border border-cyan-400/35 bg-cyan-500/20 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-cyan-200">
                      {c.unread_count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DashboardColumnPanel>
      </div>
    </>
  )
}
