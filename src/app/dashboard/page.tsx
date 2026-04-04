'use client'

import type { LucideIcon } from 'lucide-react'
import {
  UserPlus,
  Dumbbell,
  MessageSquare,
  BarChart3,
  Activity,
  CalendarDays,
  Users,
  CreditCard,
  CalendarCheck,
  Megaphone,
  Settings2,
} from 'lucide-react'
import { AgendaClient } from './_components/agenda-client'
import {
  DashboardColumnEmpty,
  DashboardColumnFooterLink,
  DashboardColumnListSkeleton,
  DashboardColumnPanel,
  DashboardWidgetColumns,
} from './_components/dashboard-widget-columns'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { NewAppointmentButton } from './_components/new-appointment-button'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { Button } from '@/components/ui'
import { useStaffTodayAgenda } from '@/hooks/use-staff-today-agenda'

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
    href: '/dashboard/workouts',
    icon: Activity,
    label: 'Workouts',
    iconBoxClass: 'border-rose-500/30 bg-rose-500/20 text-rose-400',
  },
  {
    href: '/dashboard/calendario',
    icon: CalendarDays,
    label: 'Calendario',
    iconBoxClass: 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400',
  },
  {
    href: '/dashboard/prenotazioni',
    icon: CalendarCheck,
    label: 'Prenotazioni',
    iconBoxClass: 'border-orange-500/30 bg-orange-500/20 text-orange-300',
  },
  {
    href: '/dashboard/clienti',
    icon: Users,
    label: 'Clienti',
    iconBoxClass: 'border-sky-500/30 bg-sky-500/20 text-sky-300',
  },
  {
    href: '/dashboard/chat',
    icon: MessageSquare,
    label: 'Chat',
    iconBoxClass: 'border-purple-500/30 bg-purple-500/20 text-purple-400',
  },
  {
    href: '/dashboard/statistiche',
    icon: BarChart3,
    label: 'Statistiche',
    iconBoxClass: 'border-blue-500/30 bg-blue-500/20 text-blue-400',
  },
  {
    href: '/dashboard/schede',
    icon: Dumbbell,
    label: 'Schede',
    iconBoxClass: 'border-amber-500/30 bg-amber-500/20 text-amber-400',
  },
  {
    href: null,
    iconBoxClass: 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400',
  },
  {
    href: '/dashboard/abbonamenti',
    icon: CreditCard,
    label: 'Abbonamenti',
    iconBoxClass: 'border-lime-500/30 bg-lime-500/20 text-lime-300',
  },
  {
    href: '/dashboard/invita-atleta?new=true',
    icon: UserPlus,
    label: 'Invita cliente',
    iconBoxClass: 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400',
  },
  {
    href: '/dashboard/comunicazioni',
    icon: Megaphone,
    label: 'Comunicazioni',
    iconBoxClass: 'border-teal-500/30 bg-teal-500/20 text-teal-300',
  },
  {
    href: '/dashboard/impostazioni',
    icon: Settings2,
    label: 'Impostazioni',
    iconBoxClass: 'border-zinc-500/30 bg-zinc-500/20 text-zinc-300',
  },
]

export default function DashboardPage() {
  const { events: initialEvents, loading, loadError, reload: loadAgenda } = useStaffTodayAgenda()

  return (
    <StaffContentLayout
      title="Dashboard"
      description="Scorciatoie operative e riepilogo dell’agenda di oggi."
      theme="teal"
      className="overflow-y-auto min-h-0"
    >
      <section className="shrink-0" aria-label="Azioni rapide" aria-busy={loading}>
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
            return <NewAppointmentButton key="appointment" iconBoxClass={item.iconBoxClass} />
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
                <p className="text-text-primary/90">Nessun appuntamento in agenda per oggi.</p>
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
        <DashboardWidgetColumns />
      </section>
    </StaffContentLayout>
  )
}
