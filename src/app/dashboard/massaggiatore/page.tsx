'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Hand,
  Users,
  MessageSquare,
  Calendar,
  CalendarCheck,
  BarChart2,
  CreditCard,
  ChevronDown,
  FileText,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:dashboard:massaggiatore:page')

type UpcomingAppointment = {
  id: string
  starts_at: string
  ends_at: string | null
  athlete_name: string
  type: string | null
}

type DashboardStats = {
  clientiSeguiti: number
  massaggiEseguiti: number
  massaggiTotali: number
  fattureEmesse: number
  appuntamentiSettimana: number
  lastUpdated: string | null
  prossimiAppuntamenti: UpcomingAppointment[]
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buongiorno'
  if (h < 18) return 'Buon pomeriggio'
  return 'Buonasera'
}

function isToday(iso: string): boolean {
  const d = new Date(iso)
  const today = new Date()
  return (
    d.getUTCFullYear() === today.getUTCFullYear() &&
    d.getUTCMonth() === today.getUTCMonth() &&
    d.getUTCDate() === today.getUTCDate()
  )
}

export default function MassaggiatorePage() {
  const { showLoader } = useStaffDashboardGuard('massaggiatore')
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [staffDisplayName, setStaffDisplayName] = useState<string | null>(null)
  const [data, setData] = useState<DashboardStats>({
    clientiSeguiti: 0,
    massaggiEseguiti: 0,
    massaggiTotali: 0,
    fattureEmesse: 0,
    appuntamentiSettimana: 0,
    lastUpdated: null,
    prossimiAppuntamenti: [],
  })

  useEffect(() => {
    setStaffDisplayName((user as { nome?: string | null })?.nome ?? null)
  }, [user])

  const loadData = useCallback(async () => {
    const profileId = user?.id ?? null
    if (!profileId) return
    setError(null)
    setLoading(true)
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
          .select('id, starts_at, ends_at, athlete_id, type')
          .eq('staff_id', profileId)
          .eq('type', 'massaggio')
          .gte('starts_at', nowIso)
          .is('cancelled_at', null)
          .order('starts_at', { ascending: true })
          .limit(10),
      ])

      const appointments = appointmentsRes.data ?? []
      const aptData = (aptDataRes.data ?? []) as Array<{
        id: string
        starts_at: string
        ends_at: string | null
        athlete_id: string | null
        type: string | null
      }>
      const athleteIds = [...new Set(aptData.map((a) => a.athlete_id).filter(Boolean))] as string[]
      const profilesMap = new Map<string, { nome: string | null; cognome: string | null }>()
      if (athleteIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nome, cognome')
          .in('id', athleteIds)
        ;(profiles ?? []).forEach(
          (p: { id: string; nome: string | null; cognome: string | null }) => {
            profilesMap.set(p.id, { nome: p.nome, cognome: p.cognome })
          },
        )
      }
      const prossimiAppuntamenti: UpcomingAppointment[] = aptData.map((apt) => {
        const p = apt.athlete_id != null ? profilesMap.get(apt.athlete_id) : undefined
        const name = p ? [p.nome, p.cognome].filter(Boolean).join(' ') || 'Cliente' : 'Cliente'
        return {
          id: apt.id,
          starts_at: apt.starts_at,
          ends_at: apt.ends_at,
          athlete_name: name,
          type: apt.type,
        }
      })

      setData({
        clientiSeguiti: clientiRes.count ?? 0,
        massaggiEseguiti: appointments.filter((a) => a.status === 'completato').length,
        massaggiTotali: appointments.length,
        fattureEmesse: paymentsRes.count ?? 0,
        appuntamentiSettimana: weekRes.count ?? 0,
        lastUpdated: new Date().toISOString(),
        prossimiAppuntamenti,
      })
    } catch (e) {
      logger.error('Errore caricamento dashboard massaggiatore', e)
      setError(e instanceof Error ? e.message : 'Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    void loadData()
  }, [loadData])

  if (showLoader) {
    return null
  }

  return (
    <StaffContentLayout
      title="Dashboard Massaggio"
      description="Clienti, appuntamenti e statistiche dalla tua area."
      icon={<Hand className="w-6 h-6" />}
      theme="amber"
    >
      {error && (
        <div className="rounded-xl border-2 border-red-500/40 bg-red-500/10 px-3 py-2.5 sm:px-4 sm:py-3 text-red-200 text-sm flex items-center justify-between flex-wrap gap-2">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] touch-manipulation"
            onClick={() => void loadData()}
          >
            Riprova
          </Button>
        </div>
      )}

      {/* Vista smartphone */}
      <div className="md:hidden flex flex-col gap-4 pb-4">
        {!loading && !error && (
          <>
            <div>
              <p className="text-amber-400 text-xs sm:text-sm font-medium">
                {getGreeting()}
                {staffDisplayName ? `, ${staffDisplayName}` : ''}!
              </p>
              <div className="flex items-center gap-2.5 mt-0.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                  <Hand className="w-4 h-4 text-amber-400" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-text-primary leading-tight">
                    I tuoi KPI Massaggio
                  </h2>
                  <p className="text-text-secondary text-xs sm:text-sm leading-snug">
                    Metriche chiave per i clienti collegati.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-text-primary mb-2">
                Azioni Rapide
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-500 min-h-[48px] touch-manipulation flex flex-col gap-0.5 text-xs"
                >
                  <Link
                    href="/dashboard/massaggiatore/calendario"
                    className="flex flex-col items-center justify-center gap-0.5 py-2.5"
                  >
                    <Calendar className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="font-medium">Calendario</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-amber-500/40 min-h-[48px] touch-manipulation flex flex-col gap-0.5 text-xs"
                >
                  <Link
                    href="/dashboard/massaggiatore/appuntamenti"
                    className="flex flex-col items-center justify-center gap-0.5 py-2.5"
                  >
                    <CalendarCheck className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="font-medium">Appuntamenti</span>
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-500/40 min-h-[48px] w-full touch-manipulation flex flex-col gap-0.5 text-xs"
                    >
                      <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="font-medium">Azioni</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[200px]">
                    <DropdownMenuItem
                      onClick={() => router.push('/dashboard/massaggiatore/chat')}
                      className="min-h-[44px] py-3 touch-manipulation text-sm"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" /> Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/dashboard/massaggiatore/statistiche')}
                      className="min-h-[44px] py-3 touch-manipulation text-sm"
                    >
                      <BarChart2 className="mr-2 h-4 w-4" /> Statistiche
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/dashboard/massaggiatore/abbonamenti')}
                      className="min-h-[44px] py-3 touch-manipulation text-sm"
                    >
                      <CreditCard className="mr-2 h-4 w-4" /> Abbonamenti
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {data.lastUpdated && (
              <p className="text-text-muted text-[11px] sm:text-xs">
                Aggiornato alle{' '}
                {new Date(data.lastUpdated).toLocaleTimeString('it-IT', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/dashboard/massaggiatore/appuntamenti"
                className="rounded-lg border border-amber-500/30 bg-background-secondary/80 p-3 block touch-manipulation"
              >
                <p className="text-[11px] sm:text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Clienti seguiti
                </p>
                <p className="text-xl sm:text-2xl font-bold text-text-primary tabular-nums mt-0.5">
                  {data.clientiSeguiti}
                </p>
              </Link>
              <div className="rounded-lg border border-amber-500/30 bg-background-secondary/80 p-3">
                <p className="text-[11px] sm:text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Massaggi eseguiti
                </p>
                <p className="text-xl sm:text-2xl font-bold text-text-primary tabular-nums mt-0.5">
                  {data.massaggiEseguiti}
                </p>
                <p className="text-[11px] sm:text-xs text-text-muted mt-0.5">
                  di {data.massaggiTotali} totali
                </p>
              </div>
              <Link
                href="/dashboard/massaggiatore/abbonamenti"
                className="rounded-lg border border-amber-500/30 bg-background-secondary/80 p-3 block touch-manipulation"
              >
                <p className="text-[11px] sm:text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Fatture emesse
                </p>
                <p className="text-xl sm:text-2xl font-bold text-text-primary tabular-nums mt-0.5">
                  {data.fattureEmesse}
                </p>
              </Link>
              <Link
                href="/dashboard/massaggiatore/calendario"
                className="rounded-lg border border-amber-500/30 bg-background-secondary/80 p-3 block touch-manipulation"
              >
                <p className="text-[11px] sm:text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Prossimi 7 giorni
                </p>
                <p className="text-xl sm:text-2xl font-bold text-text-primary tabular-nums mt-0.5">
                  {data.appuntamentiSettimana}
                </p>
                <p className="text-[11px] sm:text-xs text-amber-400 mt-0.5">appuntamenti</p>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Vista desktop */}
      <div className="hidden md:block">
        {!loading && !error && (
          <div className="flex flex-col gap-6">
            {/* Banner: appuntamenti oggi */}
            {data.prossimiAppuntamenti.some((a) => isToday(a.starts_at)) && (
              <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/10 px-5 py-4 flex flex-wrap items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" aria-hidden />
                <Link
                  href="/dashboard/massaggiatore/calendario"
                  className="text-amber-200 hover:text-amber-100 font-medium text-sm underline focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                >
                  Hai appuntamenti oggi
                </Link>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                href="/dashboard/massaggiatore/appuntamenti"
                className="relative overflow-hidden rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-amber-500/10 p-5 min-h-[7.5rem] flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/20 transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation"
              >
                <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                  <Users className="h-4 w-4 text-amber-400 shrink-0" aria-hidden />
                  Clienti seguiti
                </div>
                <p className="text-2xl font-bold text-amber-400 tabular-nums">
                  {data.clientiSeguiti}
                </p>
              </Link>
              <div className="relative overflow-hidden rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-amber-500/10 p-5 min-h-[7.5rem] flex flex-col justify-between">
                <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                  <Hand className="h-4 w-4 text-amber-400 shrink-0" aria-hidden />
                  Massaggi eseguiti
                </div>
                <p className="text-2xl font-bold text-text-primary tabular-nums">
                  {data.massaggiEseguiti}
                </p>
                <p className="text-xs text-text-muted mt-0.5">di {data.massaggiTotali} totali</p>
              </div>
              <Link
                href="/dashboard/massaggiatore/abbonamenti"
                className="relative overflow-hidden rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-amber-500/10 p-5 min-h-[7.5rem] flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/20 transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 touch-manipulation"
              >
                <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                  <FileText className="h-4 w-4 text-amber-400 shrink-0" aria-hidden />
                  Fatture emesse
                </div>
                <p className="text-2xl font-bold text-text-primary tabular-nums">
                  {data.fattureEmesse}
                </p>
              </Link>
              <Link
                href="/dashboard/massaggiatore/calendario"
                className="relative overflow-hidden rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-amber-500/10 p-5 min-h-[7.5rem] flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/20 transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 touch-manipulation"
              >
                <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                  <CalendarCheck className="h-4 w-4 text-amber-400 shrink-0" aria-hidden />
                  Prossimi 7 giorni
                </div>
                <p className="text-2xl font-bold text-text-primary tabular-nums">
                  {data.appuntamentiSettimana}
                </p>
              </Link>
            </div>

            {/* Prossimo appuntamento in evidenza */}
            {data.prossimiAppuntamenti.length > 0 && (
              <div className="rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-lg shadow-amber-500/10 p-5">
                <h2 className="text-sm font-semibold text-amber-400 mb-3">Prossimo appuntamento</h2>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-text-primary">
                      {data.prossimiAppuntamenti[0].athlete_name}
                    </p>
                    <p className="text-text-secondary text-sm">
                      Massaggio ·{' '}
                      {new Date(data.prossimiAppuntamenti[0].starts_at).toLocaleDateString(
                        'it-IT',
                        {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        },
                      )}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/massaggiatore/calendario"
                    className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium text-sm focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 rounded"
                  >
                    Apri calendario
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>
            )}

            {/* Prossimi appuntamenti */}
            <section className="rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-amber-500/10 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-amber-500/20">
                <h2 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Prossimi appuntamenti
                </h2>
                <Link
                  href="/dashboard/massaggiatore/calendario"
                  className="text-sm text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 min-h-[44px] touch-manipulation"
                >
                  Vedi calendario
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {data.prossimiAppuntamenti.length === 0 ? (
                <div className="px-5 py-10 text-center text-text-secondary text-sm flex flex-col items-center gap-4">
                  <Calendar className="h-10 w-10 text-amber-500/50 shrink-0" aria-hidden />
                  <p>Nessun appuntamento massaggio in programma.</p>
                  <Link
                    href="/dashboard/massaggiatore/calendario"
                    className="text-amber-400 hover:text-amber-300 font-medium focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded min-h-[44px] inline-flex items-center justify-center touch-manipulation"
                  >
                    Apri calendario
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-border/50">
                  {data.prossimiAppuntamenti.map((apt) => (
                    <li
                      key={apt.id}
                      className="flex items-center gap-3 px-5 py-4 min-h-[44px] hover:bg-background-tertiary/30 transition-colors touch-manipulation"
                    >
                      <Calendar className="h-5 w-5 text-amber-400 shrink-0" aria-hidden />
                      <div className="flex-1 min-w-0">
                        <span className="text-text-primary font-medium">{apt.athlete_name}</span>
                        <span className="text-text-secondary text-sm ml-2">Massaggio</span>
                      </div>
                      <span className="text-text-muted text-sm shrink-0">
                        {new Date(apt.starts_at).toLocaleDateString('it-IT', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/massaggiatore/calendario"
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border-2 border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 transition-colors touch-manipulation"
              >
                <Calendar className="h-4 w-4" /> Calendario
              </Link>
              <Link
                href="/dashboard/massaggiatore/appuntamenti"
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border-2 border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 transition-colors touch-manipulation"
              >
                <CalendarCheck className="h-4 w-4" /> Appuntamenti
              </Link>
              <Link
                href="/dashboard/massaggiatore/chat"
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border-2 border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 transition-colors touch-manipulation"
              >
                <MessageSquare className="h-4 w-4" /> Chat
              </Link>
              <Link
                href="/dashboard/massaggiatore/statistiche"
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border-2 border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 transition-colors touch-manipulation"
              >
                <BarChart2 className="h-4 w-4" /> Statistiche
              </Link>
              <Link
                href="/dashboard/massaggiatore/abbonamenti"
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border-2 border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 transition-colors touch-manipulation"
              >
                <CreditCard className="h-4 w-4" /> Abbonamenti
              </Link>
            </div>
          </div>
        )}
      </div>
    </StaffContentLayout>
  )
}
