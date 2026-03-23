'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SkeletonAgendaTimeline } from '@/components/shared/ui/skeleton'
import type { LucideIcon } from 'lucide-react'
import { UserPlus, FileText, MessageSquare, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AgendaClient } from './_components/agenda-client'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { NewAppointmentButton } from './_components/new-appointment-button'
import { createLogger } from '@/lib/logger'
import { useAuth } from '@/providers/auth-provider'
import { useLessonCounters } from '@/hooks/use-lesson-counters'
import { useLessonStatsBulk } from '@/hooks/use-lesson-stats-bulk'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { Button } from '@/components/ui'
import {
  formatStaffDayAthleteDisplayName,
  getStaffLocalDayBoundsISO,
  STAFF_TODAY_APPOINTMENTS_SELECT,
} from '@/lib/appointments/staff-today-appointments-query'

const logger = createLogger('DashboardPage')

const QUICK_ACTION_CARD_CLASS =
  'flex min-h-[70px] flex-col items-center justify-center rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-3 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/20'

type QuickActionLink = {
  href: string
  icon: LucideIcon
  label: string
  sublabel: string
  iconBoxClass: string
}
type QuickActionAppointment = { href: null; sublabel: string; iconBoxClass: string }
type QuickActionItem = QuickActionLink | QuickActionAppointment

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    href: '/dashboard/invita-atleta?new=true',
    icon: UserPlus,
    label: 'Invita Cliente',
    sublabel: 'Invita un atleta',
    iconBoxClass: 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400',
  },
  {
    href: null,
    sublabel: 'Pianifica una sessione',
    iconBoxClass: 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400',
  },
  {
    href: '/dashboard/schede/nuova',
    icon: FileText,
    label: 'Nuova Scheda',
    sublabel: 'Crea workout',
    iconBoxClass: 'border-amber-500/30 bg-amber-500/20 text-amber-400',
  },
  {
    href: '/dashboard/chat',
    icon: MessageSquare,
    label: 'Messaggi',
    sublabel: 'Rispondi subito',
    iconBoxClass: 'border-purple-500/30 bg-purple-500/20 text-purple-400',
  },
  {
    href: '/dashboard/statistiche',
    icon: BarChart3,
    label: 'Statistiche',
    sublabel: 'KPI & trend',
    iconBoxClass: 'border-blue-500/30 bg-blue-500/20 text-blue-400',
  },
]

interface AgendaEvent {
  id: string
  time: string
  athlete: string
  athlete_id?: string
  athlete_avatar?: string | null
  type: 'allenamento' | 'appuntamento' | 'consulenza'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'annullato'
  description?: string
  starts_at?: string
  ends_at?: string
  /** Lezioni rimanenti atleta (per visualizzazione in agenda) */
  lessons_remaining?: number
}

type TodayAppointment = {
  id: string
  starts_at: string
  ends_at: string | null
  type: string | null
  status: string | null
  athlete_id: string | null
  athlete_name: string | null
  trainer_id: string | null
  trainer_name: string | null
  athlete:
    | {
        avatar: string | null
        avatar_url: string | null
        nome?: string | null
        cognome?: string | null
      }
    | SupabaseRelationError
    | null
}

type SupabaseRelationError = {
  message: string
  details?: string | null
  hint?: string | null
  code?: string | null
}

const isSupabaseRelationError = (value: unknown): value is SupabaseRelationError =>
  typeof value === 'object' && value !== null && 'message' in value

type AthleteProfile = {
  avatar?: string | null
  avatar_url?: string | null
  nome?: string | null
  cognome?: string | null
}

