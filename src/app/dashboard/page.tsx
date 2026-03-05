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

const logger = createLogger('DashboardPage')

type QuickActionLink = {
  href: string
  icon: LucideIcon
  label: string
  sublabel: string
  accentClass: string
}
type QuickActionAppointment = { href: null; accentClass: string; sublabel: string }
type QuickActionItem = QuickActionLink | QuickActionAppointment

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    href: '/dashboard/clienti?new=true',
    icon: UserPlus,
    label: 'Nuovo Cliente',
    sublabel: 'Aggiungi un atleta',
    accentClass: 'from-emerald-500/14 to-teal-500/6',
  },
  { href: null, accentClass: 'from-cyan-500/16 to-teal-500/6', sublabel: 'Pianifica una sessione' },
  {
    href: '/dashboard/schede/nuova',
    icon: FileText,
    label: 'Nuova Scheda',
    sublabel: 'Crea workout',
    accentClass: 'from-amber-500/14 to-orange-500/6',
  },
  {
    href: '/dashboard/chat',
    icon: MessageSquare,
    label: 'Messaggi',
    sublabel: 'Rispondi subito',
    accentClass: 'from-purple-500/14 to-fuchsia-500/6',
  },
  {
    href: '/dashboard/statistiche',
    icon: BarChart3,
    label: 'Statistiche',
    sublabel: 'KPI & trend',
    accentClass: 'from-blue-500/14 to-indigo-500/6',
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
): Promise<AgendaEvent[]> {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const todayLocalStr = `${y}-${m}-${d}`

  const queryStart = new Date(y, now.getMonth(), d ? Number(d) - 1 : 0)
  const queryEnd = new Date(y, now.getMonth(), Number(d) + 2)
  const todayStart = queryStart.toISOString()
  const todayEnd = queryEnd.toISOString()

  const { data: todayAppointments, error } = await supabaseClient
    .from('appointments')
    .select(
      `
      id,
      starts_at,
      ends_at,
      type,
      status,
      athlete_id,
      athlete:profiles!athlete_id(avatar, avatar_url, nome, cognome)
    `,
    )
    .gte('starts_at', todayStart)
    .lt('starts_at', todayEnd)
    .is('cancelled_at', null)
    .order('starts_at', { ascending: true })

  if (error) {
    logger.error('Agenda: errore query appuntamenti', error, { todayStart, todayEnd })
    throw error
  }

  if (!Array.isArray(todayAppointments)) return []

  const todayOnly = (todayAppointments as unknown as TodayAppointment[]).filter(
    (apt) =>
      apt.starts_at &&
      new Date(apt.starts_at).toLocaleDateString('sv-SE').slice(0, 10) === todayLocalStr,
  )

  if (todayAppointments.length > 0 && todayOnly.length === 0) {
    logger.warn('Agenda: query ha restituito appuntamenti ma nessuno con data oggi', {
      todayLocalStr,
      count: todayAppointments.length,
      firstStartsAt: (todayAppointments[0] as { starts_at?: string })?.starts_at,
    })
  }

  const currentTime = now.getTime()

  const agendaCandidates = todayOnly.reduce<AgendaEvent[]>((acc, apt) => {
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
    else if (
      typeValue === 'consulenza' ||
      typeValue === 'prima_visita' ||
      typeValue === 'riunione'
    )
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
    const athleteName =
      athleteProfile && athleteProfile.nome && athleteProfile.cognome
        ? `${athleteProfile.nome} ${athleteProfile.cognome}`.trim()
        : athleteProfile?.nome || athleteProfile?.cognome || 'Atleta'

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
      const data = await fetchTodayAgenda(supabase)
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
        const computed =
          stats != null ? stats.acquired - stats.used : undefined
        return {
          ...e,
          lessons_remaining: fromCounter !== undefined ? fromCounter : computed,
        }
      }),
    [agendaData, rimastiMap, lessonStatsMap],
  )

  return (
    <div
      className="relative flex flex-col h-full space-y-10 px-6 py-6 overflow-y-auto"
      aria-busy={loading}
    >
      {/* Ambient sportivo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/25" />
      </div>

      <section className="shrink-0" aria-label="Azioni rapide">
        <div className="grid gap-3 md:grid-cols-5">
          {QUICK_ACTIONS.map((item) =>
            item.href ? (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                aria-label={`${item.label}, ${item.sublabel}`}
                className="group relative flex min-h-[90px] flex-col items-center justify-center overflow-hidden rounded-xl bg-background-secondary/42 backdrop-blur-2xl ring-1 ring-white/8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glow active:scale-[0.98] p-3 text-center"
              >
                <div className="pointer-events-none absolute inset-0">
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-80',
                      item.accentClass,
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/5" />
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-primary/60 via-primary/40 to-transparent opacity-70" />
                </div>
                <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/6 ring-1 ring-white/12 shadow-inner transition-all duration-300 group-hover:scale-105 group-hover:ring-primary/25 text-text-primary/90 group-hover:text-primary">
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                <span className="relative z-10 mt-1.5 block text-xs font-semibold text-text-primary">
                  {item.label}
                </span>
                <span className="relative z-10 mt-0.5 block text-[10px] text-text-secondary/90">
                  {item.sublabel}
                </span>
              </Link>
            ) : (
              <NewAppointmentButton
                key="appointment"
                accentClass={item.accentClass}
                sublabel={item.sublabel}
              />
            ),
          )}
        </div>
      </section>

      {/* Agenda Timeline Section */}
      <section className="flex-1 min-h-0" aria-label="Agenda di oggi">
        {loading ? (
          <SkeletonAgendaTimeline rows={4} />
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-surface-200/60 p-8 text-center">
            <p className="text-sm text-text-secondary">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadAgenda()}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              Riprova
            </button>
          </div>
        ) : agendaData.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-surface-200/40 p-8 text-center">
            <p className="text-sm text-text-secondary">Nessun appuntamento oggi</p>
            <Link
              href="/dashboard/calendario"
              prefetch
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              Vai al calendario
            </Link>
          </div>
        ) : (
          <AgendaClient initialEvents={initialEvents} />
        )}
      </section>
    </div>
  )
}
