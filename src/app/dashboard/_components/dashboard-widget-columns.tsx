'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { useStaffDashboardWidgets } from '@/hooks/use-staff-dashboard-widgets'
import { STAFF_DASHBOARD_LOW_LESSONS_THRESHOLD } from '@/lib/dashboard/fetch-staff-dashboard-widgets'
import { useStaffChatUnreadPreview } from '@/hooks/use-staff-chat-unread-preview'

/** Pannello colonna dashboard: stesso chrome per agenda + widget. */
export const DASHBOARD_COLUMN_PANEL_CLASS =
  'flex h-full min-h-0 min-w-0 flex-col rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-3 sm:p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] ring-1 ring-inset ring-white/[0.03]'

export const DASHBOARD_LIST_SCROLL_CLASS =
  'w-full flex-1 space-y-2 overflow-y-auto overscroll-contain min-h-[9rem] max-h-[min(52vh,440px)] sm:min-h-[10rem] lg:min-h-[12rem]'

/** Alias storico interno */
const LIST_SCROLL = DASHBOARD_LIST_SCROLL_CLASS

export const DASHBOARD_ROW_LINK_CLASS =
  'block rounded-lg border border-white/5 bg-black/25 px-3 py-2.5 transition-colors hover:border-white/12 hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30'

const ROW_LINK_CLASS = DASHBOARD_ROW_LINK_CLASS

export const DASHBOARD_COLUMN_FOOTER_LINK_CLASS =
  'inline-flex text-xs font-medium text-cyan-400 transition-colors hover:text-cyan-300 underline-offset-4 hover:underline'

export function DashboardColumnFooterLink({
  href,
  children,
  prefetch = true,
}: {
  href: string
  children: ReactNode
  prefetch?: boolean
}) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={cn(
        'inline-flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-white/[0.08]',
        'bg-white/[0.04] px-3 text-xs font-medium text-cyan-400 transition-colors',
        'hover:border-white/15 hover:bg-white/[0.07] hover:text-cyan-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
      )}
    >
      <span>{children}</span>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
    </Link>
  )
}

export function DashboardColumnEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-2 py-8 text-center text-xs leading-relaxed text-text-secondary">
      {children}
    </div>
  )
}

/** Token :root in globals.css; `!` evita che il colore ereditato dal layout/link annulli il tono. */
function remainingTone(remaining: number): string {
  if (remaining <= 0) return '!text-[color:var(--color-error)]'
  if (remaining <= 3) return '!text-[color:var(--color-warning)]'
  return '!text-[color:var(--color-success)]'
}

export function DashboardColumnPanel({
  title,
  children,
  footer,
  badge,
}: {
  title: string
  children: ReactNode
  footer?: React.ReactNode
  /** Conteggio o etichetta breve accanto al titolo (es. n. voci) */
  badge?: string | number
}) {
  return (
    <div className={DASHBOARD_COLUMN_PANEL_CLASS}>
      <div className="mb-3 flex shrink-0 items-baseline justify-between gap-2 border-b border-white/[0.06] pb-2.5">
        <h2 className="min-w-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary/90 sm:text-xs">
          {title}
        </h2>
        {badge != null && badge !== '' ? (
          <span
            className="shrink-0 rounded-md border border-[color:var(--color-error)]/35 bg-[color:var(--color-error)]/10 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[color:var(--color-error)]"
            aria-label={`Elementi: ${badge}`}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      {footer != null ? <div className="mt-3 shrink-0 pt-1">{footer}</div> : null}
    </div>
  )
}

function ColumnPanel(props: {
  title: string
  children: ReactNode
  footer?: React.ReactNode
  badge?: string | number
}) {
  return <DashboardColumnPanel {...props} />
}

export function DashboardColumnListSkeleton() {
  return (
    <div className={LIST_SCROLL}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-[3.25rem] animate-pulse rounded-lg bg-white/[0.06]" />
      ))}
    </div>
  )
}

function ListSkeleton() {
  return <DashboardColumnListSkeleton />
}

