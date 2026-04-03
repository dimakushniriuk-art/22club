'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import {
  DashboardColumnEmpty,
  DashboardColumnListSkeleton,
  DashboardColumnPanel,
} from '@/app/dashboard/_components/dashboard-widget-columns'
import { useStaffAppointmentsTable } from '@/hooks/appointments/useStaffAppointmentsTable'
import { useClienti } from '@/hooks/use-clienti'
import type { AppointmentTable } from '@/types/appointment'
import type { Cliente } from '@/types/cliente'
import { Avatar } from '@/components/ui/avatar'
import { CalendarCheck, CalendarDays } from 'lucide-react'

export default function PrenotazioniPage() {
  const router = useRouter()
  const { appointments, appointmentsLoading } = useStaffAppointmentsTable()
  const { clienti: atleti, loading: atletiLoading, error: atletiError } = useClienti({
    page: 1,
    pageSize: 250,
    realtime: false,
    // Dopo agenda: evita fetch parallelo lista appuntamenti + 250 clienti al mount.
    listQueryEnabled: !appointmentsLoading,
  })
  const atletiSectionLoading = appointmentsLoading || atletiLoading

  const getAppointmentType = (apt: AppointmentTable) => {
    if (apt.type === 'allenamento') return 'Allenamento'
    if (apt.type === 'prova') return 'Prova'
    if (apt.type === 'valutazione') return 'Valutazione'
    return 'Appuntamento'
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    const time = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    const dateStr = date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    return { time, dateStr }
  }

  const todays = (() => {
    const now = new Date()
    const isToday = (d: Date) =>
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()

    return appointments
      .filter((a) => {
        const t = new Date(a.starts_at)
        return isToday(t)
      })
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
      .slice(0, 5)
  })()

  const statusLabel = (status?: string | null) => {
    const s = (status ?? '').toLowerCase()
    if (s === 'completato' || s === 'completed') return 'Completata'
    if (s === 'annullato' || s === 'cancelled') return 'Annullata'
    return 'Attiva'
  }

  return (
    <StaffContentLayout
      title="Prenotazioni"
      description="Richieste e gestione prenotazioni risorse."
      theme="teal"
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 min-h-0">
          <div className="flex min-h-0 min-w-0 flex-col lg:min-h-[min(52vh,440px)] lg:min-w-0">
            <div
              role="button"
              tabIndex={0}
              onClick={() => router.push('/dashboard/appuntamenti')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  router.push('/dashboard/appuntamenti')
                }
              }}
              className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              aria-label="Apri pagina Appuntamenti"
            >
              <DashboardColumnPanel
                title="Agenda di oggi"
                footer={
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push('/dashboard/appuntamenti')
                    }}
                    className={[
                      'inline-flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-white/[0.08]',
                      'bg-white/[0.04] px-3 text-xs font-medium text-cyan-400 transition-colors',
                      'hover:border-white/15 hover:bg-white/[0.07] hover:text-cyan-300',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
                    ].join(' ')}
                  >
                    <span>Vai agli appuntamenti</span>
                    <span className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden>
                      ›
                    </span>
                  </button>
                }
              >
                {appointmentsLoading ? (
                  <DashboardColumnListSkeleton />
                ) : todays.length === 0 ? (
                  <DashboardColumnEmpty>Nessun appuntamento in agenda per oggi.</DashboardColumnEmpty>
                ) : (
                  <div className="space-y-3">
                    {todays.map((apt: AppointmentTable) => {
                      const { time, dateStr } = formatDateTime(apt.starts_at)
                      const { time: endTime } = formatDateTime(apt.ends_at)
                      return (
                        <div
                          key={apt.id}
                          className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] px-3 py-2.5 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex min-w-[110px] flex-col items-start">
                              <div className="text-text-secondary text-xs mb-0.5">{dateStr}</div>
                              <div className="font-mono text-[15px] font-bold text-blue-400 tabular-nums">
                                {time} - {endTime}
                              </div>
                            </div>

                            <div className="h-10 w-px bg-border/30" />

                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="relative inline-block shrink-0">
                                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-blue-500/60 via-purple-500/60 to-cyan-500/60 blur-[2px]" />
                                <div className="relative">
                                  <Avatar
                                    src={apt.athlete_avatar_url?.trim() || null}
                                    alt={apt.athlete_name || 'Atleta'}
                                    fallbackText={
                                      apt.athlete_name
                                        ?.split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .slice(0, 2) || '?'
                                    }
                                    size="md"
                                  />
                                </div>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-bold text-text-primary truncate">
                                  {apt.athlete_name || 'Atleta'}
                                </div>
                                <div className="text-xs text-text-secondary truncate">
                                  {getAppointmentType(apt)}
                                </div>
                              </div>
                            </div>

                            <span className="shrink-0 rounded-full bg-background-tertiary/50 border border-white/10 text-text-tertiary text-[11px] font-medium px-3 py-1">
                              {statusLabel(apt.status)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </DashboardColumnPanel>
            </div>
          </div>

          <Card variant="default" className="min-h-0">
            <CardContent className="p-4 min-h-0">
              <button
                type="button"
                onClick={() => router.push('/dashboard/appuntamenti')}
                className="w-full h-full min-h-[min(52vh,440px)] flex flex-col items-center justify-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                aria-label="Apri Appuntamenti"
              >
                <div className="rounded-full border border-white/10 bg-white/[0.04] p-6 text-text-tertiary">
                  <CalendarCheck className="h-14 w-14 text-primary" aria-hidden />
                </div>
                <div className="text-center">
                  <div className="text-base font-semibold text-text-primary">Appuntamenti</div>
                  <div className="text-sm text-text-secondary">Apri tutti gli appuntamenti</div>
                </div>
              </button>
            </CardContent>
          </Card>

          <Card variant="default" className="min-h-0">
            <CardContent className="p-4 min-h-0">
              <button
                type="button"
                onClick={() => router.push('/dashboard/calendario')}
                className="w-full h-full min-h-[min(52vh,440px)] flex flex-col items-center justify-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                aria-label="Apri Calendario"
              >
                <div className="rounded-full border border-white/10 bg-white/[0.04] p-6 text-text-tertiary">
                  <CalendarDays className="h-14 w-14 text-primary" aria-hidden />
                </div>
                <div className="text-center">
                  <div className="text-base font-semibold text-text-primary">Calendario</div>
                  <div className="text-sm text-text-secondary">Apri il calendario staff</div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        <Card variant="default">
          <CardContent className="p-4">
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <p className="text-sm font-medium text-text-primary">Atleti</p>
              <p className="text-xs text-text-tertiary">{atleti.length}</p>
            </div>

            {atletiSectionLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4 animate-pulse"
                  >
                    <div className="mx-auto h-16 w-16 rounded-full bg-white/[0.06]" />
                    <div className="mt-3 h-3 w-2/3 mx-auto rounded bg-white/[0.06]" />
                    <div className="mt-2 h-3 w-1/2 mx-auto rounded bg-white/[0.06]" />
                  </div>
                ))}
              </div>
            ) : atletiError ? (
              <p className="text-sm text-state-error">{atletiError}</p>
            ) : atleti.length === 0 ? (
              <p className="text-sm text-text-secondary">Nessun atleta trovato.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {atleti.map((a: Cliente) => {
                  const nome = a.nome ?? a.first_name ?? ''
                  const cognome = a.cognome ?? a.last_name ?? ''
                  const fallbackText =
                    `${nome} ${cognome}`.trim()
                      ? `${nome} ${cognome}`
                          .trim()
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                      : '?'
                  return (
                    <button
                      type="button"
                      key={a.id}
                      onClick={() => router.push(`/dashboard/prenotazioni/atleti/${a.id}`)}
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center hover:bg-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                      aria-label={`Apri atleta ${nome} ${cognome}`.trim() || 'Apri atleta'}
                    >
                      <div className="mx-auto w-fit">
                        <Avatar
                          src={a.avatar_url?.trim() || null}
                          alt={`${nome} ${cognome}`.trim() || 'Atleta'}
                          fallbackText={fallbackText}
                          size="md"
                        />
                      </div>
                      <div className="mt-3 text-sm font-semibold text-text-primary truncate">
                        {nome || '—'}
                      </div>
                      <div className="text-sm text-text-secondary truncate">{cognome || '—'}</div>
                    </button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StaffContentLayout>
  )
}

