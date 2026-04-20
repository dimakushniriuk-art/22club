'use client'

import type { LucideIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  User,
  Users,
  MessageSquare,
  BarChart3,
  CalendarDays,
  CalendarCheck,
  CreditCard,
  Settings2,
} from 'lucide-react'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui'
import { createLogger } from '@/lib/logger'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
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
import { MassaggiatoreDashboardWidgetColumns } from './_components/massaggiatore-dashboard-widget-columns'

const logger = createLogger('app:dashboard:massaggiatore:page')

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
    href: '/dashboard/massaggiatore/calendario',
    icon: CalendarDays,
    label: 'Calendario',
    iconBoxClass: 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400',
  },
  {
    href: '/dashboard/massaggiatore/appuntamenti',
    icon: CalendarCheck,
    label: 'Appuntamenti',
    iconBoxClass: 'border-orange-500/30 bg-orange-500/20 text-orange-300',
  },
  {
    href: '/dashboard/massaggiatore/clienti',
    icon: Users,
    label: 'Clienti',
    iconBoxClass: 'border-emerald-500/30 bg-emerald-500/20 text-emerald-300',
  },
  {
    href: '/dashboard/massaggiatore/chat',
    icon: MessageSquare,
    label: 'Chat',
    iconBoxClass: 'border-purple-500/30 bg-purple-500/20 text-purple-400',
  },
  {
    href: '/dashboard/massaggiatore/statistiche',
    icon: BarChart3,
    label: 'Statistiche',
    iconBoxClass: 'border-blue-500/30 bg-blue-500/20 text-blue-400',
  },
  {
    href: '/dashboard/massaggiatore/profilo',
    icon: User,
    label: 'Profilo',
    iconBoxClass: 'border-sky-500/30 bg-sky-500/20 text-sky-300',
  },
  {
    href: null,
    iconBoxClass: 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400',
  },
  {
    href: '/dashboard/massaggiatore/abbonamenti',
    icon: CreditCard,
    label: 'Abbonamenti',
    iconBoxClass: 'border-lime-500/30 bg-lime-500/20 text-lime-300',
  },
  {
    href: '/dashboard/massaggiatore/impostazioni',
    icon: Settings2,
    label: 'Impostazioni',
    iconBoxClass: 'border-zinc-500/30 bg-zinc-500/20 text-zinc-300',
  },
]

type UpcomingAppointment = {
  id: string
  starts_at: string
  athlete_name: string
}

type DashboardStats = {
  clientiSeguiti: number
  massaggiEseguiti: number
  massaggiTotali: number
  fattureEmesse: number
  appuntamentiSettimana: number
  prossimiAppuntamenti: UpcomingAppointment[]
}

function isMassageAgendaEvent(description: string | undefined): boolean {
  const d = (description ?? '').toLowerCase()
  return d === 'massaggio' || d.includes('massaggio')
}