export function DashboardWidgetColumns() {
  const { user } = useAuth()
  const staffProfileId = user?.id
  const { expiring, athletes, loading, error } = useStaffDashboardWidgets(staffProfileId)
  const { items: unreadChats, loading: chatLoading } = useStaffChatUnreadPreview(
    Boolean(staffProfileId),
  )

  return (
    <>
      <div className="flex min-h-0 min-w-0 flex-col lg:min-h-[min(52vh,440px)] lg:min-w-0">
        <ColumnPanel
          title="Schede in scadenza"
          badge={!loading && error == null && expiring.length > 0 ? expiring.length : undefined}
          footer={
            <DashboardColumnFooterLink href="/dashboard/schede">
              Vai alle schede
            </DashboardColumnFooterLink>
          }
        >
          {loading ? (
            <ListSkeleton />
          ) : error != null ? (
            <DashboardColumnEmpty>{error}</DashboardColumnEmpty>
          ) : expiring.length === 0 ? (
            <DashboardColumnEmpty>
              Nessuna scheda in scadenza (data fine) o con ciclo sessioni critico (completato o ≤3
              sessioni rimanenti).
            </DashboardColumnEmpty>
          ) : (
            <ul className={LIST_SCROLL}>
              {expiring.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/dashboard/schede/${p.id}/modifica`}
                    prefetch
                    className={ROW_LINK_CLASS}
                  >
                    <div className="truncate text-sm font-medium text-text-primary">
                      {typeof p.creation_order_number === 'number' ? (
                        <span className="tabular-nums text-text-tertiary font-medium">
                          #{p.creation_order_number}
                          <span className="text-text-tertiary/80"> · </span>
                        </span>
                      ) : null}
                      {p.name}
                    </div>
                    <div className="truncate text-xs text-text-secondary">
                      {p.athlete_display_name}
                    </div>
                    <div className="mt-0.5 text-[11px] text-amber-400/85">{p.subtitle}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ColumnPanel>
      </div>

      <div className="flex min-h-0 min-w-0 flex-col lg:min-h-[min(52vh,440px)] lg:min-w-0">
        <ColumnPanel
          title="Lezioni in esaurimento"
          badge={!loading && error == null && athletes.length > 0 ? athletes.length : undefined}
          footer={
            <DashboardColumnFooterLink href="/dashboard/abbonamenti">
              Abbonamenti
            </DashboardColumnFooterLink>
          }
        >
          {loading ? (
            <ListSkeleton />
          ) : error != null ? (
            <DashboardColumnEmpty>{error}</DashboardColumnEmpty>
          ) : athletes.length === 0 ? (
            <DashboardColumnEmpty>
              Nessun atleta con {STAFF_DASHBOARD_LOW_LESSONS_THRESHOLD} o meno lezioni training
              rimanenti.
            </DashboardColumnEmpty>
          ) : (
            <ul className={LIST_SCROLL}>
              {athletes.map((a) => (
                <li key={a.athlete_id}>
                  <Link
                    href={`/dashboard/atleti/${a.athlete_id}`}
                    prefetch
                    className={cn(ROW_LINK_CLASS, 'flex items-center justify-between gap-2')}
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-text-primary">
                      {a.display_name}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 text-xs font-semibold tabular-nums',
                        remainingTone(a.total_remaining),
                      )}
                    >
                      {a.total_remaining} rimanenti
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ColumnPanel>
      </div>

      <div className="flex min-h-0 min-w-0 flex-col lg:min-h-[min(52vh,440px)] lg:min-w-0">
        <ColumnPanel
          title="Messaggi non letti"
          badge={
            !chatLoading && unreadChats.length > 0
              ? unreadChats.reduce((n, c) => n + c.unread_count, 0)
              : undefined
          }
          footer={
            <DashboardColumnFooterLink href="/dashboard/chat">Apri chat</DashboardColumnFooterLink>
          }
        >
          {chatLoading ? (
            <ListSkeleton />
          ) : unreadChats.length === 0 ? (
            <DashboardColumnEmpty>Nessun messaggio da leggere.</DashboardColumnEmpty>
          ) : (
            <ul className={LIST_SCROLL}>
              {unreadChats.map((c) => (
                <li key={c.other_user_id}>
                  <Link
                    href={`/dashboard/chat?with=${encodeURIComponent(c.other_user_id)}`}
                    prefetch
                    className={cn(ROW_LINK_CLASS, 'flex items-center justify-between gap-2')}
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
        </ColumnPanel>
      </div>
    </>
  )
}
