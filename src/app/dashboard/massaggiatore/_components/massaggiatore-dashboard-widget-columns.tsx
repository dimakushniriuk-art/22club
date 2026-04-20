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

export type MassaggiatoreUpcomingRow = {
  id: string
  starts_at: string
  athlete_name: string
}

export type MassaggiatoreDashboardSummary = {
  clientiSeguiti: number
  massaggiEseguiti: number
  massaggiTotali: number
  fattureEmesse: number
  appuntamentiSettimana: number
}

export function MassaggiatoreDashboardWidgetColumns({
  upcoming,
  stats,
  statsLoading,
}: {
  upcoming: MassaggiatoreUpcomingRow[]
  stats: MassaggiatoreDashboardSummary
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
            <DashboardColumnFooterLink href="/dashboard/massaggiatore/calendario">
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
                    href="/dashboard/massaggiatore/calendario"
                    prefetch
                    className={DASHBOARD_ROW_LINK_CLASS}
                  >
                    <div className="truncate text-sm font-medium text-text-primary">
                      {apt.athlete_name}
                    </div>
                    <div className="truncate text-xs text-text-secondary">
                      Massaggio ·{' '}
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
            <DashboardColumnFooterLink href="/dashboard/massaggiatore/statistiche">
              Vai alle statistiche
            </DashboardColumnFooterLink>
          }
        >
          {statsLoading ? (
            <DashboardColumnListSkeleton />
          ) : (
            <ul className={DASHBOARD_LIST_SCROLL_CLASS}>
              <li>
                <Link
                  href="/dashboard/massaggiatore/clienti"
                  prefetch
                  className={DASHBOARD_ROW_LINK_CLASS}
                >
                  <div className="text-sm font-medium text-text-primary">Clienti seguiti</div>
                  <div className="text-xs font-semibold tabular-nums text-cyan-400/90">
                    {stats.clientiSeguiti}
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/massaggiatore/statistiche"
                  prefetch
                  className={cn(DASHBOARD_ROW_LINK_CLASS, 'space-y-2')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-medium text-text-primary">Massaggi eseguiti</div>
                    <div className="shrink-0 text-right text-xs text-text-secondary">
                      <span className="font-semibold tabular-nums text-cyan-400/90">
                        {stats.massaggiEseguiti}
                      </span>
                      <span className="text-text-muted"> di {stats.massaggiTotali} totali</span>
                    </div>
                  </div>
                  {stats.massaggiTotali > 0 ? (
                    <div
                      className="h-1.5 w-full overflow-hidden rounded-full bg-white/5"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={stats.massaggiTotali}
                      aria-valuenow={stats.massaggiEseguiti}
                      aria-label="Avanzamento massaggi completati sul totale registrato"
                    >
                      <div
                        className="h-full max-w-full rounded-full bg-gradient-to-r from-cyan-600/80 to-teal-500/70 transition-[width] duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((stats.massaggiEseguiti / stats.massaggiTotali) * 100),
                          )}%`,
                        }}
                      />
                    </div>
                  ) : null}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/massaggiatore/abbonamenti"
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
                  href="/dashboard/massaggiatore/calendario"
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
            <DashboardColumnFooterLink href="/dashboard/massaggiatore/chat">
              Apri chat
            </DashboardColumnFooterLink>
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
                    href={`/dashboard/massaggiatore/chat?with=${encodeURIComponent(c.other_user_id)}`}
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