async function fetchTodayAgenda(
  supabaseClient: ReturnType<typeof createClient>,
  staffProfileId: string,
): Promise<AgendaEvent[]> {
  const now = new Date()
  const { dayStart: todayStart, dayEnd: todayEnd } = getStaffLocalDayBoundsISO(now)

  const { data: todayAppointments, error } = await supabaseClient
    .from('appointments')
    .select(STAFF_TODAY_APPOINTMENTS_SELECT)
    .eq('staff_id', staffProfileId)
    .gte('starts_at', todayStart)
    .lt('starts_at', todayEnd)
    .is('cancelled_at', null)
    .order('starts_at', { ascending: true })

  if (error) {
    logger.error('Agenda: errore query appuntamenti', error, { todayStart, todayEnd })
    throw error
  }

  if (!Array.isArray(todayAppointments)) return []

  const rows = todayAppointments as unknown as TodayAppointment[]
  const currentTime = now.getTime()

  const agendaCandidates = rows.reduce<AgendaEvent[]>((acc, apt) => {
    const startTime = new Date(apt.starts_at)
    const endTime = apt.ends_at ? new Date(apt.ends_at) : null
    const startTimeMs = startTime.getTime()
    const statusValue = apt.status ?? ''

    if (statusValue === 'completato' || statusValue === 'completed') return acc
    if (statusValue === 'cancelled' || statusValue === 'annullato') return acc

    if (startTimeMs < currentTime) {
      if (!(endTime && endTime.getTime() > currentTime)) {
        const hoursDiff = (currentTime - startTimeMs) / (1000 * 60 * 60)
        if (hoursDiff > 1) return acc
      }
    }

    let status: AgendaEvent['status'] = 'scheduled'
    if (statusValue === 'in_corso' || statusValue === 'in-progress') {
      status = 'in-progress'
    } else if (statusValue === 'cancelled' || statusValue === 'annullato') {
      status = statusValue === 'annullato' ? 'annullato' : 'cancelled'
    } else {
      if (endTime && startTimeMs < currentTime && endTime.getTime() > currentTime) {
        status = 'in-progress'
      } else if (startTimeMs < currentTime) {
        const hoursDiff = (currentTime - startTimeMs) / (1000 * 60 * 60)
        if (hoursDiff <= 1) status = 'in-progress'
      }
    }

    const hours = String(startTime.getHours()).padStart(2, '0')
    const minutes = String(startTime.getMinutes()).padStart(2, '0')
    const time = `${hours}:${minutes}`

    let type: AgendaEvent['type'] = 'appuntamento'
    const typeValue = apt.type ?? ''
    if (typeValue === 'allenamento') type = 'allenamento'
    else if (typeValue === 'consulenza' || typeValue === 'prima_visita' || typeValue === 'riunione')
      type = 'consulenza'

    const description =
      typeValue === 'allenamento'
        ? 'Allenamento'
        : typeValue === 'consulenza'
          ? 'Consulenza'
          : typeValue || 'Appuntamento'

    const athleteRecord = isSupabaseRelationError(apt.athlete) ? null : apt.athlete
    const athleteProfile = athleteRecord as AthleteProfile | null
    const athleteAvatar = athleteProfile?.avatar_url ?? athleteProfile?.avatar ?? null
    const athleteName = formatStaffDayAthleteDisplayName(apt.athlete)

    const startsAtStr =
      apt.starts_at && typeof apt.starts_at === 'object' && 'getTime' in apt.starts_at
        ? (apt.starts_at as Date).toISOString()
        : typeof apt.starts_at === 'string'
          ? apt.starts_at
          : undefined
    const endsAtStr =
      apt.ends_at && typeof apt.ends_at === 'object' && 'getTime' in apt.ends_at
        ? (apt.ends_at as Date).toISOString()
        : typeof apt.ends_at === 'string'
          ? apt.ends_at
          : undefined

    acc.push({
      id: apt.id,
      time,
      athlete: athleteName,
      athlete_id: apt.athlete_id || undefined,
      athlete_avatar: athleteAvatar,
      type,
      status,
      description,
      starts_at: startsAtStr,
      ends_at: endsAtStr,
    })
    return acc
  }, [])

  return agendaCandidates.sort((a, b) => {
    const [hoursA, minutesA] = a.time.split(':').map(Number)
    const [hoursB, minutesB] = b.time.split(':').map(Number)
    return hoursA * 60 + minutesA - (hoursB * 60 + minutesB)
  })
}

export default function DashboardPage() {
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [agendaData, setAgendaData] = useState<AgendaEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const loadAgenda = useCallback(async () => {
    if (!user) return
    setLoadError(null)
    setLoading(true)
    try {
      const data = await fetchTodayAgenda(supabase, user.id)
      if (mountedRef.current) setAgendaData(data)
    } catch (error) {
      logger.error('Error loading today appointments', error)
      if (mountedRef.current) {
        setAgendaData([])
        setLoadError('Impossibile caricare gli appuntamenti.')
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    void loadAgenda()
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && user) void loadAgenda()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [user, loadAgenda])

  const athleteIds = useMemo(
    () => agendaData.map((e) => e.athlete_id).filter(Boolean) as string[],
    [agendaData],
  )
  const rimastiMap = useLessonCounters(athleteIds)
  const lessonStatsMap = useLessonStatsBulk(athleteIds)
  const initialEvents = useMemo(
    () =>
      agendaData.map((e) => {
        if (!e.athlete_id) return { ...e, lessons_remaining: undefined }
        const fromCounter = rimastiMap.get(e.athlete_id)
        const stats = lessonStatsMap.get(e.athlete_id)
        const computed = stats != null ? stats.acquired - stats.used : undefined
        return {
          ...e,
          lessons_remaining: fromCounter !== undefined ? fromCounter : computed,
        }
      }),
    [agendaData, rimastiMap, lessonStatsMap],
  )

  return (
    <StaffContentLayout
      title="Dashboard"
      description="Panoramica e agenda di oggi"
      theme="teal"
      className="overflow-y-auto min-h-0"
    >
      <section className="shrink-0" aria-label="Azioni rapide" aria-busy={loading}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-5 md:gap-2">
          {QUICK_ACTIONS.map((item) => {
            if (item.href) {
              const linkItem = item as QuickActionLink
              const Icon = linkItem.icon
              return (
                <Link
                  key={linkItem.href}
                  href={linkItem.href}
                  prefetch
                  aria-label={`${linkItem.label}, ${linkItem.sublabel}`}
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
                  <span className="mt-2 block text-[10px] font-semibold text-text-primary">
                    {linkItem.label}
                  </span>
                  <span className="text-[9px] text-text-secondary">{linkItem.sublabel}</span>
                </Link>
              )
            }
            return (
              <NewAppointmentButton
                key="appointment"
                sublabel={item.sublabel}
                iconBoxClass={item.iconBoxClass}
              />
            )
          })}
        </div>
      </section>

      <section className="flex-1 min-h-0" aria-label="Agenda di oggi">
        {loading ? (
          <SkeletonAgendaTimeline rows={4} />
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-black/20 p-6 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <p className="text-sm text-text-secondary">{loadError}</p>
            <Button variant="primary" size="sm" onClick={() => void loadAgenda()}>
              Riprova
            </Button>
          </div>
        ) : agendaData.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-black/20 p-6 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <p className="text-sm text-text-secondary">Nessun appuntamento oggi</p>
            <Button variant="primary" size="sm" asChild>
              <Link href="/dashboard/calendario" prefetch>
                Vai al calendario
              </Link>
            </Button>
          </div>
        ) : (
          <AgendaClient initialEvents={initialEvents} />
        )}
      </section>
    </StaffContentLayout>
  )
}