export default function MassaggiatorePage() {
  const { showLoader } = useStaffDashboardGuard('massaggiatore')
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  const {
    events: agendaEvents,
    loading: agendaLoading,
    loadError: agendaLoadError,
    reload: reloadAgenda,
  } = useStaffTodayAgenda()

  const massageAgendaEvents = useMemo(
    () => agendaEvents.filter((e) => isMassageAgendaEvent(e.description)),
    [agendaEvents],
  )

  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    clientiSeguiti: 0,
    massaggiEseguiti: 0,
    massaggiTotali: 0,
    fattureEmesse: 0,
    appuntamentiSettimana: 0,
    prossimiAppuntamenti: [],
  })

  const loadStats = useCallback(async () => {
    const profileId = user?.id ?? null
    if (!profileId) {
      setStatsLoading(false)
      return
    }
    setStatsError(null)
    setStatsLoading(true)
    try {
      const nowIso = new Date().toISOString()
      const [clientiRes, appointmentsRes, paymentsRes, weekRes, aptDataRes] = await Promise.all([
        supabase
          .from('staff_atleti')
          .select('id', { count: 'exact', head: true })
          .eq('staff_id', profileId)
          .eq('staff_type', 'massaggiatore')
          .eq('status', 'active'),
        supabase
          .from('appointments')
          .select('id, status')
          .eq('staff_id', profileId)
          .eq('type', 'massaggio'),
        supabase
          .from('payments')
          .select('id', { count: 'exact', head: true })
          .eq('created_by_staff_id', profileId),
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('staff_id', profileId)
          .eq('type', 'massaggio')
          .gte('starts_at', nowIso)
          .lte('starts_at', new Date(Date.now() + 7 * 86400000).toISOString())
          .neq('status', 'annullato'),
        supabase
          .from('appointments')
          .select('id, starts_at, athlete_id')
          .eq('staff_id', profileId)
          .eq('type', 'massaggio')
          .gte('starts_at', nowIso)
          .is('cancelled_at', null)
          .order('starts_at', { ascending: true })
          .limit(12),
      ])

      const supabaseErr =
        clientiRes.error?.message ??
        appointmentsRes.error?.message ??
        paymentsRes.error?.message ??
        weekRes.error?.message ??
        aptDataRes.error?.message
      if (supabaseErr) {
        setStatsError(supabaseErr)
        return
      }

      const appointments = appointmentsRes.data ?? []
      const aptData = (aptDataRes.data ?? []) as Array<{
        id: string
        starts_at: string
        athlete_id: string | null
      }>
      const athleteIds = [...new Set(aptData.map((a) => a.athlete_id).filter(Boolean))] as string[]
      const profilesMap = new Map<string, { nome: string | null; cognome: string | null }>()
      if (athleteIds.length > 0) {
        for (const idChunk of chunkForSupabaseIn(athleteIds)) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, nome, cognome')
            .in('id', idChunk)
          ;(profiles ?? []).forEach(
            (p: { id: string; nome: string | null; cognome: string | null }) => {
              profilesMap.set(p.id, { nome: p.nome, cognome: p.cognome })
            },
          )
        }
      }
      const prossimiAppuntamenti: UpcomingAppointment[] = aptData.map((apt) => {
        const p = apt.athlete_id != null ? profilesMap.get(apt.athlete_id) : undefined
        const name = p ? [p.nome, p.cognome].filter(Boolean).join(' ') || 'Cliente' : 'Cliente'
        return {
          id: apt.id,
          starts_at: apt.starts_at,
          athlete_name: name,
        }
      })

      setStats({
        clientiSeguiti: clientiRes.count ?? 0,
        massaggiEseguiti: appointments.filter((a) => a.status === 'completato').length,
        massaggiTotali: appointments.length,
        fattureEmesse: paymentsRes.count ?? 0,
        appuntamentiSettimana: weekRes.count ?? 0,
        prossimiAppuntamenti,
      })
    } catch (e) {
      logger.error('Errore caricamento dashboard massaggiatore', e)
      setStatsError(e instanceof Error ? e.message : 'Errore nel caricamento')
    } finally {
      setStatsLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  if (showLoader) {
    return <StaffDashboardGuardSkeleton />
  }

  const summaryForWidgets = {
    clientiSeguiti: stats.clientiSeguiti,
    massaggiEseguiti: stats.massaggiEseguiti,
    massaggiTotali: stats.massaggiTotali,
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
            onClick={() => void loadStats()}
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
                calendarioHref="/dashboard/massaggiatore/calendario?new=true"
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
              !agendaLoading && agendaLoadError == null && massageAgendaEvents.length > 0
                ? massageAgendaEvents.length
                : undefined
            }
            footer={
              <DashboardColumnFooterLink href="/dashboard/massaggiatore/calendario">
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
            ) : massageAgendaEvents.length === 0 ? (
              <DashboardColumnEmpty>
                <p className="text-text-primary/90">Nessun massaggio in agenda per oggi.</p>
                <Button variant="primary" size="sm" asChild>
                  <Link href="/dashboard/massaggiatore/calendario" prefetch>
                    Apri calendario
                  </Link>
                </Button>
              </DashboardColumnEmpty>
            ) : (
              <AgendaClient initialEvents={massageAgendaEvents} embedded />
            )}
          </DashboardColumnPanel>
        </div>
        <MassaggiatoreDashboardWidgetColumns
          upcoming={stats.prossimiAppuntamenti}
          stats={summaryForWidgets}
          statsLoading={statsLoading}
        />
      </section>
    </StaffContentLayout>
  )
}
